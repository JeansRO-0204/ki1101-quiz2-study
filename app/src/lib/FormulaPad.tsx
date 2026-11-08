// Tap-to-build chemical formula field: pick elements, step subscripts and the charge, instead of typing "SO4^2-".
// Value uses the same plain syntax the checkers already accept (e.g. "SO4^2-", "Be^3+", "NH4^+").
import { useEffect, useMemo, useState } from 'react'
import { ELEMENTS } from './chem/elements'
import './formulapad.css'

interface Tok { sym: string; n: number }
interface Parsed { toks: Tok[]; charge: number; ok: boolean }

export function parseFormula(v: string): Parsed {
  const s = v.trim()
  if (!s) return { toks: [], charge: 0, ok: true }
  const m = s.match(/^([A-Za-z\d]*?)(?:\^?(\d*)([+\-−]))?$/)
  if (!m) return { toks: [], charge: 0, ok: false }
  const body = m[1]
  const toks: Tok[] = []
  let i = 0
  const re = /([A-Z][a-z]?)(\d*)/y
  while (i < body.length) {
    re.lastIndex = i
    const t = re.exec(body)
    if (!t) return { toks: [], charge: 0, ok: false }
    toks.push({ sym: t[1], n: t[2] ? parseInt(t[2], 10) : 1 })
    i = re.lastIndex
  }
  const mag = m[3] ? (m[2] ? parseInt(m[2], 10) : 1) : 0
  return { toks, charge: m[3] === '+' ? mag : m[3] ? -mag : 0, ok: true }
}

export function buildFormula(toks: Tok[], charge: number): string {
  const body = toks.map((t) => t.sym + (t.n > 1 ? t.n : '')).join('')
  if (!charge) return body
  const mag = Math.abs(charge)
  return `${body}^${mag > 1 ? mag : ''}${charge > 0 ? '+' : '-'}`
}

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const supNum = (n: number) => String(n).split('').map((d) => SUP[+d]).join('')
export const chargeText = (c: number) => (c === 0 ? '0' : `${Math.abs(c) > 1 ? supNum(Math.abs(c)) : ''}${c > 0 ? '⁺' : '⁻'}`)

/** Default palette: elements you meet in the course, in atomic-number order. */
export const COMMON_ELEMENTS = ['H', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca', 'Br', 'I', 'Xe']
/** Element symbols used in a list of formulas, sorted by atomic number. */
export function elementsIn(formulas: string[]): string[] {
  const z = new Map(ELEMENTS.map((e) => [e.symbol, e.z]))
  return [...new Set(formulas.flatMap((f) => f.split('^')[0].match(/[A-Z][a-z]?/g) ?? []))].sort((a, b) => (z.get(a) ?? 99) - (z.get(b) ?? 99))
}

export default function FormulaPad({ value, onChange, elements = COMMON_ELEMENTS, disabled, compact, label = 'Formula' }: {
  value: string; onChange: (v: string) => void; elements?: string[]; disabled?: boolean; compact?: boolean; label?: string
}) {
  const parsed = useMemo(() => parseFormula(value), [value])
  const [sel, setSel] = useState<number | null>(null)
  useEffect(() => { if (sel != null && sel >= parsed.toks.length) setSel(null) }, [parsed.toks.length, sel])
  const els = useMemo(() => [...new Set(elements)], [elements])
  const { toks, charge } = parsed
  const set = (t: Tok[], c = charge) => onChange(buildFormula(t, c))
  const add = (sym: string) => {
    const at = sel ?? toks.length - 1
    if (toks[at]?.sym === sym) { const t = toks.map((x, i) => (i === at ? { ...x, n: x.n + 1 } : x)); set(t); setSel(at); return }
    set([...toks, { sym, n: 1 }]); setSel(toks.length)
  }
  const step = (d: number) => {
    const at = sel ?? toks.length - 1
    if (at < 0) return
    const n = toks[at].n + d
    if (n < 1) { set(toks.filter((_, i) => i !== at)); setSel(null) } else set(toks.map((x, i) => (i === at ? { ...x, n } : x)))
  }
  const back = () => { if (charge) set(toks, 0); else if (toks.length) { set(toks.slice(0, -1)); setSel(null) } }
  const cur = sel ?? toks.length - 1
  return (
    <div className={'fp' + (compact ? ' compact' : '') + (disabled ? ' off' : '')} role="group" aria-label={label}>
      <div className="fp-out" aria-live="polite">
        {!parsed.ok && <span className="fp-raw">{value}</span>}
        {parsed.ok && !toks.length && <span className="fp-ph">Tap elements below</span>}
        {parsed.ok && toks.map((t, i) => (
          <button key={i} type="button" className={'fp-tok' + (i === cur ? ' sel' : '')} disabled={disabled} onClick={() => setSel(i)} aria-label={`${t.sym} ${t.n}`}>
            {t.sym}{t.n > 1 && <sub>{t.n}</sub>}
          </button>
        ))}
        {parsed.ok && charge !== 0 && <sup className="fp-chg">{chargeText(charge)}</sup>}
        <span className="grow" />
        <button type="button" className="fp-ic" onClick={back} disabled={disabled || !value} aria-label="Delete last" title="Delete last">⌫</button>
        <button type="button" className="fp-ic" onClick={() => { onChange(''); setSel(null) }} disabled={disabled || !value} aria-label="Clear" title="Clear">✕</button>
      </div>
      <div className="fp-els">
        {els.map((s) => <button key={s} type="button" className="fp-el" disabled={disabled} onClick={() => add(s)}>{s}</button>)}
      </div>
      <div className="fp-ctl">
        <span className="fp-lab">Subscript{cur >= 0 && toks[cur] ? <> of <b>{toks[cur].sym}</b></> : ''}</span>
        <button type="button" className="fp-step" disabled={disabled || cur < 0 || !toks[cur]} onClick={() => step(-1)} aria-label="Decrease subscript">−</button>
        <b className="fp-val">{toks[cur]?.n ?? '–'}</b>
        <button type="button" className="fp-step" disabled={disabled || cur < 0 || !toks[cur]} onClick={() => step(1)} aria-label="Increase subscript">+</button>
        <span className="fp-sep" />
        <span className="fp-lab">Charge</span>
        <button type="button" className="fp-step" disabled={disabled || !toks.length} onClick={() => set(toks, charge - 1)} aria-label="Decrease charge">−</button>
        <b className="fp-val">{chargeText(charge)}</b>
        <button type="button" className="fp-step" disabled={disabled || !toks.length} onClick={() => set(toks, charge + 1)} aria-label="Increase charge">+</button>
      </div>
    </div>
  )
}
