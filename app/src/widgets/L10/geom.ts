// Pure geometry helpers for VSEPR shapes (no three.js): ideal domain directions, lone-pair placement, shape table.
export type V3 = [number, number, number]

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k]
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2])
export const norm = (a: V3): V3 => { const l = len(a); return l < 1e-9 ? [0, 0, 0] : [a[0] / l, a[1] / l, a[2] / l] }
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
export const angleDeg = (a: V3, b: V3) => (Math.acos(Math.max(-1, Math.min(1, dot(norm(a), norm(b))))) * 180) / Math.PI

export type EG = 'linear' | 'trigonal planar' | 'tetrahedral' | 'trigonal bipyramidal' | 'octahedral'
export const EG_BY_DOMAINS: Record<number, EG> = { 2: 'linear', 3: 'trigonal planar', 4: 'tetrahedral', 5: 'trigonal bipyramidal', 6: 'octahedral' }
export const EG_LIST: EG[] = ['linear', 'trigonal planar', 'tetrahedral', 'trigonal bipyramidal', 'octahedral']

/** Ideal unit vectors for n domains. TBP/octahedral: indices 0,1 = axial (±y); the rest equatorial (xz-plane). */
export function domainDirs(n: number): V3[] {
  const s3 = Math.sqrt(3) / 2
  switch (n) {
    case 1: return [[1, 0, 0]]
    case 2: return [[1, 0, 0], [-1, 0, 0]]
    case 3: return [[0, 0, 1], [s3, 0, -0.5], [-s3, 0, -0.5]]
    case 4: { const k = 1 / Math.sqrt(3); return [[k, k, k], [k, -k, -k], [-k, k, -k], [-k, -k, k]] }
    case 5: return [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-0.5, 0, s3], [-0.5, 0, -s3]]
    case 6: return [[0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]]
    default: return []
  }
}

/** Which direction indices hold lone pairs (equatorial in TBP, trans in octahedral — slides 16, 21). */
export function loneIndices(dom: number, lp: number): number[] {
  if (lp === 0) return []
  if (dom === 5) return [2, 3, 4].slice(0, lp)
  if (dom === 6) return [1, 0, 2, 3].slice(0, lp) // 1 LP axial, 2 LP both axial (trans)
  return Array.from({ length: lp }, (_, i) => dom - 1 - i)
}
/** Slot order in which bonded atoms are placed (double-bonded / less electronegative atoms go equatorial in TBP). */
export function bondSlots(dom: number, lp: number): number[] {
  const lone = new Set(loneIndices(dom, lp))
  const order = dom === 5 ? [2, 3, 4, 0, 1] : dom === 6 ? [0, 2, 3, 4, 5, 1] : Array.from({ length: dom }, (_, i) => i)
  return order.filter((i) => !lone.has(i))
}

/** How far bonded atoms are pushed away from the lone pairs (lone pair domains are bigger — slide 14). */
const PUSH: Record<string, number> = { '3,1': 0.08, '2,2': 0.15, '2,1': 0.07, '4,1': 0.13, '3,2': 0.1, '5,1': 0.08 }

export type AngleId = 'a180' | 'a120' | 'a120lt' | 'a1095' | 'a1095lt' | 'a90_120' | 'a90_120lt' | 'a90' | 'a90lt' | 'none'
export const ANGLE_TEXT: Record<AngleId, string> = {
  a180: '180°',
  a120: '120°',
  a120lt: '< 120°',
  a1095: '109.5°',
  a1095lt: '< 109.5°',
  a90_120: '90° and 120° (ax–eq 90°, eq–eq 120°)',
  a90_120lt: '< 90° (ax–eq) and < 120° (eq–eq)',
  a90: '90°',
  a90lt: '≈ 90° (a little less than 90°)',
  none: 'no bond angle (only one bond)',
}

export interface Shape {
  nb: number; lp: number
  eg: EG
  mg: string
  angle: AngleId
  /** extra accepted answers (slides quote 90° for T-shaped) */
  angleAlso?: AngleId[]
  /** quoted values for the explanation */
  angleNote: string
  example: string
}

/** The 13 shapes on slides 17–24, plus the diatomic case. Names follow the slides. */
export const SHAPES: Shape[] = [
  { nb: 2, lp: 0, eg: 'linear', mg: 'linear', angle: 'a180', angleNote: '180°', example: 'BeH2' },
  { nb: 3, lp: 0, eg: 'trigonal planar', mg: 'trigonal planar', angle: 'a120', angleNote: 'all angles 120°', example: 'BCl3' },
  { nb: 2, lp: 1, eg: 'trigonal planar', mg: 'bent', angle: 'a120lt', angleNote: '< 120° (SO2 ≈ 119°)', example: 'SO2' },
  { nb: 4, lp: 0, eg: 'tetrahedral', mg: 'tetrahedral', angle: 'a1095', angleNote: 'all angles 109.5°', example: 'CH4' },
  { nb: 3, lp: 1, eg: 'tetrahedral', mg: 'trigonal pyramidal', angle: 'a1095lt', angleNote: '< 109.5° (NH3 107°)', example: 'NH3' },
  { nb: 2, lp: 2, eg: 'tetrahedral', mg: 'bent', angle: 'a1095lt', angleNote: '< 109.5° (H2O 104.5°)', example: 'H2O' },
  { nb: 5, lp: 0, eg: 'trigonal bipyramidal', mg: 'trigonal bipyramidal', angle: 'a90_120', angleNote: 'ax–eq 90°, eq–eq 120° (ax–ax 180°)', example: 'PF5' },
  { nb: 4, lp: 1, eg: 'trigonal bipyramidal', mg: 'seesaw', angle: 'a90_120lt', angleNote: 'ax–eq < 90°, eq–eq < 120°', example: 'SF4' },
  { nb: 3, lp: 2, eg: 'trigonal bipyramidal', mg: 'T-shaped', angle: 'a90lt', angleAlso: ['a90'], angleNote: '90° (slightly less in reality)', example: 'ClF3' },
  { nb: 2, lp: 3, eg: 'trigonal bipyramidal', mg: 'linear', angle: 'a180', angleNote: '180°', example: 'I3^-' },
  { nb: 6, lp: 0, eg: 'octahedral', mg: 'octahedral', angle: 'a90', angleNote: 'all angles 90°', example: 'SF6' },
  { nb: 5, lp: 1, eg: 'octahedral', mg: 'square pyramidal', angle: 'a90lt', angleAlso: ['a90'], angleNote: '≈ 90° (slightly less)', example: 'BrF5' },
  { nb: 4, lp: 2, eg: 'octahedral', mg: 'square planar', angle: 'a90', angleNote: '90°', example: 'XeF4' },
]
export const MG_LIST = ['linear', 'trigonal planar', 'bent', 'tetrahedral', 'trigonal pyramidal', 'trigonal bipyramidal', 'seesaw', 'T-shaped', 'octahedral', 'square pyramidal', 'square planar']
/** number of bonded atoms each molecular-geometry name implies */
export const MG_ATOMS: Record<string, number[]> = {
  linear: [1, 2], 'trigonal planar': [3], bent: [2], tetrahedral: [4], 'trigonal pyramidal': [3], 'trigonal bipyramidal': [5],
  seesaw: [4], 'T-shaped': [3], octahedral: [6], 'square pyramidal': [5], 'square planar': [4],
}

export function shapeOf(nb: number, lp: number): Shape {
  const hit = SHAPES.find((s) => s.nb === nb && s.lp === lp)
  if (hit) return hit
  const dom = nb + lp
  const eg = EG_BY_DOMAINS[dom] ?? EG_BY_DOMAINS[Math.min(6, Math.max(2, dom))]
  if (nb === 1) return { nb, lp, eg, mg: 'linear', angle: 'none', angleNote: 'diatomic: no bond angle', example: lp === 3 ? 'HCl' : 'N2' }
  return { nb, lp, eg, mg: 'linear', angle: 'none', angleNote: '—', example: '' }
}
export const validCombo = (nb: number, lp: number) => SHAPES.some((s) => s.nb === nb && s.lp === lp)

export interface Placed<T> { dir: V3; item: T }
export interface Layout<T> {
  nb: number; lp: number; dom: number
  /** ideal domain directions (before distortion) */
  ideal: V3[]
  bonds: Placed<T>[]
  lone: V3[]
  /** angle groups: representative pair of bond indices + ideal angle + label */
  pairs: { i: number; j: number; ideal: number; label: string }[]
}

/** Build the 3D layout. `items` are the bonded ligands in priority order (equatorial-preferring first). */
export function buildLayout<T>(items: T[], lp: number): Layout<T> {
  const nb = items.length
  const dom = Math.max(nb + lp, 2)
  const ideal = domainDirs(dom)
  const loneIdx = loneIndices(dom, lp)
  const slots = bondSlots(dom, lp).slice(0, nb)
  let lone = loneIdx.map((i) => ideal[i])
  let dirs = slots.map((i) => ideal[i])
  const L = lone.reduce<V3>((a, b) => add(a, b), [0, 0, 0])
  const push = PUSH[`${nb},${lp}`]
  if (push && len(L) > 1e-6) {
    const Lh = norm(L)
    dirs = dirs.map((d) => norm(sub(d, mul(Lh, push))))
    lone = lone.map((d) => d)
  }
  // angle labels: one representative pair per distinct ideal angle
  const pairs: Layout<T>['pairs'] = []
  const seen = new Set<number>()
  const sh = shapeOf(nb, lp)
  const lt = lp > 0 && sh.angle !== 'a180' && sh.angle !== 'a90' // exact when lone pairs are symmetric
  const idealBond = slots.map((i) => ideal[i])
  for (let i = 0; i < nb; i++) for (let j = i + 1; j < nb; j++) {
    const a = Math.round(angleDeg(idealBond[i], idealBond[j]) * 10) / 10
    if (seen.has(a)) continue
    seen.add(a)
    const shown = a === 109.5 ? '109.5' : String(Math.round(a))
    pairs.push({ i, j, ideal: a, label: a >= 179 ? '180°' : (sh.angleAlso?.includes('a90') ? '≈ ' : lt ? '< ' : '') + shown + '°' })
  }
  return { nb, lp, dom, ideal, bonds: items.map((item, k) => ({ dir: dirs[k], item })), lone, pairs: pairs.slice(0, 3) }
}

/** Distinct-edge pairs of the ideal domain polyhedron (for the ghost). */
export function polyhedronEdges(dirs: V3[]): [number, number][] {
  let min = Infinity
  for (let i = 0; i < dirs.length; i++) for (let j = i + 1; j < dirs.length; j++) min = Math.min(min, len(sub(dirs[i], dirs[j])))
  const out: [number, number][] = []
  for (let i = 0; i < dirs.length; i++) for (let j = i + 1; j < dirs.length; j++) if (len(sub(dirs[i], dirs[j])) < min * 1.05) out.push([i, j])
  if (dirs.length === 2) return [[0, 1]]
  if (dirs.length === 5) out.push([2, 3], [3, 4], [2, 4])
  return out
}
