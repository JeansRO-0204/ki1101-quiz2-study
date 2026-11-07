// MO widgets (owned by the MO agent). Re-exported from ../index.ts by the L10 agent.
import { lazy } from 'react'
import type { WidgetDef } from '../../../types'

export const moWidgets: WidgetDef[] = [
  {
    id: 'mo', title: 'MO diagram workbench', lecture: 'L10', taskable: true, size: { w: 760, h: 760 },
    blurb: 'Build the MO energy diagram of H₂…Ne₂, ions and NO/CO/CN⁻: electron count, s–p mixing order, filling, bond order, magnetism, stability.',
    component: lazy(() => import('./Mo')),
  },
]
