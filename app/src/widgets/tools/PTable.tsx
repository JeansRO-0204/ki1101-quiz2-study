import { useMemo, useState } from 'react'
import { ELEMENTS, configString, type Category, type Element } from '../../lib/chem/elements'
import { useLocalState } from '../../lib/kit'
import type { WidgetProps } from '../../types'
import './tools.css'

type ColorBy = 'category' | 'block' | 'en' | 'ie1' | 'ea' | 'radius'
const MODES: { id: ColorBy; label: string; unit?: string }[] = [
  { id: 'category', label: 'Category' }, { id: 'block', label: 'Block' },
  { id: 'en', label: 'EN' }, { id: 'ie1', label: 'IE₁', unit: 'kJ/mol' }, { id: 'ea', label: 'EA', unit: 'kJ/mol' }, { id: 'radius', label: 'Radius', unit: 'pm' },
]
const CAT: Record<Category, { c: string; label: string }> = {
  alkali: { c: '#fca5a5', label: 'Alkali metal' }, 'alkaline-earth': { c: '#fdba74', label: 'Alkaline earth' }, transition: { c: '#fde68a', label: 'Transition metal' },
  'post-transition': { c: '#bef264', label: 'Post-transition metal' }, metalloid: { c: '#6ee7b7', label: 'Metalloid' }, nonmetal: { c: '#7dd3fc', label: 'Nonmetal' },
  halogen: { c: '#a5b4fc', label: 'Halogen' }, 'noble-gas': { c: '#d8b4fe', label: 'Noble gas' }, lanthanide: { c: '#f9a8d4', label: 'Lanthanide' }, actinide: { c: '#fda4af', label: 'Actinide' },
}
const BLOCK: Record<string, { c: string; label: string }> = {
  s: { c: '#fcd34d', label: 's-block' }, p: { c: '#7dd3fc', label: 'p-block' }, d: { c: '#6ee7b7', label: 'd-block' }, f: { c: '#f9a8d4', label: 'f-block' },
}
const CAT_ORDER = Object.keys(CAT) as Category[]

function pos(e: Element): { col: number; row: number } {
  if (e.group === null) {
    const base = e.period === 6 ? 57 : 89
    return { col: 3 + (e.z - base), row: e.period === 6 ? 9 : 10 }
  }
  return { col: e.group, row: e.period }
}
const ionStr = (sym: string, c: number) => <span>{sym}<sup>{Math.abs(c) > 1 ? Math.abs(c) : ''}{c > 0 ? '+' : '−'}</sup></span>

function heat(t: number) { // 0..1 → pale yellow → deep blue-violet
  const h = 55 + (250 - 55) * t, s = 85 - 15 * t, l = 90 - 45 * t
  return `hsl(${h} ${s}% ${l}%)`
}

function ConfigTokens({ s }: { s: string }) {
  return <>{s.split(' ').map((t, i) => {
    const m = /^(\d[spdf])(\d+)$/.exec(t)
    return m ? <span key={i} className="pt-orb">{m[1]}<sup>{m[2]}</sup> </span> : <span key={i} className="pt-orb">{t} </span>
  })}</>
}

function LewisDot({ sym, v }: { sym: string; v: number }) {
  const sides = [0, 0, 0, 0]
  if (v === 2 && sym === 'He') sides[0] = 2
  else for (let i = 0; i < v; i++) sides[i % 4]++
  const dots: [number, number][] = []
  const c = 40, d = 22
  const place = (side: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const off = n === 2 ? (i === 0 ? -5 : 5) : 0
      if (side === 0) dots.push([c + off, c - d]); if (side === 1) dots.push([c + d, c + off])
      if (side === 2) dots.push([c + off, c + d]); if (side === 3) dots.push([c - d, c + off])
    }
  }
  sides.forEach((n, s) => place(s, n))
  return (
    <svg viewBox="0 0 80 80" width="84" height="84" className="pt-lewis">
      <text x="40" y="49" textAnchor="middle" fontSize="26" fontWeight="700" fill="currentColor">{sym}</text>
      {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.8" fill="var(--electron)" />)}
    </svg>
  )
}

export default function PTable({ compact }: WidgetProps) {
  const [by, setBy] = useLocalState<ColorBy>('tools.ptable.by', 'category')
  const [sel, setSel] = useState<number | null>(null)
  const [q, setQ] = useState('')

  const range = useMemo(() => {
    if (by === 'category' || by === 'block') return null
    const vals = ELEMENTS.map((e) => e[by]).filter((v): v is number => typeof v === 'number')
    if (!vals.length) return { min: 0, max: 0, n: 0 }
    return { min: Math.min(...vals), max: Math.max(...vals), n: vals.length }
  }, [by])

  const colorOf = (e: Element): string | undefined => {
    if (by === 'category') return CAT[e.category].c
    if (by === 'block') return BLOCK[e.block].c
    const v = e[by]
    if (typeof v !== 'number' || !range || range.max === range.min) return undefined
    return heat((v - range.min) / (range.max - range.min))
  }
  const needle = q.trim().toLowerCase()
  const match = (e: Element) => !needle || e.symbol.toLowerCase() === needle || e.name.toLowerCase().includes(needle) || String(e.z) === needle
  const e = sel ? ELEMENTS[sel - 1] : null
  const mode = MODES.find((m) => m.id === by)!

  return (
    <div className={'pt' + (compact ? ' pt-compact' : '')}>
      <div className="pt-bar">
        <div className="seg">{MODES.map((m) => <button key={m.id} className={by === m.id ? 'on' : ''} onClick={() => setBy(m.id)}>{m.label}</button>)}</div>
        <input className="field pt-search" placeholder="Find element…" value={q} onChange={(ev) => setQ(ev.target.value)} />
      </div>

      <div className="pt-scroll">
        <div className="pt-grid">
          {ELEMENTS.map((x) => {
            const p = pos(x)
            const col = colorOf(x)
            return (
              <button key={x.z} className={'pt-cell' + (sel === x.z ? ' sel' : '') + (!match(x) ? ' dim' : '') + (col ? '' : ' nodata')}
                style={{ gridColumn: p.col, gridRow: p.row, background: col }} onClick={() => setSel(sel === x.z ? null : x.z)}
                title={`${x.name} (Z = ${x.z})`}>
                <i>{x.z}</i><b>{x.symbol}</b>
                {range && typeof x[by as 'en'] === 'number' && <em>{by === 'en' ? x.en : Math.round(x[by as 'ie1'] as number)}</em>}
              </button>
            )
          })}
          <div className="pt-flabel" style={{ gridColumn: '1 / 4', gridRow: 9 }}>Lanthanides</div>
          <div className="pt-flabel" style={{ gridColumn: '1 / 4', gridRow: 10 }}>Actinides</div>
        </div>
      </div>

      <div className="pt-legend">
        {by === 'category' && CAT_ORDER.map((c) => <span key={c}><i style={{ background: CAT[c].c }} />{CAT[c].label}</span>)}
        {by === 'block' && Object.values(BLOCK).map((b) => <span key={b.label}><i style={{ background: b.c }} />{b.label}</span>)}
        {range && (range.n > 0
          ? <><span className="pt-ramp"><b>{range.min}</b><i className="pt-bar-g" /><b>{range.max}</b></span><span className="muted">{mode.label}{mode.unit ? ` (${mode.unit})` : ''}{by === 'ea' ? ' · negative = energy released' : ''} · {range.n}/{ELEMENTS.length} elements have data</span></>
          : <span className="muted">No {mode.label} data available yet.</span>)}
      </div>

      {e ? (
        <div className="pt-card">
          <div className="pt-big" style={{ background: CAT[e.category].c }}>
            <i>{e.z}</i><b>{e.symbol}</b><span>{e.name}</span>
          </div>
          <div className="pt-info">
            <dl>
              <dt>Position</dt><dd>{e.group ? `Group ${e.group}` : 'f-block'}, period {e.period} · {e.block}-block · {CAT[e.category].label.toLowerCase()}</dd>
              <dt>Configuration</dt><dd><ConfigTokens s={configString(e.z, { core: false })} /></dd>
              <dt>Condensed</dt><dd><ConfigTokens s={configString(e.z)} /></dd>
              <dt>Valence e⁻</dt><dd>{e.valence ?? (e.group ? <>{e.group} <span className="muted">(ns + (n−1)d electrons)</span></> : '—')}</dd>
              <dt>EN (Pauling)</dt><dd>{e.en ?? <span className="muted">n/a</span>}</dd>
              <dt>IE₁</dt><dd>{e.ie1 != null ? `${e.ie1} kJ/mol` : <span className="muted">n/a</span>}</dd>
              <dt>EA</dt><dd>{e.ea != null ? `${e.ea} kJ/mol` : <span className="muted">n/a</span>}</dd>
              <dt>Radius</dt><dd>{e.radius != null ? `${e.radius} pm` : <span className="muted">n/a</span>}</dd>
              <dt>Common ions</dt><dd>{commonIons(e)}</dd>
            </dl>
            {e.valence != null && <div className="pt-lewis-box"><LewisDot sym={e.symbol} v={e.valence} /><small>Lewis symbol</small></div>}
          </div>
        </div>
      ) : <p className="pt-hint">Click an element for its details.</p>}
    </div>
  )
}

function commonIons(e: Element) {
  let ions = e.ions
  let note = ''
  if (!ions?.length) {
    const g = e.group
    const guess = g === 1 ? [1] : g === 2 ? [2] : g === 13 ? [3] : g === 15 ? [-3] : g === 16 ? [-2] : g === 17 ? [-1] : null
    ions = e.z === 1 ? [1, -1] : guess ?? undefined
    if (ions?.length) note = ' (by group)'
  }
  if (!ions?.length) return <span className="muted">{e.category === 'noble-gas' ? 'none (inert)' : 'n/a'}</span>
  return <>{ions.map((c, i) => <span key={c}>{i > 0 && ', '}{ionStr(e.symbol, c)}</span>)}<span className="muted">{note}</span></>
}
