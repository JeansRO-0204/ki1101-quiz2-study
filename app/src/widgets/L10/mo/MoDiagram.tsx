import type { ReactElement } from 'react'
import { atomAO, boxStarts, EN, levelsFor, type Level, type Order, type Species } from './engine'
import './mo.css'

const W = 560
const TOP = 36
const H_PLOT = 330
const H = 420
const BOX = 44
const AOW = 22
const CX = 280

function MoLabel({ l, x, y, anchor = 'start' }: { l: Level; x: number; y: number; anchor?: 'start' | 'end' | 'middle' }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className="mo-lbl">
      {l.sym}
      {l.star && <tspan dy={-5} fontSize={12}>*</tspan>}
      <tspan dy={l.star ? 9 : 5} fontSize={11}>{l.sub}</tspan>
    </text>
  )
}

function Arrow({ x, y, up, on }: { x: number; y: number; up: boolean; on: boolean }) {
  // arrow glyph inside a box of height 24: shaft + head
  const y1 = up ? y + 20 : y + 4
  const y2 = up ? y + 4 : y + 20
  const h = up ? 5 : -5
  return (
    <g className={'mo-arrow' + (on ? ' on' : '')}>
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <path d={`M${x - 3.5} ${y2 + h} L${x} ${y2} L${x + 3.5} ${y2 + h}`} fill="none" />
    </g>
  )
}

/** SVG MO energy diagram: AOs of A (left), MOs (middle, clickable boxes), AOs of B (right), dashed correlation lines. */
export function MoDiagram({ sp, order, occ, onBox, flags, readOnly }: {
  sp: Species; order: Order; occ: number[]; onBox?: (i: number) => void
  flags?: Record<number, 'ok' | 'err'>; readOnly?: boolean
}) {
  const ls = levelsFor(sp.kind, order)
  const st = boxStarts(ls)
  const Y = (e: number) => TOP + (1 - e) * H_PLOT
  const hetero = sp.A !== sp.B
  const enA = EN[sp.A] ?? 0, enB = EN[sp.B] ?? 0
  const shift = hetero ? Math.min(34, 10 + 22 * Math.abs(enA - enB)) : 0
  const dA = enA > enB ? shift : 0 // more electronegative atom is drawn lower
  const dB = enB > enA ? shift : 0
  const is1s = sp.kind === '1s'
  const aoE = { '1s': 0.46, '2s': 0.2, '2p': 0.66 } as const

  const aoGroup = (side: 'A' | 'B') => {
    const sym = side === 'A' ? sp.A : sp.B
    const d = side === 'A' ? dA : dB
    const occA = atomAO(sym)
    const x0 = side === 'A' ? 34 : W - 34 - (is1s ? AOW : 3 * AOW + 8)
    const out: ReactElement[] = []
    const draw = (x: number, y: number, n: number, key: string, label?: string) => (
      <g key={key} className="mo-ao">
        <line x1={x} x2={x + AOW} y1={y + 12} y2={y + 12} />
        {n >= 1 && <Arrow x={x + 7} y={y - 4} up on />}
        {n >= 2 && <Arrow x={x + 15} y={y - 4} up={false} on />}
        {label && <text x={x + AOW / 2} y={y + 28} textAnchor="middle" className="mo-aol">{label}</text>}
      </g>
    )
    if (is1s) {
      out.push(draw(x0, Y(aoE['1s']) + d - 12, occA.s1 ?? 0, '1s', '1s'))
    } else {
      out.push(draw(x0 + (3 * AOW + 8 - AOW) / 2, Y(aoE['2s']) + d - 12, occA.s2 ?? 0, '2s', '2s'))
      ;['x', 'y', 'z'].forEach((a, i) => out.push(draw(x0 + i * (AOW + 4), Y(aoE['2p']) + d - 12, occA.p[i] ?? 0, 'p' + a, '2p' + a)))
    }
    return out
  }

  // correlation lines
  const lines: ReactElement[] = []
  const aoGeom = (side: 'A' | 'B', ao: '1s' | '2s' | '2p') => {
    const d = side === 'A' ? dA : dB
    const w = is1s ? AOW : 3 * AOW + 8
    const x0 = side === 'A' ? 34 : W - 34 - w
    const xi = side === 'A' ? x0 + (ao === '2s' ? (w + AOW) / 2 : w) : x0 + (ao === '2s' ? (w - AOW) / 2 : 0)
    return { x: xi, y: Y(aoE[ao]) + d }
  }
  ls.forEach((l) => {
    const y = Y(l.e) + 0
    const half = l.n === 2 ? BOX + 4 : BOX / 2
    const a = aoGeom('A', l.ao), b = aoGeom('B', l.ao)
    lines.push(<line key={l.key + 'a'} className="mo-corr" x1={a.x + 2} y1={a.y} x2={CX - half - 3} y2={y} />)
    lines.push(<line key={l.key + 'b'} className="mo-corr" x1={b.x - 2} y1={b.y} x2={CX + half + 3} y2={y} />)
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mo-svg" role="img" aria-label={`MO diagram of ${sp.id}`}>
      <defs>
        <marker id="mo-ax" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#647084" strokeWidth="1.6" /></marker>
      </defs>
      <line x1={14} y1={H_PLOT + TOP} x2={14} y2={TOP - 12} stroke="#647084" strokeWidth={1.4} markerEnd="url(#mo-ax)" />
      <text x={22} y={TOP - 8} className="mo-axis">Energy</text>
      {lines}
      {aoGroup('A')}
      {aoGroup('B')}
      {ls.map((l, i) => {
        const y = Y(l.e) - 12
        const boxes = Array.from({ length: l.n }, (_, k) => k)
        const total = l.n === 2 ? BOX * 2 + 8 : BOX
        return (
          <g key={l.key}>
            {boxes.map((k) => {
              const idx = st[i] + k
              const x = CX - total / 2 + k * (BOX + 8)
              const o = occ[idx] ?? 0
              const f = flags?.[idx]
              return (
                <g key={k} className={'mo-box' + (l.star ? ' anti' : '') + (readOnly ? ' ro' : '') + (f ? ' ' + f : '')}
                  tabIndex={readOnly ? -1 : 0} role={readOnly ? undefined : 'button'}
                  aria-label={`${l.sym}${l.star ? '*' : ''}${l.sub} orbital, ${o} electrons. Click to change.`}
                  onClick={() => onBox?.(idx)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBox?.(idx) } }}>
                  <rect x={x} y={y} width={BOX} height={24} rx={5} className="mo-rect" />
                  <line x1={x} x2={x + BOX} y1={y + 24} y2={y + 24} className="mo-base" />
                  <Arrow x={x + 14} y={y} up on={o >= 1} />
                  <Arrow x={x + 30} y={y} up={false} on={o >= 2} />
                </g>
              )
            })}
            <MoLabel l={l} x={CX + total / 2 + 12} y={Y(l.e) + 5} />
          </g>
        )
      })}
      <text x={74} y={H - 10} textAnchor="middle" className="mo-atom">{sp.A}{hetero ? '' : ' (atom)'}</text>
      <text x={CX} y={H - 10} textAnchor="middle" className="mo-atom">{sp.id.replace(/\^/, '')}</text>
      <text x={W - 74} y={H - 10} textAnchor="middle" className="mo-atom">{sp.B}{hetero ? '' : ' (atom)'}</text>
    </svg>
  )
}
