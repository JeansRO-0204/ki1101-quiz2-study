// Widget definitions for L7. Owned by the L7 widget agent.
import { lazy } from 'react'
import type { WidgetDef } from '../../types'

export const widgets: WidgetDef[] = [
  { id: 'light', title: 'Light: λ ↔ ν ↔ E', lecture: 'L7', blurb: 'Slide through the EM spectrum and convert wavelength, frequency and photon energy step by step.', component: lazy(() => import('./Light')), size: { w: 640, h: 620 } },
  { id: 'photoelectric', title: 'Photoelectric effect', lecture: 'L7', blurb: 'Pick a metal, colour and intensity; compute E_photon, KE_max and the threshold.', component: lazy(() => import('./Photoelectric')), size: { w: 700, h: 700 } },
  { id: 'hatom', title: 'Hydrogen atom levels', lecture: 'L7', blurb: 'Bohr ladder: click two levels, watch the jump and compute ΔE and λ (Rydberg).', component: lazy(() => import('./HAtom')), size: { w: 700, h: 760 }, taskable: true },
  { id: 'qnumbers', title: 'Quantum numbers & orbitals', lecture: 'L7', blurb: 'Pick n, l, m_l, m_s with live validity checks and orbital shapes; quick-fire drill.', component: lazy(() => import('./QNumbers')), size: { w: 680, h: 680 } },
  { id: 'econfig', title: 'Electron configuration filler', lecture: 'L7', blurb: 'Fill orbital boxes (Aufbau, Pauli, Hund), write the config, count valence and unpaired e⁻; ions too.', component: lazy(() => import('./EConfig')), size: { w: 700, h: 760 }, taskable: true },
  { id: 'trends', title: 'Periodic trends heatmap', lecture: 'L7', blurb: 'Radius, IE₁, EA, EN across the table, plus a rank-these challenge.', component: lazy(() => import('./Trends')), size: { w: 760, h: 700 } },
]
