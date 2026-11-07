import { useMemo, useState } from 'react'
import './l7.css'
import { Workbench, useMode, Tex, sci, CONST } from '../../lib/kit'
import type { WidgetProps } from '../../types'
import { StepRunner, type StepDef } from './StepRunner'
import { REGIONS, regionOf, lightColor, wavelengthRGB, fmtLen, fmtFreq, useRaf } from './shared'

const { h, c, NA } = CONST
const LO = -12, HI = 3 // log10(λ/m)
const pct = (logL: number) => ((logL - LO) / (HI - LO)) * 100

function Wave({ logL, color }: { logL: number; color: string }) {
  const [phase, setPhase] = useState(0)
  useRaf((t) => setPhase(t))
  const cycles = 1.3 + 10.5 * (1 - (logL - LO) / (HI - LO))
  const W = 600, H = 110, mid = 55, amp = 34
  const lam = W / cycles
  const pts: string[] = []
  for (let x = 0; x <= W; x += 3) pts.push(`${x === 0 ? 'M' : 'L'}${x},${(mid + amp * Math.sin(((x - phase * 90) / lam) * 2 * Math.PI)).toFixed(1)}`)
  // ruler marks one wavelength, from the first crest
  const x0 = ((((phase * 90 + lam / 4) % lam) + lam) % lam)
  const xs = lam / 4 + 0 // crest position at phase 0
  void xs
  return (
    <svg className="light-wave" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Travelling wave">
      <line x1="0" x2={W} y1={mid} y2={mid} stroke="#cbd5e1" strokeDasharray="4 4" />
      <path d={pts.join(' ')} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {x0 + lam < W - 10 && <g>
        <line x1={x0} x2={x0 + lam} y1={mid - amp - 8} y2={mid - amp - 8} stroke="#334155" strokeWidth="1.5" />
        <line x1={x0} x2={x0} y1={mid - amp - 13} y2={mid - amp - 3} stroke="#334155" strokeWidth="1.5" />
        <line x1={x0 + lam} x2={x0 + lam} y1={mid - amp - 13} y2={mid - amp - 3} stroke="#334155" strokeWidth="1.5" />
        <text x={x0 + lam / 2} y={mid - amp - 14} textAnchor="middle" fontSize="13" fill="#334155" fontStyle="italic">λ</text>
      </g>}
      <text x={W - 6} y={H - 6} textAnchor="end" fontSize="10" fill="#94a3b8">schematic: shorter λ → more cycles per window</text>
    </svg>
  )
}

interface Prob { given: 'lambda' | 'nu' | 'E' | 'Emol'; value: number; shown: string }
const POOL: Prob[] = [
  { given: 'lambda', value: 589e-9, shown: '589 nm (Na D line)' }, { given: 'lambda', value: 450e-9, shown: '450 nm (blue)' },
  { given: 'lambda', value: 253.7e-9, shown: '253.7 nm (UV lamp)' }, { given: 'lambda', value: 71e-12, shown: '71 pm (X-ray)' },
  { given: 'lambda', value: 10.6e-6, shown: '10.6 μm (CO₂ laser)' }, { given: 'lambda', value: 656.3e-9, shown: '656.3 nm (Hα)' },
  { given: 'nu', value: 1e8, shown: '100 MHz (FM radio)' }, { given: 'nu', value: 2.45e9, shown: '2.45 GHz (microwave oven)' },
  { given: 'nu', value: 5.09e14, shown: '5.09 × 10¹⁴ Hz' }, { given: 'nu', value: 3.0e16, shown: '3.0 × 10¹⁶ Hz' },
  { given: 'E', value: 4.97e-19, shown: '4.97 × 10⁻¹⁹ J per photon' }, { given: 'E', value: 1.2e-18, shown: '1.20 × 10⁻¹⁸ J per photon' },
  { given: 'Emol', value: 500, shown: '500 kJ/mol of photons' }, { given: 'Emol', value: 1000, shown: '1000 kJ/mol of photons' },
]

function buildSteps(p: Prob): StepDef[] {
  let lam: number, nu: number, E: number
  if (p.given === 'lambda') { lam = p.value; nu = c / lam; E = h * nu }
  else if (p.given === 'nu') { nu = p.value; lam = c / nu; E = h * nu }
  else if (p.given === 'E') { E = p.value; nu = E / h; lam = c / nu }
  else { E = (p.value * 1000) / NA; nu = E / h; lam = c / nu }
  const Em = (E * NA) / 1000
  const sLamM: StepDef = { kind: 'num', id: 'lam_m', title: 'Wavelength in metres', formula: '\\lambda = \\dfrac{c}{\\nu}', unit: 'm', answer: lam,
    hint: 'λ = c/ν with c = 2.998×10⁸ m/s and ν in Hz (s⁻¹).', explain: `$\\lambda = c/\\nu = ${sci(lam)}$ m` }
  const sLamNm: StepDef = { kind: 'num', id: 'lam_nm', title: 'Wavelength in nm', formula: '\\lambda = \\dfrac{c}{\\nu}', unit: 'nm', answer: lam * 1e9,
    hint: 'Compute c/ν in metres first, then × 10⁹ to get nm.', explain: `$\\lambda = ${sci(lam * 1e9)}$ nm` }
  const sNu: StepDef = { kind: 'num', id: 'nu', title: 'Frequency', formula: '\\nu = \\dfrac{c}{\\lambda}', unit: 'Hz', answer: nu,
    extra: (v) => (p.given === 'lambda' && v > 0 && Math.abs(v / (lam / c) - 1) < 0.03 ? 'You inverted it: ν = c/λ, not λ/c.' : null),
    hint: 'Use λ in metres: ν = c/λ.', explain: `$\\nu = c/\\lambda = ${sci(nu)}$ Hz` }
  const sE: StepDef = { kind: 'num', id: 'E', title: 'Energy of one photon', formula: 'E = h\\nu', unit: 'J', answer: E,
    extra: (v) => (p.given === 'lambda' && Math.abs(v / (h / lam) - 1) < 0.03 ? 'You used E = h/λ. Don’t forget c: E = hν = hc/λ.' : null),
    hint: 'E = hν, h = 6.626×10⁻³⁴ J·s.', explain: `$E = h\\nu = ${sci(E)}$ J per photon` }
  const sEm: StepDef = { kind: 'num', id: 'Em', title: 'Energy per mole of photons', formula: 'E_{mol} = E\\cdot N_A', unit: 'kJ/mol', answer: Em,
    hint: 'Per mole: multiply the per-photon energy by N_A = 6.022×10²³, then ÷ 1000 for kJ.', explain: `$E_{mol} = ${sci(Em)}$ kJ/mol` }
  const sE1: StepDef = { kind: 'num', id: 'E1', title: 'Energy of ONE photon from the molar energy', formula: 'E = \\dfrac{E_{mol}}{N_A}', unit: 'J', answer: E,
    hint: 'Convert kJ → J (×1000) then divide by N_A.', explain: `$E = ${sci(E)}$ J` }
  const sNuE: StepDef = { kind: 'num', id: 'nuE', title: 'Frequency from the photon energy', formula: '\\nu = \\dfrac{E}{h}', unit: 'Hz', answer: nu,
    extra: (v) => (Math.abs(v / (E / h / NA) - 1) < 0.03 ? 'You forgot the per-photon vs per-mole step.' : null), hint: 'ν = E/h.', explain: `$\\nu = E/h = ${sci(nu)}$ Hz` }
  const reg = regionOf(lam)
  const sReg: StepDef = { kind: 'choice', id: 'reg', title: 'Which region of the spectrum?', answer: reg.id,
    options: REGIONS.map((r) => ({ value: r.id, label: r.name })),
    wrong: Object.fromEntries(REGIONS.map((r) => [r.id, `λ = ${fmtLen(lam)} lies in the ${reg.name} region (visible ≈ 380–750 nm; shorter λ = higher energy: UV, X-ray, γ).`])),
    explain: `${fmtLen(lam)} → ${reg.name}.` }
  if (p.given === 'lambda') return [...(p.shown.includes(' m ') ? [] : [{ ...sLamM, title: 'Convert λ to metres', formula: '1\\ \\text{nm}=10^{-9}\\ \\text{m}', answer: lam, hint: 'nm → m: multiply by 10⁻⁹ (pm: 10⁻¹², μm: 10⁻⁶).' } as StepDef]), sNu, sE, sEm, sReg]
  if (p.given === 'nu') return [sLamM, sE, sEm, sReg]
  if (p.given === 'E') return [sNuE, sLamNm, sEm, sReg]
  return [sE1, sNuE, sLamNm, sReg]
}

export default function Light(props: WidgetProps) {
  const [mode, setMode] = useMode(props.mode, 'chem.mode.light')
  const [logL, setLogL] = useState(Math.log10(550e-9))
  const [tab, setTab] = useState<'explore' | 'work'>('explore')
  const [pi, setPi] = useState(0)
  const [nonce, setNonce] = useState(0)
  const lam = 10 ** logL
  const nu = c / lam
  const E = h * nu
  const reg = regionOf(lam)
  const nm = lam * 1e9
  const col = reg.id === 'vis' ? lightColor(nm) : reg.color
  const stops = useMemo(() => Array.from({ length: 14 }, (_, i) => { const w = 380 + (i * 370) / 13; const [r, g, b] = wavelengthRGB(w); return `rgb(${r},${g},${b})` }).join(','), [])
  const presets: [string, number][] = [['X-ray 0.1 nm', 1e-10], ['UV-C 254 nm', 254e-9], ['Blue 450 nm', 450e-9], ['Green 532 nm', 532e-9], ['Red 650 nm', 650e-9], ['IR 10 μm', 1e-5], ['Microwave 12 cm', 0.122], ['FM radio 3 m', 3]]
  const prob = POOL[pi % POOL.length]
  const ticks: [number, string][] = [[-12, '1 pm'], [-9, '1 nm'], [-6, '1 μm'], [-3, '1 mm'], [0, '1 m'], [3, '1 km']]
  return (
    <Workbench title="Light: λ ↔ ν ↔ E" subtitle="c = λν, E = hν" compact={props.compact} mode={tab === 'work' ? mode : undefined} onMode={setMode}
      onReset={() => { setLogL(Math.log10(550e-9)); setNonce((n) => n + 1) }}
      tools={<div className="seg"><button className={tab === 'explore' ? 'on' : ''} onClick={() => setTab('explore')}>Explore</button><button className={tab === 'work' ? 'on' : ''} onClick={() => setTab('work')}>Workbench</button></div>}>
      {tab === 'explore' ? (
        <>
          <div className="light-band">
            <div className="light-bar">
              {REGIONS.map((r) => {
                const a = Math.max(LO, Math.log10(r.lo)), b = Math.min(HI, Math.log10(r.hi))
                return <div key={r.id} className="light-seg" style={{ width: `${((b - a) / (HI - LO)) * 100}%`, background: r.id === 'vis' ? `linear-gradient(90deg, ${stops})` : r.color + 'cc' }}>{r.id === 'vis' ? '' : r.name}</div>
              })}
            </div>
            {ticks.map(([t, l]) => <span key={t} className="light-tick" style={{ left: `${pct(t)}%` }}>{l}</span>)}
            <div className="light-marker" style={{ left: `${pct(logL)}%` }} />
            <input type="range" min={LO} max={HI} step={0.01} value={logL} onChange={(e) => setLogL(+e.target.value)} aria-label="wavelength (log scale)" />
          </div>
          <Wave logL={logL} color={col} />
          <div className="light-presets">{presets.map(([l, v]) => <button key={l} className="chip" onClick={() => setLogL(Math.log10(v))}>{l}</button>)}</div>
          <div className="l7-cards">
            <div className="l7-card"><small>Region</small><b style={{ color: reg.color }}>{reg.name}</b></div>
            <div className="l7-card"><small>λ</small><b>{fmtLen(lam)}</b></div>
            <div className="l7-card"><small>ν</small><b>{fmtFreq(nu)}</b></div>
            <div className="l7-card"><small>E per photon</small><b>{sci(E)} J</b></div>
            <div className="l7-card"><small>E per mole</small><b>{sci((E * NA) / 1000)} kJ/mol</b></div>
          </div>
          <small className="muted"><Tex>{'c=\\lambda\\nu,\\quad E=h\\nu=\\dfrac{hc}{\\lambda},\\quad E_{mol}=E\\,N_A'}</Tex> Short λ = high ν = high energy. Slide ref: L7 s9–s13.</small>
        </>
      ) : (
        <>
          <div className="light-given"><b>Given:</b> {prob.shown}. Work out the rest step by step.
            <div className="row" style={{ marginTop: 6 }}>
              <button className="btn sm" onClick={() => setPi((i) => i + 1 + Math.floor(Math.random() * (POOL.length - 1)))}>New problem</button>
              <button className="btn sm" onClick={() => setPi((i) => (i + 1) % POOL.length)}>Next</button>
            </div>
          </div>
          <StepRunner steps={buildSteps(prob)} mode={mode} resetKey={`${pi}-${nonce}-${mode}`} />
        </>
      )}
    </Workbench>
  )
}
