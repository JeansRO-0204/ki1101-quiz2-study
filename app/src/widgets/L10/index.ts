// Widget definitions for L10. VSEPR/polarity/hybridization/σπ by the L10 (VB) agent; MO widgets live in ./mo (other agent) — keep the spread.
import { lazy } from 'react'
import type { WidgetDef } from '../../types'
import { moWidgets } from './mo'

export const widgets: WidgetDef[] = [
  { id: 'vsepr', title: 'VSEPR shapes', lecture: 'L10', blurb: 'Rotate 3D molecules, explore domains and lone pairs, or work out a species step by step.', component: lazy(() => import('./vsepr')), size: { w: 760, h: 640 }, taskable: true },
  { id: 'mol-polarity', title: 'Molecular polarity', lecture: 'L10', blurb: 'Predict polar/nonpolar, then see bond dipoles add up (or cancel) in 3D.', component: lazy(() => import('./polarity')), size: { w: 760, h: 620 } },
  { id: 'hybrid', title: 'Hybridization mixer', lecture: 'L10', blurb: 'Promote, mix, fill and assign hybrid orbitals for a central atom.', component: lazy(() => import('./hybrid')), size: { w: 760, h: 700 }, taskable: true },
  { id: 'sigma-pi', title: 'σ and π bonds', lecture: 'L10', blurb: 'See head-on σ and sideways π overlap; count bonds and name hybridizations.', component: lazy(() => import('./sigmapi')), size: { w: 760, h: 620 } },
  ...moWidgets,
]
