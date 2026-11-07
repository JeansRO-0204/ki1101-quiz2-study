import { useState } from 'react'
import { Feedback, Tex, type Note } from '../../lib/kit'
import './l8.css'

interface Ion { q: number; r: number }
const CAT: Record<string, Ion> = { Li: { q: 1, r: 76 }, Na: { q: 1, r: 102 }, K: { q: 1, r: 138 }, Mg: { q: 2, r: 72 }, Ca: { q: 2, r: 100 } }
const AN: Record<string, Ion> = { F: { q: 1, r: 133 }, Cl: { q: 1, r: 181 }, O: { q: 2, r: 140 }, N: { q: 3, r: 146 } }
interface Cmp { id: string; name: string; c: string; a: string; nc: number; na: number }
// q+ q- per ion pair uses the ion charges (as on L8 s10/s11)
const LIST: Cmp[] = [
  { id: 'NaCl', name: 'NaCl', c: 'Na', a: 'Cl', nc: 1, na: 1 },
  { id: 'KCl', name: 'KCl', c: 'K', a: 'Cl', nc: 1, na: 1 },
  { id: 'LiF', name: 'LiF', c: 'Li', a: 'F', nc: 1, na: 1 },
  { id: 'MgO', name: 'MgO', c: 'Mg', a: 'O', nc: 1, na: 1 },
  { id: 'CaO', name: 'CaO', c: 'Ca', a: 'O', nc: 1, na: 1 },
  { id: 'CaCl2', name: 'CaCl₂', c: 'Ca', a: 'Cl', nc: 1, na: 2 },
  { id: 'Na2O', name: 'Na₂O', c: 'Na', a: 'O', nc: 2, na: 1 },
  { id: 'Ca3N2', name: 'Ca₃N₂', c: 'Ca', a: 'N', nc: 3, na: 2 },
]
const SETS: { label: string; ids: string[]; same: boolean }[] = [
  { label: 'Slide s11 (same separation)', ids: ['NaCl', 'CaCl2', 'Ca3N2', 'Na2O', 'CaO'], same: true },
  { label: 'NaCl · MgO · KCl · LiF (radii)', ids: ['NaCl', 'MgO', 'KCl', 'LiF'], same: false },
  { label: 'LiF · NaCl · KCl (radii)', ids: ['LiF', 'NaCl', 'KCl'], same: false },
  { label: 'MgO · CaO · NaCl (radii)', ids: ['MgO', 'CaO', 'NaCl'], same: false },
]
const qq = (c: Cmp) => CAT[c.c].q * AN[c.a].q
const dist = (c: Cmp, same: boolean) => (same ? 1 : CAT[c.c].r + AN[c.a].r)
const score = (c: Cmp, same: boolean) => qq(c) / dist(c, same)

/** Coulomb-law ranking: lattice energy ∝ (q+ × q−)/(r+ + r−). Radii are general knowledge (not on the slides). */
export function LatticeCompare({ compact }: { compact?: boolean }) {
  const [si, setSi] = useState(0)
  const set = SETS[si]
  const items = set.ids.map((id) => LIST.find((x) => x.id === id)!)
  const [pick, setPick] = useState<string[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [done, setDone] = useState(false)
  const reset = (n = si) => { setSi(n); setPick([]); setNotes([]); setDone(false) }
  const max = Math.max(...items.map((c) => score(c, set.same)))

  const check = () => {
    if (pick.length < items.length) { setNotes([{ level: 'err', msg: `Click all ${items.length} compounds, most exothermic first.` }]); return }
    const byId = (id: string) => items.find((c) => c.id === id)!
    for (let k = 1; k < pick.length; k++) {
      const a = byId(pick[k - 1]), b = byId(pick[k])
      if (score(b, set.same) > score(a, set.same) + 1e-9) {
        setNotes([{ level: 'err', msg: `**${b.name}** should rank above **${a.name}**: ` + (qq(b) !== qq(a)
          ? `charge product ${qq(b)} vs ${qq(a)}${set.same ? ' (same separation, so charge decides)' : ''}.`
          : `same charges, but ${b.name} has the smaller ion separation (${dist(b, false)} vs ${dist(a, false)} pm).`) + (qq(b) !== qq(a) && !set.same ? ` Charge product ${qq(b)} vs ${qq(a)} usually outweighs a modest size difference.` : '') }])
        return
      }
    }
    setDone(true)
    setNotes([{ level: 'ok', msg: 'Correct. ΔH_lattice ∝ q⁺q⁻ / (r⁺ + r⁻): larger charges and smaller ions → more exothermic (L8 s10).' }])
  }

  return (
    <div className="ie-compare">
      <div className="ie-cmp-head">
        <b>Compare lattice energies (Coulomb's law)</b>
        <select className="ie-select" value={si} onChange={(e) => reset(+e.target.value)}>{SETS.map((s, i) => <option key={i} value={i}>{s.label}</option>)}</select>
      </div>
      <p className="ie-small"><Tex>{set.same ? '\\Delta H_{latt}\\propto q^+q^-\;(\\text{same separation})' : '\\Delta H_{latt}\\propto \\dfrac{q^+q^-}{r^++r^-}'}</Tex>. Click the compounds from <b>most exothermic</b> (largest |ΔH|) to least.</p>
      <div className="ie-chips">
        {items.map((c) => {
          const idx = pick.indexOf(c.id)
          return (
            <button key={c.id} className={'ie-chipbtn' + (idx >= 0 ? ' on' : '')} disabled={done} onClick={() => { setNotes([]); setPick(idx >= 0 ? pick.filter((x) => x !== c.id) : [...pick, c.id]) }}>
              {idx >= 0 && <span className="ie-rank">{idx + 1}</span>}{c.name}
              <small>{CAT[c.c].q}+ / {AN[c.a].q}−{set.same ? '' : ` · ${dist(c, false)} pm`}</small>
            </button>
          )
        })}
      </div>
      {done && (
        <div className="ie-bars">
          {items.slice().sort((a, b) => score(b, set.same) - score(a, set.same)).map((c) => (
            <div key={c.id} className="ie-bar"><span>{c.name}</span><i style={{ width: `${(score(c, set.same) / max) * 100}%` }} /><em>{score(c, set.same).toFixed(set.same ? 0 : 3)}</em></div>
          ))}
        </div>
      )}
      <div className="row"><button className="btn primary sm" onClick={check} disabled={done}>Check ranking</button><button className="btn ghost sm" onClick={() => reset()}>Clear</button></div>
      <Feedback notes={notes} />
      {!compact && <p className="ie-small muted">Ionic radii (pm) are typical textbook values, beyond the slides. Slide s11 asks the equal-separation version: Ca₃N₂ (3−/2+) has the greatest lattice energy.</p>}
    </div>
  )
}
