import { useMemo, useState } from 'react'
import type { WidgetProps } from '../../types'
import { Workbench, useMode, Step, Verdict, NumInput, Formula, SlideRef, type Note } from '../../lib/kit'
import { analyze, findSpecies, HYB_LABEL, HYB_ANGLE, SPECIES, ligandSummary, type Hyb, type Info } from './species'
import { domainDirs } from './geom'
import { Axe, Choice, SpeciesPicker, useReportOnce, useStepper, type StepResult, unicodeFormula } from './shared'

type Kind = 's' | 'p' | 'd'
interface Orb { kind: Kind; label: string }
const RANK: Record<Kind, number> = { s: 0, p: 1, d: 2 }
const D_NAMES = ['d_z²', 'd_x²−y²', 'd_xy', 'd_xz', 'd_yz']
const YLVL: Record<Kind, number> = { s: 205, p: 130, d: 55 }
const HYBS: Hyb[] = ['sp', 'sp2', 'sp3', 'sp3d', 'sp3d2']

function orbitalsFor(i: Info): Orb[] {
  const leftoverP = 3 - Math.min(3, i.dom - 1)
  const extraD = Math.max(0, i.piC - leftoverP)
  const nd = i.period >= 3 ? Math.min(5, Math.max(0, i.dom - 4) + extraD) : 0
  const n = i.period
  return [
    { kind: 's', label: `${n}s` },
    ...['x', 'y', 'z'].map((a): Orb => ({ kind: 'p', label: `${n}p${a}` })),
    ...Array.from({ length: nd }, (_, k): Orb => ({ kind: 'd', label: `${n}${D_NAMES[k]}` })),
  ]
}
function groundFill(ce: number, orbs: Orb[]): number[] {
  const e = orbs.map(() => 0)
  let r = ce
  const put = (idxs: number[], cap: 1 | 2) => { for (const k of idxs) { if (r > 0 && e[k] < cap) { e[k]++; r-- } } }
  e[0] = Math.min(2, r); r -= e[0]
  const ps = [1, 2, 3], ds = orbs.map((_, k) => k).filter((k) => k > 3)
  put(ps, 1); put(ps, 2); put(ds, 1); put(ds, 2)
  return e
}
const Arrows = ({ n }: { n: number }) => (n === 0 ? '' : n === 1 ? '↑' : '↑↓')

function composition(dom: number) { return { s: 1, p: Math.min(3, dom - 1), d: Math.max(0, dom - 4) } }

/* ------------- SVG energy diagram ------------- */
type Tool = 'promote' | 'mix' | 'fill' | 'none'
function Diagram({ orbs, e, src, mix, hybN, fill, tool, onOrb, onHyb, hybLabel }: {
  orbs: Orb[]; e: number[]; src: number | null; mix: number[]; hybN: number; fill: number[]; tool: Tool
  onOrb: (i: number) => void; onHyb: (k: number) => void; hybLabel: string
}) {
  const colOf = (k: Kind) => (k === 's' ? 'var(--s-orb)' : k === 'p' ? 'var(--p-orb)' : 'var(--d-orb)')
  const posOf = (i: number) => {
    const o = orbs[i]
    const idx = o.kind === 's' ? 0 : o.kind === 'p' ? i - 1 : i - 4
    return { x: 24 + idx * 50, y: YLVL[o.kind] }
  }
  const avgY = mix.length ? mix.reduce((a, i) => a + YLVL[orbs[i].kind], 0) / mix.length : 130
  const hx0 = 310
  return (
    <svg className="hyb-svg" viewBox="0 0 580 260" role="img" aria-label="Orbital energy diagram">
      <line x1="8" y1="235" x2="8" y2="20" stroke="#94a3b8" markerEnd="url(#hyb-ar)" />
      <defs><marker id="hyb-ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#94a3b8" /></marker></defs>
      <text x="14" y="16" fontSize="11" fill="#647084">E</text>
      <text x="24" y="250" fontSize="11" fill="#647084">atomic orbitals</text>
      {hybN > 0 && <text x={hx0} y="250" fontSize="11" fill="#647084">hybrid orbitals</text>}
      {orbs.map((o, i) => {
        const { x, y } = posOf(i)
        const mixed = mix.includes(i) && hybN > 0
        const clickable = tool === 'promote' || tool === 'mix'
        return (
          <g key={i} onClick={() => clickable && onOrb(i)} style={{ cursor: clickable ? 'pointer' : 'default' }} opacity={mixed ? 0.4 : 1}>
            <rect x={x} y={y - 30} width="42" height="30" rx="5" fill={mix.includes(i) && tool === 'mix' ? colOf(o.kind) + '33' : '#fff'}
              stroke={src === i ? '#111' : colOf(o.kind)} strokeWidth={src === i || mix.includes(i) ? 3 : 1.6} strokeDasharray={mix.includes(i) && hybN === 0 ? '0' : undefined} />
            <text x={x + 21} y={y - 9} textAnchor="middle" fontSize="19" fill="#18202c">{Arrows({ n: e[i] })}</text>
            <text x={x + 21} y={y + 13} textAnchor="middle" fontSize="11" fill="#647084">{o.label}</text>
          </g>
        )
      })}
      {hybN > 0 && (
        <g>
          <line x1="262" y1={avgY - 15} x2={hx0 - 8} y2={avgY - 15} stroke="#94a3b8" strokeDasharray="4 3" markerEnd="url(#hyb-ar)" />
          {Array.from({ length: hybN }, (_, k) => {
            const x = hx0 + k * 44
            return (
              <g key={k} onClick={() => tool === 'fill' && onHyb(k)} style={{ cursor: tool === 'fill' ? 'pointer' : 'default' }}>
                <rect x={x} y={avgY - 30} width="38" height="30" rx="5" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="1.8" />
                <text x={x + 19} y={avgY - 9} textAnchor="middle" fontSize="19" fill="#18202c">{Arrows({ n: fill[k] })}</text>
              </g>
            )
          })}
          <text x={hx0} y={avgY + 18} fontSize="12" fill="#6d28d9" fontWeight="600">{hybLabel} · same energy</text>
        </g>
      )}
    </svg>
  )
}

/* ------------- hybrid orbital shapes ------------- */
export function HybridShapes({ dom, pi }: { dom: number; pi: number }) {
  const dirs = domainDirs(dom)
  const rot = (v: [number, number, number]): [number, number, number] => {
    const ay = 0.55, ax = -0.35
    const x1 = v[0] * Math.cos(ay) + v[2] * Math.sin(ay), z1 = -v[0] * Math.sin(ay) + v[2] * Math.cos(ay)
    const y2 = v[1] * Math.cos(ax) - z1 * Math.sin(ax), z2 = v[1] * Math.sin(ax) + z1 * Math.cos(ax)
    return [x1, y2, z2]
  }
  const leftoverP = 3 - Math.min(3, dom - 1)
  const pLobes: [number, number, number][] = [[0, 1, 0], [0, 0, 1]].slice(0, Math.min(pi, leftoverP)) as never
  type Item = { v: [number, number, number]; kind: 'h' | 'p' }
  const items: Item[] = [...dirs.map((d): Item => ({ v: rot(d), kind: 'h' })), ...pLobes.map((d): Item => ({ v: rot(d), kind: 'p' }))].sort((a, b) => a.v[2] - b.v[2])
  const cx = 150, cy = 125, S = 82
  return (
    <svg className="hyb-shapes" viewBox="0 0 300 250" role="img" aria-label={`${dom} hybrid orbitals`}>
      {items.map((it, k) => {
        const px = it.v[0], py = -it.v[1]
        const l2 = Math.hypot(px, py)
        const ang = (Math.atan2(py, px) * 180) / Math.PI
        const sc = Math.max(0.35, l2) * (S / 66)
        const near = it.v[2] > -0.05
        if (it.kind === 'p') {
          return (
            <g key={k} transform={`translate(${cx} ${cy}) rotate(${ang}) `} opacity={near ? 0.8 : 0.45}>
              <ellipse cx={sc * 36 * (S / 82)} cy="0" rx={sc * 36} ry="14" fill="#ef4444" />
              <ellipse cx={-sc * 36 * (S / 82)} cy="0" rx={sc * 36} ry="14" fill="#fca5a5" />
            </g>
          )
        }
        return (
          <g key={k} transform={`translate(${cx} ${cy}) rotate(${ang}) scale(${sc} 1)`} opacity={near ? 0.88 : 0.5}>
            <path d="M0,0 C14,-22 56,-24 72,0 C56,24 14,22 0,0 Z" fill="#8b5cf6" stroke="#5b21b6" strokeWidth="1" />
            <path d="M0,0 C-4,-5 -12,-5 -15,0 C-12,5 -4,5 0,0 Z" fill="#c4b5fd" stroke="#7c3aed" strokeWidth=".8" />
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r="4" fill="#18202c" />
    </svg>
  )
}

/* ------------- widget ------------- */
function Work({ id, mode, onResult, compact }: { id: string; mode: 'learn' | 'test'; onResult?: WidgetProps['onResult']; compact?: boolean }) {
  const sp = findSpecies(id) ?? SPECIES[0]
  const info = useMemo(() => analyze(sp), [sp])
  const orbs = useMemo(() => orbitalsFor(info), [info])
  const ground = useMemo(() => groundFill(info.ce, orbs), [info, orbs])
  const comp = composition(info.dom)
  const name = unicodeFormula(sp.id)

  const [domAns, setDomAns] = useState('')
  const [e, setE] = useState<number[]>(ground)
  const [src, setSrc] = useState<number | null>(null)
  const [mix, setMix] = useState<number[]>([])
  const [fill, setFill] = useState<number[]>(Array(6).fill(0))
  const [roles, setRoles] = useState<string[]>(Array(6).fill(''))
  const [pis, setPis] = useState<Record<number, string>>({})
  const [hyb, setHyb] = useState<Hyb | ''>('')
  const [toolSel, setToolSel] = useState<Tool>('promote')
  const [tip, setTip] = useState('')

  const leftover = orbs.map((_, k) => k).filter((k) => !mix.includes(k))
  const leftoverE = leftover.reduce((a, k) => a + e[k], 0)
  const Es = mix.reduce((a, k) => a + e[k], 0)
  const hybN = mix.length

  const evalStep = (i: number): StepResult => {
    const notes: Note[] = []
    if (i === 0) {
      const v = Number(domAns)
      if (!domAns.trim() || !Number.isFinite(v)) return { ok: false, notes: [{ level: 'err', msg: 'Enter how many hybrid orbitals are needed.' }] }
      if (v === info.dom) return { ok: true, notes: [{ level: 'ok', msg: `${info.dom} hybrid orbitals: ${info.nb} σ bond${info.nb > 1 ? 's' : ''} + ${info.lp} lone pair${info.lp === 1 ? '' : 's'}. Number of HOs = bonding + non-bonding domains (slide 51).` }] }
      if (info.piC > 0 && v === info.nb + info.piC + info.lp) notes.push({ level: 'err', msg: 'π bonds do not use hybrid orbitals: only σ bonds and lone pairs do (slide 76). Count one domain per multiple bond.' })
      else notes.push({ level: 'err', msg: 'Number of hybrid orbitals = number of σ-bonded atoms + lone pairs on the central atom (each multiple bond contributes one σ bond).' })
      if (mode === 'learn') notes.push({ level: 'hint', msg: `${sp.centre} is bonded to ${ligandSummary(sp)}; it has ${info.lp} lone pair${info.lp === 1 ? '' : 's'}.` })
      return { ok: false, notes }
    }
    if (i === 1) {
      const pairs = e.filter((x) => x === 2).length
      const unp = e.filter((x) => x === 1).length
      const need = info.nb + info.piC
      if (pairs === info.lp && unp === need) {
        const moved = e.some((x, k) => x !== ground[k])
        return { ok: true, notes: [{ level: 'ok', msg: moved ? `Promotion gives ${need} half-filled orbitals (${info.nb} σ + ${info.piC} π) and ${info.lp} filled orbital${info.lp === 1 ? '' : 's'} for the lone pair${info.lp === 1 ? '' : 's'}.` : `No promotion needed: ${sp.centre} already has ${need} unpaired electrons for its bonds${info.lp ? ' and a filled orbital for each lone pair' : ''}.` }] }
      }
      if (pairs > info.lp) {
        notes.push({ level: 'err', msg: `${pairs} orbital${pairs > 1 ? 's are' : ' is'} still filled but only ${info.lp} will be a lone pair. Each bond needs a half-filled orbital, so promote an electron from a filled orbital to an empty orbital of higher energy${info.period >= 3 && info.dom > 4 ? ' (expanded octet: empty d orbitals of the same n, slide 70)' : ''}.` })
        if (mode === 'learn') notes.push({ level: 'hint', msg: `You need ${need} unpaired electrons (${info.nb} σ + ${info.piC} π); you have ${unp}.` })
      } else notes.push({ level: 'err', msg: `You promoted too far: only ${info.lp} filled orbital${info.lp === 1 ? ' is' : 's are'} needed to hold the lone pair${info.lp === 1 ? '' : 's'}, but ${pairs} remain. Lone pairs stay paired; promote only to unpair electrons that must form bonds.` })
      return { ok: false, notes }
    }
    if (i === 2) {
      if (!mix.length) return { ok: false, notes: [{ level: 'err', msg: 'Click the orbitals you want to mix.' }] }
      const cnt = { s: 0, p: 0, d: 0 }
      mix.forEach((k) => cnt[orbs[k].kind]++)
      if (mix.length !== info.dom) notes.push({ level: 'err', msg: `You mixed ${mix.length} orbital${mix.length > 1 ? 's' : ''}, but ${info.dom} hybrids are needed. Orbitals are conserved: number of AOs mixed = number of HOs (slide 52).` })
      else if (cnt.s !== comp.s || cnt.p !== comp.p || cnt.d !== comp.d) notes.push({ level: 'err', msg: `Mix the s orbital first, then p orbitals, and d orbitals only when more than 4 hybrids are needed (slides 69–70). ${info.dom} hybrids = ${HYB_LABEL[info.hyb]}: ${comp.s} s + ${comp.p} p${comp.d ? ` + ${comp.d} d` : ''}.` })
      else if (leftoverE !== info.piC) {
        if (leftoverE > info.piC) notes.push({ level: 'err', msg: `The orbitals you left out still hold ${leftoverE} e⁻, but only ${info.piC} unhybridized orbital${info.piC === 1 ? '' : 's'} should keep an electron for π bonds. Mix the filled/extra half-filled ones.` })
        else notes.push({ level: 'err', msg: `The unhybridized orbitals must hold the π electron${info.piC === 1 ? '' : 's'} (one per π bond, slide 83): you left only ${leftoverE} e⁻ but need ${info.piC}. Keep a half-filled p (or d) out of the mix.` })
      } else return { ok: true, notes: [{ level: 'ok', msg: `${comp.s} s + ${comp.p} p${comp.d ? ` + ${comp.d} d` : ''} → ${info.dom} ${HYB_LABEL[info.hyb]} hybrids, all at the same (averaged) energy.${info.piC ? ` ${leftover.filter((k) => e[k] > 0).length} unhybridized orbital${info.piC > 1 ? 's' : ''} keep the π electron${info.piC > 1 ? 's' : ''}.` : ''}` }] }
      return { ok: false, notes }
    }
    if (i === 3) {
      if (!hybN) return { ok: false, notes: [{ level: 'err', msg: 'Mix orbitals first (step 3).' }] }
      const tot = fill.slice(0, hybN).reduce((a, b) => a + b, 0)
      if (tot !== Es) return { ok: false, notes: [{ level: 'err', msg: `Electrons are conserved: the mixed orbitals held ${Es} e⁻, you placed ${tot}.` }] }
      const f = fill.slice(0, hybN)
      if (f.some((x) => x === 2) && f.some((x) => x === 0)) return { ok: false, notes: [{ level: 'err', msg: "Hund's rule: put one electron in every equal-energy hybrid before pairing any." }] }
      return { ok: true, notes: [{ level: 'ok', msg: `Filled with Hund's rule: ${f.filter((x) => x === 1).length} half-filled and ${f.filter((x) => x === 2).length} full hybrid${f.filter((x) => x === 2).length === 1 ? '' : 's'}.` }] }
    }
    if (i === 4) {
      if (!hybN) return { ok: false, notes: [{ level: 'err', msg: 'Mix and fill hybrids first.' }] }
      let ok = true
      for (let k = 0; k < hybN; k++) {
        const want = fill[k] === 2 ? 'lp' : fill[k] === 1 ? 'sigma' : 'empty'
        if (roles[k] !== want) {
          ok = false
          notes.push({ level: 'err', msg: roles[k] ? (fill[k] === 2 ? `Hybrid ${k + 1} is full (2 e⁻): it holds a lone pair. A σ bond needs a half-filled hybrid to overlap with a half-filled orbital of the partner (slide 75).` : fill[k] === 1 ? `Hybrid ${k + 1} is half-filled: it overlaps head-on with the partner atom to form a σ bond, it is not a lone pair.` : `Hybrid ${k + 1} is empty.`) : `Assign a role to hybrid ${k + 1}.` })
        }
      }
      for (const k of leftover) {
        if (orbs[k].kind === 'd' && e[k] === 0) continue
        const want = e[k] > 0 ? 'pi' : 'none'
        if ((pis[k] ?? '') !== want) { ok = false; notes.push({ level: 'err', msg: pis[k] ? (e[k] > 0 ? `${orbs[k].label} was left out of the mix and holds an electron: it forms a π bond (sideways overlap, slide 82).` : `${orbs[k].label} is empty, so it forms no π bond.`) : `Say what ${orbs[k].label} does.` }) }
      }
      if (ok) return { ok: true, notes: [{ level: 'ok', msg: `${info.nb} σ bond${info.nb > 1 ? 's' : ''} (hybrid + partner orbital), ${info.lp} lone pair${info.lp === 1 ? '' : 's'} in hybrids${info.piC ? `, ${info.piC} π bond${info.piC > 1 ? 's' : ''} from unhybridized orbitals` : ''}.` }] }
      return { ok: false, notes }
    }
    if (!hyb) return { ok: false, notes: [{ level: 'err', msg: 'Name the hybridization.' }] }
    if (hyb === info.hyb) return { ok: true, notes: [{ level: 'ok', msg: `${HYB_LABEL[info.hyb]}: ${info.eg} electron geometry, ${info.shape.mg}, angle ${HYB_ANGLE[info.hyb]}.` }] }
    notes.push({ level: 'err', msg: `Name = the orbitals mixed: ${comp.s} s + ${comp.p} p${comp.d ? ` + ${comp.d} d` : ''} → ${HYB_LABEL[info.hyb]}. The superscript counts p orbitals (slide 59); ${info.piC ? 'π bonds do not change the hybridization. ' : ''}${info.dom} domains ↔ ${HYB_LABEL[info.hyb]}.` })
    return { ok: false, notes }
  }
  const NSTEP = 6
  const st = useStepper(mode, NSTEP, evalStep)
  useReportOnce(st.finished, onResult, () => ({
    correct: st.mistakes === 0,
    score: Math.max(0, 1 - st.mistakes / NSTEP),
    summary: st.mistakes === 0 ? `${name}: ${HYB_LABEL[info.hyb]} (${info.dom} hybrids).` : `${name}: ${st.firstErr.current || 'steps wrong'} (answer ${HYB_LABEL[info.hyb]})`,
  }))

  const activeIdx = [1, 2, 3].find((i) => ['active', 'error'].includes(st.status(i)))
  const tool: Tool = mode === 'test' ? toolSel : activeIdx ? ({ 1: 'promote', 2: 'mix', 3: 'fill' } as const)[activeIdx as 1 | 2 | 3] : 'none'

  const onOrb = (i: number) => {
    setTip('')
    if (tool === 'promote') {
      if (src === null) { if (e[i] > 0) setSrc(i); return }
      if (src === i) { setSrc(null); return }
      if (e[i] > 0) { setSrc(i); return }
      if (RANK[orbs[i].kind] <= RANK[orbs[src].kind]) { setTip('Promotion goes to an empty orbital of higher energy (s → p → d).'); return }
      setE((p) => p.map((x, k) => (k === src ? x - 1 : k === i ? 1 : x)))
      setSrc(null)
    } else if (tool === 'mix') {
      setMix((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))
      setFill(Array(6).fill(0)); setRoles(Array(6).fill(''))
    }
  }
  const onHyb = (k: number) => setFill((p) => p.map((x, j) => (j === k ? (x + 1) % 3 : x)))
  const resetPromo = () => { setE(ground); setSrc(null); setTip('') }
  const stateOf = (i: number) => (st.status(i) === 'done' ? 'ok' : st.status(i) === 'error' ? 'err' : null)
  const btn = (i: number) => mode === 'learn' && !st.res[i]?.ok && <div className="row" style={{ marginTop: 8 }}><button className="btn primary sm" onClick={() => st.check(i)}>Check</button></div>
  const showHybrids = mode === 'test' ? hybN > 0 : st.res[2]?.ok === true
  const named = st.res[5]?.ok === true || (mode === 'test' && st.submitted)

  const instruction = tool === 'promote' ? 'Click a filled/half-filled orbital, then an empty higher orbital to promote one electron.' : tool === 'mix' ? 'Click every atomic orbital that takes part in the hybridization.' : tool === 'fill' ? 'Click a hybrid box to cycle 0 → ↑ → ↑↓. Obey Hund’s rule.' : ''
  const cn = info.fc === 0 ? '' : ` (treated as ${sp.centre}${info.fc > 0 ? '⁺' : '⁻'} in this structure, ${info.ce} valence e⁻)`

  return (
    <div className={compact ? '' : 'grid2'}>
      <div>
        <div className="l10-species">
          <span className="l10-big"><Formula f={sp.id} /></span> <span className="muted">central atom {sp.centre}{cn} · valence e⁻ {info.ce}</span>
          <div className="muted" style={{ fontSize: 13 }}>{sp.centre} bonded to {ligandSummary(sp)}; {info.lp} lone pair{info.lp === 1 ? '' : 's'}.</div>
          {sp.note && <div className="muted" style={{ fontSize: 12.5 }}>{sp.note}</div>}
        </div>
        <Step n={1} title="How many hybrid orbitals does the central atom need?" status={st.status(0)} notes={st.notes(0)}>
          <NumInput value={domAns} onChange={setDomAns} placeholder="e.g. 4" width={90} state={stateOf(0)} disabled={st.frozen(0)} />
          {btn(0)}
        </Step>
        <Step n={2} title="Promote electrons where needed (every bond needs a half-filled orbital)" status={st.status(1)} notes={st.notes(1)}>
          <div className="muted" style={{ fontSize: 13 }}>Ground state is drawn on the diagram. Leave it unchanged if no promotion is needed.</div>
          <div className="row" style={{ marginTop: 6 }}><button className="btn sm" onClick={resetPromo} disabled={st.frozen(1)}>Undo promotions</button></div>
          {btn(1)}
        </Step>
        <Step n={3} title="Select the orbitals to mix" status={st.status(2)} notes={st.notes(2)}>
          <div className="muted" style={{ fontSize: 13 }}>Selected: {mix.length ? mix.map((k) => orbs[k].label).join(', ') : 'none'}</div>
          {btn(2)}
        </Step>
        <Step n={4} title="Fill the hybrid orbitals (Hund's rule)" status={st.status(3)} notes={st.notes(3)}>
          <div className="muted" style={{ fontSize: 13 }}>{hybN ? `${Es} electrons from the mixed orbitals go into ${hybN} hybrids.` : 'Mix orbitals first.'}</div>
          {btn(3)}
        </Step>
        <Step n={5} title="Assign roles: σ bond or lone pair; π bonds from unhybridized orbitals" status={st.status(4)} notes={st.notes(4)}>
          {hybN > 0 ? (
            <div className="hyb-roles">
              {Array.from({ length: hybN }, (_, k) => (
                <label key={k}>Hybrid {k + 1} ({Arrows({ n: fill[k] }) || 'empty'})
                  <select value={roles[k]} disabled={st.frozen(4)} onChange={(ev) => setRoles((p) => p.map((x, j) => (j === k ? ev.target.value : x)))}>
                    <option value="">—</option><option value="sigma">σ bond</option><option value="lp">lone pair</option><option value="empty">empty</option>
                  </select></label>
              ))}
              {leftover.filter((k) => !(orbs[k].kind === 'd' && e[k] === 0)).map((k) => (
                <label key={k}>{orbs[k].label} ({Arrows({ n: e[k] }) || 'empty'})
                  <select value={pis[k] ?? ''} disabled={st.frozen(4)} onChange={(ev) => setPis((p) => ({ ...p, [k]: ev.target.value }))}>
                    <option value="">—</option><option value="pi">π bond</option><option value="none">no bond</option>
                  </select></label>
              ))}
            </div>
          ) : <div className="muted" style={{ fontSize: 13 }}>Mix and fill hybrids first.</div>}
          {btn(4)}
        </Step>
        <Step n={6} title="Name the hybridization" status={st.status(5)} notes={st.notes(5)}>
          <Choice options={HYBS.map((h) => ({ id: h, label: HYB_LABEL[h] }))} value={hyb} onChange={setHyb} disabled={st.frozen(5)} state={stateOf(5)} />
          {btn(5)}
        </Step>
        {mode === 'test' && !st.submitted && <button className="btn primary" onClick={() => st.checkAll()}>Check all</button>}
        {st.finished && <Verdict correct={st.mistakes === 0 ? true : 'partial'} title={`${name}: ${HYB_LABEL[info.hyb]} hybridized ${sp.centre}`}>
          <span>{info.dom} {HYB_LABEL[info.hyb]} hybrids → {info.eg} electron geometry, <b>{info.shape.mg}</b>, <Axe nb={info.nb} lp={info.lp} />, angle {HYB_ANGLE[info.hyb]}{info.lp ? ' (reduced by lone pairs)' : ''}. <SlideRef l="L10" s={58} /></span>
        </Verdict>}
      </div>
      <div>
        {mode === 'test' && (
          <div className="seg" style={{ marginBottom: 8 }}>
            {(['promote', 'mix', 'fill'] as const).map((t) => <button key={t} className={toolSel === t ? 'on' : ''} onClick={() => setToolSel(t)}>{t === 'promote' ? 'Promote' : t === 'mix' ? 'Select to mix' : 'Fill hybrids'}</button>)}
          </div>
        )}
        <Diagram orbs={orbs} e={e} src={src} mix={mix} hybN={mode === 'test' ? hybN : showHybrids ? hybN : 0} fill={fill} tool={tool} onOrb={onOrb} onHyb={onHyb} hybLabel={mix.length === info.dom ? HYB_LABEL[info.hyb] : `${hybN} hybrids`} />
        <div className="muted" style={{ fontSize: 12.5, minHeight: 18 }}>{tip || instruction}</div>
        {named && (
          <div className="l10-card">
            <div className="l10-card-title">{HYB_LABEL[info.hyb]} hybrid orbitals{info.piC > 0 ? ' + unhybridized p (red)' : ''}</div>
            <HybridShapes dom={info.dom} pi={info.piC} />
            <p className="l10-why">{info.dom} lobes point to the corners of a {info.eg} arrangement. Large lobes overlap head-on with partner orbitals (σ); lone pairs sit in hybrids too (slide 72).</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Hybrid({ mode: fm, task, onResult, compact }: WidgetProps<{ species: string }>) {
  const [mode, setMode] = useMode(fm, 'chem.mode')
  const [sid, setSid] = useState(task?.species ?? 'CH4')
  const [epoch, setEpoch] = useState(0)
  const cur = (task ? findSpecies(task.species)?.id : undefined) ?? sid
  return (
    <Workbench title="Hybridization mixer" subtitle="Promote → mix → fill → assign → name" mode={mode} onMode={setMode} onReset={() => setEpoch((x) => x + 1)} compact={compact}>
      {!task && <div style={{ marginBottom: 12 }}><SpeciesPicker value={cur} onChange={(v) => { setSid(v); setEpoch((x) => x + 1) }} /></div>}
      <Work key={`${cur}-${epoch}-${mode}`} id={cur} mode={mode} onResult={onResult} compact={compact} />
    </Workbench>
  )
}
