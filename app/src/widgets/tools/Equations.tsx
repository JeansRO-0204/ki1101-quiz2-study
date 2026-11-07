import { useMemo, useState } from 'react'
import { CONST, Tex, parseNum, sci, useLocalState } from '../../lib/kit'
import type { WidgetProps } from '../../types'
import './tools.css'

/* ---------- model ---------- */
interface Unit { u: string; f: number; x: string }
interface V { k: string; tex: string; name: string; units: Unit[]; si: string; def?: number; int?: boolean }
type Rec = Record<string, number>
interface Solver { sym: string; sub: string; fn: (v: Rec) => number }
type Extra = { tex: string } | { note: string }
interface F {
  id: string; group: string; name: string; tex: string; note?: string; vars: V[]
  solve: Record<string, Solver>
  extras?: (v: Rec, target: string) => Extra[]
  check?: (v: Rec, target: string) => string | null
}

const U = (u: string, f: number, x?: string): Unit => ({ u, f, x: x ?? `\\mathrm{${u}}` })
const LEN = [U('nm', 1e-9), U('Å', 1e-10, '\\text{\\AA}'), U('pm', 1e-12), U('µm', 1e-6, '\\mu\\mathrm{m}'), U('m', 1)]
const FREQ = [U('Hz', 1), U('s⁻¹', 1, '\\mathrm{s^{-1}}'), U('THz', 1e12), U('MHz', 1e6)]
const EPH = [U('J', 1), U('eV', CONST.e), U('aJ', 1e-18)]
const EMOL = [U('kJ/mol', 1e3, '\\mathrm{kJ\\,mol^{-1}}'), U('J/mol', 1, '\\mathrm{J\\,mol^{-1}}')]
const VEL = [U('m/s', 1, '\\mathrm{m\\,s^{-1}}'), U('km/s', 1e3, '\\mathrm{km\\,s^{-1}}')]
const NONE = [U('', 1, '')]

const H: V = { k: 'h', tex: 'h', name: 'Planck constant', units: [U('J·s', 1, '\\mathrm{J\\,s}')], si: '\\mathrm{J\\,s}', def: CONST.h }
const C: V = { k: 'c', tex: 'c', name: 'speed of light', units: VEL, si: '\\mathrm{m\\,s^{-1}}', def: CONST.c }
const NA: V = { k: 'NA', tex: 'N_A', name: 'Avogadro constant', units: [U('mol⁻¹', 1, '\\mathrm{mol^{-1}}')], si: '\\mathrm{mol^{-1}}', def: CONST.NA }
const LAM: V = { k: 'lam', tex: '\\lambda', name: 'wavelength', units: LEN, si: '\\mathrm{m}' }
const NU: V = { k: 'nu', tex: '\\nu', name: 'frequency', units: FREQ, si: '\\mathrm{s^{-1}}' }
const N = (k: string, tex: string, name: string): V => ({ k, tex, name, units: NONE, si: '', int: true })
const X = (k: string, tex: string, name: string): V => ({ k, tex, name, units: NONE, si: '' })

const SERIES: Record<number, string> = { 1: 'Lyman (UV)', 2: 'Balmer (visible)', 3: 'Paschen (IR)', 4: 'Brackett (IR)', 5: 'Pfund (IR)' }
const photon = (dE: number): Extra[] => {
  const E = Math.abs(dE)
  return [{ tex: `\\lambda_{\\text{photon}} = \\dfrac{hc}{|\\Delta E|} = ${tn(CONST.h * CONST.c / E * 1e9)}\\ \\mathrm{nm}` },
    { tex: `\\nu_{\\text{photon}} = \\dfrac{|\\Delta E|}{h} = ${tn(E / CONST.h)}\\ \\mathrm{s^{-1}}` }]
}

const FORMULAS: F[] = [
  { id: 'clv', group: 'Light & photons', name: 'Wave relation  c = λν', tex: 'c = \\lambda\\nu', vars: [C, LAM, NU],
    solve: {
      c: { sym: 'c=\\lambda\\nu', sub: 'c=<lam>\\times<nu>', fn: (v) => v.lam * v.nu },
      lam: { sym: '\\lambda=\\dfrac{c}{\\nu}', sub: '\\lambda=\\dfrac{<c>}{<nu>}', fn: (v) => v.c / v.nu },
      nu: { sym: '\\nu=\\dfrac{c}{\\lambda}', sub: '\\nu=\\dfrac{<c>}{<lam>}', fn: (v) => v.c / v.lam },
    } },
  { id: 'ehv', group: 'Light & photons', name: 'Photon energy  E = hν', tex: 'E = h\\nu', vars: [{ k: 'E', tex: 'E', name: 'photon energy', units: EPH, si: '\\mathrm{J}' }, H, NU],
    solve: {
      E: { sym: 'E=h\\nu', sub: 'E=<h>\\times<nu>', fn: (v) => v.h * v.nu },
      nu: { sym: '\\nu=\\dfrac{E}{h}', sub: '\\nu=\\dfrac{<E>}{<h>}', fn: (v) => v.E / v.h },
      h: { sym: 'h=\\dfrac{E}{\\nu}', sub: 'h=\\dfrac{<E>}{<nu>}', fn: (v) => v.E / v.nu },
    } },
  { id: 'ehcl', group: 'Light & photons', name: 'Photon energy  E = hc/λ', tex: 'E = \\dfrac{hc}{\\lambda}', vars: [{ k: 'E', tex: 'E', name: 'photon energy', units: EPH, si: '\\mathrm{J}' }, H, C, LAM],
    solve: {
      E: { sym: 'E=\\dfrac{hc}{\\lambda}', sub: 'E=\\dfrac{<h>\\times<c>}{<lam>}', fn: (v) => v.h * v.c / v.lam },
      lam: { sym: '\\lambda=\\dfrac{hc}{E}', sub: '\\lambda=\\dfrac{<h>\\times<c>}{<E>}', fn: (v) => v.h * v.c / v.E },
    } },
  { id: 'emol', group: 'Light & photons', name: 'Energy per mole  E = N_A·hν', tex: 'E_{\\text{mol}} = N_A\\,h\\nu', note: 'Energy of one mole of photons.',
    vars: [{ k: 'Em', tex: 'E_{\\text{mol}}', name: 'energy per mole', units: EMOL, si: '\\mathrm{J\\,mol^{-1}}' }, NA, H, NU],
    solve: {
      Em: { sym: 'E_{\\text{mol}}=N_A h\\nu', sub: 'E_{\\text{mol}}=<NA>\\times<h>\\times<nu>', fn: (v) => v.NA * v.h * v.nu },
      nu: { sym: '\\nu=\\dfrac{E_{\\text{mol}}}{N_A h}', sub: '\\nu=\\dfrac{<Em>}{<NA>\\times<h>}', fn: (v) => v.Em / (v.NA * v.h) },
    } },
  { id: 'emol2', group: 'Light & photons', name: 'Energy per mole  E = N_A·hc/λ', tex: 'E_{\\text{mol}} = \\dfrac{N_A\\,hc}{\\lambda}',
    vars: [{ k: 'Em', tex: 'E_{\\text{mol}}', name: 'energy per mole', units: EMOL, si: '\\mathrm{J\\,mol^{-1}}' }, NA, H, C, LAM],
    solve: {
      Em: { sym: 'E_{\\text{mol}}=\\dfrac{N_A hc}{\\lambda}', sub: 'E_{\\text{mol}}=\\dfrac{<NA>\\times<h>\\times<c>}{<lam>}', fn: (v) => v.NA * v.h * v.c / v.lam },
      lam: { sym: '\\lambda=\\dfrac{N_A hc}{E_{\\text{mol}}}', sub: '\\lambda=\\dfrac{<NA>\\times<h>\\times<c>}{<Em>}', fn: (v) => v.NA * v.h * v.c / v.Em },
    } },
  { id: 'pe', group: 'Light & photons', name: 'Photoelectric  KE = hν − Φ', tex: '\\mathrm{KE}_{\\max} = h\\nu - \\Phi', note: 'Φ is the work function (binding energy) of the metal.',
    vars: [{ k: 'KE', tex: '\\mathrm{KE}_{\\max}', name: 'max kinetic energy', units: EPH, si: '\\mathrm{J}' }, H, NU, { k: 'Phi', tex: '\\Phi', name: 'work function', units: EPH, si: '\\mathrm{J}' }],
    solve: {
      KE: { sym: '\\mathrm{KE}=h\\nu-\\Phi', sub: '\\mathrm{KE}=<h>\\times<nu>-<Phi>', fn: (v) => v.h * v.nu - v.Phi },
      nu: { sym: '\\nu=\\dfrac{\\mathrm{KE}+\\Phi}{h}', sub: '\\nu=\\dfrac{<KE>+<Phi>}{<h>}', fn: (v) => (v.KE + v.Phi) / v.h },
      Phi: { sym: '\\Phi=h\\nu-\\mathrm{KE}', sub: '\\Phi=<h>\\times<nu>-<KE>', fn: (v) => v.h * v.nu - v.KE },
    },
    check: (v, t) => (t === 'KE' && v.KE < 0 ? 'KE < 0: hν is smaller than Φ, so no electrons are ejected (below the threshold frequency).' : null),
    extras: (v, t) => (v.Phi > 0 && t !== 'nu' ? [{ tex: `\\nu_0 = \\dfrac{\\Phi}{h} = ${tn(v.Phi / v.h)}\\ \\mathrm{s^{-1}}\\quad(\\lambda_0 = ${tn(v.h * CONST.c / v.Phi * 1e9)}\\ \\mathrm{nm})` }] : []) },
  { id: 'ryd', group: 'Hydrogen atom', name: 'Rydberg  1/λ = R_H(1/n₁² − 1/n₂²)', tex: '\\dfrac{1}{\\lambda} = R_H\\left(\\dfrac{1}{n_1^2}-\\dfrac{1}{n_2^2}\\right)', note: 'Use n₂ > n₁ for a positive wavelength (n₂ → n₁ emission).',
    vars: [LAM, { k: 'RH', tex: 'R_H', name: 'Rydberg constant', units: [U('m⁻¹', 1, '\\mathrm{m^{-1}}'), U('cm⁻¹', 100, '\\mathrm{cm^{-1}}')], si: '\\mathrm{m^{-1}}', def: CONST.RH }, N('n1', 'n_1', 'lower level'), N('n2', 'n_2', 'upper level')],
    solve: {
      lam: { sym: '\\lambda=\\left[R_H\\left(\\dfrac{1}{n_1^2}-\\dfrac{1}{n_2^2}\\right)\\right]^{-1}', sub: '\\lambda=\\left[<RH>\\left(\\dfrac{1}{<n1>^2}-\\dfrac{1}{<n2>^2}\\right)\\right]^{-1}', fn: (v) => 1 / (v.RH * (1 / v.n1 ** 2 - 1 / v.n2 ** 2)) },
      n1: { sym: 'n_1=\\left(\\dfrac{1}{\\lambda R_H}+\\dfrac{1}{n_2^2}\\right)^{-1/2}', sub: 'n_1=\\left(\\dfrac{1}{<lam>\\times<RH>}+\\dfrac{1}{<n2>^2}\\right)^{-1/2}', fn: (v) => (1 / (v.lam * v.RH) + 1 / v.n2 ** 2) ** -0.5 },
      n2: { sym: 'n_2=\\left(\\dfrac{1}{n_1^2}-\\dfrac{1}{\\lambda R_H}\\right)^{-1/2}', sub: 'n_2=\\left(\\dfrac{1}{<n1>^2}-\\dfrac{1}{<lam>\\times<RH>}\\right)^{-1/2}', fn: (v) => (1 / v.n1 ** 2 - 1 / (v.lam * v.RH)) ** -0.5 },
    },
    check: (v, t) => (t === 'lam' && v.lam < 0 ? 'λ < 0: you need n₂ > n₁ in this form of the equation.' : null),
    extras: (v) => (Number.isInteger(v.n1) && SERIES[v.n1] ? [{ note: `Series ending on n = ${v.n1}: ${SERIES[v.n1]}.` }] : []) },
  { id: 'bohr', group: 'Hydrogen atom', name: 'Bohr level  Eₙ = −2.18×10⁻¹⁸ J / n²', tex: 'E_n = -\\dfrac{R_E}{n^2}', note: 'R_E = 2.18×10⁻¹⁸ J (= 13.6 eV). Energy is zero at n = ∞.',
    vars: [{ k: 'En', tex: 'E_n', name: 'energy of level n', units: EPH, si: '\\mathrm{J}' }, { k: 'RE', tex: 'R_E', name: 'Bohr energy constant', units: EPH, si: '\\mathrm{J}', def: CONST.RE }, N('n', 'n', 'principal quantum number')],
    solve: {
      En: { sym: 'E_n=-\\dfrac{R_E}{n^2}', sub: 'E_n=-\\dfrac{<RE>}{<n>^2}', fn: (v) => -v.RE / v.n ** 2 },
      n: { sym: 'n=\\sqrt{-\\dfrac{R_E}{E_n}}', sub: 'n=\\sqrt{-\\dfrac{<RE>}{<En>}}', fn: (v) => Math.sqrt(-v.RE / v.En) },
    }, check: (v, t) => (t === 'n' && v.En >= 0 ? 'Bound levels have E_n < 0.' : null) },
  { id: 'dE', group: 'Hydrogen atom', name: 'Transition  ΔE = R_E(1/nᵢ² − 1/n_f²)', tex: '\\Delta E = E_f - E_i = R_E\\left(\\dfrac{1}{n_i^2}-\\dfrac{1}{n_f^2}\\right)', note: 'ΔE > 0: absorption (n_f > n_i). ΔE < 0: emission.',
    vars: [{ k: 'dE', tex: '\\Delta E', name: 'energy change', units: EPH, si: '\\mathrm{J}' }, { k: 'RE', tex: 'R_E', name: 'Bohr energy constant', units: EPH, si: '\\mathrm{J}', def: CONST.RE }, N('ni', 'n_i', 'initial level'), N('nf', 'n_f', 'final level')],
    solve: {
      dE: { sym: '\\Delta E=R_E\\left(\\dfrac{1}{n_i^2}-\\dfrac{1}{n_f^2}\\right)', sub: '\\Delta E=<RE>\\left(\\dfrac{1}{<ni>^2}-\\dfrac{1}{<nf>^2}\\right)', fn: (v) => v.RE * (1 / v.ni ** 2 - 1 / v.nf ** 2) },
      nf: { sym: 'n_f=\\left(\\dfrac{1}{n_i^2}-\\dfrac{\\Delta E}{R_E}\\right)^{-1/2}', sub: 'n_f=\\left(\\dfrac{1}{<ni>^2}-\\dfrac{<dE>}{<RE>}\\right)^{-1/2}', fn: (v) => (1 / v.ni ** 2 - v.dE / v.RE) ** -0.5 },
      ni: { sym: 'n_i=\\left(\\dfrac{\\Delta E}{R_E}+\\dfrac{1}{n_f^2}\\right)^{-1/2}', sub: 'n_i=\\left(\\dfrac{<dE>}{<RE>}+\\dfrac{1}{<nf>^2}\\right)^{-1/2}', fn: (v) => (v.dE / v.RE + 1 / v.nf ** 2) ** -0.5 },
    },
    extras: (v) => [{ note: v.dE > 0 ? 'ΔE > 0: the atom absorbs a photon (n_i < n_f).' : v.dE < 0 ? 'ΔE < 0: the atom emits a photon (n_i > n_f).' : 'ΔE = 0: no transition.' }, ...(v.dE !== 0 ? photon(v.dE) : [])] },
  { id: 'fc', group: 'Bonding', name: 'Formal charge  FC = V − (L + B/2)', tex: 'FC = V - \\left(L + \\dfrac{B}{2}\\right)', note: 'V = valence e⁻ of the free atom, L = unshared (lone-pair) e⁻, B = bonding e⁻ (2 per bond). Same as V − (bonds + unshared e⁻), the L9 slide form.',
    vars: [X('FC', 'FC', 'formal charge'), X('V', 'V', 'valence electrons'), X('L', 'L', 'lone-pair electrons'), X('B', 'B', 'bonding electrons')],
    solve: {
      FC: { sym: 'FC=V-\\left(L+\\dfrac{B}{2}\\right)', sub: 'FC=<V>-\\left(<L>+\\dfrac{<B>}{2}\\right)', fn: (v) => v.V - (v.L + v.B / 2) },
      V: { sym: 'V=FC+L+\\dfrac{B}{2}', sub: 'V=<FC>+<L>+\\dfrac{<B>}{2}', fn: (v) => v.FC + v.L + v.B / 2 },
      L: { sym: 'L=V-\\dfrac{B}{2}-FC', sub: 'L=<V>-\\dfrac{<B>}{2}-<FC>', fn: (v) => v.V - v.B / 2 - v.FC },
      B: { sym: 'B=2\\,(V-L-FC)', sub: 'B=2\\,(<V>-<L>-<FC>)', fn: (v) => 2 * (v.V - v.L - v.FC) },
    }, check: (v, t) => (t === 'L' && v.L < 0 ? 'Negative electron count: check V, B and FC.' : t === 'B' && v.B < 0 ? 'Negative electron count: check V, L and FC.' : null) },
  { id: 'bol', group: 'Bonding', name: 'Bond order from Lewis structures', tex: 'BO = \\dfrac{\\text{bonds in the structure(s)}}{\\text{equivalent bond positions}}', note: 'e.g. NO₃⁻: N–O has 4 bonds shared over 3 positions, BO = 4/3.',
    vars: [X('BO', 'BO', 'bond order'), X('nb', 'n_{\\text{bonds}}', 'total bonds over the positions'), X('np', 'n_{\\text{pos}}', 'number of equivalent positions')],
    solve: {
      BO: { sym: 'BO=\\dfrac{n_{\\text{bonds}}}{n_{\\text{pos}}}', sub: 'BO=\\dfrac{<nb>}{<np>}', fn: (v) => v.nb / v.np },
      nb: { sym: 'n_{\\text{bonds}}=BO\\times n_{\\text{pos}}', sub: 'n_{\\text{bonds}}=<BO>\\times<np>', fn: (v) => v.BO * v.np },
      np: { sym: 'n_{\\text{pos}}=\\dfrac{n_{\\text{bonds}}}{BO}', sub: 'n_{\\text{pos}}=\\dfrac{<nb>}{<BO>}', fn: (v) => v.nb / v.BO },
    } },
  { id: 'bomo', group: 'Bonding', name: 'Bond order from MOs  BO = ½(b − a)', tex: 'BO = \\tfrac{1}{2}\\,(n_b - n_a)', note: 'n_b = electrons in bonding MOs, n_a = electrons in antibonding MOs. BO = 0 → no stable bond; unpaired electrons → paramagnetic.',
    vars: [X('BO', 'BO', 'bond order'), X('nb', 'n_b', 'bonding electrons'), X('na', 'n_a', 'antibonding electrons')],
    solve: {
      BO: { sym: 'BO=\\tfrac{1}{2}(n_b-n_a)', sub: 'BO=\\tfrac{1}{2}(<nb>-<na>)', fn: (v) => (v.nb - v.na) / 2 },
      nb: { sym: 'n_b=2\\,BO+n_a', sub: 'n_b=2\\times<BO>+<na>', fn: (v) => 2 * v.BO + v.na },
      na: { sym: 'n_a=n_b-2\\,BO', sub: 'n_a=<nb>-2\\times<BO>', fn: (v) => v.nb - 2 * v.BO },
    } },
  { id: 'den', group: 'Bonding', name: 'Bond polarity  ΔEN = |EN_A − EN_B|', tex: '\\Delta\\mathrm{EN} = |\\mathrm{EN}_A - \\mathrm{EN}_B|', note: 'L8 slide thresholds: < 0.5 nonpolar covalent (<5% ionic); 0.5–1.7 polar covalent; > 1.7 mostly ionic (>50%).',
    vars: [X('d', '\\Delta\\mathrm{EN}', 'EN difference'), X('a', '\\mathrm{EN}_A', 'EN of atom A'), X('b', '\\mathrm{EN}_B', 'EN of atom B')],
    solve: {
      d: { sym: '\\Delta\\mathrm{EN}=|\\mathrm{EN}_A-\\mathrm{EN}_B|', sub: '\\Delta\\mathrm{EN}=|<a>-<b>|', fn: (v) => Math.abs(v.a - v.b) },
      a: { sym: '\\mathrm{EN}_A=\\mathrm{EN}_B+\\Delta\\mathrm{EN}\\ \\ (\\text{or } \\mathrm{EN}_B-\\Delta\\mathrm{EN})', sub: '\\mathrm{EN}_A=<b>+<d>', fn: (v) => v.b + v.d },
      b: { sym: '\\mathrm{EN}_B=\\mathrm{EN}_A+\\Delta\\mathrm{EN}\\ \\ (\\text{or } \\mathrm{EN}_A-\\Delta\\mathrm{EN})', sub: '\\mathrm{EN}_B=<a>+<d>', fn: (v) => v.a + v.d },
    },
    extras: (v) => [{ note: v.d < 0.5 ? 'ΔEN < 0.5: nonpolar covalent (almost purely covalent, < 5% ionic).' : v.d <= 1.7 ? 'ΔEN between 0.5 and 1.7: polar covalent.' : 'ΔEN > 1.7: mostly ionic (> 50% ionic character).' }] },
  { id: 'coul', group: 'Bonding', name: 'Coulomb energy  E = k·z₁z₂e²/r', tex: 'E = \\dfrac{k\\,(z_1 e)(z_2 e)}{r}', note: 'Lattice energy scales with q₁q₂/r: larger charges and smaller ions give a more negative E. Use z₁ = +1, z₂ = −1 for an ion pair. (Crystal sums over all neighbours; this is the pair term.)',
    vars: [{ k: 'E', tex: 'E', name: 'energy per ion pair', units: [U('J', 1), U('kJ/mol', 1e3 / CONST.NA, '\\mathrm{kJ\\,mol^{-1}}')], si: '\\mathrm{J}' }, { k: 'k', tex: 'k', name: 'Coulomb constant', units: [U('N·m²/C²', 1, '\\mathrm{N\\,m^2\\,C^{-2}}')], si: '\\mathrm{N\\,m^2\\,C^{-2}}', def: 8.988e9 }, { k: 'e', tex: 'e', name: 'elementary charge', units: [U('C', 1, '\\mathrm{C}')], si: '\\mathrm{C}', def: CONST.e }, X('z1', 'z_1', 'charge of cation'), X('z2', 'z_2', 'charge of anion'), { k: 'r', tex: 'r', name: 'distance between ion centres', units: [U('pm', 1e-12), U('nm', 1e-9), U('Å', 1e-10, '\\text{\\AA}'), U('m', 1)], si: '\\mathrm{m}' }],
    solve: {
      E: { sym: 'E=\\dfrac{k\\,z_1 z_2\\,e^2}{r}', sub: 'E=\\dfrac{<k>\\times<z1>\\times<z2>\\times<e>^2}{<r>}', fn: (v) => v.k * v.z1 * v.z2 * v.e ** 2 / v.r },
      r: { sym: 'r=\\dfrac{k\\,z_1 z_2\\,e^2}{E}', sub: 'r=\\dfrac{<k>\\times<z1>\\times<z2>\\times<e>^2}{<E>}', fn: (v) => v.k * v.z1 * v.z2 * v.e ** 2 / v.E },
    }, check: (v, t) => (t === 'r' && v.r < 0 ? 'r < 0: E and z₁z₂ must have the same sign.' : null) },
]
const F_BY = new Map(FORMULAS.map((f) => [f.id, f]))
const GROUPS = [...new Set(FORMULAS.map((f) => f.group))]

/* ---------- helpers ---------- */
function tn(x: number): string {
  if (!Number.isFinite(x)) return '?'
  if (x === 0) return '0'
  const a = Math.abs(x)
  if (a >= 1e-3 && a < 1e5) return String(Number(x.toPrecision(4)))
  const e = Math.floor(Math.log10(a))
  const m = Number((x / 10 ** e).toPrecision(4))
  return `${m}\\times10^{${e}}`
}
const fmtIn = (x: number) => Number(x.toPrecision(4)).toExponential().replace('e+', 'e')
const plain = (x: number) => (Math.abs(x) >= 1e-3 && Math.abs(x) < 1e5 ? String(Number(x.toPrecision(4))) : Number(x.toPrecision(4)).toExponential().replace('e+', 'e'))

interface Row { t: string; u: number }
type State = Record<string, Record<string, Row>>
interface Hist { id: number; fid: string; text: string; rows: Record<string, Row> }

const CONSTS: { tex: string; name: string; v: number; unit: string }[] = [
  { tex: 'h', name: 'Planck constant', v: CONST.h, unit: 'J·s' },
  { tex: 'c', name: 'speed of light', v: CONST.c, unit: 'm/s' },
  { tex: 'R_H', name: 'Rydberg constant', v: CONST.RH, unit: 'm⁻¹' },
  { tex: 'R_E', name: 'Bohr energy constant (13.6 eV)', v: CONST.RE, unit: 'J' },
  { tex: 'N_A', name: 'Avogadro constant', v: CONST.NA, unit: 'mol⁻¹' },
  { tex: 'e', name: 'elementary charge / 1 eV in J', v: CONST.e, unit: 'C  (1 eV = 1.602e-19 J)' },
  { tex: 'm_e', name: 'electron mass', v: CONST.me, unit: 'kg' },
  { tex: 'k', name: 'Coulomb constant (general knowledge)', v: 8.988e9, unit: 'N·m²/C²' },
  { tex: 'N_A h', name: 'molar Planck constant', v: CONST.NA * CONST.h, unit: 'J·s/mol' },
  { tex: 'hc', name: 'Planck × light speed', v: CONST.h * CONST.c, unit: 'J·m' },
]

export default function Equations({ compact }: WidgetProps) {
  const [fid, setFid] = useLocalState<string>('tools.eq.sel', 'clv')
  const [state, setState] = useLocalState<State>('tools.eq.state', {})
  const [hist, setHist] = useLocalState<Hist[]>('tools.eq.hist', [])
  const [copied, setCopied] = useState<string | null>(null)
  const f = F_BY.get(fid) ?? FORMULAS[0]

  const rowOf = (v: V): Row => state[f.id]?.[v.k] ?? (v.def != null ? { t: fmtIn(v.def / v.units[0].f), u: 0 } : { t: '', u: 0 })
  const setRow = (k: string, r: Row) => setState((s) => ({ ...s, [f.id]: { ...(s[f.id] ?? {}), [k]: r } }))
  const rows = Object.fromEntries(f.vars.map((v) => [v.k, rowOf(v)])) as Record<string, Row>

  const calc = useMemo(() => {
    const parsed: Record<string, number | null | 'bad'> = {}
    const si: Rec = {}
    for (const v of f.vars) {
      const r = rows[v.k]
      if (r.t.trim() === '') { parsed[v.k] = null; continue }
      const n = parseNum(r.t)
      if (Number.isNaN(n)) { parsed[v.k] = 'bad'; continue }
      parsed[v.k] = n; si[v.k] = n * v.units[r.u].f
    }
    const empty = f.vars.filter((v) => parsed[v.k] === null)
    const bad = f.vars.filter((v) => parsed[v.k] === 'bad')
    if (bad.length) return { kind: 'bad' as const, bad: bad.map((b) => b.k), parsed }
    if (empty.length > 1) return { kind: 'need' as const, n: empty.length - 1, parsed }
    if (empty.length === 0) return { kind: 'full' as const, parsed }
    const target = empty[0]
    const s = f.solve[target.k]
    if (!s) return { kind: 'nosolver' as const, target, parsed }
    const res = s.fn(si)
    if (!Number.isFinite(res)) return { kind: 'nosol' as const, target, parsed }
    const all = { ...si, [target.k]: res }
    return { kind: 'ok' as const, target, res, all, si, solver: s, parsed, warn: f.check?.(all, target.k) ?? null, extras: f.extras?.(all, target.k) ?? [] }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, state])

  const tgtRow = calc.kind === 'ok' ? rows[calc.target.k] : null
  const sub = (tpl: string, si: Rec, all: Rec) => tpl.replace(/<(\w+)>/g, (_, k: string) => {
    const v = f.vars.find((x) => x.k === k)!
    const x = k in si ? si[k] : all[k]
    const body = tn(x) + (v.si ? `\\,${v.si}` : '')
    return x < 0 ? `\\left(${body}\\right)` : body
  })

  const log = () => {
    if (calc.kind !== 'ok' || !tgtRow) return
    const u = calc.target.units[tgtRow.u]
    const text = `${f.name.split('  ')[0]}: ${calc.target.k} = ${sci(calc.res / u.f)} ${u.u}`
    setHist((h) => [{ id: Date.now(), fid: f.id, text, rows: { ...rows, [calc.target.k]: { t: '', u: tgtRow.u } } }, ...h].slice(0, 30))
  }
  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200) }, () => {})
  }
  const nonInt = calc.kind === 'ok' && calc.target.int && Math.abs(calc.res - Math.round(calc.res)) > 0.03 * Math.max(1, calc.res)

  return (
    <div className={'eq' + (compact ? ' eq-compact' : '')}>
      <div className="eq-top">
        <select value={f.id} onChange={(e) => setFid(e.target.value)} aria-label="Formula">
          {GROUPS.map((g) => <optgroup key={g} label={g}>{FORMULAS.filter((x) => x.group === g).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</optgroup>)}
        </select>
        <button className="btn sm ghost" onClick={() => setState((s) => ({ ...s, [f.id]: Object.fromEntries(f.vars.map((v) => [v.k, v.def != null ? rowOf(v) : { t: '', u: 0 }])) }))} title="Clear the non-constant values">Clear</button>
        <button className="btn sm ghost" onClick={() => setState((s) => { const n = { ...s }; delete n[f.id]; return n })} title="Reset values and units">Reset</button>
      </div>
      <div className="eq-formula"><Tex block>{f.tex}</Tex></div>
      {f.note && <p className="eq-note">{f.note}</p>}

      <div className="eq-vars">
        {f.vars.map((v) => {
          const r = rows[v.k]
          const isT = calc.kind === 'ok' && calc.target.k === v.k
          const isBad = calc.kind === 'bad' && calc.bad.includes(v.k)
          return (
            <div key={v.k} className={'eq-var' + (isT ? ' target' : '') + (isBad ? ' bad' : '')}>
              <span className="eq-sym"><Tex>{v.tex}</Tex></span>
              <label className="eq-name">{v.name}{v.def != null && <em> · constant</em>}</label>
              <input value={r.t} onChange={(e) => setRow(v.k, { ...r, t: e.target.value })} inputMode="decimal" spellCheck={false}
                placeholder={isT && calc.kind === 'ok' ? '= ' + plain(calc.res / v.units[r.u].f) : 'leave empty to solve'} aria-label={v.name} />
              {v.units.length > 1
                ? <select value={r.u} onChange={(e) => setRow(v.k, { ...r, u: Number(e.target.value) })}>{v.units.map((u, i) => <option key={u.u} value={i}>{u.u}</option>)}</select>
                : <span className="eq-unit">{v.units[0].u}</span>}
            </div>
          )
        })}
      </div>

      <div className="eq-result">
        {calc.kind === 'need' && <p className="muted">Fill {calc.n} more variable{calc.n > 1 ? 's' : ''}; the one left empty is solved for.</p>}
        {calc.kind === 'full' && <p className="muted">Every variable is filled. Clear the one you want to solve for.</p>}
        {calc.kind === 'bad' && <p className="eq-err">Can’t read the highlighted value. Use e.g. 6.63e-34, 6.63x10^-34 or 6.63×10⁻³⁴.</p>}
        {calc.kind === 'nosolver' && <p className="muted">This tool doesn’t solve for {calc.target.name} in this formula. Clear a different variable.</p>}
        {calc.kind === 'nosol' && <p className="eq-err">No real solution for {calc.target.name} with these values (check the signs and that n₂ &gt; n₁, etc.).</p>}
        {calc.kind === 'ok' && tgtRow && (
          <>
            <div className="eq-answer">
              <span><Tex>{calc.target.tex}</Tex> =</span>
              <b>{sci(calc.res / calc.target.units[tgtRow.u].f, 4)}</b>
              <span className="eq-au">{calc.target.units[tgtRow.u].u}</span>
              <button className="btn sm" onClick={log} title="Save to history">Log</button>
              <button className="btn sm ghost" onClick={() => copy('ans', plain(calc.res / calc.target.units[tgtRow.u].f))}>{copied === 'ans' ? 'Copied ✓' : 'Copy'}</button>
            </div>
            {calc.target.units.length > 1 && (
              <div className="eq-alt">{calc.target.units.map((u) => <span key={u.u}>{sci(calc.res / u.f, 4)} {u.u}</span>)}</div>
            )}
            <div className="eq-work">
              <h5>Working</h5>
              <Tex block>{calc.solver.sym}</Tex>
              <Tex block>{sub(calc.solver.sub, calc.si, calc.all)}</Tex>
              <Tex block>{`${calc.target.tex} = ${tn(calc.res)}${calc.target.si ? `\\,${calc.target.si}` : ''}${calc.target.units[tgtRow.u].f !== 1 ? ` = ${tn(calc.res / calc.target.units[tgtRow.u].f)}\\,${calc.target.units[tgtRow.u].x}` : ''}`}</Tex>
              {calc.extras.map((x, i) => ('tex' in x ? <Tex key={i} block>{x.tex}</Tex> : <p key={i} className="eq-extra">{x.note}</p>))}
            </div>
            {calc.warn && <p className="eq-warn">⚠ {calc.warn}</p>}
            {nonInt && <p className="eq-warn">⚠ {calc.target.name} should be a whole number; one of your inputs is probably off.</p>}
          </>
        )}
      </div>

      <details className="eq-sec" open={!compact && hist.length > 0}>
        <summary>History {hist.length > 0 && <span className="chip">{hist.length}</span>}</summary>
        {hist.length === 0 ? <p className="muted eq-pad">Press “Log” on a result to remember it here.</p> : (
          <div className="eq-hist">
            {hist.map((h) => (
              <div key={h.id} className="eq-h">
                <button onClick={() => { setFid(h.fid); setState((s) => ({ ...s, [h.fid]: h.rows })) }} title="Restore these inputs">{h.text}</button>
                <button className="x" onClick={() => setHist((a) => a.filter((x) => x.id !== h.id))} aria-label="Remove">✕</button>
              </div>
            ))}
            <button className="btn sm ghost" onClick={() => setHist([])}>Clear history</button>
          </div>
        )}
      </details>
      <details className="eq-sec" open={!compact}>
        <summary>Constants</summary>
        <table className="eq-consts"><tbody>
          {CONSTS.map((c) => (
            <tr key={c.tex}>
              <td><Tex>{c.tex}</Tex></td><td>{c.name}</td>
              <td className="mono">{plain(c.v)} <small>{c.unit}</small></td>
              <td><button className="btn sm ghost" onClick={() => copy(c.tex, plain(c.v))}>{copied === c.tex ? '✓' : 'Copy'}</button></td>
            </tr>
          ))}
        </tbody></table>
      </details>
    </div>
  )
}
