// Mock quiz: timed, mixed from bank + generators, balanced across L7–L10, no feedback until submit.
import { useState } from 'react'
import { LECTURES, type LectureId, type Question } from '../types'
import { WIDGET } from '../registry'
import { GENERATORS } from './generators'
import { POOL_Q, shuffled } from './pool'
import Session from './Session'
import { go } from './ui'

const SLIDES: Record<LectureId, number> = { L7: 43, L8: 42, L9: 72, L10: 142 }

/** Allocate `n` questions across lectures (even, or proportional to slide counts), largest-remainder rounding. */
function allocate(n: number, byLecture: 'even' | 'slides'): Record<LectureId, number> {
  const w = LECTURES.map((l) => (byLecture === 'even' ? 1 : SLIDES[l.id]))
  const sum = w.reduce((a, b) => a + b, 0)
  const raw = w.map((x) => (x / sum) * n)
  const base = raw.map(Math.floor)
  let rest = n - base.reduce((a, b) => a + b, 0)
  raw.map((r, i) => ({ i, f: r - base[i] })).sort((a, b) => b.f - a.f).forEach(({ i }) => { if (rest-- > 0) base[i]++ })
  return Object.fromEntries(LECTURES.map((l, i) => [l.id, base[i]])) as Record<LectureId, number>
}

export function buildMock(n: number, byLecture: 'even' | 'slides', bankShare = 0.6): Question[] {
  const alloc = allocate(n, byLecture)
  const out: Question[] = []
  for (const l of LECTURES) {
    const want = alloc[l.id]
    const bank = shuffled(POOL_Q.filter((q) => q.lecture === l.id && (q.kind !== 'widget' || WIDGET.has(q.widget))))
    const widgets = bank.filter((q) => q.kind === 'widget')
    const nonW = bank.filter((q) => q.kind !== 'widget')
    const fromBank = [...nonW.slice(0, Math.round(want * bankShare)), ...widgets.slice(0, want >= 5 ? 1 : 0)].slice(0, want)
    const gens = GENERATORS.filter((g) => g.lecture === l.id)
    const picked = [...fromBank]
    let guard = 0
    // fill with generators (balanced by cycling through shuffled generator list); if no generators for the lecture use leftover bank questions
    const gq = shuffled(gens)
    while (picked.length < want && gens.length && guard++ < 200) picked.push(gq[picked.length % gq.length].make())
    for (const q of nonW) { if (picked.length >= want) break; if (!picked.includes(q)) picked.push(q) }
    out.push(...picked)
  }
  return shuffled(out)
}

export default function Mock() {
  const [cfg, setCfg] = useState({ n: 20, minutes: 30, by: 'even' as 'even' | 'slides' })
  const [run, setRun] = useState<{ key: number; qs: Question[]; minutes: number; mode: 'learn' | 'test' } | null>(null)
  if (run) return <Session key={run.key} title="Mock quiz" questions={run.qs} mode={run.mode} src="mock" timeLimit={run.minutes ? run.minutes * 60 : undefined} onExit={() => setRun(null)}
    onRetry={(qs, mode) => setRun({ key: Date.now(), qs, minutes: 0, mode })} />
  const alloc = allocate(cfg.n, cfg.by)
  return (
    <div className="pr-page">
      <button className="btn ghost sm" onClick={() => go()}>← Practice</button>
      <h2>Mock quiz</h2>
      <p className="muted">A timed exam-style set mixing the question bank with freshly generated problems. No feedback until you submit, then a full review.</p>
      <div className="pr-form">
        <section className="pr-card">
          <h3>Exam settings</h3>
          <div className="pr-field"><label>Questions</label><div className="seg">{[10, 15, 20, 30].map((n) => <button key={n} className={cfg.n === n ? 'on' : ''} onClick={() => setCfg({ ...cfg, n })}>{n}</button>)}</div></div>
          <div className="pr-field"><label>Time limit</label><div className="seg">{[15, 30, 45, 60].map((m) => <button key={m} className={cfg.minutes === m ? 'on' : ''} onClick={() => setCfg({ ...cfg, minutes: m })}>{m} min</button>)}</div></div>
          <div className="pr-field"><label>Lecture balance</label><div className="seg"><button className={cfg.by === 'even' ? 'on' : ''} onClick={() => setCfg({ ...cfg, by: 'even' })}>Even</button><button className={cfg.by === 'slides' ? 'on' : ''} onClick={() => setCfg({ ...cfg, by: 'slides' })}>By lecture size</button></div></div>
          <button className="btn primary pr-big" onClick={() => setRun({ key: Date.now(), qs: buildMock(cfg.n, cfg.by), minutes: cfg.minutes, mode: 'test' })}>Start mock →</button>
        </section>
        <section className="pr-card">
          <h3>Composition</h3>
          {LECTURES.map((l) => <div key={l.id} className="pr-comp"><span className="pr-lec" style={{ background: l.color }}>{l.id}</span><span>{l.short}</span><b>{alloc[l.id]}</b></div>)}
          <p className="muted pr-small">About 60% of each lecture's share comes from the bank (when it has enough), the rest from generators.</p>
        </section>
      </div>
    </div>
  )
}
