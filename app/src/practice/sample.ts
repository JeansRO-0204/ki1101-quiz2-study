// DEV SAMPLE ONLY: used when the real question bank is empty so the UI can be designed/typechecked.
import type { Flashcard, Question } from '../types'

const S = '**[DEV SAMPLE]** '
export const SAMPLE_QUESTIONS: Question[] = [
  { id: 'sample:m1', kind: 'mcq', lecture: 'L7', topic: 'Light & photons', source: 'slide', slides: [10], stem: S + 'Which type of electromagnetic radiation has the **highest frequency**?', options: ['Radio waves', 'Microwaves', 'Visible light', 'X-rays', 'Infrared'], answer: [3], explanation: 'Frequency rises as wavelength falls: $\\nu = c/\\lambda$. Of these, X-rays have the shortest wavelength.' },
  { id: 'sample:m2', kind: 'mcq', lecture: 'L8', topic: 'Electron configurations', source: 'generated', stem: S + 'Which of these are correct configurations? *(select all that apply)*', options: ['$\\mathrm{Fe^{3+}}$: $[\\mathrm{Ar}]\\,3d^5$', '$\\mathrm{Cu}$: $[\\mathrm{Ar}]\\,4s^2\\,3d^9$', '$\\mathrm{Zn^{2+}}$: $[\\mathrm{Ar}]\\,3d^{10}$', '$\\mathrm{Cl^-}$: $[\\mathrm{Ne}]\\,3s^2\\,3p^6$'], answer: [0, 2, 3], explanation: 'Cu is an exception ($4s^1 3d^{10}$). Cations lose $4s$ electrons first.' },
  { id: 'sample:m3', kind: 'mcq', lecture: 'L9', topic: 'Formal charge', source: 'generated', stem: S + 'What is the formal charge on S in $\\mathrm{SO_4^{2-}}$ when it has four single bonds?', options: ['0', '+1', '+2', '-2'], answer: [2], explanation: '$FC = 6 - (4 + 0) = +2$.', slides: [51] },
  { id: 'sample:m4', kind: 'mcq', lecture: 'L10', topic: 'VSEPR', source: 'slide', stem: S + 'What is the shape of $\\mathrm{SF_4}$?', options: ['Tetrahedral', 'Square planar', 'Seesaw', 'Trigonal pyramidal', 'T-shaped'], answer: [2], explanation: '5 domains (4 bonds + 1 lone pair) → trigonal bipyramidal; lone pair equatorial → seesaw.', slides: [30] },
  { id: 'sample:m5', kind: 'mcq', lecture: 'L10', topic: 'MO theory', source: 'generated', stem: S + 'Which species is paramagnetic?', options: ['$\\mathrm{N_2}$', '$\\mathrm{C_2}$', '$\\mathrm{O_2}$', '$\\mathrm{F_2}$'], answer: [2], explanation: '$\\mathrm{O_2}$ has two unpaired electrons in $\\pi^*_{2p}$.' },
  { id: 'sample:n1', kind: 'numeric', lecture: 'L7', topic: 'Light & photons', source: 'generated', stem: S + 'Calculate the frequency of light with wavelength **500 nm**.', answer: 5.996e14, unit: 'Hz', explanation: '$\\nu = c/\\lambda = 2.998\\times10^8 / 5.00\\times10^{-7} = 5.996\\times10^{14}$ Hz.', steps: [{ prompt: 'Wavelength in m', answer: 5e-7, unit: 'm' }] },
  { id: 'sample:n2', kind: 'numeric', lecture: 'L7', topic: 'Light & photons', source: 'generated', stem: S + 'Energy of one mole of 500 nm photons in kJ/mol?', answer: 239.3, unit: 'kJ/mol', explanation: '$E=hc/\\lambda=3.97\\times10^{-19}$ J; $\\times N_A = 2.39\\times10^5$ J/mol.', steps: [{ prompt: 'Energy of ONE photon', answer: 3.972e-19, unit: 'J' }] },
  { id: 'sample:n3', kind: 'numeric', lecture: 'L7', topic: 'H atom & Bohr model', source: 'slide', stem: S + 'Wavelength (nm) of the Balmer line $n=3\\to2$?', answer: 656, unit: 'nm', explanation: '$1/\\lambda = R_H(1/4 - 1/9)$ gives 656 nm.', tol: { rel: 0.02 } },
  { id: 'sample:n4', kind: 'numeric', lecture: 'L9', topic: 'Formal charge', source: 'generated', stem: S + 'Formal charge of O in $\\mathrm{H_3O^+}$ (3 bonds, 1 lone pair)?', answer: 1, explanation: '$6 - (3 + 2) = +1$.', tol: { abs: 0.01 } },
  { id: 'sample:n5', kind: 'numeric', lecture: 'L10', topic: 'MO theory', source: 'generated', stem: S + 'Bond order of $\\mathrm{O_2^-}$?', answer: 1.5, explanation: '13 valence e⁻: 8 bonding, 5 antibonding → BO = 1.5.', tol: { abs: 0.01 } },
  { id: 'sample:w1', kind: 'widget', widget: 'lewis', task: { species: 'SO4^2-' }, lecture: 'L9', topic: 'Lewis structures', source: 'generated', stem: S + 'Build the Lewis structure of sulfate.', explanation: 'Draw the structure with the lowest formal charges.' },
  { id: 'sample:w2', kind: 'widget', widget: 'econfig', task: { element: 'Fe', charge: 3 }, lecture: 'L8', topic: 'Electron configurations', source: 'generated', stem: S + 'Fill the orbital boxes for $\\mathrm{Fe^{3+}}$.', explanation: 'Remove 4s first.' },
  { id: 'sample:w3', kind: 'widget', widget: 'vsepr', task: { species: 'SF4' }, lecture: 'L10', topic: 'VSEPR', source: 'generated', stem: S + 'Work out the VSEPR shape of SF₄.', explanation: 'Seesaw.' },
  { id: 'sample:w4', kind: 'widget', widget: 'mo', task: { species: 'O2^-' }, lecture: 'L10', topic: 'MO theory', source: 'generated', stem: S + 'Fill the MO diagram of the superoxide ion.', explanation: 'BO 1.5.' },
  { id: 'sample:w5', kind: 'widget', widget: 'hatom', task: { ni: 4, nf: 2 }, lecture: 'L7', topic: 'H atom & Bohr model', source: 'generated', stem: S + 'Analyse the transition n = 4 → 2.', explanation: 'Balmer, 486 nm.' },
]
export const SAMPLE_CARDS: Flashcard[] = [
  { id: 'sample:c1', lecture: 'L7', topic: 'Light & photons', front: '**[DEV SAMPLE]** Relation between wavelength and frequency?', back: '$c = \\lambda\\nu$' },
  { id: 'sample:c2', lecture: 'L7', topic: 'Light & photons', front: 'Energy of a photon?', back: '$E = h\\nu = hc/\\lambda$' },
  { id: 'sample:c3', lecture: 'L8', topic: 'Lattice energy', front: 'What does lattice energy depend on?', back: '$\\propto q^+q^-/d$: charges and ion sizes.' },
  { id: 'sample:c4', lecture: 'L9', topic: 'Formal charge', front: 'Formal charge formula?', back: '$FC = V - (\\text{bonds} + \\text{unshared e}^-)$' },
  { id: 'sample:c5', lecture: 'L10', topic: 'MO theory', front: 'Bond order?', back: '$\\tfrac12(n_b - n_a)$' },
]
