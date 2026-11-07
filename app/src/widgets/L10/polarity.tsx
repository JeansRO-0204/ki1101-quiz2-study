import { lazy, Suspense, useMemo, useState } from 'react'
import type { WidgetProps } from '../../types'
import { Workbench, useMode, Step, Verdict, Formula, SlideRef, type Note } from '../../lib/kit'
import { analyze, dipoles, enOf, findSpecies, layoutOf, SPECIES } from './species'
import { Choice, SpeciesPicker, useStepper, type StepResult, unicodeFormula } from './shared'
import { IconLockFill } from '../../lib/icons'

const Mol3D = lazy(() => import('./Mol3D'))
type Reason = 'cancel' | 'lp' | 'diff' | 'nopolar'
const REASONS: { id: Reason; label: string }[] = [
  { id: 'nopolar', label: 'no polar bonds (ΔEN ≈ 0)' },
  { id: 'cancel', label: 'polar bonds, but the dipoles cancel (symmetry)' },
  { id: 'diff', label: 'polar bonds that do not cancel: different atoms attached' },
  { id: 'lp', label: 'polar bonds that do not cancel: lone pair(s) make the shape asymmetric' },
]

function Inner({ id, mode, compact }: { id: string; mode: 'learn' | 'test'; compact?: boolean }) {
  const sp = findSpecies(id)!
  const info = useMemo(() => analyze(sp), [sp])
  const dip = useMemo(() => dipoles(sp), [sp])
  const layout = useMemo(() => layoutOf(sp), [sp])
  const ligTypes = useMemo(() => [...new Set(sp.lig.map((l) => l.sym))], [sp])
  const [dir, setDir] = useState<Record<string, 'c' | 'l' | ''>>({})
  const [pred, setPred] = useState<'polar' | 'nonpolar' | ''>('')
  const [why, setWhy] = useState<Reason | ''>('')
  const maxdEN = Math.max(...dip.bonds.map((b) => b.dEN))
  const allSame = new Set(sp.lig.map((l) => l.sym + l.order)).size === 1
  const truth: Reason = !dip.polar ? (maxdEN < 0.05 ? 'nopolar' : 'cancel') : info.lp > 0 ? 'lp' : 'diff'
  const name = unicodeFormula(sp.id)

  const evalStep = (i: number): StepResult => {
    const notes: Note[] = []
    if (i === 0) {
      let ok = true
      for (const t of ligTypes) {
        const dEN = enOf(t) - enOf(sp.centre)
        const want = Math.abs(dEN) < 0.05 ? 'none' : dEN > 0 ? 'l' : 'c'
        const got = dir[t]
        if (want === 'none') {
          if (got) { ok = false; notes.push({ level: 'err', msg: `${sp.centre} and ${t} have the same EN (${enOf(t)}): the bond is nonpolar, so neither end is δ−. Leave it unselected.` }) }
          else notes.push({ level: 'ok', msg: `${sp.centre}–${t}: ΔEN = 0, no bond dipole.` })
          continue
        }
        if (!got) { ok = false; notes.push({ level: 'err', msg: `Choose the negative end of the ${sp.centre}–${t} bond.` }); continue }
        if (got === want) notes.push({ level: 'ok', msg: `${sp.centre}–${t}: ${t} (EN ${enOf(t)}) vs ${sp.centre} (${enOf(sp.centre)}) → ΔEN = ${Math.abs(dEN).toFixed(1)}; δ− on ${want === 'l' ? t : sp.centre}.` })
        else { ok = false; notes.push({ level: 'err', msg: `The more electronegative atom is δ− (arrowhead end). ${want === 'l' ? t : sp.centre} has the higher EN (${enOf(want === 'l' ? t : sp.centre)}), not ${want === 'l' ? sp.centre : t}.` }) }
      }
      return { ok, notes }
    }
    if (i === 1) {
      if (!pred) return { ok: false, notes: [{ level: 'err', msg: 'Predict: polar or nonpolar?' }] }
      const right = (pred === 'polar') === dip.polar
      if (!right) {
        notes.push({ level: 'err', msg: dip.polar
          ? `${name} is **polar**: ${info.lp > 0 ? `its ${info.lp} lone pair(s) make the ${info.shape.mg} shape asymmetric, so the bond dipoles do not cancel (slide 36)` : 'the attached atoms are not all identical, so the bond dipoles do not cancel (slide 36)'}.`
          : `${name} is **nonpolar**: ${maxdEN < 0.05 ? 'there are no polar bonds' : `the ${info.shape.mg} shape is symmetric and the bond dipoles cancel (slide 33)`}.` })
        return { ok: false, notes }
      }
      notes.push({ level: 'ok', msg: `${name} is ${dip.polar ? 'polar' : 'nonpolar'}.` })
      if (!why) { return { ok: false, notes: [{ level: 'err', msg: 'Now pick the reason.' }] } }
      const okWhy = why === truth || (dip.polar && info.lp > 0 && !allSame && why === 'diff')
      if (!okWhy) {
        notes.push({ level: 'err', msg: truth === 'cancel' ? 'Reason: the bonds are polar but the shape is symmetric (all domains/atoms identical, or lone pairs placed symmetrically) so the vectors cancel.' : truth === 'nopolar' ? 'Reason: both atoms have (almost) the same EN, so there is no bond dipole at all.' : truth === 'lp' ? 'Reason: the lone pair(s) on the central atom distort the shape so the dipoles cannot cancel.' : 'Reason: all e⁻ pairs on the centre are bonding pairs, but the attached atoms differ, so the dipoles cannot cancel.' })
        return { ok: false, notes }
      }
      return { ok: true, notes }
    }
    return { ok: true, notes: [] }
  }
  const st = useStepper(mode, 2, evalStep)
  const stateOf = (i: number) => (st.status(i) === 'done' ? 'ok' : st.status(i) === 'error' ? 'err' : null)
  const btn = (i: number) => mode === 'learn' && !st.res[i]?.ok && <div className="row" style={{ marginTop: 8 }}><button className="btn primary sm" onClick={() => st.check(i)}>Check</button></div>
  const reveal = st.finished

  const explain = (() => {
    if (!dip.polar) {
      if (maxdEN < 0.05) return 'No bond dipoles (identical atoms / ΔEN ≈ 0).'
      if (info.lp > 0) return `Nonpolar exception (slide 38): the ${info.lp} lone pairs are placed symmetrically around the centre, so the ${info.nb} bond dipoles cancel.`
      return `Every domain on ${sp.centre} is a bonding pair and the terminal atoms are identical, so the bond dipoles of this ${info.shape.mg} shape cancel (slides 33–35).`
    }
    if (info.lp > 0) return `The ${info.lp} lone pair${info.lp > 1 ? 's' : ''} on ${sp.centre} make the ${info.shape.mg} shape asymmetric: the bond dipoles add to a net dipole (slide 37).`
    return `The attached atoms are not all the same, so the bond dipoles differ in size and do not cancel (slide 36).`
  })()

  return (
    <div className={compact ? '' : 'grid2'}>
      <div>
        <div className="l10-species"><span className="l10-big"><Formula f={sp.id} /></span> <span className="muted">{sp.name} · {info.shape.mg}</span>
          {sp.note && <div className="muted" style={{ fontSize: 12.5 }}>{sp.note}</div>}</div>
        <Step n={1} title="Bond dipoles: which end is δ−?" status={st.status(0)} notes={st.notes(0)}>
          {ligTypes.map((t) => (
            <div key={t} className="row" style={{ marginBottom: 6 }}>
              <span className="muted" style={{ fontSize: 13 }}>{sp.centre}–{t} (EN {enOf(sp.centre)} vs {enOf(t)})</span>
              <Choice options={[{ id: 'c', label: `δ− on ${sp.centre}` }, { id: 'l', label: `δ− on ${t}` }]} value={(dir[t] ?? '') as never} onChange={(v) => setDir((p) => ({ ...p, [t]: v as 'c' | 'l' }))} disabled={st.frozen(0)} state={stateOf(0)} />
            </div>
          ))}
          {btn(0)}
        </Step>
        <Step n={2} title="Predict the molecule" status={st.status(1)} notes={st.notes(1)}>
          <Choice options={[{ id: 'polar', label: 'polar' }, { id: 'nonpolar', label: 'nonpolar' }]} value={pred as never} onChange={(v) => setPred(v as 'polar' | 'nonpolar')} disabled={st.frozen(1)} state={stateOf(1)} />
          <div style={{ height: 8 }} />
          <Choice options={REASONS} value={why as never} onChange={(v) => setWhy(v as Reason)} disabled={st.frozen(1)} state={stateOf(1)} />
          {btn(1)}
        </Step>
        {mode === 'test' && !st.submitted && <button className="btn primary" onClick={() => st.checkAll()}>Check</button>}
        {reveal && <Verdict correct={st.mistakes === 0 ? true : 'partial'} title={`${name} is ${dip.polar ? 'POLAR' : 'NONPOLAR'}`}><span>{explain} <SlideRef l="L10" s={dip.polar ? 36 : 33} /></span></Verdict>}
      </div>
      <div>
        {reveal ? (
          <>
            <Suspense fallback={<div className="l10-3d" style={{ height: 300 }} />}>
              <Mol3D layout={layout} centre={sp.centre} dipole={dip} showLone height={compact ? 240 : 340} resetKey={sp.id} />
            </Suspense>
            <p className="muted" style={{ fontSize: 12.5 }}>Orange arrows: bond dipoles (arrowhead at δ−, length grows with ΔEN). Red arrow: their vector sum, the net dipole.</p>
          </>
        ) : (
          <div className="l10-lock"><IconLockFill size={30} style={{ color: '#8e8e93' }} /><b>Dipole picture hidden</b><span className="muted">Predict first; the 3D dipole vectors appear after you check.</span></div>
        )}
      </div>
    </div>
  )
}

export default function Polarity({ mode: fm, compact }: WidgetProps) {
  const [mode, setMode] = useMode(fm, 'chem.mode')
  const [id, setId] = useState('CO2')
  const [epoch, setEpoch] = useState(0)
  return (
    <Workbench title="Molecular polarity" subtitle="Vector-sum the bond dipoles" mode={mode} onMode={setMode} onReset={() => setEpoch((e) => e + 1)} compact={compact}>
      <div style={{ marginBottom: 12 }}>
        <SpeciesPicker value={id} onChange={(v) => { setId(v); setEpoch((e) => e + 1) }} filter={(x) => SPECIES.find((s) => s.id === x)?.polarityOk !== false} />
      </div>
      <Inner key={`${id}-${epoch}-${mode}`} id={id} mode={mode} compact={compact} />
    </Workbench>
  )
}
