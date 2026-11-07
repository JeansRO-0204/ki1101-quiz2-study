// Renders and grades a single question (mcq / numeric with steps / widget). Used by Quiz, Drill and Mock.
import { Suspense, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { Feedback, Md, NumInput, SlideRef, Step, Verdict, parseNum, sci, within, type Note } from '../lib/kit'
import { WIDGET } from '../registry'
import type { MCQ, NumericQ, Question, WidgetQ, WidgetProps, WidgetResult } from '../types'
import { diagnose } from './diagnose'
import { toggleFlag, usePStore } from './store'

export type Answer =
  | { k: 'mcq'; sel: number[] }
  | { k: 'num'; steps: string[]; stepOk: (boolean | null)[]; revealed: boolean[]; final: string }
  | { k: 'widget'; r?: WidgetResult }
export interface Outcome { correct: boolean; score: number; skipped?: boolean; answer: Answer }
/** learn = feedback after each answer; test = answers autosave, no feedback; review = read-only with full feedback. */
export type ViewMode = 'learn' | 'test' | 'review'

export const isMulti = (q: MCQ) => q.answer.length > 1
const sameSet = (a: number[], b: number[]) => a.length === b.length && a.every((x) => b.includes(x))

/** Grades a stored answer (used for review and for the mock/test summaries). */
export function gradeAnswer(q: Question, a: Answer): { correct: boolean; score: number } {
  if (q.kind === 'mcq' && a.k === 'mcq') { const ok = sameSet(a.sel, q.answer); return { correct: ok, score: ok ? 1 : 0 } }
  if (q.kind === 'numeric' && a.k === 'num') { const ok = within(parseNum(a.final), q.answer, q.tol); return { correct: ok, score: ok ? 1 : 0 } }
  if (q.kind === 'widget' && a.k === 'widget') return { correct: !!a.r?.correct, score: a.r?.score ?? (a.r?.correct ? 1 : 0) }
  return { correct: false, score: 0 }
}

interface Props {
  q: Question
  mode: ViewMode
  initial?: Outcome
  onSubmit: (o: Outcome) => void
  onNext?: () => void
  nextLabel?: string
}

export default function QuestionView(props: Props) {
  const { q } = props
  return (
    <div className="pq">
      <div className="pq-meta">
        <span className="chip">{q.lecture}</span>
        <span className="chip">{q.topic}</span>
        {q.source === 'slide' && <span className="chip pq-slide" title="Taken from a slide exercise">slide</span>}
        {q.difficulty && <span className="pq-diff" title={`Difficulty ${q.difficulty}/3`}>{'●'.repeat(q.difficulty)}<i>{'●'.repeat(3 - q.difficulty)}</i></span>}
      </div>
      <div className="pq-stem"><Md>{q.stem}</Md></div>
      {q.kind === 'mcq' && <McqView {...props} q={q} />}
      {q.kind === 'numeric' && <NumView {...props} q={q} />}
      {q.kind === 'widget' && <WidgetView {...props} q={q} />}
    </div>
  )
}

/* ---------- shared resolution block ---------- */
function Resolution({ q, ok, title, detail, onNext, nextLabel, notes, skipped }: {
  q: Question; ok: boolean; title: string; detail?: string; onNext?: () => void; nextLabel?: string; notes?: Note[]; skipped?: boolean
}) {
  const store = usePStore()
  const flagged = store.flagged.includes(q.id)
  return (
    <div className="pq-res">
      <Verdict correct={skipped ? 'partial' : ok} title={title}>{detail && <Md>{detail}</Md>}</Verdict>
      {notes && <Feedback notes={notes} />}
      <div className="pq-expl"><h4>Explanation</h4><Md>{q.explanation}</Md></div>
      <div className="pq-foot">
        {!!q.slides?.length && <span className="refs">Slides: {q.slides.map((s) => <SlideRef key={s} l={q.lecture} s={s} />)}</span>}
        <span className="grow" />
        <button className={'btn sm' + (flagged ? ' on' : '')} onClick={() => toggleFlag(q.id)} title="Mark to revisit later">{flagged ? '⚑ Flagged' : '⚐ Flag for review'}</button>
        {onNext && <button className="btn primary" onClick={onNext}>{nextLabel ?? 'Next'} <kbd>↵</kbd></button>}
      </div>
    </div>
  )
}

function useKeys(handler: (e: KeyboardEvent) => void) {
  const ref = useRef(handler); ref.current = handler
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      ref.current(e)
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [])
}

/* ---------- MCQ ---------- */
function McqView({ q, mode, initial, onSubmit, onNext, nextLabel }: Props & { q: MCQ }) {
  const init = initial?.answer.k === 'mcq' ? initial.answer.sel : []
  const [sel, setSel] = useState<number[]>(init)
  const [done, setDone] = useState(mode === 'review')
  const multi = isMulti(q)
  const locked = mode === 'review' || (mode === 'learn' && done)
  const showFb = mode === 'review' || (mode === 'learn' && done)
  const ok = sameSet(sel, q.answer)
  const first = useRef(true)

  const toggle = (i: number) => {
    if (locked) return
    setSel((s) => (multi ? (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]) : [i]))
  }
  useEffect(() => { // autosave in test mode
    if (first.current) { first.current = false; return }
    if (mode === 'test' && sel.length) onSubmit({ correct: sameSet(sel, q.answer), score: sameSet(sel, q.answer) ? 1 : 0, answer: { k: 'mcq', sel } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel])
  const check = () => {
    if (!sel.length || done) return
    setDone(true)
    onSubmit({ correct: ok, score: ok ? 1 : 0, answer: { k: 'mcq', sel } })
  }
  useKeys((e) => {
    if (locked) { if (e.key === 'Enter' && onNext && mode !== 'review') { e.preventDefault(); onNext() } return }
    const n = Number(e.key)
    if (n >= 1 && n <= q.options.length) { e.preventDefault(); toggle(n - 1) }
    else if (e.key === 'Enter' && mode === 'learn') { e.preventDefault(); check() }
    else if (e.key === 'Enter' && mode === 'test' && onNext) { e.preventDefault(); onNext() }
  })
  const notes: Note[] = useMemo(() => {
    if (!showFb) return []
    const out: Note[] = []
    sel.filter((i) => !q.answer.includes(i)).forEach((i) => out.push({ level: 'err', msg: `Option ${i + 1} is not correct.` }))
    q.answer.filter((i) => !sel.includes(i)).forEach((i) => out.push({ level: sel.length ? 'warn' : 'info', msg: `${sel.length ? 'You missed' : 'Correct answer'}: option ${i + 1}.` }))
    return out
  }, [showFb, sel, q])

  return (
    <>
      {multi && <p className="pq-note">Select all that apply.</p>}
      <div className="pq-opts" role={multi ? 'group' : 'radiogroup'}>
        {q.options.map((o, i) => {
          const picked = sel.includes(i), right = q.answer.includes(i)
          const cls = 'pq-opt' + (picked ? ' sel' : '') + (showFb ? (right ? ' right' : picked ? ' wrong' : '') : '') + (locked ? ' locked' : '')
          return (
            <button key={i} className={cls} onClick={() => toggle(i)} onMouseDown={(e) => e.preventDefault()} aria-pressed={picked}>
              <span className="pq-key">{multi ? (picked ? '☑' : '☐') : i + 1}</span>
              <span className="pq-opt-body"><Md inline>{o}</Md></span>
              {showFb && right && <span className="pq-mark ok">✓</span>}
              {showFb && picked && !right && <span className="pq-mark err">✗</span>}
            </button>
          )
        })}
      </div>
      {mode === 'learn' && !done && <div className="pq-actions"><button className="btn primary" disabled={!sel.length} onClick={check}>Check <kbd>↵</kbd></button><span className="muted pq-hint">keys 1–{q.options.length} select</span></div>}
      {mode === 'test' && <div className="pq-actions"><span className={'chip' + (sel.length ? ' ok' : '')}>{sel.length ? 'Answer saved' : 'Not answered'}</span></div>}
      {showFb && <Resolution q={q} ok={ok} title={ok ? 'Correct' : 'Incorrect'} notes={notes} onNext={mode === 'review' ? undefined : onNext} nextLabel={nextLabel} />}
    </>
  )
}

/* ---------- numeric ---------- */
function NumView({ q, mode, initial, onSubmit, onNext, nextLabel }: Props & { q: NumericQ }) {
  const steps = q.steps ?? []
  const ia = initial?.answer.k === 'num' ? initial.answer : undefined
  const [vals, setVals] = useState<string[]>(ia?.steps ?? steps.map(() => ''))
  const [ok, setOk] = useState<(boolean | null)[]>(ia?.stepOk ?? steps.map(() => null))
  const [rev, setRev] = useState<boolean[]>(ia?.revealed ?? steps.map(() => false))
  const [tries, setTries] = useState<number[]>(steps.map(() => 0))
  const [msgs, setMsgs] = useState<Note[][]>(steps.map(() => []))
  const [final, setFinal] = useState(ia?.final ?? '')
  const [done, setDone] = useState(mode === 'review')
  const first = useRef(true)
  const review = mode === 'review'
  const learn = mode === 'learn'
  const finalVal = parseNum(final)
  const finalOk = within(finalVal, q.answer, q.tol)
  const unlockedTo = learn ? ok.findIndex((x, i) => !(x === true || rev[i])) : -1 // first unfinished step
  const finalOpen = !learn || unlockedTo === -1

  const answer = (): Answer => ({ k: 'num', steps: vals, stepOk: steps.map((s, i) => (ok[i] ?? within(parseNum(vals[i]), s.answer, s.tol))), revealed: rev, final })
  useEffect(() => { // autosave in test mode
    if (first.current) { first.current = false; return }
    if (mode === 'test' && final.trim()) onSubmit({ correct: finalOk, score: finalOk ? 1 : 0, answer: answer() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [final, vals])

  const checkStep = (i: number) => {
    const s = steps[i]; const v = parseNum(vals[i])
    if (Number.isNaN(v)) { setMsgs((m) => m.map((x, j) => (j === i ? [{ level: 'warn', msg: 'Enter a number (e.g. 4.86e-7 or 4.86×10^-7).' }] : x))); return }
    const good = within(v, s.answer, s.tol)
    setOk((o) => o.map((x, j) => (j === i ? good : x)))
    setTries((t) => t.map((x, j) => (j === i ? x + 1 : x)))
    const d = good ? null : diagnose(v, s.answer, s.unit)
    setMsgs((m) => m.map((x, j) => (j === i ? [good ? { level: 'ok', msg: `Correct: ${sci(s.answer)}${s.unit ? ' ' + s.unit : ''}.` } : { level: 'err', msg: d ?? 'Not quite. Re-check this step.' }] : x)))
  }
  const reveal = (i: number) => {
    setVals((v) => v.map((x, j) => (j === i ? String(Number(steps[i].answer.toPrecision(4))) : x)))
    setRev((r) => r.map((x, j) => (j === i ? true : x)))
    setOk((o) => o.map((x, j) => (j === i ? false : x)))
    setMsgs((m) => m.map((x, j) => (j === i ? [{ level: 'info', msg: `Answer: ${sci(steps[i].answer)}${steps[i].unit ? ' ' + steps[i].unit : ''}.` }] : x)))
  }
  const check = () => {
    if (done || !final.trim()) return
    setDone(true)
    onSubmit({ correct: finalOk, score: finalOk ? 1 : 0, answer: answer() })
  }
  useKeys((e) => { if (e.key === 'Enter' && onNext && ((learn && done) || mode === 'test')) { e.preventDefault(); onNext() } })

  const showFb = review || (learn && done)
  const finalNotes: Note[] = useMemo(() => {
    if (!showFb) return []
    if (!final.trim()) return [{ level: 'info', msg: `Expected ${sci(q.answer)}${q.unit ? ' ' + q.unit : ''}.` }]
    if (Number.isNaN(finalVal)) return [{ level: 'warn', msg: 'Your answer could not be read as a number.' }]
    if (finalOk) return [{ level: 'ok', msg: `Your ${sci(finalVal)} matches ${sci(q.answer)}${q.unit ? ' ' + q.unit : ''}.` }]
    const n: Note[] = [{ level: 'err', msg: `You entered ${sci(finalVal)}${q.unit ? ' ' + q.unit : ''}; expected ${sci(q.answer)}${q.unit ? ' ' + q.unit : ''}.` }]
    const d = diagnose(finalVal, q.answer, q.unit)
    if (d) n.push({ level: 'hint', msg: d })
    return n
  }, [showFb, final, finalVal, finalOk, q])

  const stepStatus = (i: number): 'locked' | 'active' | 'done' | 'error' => {
    if (review || !learn) return ok[i] === true ? 'done' : ok[i] === false ? 'error' : 'active'
    if (ok[i] === true || rev[i]) return 'done'
    if (i === unlockedTo) return ok[i] === false ? 'error' : 'active'
    return 'locked'
  }
  return (
    <div className="pq-num">
      {steps.map((s, i) => {
        const st = stepStatus(i)
        const locked = review || st === 'done' || st === 'locked'
        const rv = review ? (ok[i] === true ? 'ok' : vals[i] ? 'err' : null) : st === 'done' && !rev[i] ? 'ok' : st === 'error' ? 'err' : null
        return (
          <Step key={i} n={i + 1} title={<Md inline>{s.prompt}</Md>} status={st} notes={review ? [{ level: ok[i] ? 'ok' : 'info', msg: `Expected ${sci(s.answer)}${s.unit ? ' ' + s.unit : ''}.` }] : msgs[i]}>
            <div className="row">
              <NumInput value={vals[i]} onChange={(v) => setVals((a) => a.map((x, j) => (j === i ? v : x)))} unit={s.unit} state={rv as 'ok' | 'err' | null} disabled={locked}
                />
              {learn && !locked && <button className="btn sm" onClick={() => checkStep(i)}>Check step</button>}
              {learn && !locked && tries[i] >= 2 && <button className="btn sm ghost" onClick={() => reveal(i)}>Show answer</button>}
            </div>
            <StepEnter active={learn && !locked} onEnter={() => checkStep(i)} />
          </Step>
        )
      })}
      <Step n={steps.length + 1} title={steps.length ? 'Final answer' : <span className="muted">Your answer</span>} status={!finalOpen ? 'locked' : showFb ? (finalOk ? 'done' : 'error') : 'active'}>
        <div className="row">
          <NumInput value={final} onChange={setFinal} unit={q.unit} width={150} disabled={review || (learn && done)} state={showFb ? (finalOk ? 'ok' : 'err') : null} />
          {learn && !done && <button className="btn primary" disabled={!final.trim()} onClick={check}>Check</button>}
          {mode === 'test' && <span className={'chip' + (final.trim() ? ' ok' : '')}>{final.trim() ? 'Answer saved' : 'Not answered'}</span>}
        </div>
        <StepEnter active={learn && !done && finalOpen} onEnter={check} />
      </Step>
      {showFb && <Resolution q={q} ok={finalOk} title={finalOk ? 'Correct' : 'Incorrect'} notes={finalNotes} onNext={review ? undefined : onNext} nextLabel={nextLabel} />}
    </div>
  )
}
/** Enter key inside the nearest number input triggers `onEnter`. */
function StepEnter({ active, onEnter }: { active: boolean; onEnter: () => void }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const host = ref.current?.parentElement
    if (!host || !active) return
    const f = (e: KeyboardEvent) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') { e.preventDefault(); onEnter() } }
    host.addEventListener('keydown', f)
    return () => host.removeEventListener('keydown', f)
  })
  return <span ref={ref} hidden />
}

/* ---------- widget ---------- */
function WidgetView({ q, mode, initial, onSubmit, onNext, nextLabel }: Props & { q: WidgetQ }) {
  const def = WIDGET.get(q.widget)
  const ia = initial?.answer.k === 'widget' ? initial.answer : undefined
  const [res, setRes] = useState<WidgetResult | undefined>(ia?.r)
  const [skipped, setSkipped] = useState(!!initial?.skipped)
  const review = mode === 'review'
  const Comp = def?.component as ComponentType<WidgetProps<unknown>> | undefined
  const submit = (r: WidgetResult) => {
    if (res) return
    setRes(r)
    onSubmit({ correct: r.correct, score: r.score ?? (r.correct ? 1 : 0), answer: { k: 'widget', r } })
  }
  const skip = () => { setSkipped(true); onSubmit({ correct: false, score: 0, skipped: true, answer: { k: 'widget' } }); if (mode !== 'review') onNext?.() }
  const showFb = review || (mode === 'learn' && !!res)
  useKeys((e) => { if (e.key === 'Enter' && showFb && onNext && !review) { e.preventDefault(); onNext() } })
  if (review) {
    return (
      <>
        <p className="muted">Interactive task: <code>{q.widget}</code></p>
        <Resolution q={q} ok={!!res?.correct} skipped={skipped || !res} title={skipped || !res ? 'Skipped / not completed' : res.correct ? 'Correct' : 'Incorrect'} detail={res?.summary} />
      </>
    )
  }
  return (
    <>
      {Comp
        ? <div className="pq-widget"><Suspense fallback={<div className="ph">Loading workbench…</div>}><Comp key={q.id} task={q.task} mode={mode === 'learn' ? 'learn' : 'test'} onResult={submit} /></Suspense></div>
        : <div className="ph pq-widget-ph">The interactive workbench “{q.widget}” is not available yet.</div>}
      {!res && <div className="pq-actions"><button className="btn ghost sm" onClick={skip}>Skip this task</button><span className="muted pq-hint">Press Check inside the workbench to submit.</span></div>}
      {mode === 'test' && res && <div className="pq-actions"><span className="chip ok">Result recorded</span>{onNext && <button className="btn primary" onClick={onNext}>{nextLabel ?? 'Next'}</button>}</div>}
      {showFb && <Resolution q={q} ok={!!res?.correct} title={res?.correct ? 'Correct' : 'Incorrect'} detail={res?.summary} onNext={onNext} nextLabel={nextLabel} />}
    </>
  )
}
