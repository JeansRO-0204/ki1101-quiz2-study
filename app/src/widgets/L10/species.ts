// Curated species for the L10 widgets (VSEPR, polarity, hybridization, σ/π).
// Formula string format: "SO4^2-". Lewis structures are the formal-charge-preferred ones taught in L9
// (e.g. S=O double bonds for S compounds, N≡C–O⁻ for NCO⁻).
import { el } from '../../lib/chem/elements'
import { add, buildLayout, mul, norm, shapeOf, type Layout, type Shape, type V3, len, EG_BY_DOMAINS, type EG } from './geom'

export interface Lig { sym: string; order: 1 | 2 | 3 }
export interface Species {
  id: string
  name: string
  centre: string
  lig: Lig[]
  /** lone pairs on the central atom */
  lp: number
  charge: number
  /** ground truth polarity of the whole molecule/ion (slides' symmetry rules) */
  polar: boolean
  /** whole-molecule σ/π counts when ligands are not all terminal (C2H4, C2H2) */
  whole?: { sigma: number; pi: number }
  note?: string
  /** false when the one-centre dipole picture is misleading (multi-centre molecules / formal-charge dipoles) */
  polarityOk?: boolean
}

function parse(s: string): Lig[] {
  return s.trim().split(/\s+/).map((t) => {
    const m = /^([A-Z][a-z]?)([=#])?$/.exec(t)!
    return { sym: m[1], order: m[2] === '=' ? 2 : m[2] === '#' ? 3 : 1 }
  })
}
const rep = (s: string, n: number) => Array(n).fill(s).join(' ')
function sp(id: string, name: string, centre: string, lig: string, lp: number, polar: boolean, extra: Partial<Species> = {}): Species {
  const m = /\^(\d*)([+-])$/.exec(id)
  const charge = m ? (m[2] === '+' ? 1 : -1) * (m[1] ? Number(m[1]) : 1) : 0
  return { id, name, centre, lig: parse(lig), lp, charge, polar, ...extra }
}

export const SPECIES: Species[] = [
  // 2 domains
  sp('BeH2', 'beryllium hydride', 'Be', rep('H', 2), 0, false),
  sp('BeCl2', 'beryllium chloride', 'Be', rep('Cl', 2), 0, false),
  sp('CO2', 'carbon dioxide', 'C', 'O= O=', 0, false),
  sp('HCN', 'hydrogen cyanide', 'C', 'H N#', 0, true, { note: 'Central atom: C (H–C≡N).' }),
  sp('NCO^-', 'cyanate ion', 'C', 'N# O', 0, true, { note: 'Preferred Lewis structure N≡C–O⁻ (L9). Central atom: C.' }),
  sp('N2', 'nitrogen', 'N', 'N#', 1, false, { note: 'Diatomic: each N has one lone pair and a triple bond.' }),
  // 3 domains
  sp('BF3', 'boron trifluoride', 'B', rep('F', 3), 0, false),
  sp('BCl3', 'boron trichloride', 'B', rep('Cl', 3), 0, false),
  sp('BBr3', 'boron tribromide', 'B', rep('Br', 3), 0, false),
  sp('BClF2', 'chlorodifluoroborane', 'B', 'Cl F F', 0, true),
  sp('SO3', 'sulfur trioxide', 'S', 'O= O= O=', 0, false, { note: 'Formal-charge-minimised structure with three S=O.' }),
  sp('NO3^-', 'nitrate ion', 'N', 'O= O O', 0, false, { note: 'One of three equivalent resonance structures is drawn.' }),
  sp('CO3^2-', 'carbonate ion', 'C', 'O= O O', 0, false, { note: 'One of three equivalent resonance structures is drawn.' }),
  sp('H2CO', 'formaldehyde', 'C', 'O= H H', 0, true),
  sp('C2H4', 'ethene', 'C', 'H H C=', 0, false, { whole: { sigma: 5, pi: 1 }, polarityOk: false, note: 'Geometry shown around ONE carbon (the other C is a ligand).' }),
  sp('SO2', 'sulfur dioxide', 'S', 'O= O=', 1, true, { note: 'Formal-charge-minimised structure O=S=O with a lone pair on S.' }),
  sp('O3', 'ozone', 'O', 'O= O', 1, true, { polarityOk: false, note: 'Both O–O bonds have ΔEN = 0, yet O3 is polar (0.53 D) because the central O carries a formal + charge and the molecule is bent.' }),
  // 4 domains
  sp('CH4', 'methane', 'C', rep('H', 4), 0, false),
  sp('CCl4', 'carbon tetrachloride', 'C', rep('Cl', 4), 0, false),
  sp('SiF4', 'silicon tetrafluoride', 'Si', rep('F', 4), 0, false),
  sp('CH2Cl2', 'dichloromethane', 'C', 'H H Cl Cl', 0, true),
  sp('CHCl3', 'chloroform', 'C', 'H Cl Cl Cl', 0, true),
  sp('NH4^+', 'ammonium ion', 'N', rep('H', 4), 0, false),
  sp('SO4^2-', 'sulfate ion', 'S', 'O= O= O O', 0, false, { note: 'Formal-charge-minimised structure (two S=O, two S–O⁻); the ion is symmetric through resonance.' }),
  sp('NH3', 'ammonia', 'N', rep('H', 3), 1, true),
  sp('H2O', 'water', 'O', 'H H', 2, true),
  sp('H2S', 'hydrogen sulfide', 'S', 'H H', 2, true, { note: 'Experimental angle ≈ 92° (slide 48): close to the 90° of plain p-orbital overlap.' }),
  sp('OF2', 'oxygen difluoride', 'O', 'F F', 2, true),
  sp('OCl2', 'oxygen dichloride', 'O', 'Cl Cl', 2, true),
  sp('ClF2^+', 'difluorochloronium ion', 'Cl', 'F F', 2, true),
  sp('HCl', 'hydrogen chloride', 'Cl', 'H', 3, true, { note: 'Diatomic: no bond angle.' }),
  // 5 domains
  sp('PCl5', 'phosphorus pentachloride', 'P', rep('Cl', 5), 0, false),
  sp('PF5', 'phosphorus pentafluoride', 'P', rep('F', 5), 0, false),
  sp('SF4O', 'thionyl tetrafluoride', 'S', 'O= F F F F', 0, true, { note: 'S has 5 domains (slide 12). The S=O oxygen sits in an equatorial position.' }),
  sp('SF4', 'sulfur tetrafluoride', 'S', rep('F', 4), 1, true),
  sp('SeF4', 'selenium tetrafluoride', 'Se', rep('F', 4), 1, true),
  sp('TeF4', 'tellurium tetrafluoride', 'Te', rep('F', 4), 1, true, { note: 'Best Lewis structure has 4 Te–F single bonds and one lone pair on Te (slide 26).' }),
  sp('ClF3', 'chlorine trifluoride', 'Cl', rep('F', 3), 2, true),
  sp('XeF2', 'xenon difluoride', 'Xe', rep('F', 2), 3, false),
  sp('I3^-', 'triiodide ion', 'I', 'I I', 3, false, { note: 'Central I carries the 1− charge and three lone pairs.' }),
  // 6 domains
  sp('SF6', 'sulfur hexafluoride', 'S', rep('F', 6), 0, false),
  sp('BrF5', 'bromine pentafluoride', 'Br', rep('F', 5), 1, true),
  sp('IF5', 'iodine pentafluoride', 'I', rep('F', 5), 1, true),
  sp('ICl5', 'iodine pentachloride', 'I', rep('Cl', 5), 1, true),
  sp('XeF4O', 'xenon oxytetrafluoride', 'Xe', 'O= F F F F', 1, true, { note: 'O sits trans to the lone pair (slide 78).' }),
  sp('XeF4', 'xenon tetrafluoride', 'Xe', rep('F', 4), 2, false),
  sp('ICl4^-', 'tetrachloroiodate ion', 'I', rep('Cl', 4), 2, false),
  // multiple bond carbons (whole molecule counts)
  sp('C2H2', 'ethyne (acetylene)', 'C', 'H C#', 0, false, { whole: { sigma: 3, pi: 2 }, polarityOk: false, note: 'Geometry shown around ONE carbon (H–C≡C–H is linear).' }),
]

export const SPECIES_BY_ID = new Map(SPECIES.map((s) => [s.id, s]))
export const findSpecies = (id: string) => SPECIES_BY_ID.get(id.replace(/\s/g, '').replace(/[⁺]/g, '+').replace(/[⁻−]/g, '-'))

/* ---------- electronegativity ---------- */
const EN_FALLBACK: Record<string, number> = { H: 2.1, Be: 1.5, B: 2.0, C: 2.5, N: 3.0, O: 3.5, F: 4.0, Si: 1.8, P: 2.1, S: 2.5, Cl: 3.0, Se: 2.4, Br: 2.8, Te: 2.1, I: 2.5, Xe: 2.6 }
export const enOf = (sym: string) => el(sym)?.en ?? EN_FALLBACK[sym] ?? 2.5

/* ---------- derived properties ---------- */
export type Hyb = 'sp' | 'sp2' | 'sp3' | 'sp3d' | 'sp3d2'
export const HYB_BY_DOMAINS: Record<number, Hyb> = { 2: 'sp', 3: 'sp2', 4: 'sp3', 5: 'sp3d', 6: 'sp3d2' }
export const HYB_LABEL: Record<Hyb, string> = { sp: 'sp', sp2: 'sp²', sp3: 'sp³', sp3d: 'sp³d', sp3d2: 'sp³d²' }
export const HYB_ANGLE: Record<Hyb, string> = { sp: '180°', sp2: '120°', sp3: '109.5°', sp3d: '90° and 120°', sp3d2: '90°' }

export interface Info {
  sp: Species
  nb: number
  lp: number
  dom: number
  eg: EG
  shape: Shape
  hyb: Hyb
  /** σ and π bonds at the central atom */
  sigmaC: number
  piC: number
  /** σ/π in the whole species */
  sigma: number
  pi: number
  /** valence e⁻ of the neutral central atom */
  v: number
  /** formal charge of the central atom in the drawn structure */
  fc: number
  /** electrons the central atom "owns" in the drawn structure (σ + π + 2·lp) */
  ce: number
  period: number
}
export function analyze(s: Species): Info {
  const nb = s.lig.length
  const dom = nb + s.lp
  const shape = shapeOf(nb, s.lp)
  const piC = s.lig.reduce((a, l) => a + l.order - 1, 0)
  const ce = nb + piC + 2 * s.lp
  const e = el(s.centre)!
  const v = e.valence ?? 0
  return {
    sp: s, nb, lp: s.lp, dom, eg: EG_BY_DOMAINS[dom] ?? shape.eg, shape, hyb: HYB_BY_DOMAINS[dom] ?? 'sp',
    sigmaC: nb, piC, sigma: s.whole?.sigma ?? nb, pi: s.whole?.pi ?? piC, v, fc: v - ce, ce, period: e.period,
  }
}

/** Bonded ligands in placement priority (equatorial-preferring first: multiple bonds, then less electronegative). */
export function orderedLigands(s: Species): Lig[] {
  return [...s.lig].sort((a, b) => b.order - a.order || enOf(a.sym) - enOf(b.sym))
}
export function layoutOf(s: Species): Layout<Lig> {
  return buildLayout(orderedLigands(s), s.lp)
}

export interface DipoleResult {
  /** per bond: vector from centre to ligand, signed so that the arrow points to the negative (more electronegative) end */
  bonds: { dir: V3; dEN: number; towardLig: boolean; lig: Lig; vec: V3 }[]
  net: V3
  mag: number
  polar: boolean
}
export function dipoles(s: Species): DipoleResult {
  const L = layoutOf(s)
  const cEN = enOf(s.centre)
  let net: V3 = [0, 0, 0]
  const bonds = L.bonds.map(({ dir, item }) => {
    const d = enOf(item.sym) - cEN
    const towardLig = d >= 0
    const vec = mul(dir, towardLig ? Math.abs(d) : -Math.abs(d))
    net = add(net, vec)
    return { dir, dEN: Math.abs(d), towardLig, lig: item, vec }
  })
  const mag = len(net)
  return { bonds, net: norm(net), mag, polar: mag > 0.05 }
}

/* ---------- text helpers ---------- */
export const ORDER_NAME = { 1: 'single', 2: 'double', 3: 'triple' } as const
export function ligandSummary(s: Species): string {
  const groups = new Map<string, number>()
  for (const l of s.lig) { const k = `${l.sym}|${l.order}`; groups.set(k, (groups.get(k) ?? 0) + 1) }
  return [...groups].map(([k, n]) => { const [sym, o] = k.split('|'); return `${n > 1 ? n + ' × ' : ''}${sym} (${ORDER_NAME[Number(o) as 1 | 2 | 3]} bond${n > 1 ? 's' : ''})` }).join(', ')
}
export function lpExplain(i: Info): string {
  const { sp: s } = i
  const bondsTotal = i.nb + i.piC
  const chargeTxt = i.fc === 0 ? '' : i.fc > 0 ? ` (this Lewis structure gives ${s.centre} a formal charge of +${i.fc}, so count ${i.v - i.fc} valence e⁻)` : ` (this Lewis structure gives ${s.centre} a formal charge of ${i.fc}, so count ${i.v - i.fc} valence e⁻)`
  return `${s.centre} has ${i.v} valence e⁻${chargeTxt}; its ${bondsTotal} bond${bondsTotal > 1 ? 's' : ''} use ${bondsTotal} e⁻ → ${i.ce - bondsTotal} e⁻ left = ${i.lp} lone pair${i.lp === 1 ? '' : 's'}.`
}
export const MG_TITLE = (m: string) => m
