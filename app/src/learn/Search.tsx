// Materials search: one index over every section (title, must-knows, formula names, body, traps), results link to the section.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CONTENT } from '../content'
import { LECTURES, type LectureId } from '../types'

interface Doc { lecture: LectureId; id: string; title: string; fields: { text: string; w: number }[] }
const plain = (s: string) => s
  .replace(/\$\$?([^$]*)\$\$?/g, (_, m: string) => ' ' + m.replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}^_\\]/g, ' ') + ' ')
  .replace(/[|*#`>~]/g, ' ').replace(/(^|\s)-\s/g, '$1').replace(/\s+/g, ' ').trim()

let INDEX: Doc[] | null = null
function index(): Doc[] {
  if (INDEX) return INDEX
  INDEX = LECTURES.flatMap((l) => CONTENT[l.id].sections.map((s) => ({
    lecture: l.id, id: s.id, title: s.title,
    fields: [
      { text: s.title, w: 10 },
      { text: plain((s.essentials ?? []).join(' ')), w: 4 },
      { text: plain((s.formulas ?? []).map((f) => f.name + ' ' + (f.where ?? '')).join(' ')), w: 4 },
      { text: plain((s.traps ?? []).join(' ')), w: 2 },
      { text: plain(s.md), w: 1 },
    ],
  })))
  return INDEX
}

const terms = (q: string) => q.toLowerCase().split(/\s+/).filter((t) => t.length > 0)
export interface Hit { doc: Doc; score: number; snippet: string }
export function search(q: string): Hit[] {
  const ts = terms(q)
  if (!ts.length || ts.join('').length < 2) return []
  const out: Hit[] = []
  for (const doc of index()) {
    const all = doc.fields.map((f) => f.text.toLowerCase())
    if (!ts.every((t) => all.some((a) => a.includes(t)))) continue
    let score = 0
    doc.fields.forEach((f, i) => ts.forEach((t) => { if (all[i].includes(t)) score += f.w })) // eslint-disable-line
    // snippet: first body-ish field containing the first term
    let snippet = ''
    for (let i = doc.fields.length - 1; i >= 1 && !snippet; i--) {
      const at = all[i].indexOf(ts[0])
      if (at >= 0) { const t = doc.fields[i].text; snippet = (at > 40 ? '…' : '') + t.slice(Math.max(0, at - 40), at + 90) + (at + 90 < t.length ? '…' : '') }
    }
    out.push({ doc, score, snippet })
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 12)
}

function mark(text: string, ts: string[]): ReactNode {
  if (!text) return null
  const re = new RegExp('(' + ts.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'ig')
  return text.split(re).map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p))
}

export function SearchBox({ q, setQ, inputRef }: { q: string; setQ: (v: string) => void; inputRef?: React.RefObject<HTMLInputElement | null> }) {
  return (
    <div className="msearch-box">
      <input ref={inputRef} className="field msearch-in" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search materials…  ( / )" aria-label="Search materials" autoComplete="off" spellCheck={false}
        onKeyDown={(e) => { if (e.key === 'Escape') setQ(''); if (e.key === 'Enter') { const h = search(q)[0]; if (h) { location.hash = `#/learn/${h.doc.lecture}/${h.doc.id}`; setQ('') } } }} />
    </div>
  )
}

export function SearchResults({ q, onPick }: { q: string; onPick: () => void }) {
  const hits = useMemo(() => search(q), [q])
  const ts = terms(q)
  if (!ts.length) return null
  return (
    <div className="msearch-res" role="listbox" aria-label="Search results">
      {ts.join('').length < 2 && <p className="muted msearch-none">Keep typing…</p>}
      {ts.join('').length >= 2 && !hits.length && <p className="muted msearch-none">No section matches “{q}”. Try a shorter word, e.g. “lattice”, “formal charge”, “hybrid”.</p>}
      {hits.map((h) => {
        const l = LECTURES.find((x) => x.id === h.doc.lecture)!
        return (
          <a key={h.doc.lecture + h.doc.id} className="msearch-hit" href={`#/learn/${h.doc.lecture}/${h.doc.id}`} onClick={onPick} role="option" style={{ ['--c' as string]: l.color }}>
            <span className="msearch-tag">{l.id}</span>
            <span className="msearch-t">{mark(h.doc.title, ts)}</span>
            {h.snippet && <span className="msearch-s">{mark(h.snippet, ts)}</span>}
          </a>
        )
      })}
    </div>
  )
}

/** "/" focuses the search box (like most docs sites), unless you're typing in a field already. */
export function useSlashFocus(ref: React.RefObject<HTMLInputElement | null>) {
  const [, force] = useState(0)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement
      if (t.closest('input,textarea,select,[contenteditable="true"]')) return
      e.preventDefault(); ref.current?.focus(); force((n) => n + 1)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [ref])
}
