// Quiz: setup screen (scope, source, types, count, mode) → Session runner.
import { useEffect, useMemo, useState } from 'react'
import { useLocalState } from '../lib/kit'
import { LECTURES, type LectureId, type Question } from '../types'
import { GENERATORS } from './generators'
import { POOL_Q, USING_SAMPLE_Q, shuffled, topicsOf } from './pool'
import Session from './Session'
import { usePStore } from './store'
import { go, takePreset } from './ui'
import { IconChevronLeft, IconArrowRight } from '../lib/icons'

interface Setup {
  lectures: LectureId[]; topics: string[]; source: 'both' | 'slide' | 'generated' | 'past'; kinds: string[]
  count: number; shuffle: boolean; mode: 'learn' | 'test'; flaggedOnly: boolean; topUp: boolean
}
const DEFAULT: Setup = { lectures: ['L7', 'L8', 'L9', 'L10'], topics: [], source: 'both', kinds: ['mcq', 'numeric', 'widget', 'open'], count: 10, shuffle: true, mode: 'learn', flaggedOnly: false, topUp: true }
const KIND_LABEL: Record<string, string> = { mcq: 'Multiple choice', numeric: 'Numeric', widget: 'Interactive workbench', open: 'Written (self-check)' }

interface Run { key: number; title: string; qs: Question[]; mode: 'learn' | 'test' }

export default function Quiz() {
  const [run, setRun] = useState<Run | null>(null)
  if (run) {
    return <Session key={run.key} title={run.title} questions={run.qs} mode={run.mode} src="quiz" onExit={() => setRun(null)}
      onRetry={(qs, mode) => setRun({ key: Date.now(), title: 'Retry: wrong answers', qs: shuffled(qs), mode })} />
  }
  return <QuizSetup onStart={(title, qs, mode) => setRun({ key: Date.now(), title, qs, mode })} />
}

function QuizSetup({ onStart }: { onStart: (title: string, qs: Question[], mode: 'learn' | 'test') => void }) {
  const [s, setS] = useLocalState<Setup>('chem.practice.setup', DEFAULT)
  const store = usePStore()
  useEffect(() => {
    const p = takePreset()
    if (p) setS((x) => ({ ...x, lectures: p.lecture ? [p.lecture] : x.lectures, topics: p.topic ? [p.topic] : [], flaggedOnly: !!p.flaggedOnly, source: p.source ?? 'both', ...(p.source ? { lectures: ['L7', 'L8', 'L9', 'L10'] as LectureId[] } : {}), kinds: ['mcq', 'numeric', 'widget', 'open'] }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const set = <K extends keyof Setup>(k: K, v: Setup[K]) => setS((x) => ({ ...x, [k]: v }))
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  const topicMap = useMemo(() => topicsOf([...POOL_Q, ...GENERATORS]), [])
  const topics = s.lectures.flatMap((l) => [...(topicMap.get(l) ?? [])].map((t) => ({ l, t })))

  const matching = useMemo(() => POOL_Q.filter((q) =>
    s.lectures.includes(q.lecture) && (!s.topics.length || s.topics.includes(q.topic)) && (s.source === 'both' || q.source === s.source) &&
    s.kinds.includes(q.kind) && (!s.flaggedOnly || store.flagged.includes(q.id))), [s, store.flagged])
  const gens = useMemo(() => GENERATORS.filter((g) => s.lectures.includes(g.lecture) && (!s.topics.length || s.topics.includes(g.topic)) && s.source !== 'slide' && s.source !== 'past'), [s])

  const start = () => {
    let qs = s.shuffle ? shuffled(matching) : [...matching]
    const n = s.count || qs.length
    qs = qs.slice(0, n)
    if (s.topUp && !s.flaggedOnly && qs.length < n && gens.length) {
      let guard = 0
      while (qs.length < n && guard++ < n * 6) {
        const q = gens[Math.floor(Math.random() * gens.length)].make()
        if (s.kinds.includes(q.kind)) qs.push(q)
      }
    }
    if (!qs.length) return
    onStart('Quiz', qs, s.mode)
  }
  const total = matching.length + (s.topUp && !s.flaggedOnly && gens.length ? 999 : 0)
  const disabled = !matching.length && !(s.topUp && gens.length && !s.flaggedOnly)

  return (
    <div className="pr-page">
      <button className="btn ghost sm" onClick={() => go()}><IconChevronLeft size={14} />Practice</button>
      <h2>Quiz setup</h2>
      {USING_SAMPLE_Q && <div className="pr-banner">The question bank is still empty: showing a small <b>dev sample</b>. Generated drill questions can fill the rest.</div>}
      <div className="pr-form">
        <section className="pr-card">
          <h3>Scope</h3>
          <div className="pr-field"><label>Lectures</label>
            <div className="row">{LECTURES.map((l) => (
              <button key={l.id} className={'pr-pill' + (s.lectures.includes(l.id) ? ' on' : '')} style={{ ['--c' as string]: l.color }} onClick={() => setS((x) => ({ ...x, lectures: toggle(x.lectures, l.id), topics: [] }))}>
                <b>{l.id}</b> {l.short}
              </button>))}
            </div></div>
          <div className="pr-field"><label>Topics <small className="muted">(none selected = all)</small></label>
            <div className="row">
              {topics.map(({ l, t }) => (
                <button key={l + t} className={'pr-pill sm' + (s.topics.includes(t) ? ' on' : '')} style={{ ['--c' as string]: LECTURES.find((x) => x.id === l)!.color }} onClick={() => set('topics', toggle(s.topics, t))}>{t}</button>
              ))}
              {!topics.length && <span className="muted">Select a lecture first.</span>}
            </div></div>
          <div className="pr-field"><label>Source</label>
            <div className="seg">{([['both', 'All'], ['slide', 'Slide exercises'], ['past', 'Past quizzes'], ['generated', 'Generated']] as const).map(([v, l]) => <button key={v} className={s.source === v ? 'on' : ''} onClick={() => set('source', v)}>{l}</button>)}</div></div>
          <div className="pr-field"><label>Question types</label>
            <div className="row">{Object.entries(KIND_LABEL).map(([k, l]) => (
              <label key={k} className="pr-check"><input type="checkbox" checked={s.kinds.includes(k)} onChange={() => set('kinds', toggle(s.kinds, k))} /> {l}</label>))}</div></div>
          <div className="pr-field"><label className="pr-check"><input type="checkbox" checked={s.flaggedOnly} onChange={(e) => set('flaggedOnly', e.target.checked)} /> Only questions I flagged ({store.flagged.length})</label></div>
        </section>
        <section className="pr-card">
          <h3>Format</h3>
          <div className="pr-field"><label>Mode</label>
            <div className="seg"><button className={s.mode === 'learn' ? 'on' : ''} onClick={() => set('mode', 'learn')}>Learn</button><button className={s.mode === 'test' ? 'on' : ''} onClick={() => set('mode', 'test')}>Test</button></div>
            <p className="muted pr-small">{s.mode === 'learn' ? 'Feedback and explanation after every question; numeric steps are checked one by one.' : 'No feedback until the end; steps are all open; full review at the finish.'}</p></div>
          <div className="pr-field"><label>Number of questions</label>
            <div className="seg">{[5, 10, 20, 40, 0].map((n) => <button key={n} className={s.count === n ? 'on' : ''} onClick={() => set('count', n)}>{n || 'All'}</button>)}</div></div>
          <div className="pr-field row">
            <label className="pr-check"><input type="checkbox" checked={s.shuffle} onChange={(e) => set('shuffle', e.target.checked)} /> Shuffle</label>
            <label className="pr-check" title="If the bank has fewer questions than requested, add fresh parameterized ones"><input type="checkbox" checked={s.topUp} onChange={(e) => set('topUp', e.target.checked)} /> Top up with generated questions</label>
          </div>
          <div className="pr-avail"><b>{matching.length}</b> bank question{matching.length === 1 ? '' : 's'} match{gens.length && s.topUp ? <> · <b>{gens.length}</b> generators available</> : null}</div>
          <button className="btn primary pr-big" disabled={disabled || !total} onClick={start}>Start quiz<IconArrowRight size={14} /></button>
        </section>
      </div>
    </div>
  )
}
