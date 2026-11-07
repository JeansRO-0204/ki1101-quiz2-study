// Widget definitions for L9. Owned by the L9 widget agent. Lazy imports so each widget is code-split.
import { lazy } from 'react'
import type { WidgetDef } from '../../types'

export { SPECIES, getSpecies } from './species'
export type { Species, Struct, ResForm } from './species'

export const widgets: WidgetDef[] = [
  {
    id: 'lewis', title: 'Lewis structure workbench', lecture: 'L9', taskable: true,
    blurb: 'Tick s/p orbitals for valence electrons, build the skeleton, place electrons, then get every mistake explained (octets, formal charge, best structure, resonance).',
    component: lazy(() => import('./Lewis')), size: { w: 560, h: 760 },
  },
  {
    id: 'resonance', title: 'Resonance viewer', lecture: 'L9',
    blurb: 'Watch resonance forms interconvert with electron-push arrows, read averaged bond orders and formal charges, and decide which form contributes most.',
    component: lazy(() => import('./Resonance')), size: { w: 540, h: 700 },
  },
]
