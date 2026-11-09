// Static diagrams for L8 Materials and the Rangkuman (ids referenced from content/L8.ts `figures`). Draw them like the lecture slides.
import type { ReactNode } from 'react'
import type { FigureDef } from '../../types'

const BLUE = '#007aff'
const RED = '#d70015'
const GREEN = '#248a3d'
const INK = '#1d1d1f'
const MUTED = '#6e6e73'
const LINE = '#d2d2d7'
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'

/** Tiny rich text for SVG: `_{..}` → subscript, `^{..}` → superscript (also single-char `_x` / `^x`). */
function Rich({ s }: { s: string }) {
  const out: ReactNode[] = []
  const re = /([_^])(\{([^}]*)\}|(.))/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(<tspan key={k++}>{s.slice(last, m.index)}</tspan>)
    const body = m[3] ?? m[4]
    const sub = m[1] === '_'
    out.push(<tspan key={k++} dy={sub ? 4 : -6} fontSize="0.72em">{body}</tspan>)
    out.push(<tspan key={k++} dy={sub ? -4 : 6}>{' '}</tspan>)
    last = re.lastIndex
  }
  if (last < s.length) out.push(<tspan key={k++}>{s.slice(last)}</tspan>)
  return <>{out}</>
}

function Defs() {
  return (
    <defs>
      {[['up', RED], ['down', GREEN], ['form', BLUE], ['axis', MUTED]].map(([id, c]) => (
        <marker key={id} id={`l8-ah-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={c} />
        </marker>
      ))}
    </defs>
  )
}

/* ---------------- Born–Haber energy-level diagram ---------------- */

interface BHLevel {
  e: number // kJ/mol relative to the elements in their standard states
  label: string
  /** bar extent in x */
  x1: number
  x2: number
  /** where the species label goes: above the bar, left/right aligned, at an x */
  lx: number
  anchor?: 'start' | 'middle' | 'end'
  below?: boolean
}
interface BHStep {
  from: number // level index
  to: number
  x: number
  tag: string
  value: string
  /** plain-words step name (matches the Materials table) */
  name?: string
  side?: 'left' | 'right'
  dyLabel?: number
  kind?: 'form'
  /** one-line label (for short arrows) */
  inline?: boolean
}

function BornHaber({ levels, steps, w, top, bottom, h }: { levels: BHLevel[]; steps: BHStep[]; w: number; top: number; bottom: number; h: number }) {
  const es = levels.map((l) => l.e)
  const hi = Math.max(...es)
  const lo = Math.min(...es)
  const y = (e: number) => top + ((hi - e) / (hi - lo)) * (bottom - top)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} fontFamily={FONT} fontSize={13} fill={INK} role="img">
      <Defs />
      {/* energy axis */}
      <line x1={14} y1={bottom + 6} x2={14} y2={top - 14} stroke={MUTED} strokeWidth={1.2} markerEnd="url(#l8-ah-axis)" />
      <text x={20} y={top - 10} fontSize={11.5} fill={MUTED}>Energy (kJ/mol)</text>
      {levels.map((l, i) => {
        const yy = y(l.e)
        return (
          <g key={i}>
            <line x1={l.x1} y1={yy} x2={l.x2} y2={yy} stroke={INK} strokeWidth={2} />
            <text x={l.lx} y={l.below ? yy + 16 : yy - 6} textAnchor={l.anchor ?? 'start'} fontWeight={600}>
              <Rich s={l.label} />
            </text>
          </g>
        )
      })}
      {steps.map((s, i) => {
        const y1 = y(levels[s.from].e)
        const y2 = y(levels[s.to].e)
        const up = y2 < y1
        const col = s.kind === 'form' ? BLUE : up ? RED : GREEN
        const id = s.kind === 'form' ? 'form' : up ? 'up' : 'down'
        const mid = (y1 + y2) / 2 + (s.dyLabel ?? 0)
        const right = (s.side ?? 'right') === 'right'
        const tx = right ? s.x + 7 : s.x - 7
        return (
          <g key={i}>
            <line x1={s.x} y1={y1} x2={s.x} y2={y2 + (up ? 2 : -2)} stroke={col} strokeWidth={2.2} strokeDasharray={s.kind === 'form' ? '6 4' : undefined} markerEnd={`url(#l8-ah-${id})`} />
            {s.inline ? (
              <text x={tx} y={mid + 4} textAnchor={right ? 'start' : 'end'} fill={col} fontSize={12.5} fontWeight={600}>
                <Rich s={s.tag} /> <tspan fontWeight={400}>{s.value}</tspan>
                {s.name && <tspan fontWeight={400} fontSize={11.5} fill={MUTED}> · {s.name}</tspan>}
              </text>
            ) : (
              <>
                {s.name && (
                  <text x={tx} y={mid - 17} textAnchor={right ? 'start' : 'end'} fill={MUTED} fontSize={11.5}>
                    {s.name}
                  </text>
                )}
                <text x={tx} y={mid - 2} textAnchor={right ? 'start' : 'end'} fill={col} fontSize={12.5} fontWeight={600}>
                  <Rich s={s.tag} />
                </text>
                <text x={tx} y={mid + 13} textAnchor={right ? 'start' : 'end'} fill={col} fontSize={12.5}>
                  {s.value}
                </text>
              </>
            )}
          </g>
        )
      })}
      {/* legend */}
      <g fontSize={11.5} fill={MUTED} transform={`translate(${w - 200}, ${h - 14})`}>
        <line x1={0} y1={-4} x2={16} y2={-4} stroke={RED} strokeWidth={2.2} />
        <text x={20} y={0}>endo (+)</text>
        <line x1={78} y1={-4} x2={94} y2={-4} stroke={GREEN} strokeWidth={2.2} />
        <text x={98} y={0}>exo (−)</text>
        <line x1={146} y1={-4} x2={162} y2={-4} stroke={BLUE} strokeWidth={2.2} strokeDasharray="5 3" />
        <text x={166} y={0}>direct</text>
      </g>
    </svg>
  )
}

function BornHaberNaCl() {
  const levels: BHLevel[] = [
    { e: 0, label: 'Na(s) + ½Cl_2(g)', x1: 44, x2: 196, lx: 66 },
    { e: 107.8, label: 'Na(g) + ½Cl_2(g)', x1: 160, x2: 306, lx: 282, anchor: 'end' },
    { e: 229.1, label: 'Na(g) + Cl(g)', x1: 270, x2: 412, lx: 388, anchor: 'end' },
    { e: 724.5, label: 'Na^+(g) + e^− + Cl(g)', x1: 376, x2: 560, lx: 468, anchor: 'middle' },
    { e: 375.7, label: 'Na^+(g) + Cl^−(g)', x1: 440, x2: 592, lx: 452, below: true },
    { e: -411.1, label: 'NaCl(s)', x1: 44, x2: 592, lx: 318, anchor: 'middle', below: true },
  ]
  const steps: BHStep[] = [
    { from: 0, to: 1, x: 180, tag: '① ΔH_{sub}', value: '+107.8', name: 'sublimation of Na', inline: true },
    { from: 1, to: 2, x: 290, tag: '② ½D(Cl_2)', value: '+121.3', name: 'bond dissociation', inline: true },
    { from: 2, to: 3, x: 396, tag: '③ IE_1(Na)', value: '+495.4', name: '1st ionisation', side: 'left' },
    { from: 3, to: 4, x: 540, tag: '④ EA(Cl)', value: '−348.8', name: 'electron affinity', side: 'left', dyLabel: 8 },
    { from: 4, to: 5, x: 576, tag: '⑤ ΔH_{lattice}', value: '−787', name: 'lattice formation', side: 'left', dyLabel: 40 },
    { from: 0, to: 5, x: 58, tag: 'Σ ΔH°_f(NaCl)', value: '−411.1', name: 'formation (direct)', kind: 'form' },
  ]
  return <BornHaber levels={levels} steps={steps} w={610} h={500} top={42} bottom={448} />
}

function BornHaberCaCl2() {
  const levels: BHLevel[] = [
    { e: 0, label: 'Ca(s) + Cl_2(g)', x1: 44, x2: 180, lx: 66 },
    { e: 178, label: 'Ca(g) + Cl_2(g)', x1: 146, x2: 270, lx: 246, anchor: 'end' },
    { e: 420.6, label: 'Ca(g) + 2Cl(g)', x1: 236, x2: 360, lx: 336, anchor: 'end' },
    { e: 1010.6, label: 'Ca^+(g) + e^− + 2Cl(g)', x1: 326, x2: 450, lx: 426, anchor: 'end' },
    { e: 2150.6, label: 'Ca^{2+}(g) + 2e^− + 2Cl(g)', x1: 416, x2: 580, lx: 498, anchor: 'middle' },
    { e: 1453, label: 'Ca^{2+}(g) + 2Cl^−(g)', x1: 470, x2: 600, lx: 474, below: true },
    { e: -796, label: 'CaCl_2(s)', x1: 44, x2: 600, lx: 318, anchor: 'middle', below: true },
  ]
  const steps: BHStep[] = [
    { from: 0, to: 1, x: 162, tag: '① ΔH_{sub}', value: '+178', name: 'sublimation of Ca', inline: true },
    { from: 1, to: 2, x: 252, tag: '② D(Cl_2)', value: '+242.6', name: 'whole Cl₂ dissociated', inline: true },
    { from: 2, to: 3, x: 342, tag: '③ IE_1(Ca)', value: '+590', name: '1st ionisation' },
    { from: 3, to: 4, x: 432, tag: '④ IE_2(Ca)', value: '+1140', name: '2nd ionisation', side: 'left' },
    { from: 4, to: 5, x: 560, tag: '⑤ 2 × EA(Cl)', value: '−697.6', name: 'electron affinity ×2', side: 'left', dyLabel: 8 },
    { from: 5, to: 6, x: 584, tag: '⑥ ΔH_{lattice}', value: '≈ −2249', name: 'lattice formation', side: 'left', dyLabel: 60 },
    { from: 0, to: 6, x: 58, tag: 'Σ ΔH°_f(CaCl_2)', value: '≈ −796', name: 'formation (direct)', kind: 'form' },
  ]
  return <BornHaber levels={levels} steps={steps} w={620} h={600} top={42} bottom={548} />
}

/* ---------------- % ionic character vs Δχ (slide 38) ---------------- */

function IonicCharacter() {
  const W = 600
  const H = 330
  const L = 64
  const R = 580
  const T = 20
  const B = 270
  const X = (d: number) => L + (d / 3) * (R - L)
  const Y = (p: number) => B - (p / 100) * (B - T)
  const pct = (d: number) => {
    const f = (x: number) => 1 / (1 + Math.exp(-2.7 * (x - 1.7)))
    return (100 * (f(d) - f(0))) / (1 - f(0))
  }
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const d = (i / 60) * 3
    pts.push(`${X(d).toFixed(1)},${Y(pct(d)).toFixed(1)}`)
  }
  const zones = [
    { a: 0, b: 0.5, fill: '#f2f2f7', t: 'nonpolar', t2: '(< 5% ionic)' },
    { a: 0.5, b: 1.7, fill: '#eaf3ff', t: 'polar covalent', t2: '' },
    { a: 1.7, b: 3, fill: '#fdecef', t: 'mostly ionic', t2: '(> 50% ionic)', low: true },
  ]
  const ex = [
    { d: 0.5, n: 'C–H' },
    { d: 1, n: 'H–Cl, C–O' },
    { d: 2, n: 'Be–O' },
    { d: 3, n: 'Li–F' },
  ]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fontFamily={FONT} fontSize={13} fill={INK} role="img">
      {zones.map((z) => (
        <g key={z.t}>
          <rect x={X(z.a)} y={T} width={X(z.b) - X(z.a)} height={B - T} fill={z.fill} />
          <text x={(X(z.a) + X(z.b)) / 2} y={'low' in z ? B - 34 : T + 18} textAnchor="middle" fontSize={12} fontWeight={600} fill={MUTED}>{z.t}</text>
          {z.t2 && <text x={(X(z.a) + X(z.b)) / 2} y={'low' in z ? B - 19 : T + 33} textAnchor="middle" fontSize={11} fill={MUTED}>{z.t2}</text>}
        </g>
      ))}
      {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((d) => (
        <g key={d}>
          <line x1={X(d)} y1={T} x2={X(d)} y2={B} stroke={LINE} />
          <text x={X(d)} y={B + 17} textAnchor="middle" fontSize={12}>{d.toFixed(1).replace('.0', d ? '.0' : '')}</text>
        </g>
      ))}
      {[0, 50, 100].map((p) => (
        <g key={p}>
          <line x1={L} y1={Y(p)} x2={R} y2={Y(p)} stroke={LINE} />
          <text x={L - 8} y={Y(p) + 4} textAnchor="end" fontSize={12}>{p}</text>
        </g>
      ))}
      <rect x={L} y={T} width={R - L} height={B - T} fill="none" stroke={INK} strokeWidth={1.2} />
      <line x1={L} y1={Y(50)} x2={X(1.7)} y2={Y(50)} stroke={INK} strokeDasharray="6 4" />
      <line x1={X(1.7)} y1={Y(50)} x2={X(1.7)} y2={B} stroke={INK} strokeDasharray="6 4" />
      <text x={X(1.7) + 5} y={B - 6} fontSize={12} fontWeight={600}>1.7</text>
      <polyline points={pts.join(' ')} fill="none" stroke="#5e2a84" strokeWidth={3} />
      {ex.map((e) => (
        <g key={e.n}>
          <circle cx={X(e.d)} cy={Y(pct(e.d))} r={4.5} fill={BLUE} stroke="#fff" strokeWidth={1.5} />
          <text x={X(e.d) + (e.d === 3 ? -10 : e.d >= 2 ? 10 : 8)} y={Y(pct(e.d)) + (e.d >= 1 ? 18 : -8)} textAnchor={e.d === 3 ? 'end' : 'start'} fontSize={12} fill={BLUE} fontWeight={600}>{e.n}</text>
        </g>
      ))}
      <text x={(L + R) / 2} y={B + 40} textAnchor="middle" fontSize={13}><Rich s="Electronegativity difference Δχ = |χ_A − χ_B|" /></text>
      <text transform={`translate(18, ${(T + B) / 2}) rotate(-90)`} textAnchor="middle" fontSize={13}>% ionic character</text>
    </svg>
  )
}

/* ---------------- Ion configurations: which electrons leave first ---------------- */

function IonRemovalOrder() {
  const W = 600
  const H = 240
  const rows = [
    { atom: 'Fe  [Ar] 3d^6 4s^2', steps: ['Fe^{2+}  [Ar] 3d^6', 'Fe^{3+}  [Ar] 3d^5'], lose: ['− 4s^2', '− one 3d'], note: 'transition metal: 4s (highest n) leaves first, then 3d' },
    { atom: 'Sn  [Kr] 4d^{10} 5s^2 5p^2', steps: ['Sn^{2+}  [Kr] 4d^{10} 5s^2', 'Sn^{4+}  [Kr] 4d^{10}'], lose: ['− 5p^2', '− 5s^2'], note: 'post-transition metal: 5p first, then 5s (no noble-gas core)' },
    { atom: 'Ca  [Ar] 4s^2', steps: ['Ca^{2+}  [Ar]'], lose: ['− 4s^2'], note: 's-block: lose all valence e⁻ → noble-gas core (octet rule)' },
  ]
  const colX = [16, 222, 412]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} fontFamily={FONT} fontSize={13} fill={INK} role="img">
      <Defs />
      {rows.map((r, i) => {
        const y0 = 40 + i * 74
        return (
          <g key={i}>
            <text x={colX[0]} y={y0} fontWeight={600}><Rich s={r.atom} /></text>
            {r.steps.map((s, j) => (
              <g key={j}>
                <line x1={colX[j + 1] - 40} y1={y0 - 4} x2={colX[j + 1] - 8} y2={y0 - 4} stroke={MUTED} strokeWidth={1.5} markerEnd="url(#l8-ah-axis)" />
                <text x={colX[j + 1] - 24} y={y0 - 12} textAnchor="middle" fontSize={11} fill={RED}><Rich s={r.lose[j]} /></text>
                <text x={colX[j + 1]} y={y0}><Rich s={s} /></text>
              </g>
            ))}
            <text x={colX[0]} y={y0 + 22} fontSize={12} fill={MUTED}>{r.note}</text>
            {i < rows.length - 1 && <line x1={10} y1={y0 + 40} x2={W - 10} y2={y0 + 40} stroke={LINE} />}
          </g>
        )
      })}
    </svg>
  )
}

export const FIGURES: Record<string, FigureDef> = {
  'l8-born-haber-nacl': {
    title: 'Born–Haber diagram for NaCl (slide 8 numbers, kJ/mol)',
    caption:
      'Step numbers ①–⑤ are the same as in the NaCl table. Red arrows go up (endothermic, +), green arrows go down (exothermic, −). Path ①→⑤ and the dashed $\\Delta H_f^\\circ$ arrow start and end at the same levels, so by Hess\'s law they have the same total: $107.8+121.3+495.4-348.8-787\\approx-411$.',
    C: BornHaberNaCl,
  },
  'l8-born-haber-cacl2': {
    title: 'Born–Haber diagram for an MX₂ salt: CaCl₂ (kJ/mol)',
    caption:
      'Step numbers ①–⑥ are the same as in the CaCl₂ table. Two ionisation steps (IE₁ and IE₂) because Ca forms Ca²⁺; a whole mole of Cl₂ (full $D$) and **2 × EA** = 2(−348.8) because two Cl atoms each gain one electron. IE and Cl values from the slides; $\\Delta H_{sub}$(Ca) = +178 and $\\Delta H_f^\\circ$ = −796 are general data, not on the slides.',
    C: BornHaberCaCl2,
  },
  'l8-ionic-character': {
    title: 'Percent ionic character vs Δχ (redrawn from slide 38)',
    caption: 'Δχ = 1.7 is ~50% ionic. Blue dots are the slide 35 Learning Check bonds (χ from slide 34).',
    C: IonicCharacter,
  },
  'l8-ion-removal': {
    title: 'Which electrons leave first when a cation forms (slides 20–24)',
    caption: 'Write the configuration in order of $n$, then remove from the right end: highest $n$ first (p before s), and ns before (n−1)d.',
    C: IonRemovalOrder,
  },
}
