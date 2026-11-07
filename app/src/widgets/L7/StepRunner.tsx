// Generic "interactive working" step engine used by all L7 widgets.
// Learn mode: steps unlock one by one and are checked immediately. Test mode: all open, one Check at the end.
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Step, Feedback, Verdict, NumInput, Tex, parseNum, within, sci, type Note, type StepStatus } from '../../lib/kit'
import type { Mode, WidgetResult } from '../../types'

type Tol = { rel?: number; abs?: number }
interface Base { id: string; title: ReactNode; hint?: string }
export interface NumStep extends Base {
  kind: 'num'; unit?: ReactNode; formula?: string; answer: number; tol?: Tol
  /** extra diagnoses for specific wrong values; return a message or null */
  extra?: (v: number) => string | null
  explain?: string; placeholder?: string; prompt?: ReactNode
}
export interface ChoiceStep extends Base {
  kind: 'choice'; options: { value: string; label: ReactNode }[]; answer: string
  wrong?: Record<string, string>; explain?: string; prompt?: ReactNode
}
export interface CustomStep extends Base {
  kind: 'custom'; render: () => ReactNode; check: () => { ok: boolean; notes: Note[] }
  live?: () => Note[]; explain?: string
}
export type StepDef = NumStep | ChoiceStep | CustomStep

interface R { status: 'idle' | 'ok' | 'err'; notes: Note[]; tries: number; firstOk: boolean; revealed?: boolean; firstErr?: string }

/** Detects typical order-of-magnitude / N_A / sign slips. */
export function ratioHint(v: number, ans: number): string | null {
  if (!Number.isFinite(v) || v === 0 || ans === 0) return null
  if (v * ans < 0 && within(-v, ans, { rel: 0.03 })) return 'The magnitude is right but the **sign** is wrong.'
  const r = Math.abs(v / ans)
  const NA = 6.022e23
  if (within(r, NA, { rel: 0.03 })) return 'Off by a factor of $N_A$ (6.022×10²³): per photon vs per mole mix-up. Per mole = per photon × $N_A$; per photon = per mole ÷ $N_A$.'
  if (within(r, 1 / NA, { rel: 0.03 })) return 'Off by a factor of 1/$N_A$: per photon vs per mole mix-up. Per mole = per photon × $N_A$; per photon = per mole ÷ $N_A$.'
  const k = Math.round(Math.log10(r))
  if (k !== 0 && Math.abs(k) <= 12 && within(r, 10 ** k, { rel: 0.03 })) {
    const hints: Record<number, string> = {
      9: 'nm used without converting: 1 nm = 10⁻⁹ m, so convert to metres before using $c=\\lambda\\nu$ (your value is 10⁹ too large, probably a number in nm).',
      [-9]: 'Your value is 10⁹ too small: the answer comes out in metres, but it should be in nm (× 10⁹), or you forgot a 10⁻⁹ in the other direction.',
      12: 'Off by 10¹²: pm ↔ m (1 pm = 10⁻¹² m).', [-12]: 'Off by 10⁻¹²: pm ↔ m (1 pm = 10⁻¹² m).',
      6: 'Off by 10⁶: check μm/MHz prefixes (1 μm = 10⁻⁶ m, 1 MHz = 10⁶ Hz).', [-6]: 'Off by 10⁻⁶: check μm/MHz prefixes (1 μm = 10⁻⁶ m, 1 MHz = 10⁶ Hz).',
      3: 'Off by 10³: J vs kJ (1 kJ = 1000 J), or mm vs m.', [-3]: 'Off by 10⁻³: J vs kJ (1 kJ = 1000 J), or mm vs m.',
      2: 'Off by 100: cm vs m (1 m = 100 cm).', [-2]: 'Off by 100: cm vs m (1 m = 100 cm).',
      10: 'Off by 10¹⁰: Å or unit slip.', [-10]: 'Off by 10⁻¹⁰: Å or unit slip.',
    }
    return hints[k] ?? `Off by exactly 10^${k}: check the exponent or a unit prefix.`
  }
  if (within(r, 2 * Math.PI, { rel: 0.03 }) || within(r, 1 / (2 * Math.PI), { rel: 0.03 })) return 'Off by 2π, which does not belong here (that is for angular frequency).'
  if (within(r, 2, { rel: 0.03 }) || within(r, 0.5, { rel: 0.03 })) return 'Off by a factor of 2: re-check the formula.'
  return null
}

const stripMd = (s: string) => s.replace(/\$/g, '').replace(/\*\*/g, '')

export function StepRunner({ steps, mode, resetKey, final, onFinal, doneTitle = 'All steps correct' }: {
  steps: StepDef[]; mode: Mode; resetKey?: string | number
  /** task mode: show an explicit final Check/Submit button and report once via onFinal */
  final?: boolean; onFinal?: (r: WidgetResult) => void; doneTitle?: string
}) {
  const [ans, setAns] = useState<Record<string, string>>({})
  const [res, setRes] = useState<Record<string, R>>({})
  const [submitted, setSubmitted] = useState(false)
  const [hintOn, setHintOn] = useState<Record<string, boolean>>({})
  const fired = useRef(false)
  useEffect(() => { setAns({}); setRes({}); setSubmitted(false); setHintOn({}); fired.current = false }, [resetKey])

  const evaluate = (s: StepDef): { ok: boolean; notes: Note[] } => {
    if (s.kind === 'custom') return s.check()
    if (s.kind === 'choice') {
      const v = ans[s.id]
      if (!v) return { ok: false, notes: [{ level: 'warn', msg: 'Pick an option first.' }] }
      if (v === s.answer) return { ok: true, notes: s.explain ? [{ level: 'ok', msg: s.explain }] : [{ level: 'ok', msg: 'Correct.' }] }
      const notes: Note[] = [{ level: 'err', msg: s.wrong?.[v] ?? 'Not quite.' }]
      if (s.hint) notes.push({ level: 'hint', msg: s.hint })
      return { ok: false, notes }
    }
    const raw = ans[s.id] ?? ''
    const v = parseNum(raw)
    if (Number.isNaN(v)) return { ok: false, notes: [{ level: 'warn', msg: raw.trim() ? 'I can’t read that number. Use e.g. `4.86e-7` or `4.86 x 10^-7`.' : 'Enter a number first.' }] }
    if (within(v, s.answer, s.tol ?? { rel: 0.02 })) {
      return { ok: true, notes: [{ level: 'ok', msg: s.explain ?? `Correct: ${sci(s.answer)}.` }] }
    }
    const msg = s.extra?.(v) ?? ratioHint(v, s.answer)
    const notes: Note[] = [{ level: 'err', msg: msg ?? `Not matching (you entered ${sci(v)}). Re-check the formula and your arithmetic.` }]
    if (s.hint) notes.push({ level: 'hint', msg: s.hint })
    return { ok: false, notes }
  }

  const record = (s: StepDef, e: { ok: boolean; notes: Note[] }, prev?: R): R => ({
    status: e.ok ? 'ok' : 'err', notes: e.notes, tries: (prev?.tries ?? 0) + 1,
    firstOk: prev ? prev.firstOk : e.ok, revealed: prev?.revealed,
    firstErr: prev?.firstErr ?? (e.ok ? undefined : stripMd(e.notes[0]?.msg ?? '')),
  })
  const checkOne = (s: StepDef) => {
    const e = evaluate(s)
    setRes((r) => ({ ...r, [s.id]: record(s, e, r[s.id]) }))
  }
  const reveal = (s: NumStep | ChoiceStep) => {
    setAns((a) => ({ ...a, [s.id]: s.kind === 'num' ? sci(s.answer, 3) : s.answer }))
    setRes((r) => ({ ...r, [s.id]: { status: 'ok', tries: (r[s.id]?.tries ?? 0), firstOk: false, revealed: true, firstErr: r[s.id]?.firstErr, notes: [{ level: 'info', msg: 'Answer revealed. ' + (s.explain ?? '') }] } }))
  }

  const allOk = steps.every((s) => res[s.id]?.status === 'ok')
  const summarize = (finalRes: Record<string, R>): WidgetResult => {
    const total = steps.length
    const firstTry = steps.filter((s) => finalRes[s.id]?.firstOk && finalRes[s.id]?.status === 'ok' && !finalRes[s.id]?.revealed).length
    const correct = steps.every((s) => finalRes[s.id]?.status === 'ok' && !finalRes[s.id]?.revealed)
    const bad = steps.find((s) => finalRes[s.id]?.firstErr)
    return { correct, score: total ? firstTry / total : 0, summary: correct && firstTry === total ? doneTitle : (bad ? stripMd(finalRes[bad.id]!.firstErr!).slice(0, 140) : 'Some steps not completed') }
  }
  const submit = (next: Record<string, R>) => {
    setSubmitted(true)
    if (!fired.current) { fired.current = true; onFinal?.(summarize(next)) }
  }
  const checkAll = () => {
    const next: Record<string, R> = {}
    for (const s of steps) next[s.id] = record(s, evaluate(s), res[s.id])
    setRes(next)
    submit(next)
  }

  const learn = mode === 'learn'
  const firstOpen = steps.findIndex((s) => res[s.id]?.status !== 'ok')
  const status = (i: number): StepStatus => {
    const r = res[steps[i].id]
    if (r?.status === 'ok') return 'done'
    if (learn && firstOpen !== -1 && i > firstOpen) return 'locked'
    if (r?.status === 'err') return 'error'
    return 'active'
  }

  const result = submitted || (learn && allOk && !final) ? summarize(res) : null
  const showNotes = (s: StepDef, st: StepStatus): Note[] => {
    const r = res[s.id]
    const out: Note[] = []
    if (s.kind === 'custom' && learn && st === 'active' && s.live) out.push(...s.live())
    if (r) out.push(...r.notes)
    if (hintOn[s.id] && s.hint) out.push({ level: 'hint', msg: s.hint })
    return out
  }

  return (
    <div className="l7-steps">
      {steps.map((s, i) => {
        const st = status(i)
        const r = res[s.id]
        const locked = st === 'done' && learn
        return (
          <Step key={s.id} n={i + 1} title={s.title} status={st} notes={showNotes(s, st)}>
            {s.kind === 'num' && (
              <>
                {s.prompt && <div className="l7-prompt">{s.prompt}</div>}
                {s.formula && <div className="l7-formula"><Tex>{s.formula}</Tex></div>}
                <div className="row">
                  <NumInput value={ans[s.id] ?? ''} onChange={(v) => setAns((a) => ({ ...a, [s.id]: v }))} unit={s.unit} placeholder={s.placeholder}
                    state={r?.status === 'ok' ? 'ok' : r?.status === 'err' ? 'err' : null} disabled={locked} />
                  {learn && !locked && <button className="btn primary sm" onClick={() => checkOne(s)}>Check</button>}
                  {s.hint && !locked && <button className="btn ghost sm" onClick={() => setHintOn((h) => ({ ...h, [s.id]: !h[s.id] }))}>Hint</button>}
                  {learn && !locked && (r?.tries ?? 0) >= 3 && <button className="btn ghost sm" onClick={() => reveal(s)}>Show answer</button>}
                </div>
              </>
            )}
            {s.kind === 'choice' && (
              <>
                {s.prompt && <div className="l7-prompt">{s.prompt}</div>}
                <div className="l7-choices">
                  {s.options.map((o) => (
                    <button key={o.value} disabled={locked} className={'btn sm' + (ans[s.id] === o.value ? ' on' : '')} onClick={() => setAns((a) => ({ ...a, [s.id]: o.value }))}>{o.label}</button>
                  ))}
                </div>
                <div className="row" style={{ marginTop: 8 }}>
                  {learn && !locked && <button className="btn primary sm" onClick={() => checkOne(s)}>Check</button>}
                  {s.hint && !locked && <button className="btn ghost sm" onClick={() => setHintOn((h) => ({ ...h, [s.id]: !h[s.id] }))}>Hint</button>}
                  {learn && !locked && (r?.tries ?? 0) >= 3 && <button className="btn ghost sm" onClick={() => reveal(s)}>Show answer</button>}
                </div>
              </>
            )}
            {s.kind === 'custom' && (
              <>
                {s.render()}
                <div className="row" style={{ marginTop: 8 }}>
                  {learn && st !== 'done' && <button className="btn primary sm" onClick={() => checkOne(s)}>Check</button>}
                  {s.hint && st !== 'done' && <button className="btn ghost sm" onClick={() => setHintOn((h) => ({ ...h, [s.id]: !h[s.id] }))}>Hint</button>}
                </div>
              </>
            )}
          </Step>
        )
      })}
      {!learn && <div className="row"><button className="btn primary" onClick={checkAll}>Check all answers</button>
        {submitted && <small className="muted">Edit and check again to see the updated report (the first result is what was recorded).</small>}</div>}
      {learn && final && allOk && !submitted && <button className="btn primary" onClick={() => submit(res)}>Submit answer</button>}
      {result && (
        <Verdict correct={result.correct ? true : result.score && result.score > 0.5 ? 'partial' : false} title={result.correct ? doneTitle : 'Not all steps correct'}>
          {result.score !== undefined && <span>{Math.round(result.score * steps.length)} / {steps.length} steps right first time.</span>}
          {!result.correct && !learn && <span>Fix the red steps above using the diagnoses, then check again.</span>}
        </Verdict>
      )}
    </div>
  )
}
