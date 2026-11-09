// All static diagrams, merged from each lecture's widgets/<L>/figures.tsx.
import type { FigureDef } from '../types'
import { FIGURES as F7 } from '../widgets/L7/figures'
import { FIGURES as F8 } from '../widgets/L8/figures'
import { FIGURES as F9 } from '../widgets/L9/figures'
import { FIGURES as F10 } from '../widgets/L10/figures'

export const FIGURES: Record<string, FigureDef> = { ...F7, ...F8, ...F9, ...F10 }
