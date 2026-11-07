// Quiz/Mock runner: numbered strip, ←/→ navigation, learn or test feedback, results with per-topic score and retry-wrong.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Question } from '../types'
import QuestionView, { type Outcome } from './QuestionView'
import { groupBy, logAttempt, type Source } from './store'
import { genOf } from './generators'
import { Bar, accColor, lecColor, pct } from './ui'
import { IconChevronLeft, IconChevronRight, IconTimer } from '../lib/icons'

export interface SessionProps {
  title: string
  questions: Question[]
  mode: 'learn' | 'test'
  src: Source
  /** seconds; when set a countdown runs and the session auto-submits at 0 */
  timeLimit?: number
  onExit: () => void
  onRetry?: (qs: Question[], mode: 'learn' | 'test') => void
}

const fmtT = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`

export default function Session(p: SessionProps) {
  const { questions: qs, mode, src } = p
  const [idx, setIdx] = useState(0)
  const [out, setOut] = useState<Record<string, Outcome>>({})
  const [finished, setFinished] = useState(false)
  const logged = useRef(new Set<string>())
  const endAt = useMemo(() => (p.timeLimit ? Date.now() + p.timeLimit * 1000 : 0), [p.timeLimit])
  const [left, setLeft] = useState(p.timeLimit ?? 0)

  const record = (q: Question, o: Outcome) => {
    if (o.skipped || logged.current.has(q.id)) return
    logged.current.add(q.id)
    logAttempt({ id: q.id, lecture: q.lecture, topic: q.topic, correct: o.correct, score: o.score, src, kind: q.kind, gen: genOf(q.id) })
  }
  const finish = () => {
    if (mode === 'test') qs.forEach((q) => { const o = out[q.id]; if (o) record(q, o) })
    setFinished(true)
  }
  const finishRef = useRef(finish); finishRef.current = finish
  useEffect(() => {
    if (!endAt || finished) return
    const t = setInterval(() => {
      const l = Math.round((endAt - Date.now()) / 1000)
      setLeft(l)
      if (l <= 0) { clearInterval(t); finishRef.current() }
    }, 500)
    return () => clearInterval(t)
  }, [endAt, finished])

  const submit = (q: Question) => (o: Outcome) => {
    setOut((m) => ({ ...m, [q.id]: o }))
    if (mode === 'learn') record(q, o)
  }
  const go = (i: number) => setIdx(Math.max(0, Math.min(qs.length - 1, i)))
  const next = () => { if (idx < qs.length - 1) go(idx + 1); else if (mode === 'learn') finish() }
  const live = useRef({ locked: false, next })
  useEffect(() => {
    if (finished) return
    const f = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return
      if (e.key === 'Enter' && live.current.locked && t?.tagName !== 'BUTTON') { e.preventDefault(); live.current.next() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)) }
      if (e.key === 'ArrowRight') { e.preventDefault(); setIdx((i) => Math.min(qs.length - 1, i + 1)) }
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [finished, qs.length])

  if (finished) return <Results {...p} out={out} />

  const q = qs[idx]
  const o = out[q.id]
  const answered = qs.filter((x) => out[x.id]).length
  const learnLocked = mode === 'learn' && !!o
  const isLast = idx === qs.length - 1
  live.current = { locked: learnLocked, next }
  return (
    <div className="pr-session">
      <div className="pr-sess-head">
        <div><b>{p.title}</b> <span className="muted">· {mode === 'learn' ? 'Learn mode' : 'Test mode'} · {answered}/{qs.length} answered</span></div>
        <div className="row">
          {p.timeLimit ? <span className={'pr-timer' + (left < 120 ? ' low' : '')}><IconTimer size={14} /> {fmtT(left)}</span> : null}
          <button className="btn" onClick={() => { if (mode === 'learn' || answered === qs.length || confirm(`${qs.length - answered} question(s) unanswered. Submit anyway?`)) finish() }}>{mode === 'test' ? 'Submit' : 'Finish'}</button>
          <button className="btn ghost" onClick={() => { if (confirm('Leave this session? Progress in it is kept only for answered questions.')) p.onExit() }}>Quit</button>
        </div>
      </div>
      <div className="pr-strip" role="tablist">
        {qs.map((x, i) => {
          const a = out[x.id]
          const cls = 'pr-dot' + (i === idx ? ' cur' : '') + (a ? (mode === 'learn' ? (a.skipped ? ' skip' : a.correct ? ' ok' : ' bad') : ' ans') : '')
          return <button key={x.id} className={cls} onClick={() => go(i)} title={`Question ${i + 1}`}>{i + 1}</button>
        })}
      </div>
      <div className="pr-sess-body">
        <QuestionView key={q.id + (learnLocked ? ':r' : '')} q={q} mode={learnLocked ? 'review' : mode} initial={o} onSubmit={submit(q)}
          onNext={next} nextLabel={isLast ? (mode === 'learn' ? 'Finish' : 'Review') : 'Next'} />
        {learnLocked && (
          <div className="pq-foot pq-nav">
            <span className="grow" />
            <button className="btn primary" onClick={next}>{isLast ? 'See results' : 'Next'} <kbd>↵</kbd></button>
          </div>
        )}
      </div>
      <div className="pr-sess-nav">
        <button className="btn" disabled={idx === 0} onClick={() => go(idx - 1)}><IconChevronLeft size={14} />Previous</button>
        <span className="muted">Question {idx + 1} of {qs.length}</span>
        <button className="btn" disabled={isLast} onClick={() => go(idx + 1)}>Next<IconChevronRight size={14} /></button>
      </div>
    </div>
  )
}

/* ---------- results ---------- */
export function Results(p: SessionProps & { out: Record<string, Outcome> }) {
  const { questions: qs, out } = p
  const graded = qs.filter((q) => !out[q.id]?.skipped)
  const score = graded.reduce((s, q) => s + (out[q.id]?.score ?? 0), 0)
  const total = graded.length
  const wrong = qs.filter((q) => !out[q.id]?.skipped && !out[q.id]?.correct)
  const [show, setShow] = useState<'none' | 'wrong' | 'all'>(p.timeLimit ? 'all' : 'none')
  const byTopic = [...groupBy(graded, (q) => q.lecture + '|' + q.topic)].map(([k, xs]) => ({ k, lecture: xs[0].lecture, topic: xs[0].topic, n: xs.length, s: xs.reduce((a, q) => a + (out[q.id]?.score ?? 0), 0) }))
    .sort((a, b) => a.s / a.n - b.s / b.n)
  const byLec = [...groupBy(graded, (q) => q.lecture)].map(([l, xs]) => ({ l: l as Question['lecture'], n: xs.length, s: xs.reduce((a, q) => a + (out[q.id]?.score ?? 0), 0) }))
  const ratio = total ? score / total : 0
  const list = show === 'all' ? qs : show === 'wrong' ? wrong.concat(qs.filter((q) => !out[q.id] && !wrong.includes(q))) : []
  return (
    <div className="pr-results">
      <div className="pr-score" style={{ ['--c' as string]: accColor(ratio) }}>
        <div className="pr-score-ring"><b>{pct(ratio)}</b><small>{Math.round(score * 10) / 10} / {total}</small></div>
        <div>
          <h2>{p.title}: results</h2>
          <p className="muted">{ratio >= 0.8 ? 'Strong. Keep this level through the quiz.' : ratio >= 0.55 ? 'Getting there. Review the missed topics below.' : 'Needs work. Retry the wrong ones and re-read the slides cited in the explanations.'}</p>
          {qs.length - total > 0 && <p className="muted">{qs.length - total} skipped (not counted).</p>}
          <div className="row">
            {wrong.length > 0 && p.onRetry && <button className="btn primary" onClick={() => p.onRetry!(wrong, 'learn')}>Retry the {wrong.length} wrong</button>}
            <button className="btn" onClick={() => setShow(show === 'all' ? 'none' : 'all')}>{show === 'all' ? 'Hide review' : 'Review all answers'}</button>
            {wrong.length > 0 && <button className="btn" onClick={() => setShow('wrong')}>Show wrong only</button>}
            <button className="btn ghost" onClick={p.onExit}>Done</button>
          </div>
        </div>
      </div>
      <div className="pr-cols">
        <section className="pr-card"><h3>By lecture</h3>
          {byLec.map((x) => <Bar key={x.l} value={x.s / x.n} color={lecColor(x.l)} label={x.l} right={`${Math.round(x.s * 10) / 10}/${x.n}`} />)}
        </section>
        <section className="pr-card"><h3>By topic <small className="muted">weakest first</small></h3>
          {byTopic.map((x) => <Bar key={x.k} value={x.s / x.n} label={<><span className="pr-lec" style={{ background: lecColor(x.lecture) }}>{x.lecture}</span> {x.topic}</>} right={`${Math.round(x.s * 10) / 10}/${x.n}`} />)}
        </section>
      </div>
      {list.length > 0 && (
        <div className="pr-review">
          <h3>Review</h3>
          {list.map((q) => (
            <article key={q.id} className={'pr-review-item ' + (out[q.id]?.skipped ? 'skip' : out[q.id]?.correct ? 'ok' : out[q.id] ? 'bad' : 'skip')}>
              <div className="pr-review-n">{qs.indexOf(q) + 1}{!out[q.id] ? ' · unanswered' : ''}</div>
              <QuestionView q={q} mode="review" initial={out[q.id]} onSubmit={() => {}} />
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
