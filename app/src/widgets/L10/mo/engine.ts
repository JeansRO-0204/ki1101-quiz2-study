// MO-theory engine: species table, level layouts, Aufbau/Hund filling, bond order, magnetism.
// Conventions follow the L10 slides (s100-s132): valence electrons only for 2nd-row species (1s cores ignored, s118),
// all electrons for the 1s species (H2, He2...). s-p mixing (pi2p below sigma2p) for Li2-N2, normal order for O2-Ne2.

export type Order = 'mix' | 'normal'
export type Why = '1s' | 'mix' | 'norm' | 'avg' | 'exp' | 'iso'

export interface Species {
  id: string
  A: string
  B: string
  charge: number
  kind: '1s' | '2p'
  /** the correct ordering for this species */
  order: Order
  why: Why
  /** true if the ordering/species goes beyond what the slides do */
  beyond?: boolean
  family?: string
  group: string
}

export const VALENCE: Record<string, number> = { H: 1, He: 2, Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8 }
/** Electronegativities as on L8 s33 (used only to draw the more electronegative atom lower). */
export const EN: Record<string, number> = { H: 2.1, He: 0, Li: 1.0, Be: 1.5, B: 2.0, C: 2.5, N: 3.1, O: 3.5, F: 4.1, Ne: 0 }

function chargeSuffix(q: number) {
  if (q === 0) return ''
  const m = Math.abs(q)
  return '^' + (m === 1 ? '' : String(m)) + (q > 0 ? '+' : '-')
}
function mk(A: string, B: string, charge: number, order: Order, why: Why, group: string, extra: Partial<Species> = {}): Species {
  const id = (A === B ? A + '2' : A + B) + chargeSuffix(charge)
  return { id, A, B, charge, kind: A === 'H' || A === 'He' ? '1s' : '2p', order, why, group, ...extra }
}

export const SPECIES: Species[] = [
  mk('H', 'H', 0, 'normal', '1s', '1s species', { family: 'h' }),
  mk('H', 'H', 1, 'normal', '1s', '1s species', { family: 'h' }),
  mk('H', 'H', -1, 'normal', '1s', '1s species', { family: 'h' }),
  mk('He', 'He', 0, 'normal', '1s', '1s species', { family: 'h' }),
  mk('He', 'He', 1, 'normal', '1s', '1s species', { family: 'h' }),
  mk('Li', 'Li', 0, 'mix', 'mix', 'Homonuclear Li₂ – N₂'),
  mk('Be', 'Be', 0, 'mix', 'mix', 'Homonuclear Li₂ – N₂'),
  mk('B', 'B', 0, 'mix', 'mix', 'Homonuclear Li₂ – N₂'),
  mk('C', 'C', 0, 'mix', 'mix', 'Homonuclear Li₂ – N₂', { family: 'c2' }),
  mk('N', 'N', 0, 'mix', 'mix', 'Homonuclear Li₂ – N₂', { family: 'n2' }),
  mk('O', 'O', 0, 'normal', 'norm', 'Homonuclear O₂ – Ne₂', { family: 'o2' }),
  mk('F', 'F', 0, 'normal', 'norm', 'Homonuclear O₂ – Ne₂'),
  mk('Ne', 'Ne', 0, 'normal', 'norm', 'Homonuclear O₂ – Ne₂'),
  mk('Li', 'Li', 1, 'mix', 'mix', 'Ions', { beyond: true }),
  mk('B', 'B', 1, 'mix', 'mix', 'Ions', { beyond: true }),
  mk('C', 'C', 1, 'mix', 'mix', 'Ions', { family: 'c2' }),
  mk('C', 'C', -2, 'mix', 'mix', 'Ions', { family: 'c2' }),
  mk('N', 'N', 1, 'mix', 'mix', 'Ions', { family: 'n2' }),
  mk('N', 'N', -1, 'mix', 'mix', 'Ions', { family: 'n2' }),
  mk('O', 'O', 1, 'normal', 'norm', 'Ions', { family: 'o2' }),
  mk('O', 'O', -1, 'normal', 'norm', 'Ions', { family: 'o2' }),
  mk('O', 'O', -2, 'normal', 'norm', 'Ions', { family: 'o2' }),
  mk('F', 'F', 1, 'normal', 'norm', 'Ions', { beyond: true }),
  mk('F', 'F', -1, 'normal', 'norm', 'Ions', { beyond: true }),
  mk('N', 'O', 0, 'normal', 'exp', 'Heteronuclear', { family: 'no' }),
  mk('N', 'O', 1, 'normal', 'exp', 'Heteronuclear', { family: 'no' }),
  mk('N', 'O', -1, 'normal', 'exp', 'Heteronuclear', { family: 'no' }),
  mk('N', 'F', 0, 'normal', 'avg', 'Heteronuclear'),
  mk('B', 'C', 0, 'mix', 'mix', 'Heteronuclear'),
  mk('C', 'O', 0, 'mix', 'iso', 'Heteronuclear', { beyond: true, family: 'iso' }),
  mk('C', 'N', -1, 'mix', 'iso', 'Heteronuclear', { beyond: true, family: 'iso' }),
  mk('N', 'O', 1, 'normal', 'exp', 'Heteronuclear', { family: 'no' }),
].filter((s, i, a) => a.findIndex((x) => x.id === s.id) === i)

/** Families used for the "rank by bond length / energy" step. */
export const FAMILIES: Record<string, string[]> = {
  h: ['H2', 'H2^+', 'H2^-', 'He2^+'],
  c2: ['C2^2-', 'C2', 'C2^+'],
  n2: ['N2', 'N2^+', 'N2^-'],
  o2: ['O2^+', 'O2', 'O2^-', 'O2^2-'],
  no: ['NO^+', 'NO', 'NO^-'],
  iso: ['CO', 'CN^-', 'NO^+', 'N2'],
}

export function findSpecies(id: string): Species | undefined {
  const t = id.replace(/\s/g, '')
  const hit = SPECIES.find((s) => s.id === t)
  if (hit) return hit
  const alt = t.replace(/^([A-Za-z]+\d?)(\d?[+-])$/, '$1^$2')
  return SPECIES.find((x) => x.id === alt)
}

export const neutralElectrons = (s: Species) => VALENCE[s.A] + VALENCE[s.B]
export const totalElectrons = (s: Species) => neutralElectrons(s) - s.charge
/** Slide 118: for the 2nd row the (full) 1s sigma/sigma* pair is ignored. */
export const coreElectrons = (s: Species) => (s.kind === '2p' ? 4 : 0)

/* ---------- levels ---------- */
export interface Level {
  key: string
  sym: 'σ' | 'π'
  star: boolean
  sub: '1s' | '2s' | '2p'
  /** number of degenerate boxes */
  n: 1 | 2
  /** energy 0..1 (bottom..top) for drawing */
  e: number
  /** which AO group feeds it */
  ao: '1s' | '2s' | '2p'
}

export function levelsFor(kind: '1s' | '2p', order: Order): Level[] {
  if (kind === '1s') {
    return [
      { key: 's1', sym: 'σ', star: false, sub: '1s', n: 1, e: 0.18, ao: '1s' },
      { key: 's1*', sym: 'σ', star: true, sub: '1s', n: 1, e: 0.74, ao: '1s' },
    ]
  }
  const s2: Level = { key: 's2', sym: 'σ', star: false, sub: '2s', n: 1, e: 0.07, ao: '2s' }
  const s2a: Level = { key: 's2*', sym: 'σ', star: true, sub: '2s', n: 1, e: 0.3, ao: '2s' }
  const pi: Level = { key: 'pi', sym: 'π', star: false, sub: '2p', n: 2, e: order === 'mix' ? 0.47 : 0.55, ao: '2p' }
  const sg: Level = { key: 'sg', sym: 'σ', star: false, sub: '2p', n: 1, e: order === 'mix' ? 0.57 : 0.46, ao: '2p' }
  const pia: Level = { key: 'pi*', sym: 'π', star: true, sub: '2p', n: 2, e: 0.76, ao: '2p' }
  const sga: Level = { key: 'sg*', sym: 'σ', star: true, sub: '2p', n: 1, e: 0.92, ao: '2p' }
  return order === 'mix' ? [s2, s2a, pi, sg, pia, sga] : [s2, s2a, sg, pi, pia, sga]
}

export const boxCount = (ls: Level[]) => ls.reduce((a, l) => a + l.n, 0)
/** index of the first box of each level in the flat occupancy array */
export function boxStarts(ls: Level[]) {
  const out: number[] = []
  let k = 0
  for (const l of ls) { out.push(k); k += l.n }
  return out
}

/** Correct ground-state occupancy per box (Aufbau + Pauli + Hund). */
export function fillExpected(ls: Level[], N: number): number[] {
  const occ: number[] = []
  let rem = N
  for (const l of ls) {
    const e = Math.min(rem, 2 * l.n)
    rem -= e
    const b = new Array<number>(l.n).fill(0)
    for (let i = 0; i < Math.min(e, l.n); i++) b[i] = 1
    for (let i = 0; i < e - l.n; i++) b[i] += 1
    occ.push(...b)
  }
  return occ
}

export function levelTotals(ls: Level[], occ: number[]) {
  const st = boxStarts(ls)
  return ls.map((l, i) => occ.slice(st[i], st[i] + l.n).reduce((a, b) => a + b, 0))
}
export function tally(ls: Level[], occ: number[]) {
  const t = levelTotals(ls, occ)
  let bonding = 0, anti = 0
  ls.forEach((l, i) => { if (l.star) anti += t[i]; else bonding += t[i] })
  return { bonding, anti, bo: (bonding - anti) / 2 }
}
export const unpaired = (occ: number[]) => occ.filter((o) => o === 1).length

/** TeX of a level: \sigma^*_{2p} */
export const levelTex = (l: Level) => `${l.sym === 'σ' ? '\\sigma' : '\\pi'}${l.star ? '^{*}' : ''}_{${l.sub}}`
/** TeX electron configuration, e.g. \sigma_{2s}^{2}(\sigma^*_{2s})^{2}\pi_{2p}^{4} */
export function configTex(ls: Level[], occ: number[]) {
  const t = levelTotals(ls, occ)
  return ls
    .map((l, i) => (t[i] === 0 ? '' : l.star ? `(${levelTex(l)})^{${t[i]}}` : `${levelTex(l)}^{${t[i]}}`))
    .filter(Boolean)
    .join('\\,')
}

export function boFor(s: Species) {
  return tally(levelsFor(s.kind, s.order), fillExpected(levelsFor(s.kind, s.order), totalElectrons(s)))
}
export function speciesInfo(s: Species) {
  const ls = levelsFor(s.kind, s.order)
  const N = totalElectrons(s)
  const occ = fillExpected(ls, N)
  return { ls, N, occ, ...tally(ls, occ), unpaired: unpaired(occ) }
}

/** Diagnose a learner's filling. Returns null if fine, or a specific message (TeX allowed). */
export function diagnoseFill(ls: Level[], occ: number[], N: number): string | null {
  const total = occ.reduce((a, b) => a + b, 0)
  if (total !== N) {
    return total < N
      ? `You placed **${total}** electrons but this species has **${N}** to place (step 1): ${N - total} more to go.`
      : `You placed **${total}** electrons but there are only **${N}**: remove ${total - N}.`
  }
  const t = levelTotals(ls, occ)
  for (let i = 0; i < ls.length; i++) {
    if (t[i] < 2 * ls[i].n) {
      for (let j = i + 1; j < ls.length; j++) {
        if (t[j] > 0) {
          return `**Aufbau:** $${levelTex(ls[i])}$ still has room, yet you put electrons in $${levelTex(ls[j])}$, which lies higher. Fill the lowest-energy orbitals first.`
        }
      }
    }
  }
  const st = boxStarts(ls)
  for (let i = 0; i < ls.length; i++) {
    if (ls[i].n === 2) {
      const [a, b] = [occ[st[i]], occ[st[i] + 1]]
      if ((a === 2 && b === 0) || (a === 0 && b === 2)) {
        return `**Hund's rule:** the two $${levelTex(ls[i])}$ orbitals are degenerate, so put **one electron in each** (parallel spins) before pairing up.`
      }
    }
  }
  const exp = fillExpected(ls, N)
  const same = ls.every((l, i) => {
    const a = occ.slice(st[i], st[i] + l.n).slice().sort().join()
    const b = exp.slice(st[i], st[i] + l.n).slice().sort().join()
    return a === b
  })
  return same ? null : 'The filling does not match the ground state; check each level against Aufbau, Pauli and Hund.'
}

/* ---------- AO occupancy of a neutral atom (for drawing) ---------- */
export function atomAO(sym: string): { s1?: number; s2?: number; p: number[] } {
  const v = VALENCE[sym]
  if (sym === 'H' || sym === 'He') return { s1: v, p: [] }
  const s = Math.min(2, v)
  const pn = Math.max(0, v - 2)
  const p = [0, 0, 0]
  for (let i = 0; i < Math.min(pn, 3); i++) p[i] = 1
  for (let i = 0; i < pn - 3; i++) p[i] += 1
  return { s2: s, p }
}

/* ---------- literature data for the compare panel (BEYOND the slides) ---------- */
export const LIT: Record<string, { len?: number; energy?: number }> = {
  Li2: { len: 267, energy: 105 },
  B2: { len: 159, energy: 290 },
  C2: { len: 124, energy: 599 },
  N2: { len: 110, energy: 945 },
  O2: { len: 121, energy: 498 },
  F2: { len: 142, energy: 155 },
}
/** Slide L10 s131 */
export const NO_TABLE: Record<string, { bo: number; len: number; energy: number }> = {
  'NO^+': { bo: 3, len: 106, energy: 1025 },
  NO: { bo: 2.5, len: 115, energy: 630 },
  'NO^-': { bo: 2, len: 130, energy: 400 },
}
