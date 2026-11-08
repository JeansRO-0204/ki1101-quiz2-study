// Aufbau / Madelung diagram: orbitals by shell and subshell, diagonal arrows grouped by n + l, filling order.
import { useState } from 'react'
import type { WidgetProps } from '../../types'
import './tools.css'

const L_NAME = ['s', 'p', 'd', 'f'] as const
const MAX_E = [2, 6, 10, 14]
const BLOCK_C = ['#fcd34d', '#7dd3fc', '#6ee7b7', '#f9a8d4']
/** Subshells that stay empty in the ground state of every known element (grey on the slide-style chart). */
const UNUSED = new Set(['6f', '7d', '7f'])

interface Orb { n: number; l: number; id: string; order: number }
const ORBS: Orb[] = []
for (let n = 1; n <= 7; n++) for (let l = 0; l < Math.min(n, 4); l++) ORBS.push({ n, l, id: `${n}${L_NAME[l]}`, order: 0 })
;[...ORBS].sort((a, b) => a.n + a.l - (b.n + b.l) || a.n - b.n).forEach((o, i) => { o.order = i + 1 })

const X0 = 80, DX = 108, Y0 = 52, DY = 52
const cx = (l: number) => X0 + l * DX
const cy = (n: number) => Y0 + (n - 1) * DY
const SHIFT = 20 // arrows run between the label rows, not through the text

/** One arrow per n + l value, running from upper right to lower left through all its subshells. */
const GROUPS = Array.from({ length: 8 }, (_, i) => i + 1).map((k) => {
  const os = ORBS.filter((o) => o.n + o.l === k)
  if (!os.length) return null
  const hi = os.reduce((a, b) => (b.l > a.l ? b : a)), lo = os.reduce((a, b) => (b.l < a.l ? b : a))
  const x1 = cx(hi.l) + DX * 0.5, y1 = cy(hi.n) - DY * 0.5 - SHIFT
  const x2 = cx(lo.l) - DX * 0.5, y2 = cy(lo.n) + DY * 0.5 - SHIFT
  return { k, ids: os.map((o) => o.id), x1, y1, x2, y2 }
}).filter((g): g is NonNullable<typeof g> => !!g)

export default function Aufbau(_: WidgetProps) {
  const [sel, setSel] = useState<string | null>(null)
  const [nums, setNums] = useState(false)
  const o = ORBS.find((x) => x.id === sel)
  const grp = o ? GROUPS.find((g) => g.ids.includes(o.id)) : undefined
  const seq = [...ORBS].filter((x) => !UNUSED.has(x.id)).sort((a, b) => a.order - b.order)
  return (
    <div className="ab">
      <div className="ab-top">
        <b>Aufbau diagram</b>
        <span className="muted">Follow the arrows, one after another: lowest n + ℓ first, ties go to lower n.</span>
        <label className="ab-chk"><input type="checkbox" checked={nums} onChange={(e) => setNums(e.target.checked)} />Show filling order</label>
      </div>
      <svg className="ab-svg" viewBox="0 0 520 420" role="img" aria-label="Orbital filling diagram">
        <defs>
          <marker id="ab-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="currentColor" /></marker>
        </defs>
        {GROUPS.map((g) => (
          <line key={g.k} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} className={'ab-arrow' + (grp?.k === g.k ? ' on' : '')} markerEnd="url(#ab-ah)" />
        ))}
        {L_NAME.map((s, l) => <text key={s} x={cx(l)} y={18} className="ab-col" textAnchor="middle" style={{ fill: BLOCK_C[l] }}>{s}</text>)}
        {ORBS.map((x) => (
          <g key={x.id} className={'ab-orb' + (UNUSED.has(x.id) ? ' off' : '') + (sel === x.id ? ' sel' : '')} onClick={() => setSel(sel === x.id ? null : x.id)} tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(sel === x.id ? null : x.id) } }} role="button" aria-label={`${x.id}, holds ${MAX_E[x.l]} electrons`}>
            <rect x={cx(x.l) - 30} y={cy(x.n) - 18} width={60} height={34} rx={9} fill={sel === x.id ? 'var(--accent-soft)' : 'transparent'} stroke={sel === x.id ? 'var(--accent)' : 'transparent'} />
            <text x={cx(x.l)} y={cy(x.n) + 6} textAnchor="middle">
              {x.id}<tspan className="ab-sup" dy={-9} dx={1}>{MAX_E[x.l]}</tspan>
            </text>
            {nums && !UNUSED.has(x.id) && <><circle cx={cx(x.l) + 42} cy={cy(x.n) + 1} r={8} className="ab-num" /><text x={cx(x.l) + 42} y={cy(x.n) + 4.5} textAnchor="middle" className="ab-numt">{x.order}</text></>}
          </g>
        ))}
      </svg>
      <div className="ab-info">
        {o ? (
          <p><b>{o.id}</b>: n = {o.n}, ℓ = {o.l} ({L_NAME[o.l]}), n + ℓ = {o.n + o.l}. {o.l === 0 ? '1 orbital' : `${2 * o.l + 1} orbitals`}, up to <b>{MAX_E[o.l]} e⁻</b>. {UNUSED.has(o.id) ? 'Not occupied in any known element.' : <>Filled <b>#{o.order}</b> of {seq.length}.</>}</p>
        ) : <p className="muted">Tap a subshell to see its quantum numbers, capacity and place in the filling order.</p>}
        <p className="ab-seq"><b>Order:</b> {seq.map((x) => x.id).join(' → ')}</p>
        <p className="muted ab-note">Grey subshells are never filled in a known element. Exceptions to the order: Cr [Ar]3d⁵4s¹ and Cu [Ar]3d¹⁰4s¹ (also Mo, Ag, Au).</p>
      </div>
    </div>
  )
}
