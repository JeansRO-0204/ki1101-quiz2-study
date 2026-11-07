import * as L7 from './L7'
import * as L8 from './L8'
import * as L9 from './L9'
import * as L10 from './L10'
import type { Flashcard, Question } from '../../types'

export const QUESTIONS: Question[] = [...L7.questions, ...L8.questions, ...L9.questions, ...L10.questions]
export const FLASHCARDS: Flashcard[] = [...L7.flashcards, ...L8.flashcards, ...L9.flashcards, ...L10.flashcards]
