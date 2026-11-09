// Shared contracts. Every agent builds against these; do not change shapes without updating all users.
import type { ComponentType, LazyExoticComponent } from 'react'

export type LectureId = 'L7' | 'L8' | 'L9' | 'L10'
export const LECTURES: { id: LectureId; title: string; short: string; color: string }[] = [
  { id: 'L7', title: 'Atomic Structure', short: 'Atoms', color: '#7c3aed' },
  { id: 'L8', title: 'Basics of Chemical Bonding', short: 'Bonding basics', color: '#0891b2' },
  { id: 'L9', title: 'Molecular Structure', short: 'Lewis & resonance', color: '#d97706' },
  { id: 'L10', title: 'Chemical Bonding Theory', short: 'VSEPR, VB, MO', color: '#db2777' },
]

/** learn = hint after every step and unlock steps one by one; test = no hints until the final Check. */
export type Mode = 'learn' | 'test'

/** Result a widget reports when it is used as a practice task (or when the user presses Check). */
export interface WidgetResult {
  correct: boolean
  /** 0..1, optional partial credit */
  score?: number
  /** one-line summary shown in practice history, e.g. "Bond order wrong: you said 2, it is 2.5" */
  summary?: string
}

/**
 * Props every interactive widget accepts.
 * - standalone (Learn page / Workspace): no task; widget offers its own picker / free exploration.
 * - practice: `task` is set (shape defined per widget in TASKS below); the widget hides the answer,
 *   runs in the given mode and calls onResult exactly once when the learner presses its final Check.
 */
export interface WidgetProps<T = unknown> {
  mode?: Mode
  task?: T
  onResult?: (r: WidgetResult) => void
  /** smaller chrome for Workspace panels */
  compact?: boolean
}

export interface WidgetDef {
  id: string
  title: string
  lecture: LectureId | 'tool' | 'quiz'
  blurb: string
  component: LazyExoticComponent<ComponentType<WidgetProps<any>>> | ComponentType<WidgetProps<any>>
  /** default Workspace panel size in px */
  size?: { w: number; h: number }
  /** true if the widget supports `task` (practice "build it" questions) */
  taskable?: boolean
}

/* ---------- task shapes for taskable widgets (practice engine creates these) ---------- */
export interface Tasks {
  /** Lewis workbench: species id/formula from the curated list in widgets/L9/species.ts, e.g. "SO4^2-", "NO3^-", "CO2" */
  lewis: { species: string; resonance?: boolean }
  /** Orbital box filler: element symbol, optional ion charge (e.g. Fe, 3 → Fe3+) */
  econfig: { element: string; charge?: number }
  /** VSEPR: species formula from widgets/L10 species list, e.g. "SF4", "XeF4", "NH3" */
  vsepr: { species: string }
  /** Hybridization: central atom of species, e.g. { species: "PCl5" } */
  hybrid: { species: string }
  /** MO diagram: homo/heteronuclear diatomic incl. ions, e.g. "O2", "O2^-", "NO^+", "N2", "He2^+" */
  mo: { species: string }
  /** Hydrogen transitions: emission/absorption between levels */
  hatom: { ni: number; nf: number }
}

/* ---------- learn content ---------- */
export interface Section {
  id: string
  title: string
  /** markdown with KaTeX ($...$, $$...$$). Keep it tight: exam-focused, bullets, worked examples. */
  md: string
  /** slide numbers in this lecture's PDF that this section is based on */
  slides: number[]
  /** widget ids (from the registry) embedded after the markdown */
  widgets?: string[]
  /** short "common traps" list, rendered as a callout */
  traps?: string[]
  /** "Must know" bullets shown at the top of the section (inline markdown): the few things a quiz actually asks */
  essentials?: string[]
  /** "Key formulas" box under the must-knows: name, KaTeX formula (no $), and what each symbol means / units */
  formulas?: KeyFormula[]
  /** static diagrams (ids registered in widgets/<lecture>/figures.tsx) rendered right after the markdown */
  figures?: string[]
}
export interface KeyFormula { name: string; tex: string; where?: string }
/** A static diagram for Materials / Rangkuman: no interaction needed, drawn to match the lecture slides. */
export interface FigureDef { title: string; caption?: string; C: import('react').ComponentType }
export interface Lecture {
  id: LectureId
  title: string
  summary: string
  sections: Section[]
}

/* ---------- practice ---------- */
/** Indonesian text for a question (past quizzes are originally in Indonesian). Any field left out falls back to English. */
export interface QIndo { stem?: string; options?: string[]; explanation?: string; hints?: string[]; work?: string[]; answer?: string; rubric?: string[]; labels?: string[]; items?: string[]; ends?: [string, string] }

interface QBase {
  id: string
  lecture: LectureId
  topic: string
  /** 'slide' = verbatim from a "Your Turn!" / "Learning Check" slide; 'past' = from a past KI1101 quiz; 'generated' otherwise */
  source: 'slide' | 'generated' | 'past'
  slides?: number[]
  stem: string // markdown + KaTeX
  explanation: string // markdown + KaTeX, worked solution
  difficulty?: 1 | 2 | 3
  /** Progressive hints, revealed one at a time: nudges toward the method, never the final answer. */
  hints?: string[]
  /** Worked solution as ordered steps, revealed one at a time. If absent, the UI splits `explanation` into steps. */
  work?: string[]
  /** Indonesian version of the text fields. */
  indo?: QIndo
  /** Past-quiz provenance. */
  past?: { paper: string; label: string; points?: number }
}
export interface MCQ extends QBase { kind: 'mcq'; options: string[]; answer: number[] }
export interface NumericQ extends QBase {
  kind: 'numeric'
  answer: number
  unit?: string
  /** relative tolerance (default 0.02) or absolute */
  tol?: { rel?: number; abs?: number }
  /** optional intermediate steps the learner fills first, each checked separately */
  steps?: { prompt: string; answer: number; unit?: string; tol?: { rel?: number; abs?: number } }[]
}
export interface WidgetQ extends QBase { kind: 'widget'; widget: keyof Tasks; task: Tasks[keyof Tasks] }
/** Free-response question: learner writes their answer, then compares with the model answer and self-grades. */
export interface OpenQ extends QBase {
  kind: 'open'
  /** model answer, markdown */
  answer: string
  /** key points the answer must contain; the learner ticks the ones they got (score = ticked / total) */
  rubric?: string[]
}

/** One typed blank of a ShortQ. Answers are compared after normalising for `type`:
 *  text     case/space/punctuation-insensitive ("Paramagnetic" = "paramagnetic.")
 *  number   numeric within `tol` (accept[0] is the value), accepts 6.6e-34, 6,6 × 10^-34
 *  formula  sub/superscripts unified: "SO4^2-" = "SO₄²⁻"
 *  config   electron configuration as subshell occupancies; noble-gas cores expanded, order ignored: "[Ar]4s2 3d6" = "1s2 2s2 2p6 3s2 3p6 3d6 4s2"
 *  equation reaction: species compared per side as sets, state labels (g)/(aq) optional, "->" = "→"
 */
export interface Blank {
  label: string
  accept: string[]
  type?: 'text' | 'number' | 'formula' | 'config' | 'equation'
  tol?: { rel?: number; abs?: number }
  unit?: string
  placeholder?: string
  /** targeted feedback for common wrong answers (matched after the same normalisation) */
  wrong?: { match: string; msg: string }[]
}
/** Short typed answer(s): one or more labelled blanks, each auto-checked. */
export interface ShortQ extends QBase { kind: 'short'; blanks: Blank[] }
/** Put items in order. `ends` labels the two ends, e.g. ['smallest', 'largest']. */
export interface OrderQ extends QBase {
  kind: 'order'
  items: string[]
  /** item indexes from first to last */
  answer: number[]
  ends: [string, string]
  /** groups of item indexes that are equal (their mutual order is not marked) */
  ties?: number[][]
}
export type Question = MCQ | NumericQ | WidgetQ | OpenQ | ShortQ | OrderQ

/** One numbered problem (SOAL) of a past quiz; each sub-part (a, b, c…) is a Question. */
export interface PastProblem {
  n: number
  points?: number
  /** shared problem text above the parts (data, figures described in words), EN + ID */
  intro?: string
  introId?: string
  /** true when the problem is outside L7–L10 (e.g. thermochemistry): shown in the paper, kept out of the quiz pool */
  outOfScope?: boolean
  parts: Question[]
}
export interface PastPaper {
  id: string // e.g. 'kuis2-2025'
  year: number
  title: string
  titleId: string
  date?: string
  minutes?: number
  /** constants block printed on the paper, EN + ID */
  constants?: string
  constantsId?: string
  /** caveats about the source (e.g. "answer key not provided; solutions are ours") */
  note?: string
  problems: PastProblem[]
}

export interface Flashcard { id: string; lecture: LectureId; topic: string; front: string; back: string }
