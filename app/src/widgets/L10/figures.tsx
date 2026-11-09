// Static diagrams for L10 Materials and the Rangkuman (ids referenced from content/L10.ts `figures`). Draw them like the lecture slides.
// VSEPR shapes use the slides' ball-and-stick style (s17–s24): black central atom, open circles for outer atoms, wedge = towards you,
// hashed = away, lobe with two dots = lone pair. MO diagrams follow s102, s116/s117, s119–s126 and s129/s130.
import type { ReactNode } from 'react'
import type { FigureDef } from '../../types'

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif"
const INK = '#1d1d1f'
const MUTED = '#6e6e73'
const BLUE = '#007aff'
const LINE = '#d2d2d7'
const E_ARROW = '#e8590c' // electron arrows (the slides draw them red-orange)
const MO_LABEL = '#1d3fbf' // MO labels (the slides use blue)

/* ================================================================== VSEPR shapes */

type Kind = 'plain' | 'wedge' | 'dash'
type Pos = { d: [number, number]; k: Kind }
type Shape = { pos: Pos[]; lp: number[] } // lp = indexes of positions taken by lone pairs

const LIN: Pos[] = [{ d: [-1, 0], k: 'plain' }, { d: [1, 0], k: 'plain' }]
const TRI: Pos[] = [{ d: [0, -1], k: 'plain' }, { d: [-0.87, 0.5], k: 'plain' }, { d: [0.87, 0.5], k: 'plain' }]
const TET: Pos[] = [{ d: [0, -1], k: 'plain' }, { d: [-0.88, 0.45], k: 'plain' }, { d: [0.35, 0.82], k: 'wedge' }, { d: [0.9, 0.3], k: 'dash' }]
// trigonal bipyramid: 0,1 axial; 2,3,4 equatorial (right, back-left, front-left)
const TBP: Pos[] = [{ d: [0, -1], k: 'plain' }, { d: [0, 1], k: 'plain' }, { d: [1, 0], k: 'plain' }, { d: [-0.85, -0.32], k: 'dash' }, { d: [-0.75, 0.42], k: 'wedge' }]
// octahedron: 0,1 axial; 2..5 the square (front-left, front-right, back-left, back-right)
const OCT: Pos[] = [{ d: [0, -1], k: 'plain' }, { d: [0, 1], k: 'plain' }, { d: [-0.85, 0.36], k: 'wedge' }, { d: [0.62, 0.46], k: 'wedge' }, { d: [-0.62, -0.42], k: 'dash' }, { d: [0.85, -0.34], k: 'dash' }]

function Molecule({ cx, cy, L, shape, labels }: { cx: number; cy: number; L: number; shape: Shape; labels?: string[] }) {
  const lobes: ReactNode[] = []
  const bonds: ReactNode[] = []
  const atoms: ReactNode[] = []
  shape.pos.forEach((p, i) => {
    const [dx, dy] = p.d
    const ex = cx + dx * L, ey = cy + dy * L
    const len = Math.hypot(dx, dy) || 1
    const ux = dx / len, uy = dy / len
    const px = -uy, py = ux
    if (shape.lp.includes(i)) {
      const mx = cx + ux * L * 0.52, my = cy + uy * L * 0.52
      const ang = (Math.atan2(uy, ux) * 180) / Math.PI
      const tx = cx + ux * L * 0.74, ty = cy + uy * L * 0.74
      lobes.push(
        <g key={'lp' + i}>
          <ellipse cx={mx} cy={my} rx={L * 0.5} ry={L * 0.27} transform={`rotate(${ang} ${mx} ${my})`} fill="#fff" stroke={INK} strokeWidth={1.3} />
          <circle cx={tx + px * 4} cy={ty + py * 4} r={2.2} fill={INK} />
          <circle cx={tx - px * 4} cy={ty - py * 4} r={2.2} fill={INK} />
        </g>,
      )
      return
    }
    if (p.k === 'plain') bonds.push(<line key={'b' + i} x1={cx} y1={cy} x2={ex} y2={ey} stroke={INK} strokeWidth={2} />)
    else if (p.k === 'wedge')
      bonds.push(<polygon key={'b' + i} points={`${cx},${cy} ${ex + px * 5.5},${ey + py * 5.5} ${ex - px * 5.5},${ey - py * 5.5}`} fill={INK} />)
    else {
      const segs: ReactNode[] = []
      for (let s = 1; s <= 6; s++) {
        const t = s / 7
        const qx = cx + dx * L * t, qy = cy + dy * L * t
        const w = 1 + 4.5 * t
        segs.push(<line key={s} x1={qx + px * w} y1={qy + py * w} x2={qx - px * w} y2={qy - py * w} stroke={INK} strokeWidth={1.4} />)
      }
      bonds.push(<g key={'b' + i}>{segs}</g>)
    }
    atoms.push(
      <g key={'a' + i}>
        <circle cx={ex} cy={ey} r={labels ? 13 : 10} fill="#fff" stroke={INK} strokeWidth={1.4} />
        {labels?.[i] && <text x={ex} y={ey + 4.5} textAnchor="middle" fontSize={13} fontWeight={600} fill={INK}>{labels[i]}</text>}
      </g>,
    )
  })
  return (
    <g>
      {lobes}
      {bonds}
      <circle cx={cx} cy={cy} r={labels ? 13 : 8.5} fill={labels ? '#fff' : INK} stroke={INK} strokeWidth={1.4} />
      {atoms}
    </g>
  )
}

type Cell = { ax: string; name: string; ex: string; shape: Shape } | null
type Row = { dom: string; geo: string; hyb: string; ang: string; cells: Cell[] }

function VseprGrid({ rows, cols, cellW }: { rows: Row[]; cols: string[]; cellW: number }) {
  const left = 132, head = 34, cellH = 168
  const W = left + cols.length * cellW, H = head + rows.length * cellH + 6
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fontFamily={FONT} role="img" aria-label="VSEPR shapes table">
      <rect x={0} y={0} width={W} height={head} fill="#f5f5f7" rx={8} />
      <text x={12} y={22} fontSize={13} fontWeight={600} fill={MUTED}>Domains</text>
      {cols.map((c, j) => (
        <text key={c} x={left + j * cellW + cellW / 2} y={22} textAnchor="middle" fontSize={13} fontWeight={600} fill={MUTED}>{c}</text>
      ))}
      {rows.map((r, i) => {
        const y0 = head + i * cellH
        return (
          <g key={r.dom}>
            {i > 0 && <line x1={0} x2={W} y1={y0} y2={y0} stroke={LINE} />}
            <text x={12} y={y0 + 50} fontSize={16} fontWeight={700} fill={INK}>{r.dom}</text>
            <text x={12} y={y0 + 70} fontSize={12.5} fill={INK}>{r.geo}</text>
            <text x={12} y={y0 + 90} fontSize={12.5} fill={BLUE} fontWeight={600}>{r.hyb}</text>
            <text x={12} y={y0 + 108} fontSize={12.5} fill={MUTED}>{r.ang}</text>
            {r.cells.map((c, j) => {
              const x0 = left + j * cellW
              if (!c) return null
              return (
                <g key={j}>
                  <Molecule cx={x0 + cellW / 2} cy={y0 + 64} L={40} shape={c.shape} />
                  <text x={x0 + cellW / 2} y={y0 + 124} textAnchor="middle" fontSize={12.5} fontWeight={600} fill={BLUE}>{c.ax}</text>
                  <text x={x0 + cellW / 2} y={y0 + 141} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>{c.name}</text>
                  <text x={x0 + cellW / 2} y={y0 + 158} textAnchor="middle" fontSize={12} fill={MUTED}>{c.ex}</text>
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

const VseprSmall = () => (
  <VseprGrid
    cellW={160}
    cols={['0 lone pairs', '1 lone pair', '2 lone pairs']}
    rows={[
      { dom: '2', geo: 'linear', hyb: 'sp', ang: '180°', cells: [{ ax: 'AX₂', name: 'Linear', ex: 'CO₂ · 180°', shape: { pos: LIN, lp: [] } }, null, null] },
      {
        dom: '3', geo: 'trigonal planar', hyb: 'sp²', ang: '120°',
        cells: [
          { ax: 'AX₃', name: 'Trigonal planar', ex: 'BCl₃ · 120°', shape: { pos: TRI, lp: [] } },
          { ax: 'AX₂E', name: 'Bent (V-shaped)', ex: 'SO₂ · < 120°', shape: { pos: TRI, lp: [0] } },
          null,
        ],
      },
      {
        dom: '4', geo: 'tetrahedral', hyb: 'sp³', ang: '109.5°',
        cells: [
          { ax: 'AX₄', name: 'Tetrahedral', ex: 'CH₄ · 109.5°', shape: { pos: TET, lp: [] } },
          { ax: 'AX₃E', name: 'Trigonal pyramidal', ex: 'NH₃ · 107°', shape: { pos: TET, lp: [0] } },
          { ax: 'AX₂E₂', name: 'Bent (V-shaped)', ex: 'H₂O · 104.5°', shape: { pos: TET, lp: [0, 3] } },
        ],
      },
    ]}
  />
)

const VseprBig = () => (
  <VseprGrid
    cellW={150}
    cols={['0 lone pairs', '1 lone pair', '2 lone pairs', '3 lone pairs']}
    rows={[
      {
        dom: '5', geo: 'trigonal bipyramidal', hyb: 'sp³d', ang: '90° and 120°',
        cells: [
          { ax: 'AX₅', name: 'Trigonal bipyramidal', ex: 'PF₅ · 90°, 120°', shape: { pos: TBP, lp: [] } },
          { ax: 'AX₄E', name: 'Seesaw', ex: 'SF₄ · ax–eq < 90°', shape: { pos: TBP, lp: [2] } },
          { ax: 'AX₃E₂', name: 'T-shaped', ex: 'ClF₃ · 90°', shape: { pos: TBP, lp: [3, 4] } },
          { ax: 'AX₂E₃', name: 'Linear', ex: 'XeF₂, I₃⁻ · 180°', shape: { pos: TBP, lp: [2, 3, 4] } },
        ],
      },
      {
        dom: '6', geo: 'octahedral', hyb: 'sp³d²', ang: '90°',
        cells: [
          { ax: 'AX₆', name: 'Octahedral', ex: 'SF₆ · 90°', shape: { pos: OCT, lp: [] } },
          { ax: 'AX₅E', name: 'Square pyramidal', ex: 'BrF₅ · < 90°', shape: { pos: OCT, lp: [1] } },
          { ax: 'AX₄E₂', name: 'Square planar', ex: 'XeF₄ · 90°', shape: { pos: OCT, lp: [0, 1] } },
          null,
        ],
      },
    ]}
  />
)

/** Why lone pairs go equatorial in a trigonal bipyramid (s19, s21). */
const TbpLonePair = () => {
  const L = 54
  return (
    <svg viewBox="0 0 640 270" fontFamily={FONT} role="img" aria-label="Axial and equatorial positions; lone pair placement">
      {/* panel 1: positions */}
      <Molecule cx={110} cy={120} L={L} shape={{ pos: TBP, lp: [] }} />
      <text x={128} y={64} fontSize={12.5} fill={BLUE} fontWeight={600}>axial</text>
      <text x={128} y={186} fontSize={12.5} fill={BLUE} fontWeight={600}>axial</text>
      <text x={176} y={110} fontSize={12.5} fill="#c2410c" fontWeight={600}>eq</text>
      <text x={14} y={92} fontSize={12.5} fill="#c2410c" fontWeight={600}>eq</text>
      <text x={14} y={158} fontSize={12.5} fill="#c2410c" fontWeight={600}>eq</text>
      <text x={110} y={226} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>ax–eq 90°, eq–eq 120°</text>
      <text x={110} y={244} textAnchor="middle" fontSize={12} fill={MUTED}>equatorial = more room</text>

      {/* panel 2: lone pair equatorial (correct) */}
      <Molecule cx={325} cy={120} L={L} shape={{ pos: TBP, lp: [2] }} />
      <text x={325} y={226} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1a7f37">✓ lone pair equatorial</text>
      <text x={325} y={244} textAnchor="middle" fontSize={12} fill={MUTED}>only 2 neighbours at 90°</text>
      <text x={325} y={260} textAnchor="middle" fontSize={12} fill={MUTED}>(SF₄ seesaw)</text>

      {/* panel 3: lone pair axial (wrong) */}
      <Molecule cx={535} cy={120} L={L} shape={{ pos: TBP, lp: [0] }} />
      <text x={535} y={226} textAnchor="middle" fontSize={13} fontWeight={700} fill="#c62828">✗ lone pair axial</text>
      <text x={535} y={244} textAnchor="middle" fontSize={12} fill={MUTED}>3 neighbours at 90°</text>
      <text x={535} y={260} textAnchor="middle" fontSize={12} fill={MUTED}>(more repulsion, not observed)</text>
      <line x1={218} x2={218} y1={20} y2={250} stroke={LINE} />
      <line x1={430} x2={430} y1={20} y2={250} stroke={LINE} />
    </svg>
  )
}

/* ================================================================== polarity */

function Dipole({ x1, y1, x2, y2, off = 15, color = '#c2410c' }: { x1: number; y1: number; x2: number; y2: number; off?: number; color?: string }) {
  // crossed arrow drawn parallel to the bond, pointing from δ+ (x1,y1) to δ− (x2,y2)
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy)
  const ux = dx / len, uy = dy / len, px = -uy * off, py = ux * off
  const a = { x: x1 + ux * len * 0.18 + px, y: y1 + uy * len * 0.18 + py }
  const b = { x: x1 + ux * len * 0.82 + px, y: y1 + uy * len * 0.82 + py }
  const hx = b.x - ux * 8, hy = b.y - uy * 8
  const cx = a.x + ux * 7, cy = a.y + uy * 7
  return (
    <g stroke={color} strokeWidth={1.8} fill={color}>
      <line x1={a.x} y1={a.y} x2={hx} y2={hy} />
      <line x1={cx - uy * 5} y1={cy + ux * 5} x2={cx + uy * 5} y2={cy - ux * 5} />
      <polygon points={`${b.x},${b.y} ${hx - uy * 4.5},${hy + ux * 4.5} ${hx + uy * 4.5},${hy - ux * 4.5}`} stroke="none" />
    </g>
  )
}

function Atom({ x, y, t }: { x: number; y: number; t: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={15} fill="#fff" stroke={INK} strokeWidth={1.4} />
      <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={600} fill={INK}>{t}</text>
    </g>
  )
}

const PolarityFig = () => (
  <svg viewBox="0 0 640 250" fontFamily={FONT} role="img" aria-label="Bond dipoles in CO2, BCl3 and H2O">
    {/* CO2 */}
    <line x1={40} y1={104} x2={170} y2={104} stroke={INK} strokeWidth={2} />
    <line x1={40} y1={112} x2={170} y2={112} stroke={INK} strokeWidth={2} />
    <Dipole x1={105} y1={108} x2={40} y2={108} off={-22} />
    <Dipole x1={105} y1={108} x2={170} y2={108} off={22} />
    <Atom x={40} y={108} t="O" /><Atom x={105} y={108} t="C" /><Atom x={170} y={108} t="O" />
    <text x={105} y={180} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>CO₂ · linear</text>
    <text x={105} y={198} textAnchor="middle" fontSize={12.5} fill={MUTED}>equal and opposite: cancel</text>
    <text x={105} y={220} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#1a7f37">nonpolar</text>

    {/* BCl3 */}
    {[[320, 50], [268, 140], [372, 140]].map(([x, y], i) => (
      <g key={i}>
        <line x1={320} y1={108} x2={x} y2={y} stroke={INK} strokeWidth={2} />
        <Dipole x1={320} y1={108} x2={x} y2={y} off={i === 1 ? -16 : 16} />
      </g>
    ))}
    <Atom x={320} y={108} t="B" />
    <Atom x={320} y={50} t="Cl" /><Atom x={268} y={140} t="Cl" /><Atom x={372} y={140} t="Cl" />
    <text x={320} y={180} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>BCl₃ · trigonal planar</text>
    <text x={320} y={198} textAnchor="middle" fontSize={12.5} fill={MUTED}>three at 120°: sum to zero</text>
    <text x={320} y={220} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#1a7f37">nonpolar</text>

    {/* H2O */}
    <ellipse cx={512} cy={66} rx={22} ry={11} transform="rotate(-60 512 66)" fill="#fff" stroke={INK} strokeWidth={1.2} />
    <ellipse cx={552} cy={66} rx={22} ry={11} transform="rotate(60 552 66)" fill="#fff" stroke={INK} strokeWidth={1.2} />
    <line x1={532} y1={92} x2={490} y2={140} stroke={INK} strokeWidth={2} />
    <line x1={532} y1={92} x2={574} y2={140} stroke={INK} strokeWidth={2} />
    <Dipole x1={490} y1={140} x2={532} y2={92} off={16} />
    <Dipole x1={574} y1={140} x2={532} y2={92} off={-16} />
    <Atom x={532} y={92} t="O" /><Atom x={490} y={140} t="H" /><Atom x={574} y={140} t="H" />
    <g stroke={BLUE} fill={BLUE} strokeWidth={3}>
      <line x1={618} y1={140} x2={618} y2={102} />
      <polygon points="618,90 611,104 625,104" stroke="none" />
    </g>
    <text x={618} y={158} textAnchor="middle" fontSize={11.5} fill={BLUE} fontWeight={600}>net μ</text>
    <text x={532} y={180} textAnchor="middle" fontSize={13} fontWeight={700} fill={INK}>H₂O · bent (AX₂E₂)</text>
    <text x={532} y={198} textAnchor="middle" fontSize={12.5} fill={MUTED}>dipoles add up towards O</text>
    <text x={532} y={220} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#c62828">polar</text>
    <line x1={212} x2={212} y1={20} y2={230} stroke={LINE} />
    <line x1={428} x2={428} y1={20} y2={230} stroke={LINE} />
    <text x={320} y={244} textAnchor="middle" fontSize={11.5} fill={MUTED}>Crossed arrow = bond dipole, + end at the less electronegative atom, head at the δ− end.</text>
  </svg>
)

/* ================================================================== MO diagrams */

function Electrons({ x, y, n }: { x: number; y: number; n: number }) {
  // n = 0, 1 (up) or 2 (up + down) on an orbital line centred at x
  const arrow = (ax: number, up: boolean, k: string) => {
    const top = y - 12, bot = y + 12
    const tip = up ? top : bot
    const s = up ? 1 : -1
    return (
      <g key={k} stroke={E_ARROW} fill={E_ARROW} strokeWidth={1.8}>
        <line x1={ax} y1={up ? bot : top} x2={ax} y2={tip + s * 5} />
        <polygon points={`${ax},${tip} ${ax - 4},${tip + s * 7} ${ax + 4},${tip + s * 7}`} stroke="none" />
      </g>
    )
  }
  if (n === 0) return null
  if (n === 1) return arrow(x, true, 'u')
  return <g>{arrow(x - 4.5, true, 'u')}{arrow(x + 4.5, false, 'd')}</g>
}

/** MO label like σ*2pz or π*2px, π*2py, with sub- and superscripts (SVG tspans). `sub` may hold two names separated by a comma. */
function MoLab({ x, y, g, sub, star, anchor = 'start', size = 15 }: { x: number; y: number; g: string; sub: string; star?: boolean; anchor?: 'start' | 'end' | 'middle'; size?: number }) {
  const subs = sub.split(',').map((t) => t.trim())
  const parts: ReactNode[] = []
  let cur = 0 // current baseline offset
  subs.forEach((t, i) => {
    parts.push(<tspan key={'g' + i} dy={-cur}>{i > 0 ? ', ' : ''}{g}</tspan>)
    cur = 0
    if (star) { parts.push(<tspan key={'s' + i} dy={-7} fontSize={size * 0.8}>*</tspan>); cur = -7 }
    parts.push(<tspan key={'b' + i} dy={4 - cur} fontSize={size * 0.68}>{t}</tspan>)
    cur = 4
  })
  return (
    <text x={x} y={y} fontSize={size} fill={MO_LABEL} fontWeight={600} textAnchor={anchor} fontFamily="'Times New Roman', Times, serif"
      stroke="#fff" strokeWidth={3} paintOrder="stroke">
      {parts}
    </text>
  )
}

/** fill n electrons into a degenerate set of k orbitals by Hund's rule */
function hund(n: number, k: number): number[] {
  const out = Array(k).fill(0)
  for (let i = 0; i < n; i++) out[i % k] += 1
  return out
}

type Level = { key: string; g: string; sub: string; star?: boolean; deg: 1 | 2; y: number; from: '2s' | '2p' }

function levels(order: 'pi-low' | 'sigma-low'): Level[] {
  const piLow = order === 'pi-low'
  return [
    { key: 's2s', g: 'σ', sub: '2s', deg: 1, y: 368, from: '2s' },
    { key: 's2s*', g: 'σ', sub: '2s', star: true, deg: 1, y: 302, from: '2s' },
    piLow
      ? { key: 'p2p', g: 'π', sub: '2px, 2py', deg: 2, y: 250, from: '2p' }
      : { key: 's2p', g: 'σ', sub: '2pz', deg: 1, y: 252, from: '2p' },
    piLow
      ? { key: 's2p', g: 'σ', sub: '2pz', deg: 1, y: 222, from: '2p' }
      : { key: 'p2p', g: 'π', sub: '2px, 2py', deg: 2, y: 224, from: '2p' },
    { key: 'p2p*', g: 'π', sub: '2px, 2py', star: true, deg: 2, y: 150, from: '2p' },
    { key: 's2p*', g: 'σ', sub: '2pz', star: true, deg: 1, y: 116, from: '2p' },
  ]
}

/** Second-row homonuclear diatomic, drawn like s116/s117 (empty) and s119–s126 (filled). eAtom = valence e⁻ per atom (0 = empty template). */
function SecondRowMO({ order, eAtom, atom, mol, bo, mag, mec }: { order: 'pi-low' | 'sigma-low'; eAtom: number; atom?: string; mol?: string; bo?: string; mag?: string; mec?: string }) {
  const lv = levels(order)
  const W = 640, H = 410
  const cx = 320, half = 34, gap = 6
  const aoL = { s: [120, 180], p: [[62, 98], [106, 142], [150, 186]] }
  const aoR = { s: [460, 520], p: [[454, 490], [498, 534], [542, 578]] }
  const yS = 334, yP = 186
  // electrons
  let left = eAtom * 2
  const fill: Record<string, number[]> = {}
  for (const l of lv) {
    const cap = l.deg * 2
    const n = Math.min(cap, left)
    left -= n
    fill[l.key] = l.deg === 1 ? [n] : hund(n, 2)
  }
  const aoS = Math.min(2, eAtom), aoP = hund(Math.max(0, eAtom - 2), 3)
  const lineX = (l: Level): [number, number][] =>
    l.deg === 1 ? [[cx - half, cx + half]] : [[cx - half - 6, cx - gap / 2 - 3], [cx + gap / 2 + 3, cx + half + 6]]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fontFamily={FONT} role="img" aria-label={`MO energy diagram${mol ? ' for ' + mol : ''}`}>
      {/* energy axis */}
      <g stroke="#c2410c" fill="#c2410c">
        <line x1={22} y1={392} x2={22} y2={52} strokeWidth={4} />
        <polygon points="22,36 13,56 31,56" stroke="none" />
      </g>
      <text x={14} y={230} fontSize={13} fill={INK} transform="rotate(-90 14 230)" textAnchor="middle">Energy</text>
      {/* correlation lines */}
      <g stroke={INK} strokeWidth={1} strokeDasharray="4 3" fill="none">
        {lv.map((l) => {
          const xs = lineX(l)
          const lx = xs[0][0], rx = xs[xs.length - 1][1]
          const fromL = l.from === '2s' ? [aoL.s[1], yS] : [aoL.p[2][1], yP]
          const fromR = l.from === '2s' ? [aoR.s[0], yS] : [aoR.p[0][0], yP]
          return (
            <g key={l.key}>
              <line x1={fromL[0]} y1={fromL[1]} x2={lx} y2={l.y} />
              <line x1={fromR[0]} y1={fromR[1]} x2={rx} y2={l.y} />
            </g>
          )
        })}
      </g>
      {/* AO levels */}
      <g stroke={INK} strokeWidth={1.8}>
        <line x1={aoL.s[0]} x2={aoL.s[1]} y1={yS} y2={yS} />
        <line x1={aoR.s[0]} x2={aoR.s[1]} y1={yS} y2={yS} />
        {aoL.p.map(([a, b], i) => <line key={'l' + i} x1={a} x2={b} y1={yP} y2={yP} />)}
        {aoR.p.map(([a, b], i) => <line key={'r' + i} x1={a} x2={b} y1={yP} y2={yP} />)}
      </g>
      <text x={150} y={356} textAnchor="middle" fontSize={16} fontStyle="italic" fontFamily="'Times New Roman', Times, serif" fill={INK}>2s</text>
      <text x={490} y={356} textAnchor="middle" fontSize={16} fontStyle="italic" fontFamily="'Times New Roman', Times, serif" fill={INK}>2s</text>
      <text x={124} y={208} textAnchor="middle" fontSize={16} fontStyle="italic" fontFamily="'Times New Roman', Times, serif" fill={INK}>2p</text>
      <text x={516} y={208} textAnchor="middle" fontSize={16} fontStyle="italic" fontFamily="'Times New Roman', Times, serif" fill={INK}>2p</text>
      {eAtom > 0 && (
        <g>
          <Electrons x={150} y={yS} n={aoS} />
          <Electrons x={490} y={yS} n={aoS} />
          {aoL.p.map(([a, b], i) => <Electrons key={'el' + i} x={(a + b) / 2} y={yP} n={aoP[i]} />)}
          {aoR.p.map(([a, b], i) => <Electrons key={'er' + i} x={(a + b) / 2} y={yP} n={aoP[i]} />)}
        </g>
      )}
      {/* MO levels */}
      {lv.map((l) => {
        const xs = lineX(l)
        return (
          <g key={l.key}>
            {xs.map(([a, b], i) => (
              <g key={i}>
                <line x1={a} x2={b} y1={l.y} y2={l.y} stroke={INK} strokeWidth={1.8} />
                {eAtom > 0 && <Electrons x={(a + b) / 2} y={l.y} n={fill[l.key][i] ?? 0} />}
              </g>
            ))}
            <MoLab x={xs[xs.length - 1][1] + 8} y={l.y + (l.deg === 2 ? 14 : 5)} g={l.g} sub={l.sub} star={l.star} />
          </g>
        )
      })}
      {atom && (
        <g fontSize={13} fill={BLUE} textAnchor="middle">
          <text x={150} y={396}>{atom}</text>
          <text x={490} y={396}>{atom}</text>
          <text x={cx} y={398} fontWeight={700}>{mol}</text>
        </g>
      )}
      {bo && <text x={46} y={40} fontSize={13.5} fill={INK} fontWeight={600}>{bo}</text>}
      {mag && <text x={W - 8} y={40} fontSize={13.5} textAnchor="end" fill={/para/i.test(mag) ? '#c62828' : '#1a7f37'} fontWeight={700}>{mag}</text>}
      {mec && <text x={W - 8} y={60} fontSize={12} textAnchor="end" fill={MUTED}>{mec}</text>}
      {!atom && (
        <text x={46} y={40} fontSize={13.5} fill={INK} fontWeight={600}>
          {order === 'pi-low' ? 'Li₂ → N₂: π2p lower than σ2p' : 'O₂, F₂, Ne₂: σ2p lower than π2p'}
        </text>
      )}
    </svg>
  )
}

/** H2 and He2 from 1s (s102, s106/s107). */
const H2He2 = () => {
  const one = (x0: number, eA: number, name: string, atom: string, bo: string) => {
    const n = eA * 2
    const sig = Math.min(2, n), sigS = Math.max(0, n - 2)
    return (
      <g>
        <g stroke={INK} strokeWidth={1} strokeDasharray="4 3">
          <line x1={x0 + 70} y1={130} x2={x0 + 120} y2={80} />
          <line x1={x0 + 70} y1={130} x2={x0 + 120} y2={190} />
          <line x1={x0 + 230} y1={130} x2={x0 + 180} y2={80} />
          <line x1={x0 + 230} y1={130} x2={x0 + 180} y2={190} />
        </g>
        <g stroke={INK} strokeWidth={1.8}>
          <line x1={x0 + 20} x2={x0 + 70} y1={130} y2={130} />
          <line x1={x0 + 230} x2={x0 + 280} y1={130} y2={130} />
          <line x1={x0 + 120} x2={x0 + 180} y1={80} y2={80} />
          <line x1={x0 + 120} x2={x0 + 180} y1={190} y2={190} />
        </g>
        <Electrons x={x0 + 45} y={130} n={eA} />
        <Electrons x={x0 + 255} y={130} n={eA} />
        <Electrons x={x0 + 150} y={190} n={sig} />
        <Electrons x={x0 + 150} y={80} n={sigS} />
        <text x={x0 + 45} y={152} textAnchor="middle" fontSize={14} fontStyle="italic" fontFamily="'Times New Roman', Times, serif">1s</text>
        <text x={x0 + 255} y={152} textAnchor="middle" fontSize={14} fontStyle="italic" fontFamily="'Times New Roman', Times, serif">1s</text>
        <MoLab x={x0 + 186} y={76} g="σ" sub="1s" star />
        <MoLab x={x0 + 186} y={204} g="σ" sub="1s" />
        <g fontSize={13} textAnchor="middle" fill={BLUE}>
          <text x={x0 + 45} y={230}>{atom}</text>
          <text x={x0 + 255} y={230}>{atom}</text>
          <text x={x0 + 150} y={230} fontWeight={700}>{name}</text>
        </g>
        <text x={x0 + 150} y={256} textAnchor="middle" fontSize={13} fill={INK} fontWeight={600}>{bo}</text>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 640 270" fontFamily={FONT} role="img" aria-label="MO diagrams for H2 and He2">
      <g stroke="#c2410c" fill="#c2410c">
        <line x1={14} y1={210} x2={14} y2={40} strokeWidth={4} />
        <polygon points="14,26 6,44 22,44" stroke="none" />
      </g>
      {one(20, 1, 'H₂', 'H', 'σ1s² · BO = (2 − 0)/2 = 1')}
      {one(330, 2, 'He₂', 'He', 'σ1s² σ*1s² · BO = (2 − 2)/2 = 0')}
      <line x1={322} x2={322} y1={30} y2={250} stroke={LINE} />
    </svg>
  )
}

/** NO+, NO, NO− with the σ2p-lower ordering, drawn like s129/s130 (MO column only). */
const NoSeries = () => {
  const ys = { s2s: 300, 's2s*': 250, s2p: 200, p2p: 172, 'p2p*': 100, 's2p*': 64 }
  const order: [keyof typeof ys, 1 | 2][] = [['s2s', 1], ['s2s*', 1], ['s2p', 1], ['p2p', 2], ['p2p*', 2], ['s2p*', 1]]
  const col = (x: number, n: number, name: string, info: string, bo: string) => {
    let left = n
    return (
      <g>
        {order.map(([k, deg]) => {
          const cap = deg * 2, m = Math.min(cap, left)
          left -= m
          const f = deg === 1 ? [m] : hund(m, 2)
          const xs: [number, number][] = deg === 1 ? [[x - 20, x + 20]] : [[x - 44, x - 6], [x + 6, x + 44]]
          return (
            <g key={k}>
              {xs.map(([a, b], i) => (
                <g key={i}>
                  <line x1={a} x2={b} y1={ys[k]} y2={ys[k]} stroke={INK} strokeWidth={1.8} />
                  <Electrons x={(a + b) / 2} y={ys[k]} n={f[i]} />
                </g>
              ))}
            </g>
          )
        })}
        <text x={x} y={30} textAnchor="middle" fontSize={16} fontWeight={700} fill={INK}>{name}</text>
        <text x={x} y={336} textAnchor="middle" fontSize={12.5} fill={MUTED}>{info}</text>
        <text x={x} y={356} textAnchor="middle" fontSize={13} fontWeight={700} fill={BLUE}>{bo}</text>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 640 370" fontFamily={FONT} role="img" aria-label="MO filling for NO+, NO and NO−">
      <MoLab x={14} y={ys['s2p*'] + 5} g="σ" sub="2pz" star />
      <MoLab x={14} y={ys['p2p*'] + 5} g="π" sub="2px, 2py" star size={14} />
      <MoLab x={14} y={ys.p2p + 5} g="π" sub="2px, 2py" size={14} />
      <MoLab x={14} y={ys.s2p + 5} g="σ" sub="2pz" />
      <MoLab x={14} y={ys['s2s*'] + 5} g="σ" sub="2s" star />
      <MoLab x={14} y={ys.s2s + 5} g="σ" sub="2s" />
      {Object.values(ys).map((y) => <line key={y} x1={120} x2={630} y1={y} y2={y} stroke="#f0f0f3" strokeWidth={1} />)}
      {col(220, 10, 'NO⁺', '10 valence e⁻ · diamagnetic', 'BO = (8 − 2)/2 = 3')}
      {col(390, 11, 'NO', '11 valence e⁻ · 1 unpaired', 'BO = (8 − 3)/2 = 2.5')}
      {col(560, 12, 'NO⁻', '12 valence e⁻ · 2 unpaired', 'BO = (8 − 4)/2 = 2')}
    </svg>
  )
}

export const FIGURES: Record<string, FigureDef> = {
  'l10-vsepr-2-4': {
    title: 'VSEPR shapes: 2, 3 and 4 electron domains',
    caption: 'Rows = total domains (electron-domain geometry, hybridisation, ideal angle); columns = lone pairs on the central atom. Black = central atom, wedge = towards you, hashed = away, lobe with dots = lone pair (s17, s18).',
    C: VseprSmall,
  },
  'l10-vsepr-5-6': {
    title: 'VSEPR shapes: 5 and 6 electron domains',
    caption: '5 domains: lone pairs fill equatorial positions first. 6 domains: the second lone pair sits opposite the first (axial). AX₃E₃ and AX₂E₄ have no known stable example (s20, s22–s24).',
    C: VseprBig,
  },
  'l10-tbp-lone-pair': {
    title: 'Trigonal bipyramid: why lone pairs go equatorial',
    caption: 'A lone pair is fatter than a bond pair, so it takes the position with the fewest 90° neighbours: equatorial (2 at 90°) beats axial (3 at 90°) (s19, s21).',
    C: TbpLonePair,
  },
  'l10-polarity': {
    title: 'Polar bonds vs polar molecule',
    caption: 'Polarity is the vector sum of the bond dipoles: symmetric shapes with identical outer atoms cancel (s28–s38).',
    C: PolarityFig,
  },
  'l10-mo-h2-he2': {
    title: 'MO energy diagrams for H₂ and He₂',
    caption: 'Two 1s AOs give a bonding σ1s (lower) and an antibonding σ*1s (higher). He₂ fills both, so the bond order is 0 and it does not form (s102, s107).',
    C: H2He2,
  },
  'l10-mo-li2-n2': {
    title: 'MO energy diagram for Li₂ → N₂ (π2p below σ2p)',
    caption: 'Ordering for Li₂, Be₂, B₂, C₂, N₂ (s116). Fill only valence electrons.',
    C: () => <SecondRowMO order="pi-low" eAtom={0} />,
  },
  'l10-mo-o2-ne2': {
    title: 'MO energy diagram for O₂, F₂, Ne₂ (σ2p below π2p)',
    caption: 'Ordering for O₂, F₂, Ne₂ and higher (s117).',
    C: () => <SecondRowMO order="sigma-low" eAtom={0} />,
  },
  'l10-mo-b2': {
    title: 'MO energy diagram for B₂',
    caption: 'The last 2 electrons go one each into the degenerate π2px, π2py (Hund), so B₂ is paramagnetic. This is how we know π2p is below σ2p for B (s121).',
    C: () => <SecondRowMO order="pi-low" eAtom={3} atom="B" mol="B₂" bo="Bond order = (4 − 2)/2 = 1" mag="Paramagnetic: 2 unpaired" mec="σ2s² (σ*2s)² π2px¹ π2py¹" />,
  },
  'l10-mo-n2': {
    title: 'MO energy diagram for N₂',
    caption: 'All 10 valence electrons paired: N≡N triple bond, diamagnetic (s123).',
    C: () => <SecondRowMO order="pi-low" eAtom={5} atom="N" mol="N₂" bo="Bond order = (8 − 2)/2 = 3" mag="Diamagnetic" mec="σ2s² (σ*2s)² π2px² π2py² σ2pz²" />,
  },
  'l10-mo-o2': {
    title: 'MO energy diagram for O₂',
    caption: 'The last 2 electrons occupy π*2px and π*2py singly, so O₂ is paramagnetic, which the Lewis structure cannot show (s124).',
    C: () => <SecondRowMO order="sigma-low" eAtom={6} atom="O" mol="O₂" bo="Bond order = (8 − 4)/2 = 2" mag="Paramagnetic: 2 unpaired" mec="σ2s² (σ*2s)² σ2pz² π2p⁴ (π*2px)¹ (π*2py)¹" />,
  },
  'l10-mo-f2': {
    title: 'MO energy diagram for F₂',
    caption: 'π* is full: bond order 1, diamagnetic (s125). Add 2 more electrons (Ne₂) and σ*2pz fills too: bond order 0 (s126).',
    C: () => <SecondRowMO order="sigma-low" eAtom={7} atom="F" mol="F₂" bo="Bond order = (8 − 6)/2 = 1" mag="Diamagnetic" mec="σ2s² (σ*2s)² σ2pz² π2p⁴ π*2p⁴" />,
  },
  'l10-mo-no': {
    title: 'NO⁺, NO and NO⁻ (σ2p lower, as on the slides)',
    caption: 'Same diagram, different electron count. Experiment shows σ2p is lower for NO (s129, s130). NO⁺ has the highest bond order, so it is the shortest and strongest bond (s131).',
    C: NoSeries,
  },
}
