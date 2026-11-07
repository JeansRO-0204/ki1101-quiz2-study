import { useMemo, useState, type ReactElement } from 'react'
import './l7.css'
import { Workbench, useMode, sci, CONST } from '../../lib/kit'
import type { WidgetProps } from '../../types'
import { StepRunner, type StepDef } from './StepRunner'
import { lightColor, useRaf } from './shared'

const { h, c, e: QE } = CONST
const METALS: { id: string; name: string; ev: number }[] = [
  { id: 'Cs', name: 'Cs', ev: 2.14 }, { id: 'K', name: 'K', ev: 2.30 }, { id: 'Na', name: 'Na', ev: 2.75 },
  { id: 'Ca', name: 'Ca', ev: 2.87 }, { id: 'Zn', name: 'Zn', ev: 4.33 }, { id: 'Cu', name: 'Cu', ev: 4.65 }, { id: 'Pt', name: 'Pt', ev: 5.65 },
]
const T1 = 0.9, T2 = 1.4, KEREF = 1.6e-18

function Scene({ nm, ejects, ke, inten }: { nm: number; ejects: boolean; ke: number; inten: number }) {
  const [t, setT] = useState(0)
  useRaf((x) => setT(x))
  const col = lightColor(nm)
  const dt = 1.4 / inten
  const speed = 25 + 80 * Math.sqrt(Math.min(1, ke / KEREF))
  const items: ReactElement[] = []
  for (let i = Math.max(0, Math.floor((t - T1 - T2) / dt)); i <= Math.floor(t / dt); i++) {
    const age = t - i * dt
    const hx = 190 + ((i * 37) % 7) * 36
    if (age < T1) {
      const p = age / T1
      const x = 40 + (hx - 40) * p, y = 30 + 160 * p
      items.push(<g key={'p' + i}><circle cx={x} cy={y} r="5.5" fill={col} stroke="#fff" strokeWidth="1.2" /><path d={`M${x - 14},${y - 14} l6,6 -6,0 6,6`} stroke={col} fill="none" opacity=".5" /></g>)
    } else if (age < T1 + T2) {
      const a = age - T1
      if (ejects) {
        const x = hx + speed * 0.45 * a, y = 190 - speed * a
        items.push(<g key={'e' + i} opacity={1 - a / T2 / 1.4}><circle cx={x} cy={y} r="5" fill="#60a5fa" stroke="#fff" /><text x={x} y={y + 3} fontSize="7" textAnchor="middle" fill="#fff">e⁻</text></g>)
      } else if (a < 0.25) items.push(<circle key={'f' + i} cx={hx} cy={190} r={4 + a * 20} fill="none" stroke="#94a3b8" opacity={1 - a * 4} />)
    }
  }
  return (
    <svg className="pe-scene" viewBox="0 0 520 240">
      <rect x="150" y="190" width="330" height="28" rx="4" fill="#94a3b8" /><rect x="150" y="190" width="330" height="5" fill="#cbd5e1" />
      <text x="315" y="210" textAnchor="middle" fontSize="12" fill="#0f172a">metal surface</text>
      <rect x="14" y="14" width="30" height="22" rx="4" fill="#fbbf24" /><text x="29" y="52" textAnchor="middle" fontSize="10" fill="#cbd5e1">light</text>
      {items}
      <text x="500" y="22" textAnchor="end" fontSize="11" fill="#cbd5e1">{ejects ? 'electrons ejected' : 'no electrons: photon energy < Φ'}</text>
    </svg>
  )
}

type Plot = 'kenu' | 'ne' | 'kei'
function PlotView({ kind, phi, nu, inten, ejects, ke, labels }: { kind: Plot; phi: number; nu: number; inten: number; ejects: boolean; ke: number; labels: boolean }) {
  const W = 320, H = 210, L = 44, B = 28, T = 14, R = 12
  const gx = (x: number, mx: number) => L + (x / mx) * (W - L - R)
  const gy = (y: number, my: number) => H - B - (y / my) * (H - B - T)
  const NUMAX = 3.2e15, KMAX = 2e-18
  const axes = (xl: string, yl: string) => (
    <g><line x1={L} y1={H - B} x2={W - R} y2={H - B} stroke="#475569" /><line x1={L} y1={T} x2={L} y2={H - B} stroke="#475569" />
      <text x={(L + W) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#475569">{xl}</text>
      <text x="12" y={H / 2} fontSize="11" fill="#475569" transform={`rotate(-90 12 ${H / 2})`} textAnchor="middle">{yl}</text></g>)
  if (kind === 'kenu') {
    const lines = METALS.map((m) => {
      const n0 = (m.ev * QE) / h
      return <line key={m.id} x1={gx(n0, NUMAX)} y1={gy(0, KMAX)} x2={gx(NUMAX, NUMAX)} y2={gy(h * NUMAX - m.ev * QE, KMAX)} stroke={m.ev * QE === phi ? '#2563eb' : '#cbd5e1'} strokeWidth={m.ev * QE === phi ? 2.5 : 1.2} />
    })
    const n0 = phi / h
    return (
      <svg className="pe-plot" viewBox={`0 0 ${W} ${H}`}>{axes('frequency ν', 'KE_max')}{lines}
        <line x1={gx(n0, NUMAX)} x2={gx(n0, NUMAX)} y1={T} y2={H - B} stroke="#dc2626" strokeDasharray="4 3" />
        <text x={gx(n0, NUMAX) + 3} y={T + 10} fontSize="11" fill="#dc2626">ν₀{labels ? ` = ${sci(n0, 3)} Hz` : ''}</text>
        <circle cx={gx(Math.min(nu, NUMAX), NUMAX)} cy={gy(Math.min(ke, KMAX), KMAX)} r="5" fill={ejects ? '#16a34a' : '#dc2626'} />
        <text x={W - R} y={T + 24} textAnchor="end" fontSize="10" fill="#64748b">all metals: same slope h</text>
      </svg>)
  }
  if (kind === 'ne') {
    return (
      <svg className="pe-plot" viewBox={`0 0 ${W} ${H}`}>{axes('intensity I (ν fixed)', '# electrons / s')}
        <line x1={L} y1={gy(0, 1)} x2={W - R} y2={ejects ? gy(1, 1) : gy(0, 1)} stroke={ejects ? '#16a34a' : '#dc2626'} strokeWidth="2.5" />
        <circle cx={gx(inten, 10)} cy={ejects ? gy(inten / 10, 1) : gy(0, 1)} r="5" fill="#2563eb" />
        <text x={L + 6} y={T + 12} fontSize="11" fill="#475569">{ejects ? 'linear in I (more photons → more e⁻)' : 'ν < ν₀: zero for every I'}</text></svg>)
  }
  return (
    <svg className="pe-plot" viewBox={`0 0 ${W} ${H}`}>{axes('intensity I (ν fixed)', 'KE_max')}
      <line x1={L} x2={W - R} y1={gy(ke, KMAX)} y2={gy(ke, KMAX)} stroke="#16a34a" strokeWidth="2.5" />
      <circle cx={gx(inten, 10)} cy={gy(ke, KMAX)} r="5" fill="#2563eb" />
      <text x={L + 6} y={T + 12} fontSize="11" fill="#475569">flat: KE_max does not depend on I</text></svg>)
}

export default function Photoelectric(props: WidgetProps) {
  const [mode, setMode] = useMode(props.mode, 'chem.mode.pe')
  const [metal, setMetal] = useState('Na')
  const [nm, setNm] = useState(300)
  const [inten, setInten] = useState(5)
  const [plot, setPlot] = useState<Plot>('kenu')
  const [tab, setTab] = useState<'explore' | 'work'>('explore')
  const [nonce, setNonce] = useState(0)
  const m = METALS.find((x) => x.id === metal)!
  const phi = m.ev * QE
  const nu = c / (nm * 1e-9)
  const E = h * nu
  const ke = Math.max(0, E - phi)
  const ejects = E >= phi
  const work = tab === 'work'

  const steps: StepDef[] = useMemo(() => {
    const nu0 = phi / h, lam0 = (c / nu0) * 1e9
    const s: StepDef[] = [
      { kind: 'num', id: 'E', title: <>Photon energy at {nm} nm</>, formula: 'E_{photon} = h\\nu = \\dfrac{hc}{\\lambda}', unit: 'J', answer: E,
        extra: (v) => (Math.abs(v / (E / QE) - 1) < 0.03 ? 'That is in eV. Convert (1 eV = 1.602×10⁻¹⁹ J) so it is in the same unit as Φ.' : null),
        hint: 'Convert λ to metres first (nm × 10⁻⁹), then E = hc/λ.', explain: `$E = hc/\\lambda = ${sci(E)}$ J` },
      { kind: 'choice', id: 'cmp', title: <>Compare with Φ({metal}) = {sci(phi)} J</>, answer: ejects ? 'yes' : 'no',
        options: [{ value: 'yes', label: 'E > Φ: electrons ejected' }, { value: 'no', label: 'E < Φ: no electrons' }],
        wrong: ejects ? { no: `E (${sci(E)} J) is larger than Φ (${sci(phi)} J), so the photon CAN free an electron.` } : { yes: `E (${sci(E)} J) is smaller than Φ (${sci(phi)} J): one photon must carry at least Φ. Brightness cannot make up for it.` },
        explain: ejects ? 'E > Φ → ejected.' : 'E < Φ → nothing is ejected.' },
      { kind: 'num', id: 'ke', title: 'KE_max of the ejected electron', formula: 'KE_{max} = h\\nu - \\Phi', unit: 'J', answer: ke, tol: { rel: 0.03, abs: ejects ? undefined : 1e-21 },
        extra: (v) => v < 0 ? 'KE cannot be negative: if E < Φ no electron is ejected, so KE_max = 0.' : Math.abs(v / (E + phi) - 1) < 0.03 ? 'You added Φ. KE = E_photon − Φ (energy left after paying the work function).' : Math.abs(v / E - 1) < 0.03 ? 'You forgot to subtract Φ.' : null,
        hint: 'KE_max = E_photon − Φ (use J for both).', explain: ejects ? `$KE_{max} = ${sci(ke)}$ J` : 'No electron: 0.' },
      { kind: 'num', id: 'nu0', title: 'Threshold frequency ν₀', formula: '\\nu_0 = \\dfrac{\\Phi}{h}', unit: 'Hz', answer: nu0,
        extra: (v) => Math.abs(v / nu - 1) < 0.03 ? 'That is the frequency of the light. Threshold: the ν at which hν equals Φ exactly.' : null,
        hint: 'At threshold KE = 0, so hν₀ = Φ.', explain: `$\\nu_0 = ${sci(nu0)}$ Hz` },
      { kind: 'num', id: 'lam0', title: 'Threshold wavelength λ₀', formula: '\\lambda_0 = \\dfrac{c}{\\nu_0}', unit: 'nm', answer: lam0,
        hint: 'λ₀ = c/ν₀, then convert m → nm. Light must have λ < λ₀.', explain: `$\\lambda_0 = ${sci(lam0)}$ nm` },
      ejects
        ? { kind: 'choice', id: 'int', title: 'The light intensity is doubled (same colour). What happens?', answer: 'n',
          options: [{ value: 'ke', label: 'KE_max doubles' }, { value: 'n', label: 'Twice as many electrons, same KE_max' }, { value: 'v', label: 'Same number, each faster' }, { value: 'none', label: 'Nothing changes' }],
          wrong: { ke: 'Intensity = number of photons per second, not energy per photon. KE_max = hν − Φ depends only on ν.', v: 'Each electron absorbs ONE photon whose energy is unchanged, so speed is unchanged; more photons means MORE electrons.', none: 'More photons per second eject more electrons (current doubles); only KE_max is unaffected.' },
          explain: 'Intensity changes the NUMBER of electrons, not their KE.' }
        : { kind: 'choice', id: 'int', title: 'The intensity is increased 100× (same colour). Are electrons ejected?', answer: 'no',
          options: [{ value: 'yes', label: 'Yes, enough photons add up' }, { value: 'no', label: 'No: each photon is still below Φ' }],
          wrong: { yes: 'One electron absorbs one photon; energies do not pile up. Below ν₀ no intensity works.' }, explain: 'Below threshold, no brightness helps.' },
    ]
    return s
  }, [metal, nm, E, phi, ke, ejects])

  return (
    <Workbench title="Photoelectric effect" subtitle="E = hν = Φ + KE" compact={props.compact} mode={work ? mode : undefined} onMode={setMode} onReset={() => setNonce((n) => n + 1)}
      tools={<div className="seg"><button className={!work ? 'on' : ''} onClick={() => setTab('explore')}>Explore</button><button className={work ? 'on' : ''} onClick={() => setTab('work')}>Challenge</button></div>}>
      <Scene nm={nm} ejects={ejects} ke={ke} inten={inten} />
      <div className="pe-metals">{METALS.map((x) => <button key={x.id} className={'btn sm' + (x.id === metal ? ' on' : '')} onClick={() => setMetal(x.id)}>{x.name}{!work && <small> Φ {x.ev} eV</small>}</button>)}</div>
      <div className="pe-ctl"><span>Wavelength</span><input type="range" min={100} max={800} value={nm} onChange={(e) => setNm(+e.target.value)} /><output>{nm} nm</output></div>
      <div className="pe-ctl"><span>Intensity</span><input type="range" min={1} max={10} value={inten} onChange={(e) => setInten(+e.target.value)} /><output>{inten} / 10</output></div>
      {!work && (
        <>
          <div className="l7-cards">
            <div className="l7-card"><small>E photon</small><b>{sci(E)} J</b></div>
            <div className="l7-card"><small>Φ ({metal})</small><b>{sci(phi)} J</b></div>
            <div className="l7-card"><small>KE_max</small><b>{ejects ? sci(ke) + ' J' : '0 (no e⁻)'}</b></div>
            <div className="l7-card"><small>ν₀ / λ₀</small><b>{sci(phi / h)} Hz / {Math.round((c / (phi / h)) * 1e9)} nm</b></div>
          </div>
          <div className="pe-bar" title="E_photon = Φ + KE">
            <span style={{ width: `${Math.min(100, (phi / 2.2e-18) * 100)}%`, background: '#64748b' }}>Φ</span>
            <span style={{ width: `${Math.min(100 - (phi / 2.2e-18) * 100, (ke / 2.2e-18) * 100)}%`, background: '#16a34a' }}>KE</span>
          </div>
          <small className="muted">Bar: photon energy split into work function Φ (to escape) and kinetic energy KE (left over). Slide ref: L7 s13–s16.</small>
        </>
      )}
      <div className="seg l7-tabs" style={{ marginTop: 10 }}>
        <button className={plot === 'kenu' ? 'on' : ''} onClick={() => setPlot('kenu')}>KE vs ν</button>
        <button className={plot === 'ne' ? 'on' : ''} onClick={() => setPlot('ne')}># e⁻ vs I</button>
        <button className={plot === 'kei' ? 'on' : ''} onClick={() => setPlot('kei')}>KE vs I</button>
      </div>
      <PlotView kind={plot} phi={phi} nu={nu} inten={inten} ejects={ejects} ke={ke} labels={!work} />
      {work && <StepRunner steps={steps} mode={mode} resetKey={`${metal}-${nm}-${nonce}-${mode}`} />}
    </Workbench>
  )
}
