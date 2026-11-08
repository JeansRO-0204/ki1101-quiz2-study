// Maps a question's topic to the Materials sections that explain it, so hints and solutions can link back to the lecture notes.
import type { LectureId, Question } from '../types'

export interface Ref { lecture: LectureId; id: string; title: string }
const R = (lecture: LectureId, id: string, title: string): Ref => ({ lecture, id, title })

const BY_TOPIC: Record<string, Ref[]> = {
  'Light & photons': [R('L7', 'photon', 'Light as particles: photons'), R('L7', 'wave', 'Light as a wave')],
  'Photoelectric effect': [R('L7', 'photoelectric', 'Photoelectric effect')],
  'Line spectra & Bohr': [R('L7', 'spectrum', 'Hydrogen line spectrum & Rydberg'), R('L7', 'bohr', 'Quantisation & the Bohr model')],
  'Quantum numbers': [R('L7', 'orbitals', 'Quantum numbers & orbital shapes')],
  'Electron configuration': [R('L7', 'config', 'Electron configuration')],
  'Periodic trends': [R('L7', 'trends', 'Periodic trends')],
  'Ion formation & octet': [R('L8', 'why-ions', 'Why metals form cations'), R('L8', 'octet', 'Octet rule & s/p-block ions')],
  'Ion configurations': [R('L8', 'octet', 'Octet rule & s/p-block ions'), R('L8', 'tm', 'Transition metal ions')],
  'Lattice energy': [R('L8', 'lattice', 'Lattice energy')],
  'Born–Haber energetics': [R('L8', 'energetics', 'The Born–Haber path')],
  'Electronegativity & polarity': [R('L8', 'polarity', 'Electronegativity & polar bonds'), R('L8', 'en', 'Electronegativity scale')],
  'Lewis symbols': [R('L9', 'lewis-symbols', 'Lewis symbols')],
  'Covalent bonding': [R('L9', 'covalent-bond', 'The covalent bond & bond energy')],
  'Bond properties': [R('L9', 'bond-properties', 'Bond order, length & energy')],
  'Carbon compounds': [R('L9', 'carbon-compounds', 'Carbon compounds')],
  'Lewis structures': [R('L9', 'lewis-method', 'Method for Lewis structures'), R('L9', 'octet-multiple', 'Octet rule & multiple bonds')],
  'Formal charge': [R('L9', 'formal-charge', 'Formal charge')],
  'Resonance': [R('L9', 'resonance', 'Resonance & delocalisation')],
  'Resonance & delocalisation': [R('L9', 'resonance', 'Resonance & delocalisation')],
  'Coordinate covalent bonds': [R('L9', 'coordinate', 'Coordinate covalent bonds')],
  'VSEPR shapes': [R('L10', 'vsepr-basics', 'VSEPR basics'), R('L10', 'vsepr-shapes-3-4', 'Shapes from 3 & 4 domains'), R('L10', 'vsepr-shapes-5-6', 'Shapes from 5 & 6 domains')],
  'Molecular polarity': [R('L10', 'polarity', 'Molecular polarity')],
  'Hybridization': [R('L10', 'hybridization', 'Hybridization'), R('L10', 'vbt', 'Valence bond theory')],
  'Sigma & pi bonds': [R('L10', 'sigma-pi', 'Sigma and pi bonds')],
  'MO theory': [R('L10', 'mo-basics', 'MO theory basics'), R('L10', 'mo-diatomics', 'Second-row diatomics')],
}

/** Materials sections that explain this question's topic (empty for out-of-scope questions). */
export function refsFor(q: Pick<Question, 'topic'>): Ref[] {
  return BY_TOPIC[q.topic] ?? []
}

/** Opens in a new tab so a half-answered question or Workspace panel is not lost. */
export const refHref = (r: Ref) => `${location.pathname}${location.search}#/learn/${r.lecture}/${r.id}`
