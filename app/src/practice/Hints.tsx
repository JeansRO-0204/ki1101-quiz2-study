// Progressive help: hints first (nudges), then the worked solution one step at a time. Also the EN/ID language switch.
import { useEffect, useState, useSyncExternalStore } from 'react'
import { Md } from '../lib/kit'
import type { Question } from '../types'
import { IconBulbFill, IconChevronDown } from '../lib/icons'

export type Lang = 'en' | 'id'
/** App-wide language choice, shared live between every component that uses it, persisted in localStorage. */
const langSubs = new Set<() => void>()
const readLang = (): Lang => { try { return localStorage.getItem('chem.lang') === '"id"' ? 'id' : 'en' } catch { return 'en' } }
let curLang: Lang = readLang()
function setLangGlobal(l: Lang) { curLang = l; try { localStorage.setItem('chem.lang', JSON.stringify(l)) } catch { /* ignore */ } langSubs.forEach((f) => f()) }
export function useLang(): [Lang, (l: Lang) => void] {
  const l = useSyncExternalStore((f) => { langSubs.add(f); return () => { langSubs.delete(f) } }, () => curLang)
  return [l, setLangGlobal]
}

/** Language-resolved text of a question. Indonesian falls back to English field by field. */
export function loc(q: Question, lang: Lang) {
  const id = lang === 'id' ? q.indo : undefined
  return {
    stem: id?.stem ?? q.stem,
    options: q.kind === 'mcq' ? (id?.options?.length === q.options.length ? id.options : q.options) : undefined,
    explanation: id?.explanation ?? q.explanation,
    hints: id?.hints ?? q.hints ?? [],
    work: id?.work ?? q.work ?? splitWork(id?.explanation ?? q.explanation),
    answer: q.kind === 'open' ? (id?.answer ?? q.answer) : undefined,
  }
}

/** Split a markdown worked solution into revealable steps (paragraphs / list items / display-math blocks). */
export function splitWork(md: string): string[] {
  const parts: string[] = []
  for (const block of md.split(/\n\s*\n/)) {
    const b = block.trim()
    if (!b) continue
    const lines = b.split('\n')
    // a list block becomes one step per item
    if (lines.length > 1 && lines.every((l) => /^\s*([-*]|\d+[.)])\s/.test(l) || /^\s{2,}/.test(l))) {
      let cur = ''
      for (const l of lines) {
        if (/^\s*([-*]|\d+[.)])\s/.test(l)) { if (cur) parts.push(cur); cur = l.replace(/^\s*([-*]|\d+[.)])\s/, '') } else cur += '\n' + l
      }
      if (cur) parts.push(cur)
    } else parts.push(b)
  }
  return parts
}

const T = {
  en: { hint: 'Hint', step: 'Show next step', all: 'Show all', of: 'of', hide: 'Hide help', work: 'Worked solution', none: 'No hints for this one: try the worked solution.' },
  id: { hint: 'Petunjuk', step: 'Tampilkan langkah berikutnya', all: 'Tampilkan semua', of: 'dari', hide: 'Sembunyikan', work: 'Pembahasan', none: 'Tidak ada petunjuk: coba lihat pembahasan.' },
}

/**
 * Hint ladder: each click reveals one more rung: hint 1 → hint 2 → … → step 1 of the worked solution → step 2 → …
 * `onUse` reports how far the learner went (for honesty in scoring/attempt logs).
 */
export function HintLadder({ hints, work, lang = 'en', resetKey, onUse }: { hints: string[]; work: string[]; lang?: Lang; resetKey?: string; onUse?: (n: number) => void }) {
  const [n, setN] = useState(0)
  const [open, setOpen] = useState(true)
  useEffect(() => { setN(0); setOpen(true) }, [resetKey])
  const t = T[lang]
  const total = hints.length + work.length
  if (!total) return null
  const shownH = hints.slice(0, Math.min(n, hints.length))
  const shownW = work.slice(0, Math.max(0, n - hints.length))
  const more = (k: number) => { const v = Math.min(total, n + k); setN(v); setOpen(true); onUse?.(v) }
  const inHints = n < hints.length
  const label = inHints ? `${t.hint} ${n + 1} ${t.of} ${hints.length}` : `${t.step} (${n - hints.length + 1}/${work.length})`
  return (
    <div className="hl">
      {open && n > 0 && (
        <div className="hl-list">
          {shownH.map((h, i) => (
            <div key={'h' + i} className="hl-hint"><IconBulbFill size={15} /><div><b>{t.hint} {i + 1}</b><Md>{h}</Md></div></div>
          ))}
          {shownW.length > 0 && (
            <div className="hl-work">
              <b>{t.work}</b>
              <ol>{shownW.map((w, i) => <li key={'w' + i}><Md>{w}</Md></li>)}</ol>
            </div>
          )}
        </div>
      )}
      <div className="hl-bar">
        {n < total && <button className="btn sm hl-btn" onClick={() => more(1)}>{inHints ? <IconBulbFill size={14} /> : null}{label}</button>}
        {n < total && !inHints && work.length - (n - hints.length) > 1 && <button className="btn sm ghost" onClick={() => more(total)}>{t.all}</button>}
        {n > 0 && <button className="btn sm ghost" onClick={() => setOpen((o) => !o)}>{open ? t.hide : `${t.hint} (${n})`}<IconChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : undefined }} /></button>}
        <span className="hl-pips" aria-hidden>{Array.from({ length: total }, (_, i) => <i key={i} className={(i < hints.length ? 'h' : 'w') + (i < n ? ' on' : '')} />)}</span>
      </div>
    </div>
  )
}

/** EN | ID segmented switch (only rendered when Indonesian text exists). */
export function LangSwitch({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="seg lang-sw" title="Language / Bahasa">
      <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
      <button className={lang === 'id' ? 'on' : ''} onClick={() => setLang('id')}>ID</button>
    </div>
  )
}
