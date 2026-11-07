import { useEffect, useMemo, useState } from 'react'
import './l7.css'
import { Workbench, useMode, sci, CONST } from '../../lib/kit'
import type { WidgetProps, Tasks } from '../../types'
import { StepRunner, type StepDef } from './StepRunner'
import { lightColor, regionOf, useRaf } from './shared'

const { h, c, RE } = CONST
const RH = 109678 // cm^-1 (slide L7 s20)
const SERIES: Record<number, string> = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen', 4: 'Brackett', 5: 'Pfund', 6: 'Humphreys' }
const REG: Record<number, string> = { 1: 'UV', 2: 'visible', 3: 'IR', 4: 'IR', 5: 'IR', 6: 'IR' }
const En = (n: number) => -RE / (n * n)
const lamNm = (a: number, b: number) => 1e7 / (RH * (1 / (Math.min(a, b) ** 2) - 1 / (Math.max(a, b) ** 2)))
const yOf = (n: number) => 40 + 300 / Math.sqrt(n)
const ease = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x))
const NMIN = 80, NMAX = 2600
const sx = (nm: number) => 20 + ((Math.log10(nm) - Math.log10(NMIN)) / (Math.log10(NMAX) - Math.log10(NMIN))) * 560

function Ladder({ ni, nf, onPick, hide, replay }: { ni: number | null; nf: number | null; onPick?: (n: number) => void; hide: boolean; replay: number }) {
  const [t, setT] = useState(0)
  useEffect(() => { setT(0) }, [ni, nf, replay])
  useRaf((x) => setT(Math.min(x, 3)), true)
  const both = ni != null && nf != null && ni !== nf
  const emit = both && ni! > nf!
  const lam = both ? lamNm(ni!, nf!) : 0
  const col = both && !hide ? lightColor(lam) : '#64748b'
  const jp = both ? ease(emit ? (t - 0.4) / 1.0 : (t - 1.0) / 1.0) : 0 // electron progress
  const ey = both ? yOf(ni!) + (yOf(nf!) - yOf(ni!)) * jp : ni ? yOf(ni) : 0
  const ex = 190 + (both ? 20 * Math.sin(jp * Math.PI) : 0)
  const wave = (x0: number, y0: number, len: number, dir: number, ph: number) => {
    let d = ''
    for (let i = 0; i <= len; i += 3) d += `${i ? 'L' : 'M'}${x0 + dir * i},${y0 + 7 * Math.sin(i / 4 - ph * 8)} `
    return d
  }
  const pe = emit ? (t - 1.4) / 1.4 : (t - 0) / 1.0 // photon progress
  return (
    <svg className="ha-svg" viewBox="0 0 600 400">
      <text x="14" y="22" fontSize="11" fill="#64748b">energy (levels not to scale: compressed)</text>
      <line x1="120" y1="40" x2="260" y2="40" stroke="#94a3b8" strokeDasharray="5 4" /><text x="268" y="44" fontSize="11" fill="#64748b">n = ∞, E = 0</text>
      {[1, 2, 3, 4, 5, 6, 7].map((n) => {
        const y = yOf(n)
        const sel = n === ni || n === nf
        return (
          <g key={n} className="ha-level" onClick={() => onPick?.(n)} style={{ cursor: onPick ? 'pointer' : 'default' }}>
            <rect x="60" y={y - 7} width="300" height="14" fill="transparent" />
            <line x1="120" x2="260" y1={y} y2={y} stroke={sel ? '#2563eb' : '#334155'} strokeWidth={sel ? 3.5 : 2} />
            <text x="112" y={y + 4} textAnchor="end" fontSize="12" fontWeight={sel ? 700 : 400} fill={sel ? '#2563eb' : '#334155'}>n = {n}</text>
            <text x="268" y={y + 4} fontSize="11" fill="#64748b">{n === ni ? 'initial' : n === nf ? 'final' : n <= 3 ? `${sci(En(n))} J` : ''}</text>
          </g>
        )
      })}
      {both && <circle cx={ex} cy={ey} r="7" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />}
      {!both && ni != null && <circle cx="190" cy={yOf(ni)} r="7" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />}
      {both && emit && pe > 0 && pe < 1.6 && <path d={wave(215 + pe * 180, ey, 70, 1, pe)} stroke={col} strokeWidth="3" fill="none" opacity={1 - pe / 1.8} />}
      {both && !emit && pe < 1.2 && <path d={wave(430 - ease(pe) * 215, yOf(ni!) , 70, 1, pe)} stroke={col} strokeWidth="3" fill="none" opacity={pe > 0.9 ? 0 : 1} />}
      {both && <text x="440" y="200" fontSize="14" fill="#334155" fontWeight="700">{emit ? 'photon emitted' : 'photon absorbed'}</text>}
      {/* spectrum strip */}
      <g transform="translate(0,350)">
        <defs><linearGradient id="ha-vis" x1="0" x2="1">{[380, 440, 490, 530, 580, 645, 750].map((w) => <stop key={w} offset={(w - 380) / 370} stopColor={lightColor(w)} />)}</linearGradient></defs>
        <rect x={sx(NMIN)} y="0" width={sx(380) - sx(NMIN)} height="26" fill="#312e81" />
        <rect x={sx(380)} y="0" width={sx(750) - sx(380)} height="26" fill="url(#ha-vis)" />
        <rect x={sx(750)} y="0" width={sx(NMAX) - sx(750)} height="26" fill="#450a0a" />
        {[1, 2, 3].flatMap((lo) => Array.from({ length: 7 - lo }, (_, k) => lo + 1 + k).map((hi) => ({ lo, hi }))).map(({ lo, hi }) => {
          const l = lamNm(lo, hi)
          if (l < NMIN || l > NMAX) return null
          const sel = both && Math.min(ni!, nf!) === lo && Math.max(ni!, nf!) === hi
          return <line key={`${lo}-${hi}`} x1={sx(l)} x2={sx(l)} y1={sel ? -6 : 0} y2="26" stroke={sel ? '#fff' : '#ffffff88'} strokeWidth={sel ? 3 : 1} />
        })}
        {[100, 200, 400, 700, 1000, 2000].map((w) => <text key={w} x={sx(w)} y="40" fontSize="10" textAnchor="middle" fill="#64748b">{w} nm</text>)}
        <text x={sx(110)} y="-9" fontSize="10" fill="#4338ca" textAnchor="middle">UV</text><text x={sx(530)} y="-9" fontSize="10" fill="#15803d" textAnchor="middle">visible</text><text x={sx(1400)} y="-9" fontSize="10" fill="#b91c1c" textAnchor="middle">IR</text>
        {both && !hide && <text x={sx(lam)} y="-12" fontSize="11" fontWeight="700" textAnchor="middle" fill="#111">▼</text>}
      </g>
    </svg>
  )
}

export default function HAtom(props: WidgetProps<Tasks['hatom']>) {
  const task = props.task
  const [mode, setMode] = useMode(props.mode, 'chem.mode.hatom')
  const [ni, setNi] = useState<number | null>(task?.ni ?? 3)
  const [nf, setNf] = useState<number | null>(task?.nf ?? 2)
  const [replay, setReplay] = useState(0)
  const [done, setDone] = useState(false)
  const [reveal, setReveal] = useState(false)
  useEffect(() => { if (task) { setNi(task.ni); setNf(task.nf); setDone(false) } }, [task?.ni, task?.nf]) // eslint-disable-line react-hooks/exhaustive-deps
  const both = ni != null && nf != null && ni !== nf
  const hidden = !!task && !done
  const pick = (n: number) => {
    if (task) return
    if (ni == null || (ni != null && nf != null)) { setNi(n); setNf(null) } else if (n === ni) setNi(null); else setNf(n)
  }
  const steps: StepDef[] = useMemo(() => {
    if (!both) return []
    const emit = ni! > nf!
    const nl = Math.min(ni!, nf!), nh = Math.max(ni!, nf!)
    const dE = En(nf!) - En(ni!)
    const nu = Math.abs(dE) / h
    const ryd = RH * (1 / (nl * nl) - 1 / (nh * nh))
    const lam = 1e7 / ryd
    const serOpts = Object.entries(SERIES).map(([k, v]) => ({ value: k, label: `${v} (${REG[+k]})` }))
    const out: StepDef[] = [
      { kind: 'choice', id: 'proc', title: <>Electron goes n = {ni} → n = {nf}: emission or absorption?</>, answer: emit ? 'em' : 'ab',
        options: [{ value: 'em', label: 'Emission (photon released)' }, { value: 'ab', label: 'Absorption (photon taken in)' }],
        wrong: emit ? { ab: 'Going to a LOWER n means the electron loses energy: that energy leaves as a photon (emission).' } : { em: 'Going to a HIGHER n requires energy: the atom absorbs a photon of exactly ΔE.' },
        explain: emit ? 'Down in n → emission.' : 'Up in n → absorption.' },
      { kind: 'num', id: 'dE', title: 'ΔE of the electron (signed)', formula: '\\Delta E = E_f - E_i,\\ E_n = -\\dfrac{2.18\\times10^{-18}\\ \\text{J}}{n^2}', unit: 'J', answer: dE, tol: { rel: 0.02 },
        extra: (v) => Math.abs(v + dE) / Math.abs(dE) < 0.03 ? `Sign is flipped: ΔE = E_final − E_initial. ${emit ? 'Emission is negative (electron lost energy).' : 'Absorption is positive (electron gained energy).'}`
          : Math.abs(Math.abs(v) / (RE * Math.abs(1 / nl - 1 / nh)) - 1) < 0.03 ? 'You used 1/n instead of 1/n². E_n = −2.18×10⁻¹⁸/n².' : null,
        hint: `E_${nf} = ${sci(En(nf!))} J and E_${ni} = ${sci(En(ni!))} J: subtract final − initial.`, explain: `$\\Delta E = ${sci(dE)}$ J (${emit ? 'negative: emission' : 'positive: absorption'})` },
      { kind: 'num', id: 'nu', title: 'Frequency of the photon', formula: '\\nu = \\dfrac{|\\Delta E|}{h}', unit: 'Hz', answer: nu,
        extra: (v) => v < 0 ? 'Frequency is positive: use |ΔE|.' : null, hint: 'ν = |ΔE|/h, h = 6.626×10⁻³⁴ J·s.', explain: `$\\nu = ${sci(nu)}$ Hz` },
      { kind: 'num', id: 'ryd', title: <>Rydberg: 1/λ with R<sub>H</sub> = 109 678 cm⁻¹</>, formula: '\\dfrac{1}{\\lambda} = R_H\\left(\\dfrac{1}{n_1^2}-\\dfrac{1}{n_2^2}\\right),\\ n_2>n_1', unit: 'cm⁻¹', answer: ryd,
        extra: (v) => v < 0 ? 'Negative: put the smaller n as n₁ so that 1/n₁² − 1/n₂² > 0 (Rydberg uses n₂ > n₁).' : Math.abs(v / (RH * (1 / nl - 1 / nh)) - 1) < 0.03 ? 'You used 1/n; it must be 1/n².' : null,
        hint: `n₁ = ${nl}, n₂ = ${nh}: 1/${nl}² − 1/${nh}².`, explain: `$1/\\lambda = ${sci(ryd)}$ cm⁻¹` },
      { kind: 'num', id: 'lam', title: 'Wavelength of the line', formula: '\\lambda = \\dfrac{1}{1/\\lambda}', unit: 'nm', answer: lam,
        hint: '1 cm = 10⁷ nm. Cross-check: λ = hc/|ΔE| gives the same answer.', explain: `$\\lambda = ${sci(lam)}$ nm (check: hc/|ΔE|)` },
      { kind: 'choice', id: 'ser', title: 'Which spectral series, and which region?', answer: String(nl), options: serOpts,
        prompt: 'The series is set by the LOWER level (n = 1 Lyman, 2 Balmer, 3 Paschen, 4 Brackett, …).',
        wrong: Object.fromEntries(serOpts.map((o) => [o.value, `The lower level is n = ${nl}, so this is the ${SERIES[nl]} series (${REG[nl]}). Here λ = ${Math.round(lam)} nm → ${regionOf(lam * 1e-9).name}.`])),
        explain: `${SERIES[nl]} series, ${REG[nl]}.` },
    ]
    return out
  }, [ni, nf, both])

  const nl = both ? Math.min(ni!, nf!) : 0
  return (
    <Workbench title="Hydrogen atom: Bohr levels" subtitle={<>E<sub>n</sub> = −2.18×10⁻¹⁸ J / n²</>} compact={props.compact} mode={props.mode ? undefined : mode} onMode={setMode}
      onReset={() => { if (!task) { setNi(3); setNf(2) } setReplay((r) => r + 1); setDone(false); setReveal(false) }}>
      {task
        ? <p style={{ marginTop: 0 }}><b>Task:</b> the electron in H goes from n = {task.ni} to n = {task.nf}. Work out the energy change and the spectral line.</p>
        : <div className="ha-row">Click an <b>initial</b> level, then a <b>final</b> level.
          <select value={ni ?? ''} onChange={(e) => { setNi(e.target.value ? +e.target.value : null) }}><option value="">from n…</option>{[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n}>{n}</option>)}</select>→
          <select value={nf ?? ''} onChange={(e) => { setNf(e.target.value ? +e.target.value : null) }}><option value="">to n…</option>{[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n}>{n}</option>)}</select>
          <button className="btn sm" onClick={() => setReplay((r) => r + 1)}>↻ Replay</button></div>}
      <Ladder ni={ni} nf={nf} onPick={task ? undefined : pick} hide={hidden} replay={replay} />
      {both && !hidden && (
        <div className="l7-cards">
          <div className="l7-card"><small>Process</small><b>{ni! > nf! ? 'emission' : 'absorption'}</b></div>
          <div className="l7-card"><small>Series</small><b>{SERIES[nl]} ({REG[nl]})</b></div>
          <div className={'l7-card' + (reveal || done ? '' : ' hidden')}><small>λ</small><b>{reveal || done ? `${lamNm(ni!, nf!).toFixed(1)} nm` : '•••'}</b></div>
          {!task && <button className="btn sm" onClick={() => setReveal((r) => !r)}>{reveal ? 'Hide λ' : 'Reveal λ (after trying!)'}</button>}
        </div>
      )}
      {both ? <StepRunner steps={steps} mode={mode} resetKey={`${ni}-${nf}-${mode}`} final={!!task}
        onFinal={(r) => { setDone(true); props.onResult?.(r) }} />
        : <p className="muted">Pick two different levels to start the worked steps.</p>}
    </Workbench>
  )
}
