// Native sub/superscript typing for plain-text fields (Unicode ₀₁₂ ⁰¹²⁺⁻).
//   _  then characters  → subscript until a space / unsupported key   (H_2O → H₂O)
//   ^  then characters  → superscript                                  (SO_4^2- → SO₄²⁻, 1s^2 → 1s²)
//   ⌘= / Ctrl+=         → toggle subscript mode;  ⇧⌘= / Ctrl+Shift+=  → toggle superscript mode (as in Word/Pages)
//   type __ or ^^ to get a literal _ or ^
import { useRef, useState, type KeyboardEvent, type RefObject } from 'react'

const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '−': '₋', '=': '₌', '(': '₍', ')': '₎',
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
}
const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '−': '⁻', '=': '⁼', '(': '⁽', ')': '⁾', '*': '*', '•': '•', '.': '·',
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
}
export type ScriptMode = 'sub' | 'sup' | null

/** Convert inline markup in a whole string: "SO_4^2-" → "SO₄²⁻". Runs stop at the first unsupported character. */
export function scriptify(s: string): string {
  return s.replace(/([_^])([^\s_^]+)/g, (m, k: string, run: string) => {
    const map = k === '_' ? SUB : SUP
    let out = ''
    let i = 0
    for (; i < run.length && map[run[i]]; i++) out += map[run[i]]
    return i === 0 ? m : out + run.slice(i)
  })
}

type El = HTMLTextAreaElement | HTMLInputElement

function insertAt(el: El, text: string, onValue: (v: string) => void) {
  const a = el.selectionStart ?? el.value.length, b = el.selectionEnd ?? a
  el.setRangeText(text, a, b, 'end')
  onValue(el.value)
}

/**
 * Hook for a textarea/input: returns the current mode, a setter (for toolbar buttons) and an onKeyDown handler.
 * `sticky` = mode set by toggle/shortcut (stays on); a mode entered with _ or ^ ends at the first unsupported key.
 */
export function useScriptTyping(ref: RefObject<El | null>, onValue: (v: string) => void) {
  const [mode, setModeState] = useState<ScriptMode>(null)
  const sticky = useRef(false)
  const trigger = useRef<{ ch: string; n: number } | null>(null) // _ / ^ run: the swallowed char and how many chars it converted
  const setMode = (m: ScriptMode, isSticky = true) => { sticky.current = isSticky && m != null; if (m == null || isSticky) trigger.current = null; setModeState(m); if (isSticky) ref.current?.focus() }
  const endTrigger = (el: El, putBack: boolean) => { if (putBack && trigger.current && trigger.current.n === 0) insertAt(el, trigger.current.ch, onValue); trigger.current = null; setModeState(null) }

  const onKeyDown = (e: KeyboardEvent<El>) => {
    const el = ref.current
    if (!el) return
    const mod = e.metaKey || e.ctrlKey
    if (mod && (e.key === '=' || e.key === '+')) { // ⌘= sub, ⇧⌘= sup
      e.preventDefault()
      const want: ScriptMode = e.shiftKey || e.key === '+' ? 'sup' : 'sub'
      setMode(mode === want ? null : want)
      return
    }
    if (mod || e.altKey) return
    if (e.key.length !== 1) { // Enter, Backspace, arrows… end a _ / ^ run (Escape also ends a toggle)
      if (trigger.current) endTrigger(el, e.key !== 'Backspace')
      else if (e.key === 'Escape') setMode(null)
      return
    }
    if (!mode && (e.key === '_' || e.key === '^')) {
      // inside $…$ math keep LaTeX intact
      const before = el.value.slice(0, el.selectionStart ?? 0)
      if (((before.match(/(?<!\\)\$/g)?.length ?? 0) % 2) === 1) return
      e.preventDefault(); trigger.current = { ch: e.key, n: 0 }; setModeState(e.key === '_' ? 'sub' : 'sup'); sticky.current = false
      return
    }
    if (mode && trigger.current && (e.key === '_' || e.key === '^')) {
      e.preventDefault()
      if (trigger.current.n === 0 && trigger.current.ch === e.key) { insertAt(el, e.key, onValue); trigger.current = null; setModeState(null); return } // __ / ^^ → literal
      trigger.current = { ch: e.key, n: 0 }; setModeState(e.key === '_' ? 'sub' : 'sup') // chain: SO_4^2- → SO₄²⁻
      return
    }
    if (mode) {
      const map = mode === 'sub' ? SUB : SUP
      // a typed _ / ^ run converts digits, signs and brackets; letters only in toggle mode (so prose like _italic_ is safe)
      const c = map[e.key] && (sticky.current || !/[a-z]/i.test(e.key)) ? map[e.key] : undefined
      if (c) { e.preventDefault(); insertAt(el, c, onValue); if (trigger.current) trigger.current.n++; return }
      if (trigger.current) endTrigger(el, true) // unsupported key: put back a lone _ / ^, then the key types normally
    }
  }
  return { mode, setMode, onKeyDown }
}

/** Small x₂ / x² toggle pair plus a live mode badge. */
export function ScriptToggles({ mode, setMode, compact }: { mode: ScriptMode; setMode: (m: ScriptMode) => void; compact?: boolean }) {
  return (
    <span className="scr-tg">
      <button type="button" className={mode === 'sub' ? 'on' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => setMode(mode === 'sub' ? null : 'sub')} title="Subscript (⌘=, or type _ )">x<sub>2</sub></button>
      <button type="button" className={mode === 'sup' ? 'on' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => setMode(mode === 'sup' ? null : 'sup')} title="Superscript (⇧⌘=, or type ^ )">x<sup>2</sup></button>
      {!compact && <span className="scr-help">{mode ? (mode === 'sub' ? 'subscript on' : 'superscript on') : <>type <kbd>_</kbd> <kbd>^</kbd></>}</span>}
    </span>
  )
}

/** Textarea with built-in sub/superscript typing and toggles. */
export function ScriptArea({ value, onChange, className, placeholder, rows = 4, disabled }: {
  value: string; onChange: (v: string) => void; className?: string; placeholder?: string; rows?: number; disabled?: boolean
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const { mode, setMode, onKeyDown } = useScriptTyping(ref, onChange)
  return (
    <div className={'scr-area' + (mode ? ' mode-' + mode : '')}>
      <textarea ref={ref} className={className} value={value} rows={rows} placeholder={placeholder} disabled={disabled}
        onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown}
        onPaste={(e) => { const t = e.clipboardData.getData('text'); if (/[_^]/.test(t)) { e.preventDefault(); insertAt(e.currentTarget, scriptify(t), onChange) } }} />
      {!disabled && <div className="scr-bar"><ScriptToggles mode={mode} setMode={setMode} /></div>}
    </div>
  )
}
