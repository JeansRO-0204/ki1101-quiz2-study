// Static diagrams for L9 Materials and the Rangkuman (ids referenced from content/L9.ts `figures`). Draw them like the lecture slides:
// element symbols (O red, N blue, S brown, others black), lone pairs as dot pairs, bonds as lines, formal charges in small circles.
import type { ReactNode } from 'react'
import type { FigureDef } from '../../types'

const INK = '#1d1d1f'
const MUTED = '#6e6e73'
const BLUE = '#007aff'
const MAG = '#b4236b' // the slides' magenta for step labels and formal-charge circles
const GREEN = '#248a3d'
const ORANGE = '#b25000'
const RED = '#d70015'
const EL_COL: Record<string, string> = { O: '#e0201b', N: '#1f4fd1', S: '#a0670a' }

/* ---------- tiny Lewis-structure drawer ---------- */
type Atom = {
  el: string
  x: number
  y: number
  /** explicit lone-pair directions in degrees (0 = right, 90 = down, SVG convention) */
  lp?: number[]
  /** number of lone pairs to place automatically (terminal atoms) */
  nlp?: number
  /** extra gap between the symbol and its lone pairs (default 5); larger keeps diagonal pairs on crowded central atoms readable */
  lpGap?: number
  /** single unpaired dots (directions in degrees) */
  dots?: number[]
  /** formal charge text, e.g. '+1', '−1' */
  fc?: string
  /** direction of the formal-charge circle (degrees) and distance */
  fcAt?: number
  fcDist?: number
}
/** [atom index, atom index, bond order, optional colour] */
type Bond = [number, number, number, string?]

const rad = (d: number) => (d * Math.PI) / 180
const ang = (a: Atom, b: Atom) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
const halfW = (el: string) => (el.length > 1 ? 16 : 10)
const HALF_H = 12

function autoLp(bondAngles: number[], n: number): number[] {
  if (!n) return []
  if (bondAngles.length === 0) return [180, 0, 270, 90].slice(0, n)
  if (bondAngles.length === 1) {
    const t = bondAngles[0] + 180
    const step = n === 2 ? 180 : 90
    return Array.from({ length: n }, (_, k) => t + (k - (n - 1) / 2) * step)
  }
  // several bonds: greedy, as far as possible from bonds and pairs already placed (prefer axis directions on ties)
  const taken = [...bondAngles]
  const out: number[] = []
  const dist = (a: number, b: number) => { const d = Math.abs((((a - b) % 360) + 540) % 360 - 180); return d }
  const cands = Array.from({ length: 24 }, (_, i) => i * 15).sort((a, b) => (a % 90 === 0 ? 0 : 1) - (b % 90 === 0 ? 0 : 1))
  for (let k = 0; k < n; k++) {
    let best = cands[0], bestD = -1
    for (const c of cands) {
      const d = Math.min(...taken.map((t) => 180 - dist(c, t)))
      if (d > bestD) { bestD = d; best = c }
    }
    taken.push(best); out.push(best)
  }
  return out
}

function elOffset(el: string, deg: number, extra: number): [number, number] {
  const c = Math.cos(rad(deg)), s = Math.sin(rad(deg))
  return [c * (halfW(el) + extra), s * (HALF_H + extra)]
}

function Mol({ atoms, bonds, size = 20 }: { atoms: Atom[]; bonds: Bond[]; size?: number }) {
  const parts: ReactNode[] = []
  bonds.forEach(([i, j, order, col], k) => {
    const a = atoms[i], b = atoms[j]
    const t = ang(a, b)
    const c = Math.cos(rad(t)), s = Math.sin(rad(t))
    const trimA = Math.abs(c) * (halfW(a.el) + 3) + Math.abs(s) * (HALF_H + 3)
    const trimB = Math.abs(c) * (halfW(b.el) + 3) + Math.abs(s) * (HALF_H + 3)
    const x1 = a.x + c * trimA, y1 = a.y + s * trimA, x2 = b.x - c * trimB, y2 = b.y - s * trimB
    const offs = order === 1 ? [0] : order === 2 ? [-3.5, 3.5] : [-5, 0, 5]
    offs.forEach((o, m) =>
      parts.push(<line key={`b${k}-${m}`} x1={x1 - s * o} y1={y1 + c * o} x2={x2 - s * o} y2={y2 + c * o} stroke={col ?? INK} strokeWidth={order === 1 ? 1.8 : 1.5} strokeLinecap="round" />),
    )
  })
  atoms.forEach((a, i) => {
    const bAngs = bonds.filter((b) => b[0] === i || b[1] === i).map((b) => ang(a, atoms[b[0] === i ? b[1] : b[0]]))
    const lps = a.lp ?? autoLp(bAngs, a.nlp ?? 0)
    lps.forEach((d, m) => {
      const [ox, oy] = elOffset(a.el, d, a.lpGap ?? 5)
      const px = -Math.sin(rad(d)) * 4, py = Math.cos(rad(d)) * 4
      parts.push(<circle key={`l${i}-${m}a`} cx={a.x + ox + px} cy={a.y + oy + py} r={2.1} fill={INK} />)
      parts.push(<circle key={`l${i}-${m}b`} cx={a.x + ox - px} cy={a.y + oy - py} r={2.1} fill={INK} />)
    })
    ;(a.dots ?? []).forEach((d, m) => {
      const [ox, oy] = elOffset(a.el, d, 5)
      parts.push(<circle key={`d${i}-${m}`} cx={a.x + ox} cy={a.y + oy} r={2.1} fill={INK} />)
    })
    parts.push(
      <text key={`t${i}`} x={a.x} y={a.y} fontSize={size} textAnchor="middle" dominantBaseline="central" fill={EL_COL[a.el] ?? INK}>
        {a.el}
      </text>,
    )
    if (a.fc) {
      const d = a.fcAt ?? -45, r = a.fcDist ?? 26
      const cx = a.x + Math.cos(rad(d)) * r, cy = a.y + Math.sin(rad(d)) * r
      parts.push(
        <g key={`f${i}`}>
          <circle cx={cx} cy={cy} r={10.5} fill="#fff" stroke={MAG} strokeWidth={1.2} />
          <text x={cx} y={cy} fontSize={12} textAnchor="middle" dominantBaseline="central" fill={MAG}>{a.fc}</text>
        </g>,
      )
    }
  })
  return <g>{parts}</g>
}

/** Square brackets around an ion with the charge at the top right, as on the slides. */
function Bracket({ x1, y1, x2, y2, charge }: { x1: number; y1: number; x2: number; y2: number; charge: string }) {
  const p = `M${x1 + 6},${y1} H${x1} V${y2} H${x1 + 6} M${x2 - 6},${y1} H${x2} V${y2} H${x2 - 6}`
  return (
    <g>
      <path d={p} fill="none" stroke={INK} strokeWidth={1.3} />
      <text x={x2 + 4} y={y1 + 6} fontSize={16} fill={INK}>{charge}</text>
    </g>
  )
}

function T({ x, y, children, size = 14, fill = INK, anchor = 'start', weight }: { x: number; y: number; children: ReactNode; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number }) {
  return <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={weight}>{children}</text>
}

function Arrow({ id, x1, y1, x2, y2, color = INK, both }: { id: string; x1: number; y1: number; x2: number; y2: number; color?: string; both?: boolean }) {
  return (
    <g>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={color} />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.6} markerEnd={`url(#${id})`} markerStart={both ? `url(#${id})` : undefined} />
    </g>
  )
}

const svgStyle = { width: '100%', height: 'auto', display: 'block', fontFamily: 'inherit' } as const

/* ---------- 1. N2F2 step by step (slides 35–36) ---------- */
function N2F2Steps() {
  const row = (y: number, step: 1 | 2 | 3 | 4) => {
    const fl = step >= 2 ? 3 : 0
    const atoms: Atom[] = [
      { el: 'F', x: 335, y, nlp: fl },
      // step 3: the 6 leftover e⁻ go on in pairs (s34): 2 pairs on the left N (8 e⁻), 1 pair on the right N (only 6 e⁻)
      { el: 'N', x: 410, y, lp: step === 3 ? [270, 90] : step === 4 ? [270] : [] },
      { el: 'N', x: 485, y, lp: step >= 3 ? [270] : [] },
      { el: 'F', x: 560, y, nlp: fl },
    ]
    return <Mol atoms={atoms} bonds={[[0, 1, 1], [1, 2, step === 4 ? 2 : 1, step === 4 ? BLUE : undefined], [2, 3, 1]]} />
  }
  const ledger: [string, string, boolean?][] = [
    ['2 N = 2 × 5 e⁻', '10 e⁻'],
    ['2 F = 2 × 7 e⁻', '14 e⁻'],
    ['Total', '24 e⁻', true],
    ['single bonds', '− 6 e⁻'],
    ['', '18 e⁻', true],
    ['F lone pairs', '− 12 e⁻'],
    ['', '6 e⁻', true],
    ['N electrons', '− 6 e⁻'],
    ['', '0 e⁻', true],
  ]
  return (
    <svg viewBox="0 0 600 350" style={svgStyle} role="img" aria-label="Lewis structure of N2F2 drawn step by step">
      {ledger.map(([l, v, ruleAbove], k) => {
        const y = 40 + k * 30
        return (
          <g key={k}>
            {ruleAbove && <line x1={20} y1={y - 20} x2={235} y2={y - 20} stroke={MAG} strokeWidth={1} />}
            <T x={24} y={y} size={15}>{l}</T>
            <T x={232} y={y} size={15} anchor="end" weight={ruleAbove ? 600 : undefined}>{v}</T>
          </g>
        )
      })}
      <T x={24} y={322} size={13} fill={MUTED}>After step 3 the right N has only 6 e⁻,</T>
      <T x={24} y={340} size={13} fill={MUTED}>so a lone pair of the left N becomes a 2nd N–N bond.</T>
      <T x={318} y={28} size={14} fill={MAG}>1 Skeletal structure</T>
      {row(56, 1)}
      <T x={318} y={108} size={14} fill={MAG}>2 Complete terminal atom octets</T>
      {row(140, 2)}
      <T x={318} y={192} size={14} fill={MAG}>3 Put remaining e⁻ on central atoms</T>
      {row(224, 3)}
      <T x={318} y={276} size={14} fill={MAG}>4 N lacks an octet → N=N double bond</T>
      {row(310, 4)}
    </svg>
  )
}

/* ---------- 2. H2SO4: formal charges of the two structures (slides 47, 51) ---------- */
function H2SO4FC() {
  const mol = (cy: number, expanded: boolean) => {
    const atoms: Atom[] = [
      { el: 'S', x: 150, y: cy, fc: expanded ? undefined : '+2', fcAt: -40, fcDist: 27 },
      { el: 'O', x: 150, y: cy - 52, nlp: expanded ? 2 : 3, fc: expanded ? undefined : '−1', fcAt: -15, fcDist: 34 },
      { el: 'O', x: 150, y: cy + 52, nlp: expanded ? 2 : 3, fc: expanded ? undefined : '−1', fcAt: 15, fcDist: 34 },
      { el: 'O', x: 95, y: cy, lp: [90, 270] },
      { el: 'O', x: 205, y: cy, lp: [90, 270] },
      { el: 'H', x: 45, y: cy },
      { el: 'H', x: 255, y: cy },
    ]
    const o = expanded ? 2 : 1
    return <Mol atoms={atoms} bonds={[[0, 1, o, expanded ? BLUE : undefined], [0, 2, o, expanded ? BLUE : undefined], [0, 3, 1], [0, 4, 1], [3, 5, 1], [4, 6, 1]]} />
  }
  const x = 310
  return (
    <svg viewBox="0 0 600 330" style={svgStyle} role="img" aria-label="Two Lewis structures of H2SO4 with formal charges">
      {mol(82, false)}
      <T x={x} y={36} size={15} weight={600}>Structure 1 (S obeys the octet)</T>
      <T x={x} y={62} size={14}>FC(S) = 6 − (4 + 0) = +2</T>
      <T x={x} y={84} size={14}>FC(H) = 1 − (1 + 0) = 0</T>
      <T x={x} y={106} size={14}>FC(O, 1 bond) = 6 − (1 + 6) = −1</T>
      <T x={x} y={128} size={14}>FC(O of O–H) = 6 − (2 + 4) = 0</T>
      {mol(248, true)}
      <T x={x} y={202} size={15} weight={600}>Structure 2 (two S=O, S has 12 e⁻)</T>
      <T x={x} y={228} size={14}>FC(S) = 6 − (6 + 0) = 0</T>
      <T x={x} y={250} size={14}>FC(H) = 1 − (1 + 0) = 0</T>
      <T x={x} y={272} size={14}>FC(O of S=O) = 6 − (2 + 4) = 0</T>
      <T x={x} y={294} size={14}>FC(O of O–H) = 6 − (2 + 4) = 0</T>
      <T x={x} y={320} size={14} fill={BLUE} weight={600}>All FC = 0 → Structure 2 preferred</T>
    </svg>
  )
}

/* ---------- 3. NO3⁻ resonance structures (slides 56–59) ---------- */
function NO3Resonance() {
  const s = (cx: number, dbl: 0 | 1 | 2) => {
    const y = 108
    const pos: [number, number][] = [[cx, y - 52], [cx - 45, y + 26], [cx + 45, y + 26]]
    const atoms: Atom[] = [
      { el: 'N', x: cx, y, fc: '+1', fcAt: dbl === 0 ? -25 : dbl === 1 ? -25 : 205, fcDist: 26 },
      ...pos.map(([x, yy], k): Atom => ({
        el: 'O', x, y: yy, nlp: k === dbl ? 2 : 3,
        fc: k === dbl ? undefined : '−1',
        fcAt: k === 0 ? 200 : 90, fcDist: k === 0 ? 32 : 33,
      })),
    ]
    return (
      <g>
        <Mol atoms={atoms} bonds={[0, 1, 2].map((k): Bond => [0, k + 1, k === dbl ? 2 : 1])} />
        <Bracket x1={cx - 78} y1={36} x2={cx + 72} y2={182} charge="−" />
      </g>
    )
  }
  return (
    <svg viewBox="0 0 600 212" style={svgStyle} role="img" aria-label="Three resonance structures of the nitrate ion">
      {s(96, 0)}
      <Arrow id="no3a" x1={180} y1={108} x2={210} y2={108} both />
      {s(300, 1)}
      <Arrow id="no3b" x1={384} y1={108} x2={414} y2={108} both />
      {s(504, 2)}
      <T x={300} y={205} size={13} fill={MUTED} anchor="middle">24 e⁻ · every N–O bond in the hybrid: (2 + 1 + 1) / 3 = 1.33</T>
    </svg>
  )
}

/* ---------- 4. NCO⁻: choose the best structure by formal charge (slides 64–65) ---------- */
function NCOFC() {
  const rows: { y: number; b: [number, number]; lp: [number, number]; fc: [string?, string?]; calc: string; verdict: string; col: string }[] = [
    { y: 52, b: [3, 1], lp: [1, 3], fc: [undefined, '−1'], calc: 'N 5−2−3 = 0 · C 4−0−4 = 0 · O 6−6−1 = −1', verdict: 'Best: −1 sits on O (most EN)', col: GREEN },
    { y: 142, b: [2, 2], lp: [2, 2], fc: ['−1', undefined], calc: 'N 5−4−2 = −1 · C 4−0−4 = 0 · O 6−4−2 = 0', verdict: 'OK: −1 on N, less EN than O', col: ORANGE },
    { y: 232, b: [1, 3], lp: [3, 1], fc: ['−2', '+1'], calc: 'N 5−6−1 = −2 · C 4−0−4 = 0 · O 6−2−3 = +1', verdict: 'Not acceptable: |FC| = 2, + on O', col: RED },
  ]
  return (
    <svg viewBox="0 0 600 270" style={svgStyle} role="img" aria-label="Three Lewis structures of the cyanate ion compared by formal charge">
      <T x={270} y={16} size={13} fill={MUTED}>FC = valence − lone-pair e⁻ − ½ bonding e⁻</T>
      {rows.map((r, k) => (
        <g key={k}>
          <Mol
            atoms={[
              { el: 'N', x: 60, y: r.y, nlp: r.lp[0], fc: r.fc[0], fcAt: -90, fcDist: 37 },
              { el: 'C', x: 130, y: r.y },
              { el: 'O', x: 200, y: r.y, nlp: r.lp[1], fc: r.fc[1], fcAt: -90, fcDist: 37 },
            ]}
            bonds={[[0, 1, r.b[0]], [1, 2, r.b[1]]]}
          />
          <Bracket x1={28} y1={r.y - 22} x2={232} y2={r.y + 22} charge="−" />
          <T x={270} y={r.y - 2} size={13.5}>{r.calc}</T>
          <T x={270} y={r.y + 20} size={14} fill={r.col} weight={600}>{r.verdict}</T>
        </g>
      ))}
    </svg>
  )
}

/* ---------- 5. Expanded octets: leftover pairs go on the central atom (slides 32, 40, 72) ---------- */
function ExpandedOctet() {
  const cy = 100
  return (
    <svg viewBox="0 0 600 236" style={svgStyle} role="img" aria-label="Lewis structures of ClF3, XeF4 and the triiodide ion">
      <Mol
        atoms={[
          { el: 'Cl', x: 100, y: cy, lp: [225, 315], lpGap: 9 },
          { el: 'F', x: 40, y: cy, nlp: 3 },
          { el: 'F', x: 160, y: cy, nlp: 3 },
          { el: 'F', x: 100, y: cy + 56, nlp: 3 },
        ]}
        bonds={[[0, 1, 1], [0, 2, 1], [0, 3, 1]]}
      />
      <Mol
        atoms={[
          { el: 'Xe', x: 300, y: cy, lp: [225, 45], lpGap: 10 },
          { el: 'F', x: 238, y: cy, nlp: 3 },
          { el: 'F', x: 362, y: cy, nlp: 3 },
          { el: 'F', x: 300, y: cy - 56, nlp: 3 },
          { el: 'F', x: 300, y: cy + 56, nlp: 3 },
        ]}
        bonds={[[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]}
      />
      <Mol
        atoms={[
          { el: 'I', x: 500, y: cy, lp: [235, 305, 90], lpGap: 8, fc: '−1', fcAt: 145, fcDist: 36 },
          { el: 'I', x: 444, y: cy, nlp: 3 },
          { el: 'I', x: 556, y: cy, nlp: 3 },
        ]}
        bonds={[[0, 1, 1], [0, 2, 1]]}
      />
      <Bracket x1={414} y1={cy - 34} x2={584} y2={cy + 34} charge="−" />
      {[
        [100, 'ClF₃: 7 + 3(7) = 28 e⁻', 'Cl: 3 bonds + 2 lp = 10 e⁻'],
        [300, 'XeF₄: 8 + 4(7) = 36 e⁻', 'Xe: 4 bonds + 2 lp = 12 e⁻'],
        [500, 'I₃⁻: 3(7) + 1 = 22 e⁻', 'middle I: 2 bonds + 3 lp = 10 e⁻'],
      ].map(([x, a, b]) => (
        <g key={a as string}>
          <T x={x as number} y={196} size={13.5} anchor="middle" weight={600}>{a}</T>
          <T x={x as number} y={216} size={13} anchor="middle" fill={MUTED}>{b}</T>
        </g>
      ))}
      <T x={300} y={233} size={12} anchor="middle" fill={BLUE}>Terminal halogens take 3 lone pairs each; whatever is left goes on the central atom.</T>
    </svg>
  )
}

/* ---------- 6. Coordinate covalent bonds (slides 68–71) ---------- */
function Coordinate() {
  const y1 = 92, y2 = 254
  return (
    <svg viewBox="0 0 600 322" style={svgStyle} role="img" aria-label="Coordinate covalent bonds in the ammonium ion and in H3N–BCl3">
      <T x={8} y={16} size={13} fill={MUTED}>NH₃ + H⁺ → NH₄⁺ (s69)</T>
      <Mol
        atoms={[
          { el: 'N', x: 90, y: y1, lp: [270] },
          { el: 'H', x: 40, y: y1 },
          { el: 'H', x: 140, y: y1 },
          { el: 'H', x: 90, y: y1 + 50 },
        ]}
        bonds={[[0, 1, 1], [0, 2, 1], [0, 3, 1]]}
      />
      <T x={182} y={y1 + 6} size={20} anchor="middle">+</T>
      <T x={212} y={y1 + 7} size={20} anchor="middle">H⁺</T>
      <Arrow id="coa" x1={238} y1={y1} x2={284} y2={y1} />
      <Mol
        atoms={[
          { el: 'N', x: 370, y: y1, fc: '+1', fcAt: -45, fcDist: 27 },
          { el: 'H', x: 370, y: y1 - 50 },
          { el: 'H', x: 320, y: y1 },
          { el: 'H', x: 420, y: y1 },
          { el: 'H', x: 370, y: y1 + 50 },
        ]}
        bonds={[[0, 1, 1, BLUE], [0, 2, 1], [0, 3, 1], [0, 4, 1]]}
      />
      <Bracket x1={300} y1={y1 - 66} x2={440} y2={y1 + 66} charge="+" />
      <T x={454} y={y1 - 10} size={13} fill={BLUE}>blue bond: both e⁻</T>
      <T x={454} y={y1 + 8} size={13} fill={BLUE}>from N’s lone pair</T>
      <T x={454} y={y1 + 26} size={13} fill={MUTED}>(then all 4 N–H equal)</T>

      <T x={8} y={178} size={13} fill={MUTED}>H₃N + BCl₃ → H₃N–BCl₃ (s71): B is electron-deficient</T>
      <Mol
        atoms={[
          { el: 'N', x: 70, y: y2, lp: [0] },
          { el: 'H', x: 22, y: y2 },
          { el: 'H', x: 70, y: y2 - 46 },
          { el: 'H', x: 70, y: y2 + 46 },
        ]}
        bonds={[[0, 1, 1], [0, 2, 1], [0, 3, 1]]}
      />
      <T x={120} y={y2 + 7} size={20} anchor="middle">+</T>
      <Mol
        atoms={[
          { el: 'B', x: 170, y: y2 },
          { el: 'Cl', x: 226, y: y2, nlp: 3 },
          { el: 'Cl', x: 170, y: y2 - 48, nlp: 3 },
          { el: 'Cl', x: 170, y: y2 + 48, nlp: 3 },
        ]}
        bonds={[[0, 1, 1], [0, 2, 1], [0, 3, 1]]}
      />
      <Arrow id="cob" x1={262} y1={y2} x2={304} y2={y2} />
      <Mol
        atoms={[
          { el: 'N', x: 380, y: y2, fc: '+1', fcAt: -40, fcDist: 25 },
          { el: 'H', x: 332, y: y2 },
          { el: 'H', x: 380, y: y2 - 46 },
          { el: 'H', x: 380, y: y2 + 46 },
          { el: 'B', x: 446, y: y2, fc: '−1', fcAt: -140, fcDist: 25 },
          { el: 'Cl', x: 504, y: y2, nlp: 3 },
          { el: 'Cl', x: 446, y: y2 - 48, nlp: 3 },
          { el: 'Cl', x: 446, y: y2 + 48, nlp: 3 },
        ]}
        bonds={[[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1, BLUE], [4, 5, 1], [4, 6, 1], [4, 7, 1]]}
      />
    </svg>
  )
}

/* ---------- 7. ΔH from bond energies: sign convention (slide 10 numbers) ---------- */
function BondEnergyDH() {
  const k = 0.18 // px per kJ
  const top = 50
  const yR = top + 1048 * k
  const yP = top + 1172 * k
  return (
    <svg viewBox={`0 0 600 ${Math.round(yP + 34)}`} style={svgStyle} role="img" aria-label="Energy diagram: breaking bonds costs energy, forming bonds releases energy">
      <line x1={40} y1={top} x2={560} y2={top} stroke={MUTED} strokeWidth={1.2} strokeDasharray="5 4" />
      <T x={44} y={top - 12} size={13} fill={MUTED}>after breaking C=C and H–H (separate atoms/fragments, high energy)</T>
      <line x1={40} y1={yR} x2={220} y2={yR} stroke={INK} strokeWidth={2.2} />
      <line x1={220} y1={yR} x2={590} y2={yR} stroke={MUTED} strokeWidth={1} strokeDasharray="2 3" />
      <T x={44} y={yR + 22} size={15} weight={600}>C₂H₄ + H₂</T>
      <line x1={300} y1={yP} x2={560} y2={yP} stroke={INK} strokeWidth={2.2} />
      <T x={304} y={yP + 22} size={15} weight={600}>C₂H₆</T>
      <Arrow id="dhu" x1={80} y1={yR - 2} x2={80} y2={top + 3} color={RED} />
      <T x={92} y={112} size={13.5} fill={RED} weight={600}>Bonds broken: energy IN (+)</T>
      <T x={92} y={132} size={13.5} fill={RED}>C=C + H–H</T>
      <T x={92} y={152} size={13.5} fill={RED}>612 + 436 = +1048 kJ</T>
      <Arrow id="dhd" x1={330} y1={top + 2} x2={330} y2={yP - 3} color={GREEN} />
      <T x={342} y={92} size={13.5} fill={GREEN} weight={600}>Bonds formed: energy OUT (−)</T>
      <T x={342} y={112} size={13.5} fill={GREEN}>C–C + 2 C–H</T>
      <T x={342} y={132} size={13.5} fill={GREEN}>348 + 824 = 1172 kJ released</T>
      <Arrow id="dhn" x1={578} y1={yR + 1} x2={578} y2={yP - 2} color={BLUE} />
      <T x={560} y={yP + 22} size={14} anchor="end" fill={BLUE} weight={600}>ΔH = 1048 − 1172 = −124 kJ</T>
    </svg>
  )
}

export const FIGURES: Record<string, FigureDef> = {
  'l9-n2f2-steps': {
    title: 'Lewis method step by step: N₂F₂',
    caption: 'Slides 35–36. Left: the electron ledger (count, subtract bond e⁻, subtract terminal lone pairs, put the rest on the central atoms in pairs). Right: the drawing after each step. The 6 leftover e⁻ are 3 pairs, so one N gets 8 and the other only 6; moving a lone pair into the N–N bond fixes it. Ends with F–N=N–F: every atom 8 e⁻, all FC = 0, 2 × 4 bonds + 16 lone-pair e⁻ = 24.',
    C: N2F2Steps,
  },
  'l9-h2so4-fc': {
    title: 'Formal charge picks the H₂SO₄ structure',
    caption: 'Slides 47 and 51. Formal charges in circles, FC = valence e⁻ − [bonds to the atom + unshared e⁻]. Structure 2 (S expanded to 12 e⁻, allowed for period 3) has all FC = 0, and X-ray bond lengths agree: S=O 142 pm, S–O(H) 157 pm.',
    C: H2SO4FC,
  },
  'l9-no3-resonance': {
    title: 'Resonance structures of NO₃⁻',
    caption: 'Slide 58. Only the double bond (with a lone pair) moves; the atoms stay put. Each form: N +1, single-bonded O −1, double-bonded O 0 (sum −1). The real ion is the average: three equal N–O bonds of order 1.33.',
    C: NO3Resonance,
  },
  'l9-nco-fc': {
    title: 'NCO⁻: which resonance form contributes most',
    caption: 'Slides 64–65. All three forms have 16 e⁻ and full octets, so formal charge decides. Prefer the smallest charges, with the negative one on the most electronegative atom (O 3.5 > N 3.0 > C 2.5 on the slides’ scale).',
    C: NCOFC,
  },
  'l9-expanded-octet': {
    title: 'Expanded octets: extra pairs go on the central atom',
    caption: 'Slides 32 and 72. Period 3 and below (Cl, Xe, I, Br, S, P) can hold more than 8 e⁻. After every terminal F/I has its octet, the leftover electrons sit on the central atom as lone pairs.',
    C: ExpandedOctet,
  },
  'l9-coordinate': {
    title: 'Coordinate covalent bonds',
    caption: 'Slides 69 and 71. In each new bond (blue) both electrons come from N’s lone pair. Formal charges: N +1 in NH₄⁺; N +1 and B −1 in H₃N–BCl₃ (these two FCs are not written on the slides; they follow from the FC formula).',
    C: Coordinate,
  },
  'l9-dh-bond-energy': {
    title: 'ΔH from bond energies: the sign convention',
    caption: 'Numbers from the slide 10 table for C₂H₄ + H₂ → C₂H₆. Breaking bonds costs energy (+ΣD broken); forming bonds releases it (−ΣD formed). ΔH = ΣD(broken) − ΣD(formed). The energy-ladder picture itself is not drawn on the slides.',
    C: BondEnergyDH,
  },
}
