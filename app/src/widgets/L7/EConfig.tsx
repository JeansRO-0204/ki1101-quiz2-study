import { useMemo, useState } from 'react'
import './l7.css'
import { Workbench, useMode, type Note } from '../../lib/kit'
import type { WidgetProps, Tasks } from '../../types'
import { ELEMENTS, AUFBAU, CAP, IS_EXCEPTION, aufbau, el, configString } from '../../lib/chem/elements'
import { StepRunner, type StepDef } from './StepRunner'
import { Cfg, PTGrid, sup, chargeStr } from './shared'

type CfgMap = Record<string, number>
type Box = { u: number; d: number }
const NOBLE = [2, 10, 18, 36, 54, 86]
const nOf = (s: string) => +s[0]
const lOf = (s: string) => 'spdf'.indexOf(s[1])
const toMap = (c: [string, number][]): CfgMap => Object.fromEntries(c.filter(([, k]) => k > 0))
const sameCfg = (a: CfgMap, b: CfgMap) => AUFBAU.every((s) => (a[s] ?? 0) === (b[s] ?? 0))
const total = (m: CfgMap) => Object.values(m).reduce((a, b) => a + b, 0)
const subLabel = (s: string) => s

function targetConfig(Z: number, q: number): CfgMap {
  if (q <= 0) return toMap(el(Math.min(118, Z - q))!.config)
  const m = { ...toMap(el(Z)!.config) }
  const order = Object.keys(m).sort((a, b) => nOf(b) - nOf(a) || lOf(b) - lOf(a))
  let left = q
  for (const s of order) { const t = Math.min(m[s], left); m[s] -= t; left -= t; if (left <= 0) break }
  return toMap(Object.entries(m))
}
/** the common wrong approach: remove electrons in reverse Aufbau order (3d before 4s) */
function revAufbauCation(Z: number, q: number): CfgMap {
  const m = { ...toMap(el(Z)!.config) }
  const order = Object.keys(m).sort((a, b) => AUFBAU.indexOf(b) - AUFBAU.indexOf(a))
  let left = q
  for (const s of order) { const t = Math.min(m[s], left); m[s] -= t; left -= t; if (left <= 0) break }
  return toMap(Object.entries(m))
}
const unpairedOf = (m: CfgMap) => Object.entries(m).reduce((a, [s, k]) => { const b = 2 * lOf(s) + 1; return a + (k <= b ? k : 2 * b - k) }, 0)
function valenceAccepted(T: CfgMap, Z: number, q: number): number[] {
  const e = el(Z)!
  const maxN = Math.max(...Object.keys(T).map(nOf))
  if (e.block === 'd' || e.block === 'f') {
    const n = e.period
    const v = (T[`${n}s`] ?? 0) + (T[`${n - 1}d`] ?? 0) + (e.block === 'f' ? (T[`${n - 2}f`] ?? 0) : 0)
    return e.group === 12 && q === 0 ? [v, 2] : [v]
  }
  const v = Object.entries(T).filter(([s]) => nOf(s) === maxN).reduce((a, [, k]) => a + k, 0)
  const d = T[`${maxN}d`] ?? 0
  return d ? [v, v - d] : [v]
}
const excNote = (Z: number): string => {
  const s = el(Z)!.symbol
  if (Z === 24 || Z === 42) return `**Exception (${s})**: 4s/5s¹ and half-filled d⁵: a half-filled d subshell (every d box singly occupied, parallel spins) is extra stable and the ns and (n−1)d energies are very close, so one s electron moves into d.`
  if (Z === 29 || Z === 47 || Z === 79) return `**Exception (${s})**: a completely filled d¹⁰ subshell is extra stable, so one s electron moves into d: (n−1)d¹⁰ ns¹ instead of d⁹ ns².`
  if (Z === 46) return '**Exception (Pd)**: [Kr] 4d¹⁰ (5s⁰): a filled d subshell wins. (Beyond the slides.)'
  return `**Exception (${s})**: the real ground state differs from simple Aufbau because nearly degenerate orbitals favour half-filled/filled subshells. (Beyond the slides: memorise Cr, Cu and the usual 4d/5d cases.)`
}

function validateBoxes(boxes: Record<string, Box[]>, subs: string[]) {
  const notes: Note[] = []
  const badBox = new Set<string>(), badRow = new Set<string>()
  for (const s of subs) {
    const bs = boxes[s] ?? []
    bs.forEach((b, i) => {
      if (b.u > 1 || b.d > 1) { badBox.add(`${s}-${i}`); notes.push({ level: 'err', msg: `**Pauli:** ${s} box ${i + 1} holds two ${b.u > 1 ? '↑' : '↓'} electrons. Two electrons in the same box must have opposite spins (↑↓).` }) }
    })
    if (bs.length > 1) {
      const emptyBox = bs.some((b) => b.u + b.d === 0)
      const paired = bs.some((b) => b.u >= 1 && b.d >= 1)
      if (emptyBox && paired) { badRow.add(s); notes.push({ level: 'err', msg: `**Hund:** put one electron in each ${s} box before pairing. An empty ${s} box remains while another is doubly occupied.` }) }
      const singles = bs.filter((b) => b.u + b.d === 1)
      if (singles.some((b) => b.u === 1) && singles.some((b) => b.d === 1)) { badRow.add(s); notes.push({ level: 'err', msg: `**Hund:** the unpaired ${s} electrons must all have the same spin (parallel, e.g. all ↑); here ↑ and ↓ are mixed.` }) }
    }
  }
  return { notes, badBox, badRow }
}

function diagnose(C: CfgMap, Z: number, q: number): Note[] {
  const T = targetConfig(Z, q)
  const N = Z - q
  const sym = el(Z)!.symbol
  const ion = `${sym}${chargeStr(q) ? chargeStr(q).replace(/^1/, '') : ''}`
  const tot = total(C)
  if (tot !== N) {
    const how = q === 0 ? `${sym} has Z = ${Z} electrons` : `${ion} has ${Z} ${q > 0 ? '−' : '+'} ${Math.abs(q)} = ${N} electrons (${q > 0 ? 'cation: lost' : 'anion: gained'} ${Math.abs(q)})`
    return [{ level: tot > N ? 'err' : 'info', msg: `You have ${tot} electron${tot === 1 ? '' : 's'}; ${how}.` }]
  }
  if (sameCfg(C, T)) return []
  const out: Note[] = []
  if (q > 0) {
    if (sameCfg(C, revAufbauCation(Z, q))) out.push({ level: 'err', msg: `Cations lose electrons from the **highest n first**, so ${Object.keys(toMap(el(Z)!.config)).sort((a, b) => nOf(b) - nOf(a))[0]} electrons go before (n−1)d. You removed them in reverse Aufbau order.` })
    else out.push({ level: 'err', msg: `Write the neutral ${sym} configuration first, then remove ${q} electron${q > 1 ? 's' : ''} from the highest-n shell (for p-block: np before ns; for transition metals: ns before (n−1)d). That gives ${configString2(T)}.` })
    return out
  }
  if (q === 0 && IS_EXCEPTION(Z) && sameCfg(C, toMap(aufbau(Z)))) return [{ level: 'err', msg: `That is the plain Aufbau result, but ${sym} is a known exception: the true ground state is ${configString2(T)}. ${excNote(Z)}` }]
  const under = AUFBAU.filter((s) => (C[s] ?? 0) < (T[s] ?? 0))
  const over = AUFBAU.filter((s) => (C[s] ?? 0) > (T[s] ?? 0))
  if (under.length && over.length) {
    const a = under[0], b = over[over.length - 1]
    out.push({ level: 'err', msg: `Aufbau: you put electrons in ${b} while ${a} (lower energy) still needed them. Order: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p…${a === '4s' && b === '3d' ? ' (you filled 3d before 4s)' : ''}` })
  } else out.push({ level: 'err', msg: `Not the ground state: expected ${configString2(T)}.` })
  if (q < 0) out.push({ level: 'hint', msg: `An anion keeps adding electrons by Aufbau up to ${N} in total; ${ion} reaches the noble-gas configuration ${configString2(T)}.` })
  return out
}
function configString2(T: CfgMap): string {
  return AUFBAU.filter((s) => T[s]).map((s) => s + sup(T[s])).join(' ')
}

function parseConfig(raw: string): { map: CfgMap; err?: string } {
  let s = raw.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (d) => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(d))).replace(/[\^{}_]/g, '').replace(/([spdf])\s+(\d)/g, '$1$2')
  const map: CfgMap = {}
  const core = s.match(/\[\s*(He|Ne|Ar|Kr|Xe|Rn)\s*\]/i)
  if (core) {
    const sym = core[1][0].toUpperCase() + core[1].slice(1).toLowerCase()
    for (const [k, v] of el(sym)!.config) map[k] = v
    s = s.replace(core[0], ' ')
  }
  const re = /([1-7])([spdf])(\d{1,2})/g
  let m: RegExpExecArray | null
  const seen = new Set<string>()
  while ((m = re.exec(s))) {
    const sub = m[1] + m[2]
    if (!AUFBAU.includes(sub)) return { map, err: `${sub} is not a real subshell (l < n).` }
    if (seen.has(sub) || (core && map[sub] != null)) return { map, err: `${sub} is listed twice.` }
    seen.add(sub)
    if (+m[3] > CAP[m[2]]) return { map, err: `${sub} holds at most ${CAP[m[2]]} electrons, not ${m[3]}.` }
    map[sub] = +m[3]
  }
  const rest = s.replace(re, '').replace(/\s/g, '')
  if (rest) return { map, err: `I couldn’t read “${rest}”. Write like [Ar] 4s2 3d6 (each subshell followed by its electron count).` }
  if (!Object.keys(map).length) return { map, err: 'Type a configuration such as [Ar] 4s2 3d6.' }
  return { map }
}

export default function EConfig(props: WidgetProps<Tasks['econfig']>) {
  const task = props.task
  const [mode, setMode] = useMode(props.mode, 'chem.mode.econfig')
  const [sym, setSym] = useState(task?.element ?? 'Fe')
  const [q, setQ] = useState(task?.charge ?? 0)
  const [tool, setTool] = useState<'auto' | 'up' | 'down' | 'erase'>('auto')
  const [boxes, setBoxes] = useState<Record<string, Box[]>>({})
  const [text, setText] = useState('')
  const [showPT, setShowPT] = useState(false)
  const [corePref, setCorePref] = useState<boolean | null>(null) // null = automatic (on above Ar, off for small atoms)
  const [nonce, setNonce] = useState(0)
  const e = el(sym) ?? el('Fe')!
  const Z = e.z
  const N = Z - q
  const T = useMemo(() => targetConfig(Z, q), [Z, q])

  // core pre-fill
  const cz = [...NOBLE].reverse().find((n) => n < Z) ?? 0
  const coreSubs = cz && Z > 2 && N >= cz ? Object.keys(toMap(el(cz)!.config)) : []
  const coreUsable = coreSubs.length > 0 && coreSubs.every((s) => (T[s] ?? 0) === CAP[s[1]])
  const coreOn = corePref ?? Z > 18
  const useCore = coreUsable && coreOn
  const coreMap: CfgMap = useCore ? toMap(el(cz)!.config) : {}
  const subs = useMemo(() => {
    const mz = Math.min(118, Math.max(Z, N))
    const last = Math.max(...el(mz)!.config.map(([s]) => AUFBAU.indexOf(s)))
    let end = last
    while (end < AUFBAU.length - 1 && AUFBAU[end][1] !== 'p') end++
    if (AUFBAU[last][1] === 'p') end = last
    return AUFBAU.slice(0, end + 1).filter((s) => !(s in coreMap))
  }, [Z, N, useCore]) // eslint-disable-line react-hooks/exhaustive-deps
  const getBoxes = (s: string): Box[] => boxes[s] ?? Array.from({ length: 2 * lOf(s) + 1 }, () => ({ u: 0, d: 0 }))
  const click = (s: string, i: number) => {
    setBoxes((p) => {
      const bs = (p[s] ?? getBoxes(s)).map((b) => ({ ...b }))
      const b = bs[i]
      const tot = b.u + b.d
      if (tool === 'erase') { b.u = 0; b.d = 0 }
      else if (tool === 'auto') { if (b.u === 1 && b.d === 0) b.d = 1; else if (tot === 0) b.u = 1; else { b.u = 0; b.d = 0 } }
      else if (tot < 2) { if (tool === 'up') b.u++; else b.d++ }
      return { ...p, [s]: bs }
    })
  }
  const placed: CfgMap = { ...coreMap }
  for (const s of subs) { const k = getBoxes(s).reduce((a, b) => a + b.u + b.d, 0); if (k) placed[s] = k }
  const val = validateBoxes(boxes, subs)
  const sameAsTarget = sameCfg(placed, T)

  const boxNotes = (live: boolean): Note[] => {
    const out: Note[] = [...val.notes]
    const diag = diagnose(placed, Z, q)
    const tot = total(placed)
    if (live && q <= 0 && !sameAsTarget) {
      const early = AUFBAU.find((s, i) => (placed[s] ?? 0) < Math.min(T[s] ?? 0, CAP[s[1]]) && AUFBAU.slice(i + 1).some((s2) => (placed[s2] ?? 0) > 0 && !(s2 in coreMap) && (placed[s2] ?? 0) > (T[s2] ?? 0) - 0 && (placed[s2] ?? 0) > 0))
      const late = early ? AUFBAU.slice(AUFBAU.indexOf(early) + 1).find((s2) => (placed[s2] ?? 0) > 0 && (T[s2] ?? 0) < (placed[s2] ?? 0)) : undefined
      if (early && late && tot <= N) out.push({ level: 'warn', msg: `Aufbau: you have ${late} electrons but ${early} (lower energy) isn’t filled yet. Fill ${early} first.` })
    }
    out.push(...diag.filter((d) => !(live && d.level === 'info' && tot < N && false)))
    if (!out.length && sameAsTarget) out.push({ level: 'ok', msg: `Matches the ground state of ${e.symbol}${q ? chargeStr(q) : ''}: ${configString2(T)}.` })
    if (live && tot < N && !out.some((n) => n.level === 'info')) out.push({ level: 'info', msg: `${tot} of ${N} electrons placed.` })
    return out
  }
  const checkBoxes = () => {
    const notes = boxNotes(false)
    const ok = sameAsTarget && val.notes.length === 0
    if (ok && q === 0 && IS_EXCEPTION(Z)) notes.push({ level: 'info', msg: excNote(Z) })
    if (ok && q > 0) notes.push({ level: 'info', msg: 'Cation rule (L8): electrons leave the highest-n shell first: ns before (n−1)d for transition metals; np before ns for p-block metals.' })
    return { ok, notes: ok ? notes.filter((n) => n.level !== 'info' || n.msg.startsWith('**') || n.msg.startsWith('Cation')) : notes }
  }
  const checkText = () => {
    const p = parseConfig(text)
    if (p.err) return { ok: false, notes: [{ level: 'err', msg: p.err } as Note] }
    const d = diagnose(p.map, Z, q)
    return d.length ? { ok: false, notes: d.map((x) => (x.level === 'info' ? { ...x, level: 'err' as const } : x)) } : { ok: true, notes: [{ level: 'ok', msg: `Correct: ${condensed(T)}` } as Note] }
  }
  const condensed = (m: CfgMap) => {
    const core = [...NOBLE].reverse().find((n) => n < Math.max(Z, N) && el(n)!.config.every(([s, k]) => (m[s] ?? 0) === k))
    const rest = AUFBAU.filter((s) => m[s] && !(core && el(core)!.config.some(([c]) => c === s))).map((s) => s + sup(m[s])).join(' ')
    return core ? `[${el(core)!.symbol}] ${rest}`.trim() : rest
  }
  const ionLabel = <>{e.symbol}{q !== 0 && <sup>{chargeStr(q)}</sup>}</>
  const val_ok = valenceAccepted(T, Z, q)
  const unp = unpairedOf(T)

  const steps: StepDef[] = []
  if (q !== 0) steps.push({ kind: 'num', id: 'N', title: <>How many electrons does {ionLabel} have?</>, answer: N, tol: { abs: 0.01 }, unit: 'e⁻',
    extra: (v) => (v === Z + q ? `${q > 0 ? 'Cations have LOST' : 'Anions have GAINED'} electrons: ${q > 0 ? 'Z − charge' : 'Z + |charge|'}, not ${Z} ${q > 0 ? '+' : '−'} ${Math.abs(q)}.` : v === Z ? 'That is the neutral atom. Adjust for the charge: electrons = Z − charge.' : null),
    explain: `N = Z − charge = ${Z} − (${q > 0 ? '+' : ''}${q}) = ${N}.`, hint: 'Electrons = Z − charge (a 2− ion has two MORE electrons).' })
  steps.push({
    kind: 'custom', id: 'boxes', title: <>Fill the orbital boxes for {ionLabel} ({N} electrons)</>,
    hint: q > 0 ? 'Build the neutral atom’s filling first, then remove electrons from the highest n.' : q < 0 ? 'Add electrons by Aufbau until you reach the total; the anion becomes isoelectronic with a noble gas.' : 'Aufbau: lowest energy first (1s 2s 2p 3s 3p 4s 3d 4p …), Hund: one per box first, Pauli: opposite spins.',
    check: checkBoxes, live: () => boxNotes(true),
    render: () => (
      <div>
        <div className="row" style={{ marginBottom: 6 }}>
          <div className="seg">{([['auto', 'Click: ↑ → ↑↓ → clear'], ['up', '+ ↑'], ['down', '+ ↓'], ['erase', 'Erase']] as const).map(([k, l]) => <button key={k} className={tool === k ? 'on' : ''} onClick={() => setTool(k)}>{l}</button>)}</div>
          <button className="btn ghost sm" onClick={() => setBoxes({})}>Clear all</button>
          {coreUsable
            ? <label className="ec-coretoggle" title="Noble-gas shorthand: start from the filled core instead of drawing every inner box"><input type="checkbox" checked={coreOn} onChange={(ev) => { setCorePref(ev.target.checked); setBoxes({}) }} /> Noble-gas shorthand: start from [{el(cz)!.symbol}] core</label>
            : <span className="muted" style={{ fontSize: 12 }}>No noble-gas core to abbreviate for {ionLabel}.</span>}
        </div>
        <div className="ec-axis">↑ higher energy</div>
        <div className="ec-ladder">
          {[...subs].reverse().map((s) => (
            <div key={s} className={'ec-row' + (val.badRow.has(s) ? ' bad' : '')}>
              <span className="ec-lab">{subLabel(s)}</span>
              {getBoxes(s).map((b, i) => (
                <button key={i} className={'ec-box' + (val.badBox.has(`${s}-${i}`) ? ' bad' : '')} onClick={() => click(s, i)} aria-label={`${s} box ${i + 1}`}>
                  {'↑'.repeat(b.u)}{'↓'.repeat(b.d)}
                </button>
              ))}
              <span className="ec-cnt">{placed[s] ? `${s}${sup(placed[s])}` : ''}</span>
            </div>
          ))}
          {useCore && <div className="ec-core">[{el(cz)!.symbol}] core: {cz} electrons already filled ({Object.keys(coreMap).join(' ')})</div>}
        </div>
        <div className="ec-axis">↓ lower energy &nbsp; · placed {total(placed)} / {N}</div>
      </div>),
  })
  steps.push({
    kind: 'custom', id: 'text', title: <>Write the condensed configuration of {ionLabel}</>, hint: 'Use a noble-gas core, e.g. [Ar] 4s2 3d6 (either order of 4s/3d is accepted; write 4s2 or 4s^2).',
    check: checkText,
    render: () => (
      <div className="row">
        <input className="ec-text" value={text} onChange={(ev) => setText(ev.target.value)} placeholder={cz && Z > 2 ? `[${el(cz)!.symbol}] …` : '1s2 …'} spellCheck={false} />
        {coreUsable && <button className="btn sm" onClick={() => setText((t) => (t.includes('[') ? t : `[${el(cz)!.symbol}] ${t}`.trimEnd() + ' '))} title="Insert the noble-gas core">Insert [{el(cz)!.symbol}]</button>}
      </div>),
  })
  steps.push({ kind: 'num', id: 'val', title: 'How many valence electrons?', unit: 'e⁻', answer: val_ok[0], tol: { abs: 0.01 },
    prompt: 'Convention here: outermost shell (highest n) for s/p-block; for d-block count ns + (n−1)d.',
    extra: (v) => val_ok.includes(v) ? null : e.block === 'd' ? 'Transition metals: count the ns AND the (n−1)d electrons (beyond the noble-gas core).' : v === total(T) ? 'Count only the outermost shell, not the whole atom.' : 'Count electrons in the highest-n shell (the electrons beyond the noble-gas core, excluding filled d/f).',
    explain: `Valence electrons: ${val_ok[0]}.` })
  steps.push({ kind: 'num', id: 'unp', title: 'How many unpaired electrons?', unit: 'e⁻', answer: unp, tol: { abs: 0.01 },
    hint: 'Hund: electrons in a partly filled subshell sit singly with parallel spins. Count the single arrows.', explain: `${unp} unpaired electron${unp === 1 ? '' : 's'}.` })
  steps.push({ kind: 'choice', id: 'mag', title: 'Paramagnetic or diamagnetic?', answer: unp > 0 ? 'para' : 'dia',
    options: [{ value: 'para', label: 'Paramagnetic' }, { value: 'dia', label: 'Diamagnetic' }],
    wrong: unp > 0 ? { dia: `There are ${unp} unpaired electrons, so it is attracted by a magnetic field: paramagnetic.` } : { para: 'No unpaired electrons: all spins paired → diamagnetic (weakly repelled).' },
    explain: unp > 0 ? 'Unpaired electrons → paramagnetic.' : 'All paired → diamagnetic.' })

  const reset = () => { setBoxes({}); setText(''); setNonce((n) => n + 1) }
  const setEl = (s: string) => { setSym(s); setQ(0); reset(); setShowPT(false) }
  const setCharge = (v: number) => { setQ(v); reset() }
  const qMin = -Math.min(4, Z - 0) , qMax = Math.min(8, Z - 1)

  return (
    <Workbench title="Electron configuration filler" subtitle="Aufbau · Pauli · Hund" compact={props.compact} mode={props.mode ? undefined : mode} onMode={setMode} onReset={reset}>
      {task ? <p style={{ marginTop: 0 }}><b>Task:</b> electron configuration of <b>{ionLabel}</b> (Z = {Z}, {N} electrons).</p> : (
        <div className="ec-pick">
          <select value={sym} onChange={(ev) => setEl(ev.target.value)}>{ELEMENTS.slice(0, 118).map((x) => <option key={x.z} value={x.symbol}>{x.z} {x.symbol}, {x.name}</option>)}</select>
          <div className="qn-step"><button onClick={() => setCharge(Math.max(qMin, q - 1))} aria-label="more negative">−</button><b style={{ minWidth: 48 }}>{q === 0 ? '0' : chargeStr(q)}</b><button onClick={() => setCharge(Math.min(qMax, q + 1))} aria-label="more positive">+</button></div>
          <button className="btn sm" onClick={() => setShowPT((s) => !s)}>{showPT ? 'Hide table' : 'Periodic table'}</button>
          <span className="chip">{ionLabel}: {N} e⁻</span>
        </div>)}
      {showPT && !task && (
        <div className="l7-ptwrap" style={{ overflowX: 'auto', marginBottom: 10 }}>
          <PTGrid maxZ={86} cell={30} render={(x) => (
            <span className="ec-pt" style={{ display: 'contents' }}><button className={x.symbol === sym ? 'on' : ''} onClick={() => setEl(x.symbol)} title={x.name}>{x.symbol}</button></span>)} />
        </div>)}
      <p className="muted" style={{ margin: '0 0 6px', fontSize: 13 }}>Slides: L8 s13–s24 (ions), L7 s39 (blocks). Convention: valence = outermost shell (d-block: ns + (n−1)d).</p>
      <StepRunner steps={steps} mode={mode} resetKey={`${sym}-${q}-${nonce}-${mode}-${coreOn}`} final={!!task} onFinal={(r) => props.onResult?.(r)} />
    </Workbench>
  )
}
