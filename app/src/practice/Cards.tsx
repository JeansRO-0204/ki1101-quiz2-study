// Leitner flashcards (boxes 1, 2, 4, 8 days). Space flips, 1–4 grade, Z changes the last grade.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Md } from '../lib/kit'
import { LECTURES, type Flashcard, type LectureId } from '../types'
import { POOL_C, USING_SAMPLE_C, shuffled } from './pool'
import { BOX_DAYS, applyGrade, getStore, gradeCard, isDue, updateStore, usePStore, type CardState, type Grade } from './store'
import { Bar, go, lecColor } from './ui'

const GRADES: { g: Grade; label: string; key: string }[] = [
  { g: 'again', label: 'Again', key: '1' }, { g: 'hard', label: 'Hard', key: '2' }, { g: 'good', label: 'Good', key: '3' }, { g: 'easy', label: 'Easy', key: '4' },
]
const nextLabel = (box: number, g: Grade) => (g === 'again' ? '1 min' : `${BOX_DAYS[applyGrade(box, g) - 1]} d`)

export default function Cards() {
  const store = usePStore()
  const [lec, setLec] = useState<LectureId | 'all'>('all')
  const [topic, setTopic] = useState('all')
  const [ahead, setAhead] = useState(false)
  const topics = useMemo(() => [...new Set(POOL_C.filter((c) => lec === 'all' || c.lecture === lec).map((c) => c.topic))], [lec])
  const pool = useMemo(() => POOL_C.filter((c) => (lec === 'all' || c.lecture === lec) && (topic === 'all' || c.topic === topic)), [lec, topic])
  const dueNow = pool.filter((c) => isDue(store.cards[c.id]))
  const [queue, setQueue] = useState<string[]>([])
  const [flipped, setFlipped] = useState(false)
  const [last, setLast] = useState<{ id: string; prev: CardState | undefined } | null>(null)
  const [changing, setChanging] = useState(false)
  const [done, setDone] = useState(0)
  const byId = useMemo(() => new Map(POOL_C.map((c) => [c.id, c])), [])

  const rebuild = () => { setQueue(shuffled((ahead ? pool : dueNow).map((c) => c.id))); setFlipped(false); setLast(null); setDone(0) }
  useEffect(rebuild, [lec, topic, ahead]) // eslint-disable-line react-hooks/exhaustive-deps

  const cur: Flashcard | undefined = byId.get(queue[0])
  const curState = cur ? store.cards[cur.id] : undefined
  const box = curState?.box ?? 1

  const grade = (g: Grade) => {
    if (changing && last) { // re-grade the previous card from its earlier state
      updateStore((s) => { const cards = { ...s.cards }; if (last.prev) cards[last.id] = last.prev; else delete cards[last.id]; return { ...s, cards } })
      gradeCard(last.id, g)
      setChanging(false)
      return
    }
    if (!cur) return
    setLast({ id: cur.id, prev: getStore().cards[cur.id] })
    gradeCard(cur.id, g)
    setQueue((q) => (g === 'again' ? [...q.slice(1), q[0]] : q.slice(1)))
    if (g !== 'again') setDone((d) => d + 1)
    setFlipped(false)
  }
  const gradeRef = useRef(grade); gradeRef.current = grade
  const st = useRef({ flipped, cur, last }); st.current = { flipped, cur, last }
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return
      if (e.key === ' ' || e.key === 'Enter') { if (t?.tagName === 'BUTTON') return; e.preventDefault(); if (st.current.cur) setFlipped((x) => !x) }
      else if (['1', '2', '3', '4'].includes(e.key) && (st.current.flipped || changing)) gradeRef.current(GRADES[Number(e.key) - 1].g)
      else if (e.key.toLowerCase() === 'z' && st.current.last) setChanging((c) => !c)
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [changing])

  const counts = [1, 2, 3, 4].map((b) => pool.filter((c) => store.cards[c.id]?.box === b).length)
  const fresh = pool.filter((c) => !store.cards[c.id]).length
  const lastCard = last ? byId.get(last.id) : undefined

  return (
    <div className="pr-page pr-cards">
      <div className="row">
        <button className="btn ghost sm" onClick={() => go()}>← Practice</button>
        <h2>Flashcards</h2>
        <span className="grow" />
        <span className="chip warn">{dueNow.length} due</span><span className="chip">{pool.length} cards</span>
      </div>
      {USING_SAMPLE_C && <div className="pr-banner">Flashcard bank is empty: showing a few <b>dev sample</b> cards.</div>}
      <div className="row pr-filters">
        <select value={lec} onChange={(e) => { setLec(e.target.value as LectureId | 'all'); setTopic('all') }}>
          <option value="all">All lectures</option>{LECTURES.map((l) => <option key={l.id} value={l.id}>{l.id} · {l.short}</option>)}
        </select>
        <select value={topic} onChange={(e) => setTopic(e.target.value)}><option value="all">All topics</option>{topics.map((t) => <option key={t}>{t}</option>)}</select>
        <label className="pr-check"><input type="checkbox" checked={ahead} onChange={(e) => setAhead(e.target.checked)} /> Study ahead (include not-due)</label>
      </div>
      <div className="pr-cards-grid">
        <div>
          {cur ? (
            <>
              <div className="pr-prog"><div style={{ width: `${(done / Math.max(1, done + queue.length)) * 100}%` }} /></div>
              <div className={'pr-card3d' + (flipped ? ' flipped' : '')} onClick={() => setFlipped(!flipped)} role="button" tabIndex={0}>
                <div className="pr-face front">
                  <div className="pr-face-meta"><span className="pr-lec" style={{ background: lecColor(cur.lecture) }}>{cur.lecture}</span> {cur.topic} <span className="muted">· box {box}</span></div>
                  <div className="pr-face-body"><Md>{cur.front}</Md></div>
                  <div className="pr-face-hint">Space to flip</div>
                </div>
                <div className="pr-face back">
                  <div className="pr-face-meta"><span className="pr-lec" style={{ background: lecColor(cur.lecture) }}>{cur.lecture}</span> {cur.topic}</div>
                  <div className="pr-face-body"><Md>{cur.back}</Md></div>
                </div>
              </div>
              <div className="pr-grades">
                {GRADES.map((x) => (
                  <button key={x.g} className={'pr-grade ' + x.g} disabled={!flipped && !changing} onClick={() => grade(x.g)}>
                    <b>{x.label}</b><small>{nextLabel(box, x.g)} · key {x.key}</small>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="pr-empty"><h3>{pool.length ? 'All caught up' : 'No cards in this selection'}</h3>
              <p className="muted">{pool.length ? `Nothing is due. You reviewed ${done} card${done === 1 ? '' : 's'} this session.` : 'Pick a different lecture or topic.'}</p>
              {pool.length > 0 && <button className="btn primary" onClick={() => setAhead(true)}>Study ahead</button>}
              {changing && <div className="pr-grades">{GRADES.map((x) => <button key={x.g} className={'pr-grade ' + x.g} onClick={() => grade(x.g)}><b>{x.label}</b><small>key {x.key}</small></button>)}</div>}</div>
          )}
          {last && lastCard && (
            <div className="pr-lastgrade">
              <span>Last: <b>{lastCard.front.replace(/[$*]/g, '').slice(0, 42)}…</b> → <b>{store.cards[last.id]?.last}</b></span>
              <button className="btn sm" onClick={() => setChanging(!changing)}>{changing ? 'Cancel' : 'Change grade'} <kbd>Z</kbd></button>
              {changing && <span className="muted">choose a new grade above (1–4)</span>}
            </div>
          )}
        </div>
        <aside className="pr-card">
          <h3>Boxes</h3>
          <Bar value={fresh / Math.max(1, pool.length)} color="#94a3b8" label="New" right={fresh} />
          {counts.map((n, i) => <Bar key={i} value={n / Math.max(1, pool.length)} color="var(--accent)" label={`Box ${i + 1} · ${BOX_DAYS[i]}d`} right={n} />)}
          <p className="muted pr-small">Again → box 1 · Hard → stay · Good → +1 box · Easy → +2 boxes.<br />Shortcuts: Space flip · 1–4 grade · Z change last.</p>
        </aside>
      </div>
    </div>
  )
}
