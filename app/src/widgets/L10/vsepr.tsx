import { lazy, Suspense, useMemo, useState } from 'react'
import type { WidgetProps } from '../../types'
import { Workbench, useMode, Step, Feedback, Verdict, NumInput, Formula, SlideRef, type Note } from '../../lib/kit'
import { EG_LIST, MG_LIST, MG_ATOMS, SHAPES, ANGLE_TEXT, buildLayout, shapeOf, validCombo, EG_BY_DOMAINS, type AngleId } from './geom'
import { SPECIES, findSpecies, analyze, layoutOf, lpExplain, ligandSummary, HYB_LABEL, type Lig } from './species'
import { Axe, Choice, SpeciesPicker, useReportOnce, useStepper, type StepResult, unicodeFormula } from './shared'
import { IconLockFill } from '../../lib/icons'

const Mol3D = lazy(() => import('./Mol3D'))
const Viewer = (p: React.ComponentProps<typeof Mol3D>) => (
  <Suspense fallback={<div className="l10-3d" style={{ height: p.height ?? 320 }}><span className="l10-3d-hint">loading 3D…</span></div>}><Mol3D {...p} /></Suspense>
)

const maxLp = (nb: number) => Math.max(...SHAPES.filter((s) => s.nb === nb).map((s) => s.lp))

function Toggles({ s, set }: { s: { dom: boolean; lone: boolean; ang: boolean }; set: (v: { dom: boolean; lone: boolean; ang: boolean }) => void }) {
  return (
    <div className="row l10-toggles">
      <label><input type="checkbox" checked={s.lone} onChange={(e) => set({ ...s, lone: e.target.checked })} /> lone pairs</label>
      <label><input type="checkbox" checked={s.dom} onChange={(e) => set({ ...s, dom: e.target.checked })} /> domain polyhedron</label>
      <label><input type="checkbox" checked={s.ang} onChange={(e) => set({ ...s, ang: e.target.checked })} /> bond angles</label>
    </div>
  )
}

/* ---------------- Explore ---------------- */
function Explore({ compact }: { compact?: boolean }) {
  const [nb, setNb] = useState(4)
  const [lp, setLp] = useState(0)
  const [tg, setTg] = useState({ dom: true, lone: true, ang: true })
  const setN = (v: number) => {
    const n = Math.min(6, Math.max(2, v))
    setNb(n)
    if (!validCombo(n, lp)) setLp(Math.min(lp, maxLp(n)))
  }
  const setL = (v: number) => setLp(Math.min(maxLp(nb), Math.max(0, v)))
  const sh = shapeOf(nb, lp)
  const layout = useMemo(() => buildLayout<Lig>(Array(nb).fill({ sym: 'X', order: 1 }), lp), [nb, lp])
  const dom = nb + lp
  return (
    <div className={compact ? '' : 'grid2'}>
      <div>
        <div className="l10-steppers">
          <div><span>Bonding domains</span><div className="l10-stepper"><button className="btn sm" onClick={() => setN(nb - 1)} disabled={nb <= 2}>−</button><b>{nb}</b><button className="btn sm" onClick={() => setN(nb + 1)} disabled={nb >= 6}>+</button></div></div>
          <div><span>Lone pairs on A</span><div className="l10-stepper"><button className="btn sm" onClick={() => setL(lp - 1)} disabled={lp <= 0}>−</button><b>{lp}</b><button className="btn sm" onClick={() => setL(lp + 1)} disabled={lp >= maxLp(nb)}>+</button></div></div>
        </div>
        <Viewer layout={layout} centre="A" showDomains={tg.dom} showLone={tg.lone} showAngles={tg.ang} height={compact ? 240 : 330} resetKey={`${nb}-${lp}`} />
        <Toggles s={tg} set={setTg} />
      </div>
      <div>
        <div className="l10-card">
          <div className="l10-card-title"><Axe nb={nb} lp={lp} /> <span className="muted">· {dom} electron domains</span></div>
          <dl className="l10-dl">
            <dt>Electron-domain geometry</dt><dd>{sh.eg}</dd>
            <dt>Molecular geometry</dt><dd><b>{sh.mg}</b></dd>
            <dt>Bond angle</dt><dd>{sh.angleNote}</dd>
            <dt>Example</dt><dd>{sh.example ? <Formula f={sh.example} /> : '—'}</dd>
          </dl>
          {dom === 5 && lp > 0 && <p className="l10-why">Lone pairs go <b>equatorial</b> in a trigonal bipyramid: an equatorial site has only two 90° neighbours, an axial site has three, and a lone pair needs more room <SlideRef l="L10" s={21} />.</p>}
          {dom === 6 && lp === 2 && <p className="l10-why">In an octahedron the second lone pair goes <b>trans</b> (180°) to the first, which minimises repulsion → square planar <SlideRef l="L10" s={16} />.</p>}
          {dom === 6 && lp === 1 && <p className="l10-why">One lone pair takes an axial position; the five atoms form a square pyramid.</p>}
          {dom <= 4 && lp > 0 && <p className="l10-why">A lone pair is a bigger, balloon-shaped domain <SlideRef l="L10" s={14} />, so it squeezes the bond angles below the ideal value.</p>}
        </div>
        <table className="l10-table">
          <thead><tr><th>Dom.</th><th>Electron geom.</th><th>AXE</th><th>Molecular geom.</th><th>Angle</th><th>Ex.</th></tr></thead>
          <tbody>
            {SHAPES.map((s) => (
              <tr key={`${s.nb}${s.lp}`} className={s.nb === nb && s.lp === lp ? 'on' : ''} onClick={() => { setNb(s.nb); setLp(s.lp) }}>
                <td>{s.nb + s.lp}</td><td>{s.eg}</td><td><Axe nb={s.nb} lp={s.lp} /></td><td>{s.mg}</td><td>{s.angleNote.split(' (')[0]}</td><td><Formula f={s.example} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------------- Workbench ---------------- */
function angleOptions(nb: number): { id: AngleId; label: string }[] {
  const ids: AngleId[] = ['a180', 'a120', 'a120lt', 'a1095', 'a1095lt', 'a90', 'a90lt', 'a90_120', 'a90_120lt']
  if (nb === 1) ids.push('none')
  return ids.map((id) => ({ id, label: ANGLE_TEXT[id] }))
}

function Work({ speciesId, mode, task, onResult, compact }: { speciesId: string; mode: 'learn' | 'test'; task: boolean; onResult?: WidgetProps['onResult']; compact?: boolean }) {
  const sp = findSpecies(speciesId) ?? SPECIES[0]
  const info = useMemo(() => analyze(sp), [sp])
  const name = unicodeFormula(sp.id)
  const [a, setA] = useState({ dom: '', lp: '', eg: '', mg: '', ang: '' as AngleId | '' })
  const [tg, setTg] = useState({ dom: true, lone: true, ang: true })
  const layout = useMemo(() => layoutOf(sp), [sp])

  const evalStep = (i: number): StepResult => {
    const notes: Note[] = []
    if (i === 0) {
      const v = Number(a.dom)
      if (!a.dom.trim() || !Number.isFinite(v)) return { ok: false, notes: [{ level: 'err', msg: 'Enter a whole number of electron domains.' }] }
      if (v === info.dom) return { ok: true, notes: [{ level: 'ok', msg: `${info.dom} domains: ${info.nb} bonded atom${info.nb > 1 ? 's' : ''} + ${info.lp} lone pair${info.lp === 1 ? '' : 's'}${info.piC ? ' (double/triple bonds count as ONE domain)' : ''}.` }] }
      if (info.piC > 0 && v === info.nb + info.piC + info.lp) notes.push({ level: 'err', msg: `You counted every bond of a double/triple bond separately. All electrons of a single, double or triple bond form **one** domain (slide 3).` })
      else if (info.lp > 0 && v === info.nb) notes.push({ level: 'err', msg: `You counted only the bonded atoms (${info.nb}). Lone pairs on the central atom are domains too (slide 13): domains = bonded atoms + lone pairs.` })
      else notes.push({ level: 'err', msg: `Domains = number of atoms bonded to ${sp.centre} (each multiple bond counts once) + lone pairs on ${sp.centre}. Try again.` })
      if (mode === 'learn') notes.push({ level: 'hint', msg: `Skeleton: ${sp.centre} bonded to ${ligandSummary(sp)}.` })
      return { ok: false, notes }
    }
    if (i === 1) {
      const v = Number(a.lp)
      if (!a.lp.trim() || !Number.isFinite(v)) return { ok: false, notes: [{ level: 'err', msg: 'Enter the number of lone pairs on the central atom.' }] }
      if (v === info.lp) return { ok: true, notes: [{ level: 'ok', msg: lpExplain(info) }] }
      if (info.lp > 0 && v === info.lp * 2) notes.push({ level: 'err', msg: `That is the number of lone-pair *electrons*. One lone pair = 2 e⁻.` })
      else notes.push({ level: 'err', msg: `Not ${v}. Lone pairs = (valence e⁻ of the central atom, adjusted for its formal charge − bonds it forms) ÷ 2.` })
      notes.push({ level: 'hint', msg: lpExplain(info) })
      return { ok: false, notes }
    }
    if (i === 2) {
      if (!a.eg) return { ok: false, notes: [{ level: 'err', msg: 'Choose the electron-domain geometry.' }] }
      if (a.eg === info.eg) return { ok: true, notes: [{ level: 'ok', msg: `${info.dom} domains → ${info.eg}. Domains arrange themselves as far apart as possible (slide 4).` }] }
      const want = EG_BY_DOMAINS[info.dom]
      notes.push({ level: 'err', msg: `The electron-domain geometry depends only on the number of domains (lone pairs included). ${info.dom} domains → ${want}, not ${a.eg}.` })
      return { ok: false, notes }
    }
    if (i === 3) {
      if (!a.mg) return { ok: false, notes: [{ level: 'err', msg: 'Choose the molecular geometry.' }] }
      if (a.mg === info.shape.mg) {
        const extra = info.lp > 0 ? ` The lone pair${info.lp > 1 ? 's are' : ' is'} not named: only the positions of the atoms count.` : ''
        const eqn = info.dom === 5 && info.lp > 0 ? ' Lone pairs sit equatorial in a trigonal bipyramid (slide 21).' : info.dom === 6 && info.lp === 2 ? ' The two lone pairs sit trans (slide 16).' : ''
        return { ok: true, notes: [{ level: 'ok', msg: `${info.nb} atoms + ${info.lp} lone pair${info.lp === 1 ? '' : 's'} → ${info.shape.mg}.${extra}${eqn}` }] }
      }
      const atoms = MG_ATOMS[a.mg] ?? []
      if (info.lp > 0 && a.mg === info.eg) notes.push({ level: 'err', msg: `"${a.mg}" is the electron-domain geometry. Molecular geometry names only the atoms; with ${info.lp} lone pair${info.lp > 1 ? 's' : ''} the shape is distorted.` })
      else if (!atoms.includes(info.nb)) notes.push({ level: 'err', msg: `${a.mg} has ${atoms.join(' or ')} atom${atoms[0] > 1 ? 's' : ''} around the centre, but ${sp.id === undefined ? '' : name} has ${info.nb}.` })
      else notes.push({ level: 'err', msg: `With ${info.nb} bonded atoms and ${info.lp} lone pair${info.lp === 1 ? '' : 's'} on a ${info.eg} arrangement, the shape is not ${a.mg}.` })
      if (mode === 'learn') notes.push({ level: 'hint', msg: info.dom === 5 ? 'In AX5 the lone pairs go equatorial (slide 21).' : info.dom === 6 ? 'In AX6 lone pairs go axial/trans (slide 16).' : 'Remove the lone-pair positions from the electron geometry and name what is left.' })
      return { ok: false, notes }
    }
    // angle
    if (!a.ang) return { ok: false, notes: [{ level: 'err', msg: 'Choose the bond angle(s).' }] }
    const okIds: AngleId[] = [info.shape.angle, ...(info.shape.angleAlso ?? [])]
    if (okIds.includes(a.ang)) return { ok: true, notes: [{ level: 'ok', msg: `${info.shape.angleNote}.${info.lp > 0 && info.shape.angle !== 'a180' && info.shape.angle !== 'a90' ? ' The lone pair domain is bigger than a bonding domain (slide 14), so it squeezes the bond angles.' : ''}` }] }
    if (info.lp > 0 && ((info.shape.angle === 'a1095lt' && a.ang === 'a1095') || (info.shape.angle === 'a120lt' && a.ang === 'a120') || (info.shape.angle === 'a90_120lt' && a.ang === 'a90_120')))
      notes.push({ level: 'err', msg: `That is the ideal angle for ${info.dom} domains with no lone pairs. A lone pair takes more room than a bonding pair, so the bond angles are slightly *smaller* (“${ANGLE_TEXT[info.shape.angle]}”).` })
    else notes.push({ level: 'err', msg: `The ideal angle for a ${info.eg} arrangement is ${info.eg === 'linear' ? '180°' : info.eg === 'trigonal planar' ? '120°' : info.eg === 'tetrahedral' ? '109.5°' : info.eg === 'trigonal bipyramidal' ? '90°/120°' : '90°'}${info.lp > 0 ? ', reduced by the lone pair(s) unless they are placed symmetrically' : ''}. Expected: ${info.shape.angleNote}.` })
    return { ok: false, notes }
  }
  const st = useStepper(mode, 5, evalStep)
  useReportOnce(st.finished, onResult, () => ({
    correct: st.mistakes === 0,
    score: Math.max(0, 1 - st.mistakes / 5),
    summary: st.mistakes === 0 ? `${name}: ${info.dom} domains, ${info.lp} LP, ${info.eg}, ${info.shape.mg}.` : `${name}: ${st.firstErr.current || 'some steps wrong'} (${info.dom} domains, ${info.lp} LP, ${info.shape.mg}, ${info.shape.angleNote})`,
  }))
  const set = (k: keyof typeof a) => (v: string) => setA((p) => ({ ...p, [k]: v }))
  const frozen = (i: number) => st.frozen(i)
  const stateOf = (i: number) => (st.status(i) === 'done' ? 'ok' : st.status(i) === 'error' ? 'err' : null)
  const stepBtn = (i: number) => mode === 'learn' && !st.res[i]?.ok && <div className="row" style={{ marginTop: 8 }}><button className="btn primary sm" onClick={() => st.check(i)}>Check</button></div>
  const reveal = st.finished

  return (
    <div className={compact ? '' : 'grid2'}>
      <div>
        <div className="l10-species">
          <span className="l10-big"><Formula f={sp.id} /></span> <span className="muted">{sp.name}</span>
          <div className="muted" style={{ fontSize: 13 }}>Central atom {sp.centre}{sp.charge ? `, overall charge ${sp.charge > 0 ? '+' : '−'}${Math.abs(sp.charge) > 1 ? Math.abs(sp.charge) : ''}` : ''} · bonded to {ligandSummary(sp)}</div>
          {sp.note && <div className="muted" style={{ fontSize: 12.5 }}>{sp.note}</div>}
        </div>
        <Step n={1} title="Count the electron domains around the central atom" status={st.status(0)} notes={st.notes(0)}>
          <div className="row"><NumInput value={a.dom} onChange={set('dom')} placeholder="e.g. 4" width={90} state={stateOf(0)} disabled={frozen(0)} /><span className="muted" style={{ fontSize: 12.5 }}>a double/triple bond counts as ONE domain</span></div>
          {stepBtn(0)}
        </Step>
        <Step n={2} title="How many lone pairs on the central atom?" status={st.status(1)} notes={st.notes(1)}>
          <NumInput value={a.lp} onChange={set('lp')} placeholder="e.g. 1" width={90} state={stateOf(1)} disabled={frozen(1)} />
          {stepBtn(1)}
        </Step>
        <Step n={3} title="Electron-domain geometry" status={st.status(2)} notes={st.notes(2)}>
          <Choice options={EG_LIST.map((x) => ({ id: x, label: x }))} value={a.eg as never} onChange={set('eg')} disabled={frozen(2)} state={stateOf(2)} />
          {stepBtn(2)}
        </Step>
        <Step n={4} title="Molecular geometry (names the atoms only)" status={st.status(3)} notes={st.notes(3)}>
          <Choice options={MG_LIST.map((x) => ({ id: x, label: x }))} value={a.mg as never} onChange={set('mg')} disabled={frozen(3)} state={stateOf(3)} />
          {stepBtn(3)}
        </Step>
        <Step n={5} title="Bond angle(s)" status={st.status(4)} notes={st.notes(4)}>
          <Choice options={angleOptions(info.nb)} value={a.ang} onChange={(v) => setA((p) => ({ ...p, ang: v }))} disabled={frozen(4)} state={stateOf(4)} />
          {stepBtn(4)}
        </Step>
        {mode === 'test' && !st.submitted && <button className="btn primary" onClick={() => st.checkAll()}>Check all</button>}
        {reveal && <Verdict correct={st.mistakes === 0 ? true : 'partial'} title={st.mistakes === 0 ? 'All steps correct' : `Done with ${st.mistakes} wrong check${st.mistakes > 1 ? 's' : ''}`}>
          <span><Formula f={sp.id} />: {info.dom} domains, {info.lp} lone pair{info.lp === 1 ? '' : 's'} → {info.eg} electron geometry, <b>{info.shape.mg}</b>, {info.shape.angleNote}.</span>
        </Verdict>}
        {mode === 'test' && st.submitted && <Feedback notes={[]} />}
      </div>
      <div>
        {reveal ? (
          <>
            <Viewer layout={layout} centre={sp.centre} showDomains={tg.dom} showLone={tg.lone} showAngles={tg.ang} height={compact ? 240 : 340} resetKey={sp.id} />
            <Toggles s={tg} set={setTg} />
            <div className="l10-card">
              <dl className="l10-dl">
                <dt>Notation</dt><dd><Axe nb={info.nb} lp={info.lp} /></dd>
                <dt>Electron geometry</dt><dd>{info.eg}</dd>
                <dt>Molecular geometry</dt><dd><b>{info.shape.mg}</b></dd>
                <dt>Hybridization</dt><dd>{HYB_LABEL[info.hyb]}</dd>
                <dt>Polarity</dt><dd>{sp.polar ? 'polar' : 'nonpolar'}</dd>
              </dl>
            </div>
          </>
        ) : (
          <div className="l10-lock"><IconLockFill size={30} style={{ color: '#8e8e93' }} /><b>3D model locked</b><span className="muted">Finish all five steps to reveal the molecule.</span></div>
        )}
      </div>
    </div>
  )
}

export default function Vsepr({ mode: fm, task, onResult, compact }: WidgetProps<{ species: string }>) {
  const [mode, setMode] = useMode(fm, 'chem.mode')
  const [view, setView] = useState<'explore' | 'work'>(task ? 'work' : 'explore')
  const [sid, setSid] = useState(task?.species ?? 'H2O')
  const [epoch, setEpoch] = useState(0)
  const taskSp = task ? findSpecies(task.species) : undefined
  const cur = taskSp?.id ?? sid
  return (
    <Workbench
      title="VSEPR shapes" subtitle={view === 'explore' ? 'Explore domains and lone pairs in 3D' : 'Work out the geometry step by step'}
      mode={view === 'work' ? mode : undefined} onMode={setMode} compact={compact}
      onReset={view === 'work' ? () => setEpoch((e) => e + 1) : undefined}
      tools={!task && <div className="seg"><button className={view === 'explore' ? 'on' : ''} onClick={() => setView('explore')}>Explore</button><button className={view === 'work' ? 'on' : ''} onClick={() => setView('work')}>Workbench</button></div>}
    >
      {view === 'explore' ? <Explore compact={compact} /> : (
        <>
          {!task && <div style={{ marginBottom: 12 }}><SpeciesPicker value={cur} onChange={(id) => { setSid(id); setEpoch((e) => e + 1) }} /></div>}
          <Work key={`${cur}-${epoch}-${mode}`} speciesId={cur} mode={mode} task={!!task} onResult={onResult} compact={compact} />
        </>
      )}
    </Workbench>
  )
}
