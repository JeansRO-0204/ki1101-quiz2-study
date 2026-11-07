// Validation logic for the Lewis workbench. Pure functions: no React.
import type { Note } from '../../lib/kit'
import {
  EN, enOf, getSpecies, groupLabel, outerShell, parseElements, periodOf, splitFormula, structKey,
  totalElectrons, totalValence, valenceOf, formalCharges, chargeString,
  type Bond, type Species, type Struct,
} from './species'

/* ---------- species context ---------- */
export interface Ctx {
  key: string
  formula: string
  charge: number
  atoms: string[]
  sp?: Species
}
export function resolveCtx(raw: string): { ctx?: Ctx; error?: string } {
  const sp = getSpecies(raw)
  if (sp) return { ctx: { key: sp.formula, formula: sp.formula, charge: sp.charge, atoms: sp.atoms, sp } }
  const { base, charge } = splitFormula(raw)
  if (!base) return { error: 'Type a formula such as SO4^2- or NO3^-' }
  const els = parseElements(base)
  if (!els) return { error: `Could not read "${raw}". Use element symbols and numbers, e.g. CH3OH, SO4^2-, NH4^+.` }
  if (els.length > 9) return { error: 'Please keep it to 9 atoms or fewer.' }
  if (els.some((e) => !valenceOf(e))) return { error: 'Only main-group elements are supported.' }
  // put the least electronegative non-H atom first (usual central atom), keep the rest in order
  const idx = els.map((_, i) => i)
  const cands = idx.filter((i) => els[i] !== 'H' && els[i] !== 'F')
  const first = cands.sort((a, b) => enOf(els[a]) - enOf(els[b]) || a - b)[0] ?? 0
  const order = [first, ...idx.filter((i) => i !== first)]
  const atoms = order.map((i) => els[i])
  const formula = base + (charge ? '^' + chargeString(charge) : '')
  return { ctx: { key: 'x:' + formula, formula, charge, atoms } }
}

/* ---------- labels ---------- */
const SUBS = '₀₁₂₃₄₅₆₇₈₉'
export function atomLabels(atoms: string[]): string[] {
  const total: Record<string, number> = {}
  atoms.forEach((a) => { total[a] = (total[a] ?? 0) + 1 })
  const seen: Record<string, number> = {}
  return atoms.map((a) => {
    if (total[a] === 1) return a
    seen[a] = (seen[a] ?? 0) + 1
    return a + String(seen[a]).replace(/\d/g, (d) => SUBS[+d])
  })
}

/* ---------- work state ---------- */
export interface Work { bonds: Record<string, number>; lp: number[]; ue: number[] }
export const bkey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)
export const emptyWork = (n: number): Work => ({ bonds: {}, lp: new Array(n).fill(0), ue: new Array(n).fill(0) })
export function workToStruct(w: Work): Struct {
  const bonds: Bond[] = Object.entries(w.bonds).map(([k, o]) => {
    const [a, b] = k.split('-').map(Number)
    return [a, b, o] as Bond
  })
  return { bonds, lp: w.lp.slice(), ue: w.ue.slice() }
}
export function structToWork(s: Struct): Work {
  const bonds: Record<string, number> = {}
  s.bonds.forEach(([a, b, o]) => { bonds[bkey(a, b)] = o })
  return { bonds, lp: s.lp.slice(), ue: s.ue.slice() }
}

/* ---------- isomorphism signature (Weisfeiler–Lehman; exact for trees) ---------- */
const dict = new Map<string, number>()
const intern = (s: string) => { let v = dict.get(s); if (v == null) { v = dict.size; dict.set(s, v) } return v }
export function signature(atoms: string[], s: Struct, flat = false): string {
  const n = atoms.length
  let lab = atoms.map((a, i) => intern(flat ? a : `${a}|${s.lp[i] ?? 0}|${s.ue[i] ?? 0}`))
  const adj: [number, number][][] = atoms.map(() => [])
  s.bonds.forEach(([a, b, o]) => { const oo = flat ? 1 : o; adj[a].push([b, oo]); adj[b].push([a, oo]) })
  for (let r = 0; r < n + 1; r++) {
    lab = lab.map((l, i) => intern(l + '[' + adj[i].map(([j, o]) => `${o}:${lab[j]}`).sort().join(',') + ']'))
  }
  return lab.slice().sort((a, b) => a - b).join('.')
}

/* ---------- step 1: valence electrons ---------- */
export interface Fill { s: number; p: number }
export function checkValence(els: string[], fills: Record<string, Fill | undefined>): { ok: boolean; notes: Note[] } {
  const notes: Note[] = []
  let ok = true
  for (const el of els) {
    const exp = outerShell(el)
    const f = fills[el] ?? { s: 0, p: 0 }
    const cfg = exp.n === 1 ? `1s${sup(exp.s)}` : `${exp.n}s${sup(exp.s)}${exp.p ? ` ${exp.n}p${sup(exp.p)}` : ''}`
    const hint = `${el} is in group ${groupLabel(el)}: ${cfg} → ${exp.s + exp.p}`
    if (f.s === 0 && f.p === 0) {
      ok = false
      notes.push({ level: 'err', msg: `**${el}**: no electrons placed yet. ${hint}` })
    } else if (f.s === exp.s && f.p === exp.p) {
      notes.push({ level: 'ok', msg: `**${el}**: ${cfg} → ${exp.s + exp.p} valence e⁻ (group ${groupLabel(el)}).` })
    } else {
      ok = false
      const bits: string[] = []
      if (f.s !== exp.s) bits.push(`${exp.n}s should hold ${exp.s} e⁻ (you have ${f.s}; the s subshell fills first and takes at most 2)`)
      if (f.p !== exp.p) bits.push(exp.n === 1 ? 'H has no p electrons in its valence shell' : `${exp.n}p should hold ${exp.p} e⁻ (you have ${f.p})`)
      const tot = f.s + f.p
      notes.push({
        level: 'err',
        msg: `**${el}**: ${bits.join('; ')}. ${hint}.` + (tot === exp.s + exp.p ? ' The total is right but the s/p split is not.' : ` Your ${tot} valence e⁻ ≠ group number ${exp.s + exp.p}.`),
      })
    }
  }
  return { ok, notes }
}
const SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) => String(n).replace(/\d/g, (d) => SUPS[+d])

export function checkTotal(atoms: string[], charge: number, val: number): { ok: boolean; notes: Note[] } {
  const sum = atoms.reduce((t, a) => t + valenceOf(a), 0)
  const expected = sum - charge
  if (!Number.isFinite(val)) return { ok: false, notes: [{ level: 'err', msg: 'Enter the total number of valence electrons as a whole number.' }] }
  if (val === expected) {
    return { ok: true, notes: [{ level: 'ok', msg: charge === 0 ? `Total = ${expected} valence e⁻ (neutral: no adjustment).` : `Total = ${sum} (atoms) ${charge < 0 ? '+' : '−'} ${Math.abs(charge)} (${charge < 0 ? 'anion' : 'cation'}) = **${expected}** e⁻.` }] }
  }
  const n: Note[] = []
  const q = Math.abs(charge)
  if (charge !== 0 && val === sum) {
    n.push({ level: 'err', msg: charge < 0 ? `You counted only the atoms' valence electrons. Anion: add ${q} electron${q > 1 ? 's' : ''} for the ${q > 1 ? q : ''}− charge.` : `You counted only the atoms' valence electrons. Cation: subtract ${q} electron${q > 1 ? 's' : ''} for the ${q > 1 ? q : ''}+ charge.` })
  } else if (charge !== 0 && val === sum + charge) {
    n.push({ level: 'err', msg: charge < 0 ? `You subtracted for an anion. A negative charge means extra electrons: add ${q}.` : `You added for a cation. A positive charge means electrons were lost: subtract ${q}.` })
  } else {
    const uniq = [...new Set(atoms)].reduce((t, a) => t + valenceOf(a), 0)
    if (val === uniq && atoms.length !== new Set(atoms).size) n.push({ level: 'err', msg: 'You counted each element once. Multiply by the number of atoms of each element (e.g. 4 O = 4 × 6).' })
    else n.push({ level: 'err', msg: `Not quite. Add the valence electrons of **every** atom (${tally(atoms)})${charge ? `, then ${charge < 0 ? 'add' : 'subtract'} ${q} for the charge` : ''}.` })
  }
  return { ok: false, notes: n }
}
function tally(atoms: string[]): string {
  const c = new Map<string, number>()
  atoms.forEach((a) => c.set(a, (c.get(a) ?? 0) + 1))
  return [...c.entries()].map(([a, k]) => `${k} ${a}`).join(' + ')
}

/* ---------- step 2: central atom + skeleton ---------- */
export function checkCentral(ctx: Ctx, central: number | null): { ok: boolean; notes: Note[] } {
  const { atoms, sp } = ctx
  const lab = atomLabels(atoms)
  if (atoms.length === 2) return { ok: true, notes: [{ level: 'ok', msg: 'A diatomic molecule has no central atom: just bond the two atoms.' }] }
  if (central == null) return { ok: false, notes: [{ level: 'err', msg: 'Pick the central atom first.' }] }
  const c = atoms[central]
  if (c === 'H') return { ok: false, notes: [{ level: 'err', msg: '**H is never central**: it has only the 1s orbital (a duet) so it forms just one bond.' }] }
  if (c === 'F') return { ok: false, notes: [{ level: 'err', msg: '**F is never central**: it is the most electronegative element and forms just one bond; it sits on the outside.' }] }
  if (sp) {
    if (sp.central.some((k) => atoms[k] === c)) {
      const why = sp.oxoacid ? ' In oxoacids the H atoms are attached to O.' : ''
      const others = atoms.filter((a, i) => i !== central && a !== 'H').length
      void others
      return { ok: true, notes: [{ level: 'ok', msg: `${lab[central]} is the central atom (${c}, EN ${enOf(c)}).${why}` }] }
    }
    const exp = atoms[sp.central[0]]
    const n: Note[] = []
    if (enOf(c) > enOf(exp)) n.push({ level: 'err', msg: `The **least electronegative** atom goes in the middle: ${exp} (EN ${enOf(exp)}) is less electronegative than ${c} (EN ${enOf(c)}).` })
    else if (c === 'O' && sp.oxoacid) n.push({ level: 'err', msg: `In an oxoacid the central atom is the non-metal other than O (here ${exp}); O atoms surround it and H attaches to O.` })
    else n.push({ level: 'err', msg: `${c} is not the central atom here. The central atom is the one bonded to the most other atoms (${exp}).` })
    if (c === 'C') n.push({ level: 'hint', msg: 'C is usually central, but not when another atom is bonded to more neighbours.' })
    return { ok: false, notes: n }
  }
  // generic species
  const cands = atoms.map((a, i) => i).filter((i) => atoms[i] !== 'H' && atoms[i] !== 'F')
  const minEn = Math.min(...cands.map((i) => enOf(atoms[i])))
  if (enOf(c) > minEn + 0.05) {
    const better = cands.find((i) => enOf(atoms[i]) === minEn)!
    return { ok: false, notes: [{ level: 'warn', msg: `Usually the least electronegative atom is central: ${atoms[better]} (EN ${minEn}) < ${c} (EN ${enOf(c)}). Unless you have a reason, reconsider.` }] }
  }
  return { ok: true, notes: [{ level: 'ok', msg: `${lab[central]} is a sensible central atom (lowest EN among non-H, non-F atoms).` }] }
}

function nbrSigs(atoms: string[], edges: [number, number][]): string[] {
  const nb: string[][] = atoms.map(() => [])
  edges.forEach(([a, b]) => { nb[a].push(atoms[b]); nb[b].push(atoms[a]) })
  return atoms.map((a, i) => `${a}–{${nb[i].slice().sort().join(',')}}`)
}

export function checkSkeleton(ctx: Ctx, central: number | null, bonds: Record<string, number>): { ok: boolean; notes: Note[] } {
  const { atoms, sp } = ctx
  const lab = atomLabels(atoms)
  const edges = Object.keys(bonds).map((k) => k.split('-').map(Number) as [number, number])
  const n: Note[] = []
  if (edges.length === 0) return { ok: false, notes: [{ level: 'err', msg: 'No bonds yet. Click an atom, then another atom, to join them with a single bond.' }] }
  // connectivity
  const adj: number[][] = atoms.map(() => [])
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a) })
  const seen = new Set<number>([0])
  const q = [0]
  while (q.length) { const x = q.pop()!; adj[x].forEach((y) => { if (!seen.has(y)) { seen.add(y); q.push(y) } }) }
  const lonely = atoms.map((_, i) => i).filter((i) => adj[i].length === 0)
  let ok = true
  if (lonely.length) { ok = false; n.push({ level: 'err', msg: `${lonely.map((i) => lab[i]).join(', ')} ${lonely.length > 1 ? 'are' : 'is'} not bonded to anything. Every atom must be connected to the skeleton.` }) }
  else if (seen.size < atoms.length) { ok = false; n.push({ level: 'err', msg: 'The skeleton is split into separate pieces. All atoms must be connected.' }) }
  // H / F terminal
  atoms.forEach((a, i) => {
    if ((a === 'H' || a === 'F') && adj[i].length > 1) { ok = false; n.push({ level: 'err', msg: `${lab[i]} has ${adj[i].length} bonds, but ${a} forms only one bond (it is always terminal).` }) }
  })
  if (!sp) {
    if (ok) n.push({ level: 'ok', msg: 'Connected skeleton with H/F on the outside. (No reference skeleton on file for this formula, so only generic rules are checked.)' })
    return { ok, notes: n }
  }
  const need = sp.skeleton.length
  if (ok && edges.length !== need) {
    ok = false
    n.push({ level: 'err', msg: edges.length > need ? `You drew ${edges.length} bonds but only ${need} single bonds are needed to connect ${atoms.length} atoms (${atoms.length} − 1). Extra bonds create rings or duplicate links; multiple bonds come later, in step 3.` : `Only ${edges.length} bonds; connecting ${atoms.length} atoms needs ${need}.` })
  }
  const user: Struct = { bonds: edges.map(([a, b]) => [a, b, 1] as Bond), lp: [], ue: [] }
  const ref: Struct = { bonds: sp.skeleton.map(([a, b]) => [a, b, 1] as Bond), lp: [], ue: [] }
  const same = signature(atoms, user, true) === signature(atoms, ref, true)
  if (ok && !same) {
    ok = false
    if (sp.oxoacid) {
      const badH = atoms.map((a, i) => i).filter((i) => atoms[i] === 'H' && adj[i].some((j) => atoms[j] !== 'O'))
      if (badH.length) n.push({ level: 'err', msg: `In oxoacids the acidic H is bonded to **O** (H–O–X), not directly to the central atom. Check ${badH.map((i) => lab[i]).join(', ')}.` })
    }
    const us = nbrSigs(atoms, edges), rs = nbrSigs(atoms, sp.skeleton)
    const extra = diff(us, rs), miss = diff(rs, us)
    if (extra.length) n.push({ level: 'err', msg: `Your skeleton has ${extra.map(fmtSig).join('; ')} which the accepted skeleton does not.` })
    if (miss.length) n.push({ level: 'err', msg: `The accepted skeleton has ${miss.map(fmtSig).join('; ')}.` })
    if (!extra.length && !miss.length) n.push({ level: 'err', msg: 'The atoms are linked in a different pattern from the accepted skeleton.' })
    if (central != null && !sp.central.some((k) => atoms[k] === atoms[central])) n.push({ level: 'hint', msg: 'Your central atom is not the usual one. Fix that first and the rest usually follows.' })
  }
  if (ok) n.push({ level: 'ok', msg: 'Skeleton connectivity matches the accepted structure.' })
  return { ok, notes: n }
}
function diff(a: string[], b: string[]): string[] {
  const rest = b.slice()
  const out: string[] = []
  for (const x of a) { const i = rest.indexOf(x); if (i >= 0) rest.splice(i, 1); else out.push(x) }
  return [...new Set(out)]
}
function fmtSig(s: string): string {
  const [a, r] = s.split('–')
  const nb = r.replace(/[{}]/g, '').split(',').filter(Boolean)
  return `${a} bonded to ${nb.length ? nb.join(' + ') : 'nothing'}`
}

/* ---------- step 3/4: electron placement analysis ---------- */
export type OctetKind = 'ok' | 'duet' | 'incomplete' | 'incomplete-ok' | 'expanded' | 'odd' | 'excess' | 'bad'
export interface AtomInfo {
  i: number
  el: string
  label: string
  count: number
  kind: OctetKind
  /** short badge text e.g. "8", "6" */
  text: string
  fc: number
  calc: string
  bondsSum: number
  unshared: number
}
export interface Analysis {
  avail: number
  used: number
  atoms: AtomInfo[]
  fcSum: number
  errors: Note[]
  warns: Note[]
  oks: Note[]
  hints: Note[]
  /** reasons the structure is valid but not best */
  reasons: Note[]
  valid: boolean
  verdict: 'invalid' | 'valid' | 'best'
  matchedForm?: 'best' | 'ok' | 'poor'
  sumAbsFc: number
}

const PERIOD2_INCOMPLETE_OK = new Set(['B', 'Be', 'Li'])
export function analyze(ctx: Ctx, w: Work, central: number | null): Analysis {
  const { atoms, charge, sp } = ctx
  const lab = atomLabels(atoms)
  const s = workToStruct(w)
  const n = atoms.length
  const avail = totalValence(atoms, charge)
  const used = totalElectrons(s)
  const fcs = formalCharges(atoms, s)
  const fcSum = fcs.reduce((a, b) => a + b, 0)
  const errors: Note[] = [], warns: Note[] = [], oks: Note[] = [], hints: Note[] = [], reasons: Note[] = []
  const oddSpecies = avail % 2 === 1
  const infos: AtomInfo[] = []

  // budget
  if (used === avail) oks.push({ level: 'ok', msg: `Electron count: ${used} used = ${avail} available.` })
  else if (used > avail) errors.push({ level: 'err', msg: `**Too many electrons**: you placed ${used} but only ${avail} are available (${used - avail} extra). Remove lone pairs or a bond.` })
  else errors.push({ level: 'err', msg: `**Too few electrons used**: ${used} of ${avail} placed, ${avail - used} left over. Every valence electron must appear as a bond or lone pair.` })

  if (!oddSpecies && w.ue.some((x) => x > 0)) errors.push({ level: 'err', msg: `Unpaired electrons are only allowed in odd-electron species (like NO). ${ctx.formula} has ${avail} electrons (even), so pair them up.` })
  if (oddSpecies && used === avail && !w.ue.some((x) => x > 0)) errors.push({ level: 'err', msg: `${avail} is odd, so exactly one unpaired electron must remain on an atom.` })

  for (let i = 0; i < n; i++) {
    const a = atoms[i]
    const bondsSum = s.bonds.reduce((t, [x, y, o]) => (x === i || y === i ? t + o : t), 0)
    const unshared = 2 * (w.lp[i] ?? 0) + (w.ue[i] ?? 0)
    const count = 2 * bondsSum + unshared
    const per = periodOf(a)
    let kind: OctetKind = 'ok'
    if (a === 'H') {
      if (count === 2) kind = 'duet'
      else if (count > 2) { kind = 'excess'; errors.push({ level: 'err', msg: `**${lab[i]} has ${count} e⁻** but H holds only 2 (just the 1s orbital).` }) }
      else { kind = 'incomplete'; errors.push({ level: 'err', msg: `**${lab[i]} has ${count} e⁻**: H needs a duet (one bond) — it is not bonded.` }) }
    } else if (per === 2) {
      if (count === 8) kind = 'ok'
      else if (count > 8) { kind = 'excess'; errors.push({ level: 'err', msg: `**${lab[i]} has ${count} e⁻**: period-2 atoms can never exceed an octet (no d orbitals; slide 32). Convert a bond/lone pair.` }) }
      else if (PERIOD2_INCOMPLETE_OK.has(a)) { kind = 'incomplete-ok'; oks.push({ level: 'ok', msg: `${lab[i]} has ${count} e⁻: ${a} may have an incomplete octet (like BBr₃, BeCl₂).` }) }
      else if (oddSpecies && (w.ue[i] ?? 0) > 0 && count === 7) { kind = 'odd'; oks.push({ level: 'ok', msg: `${lab[i]} has 7 e⁻ with one unpaired electron: allowed in an odd-electron species.` }) }
      else { kind = 'incomplete'; errors.push({ level: 'err', msg: `**${lab[i]} has only ${count} e⁻**: ${a} (period 2) obeys the octet rule rigorously. Make a multiple bond to it.` }) }
    } else {
      if (count === 8) kind = 'ok'
      else if (count > 8) {
        kind = 'expanded'
        oks.push({ level: 'ok', msg: `${lab[i]} has ${count} e⁻: an expanded octet, allowed because ${a} is in period ${per} (empty d orbitals).` })
      } else if (oddSpecies && (w.ue[i] ?? 0) > 0) { kind = 'odd' }
      else { kind = 'incomplete'; errors.push({ level: 'err', msg: `**${lab[i]} has only ${count} e⁻**: it needs at least an octet.` }) }
    }
    const fc = fcs[i]
    infos.push({
      i, el: a, label: lab[i], count, kind, text: String(count), fc,
      calc: `${a}: ${valenceOf(a)} − (${bondsSum} + ${unshared}) = ${fc > 0 ? '+' + fc : fc}`,
      bondsSum, unshared,
    })
  }
  if (!errors.length) {
    const nOctOk = infos.filter((x) => x.kind === 'ok' || x.kind === 'duet').length
    if (nOctOk) oks.push({ level: 'ok', msg: 'Octets/duets satisfied wherever required.' })
  }

  // connectivity of the drawn structure (for generic sanity)
  if (Object.keys(w.bonds).length === 0) errors.push({ level: 'err', msg: 'No bonds drawn.' })

  // targeted hints (learn mode)
  const remain = avail - used
  const deg = (i: number) => s.bonds.filter(([a, b]) => a === i || b === i).length
  const term = infos.filter((x) => x.el !== 'H' && deg(x.i) === 1 && x.count < 8)
  const incompleteAtoms = infos.filter((x) => x.kind === 'incomplete' && x.el !== 'H')
  if (remain > 0) {
    if (term.length) hints.push({ level: 'hint', msg: `Method step 4: complete the octets of the **terminal atoms** first, adding lone pairs in twos (${term.map((x) => x.label).join(', ')} still ${term.length > 1 ? 'need' : 'needs'} electrons).` })
    else hints.push({ level: 'hint', msg: `Method step 5: put the remaining ${remain} e⁻ on the **central atom** in pairs${central != null ? ` (${lab[central]})` : ''}.` })
  } else if (remain < 0) {
    hints.push({ level: 'hint', msg: `You are ${-remain} e⁻ over budget. Did you convert a lone pair into a bond without removing the pair? A new bond *uses* the electrons of one lone pair.` })
  } else if (incompleteAtoms.length) {
    hints.push({ level: 'hint', msg: `Method step 6: ${incompleteAtoms.map((x) => x.label).join(', ')} lacks an octet. Form a **double bond** (click the bond) and remove one lone pair from the terminal atom; use a triple bond only if still short.` })
  }

  // best-structure criteria (only meaningful when valid)
  const valid = errors.length === 0
  const sumAbsFc = fcs.reduce((t, x) => t + Math.abs(x), 0)
  let verdict: Analysis['verdict'] = 'invalid'
  let matchedForm: Analysis['matchedForm']
  if (valid) {
    const big = infos.filter((x) => Math.abs(x.fc) > 1)
    if (big.length) reasons.push({ level: 'warn', msg: `Rule 2 (all |FC| ≤ 1): ${big.map((x) => `${x.label} has FC ${fmt(x.fc)}`).join(', ')}.` })
    const neg = infos.filter((x) => x.fc < 0), pos = infos.filter((x) => x.fc > 0)
    for (const ng of neg) for (const ps of pos) {
      if (enOf(ng.el) < enOf(ps.el)) {
        reasons.push({ level: 'warn', msg: `Rule 3 (negative FC on the most electronegative atom): ${ng.label} (EN ${enOf(ng.el)}) is negative while ${ps.label} (EN ${enOf(ps.el)}) is positive.` })
        break
      }
    }
    const adj = s.bonds.filter(([a, b]) => fcs[a] * fcs[b] > 0)
    adj.forEach(([a, b]) => reasons.push({ level: 'warn', msg: `Adjacent like charges: ${lab[a]} and ${lab[b]} both ${fcs[a] > 0 ? 'positive' : 'negative'} (${fmt(fcs[a])}). Avoid placing like charges on neighbours.` }))
    if (sp) {
      const sig = signature(atoms, s)
      const isBest = sp.best.some((b) => signature(atoms, b) === sig)
      if (isBest) { verdict = 'best'; matchedForm = 'best' }
      else {
        verdict = 'valid'
        const f = sp.forms.find((x) => signature(atoms, x.s) === sig)
        if (f) matchedForm = f.rank
        const refAbs = sp.fc.reduce((t, x) => t + Math.abs(x), 0)
        if (sumAbsFc > refAbs) reasons.push({ level: 'warn', msg: `Rule 1 (FC as close to 0 as possible): your formal charges add up to Σ|FC| = ${sumAbsFc}; the best structure has Σ|FC| = ${refAbs}.` })
        else if (sumAbsFc === refAbs && !reasons.length && !f) reasons.push({ level: 'warn', msg: `Same Σ|FC| as the accepted structure but the arrangement of bonds/charges differs. Compare it with the reference below.` })
        const refSkel = signature(atoms, { bonds: sp.skeleton.map(([a, b]) => [a, b, 1] as Bond), lp: [], ue: [] }, true)
        const mine = signature(atoms, { bonds: s.bonds.map(([a, b]) => [a, b, 1] as Bond), lp: [], ue: [] }, true)
        if (refSkel !== mine) reasons.push({ level: 'warn', msg: 'The atom connectivity differs from the accepted skeleton (central atom / H on O).' })
        if (f?.rank === 'ok') reasons.push({ level: 'info', msg: 'This is a valid, lower-contribution resonance form (acceptable but not the major contributor).' })
        if (f?.rank === 'poor') reasons.push({ level: 'info', msg: 'This resonance form is a poor contributor (large formal charges).' })
        const exp = infos.filter((x) => x.kind === 'expanded').length
        const refExp = sp.best[0] ? countExpanded(atoms, sp.best[0]) : 0
        if (exp !== refExp) reasons.push({ level: 'warn', msg: exp > refExp ? 'You expanded an octet where the best structure keeps the octet.' : 'A period-3+ atom can expand its octet to cancel formal charges (e.g. H₂SO₄, slides 47–52); the best structure does this.' })
      }
    } else {
      verdict = 'valid'
    }
  }
  if (valid && fcSum === charge) oks.push({ level: 'ok', msg: `Formal charges sum to ${fcSum >= 0 ? fcSum : '−' + Math.abs(fcSum)}, equal to the ion charge (${charge === 0 ? '0' : chargeString(charge)}).` })
  return { avail, used, atoms: infos, fcSum, errors, warns, oks, hints, reasons, valid, verdict, matchedForm, sumAbsFc }
}
const fmt = (x: number) => (x > 0 ? `+${x}` : x < 0 ? `−${-x}` : '0')
function countExpanded(atoms: string[], s: Struct): number {
  return atoms.filter((a, i) => periodOf(a) >= 3 && 2 * s.bonds.reduce((t, [x, y, o]) => (x === i || y === i ? t + o : t), 0) + 2 * s.lp[i] + (s.ue[i] ?? 0) > 8).length
}
export const fmtFc = fmt
export { EN, structKey }
