import { useEffect, useMemo, useRef, useState } from 'react'
import type { WidgetProps } from '../../../types'
import { Feedback, Formula, NumInput, SlideRef, Step, Tex, Verdict, Workbench, parseNum, recordAttempt, useMode, type Note, type StepStatus } from '../../../lib/kit'
import { MoDiagram } from './MoDiagram'
import { Compare } from './Compare'
import {
  FAMILIES, NO_TABLE, SPECIES, coreElectrons, diagnoseFill, findSpecies, fillExpected, levelsFor, levelTex, neutralElectrons,
  speciesInfo, tally, totalElectrons, unpaired, configTex, type Order, type Species, type Why,
} from './engine'
import './mo.css'

const SUBS = '₀₁₂₃₄₅₆₇₈₉'
const SUPS: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '+': '⁺', '-': '⁻' }
/** "O2^2-" → "O₂²⁻" */
export function dispText(id: string) {
  const [b, c] = id.split('^')
  return b.replace(/\d/g, (d) => SUBS[+d]) + (c ? c.replace(/[0-3+-]/g, (x) => SUPS[x]) : '')
}

function parseFrac(s: string): number {
  const t = s.trim().replace('½', ' 1/2').replace('−', '-')
  const mixed = t.match(/^(-?\d+)\s+(\d+)\/(\d+)$/)
  if (mixed) return Math.sign(+mixed[1] || 1) * (Math.abs(+mixed[1]) + +mixed[2] / +mixed[3])
  const frac = t.match(/^(-?\d+)\s*\/\s*(\d+)$/)
  if (frac) return +frac[1] / +frac[2]
  const half = t.match(/^(-?\d*)\s+1\/2$/)
  if (half) return +half[1] + 0.5
  return parseNum(t)
}

const WHY_TEXT: Record<Why, string> = {
  '1s': '',
  mix: '2s and 2p energies are close for small Z, so σ2s and σ2p mix (s–p mixing); this pushes σ2p up above π2p.',
  norm: 'For larger Z the 2s–2p gap is big, so there is little s–p mixing and σ2p stays below π2p.',
  exp: 'N alone predicts π2p lower, O alone predicts σ2p lower, so experiment decides — and it shows σ2p is lower.',
  avg: 'N and F lie on either side of O, so on average the pair behaves like O: σ2p below π2p.',
  iso: 'C and N lie left of O (isoelectronic with N₂), so s–p mixing applies and π2p is below σ2p. (Beyond the slides.)',
}
const WRONG_1 = 'σ bonds (head-on overlap) are always lower in energy than π bonds, so σ2p is always below π2p.'
const WRONG_2 = 'It depends on how many electrons the molecule has: more electrons push π2p above σ2p.'

const ORDER_LABEL: Record<Order, string> = {
  mix: 'σ2p is ABOVE π2p  (s–p mixing)',
  normal: 'σ2p is BELOW π2p  (normal order)',
}

interface R { ok: boolean; notes: Note[] }

export default function Mo({ mode: forced, task, onResult, compact }: WidgetProps<{ species: string }>) {
  const [mode, setMode] = useMode(forced)
  const taskSp = task ? findSpecies(task.species) : undefined
  const [freeId, setFreeId] = useState('O2')
  const sp: Species = taskSp ?? findSpecies(freeId) ?? SPECIES[0]
  const info = useMemo(() => speciesInfo(sp), [sp])
  const is1s = sp.kind === '1s'

  const [eStr, setEStr] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [why, setWhy] = useState<number | null>(null)
  const [occ, setOcc] = useState<number[]>([])
  const [boStr, setBoStr] = useState('')
  const [mag, setMag] = useState<'para' | 'dia' | null>(null)
  const [unp, setUnp] = useState('')
  const [stable, setStable] = useState<'yes' | 'no' | null>(null)
  const fam = sp.family ? FAMILIES[sp.family] : undefined
  const [rank, setRank] = useState<string[]>([])
  const [bestE, setBestE] = useState('')
  const [res, setRes] = useState<Record<number, R | undefined>>({})
  const [wrong, setWrong] = useState(0)
  const [checked, setChecked] = useState(false)
  const fired = useRef(false)

  const shownOrder: Order = is1s ? 'normal' : order ?? 'normal'
  const shownLevels = useMemo(() => levelsFor(sp.kind, shownOrder), [sp.kind, shownOrder])
  const nBoxes = shownLevels.reduce((a, l) => a + l.n, 0)

  const reset = () => {
    setEStr(''); setOrder(null); setWhy(null); setOcc(new Array(nBoxes).fill(0)); setBoStr(''); setMag(null); setUnp('')
    setStable(null); setRank(fam ? fam.map(() => '') : []); setBestE(''); setRes({}); setWrong(0); setChecked(false); fired.current = false
  }
  // reset whenever the species changes
  useEffect(() => { reset() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [sp.id])
  // occupancy array must match the layout
  const occ2 = occ.length === nBoxes ? occ : new Array(nBoxes).fill(0)

  const clear = (i: number) => setRes((r) => { const c = { ...r }; delete c[i]; return c })
  const reasonOptions = useMemo(() => {
    if (is1s) return []
    const opts = [{ t: WHY_TEXT[sp.why], c: true }, { t: WRONG_1, c: false }, { t: WRONG_2, c: false }]
    const rot = sp.id.length % 3
    return opts.map((_, i) => opts[(i + rot) % 3])
  }, [sp, is1s])

  /* ---------- evaluation of each step ---------- */
  const Ntrue = info.N
  function evalStep(i: number): R {
    const n: Note[] = []
    if (i === 0) {
      const x = parseNum(eStr)
      const Nn = neutralElectrons(sp)
      if (Number.isFinite(x) && x === Ntrue) {
        n.push({ level: 'ok', msg: is1s
          ? `${Nn}${sp.charge ? (sp.charge > 0 ? ` − ${sp.charge}` : ` + ${-sp.charge}`) : ''} = **${Ntrue}** electrons (for H/He species all electrons are 1s electrons, s102–s108).`
          : `${VALENCE_TXT(sp)} = **${Ntrue}** valence electrons (1s² cores ignored, s118).` })
        return { ok: true, notes: n }
      }
      if (!Number.isFinite(x)) n.push({ level: 'err', msg: 'Enter a whole number of electrons.' })
      else if (!is1s && x === Ntrue + 4) n.push({ level: 'err', msg: `**${x}** includes the two filled 1s² cores. For 2nd-row diatomics the σ1s/σ*1s pair is full and gives no net bonding, so count **valence electrons only** (s118).` })
      else if (sp.charge !== 0 && x === Nn) n.push({ level: 'err', msg: `That is the neutral count. Adjust for the charge: ${sp.charge > 0 ? `a ${sp.charge}+ cation has **lost** ${sp.charge} electron(s)` : `a ${-sp.charge}− anion has **gained** ${-sp.charge} electron(s)`}.` })
      else if (sp.charge !== 0 && x === Nn + sp.charge) n.push({ level: 'err', msg: `Wrong direction: ${sp.charge > 0 ? 'cations lose' : 'anions gain'} electrons. Total = (sum of valence electrons of A and B) ${sp.charge > 0 ? '−' : '+'} ${Math.abs(sp.charge)}.` })
      else n.push({ level: 'hint', msg: `Add the valence electrons of each atom (${sp.A}: ${VAL(sp.A)}, ${sp.B}: ${VAL(sp.B)}), then adjust for the charge.` })
      return { ok: false, notes: n }
    }
    if (i === 1) {
      if (is1s) return { ok: true, notes: [{ level: 'info', msg: 'Only 1s orbitals combine here, so there is just one diagram: σ1s below σ*1s.' }] }
      if (order == null) return { ok: false, notes: [{ level: 'err', msg: 'Choose which ordering applies.' }] }
      if (order !== sp.order) {
        if (sp.order === 'mix') n.push({ level: 'err', msg: `For ${sp.id.includes('^') ? 'this species' : 'this molecule'} the atoms lie **left of O** (Li…N), so s–p mixing puts σ2p **above** π2p (s114–s116).${sp.id === 'B2' ? ' Check: B₂ is paramagnetic (2 unpaired e⁻) only if π2p is below σ2p (s121).' : ''}` })
        else if (sp.why === 'exp') n.push({ level: 'err', msg: 'N alone predicts π2p lower but O predicts σ2p lower, so the slides settle it by experiment: **σ2p is lower** for NO (s129).' })
        else if (sp.why === 'avg') n.push({ level: 'err', msg: 'N and F are each one step away from O, so on average the pair is O-like: σ2p is **below** π2p (s127).' })
        else n.push({ level: 'err', msg: 'For O₂, F₂ and higher Z, s–p mixing is negligible and σ2p lies **below** π2p (s114, s117).' })
        return { ok: false, notes: n }
      }
      const ro = why == null ? undefined : reasonOptions[why]
      if (!ro) { n.push({ level: 'hint', msg: 'Ordering is right. Now pick the reason WHY.' }); return { ok: false, notes: n } }
      if (!ro.c) {
        n.push({ level: 'err', msg: ro.t === WRONG_1
          ? 'Head-on overlap does split σ2p/σ*2p more, but that does not fix the order: σ2p vs π2p is "subtle" (s114) and flips between Li₂–N₂ and O₂–Ne₂.'
          : 'The order is set by the atoms\' atomic number Z (s114: Li₂→N₂ vs O₂, F₂ and above), not by how many electrons the molecule holds.' })
        return { ok: false, notes: n }
      }
      n.push({ level: 'ok', msg: `Right: ${WHY_TEXT[sp.why]}` })
      return { ok: true, notes: n }
    }
    if (i === 2) {
      const ls = levelsFor(sp.kind, order ?? sp.order)
      const o = occ2.length === ls.reduce((a, l) => a + l.n, 0) ? occ2 : new Array(nBoxes).fill(0)
      const d = diagnoseFill(ls, o, Ntrue)
      if (d) return { ok: false, notes: [{ level: 'err', msg: d }] }
      return { ok: true, notes: [{ level: 'ok', msg: `Configuration: $${configTex(ls, o)}$` }] }
    }
    if (i === 3) {
      const x = parseFrac(boStr)
      const { bonding: b, anti: a, bo } = info
      if (Number.isFinite(x) && Math.abs(x - bo) < 1e-9) return { ok: true, notes: [{ level: 'ok', msg: `BO = ½(${b} − ${a}) = **${bo}**${bo === 0 ? ' → no net bonding' : bo % 1 ? ' (BO need not be a whole number, s110)' : ''}.` }] }
      if (!Number.isFinite(x)) n.push({ level: 'err', msg: 'Enter a number such as 2, 1.5 or 3/2.' })
      else if (Math.abs(x - (b - a)) < 1e-9) n.push({ level: 'err', msg: `That is (bonding − antibonding) = ${b} − ${a}. Don't forget the **½**: BO = ½(bonding − antibonding) (s104).` })
      else if (Math.abs(x - (b + a) / 2) < 1e-9) n.push({ level: 'err', msg: 'Antibonding electrons must be **subtracted**, not added.' })
      else if (Math.abs(x - b / 2) < 1e-9) n.push({ level: 'err', msg: 'You ignored the antibonding electrons: they cancel bonding ones.' })
      else n.push({ level: 'hint', msg: `Tally your diagram: bonding electrons = **${b}**, antibonding (starred) = **${a}**. BO = ½(${b} − ${a}).` })
      return { ok: false, notes: n }
    }
    if (i === 4) {
      const u = info.unpaired
      const x = parseNum(unp)
      let ok = true
      if (mag == null) { n.push({ level: 'err', msg: 'Choose paramagnetic or diamagnetic.' }); ok = false }
      else if ((mag === 'para') !== (u > 0)) {
        ok = false
        n.push({ level: 'err', msg: u > 0 ? `There ${u === 1 ? 'is 1 unpaired electron' : `are ${u} unpaired electrons`} (half-filled boxes), so it is **paramagnetic**.` : 'Every electron is paired, so it is **diamagnetic** (no unpaired spins).' })
      }
      if (ok && x !== u) {
        ok = false
        n.push({ level: 'err', msg: `Count the boxes holding a single electron: there ${u === 1 ? 'is' : 'are'} **${u}**${u === 2 && !is1s ? ' (the two degenerate orbitals each hold one, Hund)' : ''}.` })
      }
      if (ok) n.push({ level: 'ok', msg: `${u > 0 ? 'Paramagnetic' : 'Diamagnetic'} with ${u} unpaired electron${u === 1 ? '' : 's'}.${sp.id === 'O2' ? ' A Lewis structure cannot predict this (s124).' : ''}` })
      return { ok, notes: n }
    }
    // step 5: stability + comparison
    const bo = info.bo
    let ok = true
    if (stable == null) { n.push({ level: 'err', msg: 'Decide: does the species exist as a stable molecule?' }); ok = false }
    else if ((stable === 'yes') !== (bo > 0)) {
      ok = false
      n.push({ level: 'err', msg: bo > 0 ? `BO = ${bo} > 0 means net bonding, so it **is** stable (e.g. He₂⁺ with BO ½, s108).` : 'BO = 0: bonding and antibonding electrons cancel, so there is no net bond and it does **not** form (He₂, Be₂, Ne₂; s107, s120).' })
    } else n.push({ level: 'ok', msg: bo > 0 ? `BO ${bo} > 0 → stable.` : 'BO = 0 → no net bonding, does not exist as a stable molecule.' })
    if (fam && bo > 0) {
      const bos = fam.map((id) => ({ id, bo: speciesInfo(findSpecies(id)!).bo }))
      const sel = rank
      const filled = sel.every(Boolean) && new Set(sel).size === fam.length
      let rankOk = filled
      if (!filled) n.push({ level: 'err', msg: 'Rank: pick each species once.' })
      else {
        const seq = sel.map((id) => bos.find((b) => b.id === id)!.bo)
        for (let k = 1; k < seq.length; k++) {
          if (seq[k] > seq[k - 1]) {
            rankOk = false
            n.push({ level: 'err', msg: `Bond length rank: ${dispText(sel[k])} (BO ${seq[k]}) must come **before** ${dispText(sel[k - 1])} (BO ${seq[k - 1]}): higher bond order → shorter bond (L9 s46).` })
            break
          }
        }
      }
      const maxBo = Math.max(...bos.map((b) => b.bo))
      const eOk = !!bestE && bos.find((b) => b.id === bestE)?.bo === maxBo
      if (!bestE) n.push({ level: 'err', msg: 'Choose the species with the highest bond energy.' })
      else if (!eOk) n.push({ level: 'err', msg: `${dispText(bestE)} has BO ${bos.find((b) => b.id === bestE)?.bo}; larger bond order → larger bond energy, so look for BO ${maxBo}.` })
      if (rankOk) n.push({ level: 'ok', msg: 'Bond length order is right: ' + sel.map(dispText).join(' < ').replace(/ < /g, ' ≤ ') + ' (BO ' + bos.slice().sort((a, b) => b.bo - a.bo).map((b) => b.bo).join(', ') + ').' })
      if (rankOk && eOk) n.push({ level: 'ok', msg: `${dispText(bestE)} has the largest bond energy.` })
      ok = ok && rankOk && eOk
    }
    return { ok, notes: n }
  }

  const finish = (correct: boolean, score: number, summary: string) => {
    if (fired.current) return
    fired.current = true
    onResult?.({ correct, score, summary })
    if (task) recordAttempt({ id: `mo:${sp.id}`, lecture: 'L10', topic: 'MO theory', correct, score })
  }

  const stepNames = ['electron count', 'ordering', 'filling', 'bond order', 'magnetism', 'stability / comparison']
  const checkStep = (i: number) => {
    const r = evalStep(i)
    setRes((p) => ({ ...p, [i]: r }))
    if (!r.ok) setWrong((w) => w + 1)
    if (r.ok && i === 5 && mode === 'learn') {
      const w = wrong
      finish(w === 0, Math.max(0, 1 - 0.15 * w), w === 0 ? `${sp.id}: all steps correct` : `${sp.id}: done with ${w} wrong attempt(s)`)
    }
  }
  const checkAll = () => {
    const rs: Record<number, R> = {}
    for (let i = 0; i < 6; i++) rs[i] = evalStep(i)
    setRes(rs); setChecked(true)
    const bad = [0, 1, 2, 3, 4, 5].filter((i) => !rs[i].ok)
    finish(bad.length === 0, (6 - bad.length) / 6, bad.length === 0 ? `${sp.id}: all steps correct` : `${sp.id}: wrong in ${bad.map((i) => stepNames[i]).join(', ')}`)
  }

  const isOk = (i: number) => (i === 1 && is1s ? true : !!res[i]?.ok)
  const status = (i: number): StepStatus => {
    if (mode === 'learn') {
      if (i > 0 && !isOk(i - 1)) return 'locked'
      if (isOk(i)) return 'done'
      return res[i] ? 'error' : 'active'
    }
    if (!checked) return 'active'
    return isOk(i) ? 'done' : 'error'
  }
  const notes = (i: number): Note[] => (i === 1 && is1s ? res[1]?.notes ?? [{ level: 'info', msg: 'Only 1s orbitals combine here, so there is just one diagram: σ1s below σ*1s.' }] : res[i]?.notes ?? [])
  const btn = (i: number) => mode === 'learn' && status(i) !== 'done' && !(i === 1 && is1s) && (
    <div className="mo-check"><button className="btn primary sm" onClick={() => checkStep(i)}>Check step {i + 1}</button></div>
  )

  const toggleBox = (idx: number) => {
    if (status(2) === 'locked') return
    setOcc(() => { const a = occ2.slice(); a[idx] = (a[idx] + 1) % 3; return a })
    clear(2)
  }
  const placed = occ2.reduce((a, b) => a + b, 0)
  const live = tally(shownLevels, occ2)
  const showAnswer = () => {
    const ls = levelsFor(sp.kind, sp.order)
    setOrder(sp.order); setOcc(fillExpected(ls, Ntrue))
  }

  const grouped = useMemo(() => {
    const g: Record<string, Species[]> = {}
    SPECIES.forEach((s) => { (g[s.group] ??= []).push(s) })
    return g
  }, [])

  const exp = info
  const allDone = mode === 'learn' ? isOk(5) : checked
  const nbad = [0, 1, 2, 3, 4, 5].filter((i) => !isOk(i)).length

  return (
    <Workbench title="MO diagram workbench" mode={mode} onMode={setMode} onReset={reset} compact={compact}
      subtitle={<>Build the molecular-orbital diagram of <b><Formula f={sp.id} /></b> <SlideRef l="L10" s={116} /></>}
      tools={!task && (
        <select className="mo-select" value={sp.id} onChange={(e) => setFreeId(e.target.value)} aria-label="Species">
          {Object.entries(grouped).map(([g, list]) => (
            <optgroup key={g} label={g}>{list.map((s) => <option key={s.id} value={s.id}>{dispText(s.id)}</option>)}</optgroup>
          ))}
        </select>
      )}>
      <div className={'mo-layout' + (compact ? ' compact' : '')}>
        <div className="mo-left">
          <MoDiagram sp={sp} order={shownOrder} occ={occ2} onBox={toggleBox} readOnly={status(2) === 'locked'} />
          <div className="mo-tally">
            <span className="chip">placed {placed} e⁻</span>
            <span className="chip" title="electrons in bonding MOs">bonding {live.bonding}</span>
            <span className="chip" title="electrons in starred MOs">antibonding {live.anti}</span>
            <button className="btn ghost sm" onClick={() => { setOcc(new Array(nBoxes).fill(0)); clear(2) }}>Clear</button>
            {!task && <button className="btn ghost sm" onClick={showAnswer} title="Free exploration only">Show solution</button>}
          </div>
          <p className="mo-hint">Click an orbital box: 1st click adds ↑, 2nd adds ↓, 3rd empties it. AO electrons are those of the neutral atoms{sp.A !== sp.B ? '; the more electronegative atom sits lower.' : '.'}{sp.beyond ? ' This species goes beyond the slides.' : ''}</p>
        </div>

        <div className="mo-right">
          <Step n={1} title={<>Count the {is1s ? 'electrons' : 'valence electrons'} of <Formula f={sp.id} /></>} status={status(0)} notes={notes(0)}>
            <div className="row">
              <NumInput value={eStr} onChange={(s) => { setEStr(s); clear(0) }} placeholder="e.g. 12" width={90} unit="e⁻" state={mode === 'learn' || checked ? (res[0] ? (res[0].ok ? 'ok' : 'err') : null) : null} />
              <span className="muted mo-small">{is1s ? 'H/He species: all electrons are 1s (s102–s108).' : 'Ignore the 1s² cores (s118); adjust for charge.'}</span>
            </div>
            {btn(0)}
          </Step>

          <Step n={2} title={is1s ? 'Choose the diagram' : <>Which ordering applies, and why?</>} status={status(1)} notes={notes(1)}>
            {is1s ? <p className="mo-small muted">Only 1s orbitals combine: σ1s (bonding) below σ*1s (antibonding).</p> : (
              <>
                <div className="mo-opts">
                  {(['mix', 'normal'] as Order[]).map((o) => (
                    <button key={o} className={'mo-opt' + (order === o ? ' on' : '')} onClick={() => { setOrder(o); setOcc(new Array(nBoxes).fill(0)); clear(1); clear(2) }}>{ORDER_LABEL[o]}</button>
                  ))}
                </div>
                <div className="mo-why">
                  <b>Why?</b>
                  {reasonOptions.map((r, k) => (
                    <label key={k} className={'mo-radio' + (why === k ? ' on' : '')}>
                      <input type="radio" name="mo-why" checked={why === k} onChange={() => { setWhy(k); clear(1) }} />
                      <span>{r.t}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
            {btn(1)}
          </Step>

          <Step n={3} title="Fill the MOs with electrons (Aufbau, Pauli, Hund)" status={status(2)} notes={notes(2)}>
            <p className="mo-small muted">Click the boxes in the diagram. Rules (s103): lowest energy first · max 2 per orbital, spins paired · spread over degenerate orbitals first.</p>
            {btn(2)}
          </Step>

          <Step n={4} title={<>Bond order = ½(bonding − antibonding)</>} status={status(3)} notes={notes(3)}>
            <div className="row">
              <Tex>{'\\text{BO}='}</Tex>
              <NumInput value={boStr} onChange={(s) => { setBoStr(s); clear(3) }} placeholder="e.g. 2.5" width={90} state={mode === 'learn' || checked ? (res[3] ? (res[3].ok ? 'ok' : 'err') : null) : null} />
            </div>
            {btn(3)}
          </Step>

          <Step n={5} title="Magnetism" status={status(4)} notes={notes(4)}>
            <div className="row">
              <div className="seg">
                <button className={mag === 'para' ? 'on' : ''} onClick={() => { setMag('para'); clear(4) }}>Paramagnetic</button>
                <button className={mag === 'dia' ? 'on' : ''} onClick={() => { setMag('dia'); clear(4) }}>Diamagnetic</button>
              </div>
              <span className="mo-small">unpaired e⁻:</span>
              <NumInput value={unp} onChange={(s) => { setUnp(s); clear(4) }} placeholder="0" width={64} />
            </div>
            {btn(4)}
          </Step>

          <Step n={6} title="Stability and comparison" status={status(5)} notes={notes(5)}>
            <div className="row">
              <span className="mo-small">Does <Formula f={sp.id} /> exist as a stable species?</span>
              <div className="seg">
                <button className={stable === 'yes' ? 'on' : ''} onClick={() => { setStable('yes'); clear(5) }}>Yes</button>
                <button className={stable === 'no' ? 'on' : ''} onClick={() => { setStable('no'); clear(5) }}>No (BO = 0)</button>
              </div>
            </div>
            {fam && info.bo > 0 && (
              <div className="mo-rank">
                <p className="mo-small"><b>Compare the family</b> — rank by <b>bond length, shortest first</b>:</p>
                <div className="row">
                  {fam.map((_, k) => (
                    <select key={k} className="mo-select" value={rank[k] ?? ''} onChange={(e) => { const r = rank.slice(); r[k] = e.target.value; setRank(r); clear(5) }}>
                      <option value="">#{k + 1}</option>
                      {fam.map((id) => <option key={id} value={id}>{dispText(id)}</option>)}
                    </select>
                  ))}
                </div>
                <div className="row">
                  <span className="mo-small">Highest bond energy:</span>
                  <select className="mo-select" value={bestE} onChange={(e) => { setBestE(e.target.value); clear(5) }}>
                    <option value="">choose…</option>
                    {fam.map((id) => <option key={id} value={id}>{dispText(id)}</option>)}
                  </select>
                </div>
              </div>
            )}
            {btn(5)}
          </Step>

          {mode === 'test' && !checked && <div className="mo-check"><button className="btn primary" onClick={checkAll}>Check all</button></div>}
          {allDone && (
            <Verdict correct={nbad === 0 ? true : mode === 'test' && nbad < 6 ? 'partial' : false} title={nbad === 0 ? `Correct: ${dispText(sp.id)} has BO ${exp.bo}` : `${6 - nbad}/6 steps correct`}>
              <span>
                <Tex>{configTex(levelsFor(sp.kind, sp.order), exp.occ)}</Tex>, BO = {exp.bo}, {exp.unpaired > 0 ? `paramagnetic (${exp.unpaired} unpaired)` : 'diamagnetic'}.
              </span>
              {fam && sp.family === 'no' && (
                <span className="mo-small">Slide s131: {Object.entries(NO_TABLE).map(([k, v]) => `${dispText(k)} BO ${v.bo}, ${v.len} pm, ${v.energy} kJ/mol`).join(' · ')}.</span>
              )}
            </Verdict>
          )}
          {mode === 'test' && checked && nbad > 0 && <Feedback notes={[0, 1, 2, 3, 4, 5].filter((i) => !isOk(i)).map((i) => ({ level: 'err' as const, msg: `**Step ${i + 1} (${stepNames[i]}):** ${(res[i]?.notes[0]?.msg) ?? ''}` }))} />}
        </div>
      </div>
      <Compare current={sp.id} onPick={task ? undefined : (id) => setFreeId(id)} compact={compact} />
    </Workbench>
  )
}

const VAL = (s: string) => ({ H: 1, He: 2, Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8 } as Record<string, number>)[s]
function VALENCE_TXT(sp: Species) {
  const base = `${VAL(sp.A)} + ${VAL(sp.B)}`
  return sp.charge === 0 ? base : `${base} ${sp.charge > 0 ? '−' : '+'} ${Math.abs(sp.charge)}`
}
// keep helpers referenced for tree-shaking friendliness
void levelTex; void unpaired
