import { useEffect, useMemo, useRef, useState } from 'react'
import { Md, useLocalState } from '../../lib/kit'
import type { WidgetProps } from '../../types'
import './tools.css'
import { ScriptToggles, useScriptTyping } from '../../lib/scripts'

interface Note { id: string; title: string; body: string; t: number }
interface Store { notes: Note[]; active: string }
type View = 'edit' | 'split' | 'preview'

const mk = (title = 'Untitled', body = ''): Note => ({ id: 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), title, body, t: Date.now() })
const WELCOME = `# Quiz 2 notes

Photon energy: $E = h\\nu = \\dfrac{hc}{\\lambda}$

Formal charge: $FC = V - (L + \\tfrac{B}{2})$

| species | bond order |
|---|---|
| O₂ | 2 |
| O₂⁻ | 1.5 |
`

const SUB = '₀₁₂₃₄₅₆₇₈₉₊₋'.split('')
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻'.split('')
const SYMS = ['→', '⇌', '←', '↑', '↓', 'Δ', 'λ', 'ν', 'σ', 'π', 'σ*', 'π*', '°', '·', '±', '≈', '×', '×10⁻', 'ψ', 'δ']
const SNIPS: [string, string][] = [
  ['E=hν', '$E = h\\nu$'], ['c=λν', '$c = \\lambda\\nu$'], ['E=hc/λ', '$E = \\dfrac{hc}{\\lambda}$'],
  ['Rydberg', '$\\dfrac{1}{\\lambda} = R_H\\left(\\dfrac{1}{n_1^2} - \\dfrac{1}{n_2^2}\\right)$'], ['Eₙ', '$E_n = -\\dfrac{2.18\\times10^{-18}\\,\\text{J}}{n^2}$'],
  ['FC', '$FC = V - \\left(L + \\tfrac{B}{2}\\right)$'], ['BO (MO)', '$\\text{BO} = \\tfrac{1}{2}(n_b - n_a)$'], ['table', '\n| a | b |\n|---|---|\n|   |   |\n'],
]

export default function Notepad({ compact }: WidgetProps) {
  const [store, setStore] = useLocalState<Store>('tools.notes', (() => { const n = mk('Notes', WELCOME); return { notes: [n], active: n.id } })())
  const [view, setView] = useLocalState<View>('tools.notes.view', 'split')
  const ta = useRef<HTMLTextAreaElement>(null)
  const note = store.notes.find((n) => n.id === store.active) ?? store.notes[0]
  const [confirmDel, setConfirmDel] = useState(false)
  useEffect(() => { setConfirmDel(false) }, [store.active])

  const patch = (p: Partial<Note>) => setStore((s) => ({ ...s, notes: s.notes.map((n) => (n.id === note.id ? { ...n, ...p, t: Date.now() } : n)) }))
  const add = () => { const n = mk(`Note ${store.notes.length + 1}`); setStore((s) => ({ notes: [...s.notes, n], active: n.id })) }
  const del = () => {
    setStore((s) => {
      const rest = s.notes.filter((n) => n.id !== note.id)
      if (!rest.length) { const n = mk('Notes'); return { notes: [n], active: n.id } }
      return { notes: rest, active: rest[0].id }
    })
  }
  const scr = useScriptTyping(ta, (body) => patch({ body }))
  const insert = (text: string) => {
    const el = ta.current
    if (!el) { patch({ body: note.body + text }); return }
    const a = el.selectionStart, b = el.selectionEnd
    const body = note.body.slice(0, a) + text + note.body.slice(b)
    patch({ body })
    requestAnimationFrame(() => { el.focus(); const p = a + text.length; el.setSelectionRange(p, p) })
  }
  const exportMd = () => {
    const blob = new Blob([`# ${note.title}\n\n${note.body}\n`], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = (note.title.trim().replace(/[^\w\- ]+/g, '').replace(/\s+/g, '-') || 'note') + '.md'
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const words = useMemo(() => (note.body.trim() ? note.body.trim().split(/\s+/).length : 0), [note.body])

  return (
    <div className={'np' + (compact ? ' np-compact' : '')}>
      <div className="np-tabs">
        <div className="np-tablist">
          {store.notes.map((n) => (
            <button key={n.id} className={n.id === note.id ? 'on' : ''} onClick={() => setStore((s) => ({ ...s, active: n.id }))} title={n.title}>{n.title || 'Untitled'}</button>
          ))}
          <button className="np-add" onClick={add} title="New note">＋</button>
        </div>
      </div>
      <div className="np-head">
        <input className="np-title" value={note.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Title" />
        <div className="seg">
          {(['edit', 'split', 'preview'] as View[]).map((v) => <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</button>)}
        </div>
        <button className="btn sm" onClick={exportMd} title="Download as .md">Export .md</button>
        {confirmDel
          ? <button className="btn sm np-danger" onClick={del} onBlur={() => setConfirmDel(false)} autoFocus>Delete?</button>
          : <button className="btn sm ghost" onClick={() => setConfirmDel(true)} title="Delete note">Delete</button>}
      </div>
      {view !== 'preview' && (
        <div className="np-ins">
          <div className="np-ins-row">
            <ScriptToggles mode={scr.mode} setMode={scr.setMode} compact />
            <span className="np-lbl">sub</span>{SUB.map((c) => <button key={c} onClick={() => insert(c)}>{c}</button>)}
            <span className="np-lbl">sup</span>{SUP.map((c) => <button key={c} onClick={() => insert(c)}>{c}</button>)}
          </div>
          <div className="np-ins-row">
            {SYMS.map((c) => <button key={c} onClick={() => insert(c)}>{c}</button>)}
            <span className="np-lbl">snippets</span>
            {SNIPS.map(([l, s]) => <button key={l} className="wide" onClick={() => insert(s)} title={s}>{l}</button>)}
          </div>
        </div>
      )}
      <div className={'np-panes ' + view}>
        {view !== 'preview' && (
          <textarea ref={ta} className="np-edit" value={note.body} onChange={(e) => patch({ body: e.target.value })} onKeyDown={scr.onKeyDown} spellCheck={false}
            placeholder={'Write markdown here. Use $E=h\\nu$ for inline math and $$…$$ for display math.'} />
        )}
        {view !== 'edit' && <div className="np-prev">{note.body.trim() ? <Md>{note.body}</Md> : <p className="muted">Nothing to preview yet.</p>}</div>}
      </div>
      <div className="np-foot">{words} words · autosaved · {new Date(note.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  )
}
