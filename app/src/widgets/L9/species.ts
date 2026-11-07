// Curated Lewis-structure data for L9 / L10 (reused by the VSEPR agent via getSpecies / SPECIES).
// Structures are written as compact strings and expanded at load time; formal charges are COMPUTED
// with the slides' formula  FC = valence e- - [bonds + unshared e-]  so they can never disagree with the drawing.
import { el } from '../../lib/chem/elements'

export type Bond = [number, number, number] // [atomA, atomB, order]
/** One Lewis drawing: bonds, lone pairs per atom, optional unpaired (odd) electrons per atom. */
export interface Struct { bonds: Bond[]; lp: number[]; ue: number[] }
export type Rank = 'best' | 'ok' | 'poor'
export interface ResForm { s: Struct; rank: Rank }

export interface Species {
  /** canonical id, e.g. "SO4^2-" */
  formula: string
  name: string
  charge: number
  /** element symbols, index = atom id used by every structure below */
  atoms: string[]
  /** accepted skeleton connectivity (pairs of atom ids) */
  skeleton: [number, number][]
  /** accepted central atom id(s) */
  central: number[]
  /** equally-best drawings (resonance-equivalent forms are generated into `forms`); best[0] is the canonical one */
  best: Struct[]
  /** formal charges of best[0] */
  fc: number[]
  /** true when the species has resonance forms */
  resonance: boolean
  /** all resonance forms (best[0] alone when there is no resonance) */
  forms: ResForm[]
  /** note shown with resonance (e.g. SO2 octet-obeying forms) */
  resNote?: string
  /** oxoacid: H must sit on O */
  oxoacid: boolean
  notes: string
  slides?: string
}

/* ---------- element data ---------- */
/** Electronegativities as used on the slides (rounded Pauling). */
export const EN: Record<string, number> = {
  H: 2.1, Li: 1.0, Be: 1.5, B: 2.0, C: 2.5, N: 3.0, O: 3.5, F: 4.0, Na: 0.9, Mg: 1.2, Al: 1.5, Si: 1.8,
  P: 2.1, S: 2.5, Cl: 3.0, Br: 2.8, I: 2.5, Xe: 2.6, Te: 2.1, Se: 2.4, As: 2.0, Kr: 3.0, Ge: 1.8, Sn: 1.8,
}
export const enOf = (s: string) => EN[s] ?? 2.5

export function valenceOf(sym: string): number {
  const e = el(sym)
  return e?.valence ?? 0
}
export const periodOf = (sym: string) => el(sym)?.period ?? 2
export const groupOf = (sym: string) => el(sym)?.group ?? 0
/** "6A"-style group label for main-group elements */
export function groupLabel(sym: string): string {
  const g = groupOf(sym)
  if (!g) return '?'
  return (g <= 2 ? g : g - 10) + 'A'
}
/** Expected outer-shell s/p occupancy, e.g. S -> { n: 3, s: 2, p: 4 } ; H -> { n: 1, s: 1, p: 0 } */
export function outerShell(sym: string): { n: number; s: number; p: number } {
  const v = valenceOf(sym)
  const n = periodOf(sym)
  const s = Math.min(v, n === 1 ? 1 : 2)
  return { n, s: n === 1 ? v : s, p: v - (n === 1 ? v : s) }
}

/* ---------- structure helpers ---------- */
export function parseBonds(str: string): Bond[] {
  return str.trim().split(/\s+/).filter(Boolean).map((t) => {
    const [ab, o] = t.split(':')
    const [a, b] = ab.split('-').map(Number)
    return [Math.min(a, b), Math.max(a, b), o ? Number(o) : 1] as Bond
  })
}
export function mkStruct(n: number, bonds: string, lp: string, ue?: string): Struct {
  const l = lp.trim().split(/\s+/).map(Number)
  const u = ue ? ue.trim().split(/\s+/).map(Number) : new Array(n).fill(0)
  return { bonds: parseBonds(bonds), lp: l, ue: u }
}
export function bondOrderSum(s: Struct, i: number): number {
  return s.bonds.reduce((t, [a, b, o]) => (a === i || b === i ? t + o : t), 0)
}
/** slide formula: FC = valence - (bonds + unshared electrons) */
export function formalCharges(atoms: string[], s: Struct): number[] {
  return atoms.map((a, i) => valenceOf(a) - (bondOrderSum(s, i) + 2 * (s.lp[i] ?? 0) + (s.ue[i] ?? 0)))
}
export function totalElectrons(s: Struct): number {
  return s.bonds.reduce((t, b) => t + 2 * b[2], 0) + s.lp.reduce((t, x) => t + 2 * x, 0) + s.ue.reduce((t, x) => t + x, 0)
}
export function degree(s: Struct | [number, number][], i: number): number {
  const edges = Array.isArray(s) ? s.map((e) => [e[0], e[1]]) : s.bonds.map((b) => [b[0], b[1]])
  return edges.filter(([a, b]) => a === i || b === i).length
}
export const structKey = (s: Struct) =>
  s.bonds.map((b) => b.join('-')).sort().join(',') + '|' + s.lp.join('') + '|' + s.ue.join('')

/** Permute equivalent terminal atoms (same element, same single neighbour) to enumerate distinct drawings. */
export function permuteTerminals(atoms: string[], s: Struct): Struct[] {
  const n = atoms.length
  const nbr: number[][] = Array.from({ length: n }, () => [])
  s.bonds.forEach(([a, b]) => { nbr[a].push(b); nbr[b].push(a) })
  const groups = new Map<string, number[]>()
  for (let i = 0; i < n; i++) {
    if (nbr[i].length === 1) {
      const k = atoms[i] + '@' + nbr[i][0]
      groups.set(k, [...(groups.get(k) ?? []), i])
    }
  }
  let perms: number[][] = [Array.from({ length: n }, (_, i) => i)]
  for (const g of groups.values()) {
    if (g.length < 2) continue
    const next: number[][] = []
    const ps = permutations(g)
    for (const base of perms) for (const p of ps) {
      const m = base.slice()
      g.forEach((pos, k) => { m[pos] = p[k] })
      next.push(m)
    }
    perms = next
  }
  const seen = new Map<string, Struct>()
  for (const m of perms) {
    const out: Struct = {
      bonds: s.bonds.map(([a, b, o]) => [Math.min(m[a], m[b]), Math.max(m[a], m[b]), o] as Bond),
      lp: s.lp.map((_, i) => s.lp[m.indexOf(i)]),
      ue: s.ue.map((_, i) => s.ue[m.indexOf(i)]),
    }
    seen.set(structKey(out), out)
  }
  return [...seen.values()]
}
function permutations<T>(a: T[]): T[][] {
  if (a.length <= 1) return [a.slice()]
  return a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((r) => [x, ...r]))
}

/* ---------- charge / formula parsing ---------- */
const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-', '−': '-', '–': '-' }
const SUB: Record<string, string> = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' }
export function chargeFromString(c: string): number {
  if (!c) return 0
  const m = c.match(/^(\d*)([+-])$/) ?? c.match(/^([+-])(\d*)$/)
  if (!m) return 0
  const [sign, num] = /^[+-]$/.test(m[1]) ? [m[1], m[2]] : [m[2], m[1]]
  return (sign === '+' ? 1 : -1) * (num ? Number(num) : 1)
}
export function chargeString(q: number): string {
  if (!q) return ''
  const m = Math.abs(q)
  return (m > 1 ? String(m) : '') + (q > 0 ? '+' : '-')
}
/** "SO₄²⁻", "SO4 2-", "NO3-" -> { base: "SO4", charge: -2 } */
export function splitFormula(raw: string): { base: string; charge: number } {
  let t = raw.trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻−–]/g, (c) => (/[⁺⁻−–]/.test(c) ? SUP[c] : '^' + SUP[c]))
  t = t.replace(/[₀-₉]/g, (c) => SUB[c])
  // superscript digits became "^d": merge into a single charge token
  t = t.replace(/\^(\d)\^?([+-])/g, '^$1$2').replace(/\^([+-])\^?(\d)/g, '^$2$1')
  t = t.replace(/\^\^/g, '^').replace(/\s+/g, ' ')
  let m = t.match(/^(.*?)\s*\^\s*(\d*[+-]|[+-]\d*)$/)
  if (!m) m = t.match(/^(.*?)\s(\d*[+-]|[+-]\d*)$/)
  if (!m) m = t.match(/^(.*[A-Za-z)\d])([+-])$/)
  if (m) return { base: m[1].replace(/\s/g, ''), charge: chargeFromString(m[2]) }
  return { base: t.replace(/\s/g, ''), charge: 0 }
}
/** Expands "SO4", "CH3OH", "Ca(OH)2" into element list (order of appearance, counts expanded). */
export function parseElements(base: string): string[] | null {
  let i = 0
  function group(): string[] {
    const out: string[] = []
    while (i < base.length) {
      const c = base[i]
      if (c === '(') {
        i++
        const inner = group()
        if (base[i] !== ')') throw new Error('paren')
        i++
        const k = num()
        for (let r = 0; r < k; r++) out.push(...inner)
      } else if (c === ')') {
        return out
      } else if (/[A-Z]/.test(c)) {
        let sym = c
        i++
        if (/[a-z]/.test(base[i] ?? '')) { sym += base[i]; i++ }
        if (!el(sym)) throw new Error('el ' + sym)
        const k = num()
        for (let r = 0; r < k; r++) out.push(sym)
      } else throw new Error('char')
    }
    return out
  }
  function num(): number {
    let s = ''
    while (/\d/.test(base[i] ?? '')) { s += base[i]; i++ }
    return s ? Number(s) : 1
  }
  try {
    const r = group()
    return i === base.length && r.length ? r : null
  } catch { return null }
}

/* ---------- the curated list ---------- */
type ResSpec = [bonds: string, lp: string, rank: Rank][]
interface Opts {
  ue?: string
  res?: true | ResSpec
  resNote?: string
  central?: number[]
  notes?: string
  slides?: string
  oxo?: boolean
}
function defSpecies(formula: string, name: string, atomStr: string, bonds: string, lp: string, o: Opts = {}): Species {
  const atoms = atomStr.trim().split(/\s+/)
  const charge = chargeFromString(formula.split('^')[1] ?? '')
  const s0 = mkStruct(atoms.length, bonds, lp, o.ue)
  const skeleton = s0.bonds.map(([a, b]) => [a, b] as [number, number])
  const maxDeg = Math.max(...atoms.map((_, i) => degree(skeleton, i)))
  const central = o.central ?? atoms.map((_, i) => i).filter((i) => degree(skeleton, i) === maxDeg)
  let forms: ResForm[] = [{ s: s0, rank: 'best' }]
  let best: Struct[] = [s0]
  if (o.res === true) {
    best = permuteTerminals(atoms, s0)
    forms = best.map((s) => ({ s, rank: 'best' as Rank }))
  } else if (o.res) {
    forms = []
    for (const [b, l, rank] of o.res) {
      for (const s of permuteTerminals(atoms, mkStruct(atoms.length, b, l))) forms.push({ s, rank })
    }
    best = [s0, ...permuteTerminals(atoms, s0).filter((s) => structKey(s) !== structKey(s0))]
  } else {
    // equal-best alternatives from permuting equivalent terminal atoms are the same drawing; keep them for matching
    best = permuteTerminals(atoms, s0)
  }
  const sp: Species = {
    formula, name, charge, atoms, skeleton, central, best,
    fc: formalCharges(atoms, s0),
    resonance: !!o.res, forms, resNote: o.resNote,
    oxoacid: !!o.oxo, notes: o.notes ?? '', slides: o.slides,
  }
  return sp
}

const D = defSpecies
export const SPECIES: Species[] = [
  // ---- L9 slide examples ----
  D('N2F2', 'dinitrogen difluoride', 'N N F F', '0-1:2 0-2 1-3', '1 1 3 3', { slides: 'L9 s35-36', notes: 'Skeleton F–N–N–F (N central). 24 e⁻; singles + lone pairs leave each N with 6 e⁻, so the N–N bond is upgraded to a double bond.' }),
  D('SiF4', 'silicon tetrafluoride', 'Si F F F F', '0-1 0-2 0-3 0-4', '0 3 3 3 3', { slides: 'L9 s37', notes: '32 e⁻: four Si–F bonds, 3 lone pairs on each F; Si gets an octet from the bonds alone.' }),
  D('H2CO3', 'carbonic acid', 'C O O O H H', '0-1:2 0-2 0-3 2-4 3-5', '0 2 2 2 0 0', { slides: 'L9 s38-39', oxo: true, notes: 'C central, the H atoms sit on O (oxoacid). Single bonds leave C with 6 e⁻, so one O lone pair becomes a C=O bond.' }),
  D('PCl5', 'phosphorus pentachloride', 'P Cl Cl Cl Cl Cl', '0-1 0-2 0-3 0-4 0-5', '0 3 3 3 3 3', { slides: 'L9 s40', notes: 'P ends with 10 e⁻: an expanded octet, allowed because P is in period 3 (empty 3d orbitals).' }),
  D('BBr3', 'boron tribromide', 'B Br Br Br', '0-1 0-2 0-3', '0 3 3 3', { slides: 'L9 s41, s53', notes: 'B has only 6 e⁻ (incomplete octet) but every FC = 0, so no B=Br double bond is formed.' }),
  D('CO2', 'carbon dioxide', 'C O O', '0-1:2 0-2:2', '0 2 2', { slides: 'L9 s42, s54', notes: 'O=C=O has all FC = 0. O–C≡O (FC +1/−1) and O≡C–O drawings also satisfy octets but are worse by the formal-charge criterion.' }),
  D('H2SO4', 'sulfuric acid', 'S O O O O H H', '0-1:2 0-2:2 0-3 0-4 3-5 4-6', '0 2 2 2 2 0 0', { slides: 'L9 s47-52', oxo: true, notes: 'Structure 2: two S=O and two S–OH gives every FC = 0 (S has 12 e⁻, expanded). The all-single structure has S²⁺ and two O⁻. Bond lengths (142 pm vs 157 pm) agree with Structure 2.' }),
  D('NO3^-', 'nitrate ion', 'N O O O', '0-1:2 0-2 0-3', '0 2 3 3', { res: true, slides: 'L9 s56-59', notes: 'Three equivalent resonance forms; each N–O bond has order 4/3.' }),
  D('CO3^2-', 'carbonate ion', 'C O O O', '0-1:2 0-2 0-3', '0 2 3 3', { res: true, slides: 'L9 s60-61', notes: 'Three equivalent forms; each C–O bond has order 4/3 and each O carries −2/3 on average.' }),
  D('NCO^-', 'cyanate ion', 'N C O', '0-1:3 1-2', '1 0 3', {
    res: [['0-1:3 1-2', '1 0 3', 'best'], ['0-1:2 1-2:2', '2 0 2', 'ok'], ['0-1 1-2:3', '3 0 1', 'poor']],
    slides: 'L9 s64-65',
    notes: 'Three non-equivalent forms. N≡C–O⁻ (negative on O, the most electronegative) is best; N=C=O⁻ puts −1 on N (OK); N–C≡O has −2 on N and +1 on O (not acceptable).',
  }),
  D('HClO4', 'perchloric acid', 'Cl O O O O H', '0-1:2 0-2:2 0-3:2 0-4 4-5', '0 2 2 2 2 0', { slides: 'L9 s72', oxo: true, notes: 'Cl central, H on O. Three Cl=O and one Cl–OH makes every FC = 0 (Cl expanded to 14 e⁻).' }),
  D('XeF4', 'xenon tetrafluoride', 'Xe F F F F', '0-1 0-2 0-3 0-4', '2 3 3 3 3', { slides: 'L9 s72, L10', notes: '36 e⁻: Xe keeps 2 lone pairs (12 e⁻ around Xe). FC(Xe) = 8 − (4 + 4) = 0.' }),
  D('I3^-', 'triiodide ion', 'I I I', '0-1 0-2', '3 3 3', { slides: 'L9 s72', notes: '22 e⁻: central I has 3 lone pairs (10 e⁻ in all, expanded) and carries the −1 formal charge.' }),
  D('BrF5', 'bromine pentafluoride', 'Br F F F F F', '0-1 0-2 0-3 0-4 0-5', '1 3 3 3 3 3', { slides: 'L9 s72, L10', notes: '42 e⁻: Br has one lone pair and five bonds (12 e⁻).' }),
  // ---- L10 slide examples ----
  D('TeF4', 'tellurium tetrafluoride', 'Te F F F F', '0-1 0-2 0-3 0-4', '1 3 3 3 3', { slides: 'L10 s26', notes: 'Te has one lone pair (10 e⁻); all FC = 0. Alternatives with Te=F or F⁺ increase formal charges.' }),
  D('SF4', 'sulfur tetrafluoride', 'S F F F F', '0-1 0-2 0-3 0-4', '1 3 3 3 3', { slides: 'L10', notes: '34 e⁻; S has one lone pair (10 e⁻, expanded). See-saw geometry in L10.' }),
  D('ClF3', 'chlorine trifluoride', 'Cl F F F', '0-1 0-2 0-3', '2 3 3 3', { slides: 'L10', notes: '28 e⁻; Cl has two lone pairs (10 e⁻). T-shaped in L10.' }),
  D('XeF2', 'xenon difluoride', 'Xe F F', '0-1 0-2', '3 3 3', { slides: 'L10', notes: '22 e⁻; Xe has three lone pairs (10 e⁻). Linear in L10.' }),
  D('SF6', 'sulfur hexafluoride', 'S F F F F F F', '0-1 0-2 0-3 0-4 0-5 0-6', '0 3 3 3 3 3 3', { slides: 'L10', notes: 'S has 12 e⁻, expanded octet (period 3).' }),
  D('SF4O', 'thionyl tetrafluoride', 'S F F F F O', '0-1 0-2 0-3 0-4 0-5:2', '0 3 3 3 3 2', { slides: 'L10 s12', notes: 'S=O with four S–F bonds; every FC = 0 and S has 12 e⁻. 5 electron domains around S.' }),
  D('XeF4O', 'xenon oxytetrafluoride', 'Xe F F F F O', '0-1 0-2 0-3 0-4 0-5:2', '1 3 3 3 3 2', { slides: 'L10', notes: 'Xe=O with four Xe–F and one lone pair: every FC = 0.' }),
  D('ICl5', 'iodine pentachloride', 'I Cl Cl Cl Cl Cl', '0-1 0-2 0-3 0-4 0-5', '1 3 3 3 3 3', { slides: 'L10 s27', notes: 'I has five bonds + one lone pair (12 e⁻).' }),
  D('BF3', 'boron trifluoride', 'B F F F', '0-1 0-2 0-3', '0 3 3 3', { slides: 'L10', notes: 'B has 6 e⁻, an allowed incomplete octet. The B=F alternative gives B⁻ and F⁺ (positive charge on the most electronegative atom), so it is worse.' }),
  D('BCl3', 'boron trichloride', 'B Cl Cl Cl', '0-1 0-2 0-3', '0 3 3 3', { slides: 'L9 s53, L10 s17', notes: 'All FC = 0 with an incomplete octet on B, so no double bond is needed.' }),
  D('BeCl2', 'beryllium chloride', 'Be Cl Cl', '0-1 0-2', '0 3 3', { slides: 'L9 s32', notes: 'Be has only 4 e⁻ (incomplete octet); linear.' }),
  D('BeH2', 'beryllium hydride', 'Be H H', '0-1 0-2', '0 0 0', { slides: 'L10', notes: 'Be has only 4 e⁻; each H has its duet.' }),
  D('H2O', 'water', 'O H H', '0-1 0-2', '2 0 0', { slides: 'L10', notes: '8 e⁻: two O–H bonds and two lone pairs on O.' }),
  D('NH3', 'ammonia', 'N H H H', '0-1 0-2 0-3', '1 0 0 0', { slides: 'L9 s68', notes: '8 e⁻: three N–H bonds and one lone pair on N.' }),
  D('CH4', 'methane', 'C H H H H', '0-1 0-2 0-3 0-4', '0 0 0 0 0', { slides: 'L9 s24', notes: '8 e⁻: four C–H bonds.' }),
  D('H2S', 'hydrogen sulfide', 'S H H', '0-1 0-2', '2 0 0', { slides: 'L10', notes: 'Same pattern as water.' }),
  D('OF2', 'oxygen difluoride', 'O F F', '0-1 0-2', '2 3 3', { slides: 'L10', notes: 'O is the central atom (less electronegative than F).' }),
  D('OCl2', 'dichlorine monoxide', 'O Cl Cl', '0-1 0-2', '2 3 3', { slides: 'L10', notes: 'O central with two lone pairs.' }),
  D('PF5', 'phosphorus pentafluoride', 'P F F F F F', '0-1 0-2 0-3 0-4 0-5', '0 3 3 3 3 3', { slides: 'L10', notes: 'P has 10 e⁻ (expanded octet).' }),
  D('SO2', 'sulfur dioxide', 'S O O', '0-1:2 0-2:2', '1 2 2', {
    res: [['0-1:2 0-2', '1 2 3', 'best']],
    resNote: 'The resonance view shows the octet-obeying forms O=S⁺–O⁻ ↔ ⁻O–S⁺=O (S has 8 e⁻, FC +1/−1). The slides\' formal-charge rule prefers the expanded S(=O)₂ drawing with every FC = 0.',
    slides: 'L10', notes: 'Best by formal charge: two S=O and one lone pair on S (10 e⁻, every FC = 0). Octet-obeying alternatives are a pair of equivalent resonance forms.',
  }),
  D('SO3', 'sulfur trioxide', 'S O O O', '0-1:2 0-2:2 0-3:2', '0 2 2 2', {
    res: [['0-1:2 0-2 0-3', '0 2 3 3', 'best']],
    resNote: 'The resonance view shows the octet-obeying forms (one S=O, two S–O⁻: S is +2, two O are −1). These are valid Lewis structures too; the slides\' formal-charge rule prefers three S=O with every FC = 0.',
    notes: 'Three S=O: every FC = 0 (S has 12 e⁻, expanded). Octet-obeying forms carry S²⁺ and O⁻.',
  }),
  D('SO4^2-', 'sulfate ion', 'S O O O O', '0-1:2 0-2:2 0-3 0-4', '0 2 2 3 3', { res: true, resNote: 'The all-single "octet" drawing (S²⁺, four O⁻) is also a valid Lewis structure; the slides\' H₂SO₄ rule (smallest formal charges, s47–52) prefers the expanded form with two S=O.', notes: 'Formal-charge-minimised form: two S=O, two S–O⁻ (S FC 0). The all-single octet form has S²⁺. Placing the double bonds on different O atoms gives 6 equivalent forms.' }),
  D('NO2^-', 'nitrite ion', 'N O O', '0-1:2 0-2', '1 2 3', { res: true, notes: 'Two equivalent forms; N–O bond order 1.5.' }),
  D('O3', 'ozone', 'O O O', '0-1:2 0-2', '1 2 3', { res: true, notes: 'Two equivalent forms: O=O⁺–O⁻ ↔ ⁻O–O⁺=O; each O–O bond has order 1.5.' }),
  D('NH4^+', 'ammonium ion', 'N H H H H', '0-1 0-2 0-3 0-4', '0 0 0 0 0', { slides: 'L9 s69-70', notes: 'Coordinate covalent bond: N donates its lone pair to H⁺. Once formed, all four N–H bonds are identical.' }),
  D('H3O^+', 'hydronium ion', 'O H H H', '0-1 0-2 0-3', '1 0 0 0', { slides: 'L9 s69', notes: 'Water donates a lone pair to H⁺ (coordinate covalent bond); O carries +1.' }),
  D('PO4^3-', 'phosphate ion', 'P O O O O', '0-1:2 0-2 0-3 0-4', '0 2 3 3 3', { res: true, resNote: 'The all-single octet drawing (P⁺, four O⁻) is also a valid Lewis structure; by the slides\' formal-charge rule the expanded form with one P=O (FC(P) = 0) is preferred.', notes: 'One P=O and three P–O⁻ gives P an FC of 0 (expanded octet, 10 e⁻); 4 equivalent placements of the double bond.' }),
  D('ClO4^-', 'perchlorate ion', 'Cl O O O O', '0-1:2 0-2:2 0-3:2 0-4', '0 2 2 2 3', { res: true, resNote: 'The all-single octet drawing (Cl³⁺, four O⁻) is also a valid Lewis structure; by the slides\' formal-charge rule (cf. HClO₄, s72) the expanded form with three Cl=O is preferred.', notes: 'Three Cl=O and one Cl–O⁻ gives FC(Cl) = 0 (14 e⁻, expanded); 4 equivalent placements.' }),
  D('HCOO^-', 'formate ion', 'H C O O', '0-1 1-2:2 1-3', '0 0 2 3', { res: true, slides: 'L10 (delocalized MOs)', notes: 'H and both O are bonded to C. Two equivalent forms; each C–O bond has order 1.5.' }),
  D('HNO3', 'nitric acid', 'N O O O H', '0-1:2 0-2 0-3 3-4', '0 2 3 2 0', { res: true, oxo: true, notes: 'H on O (oxoacid). N has FC +1 and the singly bonded terminal O has −1; swapping the two terminal O gives 2 equivalent forms.' }),
  D('H2CO', 'formaldehyde', 'C O H H', '0-1:2 0-2 0-3', '0 2 0 0', { slides: 'L9 s27', notes: 'C=O carbonyl; every FC = 0.' }),
  D('HCN', 'hydrogen cyanide', 'H C N', '0-1 1-2:3', '0 0 1', { slides: 'L10', notes: 'H is never central; C is central. 10 e⁻: C≡N triple bond.' }),
  D('N2', 'nitrogen', 'N N', '0-1:3', '1 1', { slides: 'L10 MO', notes: 'Triple bond; each N has one lone pair.' }),
  D('O2', 'oxygen', 'O O', '0-1:2', '2 2', { slides: 'L10 MO', notes: 'Lewis picture: O=O. (MO theory in L10 explains why O₂ is paramagnetic.)' }),
  D('F2', 'fluorine', 'F F', '0-1', '3 3', { slides: 'L10 MO', notes: 'Single bond, three lone pairs on each F.' }),
  D('NO', 'nitric oxide', 'N O', '0-1:2', '1 2', { ue: '1 0', slides: 'L10 MO', notes: 'Odd-electron species (11 e⁻): N is left with 7 e⁻ and one unpaired electron. All FC = 0.' }),
  D('CN^-', 'cyanide ion', 'C N', '0-1:3', '1 1', { slides: 'L10 MO', notes: '10 e⁻: C≡N with a lone pair on each atom; FC(C) = −1.' }),
  D('CO', 'carbon monoxide', 'C O', '0-1:3', '1 1', { slides: 'L10 MO', notes: 'C≡O is the only drawing giving both atoms octets (FC C −1, O +1).' }),
  D('OCl^-', 'hypochlorite ion', 'O Cl', '0-1', '3 3', { notes: '14 e⁻ − the −1 sits on O, the more electronegative atom.' }),
  D('CH3OH', 'methanol', 'C O H H H H', '0-1 0-2 0-3 0-4 1-5', '0 2 0 0 0 0', { slides: 'L9 s26', notes: 'C bonded to O and 3 H; the last H is on O.' }),
  D('C2H4', 'ethene (ethylene)', 'C C H H H H', '0-1:2 0-2 0-3 1-4 1-5', '0 0 0 0 0 0', { slides: 'L9 s25', notes: '12 e⁻: C=C double bond so each C has an octet.' }),
  D('C2H2', 'ethyne (acetylene)', 'H C C H', '0-1 1-2:3 2-3', '0 0 0 0', { slides: 'L9 s25', notes: '10 e⁻: C≡C triple bond.' }),
  D('C2H6', 'ethane', 'C C H H H H H H', '0-1 0-2 0-3 0-4 1-5 1-6 1-7', '0 0 0 0 0 0 0 0', { slides: 'L9 s24', notes: '14 e⁻: all single bonds.' }),
  D('N2O', 'nitrous oxide', 'N N O', '0-1:3 0-2', '0 1 3', {
    res: [['0-1:3 0-2', '0 1 3', 'best'], ['0-1:2 0-2:2', '0 2 2', 'ok'], ['0-1 0-2:3', '0 3 1', 'poor']],
    slides: 'L9 s67', notes: 'N is the central atom. N≡N⁺–O⁻ puts the negative charge on O (best); N⁻=N⁺=O puts it on N (OK); N⁻²–N⁺≡O⁺ is poor.',
  }),
]

/* ---------- lookup ---------- */
function norm(s: string): string {
  const { base, charge } = splitFormula(s)
  return base + (charge ? '^' + chargeString(charge) : '')
}
const INDEX = new Map<string, Species>()
for (const sp of SPECIES) {
  INDEX.set(norm(sp.formula).toLowerCase(), sp)
  INDEX.set(sp.formula.toLowerCase(), sp)
  INDEX.set(sp.name.toLowerCase(), sp)
}
/** Find a curated species by formula ("SO4^2-", "SO₄²⁻", "SO4 2-", "NO3-"), case-insensitive; also by name. */
export function getSpecies(formula: string): Species | undefined {
  if (!formula) return undefined
  const f = formula.trim()
  const direct = INDEX.get(f.toLowerCase()) ?? INDEX.get(norm(f).toLowerCase())
  if (direct) return direct
  // ions typed without a caret: "SO42-" -> try splitting trailing "<d><sign>"
  const m = f.match(/^(.*[A-Za-z\d])(\d)([+-])$/)
  if (m) {
    const c = INDEX.get((m[1] + '^' + m[2] + m[3]).toLowerCase())
    if (c) return c
  }
  return undefined
}
/** Human label e.g. "SO4^2-  sulfate ion" */
export const speciesLabel = (sp: Species) => `${sp.formula} — ${sp.name}`
export function totalValence(atoms: string[], charge: number) {
  return atoms.reduce((t, a) => t + valenceOf(a), 0) - charge
}
