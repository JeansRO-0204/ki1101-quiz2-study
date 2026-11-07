import { useMemo, useRef, useState } from 'react'
import type { WidgetProps } from '../../types'
import { Feedback, NumInput, SlideRef, Step, Tex, Verdict, Workbench, parseNum, recordAttempt, useMode, type Note, type StepStatus } from '../../lib/kit'
import { LatticeCompare } from './LatticeCompare'
import './l8.css'

type Kind = 'sub' | 'ie' | 'diss' | 'ea' | 'lat'
interface Row {
  key: string; kind: Kind; label: string; tex: string
  /** what the learner is given */
  given: string
  /** correct signed ΔH for this step as it appears in the cycle (kJ/mol of formula unit) */
  ans: number
  mult?: number
}
interface Cmpd {
  id: string; name: string; eq: string; rows: Row[]; hf: number; slide?: boolean; src: string
}

const C: Cmpd[] = [
  {
    id: 'NaCl', name: 'NaCl', eq: 'Na(s) + ½Cl₂(g) → NaCl(s)', hf: -411.1, slide: true, src: 'L8 s8',
    rows: [
      { key: 'sub', kind: 'sub', label: 'Sublimation of Na', tex: '\\mathrm{Na(s)\\to Na(g)}', given: 'ΔH = 107.8 kJ/mol', ans: 107.8 },
      { key: 'ie1', kind: 'ie', label: 'Ionization of Na', tex: '\\mathrm{Na(g)\\to Na^+(g)+e^-}', given: 'IE(Na) = 495.4 kJ/mol', ans: 495.4 },
      { key: 'diss', kind: 'diss', label: 'Dissociation: ½ Cl₂', tex: '\\mathrm{\\tfrac12Cl_2(g)\\to Cl(g)}', given: 'Cl–Cl bond energy D = 242.6 kJ/mol', ans: 121.3, mult: 1 },
      { key: 'ea1', kind: 'ea', label: 'Electron affinity of Cl', tex: '\\mathrm{Cl(g)+e^-\\to Cl^-(g)}', given: '348.8 kJ/mol is released per mole of Cl', ans: -348.8 },
      { key: 'lat', kind: 'lat', label: 'Lattice energy', tex: '\\mathrm{Na^+(g)+Cl^-(g)\\to NaCl(s)}', given: 'ΔH_lattice (slide: −787 kJ/mol)', ans: -787 },
    ],
  },
  {
    id: 'KCl', name: 'KCl', eq: 'K(s) + ½Cl₂(g) → KCl(s)', hf: -436.7, src: 'textbook values',
    rows: [
      { key: 'sub', kind: 'sub', label: 'Sublimation of K', tex: '\\mathrm{K(s)\\to K(g)}', given: 'ΔH = 89 kJ/mol', ans: 89 },
      { key: 'ie1', kind: 'ie', label: 'Ionization of K', tex: '\\mathrm{K(g)\\to K^+(g)+e^-}', given: 'IE(K) = 419 kJ/mol', ans: 419 },
      { key: 'diss', kind: 'diss', label: 'Dissociation: ½ Cl₂', tex: '\\mathrm{\\tfrac12Cl_2(g)\\to Cl(g)}', given: 'Cl–Cl bond energy D = 242.6 kJ/mol', ans: 121.3, mult: 1 },
      { key: 'ea1', kind: 'ea', label: 'Electron affinity of Cl', tex: '\\mathrm{Cl(g)+e^-\\to Cl^-(g)}', given: '348.8 kJ/mol is released per mole of Cl', ans: -348.8 },
      { key: 'lat', kind: 'lat', label: 'Lattice energy', tex: '\\mathrm{K^+(g)+Cl^-(g)\\to KCl(s)}', given: 'ΔH_lattice', ans: -717.2 },
    ],
  },
  {
    id: 'LiF', name: 'LiF', eq: 'Li(s) + ½F₂(g) → LiF(s)', hf: -616, src: 'textbook values',
    rows: [
      { key: 'sub', kind: 'sub', label: 'Sublimation of Li', tex: '\\mathrm{Li(s)\\to Li(g)}', given: 'ΔH = 159 kJ/mol', ans: 159 },
      { key: 'ie1', kind: 'ie', label: 'Ionization of Li', tex: '\\mathrm{Li(g)\\to Li^+(g)+e^-}', given: 'IE(Li) = 520 kJ/mol', ans: 520 },
      { key: 'diss', kind: 'diss', label: 'Dissociation: ½ F₂', tex: '\\mathrm{\\tfrac12F_2(g)\\to F(g)}', given: 'F–F bond energy D = 158 kJ/mol', ans: 79, mult: 1 },
      { key: 'ea1', kind: 'ea', label: 'Electron affinity of F', tex: '\\mathrm{F(g)+e^-\\to F^-(g)}', given: '328 kJ/mol is released per mole of F', ans: -328 },
      { key: 'lat', kind: 'lat', label: 'Lattice energy', tex: '\\mathrm{Li^+(g)+F^-(g)\\to LiF(s)}', given: 'ΔH_lattice', ans: -1046 },
    ],
  },
  {
    id: 'MgO', name: 'MgO', eq: 'Mg(s) + ½O₂(g) → MgO(s)', hf: -602, src: 'textbook values; EA₂(O) = +844 as on L8 s16',
    rows: [
      { key: 'sub', kind: 'sub', label: 'Sublimation of Mg', tex: '\\mathrm{Mg(s)\\to Mg(g)}', given: 'ΔH = 148 kJ/mol', ans: 148 },
      { key: 'ie1', kind: 'ie', label: 'Ionization: IE₁ of Mg', tex: '\\mathrm{Mg(g)\\to Mg^+(g)+e^-}', given: 'IE₁ = 738 kJ/mol', ans: 738 },
      { key: 'ie2', kind: 'ie', label: 'Ionization: IE₂ of Mg', tex: '\\mathrm{Mg^+(g)\\to Mg^{2+}(g)+e^-}', given: 'IE₂ = 1451 kJ/mol', ans: 1451 },
      { key: 'diss', kind: 'diss', label: 'Dissociation: ½ O₂', tex: '\\mathrm{\\tfrac12O_2(g)\\to O(g)}', given: 'O=O bond energy D = 498 kJ/mol', ans: 249, mult: 1 },
      { key: 'ea1', kind: 'ea', label: 'Electron affinity: EA₁ of O', tex: '\\mathrm{O(g)+e^-\\to O^-(g)}', given: '141 kJ/mol is released', ans: -141 },
      { key: 'ea2', kind: 'ea', label: 'Electron affinity: EA₂ of O⁻', tex: '\\mathrm{O^-(g)+e^-\\to O^{2-}(g)}', given: 'adding e⁻ to an anion costs 844 kJ/mol', ans: 844 },
      { key: 'lat', kind: 'lat', label: 'Lattice energy', tex: '\\mathrm{Mg^{2+}(g)+O^{2-}(g)\\to MgO(s)}', given: 'ΔH_lattice', ans: -3891 },
    ],
  },
  {
    id: 'CaCl2', name: 'CaCl₂', eq: 'Ca(s) + Cl₂(g) → CaCl₂(s)', hf: -795, src: 'IE₁, IE₂ of Ca from L8 s14; others textbook',
    rows: [
      { key: 'sub', kind: 'sub', label: 'Sublimation of Ca', tex: '\\mathrm{Ca(s)\\to Ca(g)}', given: 'ΔH = 178 kJ/mol', ans: 178 },
      { key: 'ie1', kind: 'ie', label: 'Ionization: IE₁ of Ca', tex: '\\mathrm{Ca(g)\\to Ca^+(g)+e^-}', given: 'IE₁ = 590 kJ/mol', ans: 590 },
      { key: 'ie2', kind: 'ie', label: 'Ionization: IE₂ of Ca', tex: '\\mathrm{Ca^+(g)\\to Ca^{2+}(g)+e^-}', given: 'IE₂ = 1140 kJ/mol', ans: 1140 },
      { key: 'diss', kind: 'diss', label: 'Dissociation of Cl₂', tex: '\\mathrm{Cl_2(g)\\to 2Cl(g)}', given: 'Cl–Cl bond energy D = 242.6 kJ/mol', ans: 242.6, mult: 2 },
      { key: 'ea1', kind: 'ea', label: 'Electron affinity of 2 Cl', tex: '\\mathrm{2Cl(g)+2e^-\\to 2Cl^-(g)}', given: '348.8 kJ/mol is released per mole of Cl', ans: -697.6, mult: 2 },
      { key: 'lat', kind: 'lat', label: 'Lattice energy', tex: '\\mathrm{Ca^{2+}(g)+2Cl^-(g)\\to CaCl_2(s)}', given: 'ΔH_lattice', ans: -2248 },
    ],
  },
]

const WHY: Record<Kind, string> = {
  sub: 'Breaking the solid metal apart costs energy → **endothermic (↑, +)**.',
  ie: 'Removing an electron from a gaseous atom/ion always costs energy → **endothermic (↑, +)**.',
  diss: 'Breaking a covalent bond costs energy (D is always positive, L9 s9) → **endothermic (↑, +)**.',
  ea: 'Adding the first electron to a nonmetal atom normally releases energy → **exothermic (↓, −)**; adding a further electron to an anion (e.g. O⁻ → O²⁻) costs energy (↑, +).',
  lat: 'Forming the lattice from gaseous ions releases energy → **exothermic (↓, −)** (L8 s10).',
}
const tolOf = (a: number) => Math.max(1.5, Math.abs(a) * 0.004)
const near = (x: number, a: number) => Number.isFinite(x) && Math.abs(x - a) <= tolOf(a)
const fmt = (x: number) => (Math.round(x * 10) / 10).toString().replace('-', '−')

function Cycle({ c, unknown, entered, solved }: { c: Cmpd; unknown: string; entered: Record<string, 'ok' | undefined>; solved: boolean }) {
  const rows = c.rows
  // cumulative path (using true values for geometry so that nothing jumps)
  const pts: number[] = [0]
  rows.forEach((r) => pts.push(pts[pts.length - 1] + r.ans))
  const lo = Math.min(...pts, c.hf), hi = Math.max(...pts, c.hf)
  const W = 560, H = 330, T = 24, B = 60
  const y = (v: number) => T + ((hi - v) / (hi - lo || 1)) * (H - T - B)
  const colW = (W - 110) / (rows.length + 1)
  const x0 = 70
  const shown: boolean[] = rows.map((r) => r.key === unknown ? solved : entered[r.key] === 'ok')
  // the path is only drawn as far as it is continuous
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ie-svg" role="img" aria-label="Born–Haber cycle">
      <defs>
        <marker id="ie-up" viewBox="0 0 10 10" refX="5" refY="2" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 8 L5 1 L9 8" fill="none" stroke="currentColor" strokeWidth="1.8" /></marker>
        <marker id="ie-dn" viewBox="0 0 10 10" refX="5" refY="8" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2 L5 9 L9 2" fill="none" stroke="currentColor" strokeWidth="1.8" /></marker>
      </defs>
      <line x1={50} y1={y(0)} x2={W - 20} y2={y(0)} className="ie-zero" />
      <text x={52} y={y(0) - 5} className="ie-t">0 · elements</text>
      <line x1={26} y1={H - B} x2={26} y2={T - 8} className="ie-axis" markerEnd="url(#ie-up)" style={{ color: '#647084' }} />
      <text x={32} y={T - 8} className="ie-t">H</text>
      {rows.map((r, i) => {
        const a = pts[i], b = pts[i + 1]
        const x = x0 + i * colW + colW * 0.1
        const w = colW * 0.8
        const on = shown[i]
        const up = r.ans > 0
        const cx = x + w / 2
        return (
          <g key={r.key} className={'ie-step' + (on ? ' on' : '') + (r.key === unknown ? ' unk' : '')}>
            <line x1={x} y1={y(a)} x2={x + w} y2={y(a)} className="ie-lvl" />
            <line x1={x} y1={y(b)} x2={x + w} y2={y(b)} className="ie-lvl" />
            <line x1={cx} y1={y(a)} x2={cx} y2={y(b) + (up ? 3 : -3)} className={'ie-arrow ' + (up ? 'up' : 'dn')} markerEnd={up ? 'url(#ie-up)' : 'url(#ie-dn)'} style={{ color: up ? '#d97706' : '#2563eb' }} />
            <text x={cx} y={H - B + 18} textAnchor="middle" className="ie-t ie-lab">{r.kind === 'sub' ? 'ΔHsub' : r.kind === 'ie' ? r.label.includes('IE₂') ? 'IE₂' : r.label.includes('IE₁') ? 'IE₁' : 'IE' : r.kind === 'diss' ? (r.mult === 2 ? 'D' : '½D') : r.kind === 'ea' ? (r.key === 'ea2' ? 'EA₂' : r.mult === 2 ? '2×EA' : 'EA') : 'ΔH latt'}</text>
            <text x={cx} y={(y(a) + y(b)) / 2 + 4} textAnchor={'start'} dx={6} className="ie-val">{on ? (r.ans > 0 ? '+' : '') + fmt(r.ans) : r.key === unknown ? '?' : ''}</text>
          </g>
        )
      })}
      {/* ΔHf bracket */}
      <g className={'ie-hf' + (unknown === 'hf' && !solved ? ' dashed' : '')}>
        <line x1={W - 40} y1={y(0)} x2={W - 40} y2={y(c.hf) - 3} markerEnd="url(#ie-dn)" style={{ color: '#15803d' }} />
        <text x={W - 44} y={(y(0) + y(c.hf)) / 2} textAnchor="end" className="ie-val hf">ΔHf° {unknown === 'hf' && !solved ? '= ?' : '= ' + fmt(c.hf)}</text>
      </g>
      <text x={W - 40} y={y(c.hf) + 16} textAnchor="middle" className="ie-t">{c.name}(s)</text>
    </svg>
  )
}

export default function IonicEnergetics({ mode: forced, onResult, compact }: WidgetProps) {
  const [mode, setMode] = useMode(forced)
  const [cid, setCid] = useState('NaCl')
  const c = C.find((x) => x.id === cid) ?? C[0]
  const [unknown, setUnknown] = useState('lat')
  const [vals, setVals] = useState<Record<string, string>>({})
  const [dirs, setDirs] = useState<Record<string, 'up' | 'dn' | undefined>>({})
  const [res1, setRes1] = useState<{ ok: boolean; per: Record<string, 'ok' | 'err'>; notes: Note[] } | null>(null)
  const [xStr, setXStr] = useState('')
  const [res2, setRes2] = useState<{ ok: boolean; notes: Note[] } | null>(null)
  const [why, setWhy] = useState<number | null>(null)
  const [res3, setRes3] = useState<{ ok: boolean; notes: Note[] } | null>(null)
  const [wrong, setWrong] = useState(0)
  const [checked, setChecked] = useState(false)
  const fired = useRef(false)

  const knownRows = c.rows.filter((r) => r.key !== unknown)
  const unkRow = c.rows.find((r) => r.key === unknown)
  const sumKnown = knownRows.reduce((s, r) => s + r.ans, 0)
  const target = unknown === 'hf' ? c.hf : (unkRow ? c.hf - sumKnown : NaN)
  const unkLabel = unknown === 'hf' ? 'ΔHf°' : unkRow?.label ?? ''

  const reset = (nc = cid, nu = unknown) => {
    setVals({}); setDirs({}); setRes1(null); setXStr(''); setRes2(null); setWhy(null); setRes3(null); setWrong(0); setChecked(false); fired.current = false
    void nc; void nu
  }

  function eval1(): { ok: boolean; per: Record<string, 'ok' | 'err'>; notes: Note[] } {
    const per: Record<string, 'ok' | 'err'> = {}
    const notes: Note[] = []
    for (const r of knownRows) {
      const x = parseNum(vals[r.key] ?? '')
      const d = dirs[r.key]
      const wantUp = r.ans > 0
      const nm = `**${r.label}**`
      if (!Number.isFinite(x)) { per[r.key] = 'err'; notes.push({ level: 'err', msg: `${nm}: enter the ΔH (with sign) in kJ/mol.` }); continue }
      if (d && (d === 'up') !== wantUp) {
        per[r.key] = 'err'; notes.push({ level: 'err', msg: `${nm}: wrong direction. ${WHY[r.kind]}` }); continue
      }
      if (near(x, r.ans)) {
        if (!d) { per[r.key] = 'err'; notes.push({ level: 'hint', msg: `${nm}: value is right; also mark it endothermic ↑ or exothermic ↓.` }); continue }
        per[r.key] = 'ok'; continue
      }
      per[r.key] = 'err'
      if (near(-x, r.ans)) notes.push({ level: 'err', msg: `${nm}: right size, wrong sign. ${WHY[r.kind]}` })
      else if (r.mult === 1 && r.kind === 'diss' && near(x, r.ans * 2)) notes.push({ level: 'err', msg: `${nm}: you used the full bond energy D, but the step makes only **one** Cl atom from **½** Cl₂, so use ½ D.` })
      else if (r.mult === 2 && (near(x, r.ans / 2) || near(-x, r.ans / 2))) notes.push({ level: 'err', msg: `${nm}: the formula unit contains **2** Cl, so multiply the per-atom value by 2.` })
      else notes.push({ level: 'err', msg: `${nm}: ${fmt(x)} is not right. Re-read the data (${r.given}). ${WHY[r.kind]}` })
    }
    const ok = knownRows.every((r) => per[r.key] === 'ok')
    if (ok) notes.push({ level: 'ok', msg: 'All step energies and directions are right. The cycle diagram now shows them.' })
    return { ok, per, notes }
  }
  function eval2(): { ok: boolean; notes: Note[] } {
    const x = parseNum(xStr)
    const n: Note[] = []
    if (near(x, target)) {
      n.push({ level: 'ok', msg: unknown === 'hf'
        ? `ΔHf° = Σ steps = ${fmt(sumKnown)} → **${fmt(target)} kJ/mol**.`
        : `${unkLabel} = ΔHf° − (sum of the other steps) = ${fmt(c.hf)} − (${fmt(sumKnown)}) = **${fmt(target)} kJ/mol**.` })
      if (unknown === 'lat' && target > 0) n.push({ level: 'warn', msg: 'Lattice energy should come out negative.' })
      return { ok: true, notes: n }
    }
    if (!Number.isFinite(x)) n.push({ level: 'err', msg: 'Enter a number in kJ/mol.' })
    else if (near(-x, target)) n.push({ level: 'err', msg: `Right size, wrong sign. ${unknown === 'lat' ? 'Lattice energy is **exothermic**, so negative (L8 s10).' : unknown === 'hf' ? 'A stable compound has ΔHf° < 0 (L8 s7); recheck the signs of your sum.' : 'Check the direction rule for this step.'}` })
    else if (unknown !== 'hf' && near(x, c.hf + sumKnown)) n.push({ level: 'err', msg: 'You added the other steps to ΔHf°. Hess: ΔHf° = Σ steps, so unknown = ΔHf° **−** Σ(known steps).' })
    else if (unknown !== 'hf' && near(x, sumKnown)) n.push({ level: 'err', msg: 'That is the sum of the known steps; subtract it from ΔHf°: unknown = ΔHf° − Σ(known).' })
    else n.push({ level: 'hint', msg: `Hess's law: ΔHf° = ${c.rows.map((r) => r.kind === 'sub' ? 'ΔHsub' : r.kind === 'ie' ? 'IE' : r.kind === 'diss' ? 'D-term' : r.kind === 'ea' ? 'EA' : 'ΔH_latt').join(' + ')}. Substitute and solve for ${unkLabel}.` })
    return { ok: false, notes: n }
  }
  const WHYS = [
    'The large exothermic lattice energy outweighs the endothermic steps (sublimation, dissociation, ionization).',
    'The electron affinity of the nonmetal is large enough on its own.',
    'Ionization is exothermic, so forming the cation lowers the energy.',
  ]
  function eval3(): { ok: boolean; notes: Note[] } {
    if (why === 0) return { ok: true, notes: [{ level: 'ok', msg: `Yes: for a stable compound the potential energy must be lowered (ΔHf° < 0, L8 s7). Ionization is paid for by the lattice energy, even for 2+/2− ions (L8 s10).` }] }
    if (why === 1) return { ok: false, notes: [{ level: 'err', msg: `EA is small, and for O⁻→O²⁻ it is even endothermic (+844). The big stabiliser is the lattice energy.` }] }
    return { ok: false, notes: [{ level: 'err', msg: 'Ionization is always endothermic (energy in). The net lowering comes from the lattice energy.' }] }
  }

  const finish = (ok: boolean, score: number, summary: string) => {
    if (fired.current) return
    fired.current = true
    onResult?.({ correct: ok, score, summary })
    if (onResult) recordAttempt({ id: `ionic:${c.id}`, lecture: 'L8', topic: 'Born–Haber / lattice energy', correct: ok, score })
  }
  const doCheck = (i: 1 | 2 | 3) => {
    if (i === 1) { const r = eval1(); setRes1(r); if (!r.ok) setWrong((w) => w + 1) }
    if (i === 2) { const r = eval2(); setRes2(r); if (!r.ok) setWrong((w) => w + 1) }
    if (i === 3) {
      const r = eval3(); setRes3(r); if (!r.ok) setWrong((w) => w + 1)
      if (r.ok && mode === 'learn') finish(wrong === 0, Math.max(0, 1 - 0.15 * wrong), `${c.id}: ${unkLabel} = ${fmt(target)}`)
    }
  }
  const checkAll = () => {
    const a = eval1(), b = eval2(), d = eval3()
    setRes1(a); setRes2(b); setRes3(d); setChecked(true)
    const n = [a.ok, b.ok, d.ok].filter(Boolean).length
    finish(n === 3, n / 3, n === 3 ? `${c.id}: all correct` : `${c.id}: ${3 - n} of 3 parts wrong`)
  }

  const st = (i: 1 | 2 | 3): StepStatus => {
    const r = i === 1 ? res1 : i === 2 ? res2 : res3
    const prev = i === 1 ? true : i === 2 ? !!res1?.ok : !!res2?.ok
    if (mode === 'learn') { if (!prev) return 'locked'; return r ? (r.ok ? 'done' : 'error') : 'active' }
    return checked && r ? (r.ok ? 'done' : 'error') : 'active'
  }
  const btn = (i: 1 | 2 | 3) => mode === 'learn' && st(i) !== 'done' && <div className="ie-check"><button className="btn primary sm" onClick={() => doCheck(i)}>Check step {i}</button></div>

  const entered = useMemo(() => {
    const o: Record<string, 'ok' | undefined> = {}
    if (mode === 'learn' || checked) Object.entries(res1?.per ?? {}).forEach(([k, v]) => { if (v === 'ok') o[k] = 'ok' })
    else knownRows.forEach((r) => { const x = parseNum(vals[r.key] ?? ''); if (near(x, r.ans)) o[r.key] = 'ok' })
    return o
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res1, vals, mode, checked, cid, unknown])
  const solved = !!res2?.ok

  const cmp = c
  return (
    <Workbench title="Born–Haber cycle workbench" compact={compact} mode={mode} onMode={setMode} onReset={() => reset()}
      subtitle={<>Hess's law for an ionic solid <SlideRef l="L8" s={8} /></>}
      tools={<>
        <select className="ie-select" value={cid} onChange={(e) => { setCid(e.target.value); setUnknown('lat'); reset() }} aria-label="Compound">
          {C.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <select className="ie-select" value={unknown} onChange={(e) => { setUnknown(e.target.value); reset() }} aria-label="Unknown quantity">
          <option value="lat">Find: lattice energy</option>
          <option value="hf">Find: ΔHf°</option>
          {c.rows.filter((r) => r.kind === 'ie' || r.kind === 'ea' || r.kind === 'sub').slice(0, 3).map((r) => <option key={r.key} value={r.key}>Find: {r.label}</option>)}
        </select>
      </>}>
      <div className={'ie-layout' + (compact ? ' compact' : '')}>
        <div className="ie-left">
          <Cycle c={cmp} unknown={unknown} entered={entered} solved={solved} />
          <p className="ie-cap"><Tex>{cmp.eq.replace(/₂/g, '_2').replace(/½/g, '\\tfrac12').replace(/→/g, '\\to ').replace(/\(([sg])\)/g, '\\mathrm{($1)}')}</Tex></p>
          <p className="ie-cap muted">Arrows up = endothermic (+), down = exothermic (−). {cmp.slide ? '' : `Values: ${cmp.src}; lattice energy is derived from ΔHf° so the cycle closes.`}</p>
        </div>
        <div className="ie-right">
          <Step n={1} title="Write the energy of each step (value and direction)" status={st(1)} notes={res1?.notes}>
            <div className="ie-rows">
              {c.rows.map((r) => {
                const isU = r.key === unknown
                const s = res1?.per[r.key]
                return (
                  <div key={r.key} className={'ie-row' + (isU ? ' unk' : '') + (s ? ' ' + s : '')}>
                    <div className="ie-row-h"><b>{r.label}</b><Tex>{r.tex}</Tex></div>
                    {isU ? <div className="muted ie-small">Unknown, solved in step 2.</div> : (
                      <>
                        <div className="ie-small muted">{r.kind === 'lat' && unknown !== 'lat' ? `Given: lattice energy, ${r.given.includes('slide') ? '−787 kJ/mol (slide)' : fmt(r.ans) + ' kJ/mol'}` : `Given: ${r.given}`}</div>
                        <div className="row">
                          <div className="seg">
                            <button className={dirs[r.key] === 'up' ? 'on' : ''} onClick={() => { setDirs({ ...dirs, [r.key]: 'up' }); setRes1(null) }}>↑ endo</button>
                            <button className={dirs[r.key] === 'dn' ? 'on' : ''} onClick={() => { setDirs({ ...dirs, [r.key]: 'dn' }); setRes1(null) }}>↓ exo</button>
                          </div>
                          <NumInput value={vals[r.key] ?? ''} onChange={(s2) => { setVals({ ...vals, [r.key]: s2 }); setRes1(null) }} placeholder="± kJ/mol" width={100} unit="kJ/mol" state={s ?? null} />
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
              <div className="ie-row hf">
                <div className="ie-row-h"><b>Overall: ΔHf°</b><Tex>{'\\Delta H_f^\\circ'}</Tex></div>
                <div className="ie-small muted">{unknown === 'hf' ? 'Unknown, solved in step 2.' : `Given: ΔHf°(${cmp.name}) = ${fmt(cmp.hf)} kJ/mol`}</div>
              </div>
            </div>
            {btn(1)}
          </Step>

          <Step n={2} title={<>Solve for {unkLabel} with Hess's law</>} status={st(2)} notes={res2?.notes}>
            <p className="ie-small">Path 1 = path 2:&nbsp;
              <Tex>{`\\Delta H_f^\\circ = \\Delta H_{sub} + \\sum IE + \\text{(bond-breaking)} + \\sum EA + \\Delta H_{latt}`}</Tex></p>
            {(res1?.ok || mode === 'test') && (
              <p className="ie-small">{unknown === 'hf' ? `ΔHf° = ${knownRows.map((r) => (r.ans < 0 ? '(' + fmt(r.ans) + ')' : fmt(r.ans))).join(' + ')}` : `${fmt(c.hf)} = ${knownRows.map((r) => (r.ans < 0 ? '(' + fmt(r.ans) + ')' : fmt(r.ans))).join(' + ')} + (${unkLabel})`}</p>
            )}
            <div className="row">
              <span className="ie-small">{unkLabel} =</span>
              <NumInput value={xStr} onChange={(s2) => { setXStr(s2); setRes2(null) }} placeholder="± kJ/mol" unit="kJ/mol" state={res2 ? (res2.ok ? 'ok' : 'err') : null} />
            </div>
            {btn(2)}
          </Step>

          <Step n={3} title="Why is the compound stable?" status={st(3)} notes={res3?.notes}>
            <div className="ie-opts">
              {WHYS.map((t, k) => <button key={k} className={'ie-opt' + (why === k ? ' on' : '')} onClick={() => { setWhy(k); setRes3(null) }}>{t}</button>)}
            </div>
            {btn(3)}
          </Step>
          {mode === 'test' && !checked && <div className="ie-check"><button className="btn primary" onClick={checkAll}>Check all</button></div>}
          {((mode === 'learn' && res3?.ok) || checked) && (
            <Verdict correct={res1?.ok && res2?.ok && res3?.ok ? true : 'partial'} title={res1?.ok && res2?.ok && res3?.ok ? `${unkLabel} = ${fmt(target)} kJ/mol` : 'Some parts need another look'}>
              {mode === 'test' && checked && <Feedback notes={[...(res1?.ok ? [] : (res1?.notes ?? [])), ...(res2?.ok ? [] : (res2?.notes ?? [])), ...(res3?.ok ? [] : (res3?.notes ?? []))]} />}
            </Verdict>
          )}
        </div>
      </div>
      <LatticeCompare compact={compact} />
    </Workbench>
  )
}
