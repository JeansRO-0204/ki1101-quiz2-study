// Drill: endless parameterized questions, one at a time, with streak/accuracy and a generator chooser.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Md, useLocalState } from '../lib/kit'
import { LECTURES, type Question } from '../types'
import { GENERATORS, GEN_BY_ID } from './generators'
import QuestionView, { type Outcome } from './QuestionView'
import { logAttempt, usePStore } from './store'
import { go, lecColor, pct, takePreset } from './ui'
import { IconChevronLeft } from '../lib/icons'

export default function Drill() {
  const store = usePStore()
  const [sel, setSel] = useLocalState<string[]>('chem.practice.drillSel', [])
  const [open, setOpen] = useState(true)
  const [stats, setStats] = useState({ n: 0, c: 0, streak: 0, best: 0 })
  const [q, setQ] = useState<Question | null>(null)
  const [nonce, setNonce] = useState(0)
  const [steps, setSteps] = useState(false)
  const assisted = useRef(false)
  const active = useMemo(() => (sel.length ? GENERATORS.filter((g) => sel.includes(g.id)) : GENERATORS), [sel])

  const nextQ = useCallback(() => {
    const g = active[Math.floor(Math.random() * active.length)]
    setQ(g.make()); setSteps(false); assisted.current = false; setNonce((n) => n + 1)
  }, [active])
  useEffect(() => {
    const p = takePreset()
    if (p?.gens) setSel(p.gens)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { nextQ() }, [sel]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (o: Outcome) => {
    if (!q || o.skipped) return
    if (!assisted.current) {
      logAttempt({ id: q.id, lecture: q.lecture, topic: q.topic, correct: o.correct, score: o.score, src: 'drill', kind: q.kind, gen: q.id.split(':')[1] })
      setStats((s) => { const streak = o.correct ? s.streak + 1 : 0; return { n: s.n + 1, c: s.c + (o.correct ? 1 : 0), streak, best: Math.max(s.best, streak) } })
    }
  }
  const toggle = (id: string) => setSel((s) => { const cur = s.length ? s : GENERATORS.map((g) => g.id); const n = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]; return n.length === GENERATORS.length || !n.length ? [] : n })
  const gen = q ? GEN_BY_ID.get(q.id.split(':')[1]) : undefined

  return (
    <div className="pr-page pr-drill">
      <div className="pr-drill-main">
        <div className="row pr-drill-top">
          <button className="btn ghost sm" onClick={() => go()}><IconChevronLeft size={14} />Practice</button>
          <h2>Drill</h2>
          <span className="grow" />
          <div className="pr-stats">
            <div><b>{stats.streak}</b><small>streak</small></div>
            <div><b>{stats.n ? pct(stats.c / stats.n) : '–'}</b><small>{stats.c}/{stats.n}</small></div>
            <div><b>{stats.best}</b><small>best</small></div>
          </div>
          <button className="btn" onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Choose'} generators ({sel.length || GENERATORS.length})</button>
        </div>
        {q && (
          <div className="pr-card pr-drill-card">
            {gen && <div className="pr-gen-tag">{gen.title}</div>}
            <QuestionView key={q.id + nonce} q={q} mode="learn" onSubmit={onSubmit} onNext={nextQ} nextLabel="Next question" />
            <div className="pq-actions">
              {!steps && <button className="btn ghost sm" onClick={() => { setSteps(true); assisted.current = true }}>Show me the steps</button>}
              <button className="btn ghost sm" onClick={nextQ}>Skip</button>
            </div>
            {steps && <div className="pr-steps"><b>Worked solution</b> <span className="muted">(this question will not count towards your stats)</span><Md>{q.explanation}</Md></div>}
          </div>
        )}
      </div>
      {open && (
        <aside className="pr-chooser pr-card">
          <div className="row"><h3>Generators</h3><span className="grow" /><button className="btn sm" onClick={() => setSel([])}>All</button></div>
          {LECTURES.map((l) => (
            <div key={l.id}>
              <div className="pr-chooser-head" style={{ color: l.color }}>{l.id} · {l.short}</div>
              {GENERATORS.filter((g) => g.lecture === l.id).map((g) => {
                const st = store.drill[g.id]
                const on = !sel.length || sel.includes(g.id)
                return (
                  <label key={g.id} className={'pr-gen' + (on ? ' on' : '')}>
                    <input type="checkbox" checked={on} onChange={() => toggle(g.id)} />
                    <span>{g.title}</span>
                    {st && <small style={{ color: lecColor(l.id) }}>{Math.round((st.c / st.n) * 100)}% · {st.n}</small>}
                  </label>
                )
              })}
            </div>
          ))}
        </aside>
      )}
    </div>
  )
}
