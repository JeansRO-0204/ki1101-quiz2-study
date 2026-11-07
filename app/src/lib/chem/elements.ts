// Periodic table data. Positions and electron configurations are computed here.
// PROPS (electronegativity, ionization energy, electron affinity, radius) is filled in by the L7 widget agent.

const SYM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ')
const NAME = 'Hydrogen Helium Lithium Beryllium Boron Carbon Nitrogen Oxygen Fluorine Neon Sodium Magnesium Aluminium Silicon Phosphorus Sulfur Chlorine Argon Potassium Calcium Scandium Titanium Vanadium Chromium Manganese Iron Cobalt Nickel Copper Zinc Gallium Germanium Arsenic Selenium Bromine Krypton Rubidium Strontium Yttrium Zirconium Niobium Molybdenum Technetium Ruthenium Rhodium Palladium Silver Cadmium Indium Tin Antimony Tellurium Iodine Xenon Caesium Barium Lanthanum Cerium Praseodymium Neodymium Promethium Samarium Europium Gadolinium Terbium Dysprosium Holmium Erbium Thulium Ytterbium Lutetium Hafnium Tantalum Tungsten Rhenium Osmium Iridium Platinum Gold Mercury Thallium Lead Bismuth Polonium Astatine Radon Francium Radium Actinium Thorium Protactinium Uranium Neptunium Plutonium Americium Curium Berkelium Californium Einsteinium Fermium Mendelevium Nobelium Lawrencium Rutherfordium Dubnium Seaborgium Bohrium Hassium Meitnerium Darmstadtium Roentgenium Copernicium Nihonium Flerovium Moscovium Livermorium Tennessine Oganesson'.split(' ')

export type Block = 's' | 'p' | 'd' | 'f'
export type Category = 'alkali' | 'alkaline-earth' | 'transition' | 'post-transition' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble-gas' | 'lanthanide' | 'actinide'

export interface Element {
  z: number; symbol: string; name: string
  period: number
  /** 1–18; null for lanthanides/actinides (shown in the f-block rows) */
  group: number | null
  block: Block
  category: Category
  /** valence electrons for main-group (groups 1,2,13–18; He = 2); null for d/f block */
  valence: number | null
  /** subshell occupancy in Aufbau order incl. known exceptions, e.g. [["1s",2],["2s",2],["2p",4]] */
  config: [string, number][]
  /** Pauling electronegativity */
  en?: number
  /** first ionization energy, kJ/mol */
  ie1?: number
  /** electron affinity, kJ/mol, sign convention: energy RELEASED is negative (e.g. Cl −349) */
  ea?: number
  /** atomic (covalent/metallic) radius, pm */
  radius?: number
  /** common ion charges, e.g. [2,3] for Fe */
  ions?: number[]
}

export const AUFBAU = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p']
export const CAP: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 }

/** Known ground-state exceptions (only the subshells that differ from Aufbau). */
const EXCEPTIONS: Record<number, Record<string, number>> = {
  24: { '4s': 1, '3d': 5 }, 29: { '4s': 1, '3d': 10 },
  41: { '5s': 1, '4d': 4 }, 42: { '5s': 1, '4d': 5 }, 44: { '5s': 1, '4d': 7 }, 45: { '5s': 1, '4d': 8 }, 46: { '5s': 0, '4d': 10 }, 47: { '5s': 1, '4d': 10 },
  57: { '4f': 0, '5d': 1 }, 58: { '4f': 1, '5d': 1 }, 64: { '4f': 7, '5d': 1 },
  78: { '6s': 1, '5d': 9 }, 79: { '6s': 1, '5d': 10 },
  89: { '5f': 0, '6d': 1 }, 90: { '5f': 0, '6d': 2 }, 91: { '5f': 2, '6d': 1 }, 92: { '5f': 3, '6d': 1 }, 93: { '5f': 4, '6d': 1 }, 96: { '5f': 7, '6d': 1 },
}
export const IS_EXCEPTION = (z: number) => z in EXCEPTIONS

/** Pure Aufbau filling (no exceptions) — useful for "what would the naive answer be" feedback. */
export function aufbau(z: number): [string, number][] {
  const out: [string, number][] = []
  let left = z
  for (const sub of AUFBAU) {
    if (left <= 0) break
    const n = Math.min(left, CAP[sub[1]])
    out.push([sub, n]); left -= n
  }
  return out
}
function groundConfig(z: number): [string, number][] {
  const base = aufbau(z)
  const ex = EXCEPTIONS[z]
  if (!ex) return base
  const m = new Map(base)
  for (const [k, v] of Object.entries(ex)) m.set(k, v)
  return AUFBAU.filter((s) => (m.get(s) ?? 0) > 0).map((s) => [s, m.get(s)!])
}

function position(z: number): { period: number; group: number | null; block: Block } {
  const starts = [1, 3, 11, 19, 37, 55, 87, 119]
  const period = starts.findIndex((s, i) => z >= s && z < starts[i + 1]) + 1
  const i = z - starts[period - 1] // 0-based index within period
  if (period === 1) return { period, group: z === 1 ? 1 : 18, block: 's' }
  if (period <= 3) {
    if (i < 2) return { period, group: i + 1, block: 's' }
    return { period, group: i + 10 + 1 - 0, block: 'p' } // i=2 → group 13
  }
  if (period <= 5) {
    if (i < 2) return { period, group: i + 1, block: 's' }
    if (i < 12) return { period, group: i + 1, block: 'd' }
    return { period, group: i + 1, block: 'p' }
  }
  // periods 6, 7: s(2) f(14, incl. La/Ac as group 3 position held by f row here) d(10) p(6)
  if (i < 2) return { period, group: i + 1, block: 's' }
  if (i < 16) return { period, group: null, block: 'f' } // La–Yb / Ac–No
  if (i < 26) return { period, group: i - 13, block: 'd' } // Lu/Lr → 3
  return { period, group: i - 13, block: 'p' }
}

const METALLOIDS = new Set([5, 14, 32, 33, 51, 52])
const NONMETALS = new Set([1, 6, 7, 8, 15, 16, 34])
function category(z: number, group: number | null, period: number): Category {
  if (group === null) return period === 6 ? 'lanthanide' : 'actinide'
  if (group === 18) return 'noble-gas'
  if (z === 1) return 'nonmetal'
  if (group === 1) return 'alkali'
  if (group === 2) return 'alkaline-earth'
  if (group >= 3 && group <= 12) return 'transition'
  if (group === 17) return 'halogen'
  if (METALLOIDS.has(z)) return 'metalloid'
  if (NONMETALS.has(z)) return 'nonmetal'
  return 'post-transition'
}

/** Filled in by the L7 agent: Pauling EN, IE1 (kJ/mol), EA (kJ/mol, released = negative), radius (pm), common ions. */
/**
 * Periodic properties. Columns: symbol, Pauling EN (L8 s33 table values: H 2.1, F 4.1, Cl 2.9...), IE1 kJ/mol (L7 s42 for Z=1-18),
 * EA kJ/mol (released = negative; "-" = no stable anion / ~0, as in the L7 s43 graph), atomic radius pm (calculated set used in the
 * L7 s40 plot: Li 167, Na 190, K 243, Cs 298 ...), common ion charges (comma-separated).
 */
const PROP_ROWS = `
H 2.1 1312 -72.8 53 1,-1
He - 2372 - 31 -
Li 1.0 520.2 -59.6 167 1
Be 1.5 899.4 - 112 2
B 2.0 800.6 -26.7 87 3
C 2.5 1086 -121.8 67 4,-4
N 3.1 1402 - 56 -3
O 3.5 1314 -141 48 -2
F 4.1 1681 -328 42 -1
Ne - 2081 - 38 -
Na 1.0 495.6 -52.9 190 1
Mg 1.3 737.7 - 145 2
Al 1.5 577.6 -42.5 118 3
Si 1.8 786.4 -134.1 111 4
P 2.1 1012 -72.0 98 -3
S 2.4 999.6 -200.4 88 -2
Cl 2.9 1251 -348.6 79 -1
Ar - 1520 - 71 -
K 0.9 418.8 -48.4 243 1
Ca 1.1 589.8 - 194 2
Sc 1.2 633.1 -18.1 184 3
Ti 1.3 658.8 -7.6 176 4,3,2
V 1.5 650.9 -50.6 171 3,2,4,5
Cr 1.6 652.9 -64.3 166 3,2,6
Mn 1.6 717.3 - 161 2,4,7
Fe 1.7 762.5 -15.7 156 2,3
Co 1.7 760.4 -63.7 152 2,3
Ni 1.8 737.1 -112 149 2
Cu 1.8 745.5 -118.4 145 2,1
Zn 1.7 906.4 - 142 2
Ga 1.8 578.8 -41 136 3
Ge 2.0 762 -119 125 4,2
As 2.2 947 -78 114 -3,3,5
Se 2.5 941 -195 103 -2
Br 2.8 1140 -324.6 94 -1
Kr 3.0 1351 - 88 -
Rb 0.9 403 -46.9 265 1
Sr 1.0 549.5 -5 219 2
Y 1.1 600 -29.6 212 3
Zr 1.2 640.1 -41.1 206 4
Nb 1.3 652.1 -86.1 198 5,3
Mo 1.3 684.3 -71.9 190 6,4
Tc 1.4 702 -53 183 7,4
Ru 1.4 710.2 -101.3 178 3,4
Rh 1.5 719.7 -109.7 173 3
Pd 1.4 804.4 -53.7 169 2,4
Ag 1.4 731 -125.6 165 1
Cd 1.5 867.8 - 161 2
In 1.5 558.3 -37 156 3,1
Sn 1.7 708.6 -107.3 145 2,4
Sb 1.8 834 -101 133 3,5,-3
Te 2.0 869.3 -190.2 123 -2,4,6
I 2.2 1008.4 -295.2 115 -1
Xe 2.6 1170.4 - 108 -
Cs 0.9 375.7 -45.5 298 1
Ba 0.9 502.9 -14 253 2
La 1.1 538.1 -48 226 3
Ce 1.1 534.4 -50 - 3,4
Pr 1.1 527 - - 3
Nd 1.1 533.1 - - 3
Pm 1.1 538 - - 3
Sm 1.2 544.5 - - 3,2
Eu 1.1 547.1 - - 3,2
Gd 1.2 593.4 - - 3
Tb 1.1 565.8 - - 3
Dy 1.2 573 - - 3
Ho 1.2 581 - - 3
Er 1.2 589.3 - - 3
Tm 1.2 596.7 - - 3
Yb 1.1 603.4 - - 3,2
Lu 1.2 523.5 - - 3
Hf 1.2 658.5 -14.5 208 4
Ta 1.4 761 -31 200 5
W 1.4 770 -78.6 193 6,4
Re 1.5 760 -14.5 188 7,4
Os 1.5 840 -106 185 4,8
Ir 1.6 880 -151 180 3,4
Pt 1.5 870 -205 177 2,4
Au 1.4 890.1 -222.8 174 1,3
Hg 1.5 1007.1 - 171 2,1
Tl 1.5 589.4 -19.2 156 1,3
Pb 1.6 715.6 -35.1 154 2,4
Bi 1.7 703 -91.2 143 3,5
Po 1.8 812 -183 135 4,2
At 2.0 920 -270 127 -1
Rn - 1037 - 120 -
Fr 0.9 380 -47 - 1
Ra 0.9 509.3 - - 2
Ac 1.0 499 -34 - 3
Th 1.1 587 - - 4
U 1.2 597.6 - - 6,4
`
export const PROPS: Record<string, Partial<Pick<Element, 'en' | 'ie1' | 'ea' | 'radius' | 'ions'>>> = (() => {
  const out: Record<string, Partial<Pick<Element, 'en' | 'ie1' | 'ea' | 'radius' | 'ions'>>> = {}
  for (const line of PROP_ROWS.trim().split('\n')) {
    const [sym, en, ie1, ea, radius, ions] = line.trim().split(/\s+/)
    const p: Partial<Pick<Element, 'en' | 'ie1' | 'ea' | 'radius' | 'ions'>> = {}
    if (en !== '-') p.en = Number(en)
    if (ie1 !== '-') p.ie1 = Number(ie1)
    if (ea !== '-') p.ea = Number(ea)
    if (radius !== '-') p.radius = Number(radius)
    if (ions !== '-') p.ions = ions.split(',').map(Number)
    out[sym] = p
  }
  return out
})()

export const ELEMENTS: Element[] = SYM.map((symbol, idx) => {
  const z = idx + 1
  const { period, group, block } = position(z)
  const valence = group === null ? null : group <= 2 ? group : group >= 13 ? (z === 2 ? 2 : group - 10) : null
  return { z, symbol, name: NAME[idx], period, group, block, category: category(z, group, period), valence, config: groundConfig(z), ...PROPS[symbol] }
})
export const BY_SYMBOL = new Map(ELEMENTS.map((e) => [e.symbol, e]))
export const el = (symOrZ: string | number) => (typeof symOrZ === 'number' ? ELEMENTS[symOrZ - 1] : BY_SYMBOL.get(symOrZ))

const NOBLE = [2, 10, 18, 36, 54, 86, 118]
/** "[Ar] 4s2 3d6" style string (plain digits; render with superscripts in UI). */
export function configString(z: number, opts: { core?: boolean } = { core: true }): string {
  const cfg = el(z)!.config
  if (!opts.core) return cfg.map(([s, n]) => s + n).join(' ')
  const core = [...NOBLE].reverse().find((n) => n < z)
  if (!core) return cfg.map(([s, n]) => s + n).join(' ')
  const coreSubs = new Set(el(core)!.config.map(([s]) => s))
  return `[${el(core)!.symbol}] ` + cfg.filter(([s]) => !coreSubs.has(s)).map(([s, n]) => s + n).join(' ')
}
