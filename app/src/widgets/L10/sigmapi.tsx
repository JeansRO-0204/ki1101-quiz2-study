import { useMemo, useState } from 'react'
import type { WidgetProps } from '../../types'
import { Workbench, useMode, Step, Verdict, NumInput, SlideRef, type Note } from '../../lib/kit'
import { Choice, useStepper, type StepResult } from './shared'
import { cpkCss } from './Mol3D'

type H = 'sp' | 'sp2' | 'sp3'
const HL: Record<H, string> = { sp: 'sp', sp2: 'sp²', sp3: 'sp³' }
interface A { sym: string; x: number; y: number; lp?: number; lpAng?: number[] }
interface Bd { a: number; b: number; order: 1 | 2 | 3 }
interface Mol { id: string; name: string; atoms: A[]; bonds: Bd[] }

const MOLS: Mol[] = [
  { id: 'C2H4', name: 'ethene', atoms: [{ sym: 'C', x: 235, y: 150 }, { sym: 'C', x: 365, y: 150 }, { sym: 'H', x: 170, y: 112 }, { sym: 'H', x: 170, y: 188 }, { sym: 'H', x: 430, y: 112 }, { sym: 'H', x: 430, y: 188 }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 1 }, { a: 0, b: 3, order: 1 }, { a: 1, b: 4, order: 1 }, { a: 1, b: 5, order: 1 }] },
  { id: 'C2H2', name: 'ethyne', atoms: [{ sym: 'H', x: 110, y: 150 }, { sym: 'C', x: 230, y: 150 }, { sym: 'C', x: 370, y: 150 }, { sym: 'H', x: 490, y: 150 }], bonds: [{ a: 0, b: 1, order: 1 }, { a: 1, b: 2, order: 3 }, { a: 2, b: 3, order: 1 }] },
  { id: 'H2CO', name: 'formaldehyde', atoms: [{ sym: 'C', x: 250, y: 150 }, { sym: 'O', x: 390, y: 150, lp: 2, lpAng: [-35, 35] }, { sym: 'H', x: 185, y: 112 }, { sym: 'H', x: 185, y: 188 }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 1 }, { a: 0, b: 3, order: 1 }] },
  { id: 'N2', name: 'nitrogen', atoms: [{ sym: 'N', x: 235, y: 150, lp: 1, lpAng: [180] }, { sym: 'N', x: 365, y: 150, lp: 1, lpAng: [0] }], bonds: [{ a: 0, b: 1, order: 3 }] },
  { id: 'HCN', name: 'hydrogen cyanide', atoms: [{ sym: 'H', x: 120, y: 150 }, { sym: 'C', x: 260, y: 150 }, { sym: 'N', x: 400, y: 150, lp: 1, lpAng: [0] }], bonds: [{ a: 0, b: 1, order: 1 }, { a: 1, b: 2, order: 3 }] },
  { id: 'CO2', name: 'carbon dioxide', atoms: [{ sym: 'O', x: 130, y: 150, lp: 2, lpAng: [145, -145] }, { sym: 'C', x: 300, y: 150 }, { sym: 'O', x: 470, y: 150, lp: 2, lpAng: [35, -35] }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 1, b: 2, order: 2 }] },
  { id: 'C4H6', name: 'buta-1,3-diene (CH2CHCHCH2)', atoms: [{ sym: 'C', x: 135, y: 175 }, { sym: 'C', x: 245, y: 125 }, { sym: 'C', x: 355, y: 175 }, { sym: 'C', x: 465, y: 125 }, { sym: 'H', x: 85, y: 130 }, { sym: 'H', x: 100, y: 235 }, { sym: 'H', x: 235, y: 62 }, { sym: 'H', x: 365, y: 238 }, { sym: 'H', x: 515, y: 70 }, { sym: 'H', x: 520, y: 170 }], bonds: [{ a: 0, b: 1, order: 2 }, { a: 1, b: 2, order: 1 }, { a: 2, b: 3, order: 2 }, { a: 0, b: 4, order: 1 }, { a: 0, b: 5, order: 1 }, { a: 1, b: 6, order: 1 }, { a: 2, b: 7, order: 1 }, { a: 3, b: 8, order: 1 }, { a: 3, b: 9, order: 1 }] },
]

function analyzeMol(m: Mol) {
  const sigma = m.bonds.length
  const pi = m.bonds.reduce((a, b) => a + b.order - 1, 0)
  const total = m.bonds.reduce((a, b) => a + b.order, 0)
  const hyb = m.atoms.map((a, i): H | null => {
    if (a.sym === 'H') return null
    const n = m.bonds.filter((b) => b.a === i || b.b === i).length + (a.lp ?? 0)
    return n === 2 ? 'sp' : n === 3 ? 'sp2' : 'sp3'
  })
  const dom = m.atoms.map((a, i) => (a.sym === 'H' ? 0 : m.bonds.filter((b) => b.a === i || b.b === i).length + (a.lp ?? 0)))
  return { sigma, pi, total, hyb, dom }
}

function Diagram({ m, showSigma, showPi }: { m: Mol; showSigma: boolean; showPi: boolean }) {
  const tilted = m.id === 'C2H4' || m.id === 'H2CO' || m.id === 'C4H6'
  return (
    <svg className="sp-svg" viewBox="0 0 600 300" role="img" aria-label={`${m.name} σ and π bonds`}>
      {showPi && m.bonds.filter((b) => b.order > 1).map((b, k) => {
        const A = m.atoms[b.a], B = m.atoms[b.b]
        const cx = (A.x + B.x) / 2, cy = (A.y + B.y) / 2
        const L = Math.hypot(B.x - A.x, B.y - A.y), ang = (Math.atan2(B.y - A.y, B.x - A.x) * 180) / Math.PI
        const rx = L * 0.46
        return (
          <g key={k} transform={`translate(${cx} ${cy}) rotate(${ang})`}>
            <ellipse cx="0" cy="-30" rx={rx} ry="22" fill="#ef4444" fillOpacity=".35" stroke="#dc2626" />
            <ellipse cx="0" cy="30" rx={rx} ry="22" fill="#ef4444" fillOpacity=".35" stroke="#dc2626" />
            <text x="0" y="-52" textAnchor="middle" fontSize="12" fill="#b91c1c" fontWeight="600">π (p–p, above/below axis)</text>
            {b.order === 3 && <ellipse cx="0" cy="0" rx={rx} ry="11" fill="#f97316" fillOpacity=".3" stroke="#ea580c" strokeDasharray="4 3" />}
            {b.order === 3 && <text x="0" y="62" textAnchor="middle" fontSize="12" fill="#c2410c" fontWeight="600">second π (in front of / behind the page)</text>}
          </g>
        )
      })}
      {showSigma && m.bonds.map((b, k) => {
        const A = m.atoms[b.a], B = m.atoms[b.b]
        const cx = (A.x + B.x) / 2, cy = (A.y + B.y) / 2
        const L = Math.hypot(B.x - A.x, B.y - A.y), ang = (Math.atan2(B.y - A.y, B.x - A.x) * 180) / Math.PI
        return <ellipse key={k} cx={cx} cy={cy} rx={L / 2 - 4} ry={b.order > 1 ? 9 : 7} transform={`rotate(${ang} ${cx} ${cy})`} fill="#2563eb" fillOpacity=".4" stroke="#1d4ed8"><title>σ bond: head-on overlap along the bond axis</title></ellipse>
      })}
      {m.bonds.map((b, k) => {
        const A = m.atoms[b.a], B = m.atoms[b.b]
        return <line key={k} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#334155" strokeWidth="2" opacity={showSigma ? 0.9 : 0.35} />
      })}
      {m.atoms.map((a, i) => (a.lp ? (a.lpAng ?? [0]).map((d, k) => (
        <ellipse key={`${i}${k}`} cx={a.x + Math.cos((d * Math.PI) / 180) * 34} cy={a.y + Math.sin((d * Math.PI) / 180) * 34} rx="16" ry="8" transform={`rotate(${d} ${a.x + Math.cos((d * Math.PI) / 180) * 34} ${a.y + Math.sin((d * Math.PI) / 180) * 34})`} fill="#9333ea" fillOpacity=".45" stroke="#7e22ce"><title>lone pair in a hybrid orbital</title></ellipse>
      )) : null))}
      {m.atoms.map((a, i) => (
        <g key={i}>
          <circle cx={a.x} cy={a.y} r={a.sym === 'H' ? 11 : 16} fill={cpkCss(a.sym)} stroke="#475569" />
          <text x={a.x} y={a.y + 4.5} textAnchor="middle" fontSize={a.sym === 'H' ? 11 : 14} fontWeight="700" fill={a.sym === 'H' || a.sym === 'C' || a.sym === 'N' || a.sym === 'O' ? '#111' : '#111'}>{a.sym}</text>
        </g>
      ))}
      <g fontSize="11" fill="#475569">
        <rect x="10" y="272" width="12" height="10" fill="#2563eb" fillOpacity=".4" stroke="#1d4ed8" /><text x="27" y="281">σ: head-on overlap on the axis</text>
        <rect x="210" y="272" width="12" height="10" fill="#ef4444" fillOpacity=".35" stroke="#dc2626" /><text x="227" y="281">π: sideways p–p overlap</text>
        <rect x="380" y="272" width="12" height="10" fill="#9333ea" fillOpacity=".45" stroke="#7e22ce" /><text x="397" y="281">lone pair</text>
        {tilted && <text x="450" y="281">(skeleton drawn in perspective)</text>}
      </g>
    </svg>
  )
}

const ROT = [
  { id: 'a', label: 'The π overlap lies above and below the bond axis; twisting one end breaks the sideways overlap' },
  { id: 'b', label: 'π bonds are always stronger than σ bonds, so nothing can turn' },
  { id: 'c', label: 'The σ bond is not cylindrically symmetric, so it locks the atoms' },
] as const

export default function SigmaPi({ mode: fm, compact }: WidgetProps) {
  const [mode, setMode] = useMode(fm, 'chem.mode')
  const [id, setId] = useState('C2H4')
  const [epoch, setEpoch] = useState(0)
  const m = MOLS.find((x) => x.id === id)!
  return (
    <Workbench title="σ and π bonds" subtitle="Head-on vs sideways overlap" mode={mode} onMode={setMode} onReset={() => setEpoch((e) => e + 1)} compact={compact}
      tools={<select value={id} onChange={(e) => { setId(e.target.value); setEpoch((x) => x + 1) }} aria-label="Molecule">{MOLS.map((x) => <option key={x.id} value={x.id}>{x.id.replace(/(\d)/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)])} — {x.name}</option>)}</select>}>
      <Inner key={`${id}-${epoch}-${mode}`} m={m} mode={mode} compact={compact} />
    </Workbench>
  )
}

function Inner({ m, mode, compact }: { m: Mol; mode: 'learn' | 'test'; compact?: boolean }) {
  const an = useMemo(() => analyzeMol(m), [m])
  const [showSigma, setSS] = useState(true)
  const [showPi, setSP] = useState(true)
  const [s, setS] = useState(''), [p, setP] = useState('')
  const [hy, setHy] = useState<Record<number, H | ''>>({})
  const [rot, setRot] = useState('')
  const heavy = m.atoms.map((a, i) => i).filter((i) => m.atoms[i].sym !== 'H')

  const evalStep = (i: number): StepResult => {
    const notes: Note[] = []
    if (i === 0) {
      const v = Number(s)
      if (!s.trim() || !Number.isFinite(v)) return { ok: false, notes: [{ level: 'err', msg: 'Enter the number of σ bonds.' }] }
      if (v === an.sigma) return { ok: true, notes: [{ level: 'ok', msg: `${an.sigma} σ bonds: every bond between two atoms contains exactly one σ bond (the first bond, slide 79).` }] }
      if (v === an.total) notes.push({ level: 'err', msg: `${an.total} is the total count of bond lines. A double bond is 1 σ + 1 π and a triple bond 1 σ + 2 π, so count one σ per connected pair of atoms.` })
      else notes.push({ level: 'err', msg: 'Count one σ bond for every pair of bonded atoms (single, double or triple alike).' })
      return { ok: false, notes }
    }
    if (i === 1) {
      const v = Number(p)
      if (!p.trim() || !Number.isFinite(v)) return { ok: false, notes: [{ level: 'err', msg: 'Enter the number of π bonds.' }] }
      if (v === an.pi) return { ok: true, notes: [{ level: 'ok', msg: `${an.pi} π bond${an.pi > 1 ? 's' : ''}: the 2nd and 3rd bonds of multiple bonds (slide 79).` }] }
      if (v === an.pi + 1 && an.pi > 0) notes.push({ level: 'err', msg: 'Do not count the σ part of a double/triple bond: only the 2nd bond of a double bond and the 2nd + 3rd of a triple bond are π.' })
      else notes.push({ level: 'err', msg: 'π bonds = (number of double bonds × 1) + (number of triple bonds × 2).' })
      return { ok: false, notes }
    }
    if (i === 2) {
      let ok = true
      heavy.forEach((k) => {
        const got = hy[k]
        const want = an.hyb[k]!
        const a = m.atoms[k]
        const label = `${a.sym}${heavy.filter((q) => m.atoms[q].sym === a.sym).length > 1 ? ' #' + (heavy.filter((q) => m.atoms[q].sym === a.sym).indexOf(k) + 1) : ''}`
        if (!got) { ok = false; notes.push({ level: 'err', msg: `Choose the hybridization of ${label}.` }) }
        else if (got !== want) { ok = false; notes.push({ level: 'err', msg: `${label}: ${an.dom[k]} domains (σ-bonded atoms + lone pairs; π bonds do not count) → ${HL[want]}, not ${HL[got]}.` }) }
      })
      if (ok) notes.push({ level: 'ok', msg: 'Hybridization = σ-bonded neighbours + lone pairs: 2 → sp, 3 → sp², 4 → sp³. The unhybridized p orbitals make the π bonds.' })
      return { ok, notes }
    }
    if (!rot) return { ok: false, notes: [{ level: 'err', msg: 'Pick an explanation.' }] }
    if (rot === 'a') return { ok: true, notes: [{ level: 'ok', msg: 'Right: a σ bond is cylindrically symmetric (rotation keeps the overlap), but the π lobes must stay parallel; the π bond must first be broken before rotation (slide 85).' }] }
    return { ok: false, notes: [{ level: rot === 'c' ? 'err' : 'err', msg: rot === 'c' ? 'σ bonds ARE cylindrically symmetric, which is why single bonds rotate freely (slide 67).' : 'π bonds are usually weaker than σ. The point is geometric: the sideways p–p overlap is lost if one end twists.' }] }
  }
  const st = useStepper(mode, 4, evalStep)
  const stateOf = (i: number) => (st.status(i) === 'done' ? 'ok' : st.status(i) === 'error' ? 'err' : null)
  const btn = (i: number) => mode === 'learn' && !st.res[i]?.ok && <div className="row" style={{ marginTop: 8 }}><button className="btn primary sm" onClick={() => st.check(i)}>Check</button></div>
  return (
    <div className={compact ? '' : 'grid2'}>
      <div>
        <Diagram m={m} showSigma={showSigma} showPi={showPi} />
        <div className="row l10-toggles">
          <label><input type="checkbox" checked={showSigma} onChange={(e) => setSS(e.target.checked)} /> σ framework</label>
          <label><input type="checkbox" checked={showPi} onChange={(e) => setSP(e.target.checked)} /> π clouds</label>
        </div>
      </div>
      <div>
        <Step n={1} title="How many σ bonds?" status={st.status(0)} notes={st.notes(0)}>
          <NumInput value={s} onChange={setS} placeholder="e.g. 5" width={90} state={stateOf(0)} disabled={st.frozen(0)} />{btn(0)}
        </Step>
        <Step n={2} title="How many π bonds?" status={st.status(1)} notes={st.notes(1)}>
          <NumInput value={p} onChange={setP} placeholder="e.g. 1" width={90} state={stateOf(1)} disabled={st.frozen(1)} />{btn(1)}
        </Step>
        <Step n={3} title="Hybridization of each non-hydrogen atom" status={st.status(2)} notes={st.notes(2)}>
          {heavy.map((k) => (
            <div key={k} className="row" style={{ marginBottom: 6 }}>
              <b style={{ width: 54 }}>{m.atoms[k].sym}{heavy.filter((q) => m.atoms[q].sym === m.atoms[k].sym).length > 1 ? ` #${heavy.filter((q) => m.atoms[q].sym === m.atoms[k].sym).indexOf(k) + 1}` : ''}</b>
              <Choice options={(['sp', 'sp2', 'sp3'] as H[]).map((h) => ({ id: h, label: HL[h] }))} value={hy[k] ?? ''} onChange={(v) => setHy((q) => ({ ...q, [k]: v }))} disabled={st.frozen(2)} state={stateOf(2)} />
            </div>
          ))}
          {btn(2)}
        </Step>
        <Step n={4} title="Why can't atoms rotate about a double bond?" status={st.status(3)} notes={st.notes(3)}>
          <div className="l10-choice col">
            {ROT.map((r) => <button key={r.id} type="button" disabled={st.frozen(3)} className={'l10-opt' + (rot === r.id ? ' on' : '')} onClick={() => setRot(r.id)}>{r.label}</button>)}
          </div>
          {btn(3)}
        </Step>
        {mode === 'test' && !st.submitted && <button className="btn primary" onClick={() => st.checkAll()}>Check all</button>}
        {st.finished && <Verdict correct={st.mistakes === 0 ? true : 'partial'} title={`${m.id}: ${an.sigma} σ and ${an.pi} π`}><span>σ framework + unhybridized p orbitals for π. <SlideRef l="L10" s={84} /></span></Verdict>}
      </div>
    </div>
  )
}
