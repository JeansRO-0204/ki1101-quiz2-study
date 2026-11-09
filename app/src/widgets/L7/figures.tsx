// Static diagrams for L7 Materials and the Rangkuman (ids referenced from content/L7.ts `figures`). Draw them like the lecture slides.
import type { FigureDef } from '../../types'

const INK = '#1d1d1f'
const MUTED = '#6e6e73'
const BLUE = '#007aff'
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif'

/** Arrowhead markers, one per colour (context-stroke is not reliable everywhere). */
function Markers({ prefix, colors }: { prefix: string; colors: string[] }) {
  return (
    <defs>
      {colors.map((c, i) => (
        <marker key={c} id={`${prefix}${i}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={c} />
        </marker>
      ))}
    </defs>
  )
}

/* ---------- 1. Hydrogen energy levels with the Lyman / Balmer / Paschen series ---------- */
// Vertical position ∝ 1/n (compressed so n = 4–6 stay readable); the real E_n = −b/n² crowds even more near n = ∞.
const yN = (n: number) => (n === Infinity ? 56 : 56 + 384 / n)
const E_LABEL: Record<number, string> = { 1: '−b', 2: '−0.25b', 3: '−0.111b', 4: '−0.0625b', 5: '−0.04b', 6: '−0.028b' }

const LYMAN = '#5856d6'
const PASCHEN = '#a2453a'
const BALMER: Record<number, string> = { 3: '#e0322b', 4: '#0aa3c2', 5: '#3949ab', 6: '#7b1fa2' } // 656, 486, 434, 410 nm
const SERIES_COLORS = [LYMAN, PASCHEN, BALMER[3], BALMER[4], BALMER[5], BALMER[6]]
const mk = (c: string) => `url(#hs${SERIES_COLORS.indexOf(c)})`

function HSeries() {
  const levels = [1, 2, 3, 4, 5, 6]
  const arrows: { x: number; from: number; to: number; c: string }[] = []
  ;[2, 3, 4, 5, 6].forEach((n, i) => arrows.push({ x: 112 + i * 18, from: n, to: 1, c: LYMAN }))
  ;[3, 4, 5, 6].forEach((n, i) => arrows.push({ x: 262 + i * 18, from: n, to: 2, c: BALMER[n] }))
  ;[4, 5, 6].forEach((n, i) => arrows.push({ x: 402 + i * 18, from: n, to: 3, c: PASCHEN }))
  return (
    <svg viewBox="0 0 640 500" fontFamily={FONT} role="img" aria-label="Hydrogen energy-level diagram with Lyman, Balmer and Paschen emission series">
      <Markers prefix="hs" colors={SERIES_COLORS} />
      {/* energy axis */}
      <line x1={22} y1={470} x2={22} y2={48} stroke={MUTED} strokeWidth={1.2} markerEnd="url(#hsE)" />
      <defs>
        <marker id="hsE" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={MUTED} /></marker>
      </defs>
      <text x={14} y={262} fontSize={12} fill={MUTED} transform="rotate(-90 14 262)" textAnchor="middle">Energy</text>
      {/* levels */}
      <line x1={70} y1={yN(Infinity)} x2={500} y2={yN(Infinity)} stroke={MUTED} strokeDasharray="5 4" />
      <text x={64} y={yN(Infinity) + 4} fontSize={12} textAnchor="end" fill={INK}>n = ∞</text>
      <text x={506} y={yN(Infinity) + 4} fontSize={12} fill={MUTED}>E = 0 (free e⁻)</text>
      {levels.map((n) => (
        <g key={n}>
          <line x1={70} y1={yN(n)} x2={500} y2={yN(n)} stroke={n === 1 ? INK : '#8e8e93'} strokeWidth={n === 1 ? 2 : 1.3} />
          <text x={64} y={yN(n) + 4} fontSize={12} textAnchor="end" fill={INK} fontWeight={n === 1 ? 600 : 400}>n = {n}</text>
          <text x={506} y={yN(n) + 4} fontSize={11.5} fill={MUTED}>E = {E_LABEL[n]}</text>
        </g>
      ))}
      <text x={506} y={yN(1) + 20} fontSize={11} fill={MUTED}>ground state</text>
      {/* emission arrows (downward) */}
      {arrows.map((a, i) => (
        <line key={i} x1={a.x} y1={yN(a.from)} x2={a.x} y2={yN(a.to) - 1} stroke={a.c} strokeWidth={2.2} markerEnd={mk(a.c)} />
      ))}
      {/* series labels */}
      <text x={148} y={yN(1) + 22} fontSize={13} fontWeight={600} fill={LYMAN} textAnchor="middle">Lyman (→ n = 1)</text>
      <text x={148} y={yN(1) + 38} fontSize={11.5} fill={LYMAN} textAnchor="middle">ultraviolet</text>
      <text x={289} y={yN(2) + 20} fontSize={13} fontWeight={600} fill="#c0392b" textAnchor="middle">Balmer (→ n = 2)</text>
      <text x={289} y={yN(2) + 36} fontSize={11.5} fill="#c0392b" textAnchor="middle">visible</text>
      <text x={420} y={yN(3) + 20} fontSize={13} fontWeight={600} fill={PASCHEN} textAnchor="middle">Paschen (→ n = 3)</text>
      <text x={420} y={yN(3) + 36} fontSize={11.5} fill={PASCHEN} textAnchor="middle">infrared</text>
      {/* Balmer wavelengths */}
      <g fontSize={11} fill={MUTED} textAnchor="middle">
        <text x={289} y={yN(2) + 54}>656 · 486 · 434 · 410 nm</text>
        <text x={289} y={yN(2) + 69}>(red → violet)</text>
      </g>
      <text x={320} y={492} fontSize={11.5} fill={INK} textAnchor="middle">Longer arrow = bigger ΔE = higher ν = shorter λ</text>
    </svg>
  )
}

/* ---------- 2. All emission lines from n = 4: counting and ranking ---------- */
function HFromFour() {
  const y = (n: number) => 30 + 360 / n + (n === 1 ? 30 : 0) // 1/n spacing, big 2→1 gap stretched a little
  const lines = [
    { from: 4, to: 3, l: '1875 nm', c: PASCHEN },
    { from: 4, to: 2, l: '486 nm', c: BALMER[4] },
    { from: 4, to: 1, l: '97.2 nm', c: LYMAN },
    { from: 3, to: 2, l: '656 nm', c: BALMER[3] },
    { from: 3, to: 1, l: '102.6 nm', c: LYMAN },
    { from: 2, to: 1, l: '121.6 nm', c: LYMAN },
  ]
  const colors = [LYMAN, PASCHEN, BALMER[3], BALMER[4]]
  return (
    <svg viewBox="0 0 640 480" fontFamily={FONT} role="img" aria-label="The six emission lines from n = 4 in hydrogen">
      <Markers prefix="h4" colors={colors} />
      {[1, 2, 3, 4].map((n) => (
        <g key={n}>
          <line x1={70} y1={y(n)} x2={560} y2={y(n)} stroke={n === 1 ? INK : '#8e8e93'} strokeWidth={n === 1 ? 2 : 1.3} />
          <text x={62} y={y(n) + 4} fontSize={13} textAnchor="end" fill={INK}>n = {n}</text>
        </g>
      ))}
      {lines.map((ln, i) => {
        const x = 110 + i * 78
        const ci = colors.indexOf(ln.c)
        const mid = (y(ln.from) + y(ln.to)) / 2
        return (
          <g key={i}>
            <line x1={x} y1={y(ln.from)} x2={x} y2={y(ln.to) - 1} stroke={ln.c} strokeWidth={2.4} markerEnd={`url(#h4${ci})`} />
            {ln.from - ln.to === 1 && ln.to > 1 ? (
              <text x={x + 12} y={mid + 4} fontSize={11} fill={INK}><tspan fontWeight={600}>{ln.from}→{ln.to}</tspan> <tspan fill={MUTED}>{ln.l}</tspan></text>
            ) : (
              <>
                <text x={x + 6} y={mid - 2} fontSize={12} fill={INK} fontWeight={600}>{ln.from}→{ln.to}</text>
                <text x={x + 6} y={mid + 13} fontSize={11} fill={MUTED}>{ln.l}</text>
              </>
            )}
          </g>
        )
      })}
      <text x={110 + 2 * 78} y={y(1) + 22} fontSize={11.5} fill={LYMAN} textAnchor="middle" fontWeight={600}>4→1: largest ΔE, shortest λ</text>
      <text x={110} y={y(4) - 12} fontSize={11.5} fill={PASCHEN} fontWeight={600}>4→3: smallest ΔE, longest λ</text>
      <text x={320} y={y(1) + 48} fontSize={12.5} fill={INK} textAnchor="middle">
        From n = 4: 3 + 2 + 1 = 6 lines = n(n − 1)/2
      </text>
    </svg>
  )
}

/* ---------- 3. Periodic-trend arrows (like the slide 40 inset) ---------- */
function TableShape({ x, y, w }: { x: number; y: number; w: number }) {
  // 18 columns × 7 rows silhouette: col 1 rows 1–7, col 2 rows 2–7, cols 3–12 rows 4–7, cols 13–17 rows 2–7, col 18 rows 1–7
  const c = w / 18
  const r = c
  const P = (col: number, row: number) => `${x + col * c},${y + row * r}`
  const pts = [P(0, 0), P(1, 0), P(1, 1), P(2, 1), P(2, 3), P(12, 3), P(12, 1), P(17, 1), P(17, 0), P(18, 0), P(18, 7), P(0, 7)]
  return <polygon points={pts.join(' ')} fill="#eef3fb" stroke="#9db4d6" strokeWidth={1.2} />
}

function Trends() {
  const w = 252
  const h = (w / 18) * 7
  const panel = (ox: number, title: string, sub: string, inc: 'left-down' | 'right-up', color: string, id: string) => {
    const x0 = ox + 30
    const y0 = 70
    return (
      <g>
        <text x={ox + 30 + w / 2} y={28} fontSize={14} fontWeight={600} fill={INK} textAnchor="middle">{title}</text>
        <text x={ox + 30 + w / 2} y={46} fontSize={11.5} fill={MUTED} textAnchor="middle">{sub}</text>
        <TableShape x={x0} y={y0} w={w} />
        {/* horizontal arrow above */}
        {inc === 'left-down' ? (
          <line x1={x0 + w - 6} y1={y0 - 10} x2={x0 + 6} y2={y0 - 10} stroke={color} strokeWidth={2.4} markerEnd={`url(#${id})`} />
        ) : (
          <line x1={x0 + 6} y1={y0 - 10} x2={x0 + w - 6} y2={y0 - 10} stroke={color} strokeWidth={2.4} markerEnd={`url(#${id})`} />
        )}
        {/* vertical arrow at the left */}
        {inc === 'left-down' ? (
          <line x1={x0 - 14} y1={y0 + 4} x2={x0 - 14} y2={y0 + h - 4} stroke={color} strokeWidth={2.4} markerEnd={`url(#${id})`} />
        ) : (
          <line x1={x0 - 14} y1={y0 + h - 4} x2={x0 - 14} y2={y0 + 4} stroke={color} strokeWidth={2.4} markerEnd={`url(#${id})`} />
        )}
        <text x={x0 + w / 2} y={y0 + h / 2 + 18} fontSize={12} fill={INK} textAnchor="middle">
          {inc === 'left-down' ? 'increases ← and ↓' : 'increases → and ↑'}
        </text>
        <text x={x0 + w / 2} y={y0 + h + 22} fontSize={11.5} fill={MUTED} textAnchor="middle">
          {inc === 'left-down' ? 'largest: Cs/Fr (bottom left)' : 'largest IE: He (top right)'}
        </text>
      </g>
    )
  }
  return (
    <svg viewBox="0 0 640 230" fontFamily={FONT} role="img" aria-label="Periodic trends: atomic radius increases left and down; ionisation energy and electron affinity magnitude increase right and up">
      <defs>
        <marker id="trA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={BLUE} /></marker>
        <marker id="trB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#e0322b" /></marker>
      </defs>
      {panel(0, 'Atomic radius', 'more shells ↓ · lower Zeff ←', 'left-down', BLUE, 'trA')}
      {panel(320, 'IE₁ and |EA|', 'higher Zeff →, valence e⁻ closer ↑', 'right-up', '#e0322b', 'trB')}
    </svg>
  )
}

/* ---------- 4. Isoelectronic series: same electrons, more protons → smaller ---------- */
function Isoelectronic() {
  const ions = [
    { s: 'O²⁻', z: 8, r: 140 },
    { s: 'F⁻', z: 9, r: 133 },
    { s: 'Na⁺', z: 11, r: 102 },
    { s: 'Mg²⁺', z: 12, r: 72 },
    { s: 'Al³⁺', z: 13, r: 54 },
  ]
  const k = 0.34 // px per pm
  return (
    <svg viewBox="0 0 640 200" fontFamily={FONT} role="img" aria-label="Isoelectronic series O2-, F-, Na+, Mg2+, Al3+ with decreasing radius">
      <text x={320} y={22} fontSize={13} fontWeight={600} fill={INK} textAnchor="middle">All have 10 electrons, [Ne] = 1s² 2s² 2p⁶</text>
      {ions.map((ion, i) => {
        const cx = 70 + i * 125
        return (
          <g key={ion.s}>
            <circle cx={cx} cy={102} r={ion.r * k} fill={i < 2 ? '#e8f1ff' : '#fdeceb'} stroke={i < 2 ? BLUE : '#e0322b'} strokeWidth={1.5} />
            <text x={cx} y={107} fontSize={14} fontWeight={600} fill={INK} textAnchor="middle">{ion.s}</text>
            <text x={cx} y={172} fontSize={12} fill={INK} textAnchor="middle">Z = {ion.z} protons</text>
            <text x={cx} y={189} fontSize={11.5} fill={MUTED} textAnchor="middle">≈ {ion.r} pm</text>
          </g>
        )
      })}
    </svg>
  )
}

export const FIGURES: Record<string, FigureDef> = {
  'L7-h-series': {
    title: 'Hydrogen energy levels and emission series',
    caption:
      'Emission = electron drops to a lower level (downward arrow). Lyman ends at n = 1 (UV), Balmer at n = 2 (visible), Paschen at n = 3 (IR). Levels drawn closer than true scale near the top; E_n = −b/n² with b = 2.18 × 10⁻¹⁸ J (slides 25, 27).',
    C: HSeries,
  },
  'L7-h-from-n4': {
    title: 'Every emission line from n = 4',
    caption:
      'An electron in n = 4 can fall to any lower level, in one jump or several. 3 + 2 + 1 = 6 distinct lines. λ values from the Rydberg equation with R_H = 1.097 × 10⁷ m⁻¹.',
    C: HFromFour,
  },
  'L7-trends': {
    title: 'Periodic trends at a glance',
    caption: 'Radius runs opposite to IE and EA magnitude. Arrows point the way the quantity increases (slide 40 inset for radius; slides 41–43 for IE and EA).',
    C: Trends,
  },
  'L7-isoelectronic': {
    title: 'Isoelectronic series: more protons, smaller particle',
    caption: 'Same 10 electrons, rising nuclear charge pulls them in. Radii are typical textbook ionic radii (general knowledge, not on the slides).',
    C: Isoelectronic,
  },
}
