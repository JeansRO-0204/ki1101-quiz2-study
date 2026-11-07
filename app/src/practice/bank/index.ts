import * as L7 from './L7'
import * as L8 from './L8'
import * as L9 from './L9'
import * as L10 from './L10'
import type { Flashcard, PastPaper, Question } from '../../types'
import { PAST_FIGURES, type PastFigure } from './pastFigures'
export { PAST_FIGURES, type PastFigure }

/** Past KI1101 Quiz 2 papers: every file in ./past exports `paper`. Newest first. */
const pastMods = import.meta.glob<{ paper: PastPaper }>('./past/*.ts', { eager: true })
export const PAST_PAPERS: PastPaper[] = Object.values(pastMods).map((m) => m.paper).filter(Boolean).sort((a, b) => b.year - a.year)
/** In-scope past-paper parts join the general question pool (source: 'past'). */
export const PAST_QUESTIONS: Question[] = PAST_PAPERS.flatMap((p) => p.problems.filter((pr) => !pr.outOfScope).flatMap((pr) => pr.parts))

/** Shared problem text for each past part, shown above the part when it appears outside its paper (quiz, review). */
export const PAST_CONTEXT = new Map<string, { intro?: string; introId?: string; n: number; year: number; figures?: PastFigure[] }>(
  PAST_PAPERS.flatMap((p) => p.problems.flatMap((pr) => pr.parts.map((q) => [q.id, { intro: pr.intro, introId: pr.introId, n: pr.n, year: p.year, figures: PAST_FIGURES[`${p.id}:${pr.n}`] }] as const))),
)

export const QUESTIONS: Question[] = [...L7.questions, ...L8.questions, ...L9.questions, ...L10.questions, ...PAST_QUESTIONS]
export const FLASHCARDS: Flashcard[] = [...L7.flashcards, ...L8.flashcards, ...L9.flashcards, ...L10.flashcards]
