// Renders and grades a single question (mcq / numeric with steps / widget). Used by Quiz, Drill and Mock.
import { Suspense, createContext, useContext, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { Feedback, Md, NumInput, SlideRef, Step, Verdict, parseNum, sci, within, type Note } from '../lib/kit'
import { WIDGET } from '../registry'
import type { MCQ, NumericQ, OpenQ, OrderQ, Question, ShortQ, WidgetQ, WidgetProps, WidgetResult } from '../types'
import { blankOk, blankWhy, orderOk } from './answerCheck'
import { useScriptTyping } from '../lib/scripts'
import { ScriptArea } from '../lib/scripts'
import { PAST_CONTEXT } from './bank'
import { PastFigures } from './PastFigures'
import { HintLadder, LangSwitch, loc, useLang } from './Hints'
import { diagnose } from './diagnose'
import { toggleFlag, usePStore } from './store'
import { IconCheckFill, IconXFill } from '../lib/icons'

export type Answer =
  | { k: 'mcq'; sel: number[] }
  | { k: 'num'; steps: string[]; stepOk: (boolean | null)[]; revealed: boolean[]; final: string }
  | { k: 'widget'; r?: WidgetResult }
  | { k: 'open'; text: string; self?: number; ticks?: number[] }
  | { k: 'short'; vals: string[] }
  | { k: 'order'; seq: number[] }
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
  if (a.k === 'open') return { correct: a.self === 1, score: a.self ?? 0 } // also the 'answer on paper' fallback of any kind
  if (q.kind === 'short' && a.k === 'short') { const n = q.blanks.filter((b, i) => blankOk(b, a.vals[i] ?? '')).length; return { correct: n === q.blanks.length, score: n / q.blanks.length } }
  if (q.kind === 'order' && a.k === 'order') { const ok = orderOk(q, a.seq); return { correct: ok, score: ok ? 1 : 0 } }
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

export default function QuestionView(props: Props & { hideMeta?: boolean }) {
  const { q: q0, mode, hideMeta } = props
  const [lang, setLang] = useLang()
  const L = useMemo(() => loc(q0, lang), [q0, lang])
  // language-resolved copy: grading uses indexes/numbers, so only text fields change
  const q = useMemo(() => ({
    ...q0, stem: L.stem, explanation: L.explanation,
    ...(q0.kind === 'mcq' ? { options: L.options } : {}),
    ...(q0.kind === 'open' ? { answer: L.answer, rubric: L.rubric } : {}),
    ...(q0.kind === 'short' ? { blanks: q0.blanks.map((b, i) => ({ ...b, label: L.labels?.[i] ?? b.label })) } : {}),
    ...(q0.kind === 'order' ? { items: L.items, ends: L.ends } : {}),
  }) as Question, [q0, L])
  const vp = { ...props, q }
  // freedom/accessibility escape hatch: any structured answer can be done on paper and self-checked instead
  const canPaper = q.kind === 'short' || q.kind === 'order' || q.kind === 'widget'
  const [onPaper, setOnPaper] = useState(props.initial?.answer.k === 'open' && q.kind !== 'open')
  useEffect(() => { setOnPaper(props.initial?.answer.k === 'open' && q0.kind !== 'open') }, [q0.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const paperQ = useMemo(() => ({ ...q, kind: 'open', answer: q.explanation, rubric: undefined }) as OpenQ, [q])
  return (
    <div className="pq">
      {!hideMeta && (
        <div className="pq-meta">
          <span className="chip">{q.lecture}</span>
          <span className="chip">{q.topic}</span>
          {q.source === 'slide' && <span className="chip pq-slide" title="Taken from a slide exercise">slide</span>}
          {q.past && <span className="chip pq-past" title="From a past KI1101 Quiz 2">Kuis 2 {q.past.paper.match(/\d{4}$/)?.[0]} · {q.past.label}</span>}
          {q.difficulty && <span className="pq-diff" title={`Difficulty ${q.difficulty}/3`}>{'●'.repeat(q.difficulty)}<i>{'●'.repeat(3 - q.difficulty)}</i></span>}
          {q.indo && <><span className="grow" /><LangSwitch lang={lang} setLang={setLang} /></>}
        </div>
      )}
      {!hideMeta && (() => { const c = PAST_CONTEXT.get(q0.id); const t = c && ((lang === 'id' ? c.introId : c.intro) ?? c.intro); return c ? <><PastFigures figs={c.figures} lang={lang} />{t && <div className="pp-intro pq-ctx"><Md>{t}</Md></div>}</> : null })()}
      <div className="pq-stem"><Md>{q.stem}</Md></div>
      {mode === 'learn' && <HintLadder hints={L.hints} work={L.work} lang={lang} resetKey={q0.id} />}
      {canPaper && mode !== 'review' && (
        <div className="pq-paper-sw">
          <button className="btn ghost sm" onClick={() => setOnPaper((v) => !v)}>
            {onPaper ? (lang === 'id' ? 'Kembali ke jawaban interaktif' : 'Back to the interactive answer') : (lang === 'id' ? 'Jawab di kertas saja' : 'Answer on paper instead')}
          </button>
        </div>
      )}
      {onPaper && canPaper ? <OpenView {...vp} q={paperQ} lang={lang} paper /> : <>
        {q.kind === 'mcq' && <McqView {...vp} q={q} />}
        {q.kind === 'numeric' && <NumView {...vp} q={q} />}
        {q.kind === 'widget' && <WidgetView {...vp} q={q} />}
        {q.kind === 'open' && <OpenView {...vp} q={q} lang={lang} />}
        {q.kind === 'short' && <ShortView {...vp} q={q} lang={lang} />}
        {q.kind === 'order' && <OrderView {...vp} q={q} lang={lang} />}
      </>}
    </div>
  )
}

/* ---------- free response: write → compare with model answer → self-grade (rubric when available) ---------- */
const OT = {
  en: { ph: 'Write your working and answer here (scratch space; not graded automatically)…', paperPh: 'Optional: jot your answer here, or just work on paper.', reveal: 'Compare with model answer', model: 'Model answer', how: 'How did you do?', got: 'Got it', part: 'Partly', miss: 'Missed it', saved: 'Self-graded', tick: 'Tick each key point your answer contains:', submit: 'Submit self-check', points: 'key points' },
  id: { ph: 'Tulis jawaban dan cara pengerjaanmu di sini…', paperPh: 'Opsional: tulis jawabanmu di sini, atau kerjakan di kertas.', reveal: 'Bandingkan dengan kunci jawaban', model: 'Kunci jawaban', how: 'Bagaimana hasilmu?', got: 'Benar', part: 'Sebagian', miss: 'Salah', saved: 'Dinilai sendiri', tick: 'Centang setiap poin kunci yang ada di jawabanmu:', submit: 'Kirim penilaian', points: 'poin kunci' },
}
function OpenView({ q, mode, initial, onSubmit, onNext, nextLabel, lang, paper }: Props & { q: OpenQ; lang: 'en' | 'id'; paper?: boolean }) {
  const init = initial?.answer.k === 'open' ? initial.answer : undefined
  const [text, setText] = useState(init?.text ?? '')
  const [shown, setShown] = useState(mode === 'review' || init?.self != null)
  const [self, setSelf] = useState<number | undefined>(init?.self)
  const [ticks, setTicks] = useState<number[]>(init?.ticks ?? [])
  const t = OT[lang]
  const review = mode === 'review'
  const rubric = q.rubric?.length ? q.rubric : null
  const grade = (v: number, tk?: number[]) => { setSelf(v); onSubmit({ correct: v === 1, score: v, answer: { k: 'open', text, self: v, ticks: tk } }) }
  const label = (v: number) => (rubric ? `${Math.round(v * rubric.length)}/${rubric.length} ${t.points}` : v === 1 ? t.got : v === 0.5 ? t.part : t.miss)
  return (
    <>
      <ScriptArea className="pq-open" value={text} onChange={setText} placeholder={paper ? t.paperPh : t.ph} disabled={review} rows={paper ? 2 : 4} />
      {!shown && <div className="pq-actions"><button className="btn primary" onClick={() => setShown(true)}>{t.reveal}</button></div>}
      {shown && <div className="pq-model"><h4>{t.model}</h4><Md>{q.answer}</Md></div>}
      {shown && rubric && (
        <fieldset className="pq-rubric" disabled={review || self != null}>
          <legend>{t.tick}</legend>
          {rubric.map((r, i) => (
            <label key={i} className={'pq-rub' + (ticks.includes(i) ? ' on' : '')}>
              <input type="checkbox" checked={ticks.includes(i)} onChange={() => setTicks((a) => (a.includes(i) ? a.filter((x) => x !== i) : [...a, i]))} />
              <Md inline>{r}</Md>
            </label>
          ))}
          {!review && self == null && <div className="pq-actions"><button className="btn primary" onClick={() => grade(ticks.length / rubric.length, ticks)}>{t.submit} · {ticks.length}/{rubric.length}</button></div>}
        </fieldset>
      )}
      {shown && !rubric && !review && (
        <div className="pq-actions pq-self">
          <span className="muted">{t.how}</span>
          {([[1, t.got, 'ok'], [0.5, t.part, 'warn'], [0, t.miss, 'err']] as const).map(([v, l, c]) => (
            <button key={v} className={'btn sm pq-sg ' + c + (self === v ? ' on' : '')} onClick={() => grade(v)}>{l}</button>
          ))}
        </div>
      )}
      {shown && self != null && <Resolution q={q} ok={self === 1} title={`${t.saved}: ${label(self)}`} skipped={self > 0 && self < 1} onNext={review ? undefined : onNext} nextLabel={nextLabel} hideExpl={paper} />}
    </>
  )
}

/* ---------- short typed answers ---------- */
const ST = {
  en: { check: 'Check', retry: 'Try again', saved: 'Answer saved', unsaved: 'Not answered', expected: 'Accepted answer', right: 'Correct', some: (n: number, m: number) => `${n} of ${m} correct`, help: 'Sub/superscripts: type _ or ^ (H_2O → H₂O, Fe^3+ → Fe³⁺)' },
  id: { check: 'Periksa', retry: 'Coba lagi', saved: 'Jawaban tersimpan', unsaved: 'Belum dijawab', expected: 'Jawaban yang diterima', right: 'Benar', some: (n: number, m: number) => `${n} dari ${m} benar`, help: 'Subskrip/superskrip: ketik _ atau ^ (H_2O → H₂O, Fe^3+ → Fe³⁺)' },
}
function BlankInput({ value, onChange, state, disabled, placeholder, label, unit, wide, onEnter }: {
  value: string; onChange: (v: string) => void; state: 'ok' | 'err' | null; disabled?: boolean; placeholder?: string; label: string; unit?: string; wide?: boolean; onEnter?: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const { mode, onKeyDown } = useScriptTyping(ref, onChange)
  return (
    <label className={'pq-blank' + (wide ? ' wide' : '') + (state ? ' ' + state : '') + (mode ? ' scr-on' : '')}>
      <span className="pq-blank-l"><Md inline>{label}</Md></span>
      <span className="pq-blank-in">
        <input ref={ref} value={value} disabled={disabled} placeholder={placeholder} aria-label={label} autoComplete="off" spellCheck={false}
          onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter() } else onKeyDown(e) }} />
        {unit && <span className="unit">{unit}</span>}
        {state === 'ok' && <IconCheckFill size={18} className="pq-blank-ic ok" />}
        {state === 'err' && <IconXFill size={18} className="pq-blank-ic err" />}
      </span>
    </label>
  )
}
function ShortView({ q, mode, initial, onSubmit, onNext, nextLabel, lang }: Props & { q: ShortQ; lang: 'en' | 'id' }) {
  const t = ST[lang]
  const init = initial?.answer.k === 'short' ? initial.answer.vals : q.blanks.map(() => '')
  const [vals, setVals] = useState<string[]>(init)
  const [done, setDone] = useState(mode === 'review')
  const [tries, setTries] = useState(0)
  const review = mode === 'review', learn = mode === 'learn'
  const oks = q.blanks.map((b, i) => blankOk(b, vals[i] ?? ''))
  const nOk = oks.filter(Boolean).length
  const all = nOk === q.blanks.length
  const set = (i: number, v: string) => {
    const next = vals.map((x, j) => (j === i ? v : x)); setVals(next)
    if (mode === 'test') { const n = q.blanks.filter((b, j) => blankOk(b, next[j] ?? '')).length; onSubmit({ correct: n === q.blanks.length, score: n / q.blanks.length, answer: { k: 'short', vals: next } }) }
  }
  const check = () => {
    if (done || vals.every((v) => !v.trim())) return
    setDone(true)
    if (tries === 0) onSubmit({ correct: all, score: nOk / q.blanks.length, answer: { k: 'short', vals } }) // first attempt is the one that counts
    setTries((n) => n + 1)
  }
  const showFb = review || (learn && done)
  const notes: Note[] = showFb ? q.blanks.flatMap((b, i) => {
    if (oks[i]) return []
    const why = blankWhy(b, vals[i] ?? '')
    const lab = b.label.replace(/\*\*/g, '')
    const reveal = review || tries >= 2
    return [{ level: 'err' as const, msg: `**${lab}:** ${why ? why + ' ' : reveal ? '' : (lang === 'id' ? 'Belum tepat. ' : 'Not accepted yet. ')}${reveal ? `${t.expected}: ${b.accept[0]}${b.unit ? ' ' + b.unit : ''}.` : ''}` }]
  }) : []
  useKeys((e) => { if (e.key === 'Enter' && showFb && onNext && !review) { e.preventDefault(); onNext() } })
  const wide = q.blanks.length === 1 || q.blanks.some((b) => b.type === 'config' || b.type === 'equation')
  return (
    <>
      <div className={'pq-blanks' + (wide ? ' wide' : '')}>
        {q.blanks.map((b, i) => (
          <BlankInput key={i} label={b.label} value={vals[i] ?? ''} onChange={(v) => set(i, v)} unit={b.unit} wide={wide}
            placeholder={b.placeholder ?? (b.type === 'config' ? '[Ar] 4s^2 3d^6' : b.type === 'equation' ? 'Se^3+(g) → Se^4+(g) + e^-' : b.type === 'formula' ? 'SO_4^2-' : '')}
            state={showFb ? (oks[i] ? 'ok' : 'err') : null} disabled={review || (learn && done)} onEnter={learn ? check : undefined} />
        ))}
      </div>
      <p className="pq-blank-help muted">{t.help}</p>
      {learn && !done && <div className="pq-actions"><button className="btn primary" disabled={vals.every((v) => !v.trim())} onClick={check}>{t.check} <kbd>↵</kbd></button></div>}
      {learn && done && !all && tries < 2 && <div className="pq-actions"><button className="btn sm" onClick={() => setDone(false)}>{t.retry}</button><span className="muted pr-small">{lang === 'id' ? 'Pembahasan muncul setelah percobaan kedua. Butuh bantuan? Pakai petunjuk di atas.' : 'The worked solution appears after a second try. Stuck? Use the hints above.'}</span></div>}
      {mode === 'test' && <div className="pq-actions"><span className={'chip' + (vals.some((v) => v.trim()) ? ' ok' : '')}>{vals.some((v) => v.trim()) ? t.saved : t.unsaved}</span></div>}
      {showFb && <Resolution q={q} ok={all} title={all ? t.right : t.some(nOk, q.blanks.length)} skipped={!all && nOk > 0} notes={notes} hideExpl={!review && !all && tries < 2} onNext={review ? undefined : onNext} nextLabel={nextLabel} />}
    </>
  )
}

/* ---------- ordering: tap items into sequence; ↑/↓/× buttons (keyboard + screen-reader friendly) ---------- */
const RT = {
  en: { pool: 'Tap in order, starting with the', first: 'first', placed: 'Your order', check: 'Check order', reset: 'Clear', up: 'Move up', down: 'Move down', remove: 'Remove', right: 'Correct order', wrong: 'Not quite', expected: 'Correct order', retry: 'Try again', saved: 'Answer saved', unsaved: 'Not answered' },
  id: { pool: 'Ketuk berurutan, mulai dari yang', first: 'pertama', placed: 'Urutanmu', check: 'Periksa urutan', reset: 'Hapus', up: 'Naik', down: 'Turun', remove: 'Hapus', right: 'Urutan benar', wrong: 'Belum tepat', expected: 'Urutan benar', retry: 'Coba lagi', saved: 'Jawaban tersimpan', unsaved: 'Belum dijawab' },
}
function OrderView({ q, mode, initial, onSubmit, onNext, nextLabel, lang }: Props & { q: OrderQ; lang: 'en' | 'id' }) {
  const t = RT[lang]
  const [seq, setSeq] = useState<number[]>(initial?.answer.k === 'order' ? initial.answer.seq : [])
  const [done, setDone] = useState(mode === 'review')
  const [tries, setTries] = useState(0)
  const review = mode === 'review', learn = mode === 'learn'
  const locked = review || (learn && done)
  const ok = orderOk(q, seq)
  const update = (next: number[]) => {
    setSeq(next)
    if (mode === 'test' && next.length === q.items.length) onSubmit({ correct: orderOk(q, next), score: orderOk(q, next) ? 1 : 0, answer: { k: 'order', seq: next } })
  }
  const move = (k: number, d: number) => { const n = [...seq]; const j = k + d; if (j < 0 || j >= n.length) return; [n[k], n[j]] = [n[j], n[k]]; update(n) }
  const check = () => { if (seq.length !== q.items.length || done) return; setDone(true); if (tries === 0) onSubmit({ correct: ok, score: ok ? 1 : 0, answer: { k: 'order', seq } }); setTries((n) => n + 1) }
  const showFb = review || (learn && done)
  useKeys((e) => { if (e.key === 'Enter' && showFb && onNext && !review) { e.preventDefault(); onNext() } })
  const pool = q.items.map((_, i) => i).filter((i) => !seq.includes(i))
  return (
    <>
      <div className="pq-ord">
        <div className="pq-ord-ends"><span>{q.ends[0]}</span><span className="pq-ord-arrow" aria-hidden /><span>{q.ends[1]}</span></div>
        <ol className="pq-ord-seq" aria-label={t.placed}>
          {seq.map((it, k) => {
            const tie = (x: number) => q.ties?.findIndex((g) => g.includes(x)) ?? -1
            const right = showFb && (q.answer[k] === it || (tie(it) >= 0 && tie(it) === tie(q.answer[k])))
            return (
              <li key={it} className={'pq-ord-chip placed' + (showFb ? (right ? ' ok' : ' err') : '')}>
                <span className="pq-ord-n">{k + 1}</span><Md inline>{q.items[it]}</Md>
                {!locked && <span className="pq-ord-ctl">
                  <button onClick={() => move(k, -1)} disabled={k === 0} aria-label={`${t.up}: ${q.items[it]}`}>↑</button>
                  <button onClick={() => move(k, 1)} disabled={k === seq.length - 1} aria-label={`${t.down}: ${q.items[it]}`}>↓</button>
                  <button onClick={() => update(seq.filter((x) => x !== it))} aria-label={`${t.remove}: ${q.items[it]}`}>×</button>
                </span>}
              </li>
            )
          })}
          {Array.from({ length: q.items.length - seq.length }, (_, k) => <li key={'e' + k} className="pq-ord-slot" aria-hidden>{seq.length + k + 1}</li>)}
        </ol>
        {!locked && pool.length > 0 && (
          <div className="pq-ord-pool">
            <span className="muted pr-small">{t.pool} <b>{q.ends[0]}</b>:</span>
            {pool.map((i) => <button key={i} className="pq-ord-chip" onClick={() => update([...seq, i])}><Md inline>{q.items[i]}</Md></button>)}
          </div>
        )}
      </div>
      {learn && !done && <div className="pq-actions"><button className="btn primary" disabled={seq.length !== q.items.length} onClick={check}>{t.check}</button>{seq.length > 0 && <button className="btn sm ghost" onClick={() => update([])}>{t.reset}</button>}</div>}
      {learn && done && !ok && tries < 2 && <div className="pq-actions"><button className="btn sm" onClick={() => setDone(false)}>{t.retry}</button><span className="muted pr-small">{lang === 'id' ? 'Pembahasan muncul setelah percobaan kedua.' : 'The worked solution appears after a second try.'}</span></div>}
      {mode === 'test' && <div className="pq-actions"><span className={'chip' + (seq.length === q.items.length ? ' ok' : '')}>{seq.length === q.items.length ? t.saved : t.unsaved}</span></div>}
      {showFb && <Resolution q={q} ok={ok} hideExpl={!review && !ok && tries < 2} title={ok ? t.right : t.wrong} detail={ok || (!review && tries < 2) ? undefined : `${t.expected}: ${q.answer.map((i) => q.items[i]).join(' < ')}`} onNext={review ? undefined : onNext} nextLabel={nextLabel} />}
    </>
  )
}

/* ---------- shared resolution block ---------- */
function Resolution({ q, ok, title, detail, onNext, nextLabel, notes, skipped, hideExpl }: {
  q: Question; ok: boolean; title: string; detail?: string; onNext?: () => void; nextLabel?: string; notes?: Note[]; skipped?: boolean; hideExpl?: boolean
}) {
  const store = usePStore()
  const flagged = store.flagged.includes(q.id)
  return (
    <div className="pq-res">
      <Verdict correct={skipped ? 'partial' : ok} title={title}>{detail && <Md>{detail}</Md>}</Verdict>
      {notes && <Feedback notes={notes} />}
      {!hideExpl && <div className="pq-expl"><h4>Explanation</h4><Md>{q.explanation}</Md></div>}
      <div className="pq-foot">
        {!!q.slides?.length && <span className="refs">Slides: {q.slides.map((s) => <SlideRef key={s} l={q.lecture} s={s} />)}</span>}
        <span className="grow" />
        <button className={'btn sm' + (flagged ? ' on' : '')} onClick={() => toggleFlag(q.id)} title="Mark to revisit later">{flagged ? '⚑ Flagged' : '⚐ Flag for review'}</button>
        {onNext && <button className="btn primary" onClick={onNext}>{nextLabel ?? 'Next'} <kbd>↵</kbd></button>}
      </div>
    </div>
  )
}

/** Set to false where several questions share a page (past papers), so global shortcuts don't hit every question. */
export const KeysCtx = createContext(true)
function useKeys(handler: (e: KeyboardEvent) => void) {
  const ref = useRef(handler); ref.current = handler
  const on = useContext(KeysCtx)
  useEffect(() => {
    if (!on) return
    const f = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      ref.current(e)
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [on])
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
              {showFb && right && <span className="pq-mark ok"><IconCheckFill size={20} /></span>}
              {showFb && picked && !right && <span className="pq-mark err"><IconXFill size={20} /></span>}
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
