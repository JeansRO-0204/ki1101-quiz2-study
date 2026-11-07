// Lewis structure workbench: valence discovery -> skeleton -> distribute electrons -> check -> resonance follow-up.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as RPointerEvent, MouseEvent as RMouseEvent, KeyboardEvent as RKeyboardEvent } from 'react'
import type { Mode, Tasks, WidgetProps, WidgetResult } from '../../types'
import {
  Feedback, Formula, NumInput, SlideRef, Step, Verdict, Workbench, parseNum, recordAttempt, useLocalState, useMode, within,
  type Note, type StepStatus,
} from '../../lib/kit'
import StructureSvg, { autoLayout, cpk, specLayout, subDigits, type DrawBond, type NodeBadge, type Pt } from './draw'
import ResonanceView, { averages, frac, parseFrac } from './ResonanceView'
import {
  analyze, atomLabels, bkey, checkCentral, checkSkeleton, checkTotal, checkValence, emptyWork, fmtFc, resolveCtx,
  type Analysis, type Ctx, type Fill, type Work,
} from './engine'
import { SPECIES, outerShell, valenceOf, getSpecies } from './species'
import './lewis.css'

/** Small bond icon: 1, 2 or 3 parallel lines. */
function BondGlyph({ n }: { n: 1 | 2 | 3 }) {
  const ys = n === 1 ? [7] : n === 2 ? [4.5, 9.5] : [2.5, 7, 11.5]
  return (
    <svg className="lewis-glyph" width="26" height="14" viewBox="0 0 26 14" aria-hidden="true">
      <circle cx="3" cy="7" r="2.6" fill="currentColor" opacity=".35" /><circle cx="23" cy="7" r="2.6" fill="currentColor" opacity=".35" />
      {ys.map((y) => <line key={y} x1="3" x2="23" y1={y} y2={y} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />)}
    </svg>
  )
}

/* ====================================================================== */
/*  outer shell: species picker + sandbox                                   */
/* ====================================================================== */
export default function Lewis({ mode: forced, task, onResult, compact }: WidgetProps<Tasks['lewis']>) {
  const [mode, setMode] = useMode(forced, 'chem.mode')
  const start = task?.species ?? 'NO3^-'
  const [formula, setFormula] = useState(start)
  const [text, setText] = useState(start)
  const [run, setRun] = useState(0)
  useEffect(() => { if (task?.species) { setFormula(task.species); setText(task.species); setRun((r) => r + 1) } }, [task?.species])
  const res = useMemo(() => resolveCtx(formula), [formula])

  const commit = (v: string) => { setFormula(v); setRun((r) => r + 1) }
  const onType = (v: string) => {
    setText(v)
    const hit = getSpecies(v)
    if (hit && hit.formula.toLowerCase() === v.trim().toLowerCase()) commit(hit.formula)
  }
  const random = () => {
    const pick = SPECIES[Math.floor(Math.random() * SPECIES.length)]
    setText(pick.formula)
    commit(pick.formula)
  }
  const picker = task ? null : (
    <div className="lewis-picker">
      <input list="lewis-species-list" value={text} placeholder="Search or type a formula…" aria-label="Species"
        onChange={(e) => onType(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { const hit = getSpecies(text); commit(hit ? hit.formula : text) } }}
        onBlur={() => { const hit = getSpecies(text); if (hit && hit.formula !== formula) commit(hit.formula) }} />
      <datalist id="lewis-species-list">
        {SPECIES.map((s) => <option key={s.formula} value={s.formula}>{s.name}</option>)}
      </datalist>
      <button className="btn sm" onClick={() => { const hit = getSpecies(text); commit(hit ? hit.formula : text) }}>Go</button>
      <button className="btn sm ghost" onClick={random} title="Random species">Random</button>
    </div>
  )
  return (
    <Workbench
      title="Lewis structure workbench"
      subtitle={res.ctx ? <><Formula f={res.ctx.formula} />{res.ctx.sp ? ` · ${res.ctx.sp.name}` : ' · sandbox (generic checks only)'}</> : undefined}
      mode={mode} onMode={setMode} onReset={() => setRun((r) => r + 1)} tools={picker} compact={compact}
    >
      <div className="lewis-root">
        {res.error && <p className="lewis-err">{res.error}</p>}
        {res.ctx && (
          <Bench key={res.ctx.key + ':' + run + ':' + (task ? 't' : 'f')} ctx={res.ctx} mode={mode} hasTask={!!task}
            resRequested={!!task?.resonance} onResult={onResult} compact={compact} />
        )}
      </div>
    </Workbench>
  )
}

/* ====================================================================== */
/*  the bench                                                               */
/* ====================================================================== */
interface Boxes { s: number; p: [number, number, number] }
interface Final {
  v: { ok: boolean; notes: Note[] }
  t: { ok: boolean; notes: Note[] }
  c: { ok: boolean; notes: Note[] }
  sk: { ok: boolean; notes: Note[] }
  an: Analysis
  expectedTotal: number
}

function Bench({ ctx, mode, hasTask, resRequested, onResult, compact }: {
  ctx: Ctx; mode: Mode; hasTask: boolean; resRequested: boolean; onResult?: (r: WidgetResult) => void; compact?: boolean
}) {
  const { atoms, charge, sp } = ctx
  const n = atoms.length
  const learn = mode === 'learn'
  const lab = useMemo(() => atomLabels(atoms), [atoms])
  const subs = useMemo(() => subDigits(atoms), [atoms])
  const distinct = useMemo(() => [...new Set(atoms)], [atoms])
  const avail = useMemo(() => atoms.reduce((t, a) => t + valenceOf(a), 0) - charge, [atoms, charge])

  // ---- state ----
  const [boxes, setBoxes] = useState<Record<string, Boxes>>({})
  const [totalStr, setTotalStr] = useState('')
  const [central, setCentral] = useState<number | null>(null)
  const [work, setWork] = useState<Work>(() => emptyWork(n))
  const [pos, setPos] = useState<Pt[]>(() => autoLayout(n, [], null))
  const [dragged, setDragged] = useState(false)
  const [tool, setTool] = useState<'bond' | 'elec'>('bond')
  const [selAtom, setSelAtom] = useState<number | null>(null)
  const [selBond, setSelBond] = useState<string | null>(null)
  const [stepNotes, setStepNotes] = useState<{ 1?: Note[]; 2?: Note[]; 3?: Note[] }>({})
  const [stepDone, setStepDone] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [final, setFinal] = useState<Final | null>(null)
  const [flash, setFlash] = useState<number[]>([])
  const [reveal, setReveal] = useState(false)
  const [msg, setMsg] = useState('')
  const reported = useRef(false)

  // resonance follow-up
  const [rCount, setRCount] = useState('')
  const [rAvg, setRAvg] = useState('')
  const [rDone, setRDone] = useState<Note[] | null>(null)

  const fills = useMemo(() => {
    const out: Record<string, Fill> = {}
    for (const el of distinct) { const b = boxes[el]; out[el] = b ? { s: b.s, p: b.p[0] + b.p[1] + b.p[2] } : { s: 0, p: 0 } }
    return out
  }, [boxes, distinct])

  const edges = useMemo(() => Object.keys(work.bonds).map((k) => k.split('-').map(Number) as [number, number]), [work.bonds])
  const edgeKey = Object.keys(work.bonds).sort().join(',')
  useEffect(() => { if (!dragged) setPos(autoLayout(n, edges, central)) }, [edgeKey, central, dragged]) // eslint-disable-line react-hooks/exhaustive-deps

  const an = useMemo(() => analyze(ctx, work, central), [ctx, work, central])
  const skelLocked = learn && stepDone[1]
  const live = !learn || stepDone[0]
  const elecOpen = !learn || stepDone[1]
  useEffect(() => { if (learn && stepDone[1]) setTool('elec') }, [learn, stepDone])

  // ---- canvas interaction ----
  const svgRef = useRef<SVGSVGElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ i: number; sx: number; sy: number; moved: boolean } | null>(null)

  const addLp = (i: number, d: number) => setWork((w) => {
    const lp = w.lp.slice()
    const v = lp[i] + d
    lp[i] = v < 0 ? 0 : v > 4 ? (d > 0 ? 0 : 4) : v
    return { ...w, lp }
  })
  const addUe = (i: number, d: number) => setWork((w) => {
    const ue = w.ue.slice()
    ue[i] = Math.max(0, Math.min(3, ue[i] + d))
    return { ...w, ue }
  })
  const delBond = (key: string) => setWork((w) => { const bonds = { ...w.bonds }; delete bonds[key]; return { ...w, bonds } })
  const cycleBond = (key: string) => setWork((w) => ({ ...w, bonds: { ...w.bonds, [key]: (w.bonds[key] % 3) + 1 } }))
  const setBondOrder = (key: string, order: 1 | 2 | 3) => setWork((w) => ({ ...w, bonds: { ...w.bonds, [key]: order } }))
  const ORD = ['', 'single', 'double', 'triple']
  const [guideOff, setGuideOff] = useLocalState<boolean>('lewis.guide.off', false)

  const clickAtom = (i: number, e: { shiftKey: boolean; altKey: boolean }) => {
    setSelBond(null)
    if (tool === 'bond') {
      if (selAtom == null) { setSelAtom(i); return }
      if (selAtom === i) { setSelAtom(null); return }
      const key = bkey(selAtom, i)
      if (work.bonds[key]) {
        // Clicking an already-bonded pair again upgrades it: single → double → triple → single.
        if (elecOpen) { cycleBond(key); setSelBond(key); setMsg(`${lab[selAtom]}–${lab[i]} is now a ${ORD[(work.bonds[key] % 3) + 1]} bond.`) }
        else { setSelBond(key); setMsg('Single bonds only for now. You can upgrade to double or triple bonds in the next step.') }
        setSelAtom(null); return
      }
      if (skelLocked) { setMsg('The skeleton is locked after step 2. Reset to rebuild it.'); setSelAtom(null); return }
      setWork((w) => ({ ...w, bonds: { ...w.bonds, [key]: 1 } }))
      setSelAtom(central != null && (central === selAtom || central === i) ? central : null)
      setMsg('')
    } else {
      setSelAtom(i)
      addLp(i, e.shiftKey || e.altKey ? -1 : 1)
    }
  }
  const clickBond = (key: string) => {
    setSelAtom(null)
    setSelBond(key)
    if (tool === 'elec' || (selBond === key && elecOpen)) cycleBond(key)
  }
  const toSvg = (cx: number, cy: number): Pt | null => {
    const svg = svgRef.current
    const m = svg?.getScreenCTM()
    if (!svg || !m) return null
    const p = svg.createSVGPoint()
    p.x = cx; p.y = cy
    const q = p.matrixTransform(m.inverse())
    return [q.x, q.y]
  }
  const onNodeDown = (i: number, e: RPointerEvent) => {
    // Don't capture yet: capturing on pointerdown retargets the follow-up click to the <svg>,
    // whose background-click handler would immediately deselect the atom. Capture once a drag starts.
    cardRef.current?.focus()
    drag.current = { i, sx: e.clientX, sy: e.clientY, moved: false }
  }
  const onMove = (e: RPointerEvent<SVGSVGElement>) => {
    const d = drag.current
    if (!d) return
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5) {
      d.moved = true
      try { svgRef.current?.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    }
    if (!d.moved) return
    const q = toSvg(e.clientX, e.clientY)
    if (!q) return
    const x = Math.max(20, Math.min(540, q[0])), y = Math.max(20, Math.min(310, q[1]))
    setDragged(true)
    setPos((p) => p.map((o, k) => (k === d.i ? ([x, y] as Pt) : o)))
  }
  const onUp = (e: RPointerEvent<SVGSVGElement>) => {
    const d = drag.current
    drag.current = null
    if (d && !d.moved) clickAtom(d.i, e)
    try { svgRef.current?.releasePointerCapture(e.pointerId) } catch { /* not captured */ }
  }
  const onKey = (e: RKeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selBond) {
      e.preventDefault()
      if (skelLocked) { setMsg('The skeleton is locked after step 2. Reset to rebuild it.'); return }
      delBond(selBond); setSelBond(null)
    } else if (e.key === 'Escape') { setSelAtom(null); setSelBond(null) }
    else if (selBond && elecOpen && ['1', '2', '3'].includes(e.key)) setBondOrder(selBond, Number(e.key) as 1 | 2 | 3)
    else if (selAtom != null && elecOpen && (e.key === '+' || e.key === '=')) addLp(selAtom, 1)
    else if (selAtom != null && elecOpen && (e.key === '-' || e.key === '_')) addLp(selAtom, -1)
  }

  // ---- orbital boxes (step 1) ----
  const cycleBox = (el: string, kind: 's' | 'p', idx = 0) => setBoxes((b) => {
    const cur = b[el] ?? { s: 0, p: [0, 0, 0] as [number, number, number] }
    if (kind === 's') return { ...b, [el]: { ...cur, s: (cur.s + 1) % 3 } }
    const p = cur.p.slice() as [number, number, number]
    p[idx] = (p[idx] + 1) % 3
    return { ...b, [el]: { ...cur, p } }
  })

  // ---- checks ----
  const check1 = () => {
    const v = checkValence(distinct, fills)
    const t = totalStr.trim() ? checkTotal(atoms, charge, parseNum(totalStr)) : { ok: false, notes: [{ level: 'err', msg: 'Enter the total number of valence electrons (remember to adjust for the charge).' } as Note] }
    setStepNotes((s) => ({ ...s, 1: [...v.notes, ...t.notes] }))
    setStepDone((d) => [v.ok && t.ok, d[1], d[2]])
  }
  const check2 = () => {
    const c = checkCentral(ctx, central)
    const sk = c.ok ? checkSkeleton(ctx, central, work.bonds) : { ok: false, notes: [] as Note[] }
    setStepNotes((s) => ({ ...s, 2: [...c.notes, ...sk.notes] }))
    setStepDone((d) => [d[0], c.ok && sk.ok, d[2]])
    if (c.ok && sk.ok) setTool('elec')
  }
  const check3 = () => {
    const notes: Note[] = [...an.errors, ...(an.errors.length ? an.hints : []), ...an.oks]
    if (an.valid) notes.push({ level: 'info', msg: 'Every octet works and the electrons add up. Step 4 tells you whether it is the **best** structure.' })
    setStepNotes((s) => ({ ...s, 3: notes }))
    setStepDone((d) => [d[0], d[1], an.valid])
    setFlash(an.atoms.filter((x) => x.kind === 'incomplete' || x.kind === 'excess').map((x) => x.i))
    setTimeout(() => setFlash([]), 1900)
  }
  const needsFollow = !!sp?.resonance
  const runFinal = () => {
    const v = checkValence(distinct, fills)
    const t = totalStr.trim() ? checkTotal(atoms, charge, parseNum(totalStr)) : { ok: false, notes: [{ level: 'err', msg: 'Total valence electrons not answered.' } as Note] }
    const c = checkCentral(ctx, central)
    const sk = checkSkeleton(ctx, central, work.bonds)
    const f: Final = { v, t, c, sk, an, expectedTotal: avail }
    setFinal(f)
    if (!learn) {
      setStepNotes({
        1: [...v.notes, ...t.notes, ...(t.ok ? [] : [{ level: 'info', msg: `Correct total: ${avail} valence electrons.` } as Note])],
        2: [...c.notes, ...sk.notes],
        3: [...an.errors, ...an.oks],
      })
      setStepDone([v.ok && t.ok, c.ok && sk.ok, an.valid])
    }
    setFlash(an.atoms.filter((x) => x.kind === 'incomplete' || x.kind === 'excess').map((x) => x.i))
    setTimeout(() => setFlash([]), 1900)
    const correct = an.verdict === 'best'
    if (!hasTask) recordAttempt({ id: 'lewis:' + ctx.formula, lecture: 'L9', topic: 'Lewis structures', correct })
    if (hasTask && !reported.current && !(resRequested && needsFollow)) {
      reported.current = true
      onResult?.({ correct, score: correct ? 1 : an.verdict === 'valid' ? 0.5 : 0, summary: summary(ctx, f) })
    }
  }
  const checkFollow = () => {
    if (!sp || !final) return
    const av = averages(sp.atoms, sp.forms)
    const count = parseNum(rCount)
    const countOk = count === sp.forms.length
    const notes: Note[] = []
    if (countOk) notes.push({ level: 'ok', msg: `Yes: ${sp.forms.length} resonance structures.` })
    else if (count === sp.forms.filter((f) => f.rank !== 'poor').length) notes.push({ level: 'warn', msg: `You counted the acceptable contributors. The slides also show a third form with large formal charges (${sp.forms.length} in total).` })
    else notes.push({ level: 'err', msg: `There are ${sp.forms.length}. Move the double bond/lone pair onto each equivalent terminal atom in turn (nuclei stay put, only electrons move).` })
    const vk = av.keys.find((k) => Math.max(...k.orders) !== Math.min(...k.orders))
    let avgOk = true
    if (vk) {
      avgOk = within(parseFrac(rAvg), vk.avg, { abs: 0.03 })
      notes.push(avgOk
        ? { level: 'ok', msg: `Average ${lab[vk.a]}–${lab[vk.b]} bond order = ${frac(vk.avg)}.` }
        : { level: 'err', msg: `Average order = (sum of the orders in each form) ÷ ${av.used.filter(Boolean).length}. The bond is ${vk.orders.filter((_, i) => av.used[i]).join(', ')} in the contributing forms → ${frac(vk.avg)}.` })
    }
    setRDone(notes)
    if (hasTask && !reported.current) {
      reported.current = true
      const sc = (final.an.verdict === 'best' ? 1 : final.an.verdict === 'valid' ? 0.5 : 0) * 0.6 + (countOk ? 0.2 : 0) + (avgOk ? 0.2 : 0)
      onResult?.({ correct: final.an.verdict === 'best' && countOk && avgOk, score: sc, summary: summary(ctx, final) + (countOk ? '' : ` Resonance count wrong (answer ${sp.forms.length}).`) })
    }
  }

  // ---- statuses ----
  const stat = (k: 1 | 2 | 3 | 4): StepStatus => {
    if (!learn) {
      if (!final) return 'active'
      if (k === 1) return final.v.ok && final.t.ok ? 'done' : 'error'
      if (k === 2) return final.c.ok && final.sk.ok ? 'done' : 'error'
      if (k === 3) return final.an.valid ? 'done' : 'error'
      return final.an.verdict === 'best' ? 'done' : 'error'
    }
    if (k === 1) return stepDone[0] ? 'done' : stepNotes[1] ? 'error' : 'active'
    if (k === 2) return !stepDone[0] ? 'locked' : stepDone[1] ? 'done' : stepNotes[2] ? 'error' : 'active'
    if (k === 3) return !stepDone[1] ? 'locked' : stepDone[2] ? 'done' : stepNotes[3] ? 'error' : 'active'
    return !stepDone[2] ? 'locked' : final ? (final.an.verdict === 'best' ? 'done' : 'error') : 'active'
  }

  // ---- drawing data ----
  const drawBonds: DrawBond[] = edges.map(([a, b]) => ({ a, b, order: work.bonds[bkey(a, b)] }))
  const showElec = !learn || stepDone[1]
  const badges: (NodeBadge | null)[] | null = showElec
    ? an.atoms.map((x) => {
      if (x.count === 0) return null
      if (!learn) return { text: String(x.count), tone: 'plain' as const }
      switch (x.kind) {
        case 'ok': case 'duet': return { text: `${x.count} ✓`, tone: 'ok' as const }
        case 'expanded': return { text: `${x.count} exp`, tone: 'info' as const }
        case 'incomplete-ok': return { text: `${x.count} ok`, tone: 'info' as const }
        case 'odd': return { text: `${x.count} odd`, tone: 'info' as const }
        case 'excess': return { text: `${x.count} !`, tone: 'bad' as const }
        default: return { text: `${x.count} …`, tone: 'warn' as const }
      }
    })
    : null
  const fcArr = showElec && an.used === an.avail ? an.atoms.map((x) => x.fc) : null

  const budgetCls = an.used === an.avail ? (learn ? ' full' : '') : an.used > an.avail ? (learn ? ' over' : '') : ''
  const help = selBond
    ? (elecOpen ? `Bond selected: use the Single / Double / Triple buttons above, or click the bond again to upgrade it. Delete removes it.` : 'Bond selected. Delete removes it (double/triple bonds unlock in step 3).')
    : tool === 'bond'
      ? (selAtom == null ? 'Click an atom, then another atom, to join them. Click the same two atoms again to make a double, then a triple bond.' : `Now click the atom to bond with ${lab[selAtom]} (click ${lab[selAtom]} again to cancel).`)
      : 'Electrons mode: click an atom to add a lone pair (shift-click or right-click removes one), or use the electron tray below. Click a bond to cycle single → double → triple.'

  const slideRefs = useMemo(() => {
    const out: { l: 'L9' | 'L10'; s: number }[] = []
    for (const m of (sp?.slides ?? '').matchAll(/L(9|10) s(\d+)/g)) out.push({ l: m[1] === '9' ? 'L9' : 'L10', s: Number(m[2]) })
    return out.slice(0, 2)
  }, [sp])

  const refLayout = useMemo(() => (sp ? specLayout(sp.atoms.length, sp.skeleton, sp.central[0]) : null), [sp])

  /* ---------------- render ---------------- */
  const centralChips = (
    <div className="lewis-atoms-chips">
      {atoms.map((a, i) => (
        <button key={i} className={'lewis-atom-chip' + (central === i ? ' on' : '')} onClick={() => { setCentral(i); setDragged(false) }} title="Make this the central atom">
          <i style={{ background: cpk(a)[0], color: cpk(a)[1] }}>{a}</i>{lab[i]}
        </button>
      ))}
    </div>
  )

  return (
    <div className="lewis-grid">
      {/* ---------------- canvas ---------------- */}
      <div className="lewis-canvas">
        <div className="lewis-canvas-card" tabIndex={0} ref={cardRef} onKeyDown={onKey}>
          <div className="lewis-bar">
            <div className="seg">
              <button className={tool === 'bond' ? 'on' : ''} onClick={() => setTool('bond')} disabled={!live}>Connect atoms</button>
              <button className={tool === 'elec' ? 'on' : ''} onClick={() => setTool('elec')} disabled={!elecOpen} title={elecOpen ? '' : 'Unlocks after the skeleton (step 2)'}>Electrons</button>
            </div>
            <span className="sp" />
            {selBond && (
              <>
                <div className="seg lewis-ord" title={elecOpen ? 'Set the bond order (keys 1 / 2 / 3)' : 'Double and triple bonds unlock in step 3'}>
                  {([1, 2, 3] as const).map((o) => (
                    <button key={o} className={work.bonds[selBond] === o ? 'on' : ''} disabled={!elecOpen} onClick={() => setBondOrder(selBond, o)}>
                      <BondGlyph n={o} /> {ORD[o]}
                    </button>
                  ))}
                </div>
                <button className="btn sm" onClick={() => { if (skelLocked) { setMsg('The skeleton is locked after step 2.'); return } delBond(selBond); setSelBond(null) }}>Delete bond</button>
              </>
            )}
            <button className="btn sm ghost" onClick={() => { setDragged(false) }} title="Re-arrange atoms neatly">Tidy</button>
            <button className="btn sm ghost" onClick={() => setWork((w) => ({ ...w, lp: w.lp.map(() => 0), ue: w.ue.map(() => 0) }))} title="Remove all lone pairs">Clear e⁻</button>
          </div>
          {!guideOff && live && (
            <div className="lewis-guide" role="note">
              <div className="lewis-guide-h"><b>How to draw bonds</b><button className="btn ghost sm" onClick={() => setGuideOff(true)}>Got it ✕</button></div>
              <ol>
                <li><span className="n">1</span><span><b>Click an atom, then another</b> to join them: single bond <BondGlyph n={1} /></span></li>
                <li><span className="n">2</span><span><b>Click the same two atoms again</b> to upgrade: double <BondGlyph n={2} /> then triple <BondGlyph n={3} /></span></li>
                <li><span className="n">3</span><span>Or <b>click the bond</b> to select it, then pick <i>single / double / triple</i> above (keys 1 / 2 / 3)</span></li>
              </ol>
              {!elecOpen && <p>Double and triple bonds unlock in step 3, once your skeleton of single bonds is checked.</p>}
            </div>
          )}
          {guideOff && live && <button className="btn ghost sm lewis-guide-open" onClick={() => setGuideOff(false)}>? How to draw bonds</button>}
          <StructureSvg
            atoms={atoms} pos={pos} bonds={drawBonds} lp={work.lp} ue={work.ue} fc={fcArr} badges={badges} subs={subs}
            central={central} selAtom={selAtom} selBond={selBond} flash={flash} interactive={live} dim={!live}
            svgRef={svgRef} onNodeDown={onNodeDown} onMove={onMove} onUp={onUp}
            onBondClick={(k) => clickBond(k)} onAtomContext={(i) => { if (tool === 'elec') { setSelAtom(i); addLp(i, -1) } }}
            onBgClick={() => { setSelAtom(null); setSelBond(null) }}
          />
          <div className="lewis-help">{!live ? 'Finish step 1 to unlock the canvas.' : msg || help}</div>
          {showElec && (
            <div className="lewis-tray">
              <div className="lewis-tray-h">Electrons on each atom <small>(click an atom or use − / +)</small></div>
              {atoms.map((a, i) => (
                <div key={i} className={'lewis-tray-row' + (selAtom === i ? ' on' : '')} onClick={() => setSelAtom(i)}>
                  <span className="lewis-tray-atom"><i style={{ background: cpk(a)[0], color: cpk(a)[1] }}>{a}</i>{lab[i]}</span>
                  <span className="lewis-tray-ctl" title="Lone pairs (2 electrons each)">
                    <button onClick={(e) => { e.stopPropagation(); addLp(i, -1) }} disabled={(work.lp[i] ?? 0) <= 0} aria-label={`Remove a lone pair from ${lab[i]}`}>−</button>
                    <span className="n">{work.lp[i] ?? 0}</span>
                    <button onClick={(e) => { e.stopPropagation(); addLp(i, 1) }} disabled={(work.lp[i] ?? 0) >= 4} aria-label={`Add a lone pair to ${lab[i]}`}>+</button>
                    <em>lone pair{(work.lp[i] ?? 0) === 1 ? '' : 's'}</em>
                  </span>
                  <span className="lewis-tray-ctl" title="Single (unpaired) electrons: only for odd-electron species like NO">
                    <button onClick={(e) => { e.stopPropagation(); addUe(i, -1) }} disabled={(work.ue[i] ?? 0) <= 0} aria-label={`Remove a single electron from ${lab[i]}`}>−</button>
                    <span className="n">{work.ue[i] ?? 0}</span>
                    <button onClick={(e) => { e.stopPropagation(); addUe(i, 1) }} disabled={(work.ue[i] ?? 0) >= 3} aria-label={`Add a single electron to ${lab[i]}`}>+</button>
                    <em>single e⁻</em>
                  </span>
                </div>
              ))}
            </div>
          )}
          {showElec && (
            <div className={'lewis-budget' + budgetCls}>
              <span>Electrons used / available</span>
              <div className="bar"><i style={{ width: `${Math.min(100, (an.used / Math.max(avail, 1)) * 100)}%` }} /></div>
              <b>{an.used} / {avail}</b>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- steps ---------------- */}
      <div className="lewis-steps">
        <Step n={1} title="Valence electrons" status={stat(1)} notes={stepNotes[1]}>
          <p className="lewis-hint" style={{ marginTop: 0 }}>Click an orbital box to add an electron (↑), again for a pair (↑↓), again to empty it. Fill the outer s and p orbitals of each element.</p>
          {distinct.map((el) => {
            const sh = outerShell(el)
            const b = boxes[el] ?? { s: 0, p: [0, 0, 0] as [number, number, number] }
            const cnt = atoms.filter((a) => a === el).length
            const tot = fills[el].s + fills[el].p
            const [bg, fg] = cpk(el)
            return (
              <div className="lewis-el-row" key={el}>
                <span className="lewis-el-chip" style={{ background: bg, color: fg }}>{el}</span>
                <span className="lewis-el-meta">× {cnt}</span>
                <div className="lewis-orb-grp">
                  <div className="lewis-orb-row">
                    <button className={`lewis-orb s f${b.s}`} onClick={() => cycleBox(el, 's')} aria-label={`${sh.n}s orbital`}>{'↑↓'.slice(0, b.s === 0 ? 0 : b.s)}</button>
                  </div>
                  <span className="lab">{sh.n}s</span>
                </div>
                {sh.n > 1 && (
                  <div className="lewis-orb-grp">
                    <div className="lewis-orb-row">
                      {[0, 1, 2].map((k) => (
                        <button key={k} className={`lewis-orb p f${b.p[k]}`} onClick={() => cycleBox(el, 'p', k)} aria-label={`${sh.n}p orbital ${k + 1}`}>{'↑↓'.slice(0, b.p[k])}</button>
                      ))}
                    </div>
                    <span className="lab">{sh.n}p</span>
                  </div>
                )}
                <span className="lewis-sum">{tot} valence e⁻</span>
              </div>
            )
          })}
          <div className="lewis-line">
            <span className="lab"><b>Total</b> valence e⁻ for <Formula f={ctx.formula} /> ({tallyText(atoms)}{charge ? `, charge ${charge > 0 ? '+' : '−'}${Math.abs(charge)}` : ', neutral'}):</span>
            <NumInput value={totalStr} onChange={setTotalStr} unit="e⁻" placeholder="e.g. 32" width={90}
              state={learn && stepNotes[1] ? (stepDone[0] ? 'ok' : null) : null} />
          </div>
          {learn && <div className="lewis-actions"><button className="btn primary" onClick={check1}>Check step 1</button></div>}
        </Step>

        <Step n={2} title="Skeleton: central atom and single bonds" status={stat(2)} notes={stepNotes[2]}>
          <p className="lewis-hint" style={{ marginTop: 0 }}>Choose the central atom (usually the least electronegative; never H or F), then join atoms with <b>single bonds</b> on the canvas.</p>
          {centralChips}
          {learn && <div className="lewis-actions"><button className="btn primary" onClick={check2}>Check step 2</button></div>}
        </Step>

        <Step n={3} title="Distribute electrons" status={stat(3)} notes={stepNotes[3]}>
          <p className="lewis-hint" style={{ marginTop: 0 }}>
            Switch to <b>Electrons</b> on the canvas. Complete terminal octets first, put leftovers on the central atom, then upgrade bonds if the central atom is short. The budget bar tracks electrons used.
          </p>
          {showElec && (
            <table className="lewis-tbl">
              <thead><tr><th>Atom</th><th>e⁻ around</th>{learn && <th>Octet</th>}<th>Formal charge = valence − (bonds + unshared)</th></tr></thead>
              <tbody>
                {an.atoms.map((x) => (
                  <tr key={x.i}>
                    <td>{x.label}</td>
                    <td>{x.count}</td>
                    {learn && <td className={kindTone(x.kind)}>{kindText(x.kind)}</td>}
                    <td>{x.calc.split(': ')[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {learn && <div className="lewis-actions"><button className="btn primary" onClick={check3}>Check step 3</button></div>}
        </Step>

        <Step n={4} title="Check the structure" status={stat(4)}>
          {!final && (
            <>
              <p className="lewis-hint" style={{ marginTop: 0 }}>
                {learn ? 'Run the full validation: octets, formal charges and the best-structure criteria.' : 'Test mode: nothing is checked until you press Check. You will get a full report of every mistake.'}
              </p>
              <div className="lewis-actions">
                <button className="btn primary" onClick={runFinal}>Check</button>
                {!hasTask && sp && <button className="btn" onClick={() => setReveal((r) => !r)}>{reveal ? 'Hide' : 'Reveal'} accepted structure</button>}
              </div>
            </>
          )}
          {final && (
            <Report ctx={ctx} f={final} learn={learn} lab={lab} subs={subs} refLayout={refLayout} slideRefs={slideRefs} />
          )}
          {final && (
            <div className="lewis-actions">
              <button className="btn" onClick={runFinal}>Re-check</button>
            </div>
          )}
          {!final && reveal && sp && refLayout && <Reference ctx={ctx} pos={refLayout} subs={subs} />}
        </Step>

        {final && needsFollow && sp && (
          <Step n={5} title="Resonance follow-up" status={rDone ? 'done' : 'active'} notes={rDone ?? undefined}>
            {sp.resNote && <p className="lewis-hint" style={{ marginTop: 0 }}>{sp.resNote}</p>}
            {!rDone && (
              <>
                <div className="lewis-line" style={{ marginTop: 0 }}>
                  <span className="lab">How many resonance structures can you draw?</span>
                  <NumInput value={rCount} onChange={setRCount} placeholder="e.g. 3" width={70} />
                </div>
                {(() => {
                  const vk = averages(sp.atoms, sp.forms).keys.find((k) => Math.max(...k.orders) !== Math.min(...k.orders))
                  return vk ? (
                    <div className="lewis-line">
                      <span className="lab">Average {lab[vk.a]}–{lab[vk.b]} bond order (decimal or fraction):</span>
                      <NumInput value={rAvg} onChange={setRAvg} placeholder="e.g. 1.5 or 4/3" width={110} />
                    </div>
                  ) : null
                })()}
                <div className="lewis-actions"><button className="btn primary" disabled={!rCount.trim()} onClick={checkFollow}>Check</button></div>
              </>
            )}
            {rDone && <ResonanceView atoms={sp.atoms} pos={refLayout!} forms={sp.forms} charge={sp.charge} compact={compact} note={sp.resNote ? undefined : sp.notes} />}
          </Step>
        )}
      </div>
    </div>
  )
}

/* ---------------- helpers ---------------- */
function tallyText(atoms: string[]): string {
  const c = new Map<string, number>()
  atoms.forEach((a) => c.set(a, (c.get(a) ?? 0) + 1))
  return [...c.entries()].map(([a, k]) => `${k} ${a}`).join(' + ')
}
function kindText(k: string): string {
  return ({ ok: '8 ✓', duet: '2 ✓', expanded: 'expanded', 'incomplete-ok': 'incomplete (allowed)', odd: 'odd-electron', incomplete: 'incomplete', excess: 'too many', bad: 'bad' } as Record<string, string>)[k] ?? k
}
function kindTone(k: string): string {
  return k === 'ok' || k === 'duet' ? 'ok' : k === 'expanded' || k === 'incomplete-ok' || k === 'odd' ? 'info' : 'bad'
}
function summary(ctx: Ctx, f: Final): string {
  if (f.an.verdict === 'best') return `${ctx.formula}: best Lewis structure.`
  const first = f.an.errors[0]?.msg ?? f.an.reasons[0]?.msg ?? 'not the best structure'
  const clean = first.replace(/\*\*/g, '').replace(/\s+/g, ' ')
  return `${ctx.formula}: ${f.an.verdict === 'valid' ? 'valid but not best. ' : 'invalid. '}${clean}`.slice(0, 220)
}

/* ---------------- report (step 4) ---------------- */
function Report({ ctx, f, learn, lab, subs, refLayout, slideRefs }: {
  ctx: Ctx; f: Final; learn: boolean; lab: string[]; subs: (string | null)[]; refLayout: Pt[] | null; slideRefs: { l: 'L9' | 'L10'; s: number }[]
}) {
  void lab
  const { an } = f
  const early = f.v.ok && f.t.ok && f.c.ok && f.sk.ok
  const verdictNode = an.verdict === 'best' ? (
    <Verdict correct={early ? true : 'partial'} title={early ? 'Best Lewis structure ✓' : 'Best structure ✓, but your working has mistakes'}>
      <span>
        {ctx.sp && ctx.sp.best.length > 1 ? `This is one of ${ctx.sp.forms.length} equivalent resonance forms. ` : ''}
        All octets are satisfied (with the allowed exceptions) and the formal charges are as small as possible.
        {!early && ' Fix the earlier steps flagged above so the method itself is right too.'}
      </span>
    </Verdict>
  ) : an.verdict === 'valid' ? (
    <Verdict correct="partial" title={ctx.sp ? 'Valid, but not the best structure' : 'Valid Lewis structure (generic checks only)'}>
      {!ctx.sp && <span>No reference structure is stored for <Formula f={ctx.formula} />, so only the electron count, octets and formal charges were checked.</span>}
    </Verdict>
  ) : (
    <Verdict correct={false} title={`Invalid structure: ${an.errors.length} problem${an.errors.length === 1 ? '' : 's'} found`} />
  )
  const sections: { title: string; notes: Note[] }[] = [
    { title: 'Electrons and octets', notes: [...an.errors, ...(learn ? [] : []), ...an.oks] },
  ]
  if (an.valid) {
    sections.push({
      title: 'Best-structure criteria (slides 52, 62)',
      notes: an.reasons.length ? an.reasons : [{ level: 'ok', msg: 'FC as close to 0 as possible, all |FC| ≤ 1, any negative FC on the most electronegative atom, no adjacent like charges.' }],
    })
  }
  return (
    <div>
      {verdictNode}
      {sections.map((s) => (
        <div className="lewis-sec" key={s.title}>
          <h5>{s.title}</h5>
          <Feedback notes={s.notes} />
        </div>
      ))}
      <div className="lewis-sec">
        <h5>Formal charges: FC = valence e⁻ − [bonds + unshared e⁻]</h5>
        <table className="lewis-tbl">
          <thead><tr><th>Atom</th><th>Calculation</th><th>e⁻ around</th><th>Octet</th></tr></thead>
          <tbody>
            {an.atoms.map((x) => (
              <tr key={x.i}>
                <td>{x.label}</td>
                <td>{x.calc.split(': ')[1]}</td>
                <td>{x.count}</td>
                <td className={kindTone(x.kind)}>{kindText(x.kind)}</td>
              </tr>
            ))}
            <tr><td>Σ FC</td><td colSpan={3} className={an.fcSum === ctx.charge ? 'ok' : 'bad'}>{an.fcSum} {an.fcSum === ctx.charge ? '= ion charge ✓' : `≠ ion charge (${ctx.charge})`}</td></tr>
          </tbody>
        </table>
      </div>
      {ctx.sp && refLayout && <Reference ctx={ctx} pos={refLayout} subs={subs} />}
      {ctx.sp?.notes && <p className="lewis-notes">{ctx.sp.notes} {slideRefs.map((r) => <SlideRef key={r.l + r.s} l={r.l} s={r.s} />)}</p>}
    </div>
  )
}

function Reference({ ctx, pos, subs }: { ctx: Ctx; pos: Pt[]; subs: (string | null)[] }) {
  const sp = ctx.sp!
  const b = sp.best[0]
  return (
    <div className="lewis-ref">
      <div className="cap">Accepted best structure{sp.best.length > 1 ? ` (1 of ${sp.forms.length} equivalent resonance forms)` : ''}. Formal charges: {sp.atoms.map((a, i) => ({ a, f: sp.fc[i], i })).filter((x) => x.f !== 0).map((x) => `${x.a}${subs[x.i] ?? ''} ${fmtFc(x.f)}`).join(', ') || 'all 0'}</div>
      <StructureSvg atoms={sp.atoms} pos={pos} bonds={b.bonds.map(([a, c, o]) => ({ a, b: c, order: o }))} lp={b.lp} ue={b.ue} fc={sp.fc} subs={subs} vh={300} />
    </div>
  )
}
