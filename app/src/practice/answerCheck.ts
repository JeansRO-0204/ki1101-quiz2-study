// Tolerant answer checking for ShortQ blanks and OrderQ sequences. Never stricter than the question:
// spacing, case, unicode vs ^/_ notation, subshell order and noble-gas cores are all normalised away.
import { parseNum, within } from '../lib/kit'
import type { Blank, OrderQ } from '../types'

const SUBSUP: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '₊': '+', '₋': '-',
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-', '−': '-', '–': '-',
  '½': '1/2',
}
const SS = /[₀-₉₊₋⁰¹²³⁴-⁹⁺⁻−–½]/g
/** Map unicode sub/superscripts and minus variants to ASCII; drop ^ _ { } and spaces. */
export const plain = (s: string) => s.replace(SS, (c) => SUBSUP[c] ?? c).replace(/[\^_{}\s]/g, '')

const normText = (s: string) => s.toLowerCase().replace(SS, (c) => SUBSUP[c] ?? c).replace(/[.,;:!?'"`()]/g, ' ').replace(/\s+/g, ' ').trim()
const normFormula = (s: string) => plain(s).replace(/\((s|l|g|aq)\)/gi, '')

/* ---------- electron configurations ---------- */
const CORES: Record<string, string> = {
  He: '1s2', Ne: '1s2 2s2 2p6', Ar: '1s2 2s2 2p6 3s2 3p6', Kr: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6',
  Xe: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6', Rn: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6 4f14 5d10 6s2 6p6',
}
/** "[Ar] 4s² 3d⁶" → Map{1s:2, …, 3d:6, 4s:2}; null when it can't be parsed. */
export function parseConfig(s: string): Map<string, number> | null {
  let t = s.replace(SS, (c) => SUBSUP[c] ?? c).replace(/[\^{}]/g, '')
  t = t.replace(/\[\s*([A-Za-z]{2})\s*\]/g, (_, g: string) => ' ' + (CORES[g[0].toUpperCase() + g[1].toLowerCase()] ?? '??') + ' ')
  const m = new Map<string, number>()
  const re = /(\d)\s*([spdfSPDF])\s*(\d{1,2})/g
  let hit: RegExpExecArray | null, used = ''
  while ((hit = re.exec(t))) { const k = hit[1] + hit[2].toLowerCase(); m.set(k, (m.get(k) ?? 0) + Number(hit[3])); used += hit[0] }
  const rest = t.replace(re, '').replace(/[\s,.]/g, '')
  if (!m.size || rest.length) return null
  for (const [k, v] of m) if (!v) m.delete(k)
  return m
}
const sameConfig = (a: Map<string, number>, b: Map<string, number>) => a.size === b.size && [...a].every(([k, v]) => b.get(k) === v)

/* ---------- equations ---------- */
function parseEq(s: string): [string[], string[]] | null {
  const t = s.replace(/⟶|→|-+>|=+>|⇌|<-+>/g, '→')
  const sides = t.split('→')
  if (sides.length !== 2) return null
  // species are separated by a "+" with spaces on both sides (a charge "+" is attached to its species)
  const sp = (x: string) => x.split(/\s\+\s/).map((y) => normFormula(y).replace(/^1(?=[A-Za-z])/, '')).filter(Boolean).sort()
  return [sp(sides[0]), sp(sides[1])]
}
const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i])

/** Is `got` an accepted answer for this blank? */
export function blankOk(b: Blank, got: string): boolean {
  if (!got.trim()) return false
  const type = b.type ?? 'text'
  return b.accept.some((acc) => {
    switch (type) {
      case 'number': { const x = parseNum((b.unit ? got.replace(b.unit, '') : got).replace(/°/g, '').replace(/[−–]/g, '-').replace(',', '.').trim()); const want = Number(acc); return Number.isFinite(x) && within(x, want, b.tol ?? { rel: 0.02 }) }
      case 'formula': return normFormula(got) === normFormula(acc)
      case 'config': { const a = parseConfig(got), w = parseConfig(acc); return !!a && !!w && sameConfig(a, w) }
      case 'equation': { const a = parseEq(got), w = parseEq(acc); return !!a && !!w && sameList(a[0], w[0]) && sameList(a[1], w[1]) }
      default: return normText(got) === normText(acc) || normText(got).replace(/ /g, '') === normText(acc).replace(/ /g, '')
    }
  })
}

/** Targeted message for a known wrong answer, else a generic one naming what the checker expected. */
export function blankWhy(b: Blank, got: string): string | null {
  const hit = b.wrong?.find((w) => blankOk({ ...b, accept: [w.match], wrong: undefined }, got))
  if (hit) return hit.msg
  if ((b.type ?? 'text') === 'config' && got.trim() && !parseConfig(got)) return 'I couldn’t read that as a configuration. Write subshells like `1s2 2s2 2p6` or `[Ar] 4s2 3d6`.'
  if (b.type === 'equation' && got.trim() && !parseEq(got)) return 'Write it as reactants → products, e.g. `Se^3+(g) → Se^4+(g) + e^-` (use → or ->, and spaces around the + between species).'
  return null
}

/** Order check: positions are compared group-wise so tied items may appear in either order. */
export function orderOk(q: OrderQ, seq: number[]): boolean {
  if (seq.length !== q.answer.length) return false
  const grp = (i: number) => q.ties?.findIndex((g) => g.includes(i)) ?? -1
  return seq.every((x, k) => { const w = q.answer[k]; if (x === w) return true; const g = grp(w); return g >= 0 && g === grp(x) })
}
