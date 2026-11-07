// Shared UI kit for the "interactive working" workbenches. Widgets compose these; styles live in styles.css (.wb-*).
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import katex from 'katex'
import type { LectureId, Mode } from '../types'
import { IconCheck, IconChevronLeft, IconChevronRight, LEVEL_ICON } from './icons'

/** Id of the Workspace panel a component is rendered in (null outside the Workspace). */
export const PanelIdCtx = createContext<string | null>(null)

/* ---------- persistence ---------- */
export function useLocalState<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void] {
  const [v, setV] = useState<T>(() => {
    try { const s = localStorage.getItem(key); if (s != null) return JSON.parse(s) as T } catch { /* ignore */ }
    return init
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* ignore */ } }, [key, v])
  return [v, setV]
}

/* ---------- text ---------- */
/** Markdown with GFM tables and KaTeX math ($x$, $$x$$). */
export function Md({ children, inline }: { children: string; inline?: boolean }) {
  return (
    <div className={inline ? 'md md-inline' : 'md'}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{children}</ReactMarkdown>
    </div>
  )
}
/** Inline TeX, e.g. <Tex>{'E = h\\nu'}</Tex>. Use for formulas inside widgets. */
export function Tex({ children, block }: { children: string; block?: boolean }) {
  const html = katex.renderToString(children, { throwOnError: false, displayMode: !!block })
  return <span className={block ? 'tex tex-block' : 'tex'} dangerouslySetInnerHTML={{ __html: html }} />
}
/** Chemical formula with sub/superscripts: "SO4^2-" → SO₄²⁻, "NO3^-", "H2O", "Fe^3+". */
export function Formula({ f }: { f: string }) {
  const [base, charge] = f.split('^')
  const parts = base.split(/(\d+)/).filter(Boolean)
  return (
    <span className="formula">
      {parts.map((p, i) => (/^\d+$/.test(p) ? <sub key={i}>{p}</sub> : <span key={i}>{p}</span>))}
      {charge && <sup>{charge}</sup>}
    </span>
  )
}

/* ---------- slides ---------- */
export const SLIDE_COUNT: Record<LectureId, number> = { L7: 43, L8: 42, L9: 72, L10: 142 }
export function slideSrc(l: LectureId, n: number) {
  const pad = String(SLIDE_COUNT[l]).length
  return `slides/${l}/s-${String(n).padStart(pad, '0')}.jpg`
}
type SlideOpen = (l: LectureId, n: number) => void
export const SlideCtx = createContext<SlideOpen>(() => {})
/** Clickable citation chip "[L9 s42]" that opens the slide lightbox. */
export function SlideRef({ l, s }: { l: LectureId; s: number }) {
  const open = useContext(SlideCtx)
  return <button className="slide-ref" onClick={() => open(l, s)} title="Open slide">{l} s{s}</button>
}
export function SlideLightbox({ at, onClose, onNav }: { at: { l: LectureId; n: number } | null; onClose: () => void; onNav: (n: number) => void }) {
  useEffect(() => {
    if (!at) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && at.n < SLIDE_COUNT[at.l]) onNav(at.n + 1)
      if (e.key === 'ArrowLeft' && at.n > 1) onNav(at.n - 1)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [at, onClose, onNav])
  if (!at) return null
  return (
    <div className="lightbox" onClick={onClose}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={slideSrc(at.l, at.n)} alt={`${at.l} slide ${at.n}`} />
        <figcaption>
          <button disabled={at.n <= 1} onClick={() => onNav(at.n - 1)} aria-label="Previous slide"><IconChevronLeft size={16} /></button>
          <span>{at.l} · slide {at.n} / {SLIDE_COUNT[at.l]}</span>
          <button disabled={at.n >= SLIDE_COUNT[at.l]} onClick={() => onNav(at.n + 1)} aria-label="Next slide"><IconChevronRight size={16} /></button>
          <button onClick={onClose}>Close</button>
        </figcaption>
      </figure>
    </div>
  )
}

/* ---------- workbench ---------- */
export type Level = 'ok' | 'err' | 'warn' | 'hint' | 'info'
export interface Note { level: Level; msg: string }

/**
 * Frame for every interactive widget: title, Learn/Test toggle (hidden when `mode` is forced by a task),
 * reset button, optional toolbar on the right.
 */
export function Workbench({ title, subtitle, mode, onMode, onReset, tools, compact, children }: {
  title: string; subtitle?: ReactNode; mode?: Mode; onMode?: (m: Mode) => void; onReset?: () => void
  tools?: ReactNode; compact?: boolean; children: ReactNode
}) {
  return (
    <section className={'wb' + (compact ? ' wb-compact' : '')}>
      <header className="wb-head">
        <div className="wb-title"><h3>{title}</h3>{subtitle && <small>{subtitle}</small>}</div>
        <div className="wb-tools">
          {tools}
          {mode && onMode && <ModeToggle mode={mode} onChange={onMode} />}
          {onReset && <button className="btn ghost" onClick={onReset} title="Start over">↺ Reset</button>}
        </div>
      </header>
      <div className="wb-body">{children}</div>
    </section>
  )
}

export function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="seg" title="Learn: hints after each step. Test: no hints until you press Check.">
      <button className={mode === 'learn' ? 'on' : ''} onClick={() => onChange('learn')}>Learn</button>
      <button className={mode === 'test' ? 'on' : ''} onClick={() => onChange('test')}>Test</button>
    </div>
  )
}

/** Mode state for a widget: forced by props.mode if given (practice), else user-toggleable and remembered. */
export function useMode(forced?: Mode, key = 'chem.mode'): [Mode, ((m: Mode) => void) | undefined] {
  const [m, setM] = useLocalState<Mode>(key, 'learn')
  return forced ? [forced, undefined] : [m, setM]
}

export type StepStatus = 'locked' | 'active' | 'done' | 'error'
/** One numbered step of a worked procedure. In learn mode, later steps stay `locked` until earlier ones are done. */
export function Step({ n, title, status, children, notes }: {
  n: number; title: ReactNode; status: StepStatus; children?: ReactNode; notes?: Note[]
}) {
  return (
    <div className={'wb-step ' + status}>
      <div className="wb-step-head">
        <span className="wb-step-n">{status === 'done' ? <IconCheck size={14} style={{ strokeWidth: 2.6 }} /> : status === 'error' ? '!' : n}</span>
        <span className="wb-step-title">{title}</span>
      </div>
      {status !== 'locked' && <div className="wb-step-body">{children}{notes && <Feedback notes={notes} />}</div>}
    </div>
  )
}

/** List of feedback lines (✓ correct, ✗ error with reason, ⚠ warning, 💡 hint). Markdown+math allowed. */
export function Feedback({ notes }: { notes: Note[] }) {
  if (!notes.length) return null
  return (
    <ul className="wb-fb">
      {notes.map((n, i) => (
        <li key={i} className={n.level}><span className="ic">{(() => { const I = LEVEL_ICON[n.level]; return <I size={16} /> })()}</span><Md inline>{n.msg}</Md></li>
      ))}
    </ul>
  )
}

/** Overall verdict banner after the final Check. */
export function Verdict({ correct, title, children }: { correct: boolean | 'partial'; title: string; children?: ReactNode }) {
  const cls = correct === true ? 'ok' : correct === 'partial' ? 'warn' : 'err'
  return <div className={'wb-verdict ' + cls}><b>{title}</b>{children}</div>
}

/** True if `v` matches `answer` within tolerance (default 2 % relative). */
export function within(v: number, answer: number, tol: { rel?: number; abs?: number } = {}) {
  if (!Number.isFinite(v)) return false
  if (tol.abs != null) return Math.abs(v - answer) <= tol.abs
  const rel = tol.rel ?? 0.02
  return answer === 0 ? Math.abs(v) < 1e-12 : Math.abs((v - answer) / answer) <= rel
}
/** Parses "6.63e-34", "6.63x10^-34", "6.63×10⁻³⁴", "6,63" etc. Returns NaN if unparseable. */
export function parseNum(s: string): number {
  const sup: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' }
  let t = s.trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => sup[c]).replace(/\s/g, '').replace(',', '.')
  t = t.replace(/[x×*]10\^?\(?([+-]?\d+)\)?/i, 'e$1')
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return NaN
  return Number(t)
}
/** Number input that accepts scientific notation; shows ✓/✗ state when `state` is given. */
export function NumInput({ value, onChange, unit, placeholder, state, width = 130, disabled }: {
  value: string; onChange: (s: string) => void; unit?: ReactNode; placeholder?: string
  state?: 'ok' | 'err' | null; width?: number; disabled?: boolean
}) {
  return (
    <span className={'num-in ' + (state ?? '')}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? 'e.g. 4.86e-7'} style={{ width }} disabled={disabled} inputMode="decimal" />
      {unit && <span className="unit">{unit}</span>}
    </span>
  )
}

/** Format a number in scientific notation for display: 4.861e-7 → "4.86 × 10⁻⁷". */
export function sci(x: number, sig = 3): string {
  if (!Number.isFinite(x)) return '—'
  if (x === 0) return '0'
  const e = Math.floor(Math.log10(Math.abs(x)))
  if (e >= -2 && e <= 4) return Number(x.toPrecision(sig)).toString()
  const m = x / 10 ** e
  const sup = String(e).replace(/[-0-9]/g, (c) => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(c)])
  return `${m.toFixed(sig - 1)} × 10${sup}`
}

export const CONST = {
  h: 6.626e-34, // J s
  c: 2.998e8, // m/s
  RH: 1.097e7, // Rydberg constant, m^-1
  RE: 2.18e-18, // Bohr energy constant, J (E_n = -RE / n^2)
  NA: 6.022e23,
  e: 1.602e-19, // C (1 eV = 1.602e-19 J)
  me: 9.109e-31, // kg
}

/** Opens a widget as a panel in the Workspace (consumed by workspace/). */
export function openInWorkspace(widgetId: string) {
  try {
    const q = JSON.parse(localStorage.getItem('ws.pending') || '[]') as string[]
    localStorage.setItem('ws.pending', JSON.stringify([...q, widgetId]))
  } catch { /* ignore */ }
  location.hash = '#/workspace'
}

/** Records a practice/widget attempt for per-topic progress (read by practice/Progress). */
export function recordAttempt(a: { id: string; lecture: LectureId; topic: string; correct: boolean; score?: number }) {
  try {
    const log = JSON.parse(localStorage.getItem('chem.attempts') || '[]') as unknown[]
    log.push({ ...a, t: Date.now() })
    localStorage.setItem('chem.attempts', JSON.stringify(log.slice(-5000)))
  } catch { /* ignore */ }
}
