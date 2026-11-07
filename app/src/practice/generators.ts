// Parameterized question generators for Drill and Mock. Each call to make() returns a fresh MCQ / NumericQ
// with random values and a full worked explanation (markdown + KaTeX).
import { CONST } from '../lib/kit'
import { AUFBAU, CAP, el } from '../lib/chem/elements'
import type { LectureId, MCQ, NumericQ, Question } from '../types'

export interface Generator {
  id: string
  title: string
  lecture: LectureId
  topic: string
  kind: 'numeric' | 'mcq' | 'mixed'
  make: () => Question
}

/* ---------- helpers ---------- */
const R = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
const pick = <T,>(xs: readonly T[]): T => xs[R(0, xs.length - 1)]
function shuffle<T>(xs: readonly T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) { const j = R(0, i); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
const sample = <T,>(xs: readonly T[], k: number) => shuffle(xs).slice(0, k)
let uid = 0
const newId = (g: string) => `gen:${g}:${Date.now().toString(36)}${(uid++).toString(36)}`
const round = (x: number, sig: number) => Number(x.toPrecision(sig))

/** TeX for a number: 4.86 \times 10^{-7} outside [0.01, 10000). */
export function tx(x: number, sig = 3): string {
  if (x === 0) return '0'
  const a = Math.abs(x)
  if (a >= 0.01 && a < 10000) return String(Number(x.toPrecision(sig)))
  const e = Math.floor(Math.log10(a))
  const m = Number((x / 10 ** e).toPrecision(sig))
  return `${m} \\times 10^{${e}}`
}
/** TeX for a species formula: "SO4^2-" → \mathrm{SO_{4}^{2-}} */
export function mf(f: string): string {
  const [base, ch] = f.split('^')
  return `\\mathrm{${base.replace(/(\d+)/g, '_{$1}')}${ch ? `^{${ch}}` : ''}}`
}
const M = (f: string) => `$${mf(f)}$`
const T = (s: string) => `$${s}$`

type Base = Pick<NumericQ, 'id' | 'lecture' | 'topic' | 'source' | 'stem' | 'explanation' | 'difficulty'>
function base(g: Generator | { id: string; topic: string }, lecture: LectureId, stem: string, explanation: string, difficulty: 1 | 2 | 3 = 2): Base {
  return { id: newId(g.id), lecture, topic: g.topic, source: 'generated', stem, explanation, difficulty }
}
function mcq(b: Base, options: string[], answer: number[]): MCQ {
  return { ...b, kind: 'mcq', options, answer }
}
/** Shuffles options, keeping track of the correct one. */
function mcqShuffled(b: Base, correct: string, wrong: string[]): MCQ {
  const opts = shuffle([correct, ...wrong])
  return mcq(b, opts, [opts.indexOf(correct)])
}
function distinct(correct: string, cands: string[], k: number): string[] {
  const out: string[] = []
  for (const c of cands) if (c !== correct && !out.includes(c)) out.push(c)
  return out.slice(0, k)
}

const { h, c, RH, RE, NA, e: QE, me } = CONST
void RH

/* ---------- 1. wavelength <-> frequency ---------- */
const gWave: Generator = {
  id: 'wave-nu', title: 'λ ↔ ν (c = λν)', lecture: 'L7', topic: 'Light & photons', kind: 'numeric',
  make() {
    const toNu = Math.random() < 0.55
    if (toNu) {
      const nm = pick([R(120, 900), R(2, 90) * 10, R(10, 150) * 10])
      const lam = nm * 1e-9, nu = c / lam
      return {
        ...base(gWave, 'L7', `Light has a wavelength of **${nm} nm**. Calculate its frequency in Hz.`,
          `Convert to metres first: $\\lambda = ${nm}\\ \\text{nm} \\times 10^{-9}\\ \\text{m/nm} = ${tx(lam)}\\ \\text{m}$.\n\n$$\\nu = \\frac{c}{\\lambda} = \\frac{2.998\\times10^{8}\\ \\text{m/s}}{${tx(lam)}\\ \\text{m}} = ${tx(nu)}\\ \\text{Hz}$$`, 1),
        kind: 'numeric', answer: nu, unit: 'Hz', tol: { rel: 0.02 },
        steps: [{ prompt: 'Wavelength in metres', answer: lam, unit: 'm' }],
      }
    }
    const nu = round(R(10, 99) / 10 * 10 ** R(13, 15), 2), lam = c / nu, nm = lam * 1e9
    return {
      ...base(gWave, 'L7', `Radiation has a frequency of $${tx(nu)}$ Hz. Calculate its wavelength in **nm**.`,
        `$$\\lambda = \\frac{c}{\\nu} = \\frac{2.998\\times10^{8}\\ \\text{m/s}}{${tx(nu)}\\ \\text{s}^{-1}} = ${tx(lam)}\\ \\text{m}$$\n\nConvert: $${tx(lam)}\\ \\text{m} \\times 10^{9}\\ \\text{nm/m} = ${tx(nm)}\\ \\text{nm}$.`, 1),
      kind: 'numeric', answer: nm, unit: 'nm', tol: { rel: 0.02 },
      steps: [{ prompt: 'Wavelength in metres', answer: lam, unit: 'm' }],
    }
  },
}

/* ---------- 2. photon energy ---------- */
const gPhoton: Generator = {
  id: 'photon-energy', title: 'Photon energy E = hν = hc/λ', lecture: 'L7', topic: 'Light & photons', kind: 'numeric',
  make() {
    const v = R(0, 3)
    const nm = pick([R(150, 800), R(2, 70) * 10 + 5])
    const lam = nm * 1e-9, nu = c / lam, E = h * nu
    if (v === 0) {
      return {
        ...base(gPhoton, 'L7', `Calculate the energy (in J) of **one photon** of light with wavelength **${nm} nm**.`,
          `$\\nu = c/\\lambda = ${tx(nu)}\\ \\text{Hz}$, then $$E = h\\nu = (6.626\\times10^{-34})(${tx(nu)}) = ${tx(E)}\\ \\text{J}$$ Equivalently $E = hc/\\lambda$.`, 1),
        kind: 'numeric', answer: E, unit: 'J', steps: [{ prompt: 'Frequency ν', answer: nu, unit: 'Hz' }],
      }
    }
    if (v === 1) {
      const Em = E * NA / 1000
      return {
        ...base(gPhoton, 'L7', `Calculate the energy of **one mole** of photons of wavelength **${nm} nm**, in kJ/mol.`,
          `Energy of one photon: $E = hc/\\lambda = ${tx(E)}\\ \\text{J}$.\n\nOne mole: $E_m = E \\cdot N_A = ${tx(E)} \\times 6.022\\times10^{23} = ${tx(E * NA)}\\ \\text{J/mol} = ${tx(Em)}\\ \\text{kJ/mol}$.`, 2),
        kind: 'numeric', answer: Em, unit: 'kJ/mol', steps: [{ prompt: 'Energy of ONE photon', answer: E, unit: 'J' }],
      }
    }
    if (v === 2) {
      return {
        ...base(gPhoton, 'L7', `A photon carries $${tx(E)}$ J. What is its wavelength in **nm**?`,
          `$\\nu = E/h = ${tx(E)}/6.626\\times10^{-34} = ${tx(nu)}\\ \\text{Hz}$.\n\n$$\\lambda = c/\\nu = ${tx(lam)}\\ \\text{m} = ${nm}\\ \\text{nm}$$`, 2),
        kind: 'numeric', answer: nm, unit: 'nm', steps: [{ prompt: 'Frequency ν', answer: nu, unit: 'Hz' }],
      }
    }
    const kj = round(E * NA / 1000, 3), Eph = kj * 1000 / NA, lam2 = h * c / Eph * 1e9
    return {
      ...base(gPhoton, 'L7', `A bond breaks when it absorbs **${kj} kJ/mol** of photons. What is the longest wavelength (in nm) that supplies this energy?`,
        `Energy per photon: $E = \\dfrac{${kj}\\times10^{3}\\ \\text{J/mol}}{6.022\\times10^{23}\\ \\text{mol}^{-1}} = ${tx(Eph)}\\ \\text{J}$.\n\n$$\\lambda = \\frac{hc}{E} = \\frac{(6.626\\times10^{-34})(2.998\\times10^{8})}{${tx(Eph)}} = ${tx(lam2 * 1e-9)}\\ \\text{m} = ${tx(lam2)}\\ \\text{nm}$$`, 3),
      kind: 'numeric', answer: lam2, unit: 'nm', steps: [{ prompt: 'Energy per photon', answer: Eph, unit: 'J' }],
    }
  },
}

/* ---------- 3. Bohr / Rydberg ---------- */
const gBohr: Generator = {
  id: 'bohr-transition', title: 'Bohr / Rydberg transitions', lecture: 'L7', topic: 'Line spectra & Bohr', kind: 'numeric',
  make() {
    let ni = R(1, 7), nf = R(1, 7)
    while (ni === nf) nf = R(1, 7)
    const emit = ni > nf
    const f = 1 / (nf * nf) - 1 / (ni * ni) // >0 for emission
    const dE = -RE * f // ΔE of the atom (E_final − E_initial)
    const absE = Math.abs(dE), lam = h * c / absE * 1e9
    const word = emit ? 'emitted' : 'absorbed'
    const common = `$E_n = -\\dfrac{2.18\\times10^{-18}\\ \\text{J}}{n^2}$, so $\\Delta E = E_f - E_i = -2.18\\times10^{-18}\\left(\\dfrac{1}{${nf}^2}-\\dfrac{1}{${ni}^2}\\right) = ${tx(dE)}\\ \\text{J}$ (${emit ? 'negative: the atom loses energy, a photon is emitted' : 'positive: the atom gains energy, a photon is absorbed'}).`
    if (Math.random() < 0.4) {
      return {
        ...base(gBohr, 'L7', `A hydrogen atom changes from $n=${ni}$ to $n=${nf}$. Calculate $\\Delta E$ of the **atom** in J (include the sign).`, common, 2),
        kind: 'numeric', answer: dE, unit: 'J', tol: { rel: 0.02 },
        steps: [{ prompt: `Value of 1/n_f² − 1/n_i²`, answer: f, tol: { rel: 0.02 } }],
      }
    }
    return {
      ...base(gBohr, 'L7', `An electron in a hydrogen atom drops/jumps from $n=${ni}$ to $n=${nf}$. Calculate the wavelength (nm) of the photon ${word}.`,
        `${common}\n\n$$\\lambda = \\frac{hc}{|\\Delta E|} = \\frac{(6.626\\times10^{-34})(2.998\\times10^{8})}{${tx(absE)}} = ${tx(lam * 1e-9)}\\ \\text{m} = ${tx(lam)}\\ \\text{nm}$$\n\n(Same result from the Rydberg equation $1/\\lambda = R_H\\,|1/n_f^2 - 1/n_i^2|$ with $R_H = 1.097\\times10^{7}\\ \\text{m}^{-1}$.)`, 2),
      kind: 'numeric', answer: lam, unit: 'nm', tol: { rel: 0.025 },
      steps: [{ prompt: '|ΔE| of the photon', answer: absE, unit: 'J', tol: { rel: 0.02 } }],
    }
  },
}

/* ---------- 4. H series ---------- */
const SERIES = [
  { n: 1, name: 'Lyman', region: 'ultraviolet' },
  { n: 2, name: 'Balmer', region: 'visible' },
  { n: 3, name: 'Paschen', region: 'infrared' },
  { n: 4, name: 'Brackett', region: 'infrared' },
  { n: 5, name: 'Pfund', region: 'infrared' },
]
const gSeries: Generator = {
  id: 'h-series', title: 'Hydrogen spectral series', lecture: 'L7', topic: 'Line spectra & Bohr', kind: 'mcq',
  make() {
    const s = pick(SERIES)
    const ni = s.n === 2 ? R(3, 6) : s.n + R(1, 4)
    const lam = 1 / (CONST.RH * (1 / (s.n * s.n) - 1 / (ni * ni))) * 1e9
    const opts = SERIES.map((x) => `${x.name} series (${x.region})`)
    return mcq(base(gSeries, 'L7', `The emission line of hydrogen for the transition $n=${ni}\\to n=${s.n}$ belongs to which series, and in which spectral region does it lie?`,
      `The series is fixed by the **final level** $n_f$: Lyman 1 (UV), Balmer 2 (visible), Paschen 3, Brackett 4, Pfund 5 (all IR). Here $n_f=${s.n}$ → **${s.name}**.\n\nCheck: $1/\\lambda = R_H(1/${s.n}^2 - 1/${ni}^2)$ gives $\\lambda \\approx ${Math.round(lam)}$ nm, which is ${s.region}.`, 2),
      opts, [s.n - 1])
  },
}

/* ---------- 5. photoelectric ---------- */
const gPhoto: Generator = {
  id: 'photoelectric', title: 'Photoelectric effect', lecture: 'L7', topic: 'Photoelectric effect', kind: 'numeric',
  make() {
    const inEV = Math.random() < 0.5
    const phiEV = R(18, 50) / 10
    const phiJ = inEV ? phiEV * QE : round(phiEV * QE, 3)
    const phiTxt = inEV ? `${phiEV} eV` : `$${tx(phiJ)}$ J`
    const phiExplain = inEV ? `$\\Phi = ${phiEV}\\ \\text{eV} \\times 1.602\\times10^{-19}\\ \\text{J/eV} = ${tx(phiJ)}\\ \\text{J}$` : `$\\Phi = ${tx(phiJ)}\\ \\text{J}$`
    const v = R(0, 2)
    if (v === 0 || v === 1) {
      const nm = Math.round(h * c / (phiJ * (1.25 + Math.random() * 1.6)) * 1e9 / 5) * 5
      const Eph = h * c / (nm * 1e-9), ke = Eph - phiJ
      const phiStep = { prompt: 'Work function Φ in joules', answer: phiJ, unit: 'J' }
      const eStep = { prompt: 'Photon energy hc/λ', answer: Eph, unit: 'J' }
      const common = `${phiExplain}. Photon energy: $E = hc/\\lambda = ${tx(Eph)}\\ \\text{J}$ (> Φ, so electrons are ejected).\n\n$$KE = h\\nu - \\Phi = ${tx(Eph)} - ${tx(phiJ)} = ${tx(ke)}\\ \\text{J}$$`
      if (v === 0) {
        return {
          ...base(gPhoto, 'L7', `Light of wavelength **${nm} nm** strikes a metal with work function ${phiTxt}. Find the maximum kinetic energy of the ejected electrons in J.`, common, 2),
          kind: 'numeric', answer: ke, unit: 'J', tol: { rel: 0.03 }, steps: [inEV ? phiStep : eStep, inEV ? eStep : phiStep].slice(0, 2),
        }
      }
      const vel = Math.sqrt(2 * ke / me)
      return {
        ...base(gPhoto, 'L7', `Light of wavelength **${nm} nm** strikes a metal with work function ${phiTxt}. Find the speed (m/s) of the fastest ejected electrons ($m_e = 9.109\\times10^{-31}$ kg).`,
          `${common}\n\n$$KE = \\tfrac12 m v^2 \\Rightarrow v = \\sqrt{\\frac{2\\,KE}{m_e}} = \\sqrt{\\frac{2(${tx(ke)})}{9.109\\times10^{-31}}} = ${tx(vel)}\\ \\text{m/s}$$`, 3),
        kind: 'numeric', answer: vel, unit: 'm/s', tol: { rel: 0.03 }, steps: [{ prompt: 'Maximum kinetic energy', answer: ke, unit: 'J', tol: { rel: 0.04 } }],
      }
    }
    const lam0 = h * c / phiJ * 1e9
    return {
      ...base(gPhoto, 'L7', `A metal has work function ${phiTxt}. What is the **threshold wavelength** (nm) above which no electrons are emitted?`,
        `${phiExplain}.\n\nAt threshold $h\\nu_0 = \\Phi$, so $$\\lambda_0 = \\frac{hc}{\\Phi} = \\frac{(6.626\\times10^{-34})(2.998\\times10^{8})}{${tx(phiJ)}} = ${tx(lam0 * 1e-9)}\\ \\text{m} = ${tx(lam0)}\\ \\text{nm}$$ Any longer wavelength has photons with $E<\\Phi$.`, 2),
      kind: 'numeric', answer: lam0, unit: 'nm', tol: { rel: 0.03 }, steps: [{ prompt: 'Work function Φ in joules', answer: phiJ, unit: 'J' }],
    }
  },
}

/* ---------- 6. quantum numbers ---------- */
type QN = [number, number, number, number | string]
const qnTex = ([n, l, ml, ms]: QN) => {
  const s = ms === 0.5 ? '+\\tfrac12' : ms === -0.5 ? '-\\tfrac12' : String(ms)
  return `$(${n},\\ ${l},\\ ${ml >= 0 ? ml : '-' + -ml},\\ ${s})$`
}
function qnProblem([n, l, ml, ms]: QN): string | null {
  if (!Number.isInteger(n) || n < 1) return `$n=${n}$ is not allowed: $n$ must be a positive integer (1, 2, 3, …).`
  if (l < 0 || l > n - 1) return `$\\ell=${l}$ is not allowed for $n=${n}$: $\\ell$ runs from 0 to $n-1$ (here 0 to ${n - 1}).`
  if (Math.abs(ml) > l) return `$m_\\ell=${ml}$ is not allowed for $\\ell=${l}$: $m_\\ell$ runs from $-\\ell$ to $+\\ell$ (here $-${l}$ to $+${l}$).`
  if (ms !== 0.5 && ms !== -0.5) return `$m_s=${ms}$ is not allowed: $m_s$ can only be $+\\tfrac12$ or $-\\tfrac12$.`
  return null
}
function validQN(): QN {
  const n = R(1, 5), l = R(0, n - 1), ml = R(-l, l)
  return [n, l, ml, pick([0.5, -0.5])]
}
function invalidQN(kind: number): QN {
  const v = validQN()
  const [n, l] = v
  if (kind === 0) return [n, n + R(0, 1), v[2], v[3]]
  if (kind === 1) return [n, l, l + 1 + R(0, 1), v[3]]
  if (kind === 2) return [n, l, v[2], pick([0, 1, -1, 1.5])]
  return [0, 0, 0, v[3]]
}
const gQN: Generator = {
  id: 'quantum-numbers', title: 'Allowed quantum numbers', lecture: 'L7', topic: 'Quantum numbers', kind: 'mcq',
  make() {
    const askValid = Math.random() < 0.5
    const kinds = sample([0, 1, 2, 3], 3)
    const seen = new Set<string>()
    const mkUnique = (f: () => QN) => { let q = f(); let k = 0; while (seen.has(qnTex(q)) && k++ < 30) q = f(); seen.add(qnTex(q)); return q }
    const valid = askValid ? [mkUnique(validQN)] : [mkUnique(validQN), mkUnique(validQN), mkUnique(validQN)]
    const invalid = askValid ? kinds.map((k) => mkUnique(() => invalidQN(k))) : [mkUnique(() => invalidQN(kinds[0]))]
    const all = shuffle([...valid.map((q) => ({ q, ok: true })), ...invalid.map((q) => ({ q, ok: false }))])
    const idx = all.findIndex((x) => x.ok === askValid)
    const lines = all.map((x, i) => `- **${i + 1}.** ${qnTex(x.q)}: ${qnProblem(x.q) ?? 'allowed.'}`).join('\n')
    return mcq(base(gQN, 'L7', askValid ? `Which set of quantum numbers $(n,\\ \\ell,\\ m_\\ell,\\ m_s)$ is **allowed**?` : `Which set of quantum numbers $(n,\\ \\ell,\\ m_\\ell,\\ m_s)$ is **NOT allowed**?`,
      `Rules: $n\\ge1$ integer; $\\ell=0\\ldots n-1$; $m_\\ell=-\\ell\\ldots+\\ell$; $m_s=\\pm\\tfrac12$.\n\n${lines}`, 1),
      all.map((x) => qnTex(x.q)), [idx])
  },
}

/* ---------- 7. orbital / electron counts ---------- */
const LNAME = ['s', 'p', 'd', 'f']
const gCounts: Generator = {
  id: 'orbital-counts', title: 'Orbitals & electrons per shell / subshell', lecture: 'L7', topic: 'Quantum numbers', kind: 'numeric',
  make() {
    const v = R(0, 5)
    const n = R(2, 5)
    const l = R(0, 3)
    const mk = (stem: string, ans: number, exp: string, d: 1 | 2 | 3 = 1): NumericQ => ({ ...base(gCounts, 'L7', stem, exp, d), kind: 'numeric', answer: ans, tol: { abs: 0.01 } })
    switch (v) {
      case 0: return mk(`How many **orbitals** are there in the shell with $n=${n}$?`, n * n, `Each subshell $\\ell=0\\ldots${n - 1}$ has $2\\ell+1$ orbitals. Sum $=n^2=${n * n}$.`)
      case 1: return mk(`What is the maximum number of **electrons** in the shell with $n=${n}$?`, 2 * n * n, `$n^2=${n * n}$ orbitals × 2 electrons each $=2n^2=${2 * n * n}$.`)
      case 2: return mk(`How many orbitals are in a **${n}${LNAME[Math.min(l, n - 1)]}** subshell?`, 2 * Math.min(l, n - 1) + 1, `For $\\ell=${Math.min(l, n - 1)}$ (${LNAME[Math.min(l, n - 1)]}), $m_\\ell$ takes $2\\ell+1=${2 * Math.min(l, n - 1) + 1}$ values.`)
      case 3: { const ll = Math.min(l, n - 1); return mk(`How many electrons can a **${n}${LNAME[ll]}** subshell hold?`, 2 * (2 * ll + 1), `${2 * ll + 1} orbitals × 2 electrons $=${2 * (2 * ll + 1)}$.`) }
      case 4: return mk(`How many **subshells** (different values of $\\ell$) does the shell with $n=${n}$ contain?`, n, `$\\ell=0,1,\\ldots,n-1$ gives $n=${n}$ subshells (${LNAME.slice(0, n).map((s) => n + s).join(', ')}${n > 4 ? '…' : ''}).`)
      default: { const ll = Math.min(l, n - 1); return mk(`How many different sets of $(n,\\ \\ell,\\ m_\\ell,\\ m_s)$ describe the electrons of a **${n}${LNAME[ll]}** subshell?`, 2 * (2 * ll + 1), `$m_\\ell$ has $2\\ell+1=${2 * ll + 1}$ values and $m_s$ has 2, giving $${2 * (2 * ll + 1)}$ distinct sets: the capacity of the subshell.`, 2) }
    }
  },
}

/* ---------- 8/9. configurations of atoms and ions ---------- */
type Cfg = Map<string, number>
interface Species { z: number; q: number }
const subOrder = (s: string) => AUFBAU.indexOf(s)
function neutralCfg(z: number): Cfg { return new Map(el(z)!.config) }
function speciesCfg({ z, q }: Species): Cfg {
  if (q < 0) return neutralCfg(z - q) // anion = isoelectronic neutral atom
  const m = neutralCfg(z)
  let rem = q
  // remove from highest n first; within the same n, highest l first
  const order = [...m.keys()].sort((a, b) => Number(b[0]) - Number(a[0]) || LNAME.indexOf(b[1]) - LNAME.indexOf(a[1]))
  for (const s of order) {
    if (rem <= 0) break
    const take = Math.min(rem, m.get(s)!)
    m.set(s, m.get(s)! - take); rem -= take
  }
  return m
}
const NOBLE_Z = [2, 10, 18, 36, 54, 86]
function cfgTex(m: Cfg, maxCore = 118): string {
  const ne = [...m.values()].reduce((a, b) => a + b, 0)
  let subs = [...m.entries()].filter(([, n]) => n > 0).sort((a, b) => subOrder(a[0]) - subOrder(b[0]))
  let core = ''
  const cz = [...NOBLE_Z].reverse().find((z) => z < ne && z <= maxCore && el(z)!.config.every(([s, n]) => (m.get(s) ?? 0) === n))
  if (cz) { core = `[\\mathrm{${el(cz)!.symbol}}]\\,`; const cs = new Set(el(cz)!.config.map(([s]) => s)); subs = subs.filter(([s]) => !cs.has(s)) }
  return core + subs.map(([s, n]) => `${s}^{${n}}`).join('\\,')
}
const symTex = ({ z, q }: Species) => `\\mathrm{${el(z)!.symbol}${q ? `^{${Math.abs(q) === 1 ? '' : Math.abs(q)}${q > 0 ? '+' : '-'}}` : ''}}`
const POOL: Species[] = [
  ...[24, 29, 42, 47, 26, 25, 27, 28, 22, 23, 30, 46, 79, 33, 16, 15, 17, 7, 8, 21].map((z) => ({ z, q: 0 })),
  { z: 26, q: 2 }, { z: 26, q: 3 }, { z: 25, q: 2 }, { z: 24, q: 3 }, { z: 29, q: 1 }, { z: 29, q: 2 }, { z: 30, q: 2 }, { z: 28, q: 2 },
  { z: 27, q: 2 }, { z: 27, q: 3 }, { z: 22, q: 3 }, { z: 23, q: 3 }, { z: 47, q: 1 }, { z: 50, q: 2 }, { z: 50, q: 4 }, { z: 82, q: 2 },
  { z: 81, q: 1 }, { z: 83, q: 3 }, { z: 31, q: 3 }, { z: 17, q: -1 }, { z: 16, q: -2 }, { z: 8, q: -2 }, { z: 7, q: -3 }, { z: 35, q: -1 }, { z: 15, q: -3 },
]
const isNeutralException = (z: number) => z in { 24: 1, 29: 1, 42: 1, 47: 1, 46: 1, 79: 1 }
const gConfig: Generator = {
  id: 'econfig', title: 'Condensed electron configuration', lecture: 'L8', topic: 'Ion configurations', kind: 'mcq',
  make() {
    const sp = pick(POOL)
    const cfg = speciesCfg(sp)
    const correct = cfgTex(cfg)
    const neC = [...cfg.values()].reduce((a, b) => a + b, 0)
    const coreZ = [...NOBLE_Z].reverse().find((z) => z < neC && el(z)!.config.every(([s, n]) => (cfg.get(s) ?? 0) === n)) ?? 0
    const coreSubs = new Set(coreZ ? el(coreZ)!.config.map(([s]) => s) : [])
    const cfgTex2 = (m: Cfg) => cfgTex(m, coreZ)
    const cands: string[] = []
    const base0 = neutralCfg(sp.z)
    if (sp.q === 0 || isNeutralException(sp.z)) {
      // naive Aufbau (no exception)
      const naive: Cfg = new Map(); let left = sp.z - sp.q
      for (const s of AUFBAU) { if (left <= 0) break; const k = Math.min(left, CAP[s[1]]); naive.set(s, k); left -= k }
      cands.push(cfgTex2(naive))
    }
    if (sp.q > 0) {
      // wrong: remove electrons from the 3d/(n-1)d first, or from the ns first when p electrons should go
      const alt: Cfg = new Map(base0); let rem = sp.q
      const ord = [...alt.keys()].sort((a, b) => subOrder(b) - subOrder(a))
      for (const s of ord) { if (rem <= 0) break; const t = Math.min(rem, alt.get(s)!); alt.set(s, alt.get(s)! - t); rem -= t }
      cands.push(cfgTex2(alt))
      const alt2: Cfg = new Map(base0); rem = sp.q
      const ord2 = [...alt2.keys()].sort((a, b) => (a[1] === 's' ? 0 : 1) - (b[1] === 's' ? 0 : 1) || Number(b[0]) - Number(a[0]))
      for (const s of ord2) { if (rem <= 0) break; const t = Math.min(rem, alt2.get(s)!); alt2.set(s, alt2.get(s)! - t); rem -= t }
      cands.push(cfgTex2(alt2))
    }
    // ±1 electron variants
    const keys = [...cfg.keys()].filter((k) => cfg.get(k)! > 0 && !coreSubs.has(k))
    for (const k of shuffle(keys)) {
      for (const d of [1, -1]) {
        const m = new Map(cfg); const v = m.get(k)! + d
        if (v < 0 || v > CAP[k[1]]) continue
        m.set(k, v); cands.push(cfgTex2(m))
      }
    }
    // swap s/d split for transition metals
    const s4 = [...cfg.keys()].find((k) => k[1] === 's' && cfg.get(k)! > 0 && k !== '1s' && keys.some((x) => x[1] === 'd'))
    if (s4) { const m = new Map(cfg); m.set(s4, 2); const d = keys.find((x) => x[1] === 'd')!; m.set(d, Math.max(0, cfg.get(d)! - (2 - cfg.get(s4)!))); cands.push(cfgTex2(m)) }
    const wrong = distinct(correct, cands, 3)
    let k = 0
    while (wrong.length < 3 && k++ < 80) { const m = new Map(cfg); const key = pick(keys); const nv = m.get(key)! + pick([-2, -1, 1, 2]); if (nv < 0 || nv > CAP[key[1]]) continue; m.set(key, nv); const t = cfgTex2(m); if (t !== correct && !wrong.includes(t)) wrong.push(t) }
    const name = sp.q ? `${el(sp.z)!.name} ion` : el(sp.z)!.name
    const exp = sp.q === 0
      ? `Z = ${sp.z}. Fill in Aufbau order${isNeutralException(sp.z) ? `; **${el(sp.z)!.symbol} is a known exception** (half-filled/filled d subshell is extra stable)` : ''}: $${cfgTex(cfg)}$.`
      : sp.q > 0
        ? `Neutral ${el(sp.z)!.symbol}: $${cfgTex(base0)}$. Cations lose electrons from the **highest-$n$ shell first** (the $ns$/$np$ electrons) before the $(n-1)d$ ones, so remove ${sp.q} e⁻ → $${correct}$.`
        : `${symTex(sp)} has ${sp.z - sp.q} electrons: isoelectronic with ${el(sp.z - sp.q)!.symbol}. Add ${-sp.q} e⁻ to the neutral atom's valence subshell → $${correct}$.`
    const isL7 = sp.q === 0 && !isNeutralException(sp.z)
    return mcqShuffled(base({ id: gConfig.id, topic: isL7 ? 'Electron configuration' : 'Ion configurations' }, isL7 ? 'L7' : 'L8', `Which is the correct condensed ground-state electron configuration of $${symTex(sp)}$ (${name}, Z = ${sp.z})?`, exp, isNeutralException(sp.z) || sp.q > 0 ? 3 : 2),
      T(correct), wrong.map(T))
  },
}

function unpairedOf(cfg: Cfg): { total: number; parts: string[] } {
  let total = 0; const parts: string[] = []
  for (const [s, n] of cfg) {
    if (n === 0) continue
    const orbs = (CAP[s[1]]) / 2
    const u = n <= orbs ? n : 2 * orbs - n
    if (u > 0) { total += u; parts.push(`${s}${'^{' + n + '}'}: ${n} e⁻ in ${orbs} orbital${orbs > 1 ? 's' : ''} → ${u} unpaired`) }
  }
  return { total, parts }
}
const gUnpaired: Generator = {
  id: 'unpaired', title: 'Unpaired electrons (Hund)', lecture: 'L8', topic: 'Ion configurations', kind: 'numeric',
  make() {
    const sp = pick(POOL.filter((s) => s.z > 5))
    const cfg = speciesCfg(sp)
    const { total, parts } = unpairedOf(cfg)
    return {
      ...base(gUnpaired, 'L8', `How many **unpaired electrons** are in the ground state of $${symTex(sp)}$?`,
        `Configuration: $${cfgTex(cfg)}$.\n\nApply Hund's rule (fill degenerate orbitals singly before pairing):\n${parts.length ? parts.map((p) => `- $${p.replace(': ', '$: ')}`).join('\n') : '- every subshell is full or empty'}\n\nTotal unpaired $=${total}$ → ${total ? 'paramagnetic' : 'diamagnetic'}.`, 2),
      kind: 'numeric', answer: total, tol: { abs: 0.01 },
      steps: [{ prompt: 'Total number of electrons in the species', answer: sp.z - sp.q, tol: { abs: 0.01 } }],
    }
  },
}

/* ---------- 10/11. trends ---------- */
type Prop = 'radius' | 'ie1' | 'en'
const FALLBACK: Record<string, Record<Prop, number>> = {
  Li: { radius: 128, ie1: 520, en: 0.98 }, Be: { radius: 96, ie1: 900, en: 1.57 }, B: { radius: 84, ie1: 801, en: 2.04 }, C: { radius: 76, ie1: 1086, en: 2.55 },
  N: { radius: 71, ie1: 1402, en: 3.04 }, O: { radius: 66, ie1: 1314, en: 3.44 }, F: { radius: 57, ie1: 1681, en: 3.98 },
  Na: { radius: 166, ie1: 496, en: 0.93 }, Mg: { radius: 141, ie1: 738, en: 1.31 }, Al: { radius: 121, ie1: 578, en: 1.61 }, Si: { radius: 111, ie1: 787, en: 1.9 },
  P: { radius: 107, ie1: 1012, en: 2.19 }, S: { radius: 105, ie1: 1000, en: 2.58 }, Cl: { radius: 102, ie1: 1251, en: 3.16 },
  K: { radius: 203, ie1: 419, en: 0.82 }, Rb: { radius: 220, ie1: 403, en: 0.82 }, Cs: { radius: 244, ie1: 376, en: 0.79 },
  Br: { radius: 120, ie1: 1140, en: 2.96 }, I: { radius: 139, ie1: 1008, en: 2.66 }, Ca: { radius: 176, ie1: 590, en: 1.0 }, H: { radius: 31, ie1: 1312, en: 2.2 },
}
const propVal = (sym: string, p: Prop): number => (el(sym) as Record<string, unknown> | undefined)?.[p] as number | undefined ?? FALLBACK[sym][p]
const PERIOD2 = ['Li', 'Be', 'B', 'C', 'N', 'O', 'F'], PERIOD3 = ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl']
const GROUPS = [['Li', 'Na', 'K', 'Rb', 'Cs'], ['F', 'Cl', 'Br', 'I'], ['Be', 'Mg', 'Ca'], ['O', 'S'], ['Na', 'K', 'Rb', 'Cs']]
const PROPS: Record<Prop, { name: string; unit: string; why: string }> = {
  radius: { name: 'atomic radius', unit: 'pm', why: 'Radius **decreases across a period** (higher $Z_{eff}$ pulls the shell in) and **increases down a group** (new shell).' },
  ie1: { name: 'first ionization energy', unit: 'kJ/mol', why: 'IE₁ generally **increases across a period** and **decreases down a group**; watch the dips at Be→B (2s vs 2p) and N→O (pairing repulsion).' },
  en: { name: 'electronegativity', unit: '', why: 'Electronegativity **increases across a period** and **decreases down a group**.' },
}
function orderOptions(items: string[], correct: string[], sep = ' < '): { options: string[]; idx: number } {
  const fmt = (xs: string[]) => T(xs.join(sep))
  const cands = [correct, [...correct].reverse()]
  for (let i = 0; i < 30 && cands.length < 6; i++) {
    const p = [...correct]; const a = R(0, p.length - 1), b = R(0, p.length - 1); [p[a], p[b]] = [p[b], p[a]]
    if (!cands.some((x) => x.join() === p.join())) cands.push(p)
  }
  const opts = [correct, ...cands.slice(1, 4)]
  void items
  const sh = shuffle(opts.map(fmt))
  return { options: sh, idx: sh.indexOf(fmt(correct)) }
}
const gTrend: Generator = {
  id: 'trend-rank', title: 'Rank radius / IE / EN', lecture: 'L7', topic: 'Periodic trends', kind: 'mcq',
  make() {
    const prop = pick(['radius', 'ie1', 'en'] as Prop[])
    let set: string[] = []
    let fallback: string[] | null = null
    for (let tries = 0; tries < 300; tries++) {
      const src = pick([PERIOD2, PERIOD3, ...GROUPS])
      if (src.length < 3) continue
      set = sample(src, Math.min(4, src.length))
      const vals = set.map((s) => propVal(s, prop)).sort((a, b) => a - b)
      if (vals.every((v, i) => i === 0 || (v - vals[i - 1]) / v > 0.04)) { fallback = null; break }
      // never accept ties (e.g. K = Rb = Cs on the slide EN scale): the order would be ambiguous
      if (!fallback && vals.every((v, i) => i === 0 || v !== vals[i - 1])) fallback = set
      set = fallback ?? set
    }
    const asc = Math.random() < 0.5
    const sorted = [...set].sort((a, b) => propVal(a, prop) - propVal(b, prop))
    if (!asc) sorted.reverse()
    const P = PROPS[prop]
    const { options, idx } = orderOptions(set, sorted.map((s) => `\\mathrm{${s}}`), asc ? ' < ' : ' > ')
    const values = sorted.map((s) => `${s} ${propVal(s, prop)}${P.unit ? ' ' + P.unit : ''}`).join(', ')
    return mcq(base(gTrend, 'L7', `Arrange ${set.map((s) => `**${s}**`).join(', ')} in order of **${asc ? 'increasing' : 'decreasing'} ${P.name}**.`,
      `${P.why}\n\nTypical values (${asc ? 'low → high' : 'high → low'}): ${values}.`, 2), options, [idx])
  },
}
const ISO: { e: number; ions: [string, number, number][] }[] = [
  { e: 10, ions: [['N', -3, 7], ['O', -2, 8], ['F', -1, 9], ['Na', 1, 11], ['Mg', 2, 12], ['Al', 3, 13]] },
  { e: 18, ions: [['P', -3, 15], ['S', -2, 16], ['Cl', -1, 17], ['K', 1, 19], ['Ca', 2, 20]] },
]
const gIso: Generator = {
  id: 'isoelectronic', title: 'Isoelectronic ion radii', lecture: 'L8', topic: 'Ion formation & octet', kind: 'mcq',
  make() {
    const grp = pick(ISO)
    const set = sample(grp.ions, 4)
    const sorted = [...set].sort((a, b) => b[2] - a[2]) // larger Z -> smaller radius, so increasing radius = decreasing Z
    const asc = Math.random() < 0.5
    if (!asc) sorted.reverse()
    const ionTex = (i: [string, number, number]) => `\\mathrm{${i[0]}^{${Math.abs(i[1]) === 1 ? '' : Math.abs(i[1])}${i[1] > 0 ? '+' : '-'}}}`
    const { options, idx } = orderOptions([], sorted.map(ionTex), asc ? ' < ' : ' > ')
    return mcq(base(gIso, 'L8', `These ions all have ${grp.e} electrons: ${set.map((i) => T(ionTex(i))).join(', ')}. Arrange them in order of **${asc ? 'increasing' : 'decreasing'} ionic radius**.`,
      `For an isoelectronic series the electron cloud is the same size-class, so the ion with the **larger nuclear charge $Z$** pulls the electrons in harder and is **smaller**.\n\nZ: ${sorted.map((i) => `${T(ionTex(i))} (${i[2]})`).join(', ')}.`, 2), options, [idx])
  },
}

/* ---------- 12. delta EN ---------- */
const METALS = new Set(['Li', 'Be', 'Na', 'Mg', 'Al', 'K', 'Ca', 'Rb', 'Cs'])
const gDEN: Generator = {
  id: 'delta-en', title: 'ΔEN → bond type', lecture: 'L8', topic: 'Electronegativity & polarity', kind: 'mcq',
  make() {
    const els = Object.keys(FALLBACK)
    let a = '', b = '', d = 0
    for (let i = 0; i < 80; i++) {
      a = pick(els); b = pick(els)
      if (a === b || (METALS.has(a) && METALS.has(b))) continue // metal–metal pairs do not form a polar/ionic bond
      d = Math.abs(propVal(a, 'en') - propVal(b, 'en'))
      if (Math.abs(d - 0.5) < 0.12 || Math.abs(d - 1.7) < 0.12) continue
      if (Math.random() < 0.3 && d >= 0.5) continue // bias towards some nonpolar cases
      break
    }
    const [lo, hi] = propVal(a, 'en') <= propVal(b, 'en') ? [a, b] : [b, a]
    const kind = d < 0.5 ? 0 : d < 1.7 ? 1 : 2
    const opts = ['Nonpolar covalent (almost purely covalent)', 'Polar covalent', 'Mostly ionic']
    const dstr = d.toFixed(2)
    return mcq(base(gDEN, 'L8', `Using the slides' electronegativity values (L8 s33): ${a} = ${propVal(a, 'en')}, ${b} = ${propVal(b, 'en')}. Classify the **${a}–${b}** bond.`,
      `$\\Delta\\text{EN} = |${propVal(hi, 'en')} - ${propVal(lo, 'en')}| = ${dstr}$.\n\nGuide (slides): $\\Delta\\text{EN}<0.5$ nonpolar covalent; $0.5<\\Delta\\text{EN}<1.7$ polar covalent; $>1.7$ mostly ionic.\n\n→ **${opts[kind]}**${kind === 1 ? `, with ${hi} the partial negative end ($\\delta^-$) and ${lo} the partial positive end ($\\delta^+$)` : ''}.`, 1),
      opts, [kind])
  },
}

/* ---------- 13. lattice energy ---------- */
const CAT: Record<string, [number, number]> = { Li: [1, 76], Na: [1, 102], K: [1, 138], Rb: [1, 152], Cs: [1, 167], Mg: [2, 72], Ca: [2, 100], Sr: [2, 118], Ba: [2, 135] }
const AN: Record<string, [number, number]> = { F: [1, 133], Cl: [1, 181], Br: [1, 196], I: [1, 220], O: [2, 140], S: [2, 184] }
const gLattice: Generator = {
  id: 'lattice-rank', title: 'Lattice energy: charge & size', lecture: 'L8', topic: 'Lattice energy', kind: 'mcq',
  make() {
    const salts: { f: string; q: number; d: number; c: string; a: string }[] = []
    for (const [c1, [q1, r1]] of Object.entries(CAT)) for (const [a1, [q2, r2]] of Object.entries(AN)) if (q1 === q2 || false) salts.push({ f: c1 + a1, q: q1 * q2, d: r1 + r2, c: c1, a: a1 })
    // mix in a few cross-charge pairs: 2+/1- salts represented via formula
    const cross: [string, string, string][] = [['Mg', 'Cl', 'MgCl2'], ['Ca', 'F', 'CaF2'], ['Ba', 'Br', 'BaBr2']]
    void cross
    let pickSet = sample(salts, 4), want = Math.random() < 0.7 ? 'largest' : 'smallest'
    for (let i = 0; i < 80; i++) {
      pickSet = sample(salts, 4)
      const vs = pickSet.map((s) => s.q / s.d).sort((a, b) => b - a)
      const ok = want === 'largest' ? (vs[0] - vs[1]) / vs[0] > 0.1 : (vs[2] - vs[3]) / vs[2] > 0.1
      if (ok && new Set(pickSet.map((s) => s.q)).size > 1) break
    }
    const vals = pickSet.map((s) => s.q / s.d)
    const best = want === 'largest' ? vals.indexOf(Math.max(...vals)) : vals.indexOf(Math.min(...vals))
    const rows = pickSet.map((s) => `| $${mf(s.f)}$ | ${s.q === 1 ? '1×1' : s.q === 4 ? '2×2' : s.q} | ${s.d} pm | ${(s.q / s.d * 100).toFixed(2)} |`).join('\n')
    return mcq(base(gLattice, 'L8', `Which compound has the **${want}** lattice energy (magnitude)?`,
      `Lattice energy $\\propto \\dfrac{q^+ q^-}{d}$, where $d=r_+ + r_-$. **Higher charges** matter most; at equal charge, **smaller ions** (shorter $d$) give larger lattice energy.\n\n| Salt | $q^+q^-$ | $d$ | $q^+q^-/d$ (×100) |\n|---|---|---|---|\n${rows}\n\n→ **$${mf(pickSet[best].f)}$**. (Ionic radii are typical textbook values.)`, 2),
      pickSet.map((s) => T(mf(s.f))), [best])
  },
}

/* ---------- 14. valence electrons ---------- */
const SPECIES_V = ['SO4^2-', 'NO3^-', 'CO2', 'NH4^+', 'PCl5', 'H2O', 'O3', 'ClO3^-', 'CO3^2-', 'XeF4', 'SF6', 'BF3', 'PO4^3-', 'NO2^-', 'ClO4^-', 'CN^-', 'HCN', 'SO2', 'H3O^+', 'BrF3', 'ICl4^-', 'C2H4', 'HCOO^-', 'SO3^2-', 'NH2^-', 'N2', 'CH2O', 'XeF2', 'SiF4', 'IF5']
function parseF(f: string): { atoms: [string, number][]; q: number } {
  const [b, ch] = f.split('^')
  const atoms: [string, number][] = []
  for (const m of b.matchAll(/([A-Z][a-z]?)(\d*)/g)) atoms.push([m[1], m[2] ? Number(m[2]) : 1])
  let q = 0
  if (ch) { const n = ch.length > 1 ? Number(ch.slice(0, -1)) : 1; q = ch.endsWith('+') ? n : -n }
  return { atoms, q }
}
const gValence: Generator = {
  id: 'valence-e', title: 'Total valence electrons', lecture: 'L9', topic: 'Lewis structures', kind: 'numeric',
  make() {
    const f = pick(SPECIES_V)
    const { atoms, q } = parseF(f)
    const neutral = atoms.reduce((s, [a, n]) => s + n * (el(a)!.valence ?? 0), 0)
    const total = neutral - q
    const parts = atoms.map(([a, n]) => `${n}×${el(a)!.valence}`).join(' + ')
    const adj = q === 0 ? '' : q < 0 ? `\n\nThe ${-q}− charge **adds** ${-q} electron${-q > 1 ? 's' : ''}: $${neutral} + ${-q} = ${total}$.` : `\n\nThe ${q}+ charge **removes** ${q} electron${q > 1 ? 's' : ''}: $${neutral} - ${q} = ${total}$.`
    const b = base(gValence, 'L9', `How many **valence electrons** must be shown in the Lewis structure of ${M(f)}?`, `Group number = valence electrons: ${parts} $= ${neutral}$.${adj}\n\nTotal $=${total}$ (${total / 2} pairs${total % 2 ? ', odd-electron species' : ''}).`, 1)
    return { ...b, kind: 'numeric', answer: total, tol: { abs: 0.01 }, steps: q === 0 ? undefined : [{ prompt: 'Valence electrons of the neutral atoms (ignore the charge)', answer: neutral, tol: { abs: 0.01 } }] }
  },
}

/* ---------- 15. formal charge ---------- */
const FC_LIST: { a: string; f: string; d: string; bonds: number; lp: number }[] = [
  { a: 'S', f: 'SO4^2-', d: 'the S atom in the structure with four single S–O bonds', bonds: 4, lp: 0 },
  { a: 'S', f: 'SO4^2-', d: 'the S atom in the structure with two S=O double bonds and two S–O single bonds', bonds: 6, lp: 0 },
  { a: 'O', f: 'SO4^2-', d: 'a terminal O atom with one single bond to S', bonds: 1, lp: 3 },
  { a: 'O', f: 'SO4^2-', d: 'a terminal O atom with a double bond to S', bonds: 2, lp: 2 },
  { a: 'N', f: 'NO3^-', d: 'the N atom (one N=O and two N–O bonds, no lone pairs)', bonds: 4, lp: 0 },
  { a: 'O', f: 'NO3^-', d: 'a single-bonded O atom', bonds: 1, lp: 3 },
  { a: 'O', f: 'NO3^-', d: 'the double-bonded O atom', bonds: 2, lp: 2 },
  { a: 'C', f: 'CO', d: 'the C atom in :C≡O: (triple bond, one lone pair)', bonds: 3, lp: 1 },
  { a: 'O', f: 'CO', d: 'the O atom in :C≡O: (triple bond, one lone pair)', bonds: 3, lp: 1 },
  { a: 'N', f: 'NH4^+', d: 'the N atom (four single N–H bonds)', bonds: 4, lp: 0 },
  { a: 'O', f: 'H3O^+', d: 'the O atom (three O–H bonds, one lone pair)', bonds: 3, lp: 1 },
  { a: 'B', f: 'BF4^-', d: 'the B atom (four single B–F bonds)', bonds: 4, lp: 0 },
  { a: 'N', f: 'NH2^-', d: 'the N atom (two N–H bonds, two lone pairs)', bonds: 2, lp: 2 },
  { a: 'C', f: 'CN^-', d: 'the C atom ([:C≡N:]⁻: triple bond, one lone pair)', bonds: 3, lp: 1 },
  { a: 'Cl', f: 'ClO4^-', d: 'the Cl atom with four single Cl–O bonds', bonds: 4, lp: 0 },
  { a: 'Cl', f: 'ClO4^-', d: 'the Cl atom with three Cl=O double bonds and one Cl–O single bond', bonds: 7, lp: 0 },
  { a: 'P', f: 'PO4^3-', d: 'the P atom with four single P–O bonds', bonds: 4, lp: 0 },
  { a: 'P', f: 'PO4^3-', d: 'the P atom with one P=O double bond and three P–O single bonds', bonds: 5, lp: 0 },
  { a: 'Xe', f: 'XeF4', d: 'the Xe atom (four Xe–F bonds, two lone pairs)', bonds: 4, lp: 2 },
  { a: 'I', f: 'ICl4^-', d: 'the I atom (four I–Cl bonds, two lone pairs)', bonds: 4, lp: 2 },
  { a: 'O', f: 'O3', d: 'the central O atom (one O=O and one O–O bond, one lone pair)', bonds: 3, lp: 1 },
  { a: 'O', f: 'O3', d: 'the terminal O atom with a single bond (three lone pairs)', bonds: 1, lp: 3 },
  { a: 'S', f: 'SO2', d: 'the S atom (two S=O double bonds, one lone pair)', bonds: 4, lp: 1 },
]
const FV: Record<string, number> = { Xe: 8, I: 7 }
const gFormal: Generator = {
  id: 'formal-charge', title: 'Formal charge', lecture: 'L9', topic: 'Formal charge', kind: 'numeric',
  make() {
    const s = pick(FC_LIST)
    const val = FV[s.a] ?? el(s.a)!.valence!
    const fc = val - (s.bonds + 2 * s.lp)
    return {
      ...base(gFormal, 'L9', `In a Lewis structure of ${M(s.f)}, consider ${s.d}. It has **${s.bonds}** bonds (shared pairs counted as lines) and **${s.lp}** lone pair${s.lp === 1 ? '' : 's'}. What is its formal charge?`,
        `$FC = \\text{valence e}^- - \\left[\\text{bonds} + \\text{unshared e}^-\\right]$ (equivalently $-\\tfrac12$ bonding e⁻ $-$ lone-pair e⁻).\n\n$FC = ${val} - (${s.bonds} + ${2 * s.lp}) = ${fc >= 0 ? '+' : ''}${fc}$.`, 2),
      kind: 'numeric', answer: fc, tol: { abs: 0.01 },
      steps: [{ prompt: `Valence electrons of a free ${s.a} atom`, answer: val, tol: { abs: 0.01 } }, { prompt: 'Bonds + unshared electrons (2 per lone pair)', answer: s.bonds + 2 * s.lp, tol: { abs: 0.01 } }],
    }
  },
}

/* ---------- 16. VSEPR ---------- */
const EG = ['', '', 'linear', 'trigonal planar', 'tetrahedral', 'trigonal bipyramidal', 'octahedral']
const VSEPR: Record<string, { shape: string; ex: string[]; note: string }> = {
  '2,0': { shape: 'linear', ex: ['CO2', 'BeCl2'], note: '' },
  '3,0': { shape: 'trigonal planar', ex: ['BF3', 'SO3'], note: '' },
  '2,1': { shape: 'bent', ex: ['SO2', 'O3'], note: 'one lone pair pushes the bond angle below 120°' },
  '4,0': { shape: 'tetrahedral', ex: ['CH4', 'SiF4'], note: '' },
  '3,1': { shape: 'trigonal pyramidal', ex: ['NH3', 'PCl3'], note: '' },
  '2,2': { shape: 'bent', ex: ['H2O', 'OF2'], note: 'two lone pairs squeeze the angle below 109.5°' },
  '5,0': { shape: 'trigonal bipyramidal', ex: ['PCl5'], note: '' },
  '4,1': { shape: 'seesaw', ex: ['SF4'], note: 'the lone pair sits in an equatorial position (fewer 90° repulsions)' },
  '3,2': { shape: 'T-shaped', ex: ['ClF3', 'BrF3'], note: 'both lone pairs are equatorial' },
  '2,3': { shape: 'linear', ex: ['XeF2', 'I3^-'], note: 'all three lone pairs are equatorial, so the two bonded atoms are axial: 180°' },
  '6,0': { shape: 'octahedral', ex: ['SF6'], note: '' },
  '5,1': { shape: 'square pyramidal', ex: ['BrF5', 'IF5'], note: '' },
  '4,2': { shape: 'square planar', ex: ['XeF4', 'ICl4^-'], note: 'the two lone pairs sit on opposite (axial) sides' },
}
const ALL_SHAPES = ['linear', 'bent', 'trigonal planar', 'trigonal pyramidal', 'tetrahedral', 'seesaw', 'T-shaped', 'trigonal bipyramidal', 'square planar', 'square pyramidal', 'octahedral']
const gVSEPR: Generator = {
  id: 'vsepr-shape', title: 'VSEPR shape from AXₘEₙ', lecture: 'L10', topic: 'VSEPR shapes', kind: 'mcq',
  make() {
    const key = pick(Object.keys(VSEPR)); const [m, n] = key.split(',').map(Number)
    const v = VSEPR[key]; const dom = m + n
    const useEx = Math.random() < 0.5
    const ex = pick(v.ex)
    const label = `$\\mathrm{AX_{${m}}E_{${n}}}$`
    const explain = `${label}: ${m} bonded atoms + ${n} lone pair${n === 1 ? '' : 's'} = **${dom} electron domains** → electron-domain geometry **${EG[dom]}**. Ignoring lone pairs, the atoms form a **${v.shape}** arrangement${v.note ? `; ${v.note}` : ''}.`
    if (Math.random() < 0.3) {
      const opts = EG.slice(2)
      return mcq(base(gVSEPR, 'L10', `A molecule is ${label}${useEx ? ` (e.g. ${M(ex)})` : ''}. What is its **electron-domain geometry**?`, explain, 1), opts, [dom - 2])
    }
    const wrong = sample(ALL_SHAPES.filter((s) => s !== v.shape), 4)
    return mcqShuffled(base(gVSEPR, 'L10', `A molecule is ${label}${useEx ? ` (e.g. ${M(ex)})` : ''}. What is its **molecular geometry**?`, explain, 2), v.shape, wrong)
  },
}

/* ---------- 17. hybridization ---------- */
const HY: { f: string; c: string; m: number; n: number }[] = [
  { f: 'CO2', c: 'C', m: 2, n: 0 }, { f: 'BeCl2', c: 'Be', m: 2, n: 0 }, { f: 'BF3', c: 'B', m: 3, n: 0 }, { f: 'SO2', c: 'S', m: 2, n: 1 },
  { f: 'NO3^-', c: 'N', m: 3, n: 0 }, { f: 'O3', c: 'central O', m: 2, n: 1 }, { f: 'CH4', c: 'C', m: 4, n: 0 }, { f: 'NH3', c: 'N', m: 3, n: 1 },
  { f: 'H2O', c: 'O', m: 2, n: 2 }, { f: 'NH4^+', c: 'N', m: 4, n: 0 }, { f: 'PCl5', c: 'P', m: 5, n: 0 }, { f: 'SF4', c: 'S', m: 4, n: 1 },
  { f: 'ClF3', c: 'Cl', m: 3, n: 2 }, { f: 'XeF2', c: 'Xe', m: 2, n: 3 }, { f: 'SF6', c: 'S', m: 6, n: 0 }, { f: 'XeF4', c: 'Xe', m: 4, n: 2 },
  { f: 'BrF5', c: 'Br', m: 5, n: 1 }, { f: 'ICl4^-', c: 'I', m: 4, n: 2 }, { f: 'SO4^2-', c: 'S', m: 4, n: 0 }, { f: 'PF6^-', c: 'P', m: 6, n: 0 }, { f: 'ClO3^-', c: 'Cl', m: 3, n: 1 },
]
const HYB = ['sp', 'sp^2', 'sp^3', 'sp^3d', 'sp^3d^2']
const gHybrid: Generator = {
  id: 'hybridization', title: 'Hybridization from domain count', lecture: 'L10', topic: 'Hybridization', kind: 'mcq',
  make() {
    const s = pick(HY); const dom = s.m + s.n
    const k = dom - 2
    return mcq(base(gHybrid, 'L10', `What is the hybridization of the central atom (${s.c}) in ${M(s.f)}?`,
      `Count electron domains (bonded atoms + lone pairs) on ${s.c}: ${s.m} + ${s.n} $= ${dom}$.\n\n| domains | 2 | 3 | 4 | 5 | 6 |\n|---|---|---|---|---|---|\n| hybridization | sp | sp² | sp³ | sp³d | sp³d² |\n\n→ **${['sp', 'sp²', 'sp³', 'sp³d', 'sp³d²'][k]}**. (Multiple bonds count as one domain.)`, 1),
      HYB.map((x) => T(`\\mathrm{${x.replace(/\^(\d?)/g, '^{$1}')}}`).replace('^{}', '')), [k])
  },
}

/* ---------- 18. sigma / pi ---------- */
const SP: { name: string; f: string; s: number; p: number; d: string }[] = [
  { name: 'ethene', f: 'C2H4', s: 5, p: 1, d: 'H₂C=CH₂' }, { name: 'ethyne', f: 'C2H2', s: 3, p: 2, d: 'H–C≡C–H' }, { name: 'carbon dioxide', f: 'CO2', s: 2, p: 2, d: 'O=C=O' },
  { name: 'hydrogen cyanide', f: 'HCN', s: 2, p: 2, d: 'H–C≡N' }, { name: 'nitrogen', f: 'N2', s: 1, p: 2, d: 'N≡N' }, { name: 'methanal', f: 'CH2O', s: 3, p: 1, d: 'H₂C=O' },
  { name: 'ethanal', f: 'CH3CHO', s: 6, p: 1, d: 'CH₃–CH=O' }, { name: 'ethane', f: 'C2H6', s: 7, p: 0, d: 'H₃C–CH₃' }, { name: 'methanoic acid', f: 'HCOOH', s: 4, p: 1, d: 'H–C(=O)–O–H' },
  { name: 'propyne', f: 'C3H4', s: 6, p: 2, d: 'CH₃–C≡CH' }, { name: 'benzene (one Kekulé structure)', f: 'C6H6', s: 12, p: 3, d: 'C₆H₆ ring with alternating C=C' },
  { name: 'buta-1,3-diene', f: 'C4H6', s: 9, p: 2, d: 'CH₂=CH–CH=CH₂' }, { name: 'propenenitrile', f: 'C3H3N', s: 6, p: 3, d: 'CH₂=CH–C≡N' }, { name: 'oxygen', f: 'O2', s: 1, p: 1, d: 'O=O' },
  { name: 'propene', f: 'C3H6', s: 8, p: 1, d: 'CH₂=CH–CH₃' },
]
const gSigmaPi: Generator = {
  id: 'sigma-pi', title: 'Count σ and π bonds', lecture: 'L10', topic: 'Sigma & pi bonds', kind: 'numeric',
  make() {
    const s = pick(SP); const askPi = Math.random() < 0.5
    return {
      ...base(gSigmaPi, 'L10', `How many **${askPi ? 'π' : 'σ'} bonds** are in ${s.name}, ${s.d}?`,
        `A single bond is 1 σ; a double bond is 1 σ + 1 π; a triple bond is 1 σ + 2 π.\n\nFor ${s.d}: **${s.s} σ** and **${s.p} π** (total ${s.s + s.p} bond components).`, 2),
      kind: 'numeric', answer: askPi ? s.p : s.s, tol: { abs: 0.01 },
    }
  },
}

/* ---------- 19/20/21. MO theory ---------- */
interface MO { name: string; cap: number; deg: number; bonding: boolean }
const sig = (s: string, star = false) => `\\sigma${star ? '^*' : ''}_{${s}}`
const pi = (star = false) => `\\pi${star ? '^*' : ''}_{2p}`
const ORD_A: MO[] = [
  { name: sig('2s'), cap: 2, deg: 1, bonding: true }, { name: sig('2s', true), cap: 2, deg: 1, bonding: false },
  { name: pi(), cap: 4, deg: 2, bonding: true }, { name: sig('2p'), cap: 2, deg: 1, bonding: true },
  { name: pi(true), cap: 4, deg: 2, bonding: false }, { name: sig('2p', true), cap: 2, deg: 1, bonding: false },
]
const ORD_B: MO[] = [ORD_A[0], ORD_A[1], ORD_A[3], ORD_A[2], ORD_A[4], ORD_A[5]]
const ORD_H: MO[] = [{ name: sig('1s'), cap: 2, deg: 1, bonding: true }, { name: sig('1s', true), cap: 2, deg: 1, bonding: false }]
interface Diatomic { f: string; v: number; q: number; ord: 'A' | 'B' | 'H' }
const DI: Diatomic[] = [
  { f: 'H2', v: 1, q: 0, ord: 'H' }, { f: 'H2^+', v: 1, q: 1, ord: 'H' }, { f: 'H2^-', v: 1, q: -1, ord: 'H' }, { f: 'He2', v: 2, q: 0, ord: 'H' }, { f: 'He2^+', v: 2, q: 1, ord: 'H' },
  { f: 'Li2', v: 1, q: 0, ord: 'A' }, { f: 'Be2', v: 2, q: 0, ord: 'A' }, { f: 'B2', v: 3, q: 0, ord: 'A' }, { f: 'C2', v: 4, q: 0, ord: 'A' }, { f: 'N2', v: 5, q: 0, ord: 'A' },
  { f: 'C2^2-', v: 4, q: -2, ord: 'A' }, { f: 'N2^+', v: 5, q: 1, ord: 'A' }, { f: 'N2^-', v: 5, q: -1, ord: 'A' }, { f: 'B2^+', v: 3, q: 1, ord: 'A' },
  { f: 'O2', v: 6, q: 0, ord: 'B' }, { f: 'O2^+', v: 6, q: 1, ord: 'B' }, { f: 'O2^-', v: 6, q: -1, ord: 'B' }, { f: 'O2^2-', v: 6, q: -2, ord: 'B' },
  { f: 'F2', v: 7, q: 0, ord: 'B' }, { f: 'F2^+', v: 7, q: 1, ord: 'B' }, { f: 'Ne2', v: 8, q: 0, ord: 'B' },
]
function moFill(d: Diatomic) {
  const ne = 2 * d.v - d.q
  const order = d.ord === 'A' ? ORD_A : d.ord === 'B' ? ORD_B : ORD_H
  let left = ne, nb = 0, na = 0, unpaired = 0
  const parts: string[] = []
  for (const o of order) {
    const k = Math.min(left, o.cap); left -= k
    if (k === 0) continue
    parts.push(`(${o.name})^{${k}}`)
    if (o.bonding) nb += k; else na += k
    unpaired += k <= o.deg ? k : 2 * o.deg - k
  }
  return { ne, nb, na, bo: (nb - na) / 2, unpaired, config: parts.join('\\,'), ordName: d.ord }
}
const ordNote = (d: Diatomic) => d.ord === 'A' ? 'For Li₂–N₂ the π$_{2p}$ orbitals lie **below** σ$_{2p}$ (s–p mixing).' : d.ord === 'B' ? 'For O₂–Ne₂ there is little s–p mixing, so σ$_{2p}$ lies **below** π$_{2p}$.' : 'Only the 1s-derived orbitals are involved.'
const gMOBO: Generator = {
  id: 'mo-bond-order', title: 'MO bond order', lecture: 'L10', topic: 'MO theory', kind: 'numeric',
  make() {
    const d = pick(DI); const r = moFill(d)
    return {
      ...base(gMOBO, 'L10', `Use MO theory to find the **bond order** of ${M(d.f)}.`,
        `Valence electrons: $${2 * d.v} ${d.q < 0 ? '+' : '-'} ${Math.abs(d.q)}$ (charge) $= ${r.ne}$.\n\n${ordNote(d)} Fill in order (Hund's rule for degenerate pairs):\n\n$$${r.config}$$\n\nBonding electrons $=${r.nb}$, antibonding $=${r.na}$.\n\n$$\\text{BO} = \\tfrac12(${r.nb} - ${r.na}) = ${r.bo}$$`, 2),
      kind: 'numeric', answer: r.bo, tol: { abs: 0.01 },
      steps: [{ prompt: 'Number of valence electrons to place', answer: r.ne, tol: { abs: 0.01 } }, { prompt: 'Bonding minus antibonding electrons', answer: r.nb - r.na, tol: { abs: 0.01 } }],
    }
  },
}
const gMOMag: Generator = {
  id: 'mo-magnetism', title: 'MO magnetism', lecture: 'L10', topic: 'MO theory', kind: 'mcq',
  make() {
    const d = pick(DI); const r = moFill(d)
    const opts = ['Diamagnetic (no unpaired electrons)', 'Paramagnetic, 1 unpaired electron', 'Paramagnetic, 2 unpaired electrons', 'Paramagnetic, 3 unpaired electrons']
    return mcq(base(gMOMag, 'L10', `According to MO theory, what are the magnetic properties of ${M(d.f)}?`,
      `${r.ne} valence electrons. ${ordNote(d)}\n\n$$${r.config}$$\n\nDegenerate π / π* sets fill singly first (Hund), so unpaired electrons $=${r.unpaired}$ → **${r.unpaired ? 'paramagnetic' : 'diamagnetic'}**. Bond order $=${r.bo}$.`, 2),
      opts, [Math.min(3, r.unpaired)])
  },
}
const gMOCmp: Generator = {
  id: 'mo-compare', title: 'MO: compare bond order / length', lecture: 'L10', topic: 'MO theory', kind: 'mcq',
  make() {
    // Bond order is comparable across any species, but LENGTH / STRENGTH only follow bond order when the same two atoms
    // are bonded (H2 is shorter than N2 despite BO 1 vs 3), so those modes use the O2 / O2+ / O2- / O2(2-) family.
    const mode = pick(['highest bond order', 'shortest bond', 'weakest bond'] as const)
    let set: Diatomic[] = []
    if (mode === 'highest bond order') {
      for (let i = 0; i < 80; i++) {
        set = sample(DI.filter((d) => moFill(d).bo > 0), 4)
        if (new Set(set.map((d) => moFill(d).bo)).size === 4) break
      }
    } else {
      set = shuffle(DI.filter((d) => d.f.startsWith('O2')))
    }
    const bos = set.map((d) => moFill(d).bo)
    const idx = mode === 'weakest bond' ? bos.indexOf(Math.min(...bos)) : bos.indexOf(Math.max(...bos))
    const extra = mode === 'highest bond order' ? '' : ' (all are O–O bonds, so bond order alone decides)'
    return mcq(base(gMOCmp, 'L10', `Which of these species has the **${mode}**?${extra}`,
      `Higher bond order → stronger, shorter bond (for the same two atoms).\n\n${set.map((d) => `- ${M(d.f)}: ${moFill(d).ne} valence e⁻, BO $=${moFill(d).bo}$`).join('\n')}`, 3),
      set.map((d) => M(d.f)), [idx])
  },
}

export const GENERATORS: Generator[] = [
  gWave, gPhoton, gBohr, gSeries, gPhoto, gQN, gCounts, gConfig, gUnpaired, gTrend, gIso, gDEN, gLattice, gValence, gFormal, gVSEPR, gHybrid, gSigmaPi, gMOBO, gMOMag, gMOCmp,
]
export const GEN_BY_ID = new Map(GENERATORS.map((g) => [g.id, g]))
export function generate(id?: string): Question {
  return (id ? GEN_BY_ID.get(id)! : pick(GENERATORS)).make()
}
/** Which generator produced a drill/mock question id ("gen:<gen>:<uid>"). */
export function genOf(qid: string): string | undefined { return qid.startsWith('gen:') ? qid.split(':')[1] : undefined }
