import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Mode, WidgetResult } from '../../types'
import type { Note, StepStatus } from '../../lib/kit'
import { Formula } from '../../lib/kit'
import { SPECIES, findSpecies, analyze } from './species'
import './l10.css'

export interface StepResult { ok: boolean; notes: Note[] }

/** Step-by-step checking logic shared by the L10 workbenches (Learn: unlock one by one; Test: one final Check). */
export function useStepper(mode: Mode, n: number, evalStep: (i: number) => StepResult) {
  const [res, setRes] = useState<(StepResult | null)[]>(() => Array(n).fill(null))
  const [mistakes, setMistakes] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const ev = useRef(evalStep)
  ev.current = evalStep
  const firstErr = useRef('')
  const noteErr = (r: StepResult) => { if (!r.ok && !firstErr.current) firstErr.current = (r.notes.find((x) => x.level === 'err')?.msg ?? '').replace(/[*_`$]/g, '') }

  const reset = useCallback(() => { setRes(Array(n).fill(null)); setMistakes(0); setSubmitted(false); firstErr.current = '' }, [n])
  const first = useRef(true)
  useEffect(() => { if (first.current) { first.current = false; return } reset() }, [mode, reset])

  const check = (i: number) => {
    const r = ev.current(i)
    setRes((p) => p.map((x, k) => (k === i ? r : x)))
    noteErr(r)
    if (!r.ok) setMistakes((m) => m + 1)
    return r
  }
  const checkAll = () => {
    const all = Array.from({ length: n }, (_, i) => ev.current(i))
    setRes(all)
    all.forEach(noteErr)
    setMistakes((m) => m + all.filter((r) => !r.ok).length)
    setSubmitted(true)
    return all
  }
  const status = (i: number): StepStatus => {
    if (mode === 'learn') {
      if (i > 0 && !res[i - 1]?.ok) return 'locked'
      const r = res[i]
      return r ? (r.ok ? 'done' : 'error') : 'active'
    }
    const r = submitted ? res[i] : null
    return r ? (r.ok ? 'done' : 'error') : 'active'
  }
  const allOk = res.every((r) => r?.ok)
  const finished = mode === 'learn' ? allOk : submitted
  /** inputs are frozen once a learn-mode step is passed, or after a test-mode submit */
  const frozen = (i: number) => (mode === 'learn' ? !!res[i]?.ok : submitted)
  return { res, status, notes: (i: number) => res[i]?.notes ?? [], check, checkAll, reset, mistakes, firstErr, submitted, allOk, finished, frozen }
}

/** Calls onResult exactly once when `finished` first becomes true. */
export function useReportOnce(finished: boolean, onResult: ((r: WidgetResult) => void) | undefined, build: () => WidgetResult) {
  const done = useRef(false)
  const b = useRef(build)
  b.current = build
  useEffect(() => {
    if (finished && !done.current && onResult) { done.current = true; onResult(b.current()) }
  }, [finished, onResult])
}

export function Axe({ nb, lp }: { nb: number; lp: number }) {
  return <span className="l10-axe">AX<sub>{nb}</sub>{lp > 0 && <>E{lp > 1 && <sub>{lp}</sub>}</>}</span>
}

/** Species dropdown (grouped by number of domains) plus free-text entry validated against the curated list. */
export function SpeciesPicker({ value, onChange, disabled, filter }: { value: string; onChange: (id: string) => void; disabled?: boolean; filter?: (id: string) => boolean }) {
  const [txt, setTxt] = useState('')
  const [bad, setBad] = useState(false)
  const list = SPECIES.filter((s) => !filter || filter(s.id))
  const groups = new Map<number, typeof list>()
  list.forEach((s) => { const d = analyze(s).dom; groups.set(d, [...(groups.get(d) ?? []), s]) })
  const submit = () => {
    if (!txt.trim()) return
    const s = findSpecies(txt.trim())
    if (s && (!filter || filter(s.id))) { onChange(s.id); setTxt(''); setBad(false) } else setBad(true)
  }
  return (
    <div className="row l10-pick">
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-label="Species">
        {[...groups].sort((a, b) => a[0] - b[0]).map(([d, ss]) => (
          <optgroup key={d} label={`${d} electron domains`}>
            {ss.map((s) => <option key={s.id} value={s.id}>{unicodeFormula(s.id)} — {s.name}</option>)}
          </optgroup>
        ))}
      </select>
      {!disabled && (
        <span className="row" style={{ gap: 6 }}>
          <input className="field l10-type" placeholder="or type e.g. SO4^2-" value={txt} onChange={(e) => { setTxt(e.target.value); setBad(false) }} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          <button className="btn sm" onClick={submit}>Go</button>
          {bad && <span className="chip err">not in the list</span>}
        </span>
      )}
    </div>
  )
}
const SUBS = '₀₁₂₃₄₅₆₇₈₉'
const SUPS: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '+': '⁺', '-': '⁻' }
export function unicodeFormula(id: string) {
  const [b, c] = id.split('^')
  return b.replace(/\d/g, (d) => SUBS[Number(d)]) + (c ? c.replace(/[0-9+-]/g, (x) => SUPS[x] ?? x) : '')
}

export function SpeciesTitle({ id }: { id: string }) {
  return <Formula f={id} />
}

export function Pill({ children, tone }: { children: ReactNode; tone?: 'ok' | 'err' | 'warn' }) {
  return <span className={'chip ' + (tone ?? '')}>{children}</span>
}

/** Row of option buttons (single choice). */
export function Choice<T extends string>({ options, value, onChange, disabled, state }: {
  options: { id: T; label: ReactNode }[]; value: T | ''; onChange: (v: T) => void; disabled?: boolean; state?: 'ok' | 'err' | null
}) {
  return (
    <div className={'l10-choice ' + (state ?? '')}>
      {options.map((o) => (
        <button key={o.id} type="button" disabled={disabled} className={'l10-opt' + (value === o.id ? ' on' : '')} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  )
}
