// Progress: per-lecture/topic proficiency, attempts over time, weakest topics, flashcard boxes, export/import/reset.
import { useMemo, useRef, useState } from 'react'
import { LECTURES, type LectureId } from '../types'
import { GENERATORS } from './generators'
import { POOL_C, POOL_Q } from './pool'
import { BOX_DAYS, exportAll, groupBy, importAll, isDue, proficiency, resetAll, topicStats, usePStore, weakest, type Attempt } from './store'
import { Bar, accColor, go, lecColor, pct, setPreset } from './ui'

/** Attempts from this module plus widget attempts logged elsewhere via recordAttempt (deduplicated). */
export function useAllAttempts(): Attempt[] {
  const s = usePStore()
  return useMemo(() => {
    const mine = s.attempts
    const seen = new Map<string, number[]>()
    mine.forEach((a) => { const l = seen.get(a.id) ?? []; l.push(a.t); seen.set(a.id, l) })
    let extra: Attempt[] = []
    try {
      const raw = JSON.parse(localStorage.getItem('chem.attempts') || '[]') as { id: string; lecture: LectureId; topic: string; correct: boolean; score?: number; t: number }[]
      extra = raw.filter((r) => !(seen.get(r.id) ?? []).some((t) => Math.abs(t - r.t) < 3000))
        .map((r) => ({ id: r.id, lecture: r.lecture, topic: r.topic, correct: r.correct, score: r.score ?? (r.correct ? 1 : 0), t: r.t, src: 'quiz' as const, kind: 'widget' }))
    } catch { /* ignore */ }
    return [...mine, ...extra]
  }, [s.attempts])
}

export function practiceTopic(lecture: LectureId, topic: string) {
  if (POOL_Q.some((q) => q.topic === topic && q.lecture === lecture)) { setPreset({ lecture, topic }); go('quiz'); return }
  const gens = GENERATORS.filter((g) => g.topic === topic).map((g) => g.id)
  if (gens.length) { setPreset({ gens }); go('drill'); return }
  setPreset({ lecture }); go('quiz')
}

function dayKey(t: number) { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` }

export default function Progress() {
  const store = usePStore()
  const atts = useAllAttempts()
  const [msg, setMsg] = useState('')
  const file = useRef<HTMLInputElement>(null)
  const byLec = LECTURES.map((l) => ({ l, p: proficiency(atts.filter((a) => a.lecture === l.id)) }))
  const topics = topicStats(atts).sort((a, b) => a.lecture.localeCompare(b.lecture, undefined, { numeric: true }) || a.acc - b.acc)
  const weak = weakest(atts, 5)
  const overall = proficiency(atts)

  const days = useMemo(() => {
    const out: { k: string; label: string; ok: number; bad: number }[] = []
    const byDay = groupBy(atts, (a) => dayKey(a.t))
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const xs = byDay.get(dayKey(d.getTime())) ?? []
      out.push({ k: dayKey(d.getTime()), label: `${d.getDate()}/${d.getMonth() + 1}`, ok: xs.filter((a) => a.correct).length, bad: xs.filter((a) => !a.correct).length })
    }
    return out
  }, [atts])
  const maxDay = Math.max(1, ...days.map((d) => d.ok + d.bad))

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportAll()], { type: 'application/json' }))
    const a = document.createElement('a'); a.href = url; a.download = `ki1101-progress-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    URL.revokeObjectURL(url)
  }
  const onFile = async (f?: File) => {
    if (!f) return
    try { const n = importAll(await f.text()); setMsg(`Imported ${n} data sets. Reload other tabs to see them.`) } catch (e) { setMsg('Import failed: ' + (e as Error).message) }
  }

  const cardCounts = [1, 2, 3, 4].map((b) => POOL_C.filter((c) => store.cards[c.id]?.box === b).length)
  const newCards = POOL_C.filter((c) => !store.cards[c.id]).length
  const due = POOL_C.filter((c) => isDue(store.cards[c.id])).length

  return (
    <div className="pr-page">
      <div className="row"><button className="btn ghost sm" onClick={() => go()}>← Practice</button><h2>Progress</h2></div>
      {!atts.length && <div className="pr-banner">No attempts yet. Do a quiz or a drill and your proficiency will appear here.</div>}
      <div className="pr-cols">
        <section className="pr-card">
          <h3>By lecture <small className="muted">recent-weighted accuracy</small></h3>
          {byLec.map(({ l, p }) => <Bar key={l.id} value={p?.acc ?? 0} color={p ? lecColor(l.id) : '#e2e6ed'} label={<><b>{l.id}</b> {l.short}</>} right={p ? `${pct(p.acc)} · ${p.n}` : '–'} />)}
          {overall && <p className="muted pr-small">Overall {pct(overall.acc)} over {overall.n} attempts. Newer attempts count more (weight 0.88 per step back).</p>}
        </section>
        <section className="pr-card">
          <h3>Attempts, last 14 days</h3>
          <svg viewBox="0 0 420 150" className="pr-chart" role="img" aria-label="Attempts per day">
            {days.map((d, i) => {
              const h = (d.ok / maxDay) * 100, h2 = (d.bad / maxDay) * 100, x = 8 + i * 29.5
              return (
                <g key={d.k}>
                  <rect x={x} y={115 - h - h2} width={22} height={h2} rx={3} fill="var(--err)" opacity={0.75} />
                  <rect x={x} y={115 - h} width={22} height={h} rx={3} fill="var(--ok)" opacity={0.8} />
                  <text x={x + 11} y={132} textAnchor="middle" fontSize="8.5" fill="var(--muted)">{i % 2 === 0 ? d.label : ''}</text>
                  {d.ok + d.bad > 0 && <text x={x + 11} y={110 - h - h2} textAnchor="middle" fontSize="9" fill="var(--muted)">{d.ok + d.bad}</text>}
                </g>
              )
            })}
            <line x1="4" x2="416" y1="115" y2="115" stroke="var(--line)" />
          </svg>
          <div className="pr-legend"><span><i style={{ background: 'var(--ok)' }} /> correct</span><span><i style={{ background: 'var(--err)' }} /> wrong</span></div>
        </section>
      </div>
      <div className="pr-cols">
        <section className="pr-card">
          <h3>Weakest topics</h3>
          {weak.length ? weak.map((w) => (
            <div key={w.lecture + w.topic} className="pr-weak">
              <div><span className="pr-lec" style={{ background: lecColor(w.lecture) }}>{w.lecture}</span> <b>{w.topic}</b><div className="muted pr-small">{pct(w.acc)} over {w.n} attempts</div></div>
              <button className="btn primary sm" onClick={() => practiceTopic(w.lecture, w.topic)}>Practice these</button>
            </div>
          )) : <p className="muted">Needs at least two attempts in a topic.</p>}
        </section>
        <section className="pr-card">
          <h3>Flashcards <small className="muted">{due} due</small></h3>
          <Bar value={newCards / Math.max(1, POOL_C.length)} color="#94a3b8" label="New" right={newCards} />
          {cardCounts.map((n, i) => <Bar key={i} value={n / Math.max(1, POOL_C.length)} color="var(--accent)" label={`Box ${i + 1} · every ${BOX_DAYS[i]}d`} right={n} />)}
          <button className="btn sm" onClick={() => go('cards')}>Review cards →</button>
        </section>
      </div>
      <section className="pr-card">
        <h3>All topics</h3>
        <div className="pr-topics">
          {topics.map((t) => (
            <div key={t.lecture + t.topic} className="pr-topic-row">
              <Bar value={t.acc} label={<><span className="pr-lec" style={{ background: lecColor(t.lecture) }}>{t.lecture}</span> {t.topic}</>} right={`${pct(t.acc)} · ${t.n}`} />
              <button className="btn sm ghost" onClick={() => practiceTopic(t.lecture, t.topic)}>Practice</button>
            </div>
          ))}
          {!topics.length && <p className="muted">Nothing yet.</p>}
        </div>
      </section>
      <section className="pr-card">
        <h3>Your data</h3>
        <p className="muted pr-small">Everything is stored in this browser (<code>chem.*</code> keys). Export it to back up or move to another device.</p>
        <div className="row">
          <button className="btn" onClick={download}>⬇ Export JSON</button>
          <button className="btn" onClick={() => file.current?.click()}>⬆ Import JSON</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = '' }} />
          <button className="btn ghost" style={{ color: 'var(--err)' }} onClick={() => { if (confirm('Delete all practice progress, flashcard boxes and flags? This cannot be undone.')) { resetAll(); setMsg('Progress reset.') } }}>Reset all progress</button>
        </div>
        {msg && <p className="pr-small" style={{ color: accColor(0.7) }}>{msg}</p>}
      </section>
    </div>
  )
}
