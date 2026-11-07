// Single access point for the question bank (falls back to a dev sample ONLY when the bank is empty).
import { FLASHCARDS, QUESTIONS } from './bank'
import { SAMPLE_CARDS, SAMPLE_QUESTIONS } from './sample'
import type { Flashcard, Question } from '../types'

export const USING_SAMPLE_Q = QUESTIONS.length === 0
export const USING_SAMPLE_C = FLASHCARDS.length === 0
export const POOL_Q: Question[] = USING_SAMPLE_Q ? SAMPLE_QUESTIONS : QUESTIONS
export const POOL_C: Flashcard[] = USING_SAMPLE_C ? SAMPLE_CARDS : FLASHCARDS
export const Q_BY_ID = new Map(POOL_Q.map((q) => [q.id, q]))

export const shuffled = <T,>(xs: readonly T[]): T[] => {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
export const topicsOf = (xs: { lecture: string; topic: string }[]) => {
  const m = new Map<string, Set<string>>()
  for (const x of xs) { if (!m.has(x.lecture)) m.set(x.lecture, new Set()); m.get(x.lecture)!.add(x.topic) }
  return m
}
