// Practice persistence (localStorage `chem.practice`) + Leitner scheduling + proficiency maths. No React except the hook.
import { useSyncExternalStore } from 'react'
import { recordAttempt } from '../lib/kit'
import type { LectureId } from '../types'

export type Source = 'quiz' | 'drill' | 'mock'
export interface Attempt {
  id: string; lecture: LectureId; topic: string; correct: boolean; score: number; t: number
  src: Source; kind: string; gen?: string
}
export type Grade = 'again' | 'hard' | 'good' | 'easy'
export interface CardState { box: number; due: number; last?: Grade; seen: number }
export interface PStore {
  v: 1
  attempts: Attempt[]
  flagged: string[]
  cards: Record<string, CardState>
  drill: Record<string, { n: number; c: number }>
}
const KEY = 'chem.practice'
const EMPTY = (): PStore => ({ v: 1, attempts: [], flagged: [], cards: {}, drill: {} })

let cache: PStore | null = null
const subs = new Set<() => void>()
function load(): PStore {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) { cache = { ...EMPTY(), ...(JSON.parse(raw) as Partial<PStore>) }; return cache }
  } catch { /* ignore */ }
  cache = EMPTY()
  return cache
}
export function getStore() { return load() }
export function updateStore(fn: (s: PStore) => PStore) {
  cache = fn({ ...load() })
  try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch { /* ignore */ }
  subs.forEach((f) => f())
}
/** Re-read from localStorage (after import / reset). */
export function reloadStore() { cache = null; subs.forEach((f) => f()) }
export function usePStore(): PStore {
  return useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f) } }, load, load)
}

export function logAttempt(a: Omit<Attempt, 't'>) {
  recordAttempt({ id: a.id, lecture: a.lecture, topic: a.topic, correct: a.correct, score: a.score })
  updateStore((s) => ({
    ...s,
    attempts: [...s.attempts, { ...a, t: Date.now() }].slice(-5000),
    drill: a.gen ? { ...s.drill, [a.gen]: { n: (s.drill[a.gen]?.n ?? 0) + 1, c: (s.drill[a.gen]?.c ?? 0) + (a.correct ? 1 : 0) } } : s.drill,
  }))
}
export function toggleFlag(id: string) {
  updateStore((s) => ({ ...s, flagged: s.flagged.includes(id) ? s.flagged.filter((x) => x !== id) : [...s.flagged, id] }))
}

/* ---------- Leitner flashcards ---------- */
export const BOX_DAYS = [1, 2, 4, 8]
const DAY = 86400000
export function startOfTomorrow() { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime() }
export function isDue(c: CardState | undefined) { return !c || c.due <= Date.now() }
/** Apply a grade. Again → box 1, Hard → stay, Good → +1, Easy → +2. `prev` lets the last grade be re-done. */
export function applyGrade(box: number, g: Grade): number {
  const b = g === 'again' ? 1 : g === 'hard' ? box : g === 'good' ? box + 1 : box + 2
  return Math.max(1, Math.min(4, b))
}
export function gradeCard(id: string, g: Grade, prevBox?: number) {
  updateStore((s) => {
    const cur = s.cards[id]
    const base = prevBox ?? cur?.box ?? 1
    const box = applyGrade(base, g)
    const due = g === 'again' ? Date.now() + 60_000 : Date.now() + BOX_DAYS[box - 1] * DAY
    return { ...s, cards: { ...s.cards, [id]: { box, due, last: g, seen: (cur?.seen ?? 0) + (prevBox ? 0 : 1) } } }
  })
}

/* ---------- proficiency ---------- */
/** Recent-weighted accuracy: attempts sorted newest first, weight 0.88^rank. Returns null when no attempts. */
export function proficiency(atts: Attempt[]): { acc: number; n: number } | null {
  if (!atts.length) return null
  const sorted = [...atts].sort((a, b) => b.t - a.t)
  let w = 0, s = 0
  sorted.forEach((a, i) => { const wi = 0.88 ** i; w += wi; s += wi * a.score })
  return { acc: s / w, n: atts.length }
}
export function groupBy<T>(xs: T[], f: (x: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>()
  for (const x of xs) { const k = f(x); const a = m.get(k); if (a) a.push(x); else m.set(k, [x]) }
  return m
}
export interface TopicStat { lecture: LectureId; topic: string; acc: number; n: number }
export function topicStats(atts: Attempt[]): TopicStat[] {
  const out: TopicStat[] = []
  for (const [, xs] of groupBy(atts, (a) => a.lecture + '|' + a.topic)) {
    const p = proficiency(xs)!
    out.push({ lecture: xs[0].lecture, topic: xs[0].topic, acc: p.acc, n: p.n })
  }
  return out
}
/** Weakest topics: lowest recent accuracy with at least 2 attempts. */
export function weakest(atts: Attempt[], k = 4): TopicStat[] {
  return topicStats(atts).filter((t) => t.n >= 2).sort((a, b) => a.acc - b.acc).slice(0, k)
}

/* ---------- export / import of all chem.* keys ---------- */
export function exportAll(): string {
  const o: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!
    if (k.startsWith('chem.')) { try { o[k] = JSON.parse(localStorage.getItem(k)!) } catch { o[k] = localStorage.getItem(k) } }
  }
  return JSON.stringify({ app: 'ki1101-chem', exported: new Date().toISOString(), data: o }, null, 2)
}
export function importAll(text: string): number {
  const j = JSON.parse(text) as { data?: Record<string, unknown> }
  if (!j.data || typeof j.data !== 'object') throw new Error('Not a progress file')
  let n = 0
  for (const [k, v] of Object.entries(j.data)) {
    if (!k.startsWith('chem.')) continue
    localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); n++
  }
  reloadStore()
  return n
}
export function resetAll() {
  const ks: string[] = []
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i)!; if (k.startsWith('chem.')) ks.push(k) }
  // keep user preferences like mode
  ks.filter((k) => k !== 'chem.mode').forEach((k) => localStorage.removeItem(k))
  reloadStore()
}
