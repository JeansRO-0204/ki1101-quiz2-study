// Resonance viewer widget: pick a species, watch the forms interconvert, read the hybrid, take the contribution quiz.
import { useMemo, useState } from 'react'
import type { WidgetProps } from '../../types'
import { Feedback, Formula, Md, Verdict, Workbench, recordAttempt, type Note } from '../../lib/kit'
import StructureSvg, { specLayout, subDigits, type Pt } from './draw'
import ResonanceView, { formCriteria } from './ResonanceView'
import { atomLabels } from './engine'
import { SPECIES, getSpecies, mkStruct, type ResForm, type Species } from './species'
import { fmtFc } from './engine'

interface Entry { id: string; label: string; atoms: string[]; pos: Pt[]; forms: ResForm[]; charge: number; note?: string }

function benzene(): Entry {
  const atoms = ['C', 'C', 'C', 'C', 'C', 'C', 'H', 'H', 'H', 'H', 'H', 'H']
  const pos: Pt[] = []
  for (let i = 0; i < 6; i++) { const a = ((-90 + 60 * i) * Math.PI) / 180; pos.push([280 + 76 * Math.cos(a), 160 + 76 * Math.sin(a)]) }
  for (let i = 0; i < 6; i++) { const a = ((-90 + 60 * i) * Math.PI) / 180; pos.push([280 + 128 * Math.cos(a), 160 + 128 * Math.sin(a)]) }
  const ch = '0-6 1-7 2-8 3-9 4-10 5-11'
  const lp = '0 0 0 0 0 0 0 0 0 0 0 0'
  const A = mkStruct(12, `0-1:2 1-2 2-3:2 3-4 4-5:2 0-5 ${ch}`, lp)
  const B = mkStruct(12, `0-1 1-2:2 2-3 3-4:2 4-5 0-5:2 ${ch}`, lp)
  return {
    id: 'C6H6', label: 'C₆H₆ benzene', atoms, pos, charge: 0,
    forms: [{ s: A, rank: 'best' }, { s: B, rank: 'best' }],
    note: 'Two Kekulé structures; every C–C bond has order 1.5 (all six bonds are equal in length). Resonance energy ≈ 146 kJ/mol (slide 66).',
  }
}
const BENZENE = benzene()

function entryOf(sp: Species): Entry {
  const root = sp.central[0]
  return {
    id: sp.formula, label: sp.formula, atoms: sp.atoms, charge: sp.charge, forms: sp.forms,
    pos: specLayout(sp.atoms.length, sp.skeleton, root),
    note: sp.resNote ?? sp.notes,
  }
}

const FEATURED = ['NO3^-', 'CO3^2-', 'NCO^-', 'O3', 'SO2', 'HCOO^-']

export default function Resonance({ compact }: WidgetProps) {
  const entries = useMemo(() => {
    const all = SPECIES.filter((s) => s.resonance).map(entryOf)
    const feat = FEATURED.map((f) => all.find((e) => e.id === f)!).filter(Boolean)
    const rest = all.filter((e) => !FEATURED.includes(e.id))
    return [...feat, BENZENE, ...rest]
  }, [])
  const [id, setId] = useState('NO3^-')
  const e = entries.find((x) => x.id === id) ?? entries[0]
  const sp = getSpecies(e.id)
  return (
    <Workbench title="Resonance viewer" subtitle="Forms, electron pushing, hybrid bond orders" compact={compact}>
      <div className="res-pick">
        {entries.map((x) => (
          <button key={x.id} className={'chip' + (x.id === id ? ' on' : '')} onClick={() => setId(x.id)}>
            {x.id === 'C6H6' ? 'C₆H₆' : <Formula f={x.id} />}
          </button>
        ))}
      </div>
      <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>
        {sp ? <><Formula f={sp.formula} /> <span className="muted" style={{ fontWeight: 400 }}>· {sp.name}</span></> : <>C₆H₆ <span className="muted" style={{ fontWeight: 400 }}>· benzene</span></>}
      </h4>
      <ResonanceView key={e.id} atoms={e.atoms} pos={e.pos} forms={e.forms} charge={e.charge} compact={compact} note={e.note} />
      {e.forms.some((f) => f.rank !== e.forms[0].rank) && <Quiz key={e.id} entry={e} />}
    </Workbench>
  )
}

function Quiz({ entry }: { entry: Entry }) {
  const [pick, setPick] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const { atoms, forms } = entry
  const lab = atomLabels(atoms)
  const subs = subDigits(atoms)
  const best = forms.findIndex((f) => f.rank === 'best')
  const info = forms.map((f) => formCriteria(atoms, f))
  const notes: Note[] = []
  if (done) {
    forms.forEach((f, i) => {
      const c = info[i]
      const fcs = atoms.map((_, j) => `${lab[j]} ${fmtFc(c.fc[j])}`).filter((_, j) => c.fc[j] !== 0).join(', ') || 'all 0'
      const why = f.rank === 'best'
        ? 'formal charges closest to 0, and the negative charge sits on the most electronegative atom'
        : f.rank === 'ok' ? 'acceptable, but the negative charge is on a less electronegative atom than in the best form'
          : `|FC| up to ${c.maxAbs}${c.maxAbs > 1 ? ' (rule 3a: all FC ≤ 1 is violated)' : ''} and ${c.negOnEn ? 'charge separation' : 'negative charge on the less electronegative atom'}`
      notes.push({ level: f.rank === 'best' ? 'ok' : f.rank === 'ok' ? 'warn' : 'err', msg: `**Form ${i + 1}** (${fcs}; Σ|FC| = ${c.sumAbs}): ${why}.` })
    })
  }
  const check = () => {
    if (pick == null) return
    setDone(true)
    recordAttempt({ id: 'res-quiz:' + entry.id, lecture: 'L9', topic: 'Resonance contributors', correct: pick === best })
  }
  return (
    <div className="res-quiz">
      <h4>Which resonance form contributes most?</h4>
      <Md>{`Use the slide rules: all octets satisfied, as many bonds as possible, **FC as close to 0 as possible (|FC| ≤ 1)**, any negative charge on the **more electronegative** atom, little charge separation.`}</Md>
      <div className="res-forms">
        {forms.map((f, i) => (
          <button key={i}
            className={'res-form' + (pick === i && !done ? ' on' : '') + (done && i === best ? ' q-right' : '') + (done && pick === i && i !== best ? ' q-wrong' : '')}
            onClick={() => !done && setPick(i)}>
            <StructureSvg atoms={atoms} pos={entry.pos} bonds={f.s.bonds.map(([a, b, o]) => ({ a, b, order: o }))} lp={f.s.lp} fc={done ? info[i].fc : null} subs={subs} />
            <small>Form {i + 1}</small>
          </button>
        ))}
      </div>
      <div className="lewis-actions">
        <button className="btn primary" disabled={pick == null || done} onClick={check}>Check</button>
        {done && <button className="btn" onClick={() => { setDone(false); setPick(null) }}>Try again</button>}
      </div>
      {done && (
        <>
          <Verdict correct={pick === best} title={pick === best ? `Yes: form ${best + 1} is the major contributor` : `Not quite: form ${best + 1} contributes most`} />
          <Feedback notes={notes} />
        </>
      )}
    </div>
  )
}
