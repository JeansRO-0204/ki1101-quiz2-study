// Workspace-panel versions of practice views. Global keyboard shortcuts are off inside panels (several may be open at once).
import { useContext, useMemo, useState } from 'react'
import { PanelIdCtx } from '../lib/kit'
import { LECTURES, type LectureId, type WidgetProps } from '../types'
import { WIDGET } from '../registry'
import { PAST_PAPERS } from './bank'
import { POOL_Q, shuffled } from './pool'
import { Paper } from './Past'
import QuestionView, { KeysCtx, type Outcome } from './QuestionView'
import { logAttempt } from './store'
import { IconChevronRight } from '../lib/icons'
import './practice.css'

/** Past-paper panel: the panel id ('past:<paperId>') says which paper to show. */
export function PastPanel(_: WidgetProps) {
  const panelId = useContext(PanelIdCtx)
  const [id, setId] = useState<string | null>(panelId?.startsWith('past:') ? panelId.slice(5) : null)
  const paper = PAST_PAPERS.find((p) => p.id === id)
  return (
    <KeysCtx.Provider value={false}>
      {paper ? <Paper paper={paper} embedded /> : (
        <div className="pp-pick">
          {PAST_PAPERS.map((p) => <button key={p.id} className="btn" onClick={() => setId(p.id)}>{p.title}</button>)}
        </div>
      )}
    </KeysCtx.Provider>
  )
}

type Src = 'all' | 'past' | 'slide'
export function QuickQuiz(_: WidgetProps) {
  const [lecs, setLecs] = useState<LectureId[]>([])
  const [src, setSrc] = useState<Src>('all')
  const [n, setN] = useState(0)
  const [stats, setStats] = useState({ done: 0, score: 0 })
  const pool = useMemo(() => shuffled(POOL_Q.filter((q) =>
    (!lecs.length || lecs.includes(q.lecture)) && (src === 'all' || q.source === src) && (q.kind !== 'widget' || WIDGET.has(q.widget)))), [lecs, src])
  const q = pool.length ? pool[n % pool.length] : null
  const submit = (o: Outcome) => {
    if (!q || o.skipped) return
    setStats((s) => ({ done: s.done + 1, score: s.score + o.score }))
    logAttempt({ id: q.id, lecture: q.lecture, topic: q.topic, correct: o.correct, score: o.score, src: 'quiz', kind: q.kind })
  }
  const toggle = (l: LectureId) => { setLecs((a) => (a.includes(l) ? a.filter((x) => x !== l) : [...a, l])); setN(0) }
  return (
    <KeysCtx.Provider value={false}>
      <div className="qq">
        <div className="qq-bar">
          <div className="seg">{(['all', 'past', 'slide'] as const).map((s) => <button key={s} className={src === s ? 'on' : ''} onClick={() => { setSrc(s); setN(0) }}>{s === 'all' ? 'All' : s === 'past' ? 'Past quizzes' : 'Slides'}</button>)}</div>
          <div className="qq-lecs">{LECTURES.map((l) => <button key={l.id} className={'qq-lec' + (lecs.includes(l.id) ? ' on' : '')} style={{ ['--c' as string]: l.color }} onClick={() => toggle(l.id)}>{l.id}</button>)}</div>
          <span className="grow" />
          {stats.done > 0 && <span className="chip">{Math.round((stats.score / stats.done) * 100)}% · {stats.done}</span>}
        </div>
        {q ? (
          <div className="qq-body">
            <QuestionView key={q.id + ':' + n} q={q} mode="learn" onSubmit={submit} onNext={() => setN((x) => x + 1)} nextLabel="Next question" />
            <div className="qq-foot"><button className="btn sm ghost" onClick={() => setN((x) => x + 1)}>Skip<IconChevronRight size={13} /></button><span className="muted pr-small">{(n % pool.length) + 1} / {pool.length}</span></div>
          </div>
        ) : <p className="muted qq-body">No questions match.</p>}
      </div>
    </KeysCtx.Provider>
  )
}
