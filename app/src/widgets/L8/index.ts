// Widget definitions for L8 (+ bond-props, which belongs to L9). Lazy-loaded.
import { lazy } from 'react'
import type { WidgetDef } from '../../types'

export const widgets: WidgetDef[] = [
  {
    id: 'ionic-energetics', title: 'Born–Haber cycle', lecture: 'L8', size: { w: 760, h: 780 },
    blurb: 'Animated energy-level diagram: fill in the step energies and solve for the lattice energy with Hess\'s law; compare lattice energies with Coulomb\'s law.',
    component: lazy(() => import('./IonicEnergetics')),
  },
  {
    id: 'polarity-en', title: 'Electronegativity & bond polarity', lecture: 'L8', size: { w: 720, h: 760 },
    blurb: 'Pick two elements or slide ΔEN: classify the bond, see the electron cloud shift, δ+/δ− and the dipole arrow; rank bonds by polarity.',
    component: lazy(() => import('./PolarityEN')),
  },
  {
    id: 'bond-props', title: 'Bond order, length & energy', lecture: 'L9', size: { w: 720, h: 760 },
    blurb: 'Bond order ↔ length ↔ energy for C–C/C=C/C≡C, N–N…, C–O…; predict-then-reveal questions and resonance-averaged bond orders.',
    component: lazy(() => import('./BondProps')),
  },
]
