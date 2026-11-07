// SVG renderer + layout helpers shared by the Lewis workbench and the resonance viewer.
import type { PointerEvent as RPointerEvent, MouseEvent as RMouseEvent, Ref } from 'react'
import './lewis.css'

export type Pt = [number, number]
export const VW = 560
export const VH = 330

/* ---------- element colours (CPK-ish, tuned for white text/dark text legibility) ---------- */
const CPK: Record<string, [string, string]> = {
  H: ['#ffffff', '#1f2937'], C: ['#4b5563', '#ffffff'], N: ['#3b64f0', '#ffffff'], O: ['#e5484d', '#ffffff'],
  F: ['#8bd35a', '#14301a'], Cl: ['#37c46b', '#0c2c17'], Br: ['#a8402f', '#ffffff'], I: ['#8e3aa8', '#ffffff'],
  S: ['#f1d229', '#3a3205'], P: ['#f08a24', '#ffffff'], B: ['#f4a99a', '#4a1a12'], Be: ['#b8e04c', '#26340a'],
  Si: ['#e8c9a0', '#3d2b12'], Xe: ['#4aa8c0', '#ffffff'], Te: ['#d9822b', '#ffffff'], Se: ['#e08a1e', '#ffffff'],
  As: ['#b98ad8', '#ffffff'], Li: ['#b9a0ee', '#1f1640'], Na: ['#a98ae8', '#ffffff'], Al: ['#c7b4b4', '#2a2020'],
}
export const cpk = (el: string): [string, string] => CPK[el] ?? ['#94a3b8', '#0f172a']
export const atomR = (el: string) => (el === 'H' ? 14 : 18)

/* ---------- layouts ---------- */
export function circleLayout(n: number, cx = VW / 2, cy = VH / 2, r = 105): Pt[] {
  if (n === 1) return [[cx, cy]]
  return Array.from({ length: n }, (_, i) => {
    const a = (-90 + (360 * i) / n) * (Math.PI / 180)
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt
  })
}
const rad = (d: number) => (d * Math.PI) / 180
function childAngles(k: number, phi: number | null): number[] {
  if (phi == null) {
    if (k === 1) return [0]
    if (k === 2) return [180, 0]
    if (k === 3) return [-90, 30, 150]
    return Array.from({ length: k }, (_, j) => -90 + (360 * j) / k)
  }
  if (k === 1) return [phi]
  if (k === 2) return [phi - 58, phi + 58]
  if (k === 3) return [phi - 72, phi, phi + 72]
  return Array.from({ length: k }, (_, j) => phi - 120 + (240 * j) / (k - 1))
}
/** Radial tree layout from `root`; atoms not reachable are returned as null. */
export function treeLayout(n: number, edges: [number, number][], root: number, len = 80): (Pt | null)[] {
  const adj: number[][] = Array.from({ length: n }, () => [])
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a) })
  const pos: (Pt | null)[] = new Array(n).fill(null)
  pos[root] = [0, 0]
  const place = (u: number, parent: number | null, phi: number | null) => {
    const kids = adj[u].filter((v) => v !== parent && pos[v] == null).sort((a, b) => adj[b].length - adj[a].length || a - b)
    const angs = childAngles(kids.length, phi)
    kids.forEach((v, j) => {
      const [ux, uy] = pos[u]!
      pos[v] = [ux + len * Math.cos(rad(angs[j])), uy + len * Math.sin(rad(angs[j]))]
    })
    kids.forEach((v, j) => place(v, u, angs[j]))
  }
  place(root, null, null)
  return pos
}
/** Centre points in the viewBox and shrink if they do not fit. */
export function fitLayout(pts: Pt[], w = VW, h = VH, pad = 44): Pt[] {
  if (!pts.length) return pts
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const bw = maxX - minX, bh = maxY - minY
  const sc = Math.min(1, bw > 0 ? (w - 2 * pad) / bw : 1, bh > 0 ? (h - 2 * pad) / bh : 1)
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2
  return pts.map(([x, y]) => [w / 2 + (x - cx) * sc, h / 2 + (y - cy) * sc] as Pt)
}
/** Layout for the workbench: tree from the central atom when it exists; unattached atoms sit in a row below. */
export function autoLayout(n: number, edges: [number, number][], root: number | null): Pt[] {
  if (root == null) return circleLayout(n)
  if (!edges.length) {
    const others = Array.from({ length: n }, (_, i) => i).filter((i) => i !== root)
    const ring = circleLayout(Math.max(others.length, 1), VW / 2, VH / 2, 112)
    const out: Pt[] = new Array(n)
    out[root] = [VW / 2, VH / 2]
    others.forEach((o, k) => { out[o] = ring[k] })
    return out
  }
  const t = treeLayout(n, edges, root)
  const reached = t.map((p, i) => (p ? i : -1)).filter((i) => i >= 0)
  const fitted = fitLayout(reached.map((i) => t[i]!), VW, VH - 70, 44)
  const out: Pt[] = new Array(n)
  reached.forEach((i, k) => { out[i] = [fitted[k][0], fitted[k][1] - 12] })
  const lost = Array.from({ length: n }, (_, i) => i).filter((i) => !t[i])
  lost.forEach((i, k) => { out[i] = [VW / 2 + (k - (lost.length - 1) / 2) * 58, VH - 28] })
  return out
}

/* ---------- electron slot geometry ---------- */
/** Evenly spread k directions in the gaps between the `taken` angles (degrees). Largest gap first. */
export function slotAngles(taken: number[], k: number): number[] {
  if (k <= 0) return []
  if (!taken.length) return Array.from({ length: k }, (_, j) => -90 + (360 * j) / k)
  const t = taken.map((a) => ((a % 360) + 360) % 360).sort((a, b) => a - b)
  const gaps = t.map((a, i) => ({ start: a, size: i === t.length - 1 ? t[0] + 360 - a : t[i + 1] - a, cnt: 0 }))
  for (let j = 0; j < k; j++) {
    let bi = 0, bs = -1
    gaps.forEach((g, i) => { const sc = g.size / (g.cnt + 1); if (sc > bs + 1e-9) { bs = sc; bi = i } })
    gaps[bi].cnt++
  }
  const out: number[] = []
  gaps.forEach((g) => { for (let m = 1; m <= g.cnt; m++) out.push(g.start + (g.size * m) / (g.cnt + 1)) })
  return out
}
export function bondAngles(i: number, pos: Pt[], keys: [number, number][]): number[] {
  const out: number[] = []
  keys.forEach(([a, b]) => {
    const o = a === i ? b : b === i ? a : -1
    if (o >= 0) out.push((Math.atan2(pos[o][1] - pos[i][1], pos[o][0] - pos[i][0]) * 180) / Math.PI)
  })
  return out
}

/* ---------- component ---------- */
export interface DrawBond { a: number; b: number; order: number; /** reserve this many parallel lines (for animation) */ slots?: number; label?: string }
export interface NodeBadge { text: string; tone: 'ok' | 'warn' | 'bad' | 'info' | 'plain' }
export interface Arrow { from: Pt; to: Pt; bend?: number }

export interface DrawProps {
  atoms: string[]
  pos: Pt[]
  bonds: DrawBond[]
  lp: number[]
  ue?: number[]
  /** reserve this many lone-pair slots per atom (for animation); default = lp */
  lpSlots?: number[]
  fc?: (number | string)[] | null
  badges?: (NodeBadge | null)[] | null
  subs?: (string | null)[]
  central?: number | null
  selAtom?: number | null
  selBond?: string | null
  /** extra highlight (atom indexes) */
  flash?: number[]
  arrows?: Arrow[]
  interactive?: boolean
  onNodeDown?: (i: number, e: RPointerEvent) => void
  onBondClick?: (key: string, e: RMouseEvent) => void
  onAtomContext?: (i: number, e: RMouseEvent) => void
  onBgClick?: () => void
  svgRef?: Ref<SVGSVGElement>
  onMove?: (e: RPointerEvent<SVGSVGElement>) => void
  onUp?: (e: RPointerEvent<SVGSVGElement>) => void
  height?: number
  vw?: number
  vh?: number
  dim?: boolean
  className?: string
  fcCompact?: boolean
}

const GAP = 4.6
export default function StructureSvg(p: DrawProps) {
  const { atoms, pos, bonds, lp, ue = [], fc, badges } = p
  const n = atoms.length
  const keys: [number, number][] = bonds.filter((b) => (b.slots ?? Math.ceil(b.order)) > 0 || b.order > 0).map((b) => [b.a, b.b])
  const vw = p.vw ?? VW, vh = p.vh ?? VH
  const showFc = (i: number) => fc != null && fc[i] != null && fc[i] !== 0 && fc[i] !== '0'
  return (
    <svg
      ref={p.svgRef}
      viewBox={`0 0 ${vw} ${vh}`}
      className={'lewis-svg' + (p.interactive ? ' interactive' : '') + (p.dim ? ' dim' : '') + (p.className ? ' ' + p.className : '')}
      onPointerMove={p.onMove}
      onPointerUp={p.onUp}
      onPointerLeave={p.onUp}
      onClick={(e) => { if (e.target === e.currentTarget) p.onBgClick?.() }}
      role="img"
      aria-label="Lewis structure"
    >
      <defs>
        <marker id="lewis-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,1 L9,5 L0,9 z" fill="var(--accent)" />
        </marker>
      </defs>
      <rect x="0" y="0" width={vw} height={vh} fill="transparent" onClick={() => p.onBgClick?.()} />
      {/* bonds */}
      {bonds.map((b) => {
        const A = pos[b.a], B = pos[b.b]
        if (!A || !B) return null
        const dx = B[0] - A[0], dy = B[1] - A[1]
        const L = Math.hypot(dx, dy) || 1
        const ux = dx / L, uy = dy / L, nx = -uy, ny = ux
        const ra = atomR(atoms[b.a]) + 1, rb = atomR(atoms[b.b]) + 1
        const x1 = A[0] + ux * ra, y1 = A[1] + uy * ra, x2 = B[0] - ux * rb, y2 = B[1] - uy * rb
        const slots = b.slots ?? Math.max(1, Math.ceil(b.order - 0.01))
        const key = b.a < b.b ? `${b.a}-${b.b}` : `${b.b}-${b.a}`
        const sel = p.selBond === key
        return (
          <g key={key} className={'lewis-bond' + (sel ? ' sel' : '')}>
            {sel && <line x1={x1} y1={y1} x2={x2} y2={y2} className="halo" strokeWidth={slots * GAP + 9} strokeLinecap="round" />}
            {Array.from({ length: slots }, (_, k) => {
              const off = (k - (slots - 1) / 2) * GAP
              const full = b.order >= k + 1 - 0.01
              const part = !full && b.order > k + 0.01
              return (
                <line
                  key={k}
                  x1={x1 + nx * off} y1={y1 + ny * off} x2={x2 + nx * off} y2={y2 + ny * off}
                  className="ln" strokeWidth={2.4} strokeLinecap="round"
                  strokeDasharray={part ? '5 4' : undefined}
                  style={{ opacity: full || part ? 1 : 0 }}
                />
              )
            })}
            {b.label && (
              <g transform={`translate(${(x1 + x2) / 2 + nx * (slots * GAP / 2 + 11)},${(y1 + y2) / 2 + ny * (slots * GAP / 2 + 11)})`}>
                <rect x={-15} y={-8.5} width={30} height={17} rx={8.5} className="blab" />
                <text textAnchor="middle" dy="4" className="blabt">{b.label}</text>
              </g>
            )}
            {p.interactive && (
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="hit" strokeWidth={18} strokeLinecap="round"
                onClick={(e) => { e.stopPropagation(); p.onBondClick?.(key, e) }} />
            )}
          </g>
        )
      })}
      {/* lone pairs and unpaired electrons */}
      {atoms.map((a, i) => {
        const lps = p.lpSlots?.[i] ?? lp[i] ?? 0
        const u = ue[i] ?? 0
        const taken = bondAngles(i, pos, keys)
        if (showFc(i)) taken.push(-48)
        if (badges?.[i]) taken.push(52)
        const slots = slotAngles(taken, lps + u)
        const R = atomR(a) + 9
        return (
          <g key={'e' + i}>
            {slots.map((ang, j) => {
              const isPair = j < lps
              const on = isPair ? j < (lp[i] ?? 0) : true
              return (
                <g key={j} transform={`translate(${pos[i][0]},${pos[i][1]}) rotate(${ang})`} className="lewis-e" style={{ opacity: on ? 1 : 0 }}>
                  {isPair ? (<><circle cx={R} cy={-3.5} r={2.5} /><circle cx={R} cy={3.5} r={2.5} /></>) : <circle cx={R} cy={0} r={2.5} />}
                </g>
              )
            })}
          </g>
        )
      })}
      {/* arrows */}
      {p.arrows?.map((ar, k) => {
        const [x1, y1] = ar.from, [x2, y2] = ar.to
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
        const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1
        const bend = ar.bend ?? 0.45
        const cx = mx - (dy / L) * L * bend, cy = my + (dx / L) * L * bend
        return <path key={k} d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`} className="lewis-arrow" markerEnd="url(#lewis-arrow)" />
      })}
      {/* nodes */}
      {atoms.map((a, i) => {
        const [fill, fg] = cpk(a)
        const r = atomR(a)
        const sel = p.selAtom === i
        const bd = badges?.[i]
        return (
          <g key={'n' + i} transform={`translate(${pos[i][0]},${pos[i][1]})`}
            className={'lewis-node' + (sel ? ' sel' : '') + (p.flash?.includes(i) ? ' flash' : '')}
            onPointerDown={p.interactive ? (e) => { e.stopPropagation(); p.onNodeDown?.(i, e) } : undefined}
            onContextMenu={p.interactive ? (e) => { e.preventDefault(); p.onAtomContext?.(i, e) } : undefined}
          >
            {p.central === i && <circle r={r + 6} className="central-ring" />}
            {sel && <circle r={r + 4} className="sel-ring" />}
            <circle r={r} className="body" fill={fill} stroke={a === 'H' ? '#9aa4b2' : 'rgba(0,0,0,.22)'} strokeWidth={a === 'H' ? 1.4 : 1} />
            <circle r={r - 3} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth={1} style={{ display: a === 'H' ? 'none' : undefined }} />
            <text textAnchor="middle" dy="5.2" fill={fg} className="sym" fontSize={a === 'H' ? 14 : a.length > 1 ? 14 : 16}>{a}</text>
            {p.subs?.[i] && <text x={r * 0.62} y={r * 0.95} fill={fg} className="idx" fontSize={8.5}>{p.subs[i]}</text>}
            {showFc(i) && (
              <g transform={`translate(${r * 0.82},${-r * 0.92})`} className="fcb">
                <circle r={8.5} className={'fcc ' + (typeof fc![i] === 'number' ? ((fc![i] as number) > 0 ? 'pos' : 'neg') : 'frac')} />
                <text textAnchor="middle" dy="3.6" className="fct">{fcText(fc![i])}</text>
              </g>
            )}
            {bd && (
              <g transform={`translate(${r * 0.78},${r * 0.95})`} className={'ocb ' + bd.tone}>
                <rect x={-4} y={-8} width={bd.text.length * 6.4 + 10} height={15} rx={7.5} />
                <text x={bd.text.length * 3.2 + 1} dy="3.5" textAnchor="middle">{bd.text}</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
function fcText(v: number | string): string {
  if (typeof v === 'string') return v
  const m = Math.abs(v)
  return (m > 1 ? String(m) : '') + (v > 0 ? '+' : '−')
}

/** Anchor point at distance `d` from atom i in the first free direction (used to start curved arrows). */
export function freeAnchor(i: number, atoms: string[], pos: Pt[], keys: [number, number][], k: number, which: number, d = 30): Pt {
  const ang = slotAngles(bondAngles(i, pos, keys), Math.max(k, 1))[Math.min(which, Math.max(k, 1) - 1)] ?? 0
  return [pos[i][0] + d * Math.cos(rad(ang)), pos[i][1] + d * Math.sin(rad(ang))]
}

/** Layout of a species' accepted skeleton, rooted at its central atom, fitted to the canvas. */
export function specLayout(n: number, skeleton: [number, number][], root: number): Pt[] {
  const t = treeLayout(n, skeleton, root)
  return fitLayout(t.map((p) => p ?? ([0, 0] as Pt)))
}
/** Small index digits for repeated elements: ["O","O","S"] -> ["1","2",null] */
export function subDigits(atoms: string[]): (string | null)[] {
  const total: Record<string, number> = {}
  atoms.forEach((a) => { total[a] = (total[a] ?? 0) + 1 })
  const seen: Record<string, number> = {}
  return atoms.map((a) => (total[a] > 1 ? String((seen[a] = (seen[a] ?? 0) + 1)) : null))
}
