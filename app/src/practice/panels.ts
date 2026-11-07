// Quiz panels for the Workspace: each past paper, plus a quick-quiz runner. Components load lazily (no import cycle with the registry).
import { lazy } from 'react'
import type { WidgetDef } from '../types'
import { PAST_META } from './bank/pastMeta'

const PastPanel = lazy(() => import('./PanelViews').then((m) => ({ default: m.PastPanel })))
const QuickQuiz = lazy(() => import('./PanelViews').then((m) => ({ default: m.QuickQuiz })))

export const panels: WidgetDef[] = [
  { id: 'quickquiz', title: 'Quick quiz', lecture: 'quiz', blurb: 'One question at a time from the bank and past quizzes, with the hint ladder. Filter by lecture and source.', component: QuickQuiz, size: { w: 600, h: 640 } },
  ...PAST_META.map((p): WidgetDef => ({
    id: 'past:' + p.id, title: p.title, lecture: 'quiz',
    blurb: `Past paper, ${p.date}: ${p.problems} problems with hints, figures and worked solutions (EN/ID).`,
    component: PastPanel, size: { w: 720, h: 720 },
  })),
]
