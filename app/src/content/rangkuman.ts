// Rangkuman: the one-page cram sheet for Quiz 2 (L7–L10). Markdown + KaTeX blocks, grouped by lecture.
// Source of truth: knowledge/corpus.md (the slides). Formula lists are auto-appended per lecture from each
// section's `formulas`, so blocks here focus on rules, tables, procedures and traps.
import type { LectureId } from '../types'

export interface CramBlock { title: string; md: string; figure?: string }
export interface CramPart { lecture: LectureId; title: string; blocks: CramBlock[] }

const r = String.raw

export const RANGKUMAN: CramPart[] = [
  // ───────────────────────────── L7 ─────────────────────────────
  {
    lecture: 'L7',
    title: 'Atomic Structure',
    blocks: [
      {
        title: 'Light: wave and particle',
        md: r`
- **Wave:** $\lambda\nu=c$, with $c=2.9979\times10^8$ m/s. Long $\lambda$ means low $\nu$ means low energy.
- **Particle (photon):** $E=h\nu=hc/\lambda$, $h=6.626\times10^{-34}$ J·s. This is energy **per photon**; multiply by $N_A=6.022\times10^{23}$ for per mole.
- Order of energy: radio < microwave < IR < visible (700 → 400 nm, red → violet) < UV < X-ray < γ.
- **Photoelectric effect:** electrons are ejected only if $\nu$ is above a threshold; brighter light gives *more* electrons, not faster ones. $KE=h\nu-\Phi$ (work function $\Phi$; equation is general knowledge, the slides show it only as a figure).

**Traps**
- Convert nm → m ($10^{-9}$) before using $c$ or $hc/\lambda$.
- kJ/mol answers need the $\times N_A$ and $\div1000$.
`,
      },
      {
        title: 'Line spectra, Rydberg and Bohr',
        figure: 'L7-h-series',
        md: r`
- Excited atoms emit only certain $\lambda$ (line / emission spectrum) ⇒ electron energy is **quantized**.
- **Rydberg:** $\dfrac1\lambda=R_H\left(\dfrac1{n_1^2}-\dfrac1{n_2^2}\right)$, $R_H=109{,}678$ cm⁻¹, $n_2>n_1$.
- **Bohr:** $E_n=-\dfrac{b}{n^2}$, $b=R_Hhc=2.1788\times10^{-18}$ J/atom. $E=0$ at $n=\infty$ (free electron); $n=1$ is the ground state (most negative).
- Photon energy $=\Delta E=E_h-E_l$. **Emission:** high → low $n$ (photon out). **Absorption:** low → high $n$ (photon in, must match the gap exactly).

| Series | $n_1$ (lower) | Region |
|---|---|---|
| Lyman* | 1 | UV |
| Balmer | 2 | visible |
| Paschen* | 3 | IR |

\*names are general knowledge; Balmer is on the slides.

**Worked (slide 21):** Balmer 6 → 2: $1/\lambda=109678(\tfrac14-\tfrac1{36})=24{,}373$ cm⁻¹ ⇒ $\lambda=410.3$ nm (violet).

**Traps:** $R_H$ is in cm⁻¹, so $1/\lambda$ comes out in cm⁻¹; convert cm → nm ($\times10^7$). Levels crowd together as $n$ grows. Bohr works only for one-electron species.
`,
      },
      {
        title: 'Quantum numbers',
        md: r`
| | Name | Allowed values | Tells you |
|---|---|---|---|
| $n$ | principal | 1, 2, 3, … | shell: size, energy |
| $\ell$ | angular momentum | 0 … $n-1$ | subshell shape |
| $m_\ell$ | magnetic | $-\ell$ … $+\ell$ | orientation |
| $m_s$ | spin | $+\tfrac12$, $-\tfrac12$ | spin (beyond slides) |

- Orbitals per shell $=n^2$; electrons per shell $=2n^2$; orbitals per subshell $=2\ell+1$.
- **Nodes:** total $n-1$; radial (spherical) $n-\ell-1$; angular (planar) $\ell$.
- An orbital is a probability region from $|\Psi|^2$, **not** an orbit.

**Finding the four for an electron:** (1) write the configuration (cations lose highest-$n$ electrons first); (2) pick the electron; (3) $n$ = the shell number, $\ell$ from the letter (s 0, p 1, d 2, f 3); (4) draw the subshell as boxes $m_\ell=-\ell\dots+\ell$ left to right, fill ↑ first (Hund), read the box; (5) ↑ = $+\tfrac12$, ↓ = $-\tfrac12$. Mn³⁺ $[\text{Ar}]3d^4$: $n=3,\ \ell=2,\ m_\ell\in\{-2,\dots,1\},\ m_s=+\tfrac12$.

**Traps:** no 1p, 2d or 3f ($\ell\le n-1$). $|m_\ell|\le\ell$. Pauli: no two electrons share all four numbers.
`,
      },
      {
        title: 's, p, d, f at a glance',
        md: r`
| | $\ell$ | Orbitals | Max e⁻ | Shape | Block (groups) |
|---|---|---|---|---|---|
| s | 0 | 1 | 2 | sphere | 1–2, He |
| p | 1 | 3 | 6 | dumbbell | 13–18 |
| d | 2 | 5 | 10 | cloverleaf (+ $d_{z^2}$) | 3–12, fills $(n-1)d$ |
| f | 3 | 7 | 14 | complex | Ln/An, fills $(n-2)f$ |

Block width in the periodic table = max electrons (2, 6, 10, 14 columns).
`,
      },
      {
        title: 'Writing electron configurations',
        md: r`
**Order (Aufbau):** 1s 2s 2p 3s 3p **4s 3d** 4p 5s 4d 5p 6s 4f 5d 6p
- **Pauli:** ≤ 2 e⁻ per orbital, opposite spins.
- **Hund:** in degenerate orbitals put one e⁻ in each (parallel) before pairing.
- Use noble-gas cores: Fe = $[\text{Ar}]3d^64s^2$.
- **Exceptions:** Cr $[\text{Ar}]3d^54s^1$, Cu $[\text{Ar}]3d^{10}4s^1$ (half-filled / filled d is extra stable).

**Paramagnetic** = has unpaired e⁻ (attracted to a magnet); **diamagnetic** = all paired. Draw the orbital boxes and count: O $2p^4$ → 2 unpaired; N $2p^3$ → 3; Zn $3d^{10}4s^2$ → 0.

**Traps:** 4s fills before 3d but is written after it and is lost first in ions (L8). Writing Cr as $3d^44s^2$ is wrong.
`,
      },
      {
        title: 'Periodic trends',
        figure: 'L7-trends',
        md: r`
| Property | Across a period → | Down a group ↓ | Why |
|---|---|---|---|
| Atomic radius | decreases | increases | $Z_{eff}$ up across; $n$ up down |
| 1st ionization energy | increases | decreases | harder to remove a tightly held e⁻ |
| Electron affinity | more negative | less negative (roughly) | stronger pull on an added e⁻ |
| Electronegativity (L8) | increases | decreases | same as IE |

- **IE** $X(g)\to X^+(g)+e^-$ is always **positive**. Successive IEs rise, with a **huge jump** once the noble-gas core is reached (Na: 496 → 4563 kJ/mol).
- **IE dips:** Be > B (B's e⁻ is in higher-energy 2p) and N > O (O's paired 2p e⁻ repel).
- **EA** $X(g)+e^-\to X^-(g)$: Cl (≈ −349) is more negative than F (small, crowded 2p). Noble gases, Be, Mg, N ≈ 0 or positive.
- **Isoelectronic** (same e⁻ count): more protons ⇒ smaller. $\text{N}^{3-}>\text{O}^{2-}>\text{F}^->\text{Ne}>\text{Na}^+>\text{Mg}^{2+}>\text{Al}^{3+}$. Cation < its atom; anion > its atom.
`,
      },
    ],
  },

  // ───────────────────────────── L8 ─────────────────────────────
  {
    lecture: 'L8',
    title: 'Basics of Chemical Bonding',
    blocks: [
      {
        title: 'Ionic vs covalent',
        figure: 'l8-ionic-character',
        md: r`
- **Ionic bond:** e⁻ **transferred** metal → nonmetal; electrostatic attraction of + and − ions in a 3-D **lattice**. Formula is always **empirical** (smallest whole-number ratio).
- **Covalent bond:** e⁻ **shared** between nonmetals; separate molecules.
- Why metal + nonmetal is ionic: metals have **low IE** (lose e⁻ easily), nonmetals have **very negative EA**, and lattice formation stabilises the ions.
- A compound forms only if PE drops: $\Delta H_f^\circ<0$.
`,
      },
      {
        title: 'Born–Haber cycle (Hess’s law)',
        figure: 'l8-born-haber-nacl',
        md: r`
**NaCl, slide 8 (kJ/mol)**
| # | Step | Equation | Sign | ΔH |
|---|---|---|---|---|
| 1 | Sublimation of metal | Na(s) → Na(g) | + | 107.8 |
| 2 | Atomise nonmetal (½ bond energy) | ½Cl₂(g) → Cl(g) | + | 121.3 |
| 3 | Ionisation energy | Na(g) → Na⁺(g) + e⁻ | + | 495.4 |
| 4 | Electron affinity | Cl(g) + e⁻ → Cl⁻(g) | − | −348.8 |
| 5 | Lattice energy | Na⁺(g) + Cl⁻(g) → NaCl(s) | − | −787 |
| | **Sum = ΔH°f** | Na(s) + ½Cl₂(g) → NaCl(s) | − | −411 |

**Solving for the unknown** (usually the lattice energy):
1. Write all 5 steps with signs.
2. $\Delta H_f^\circ=$ (sum of steps 1–5).
3. Rearrange: $\Delta H_{lattice}=\Delta H_f^\circ-(1+2+3+4)$.
   NaCl: $-411.1-(107.8+121.3+495.4-348.8)=-786.8$ kJ/mol.

**For 2+/2− salts (e.g. MgO):** step 3 is IE₁ + IE₂; step 4 is EA₁ + EA₂ (O: −141 + 844 = **+703**, endothermic); step 2 is ½D(O=O). Scale every step by the formula's stoichiometry (MgCl₂: whole Cl₂, 2 × EA).

**Traps:** sign slips (only EA and lattice are negative); forgetting the ½; using EA₁ only for O²⁻.
`,
      },
      {
        title: 'Lattice energy trends',
        md: r`
$$\Delta H_{lattice}\propto\frac{q_+q_-}{d}\quad(\text{always negative})$$
1. **Charge first:** bigger $\lvert q_+q_-\rvert$ ⇒ more negative.
2. **Then size:** smaller ions (smaller $d$) ⇒ more negative.

| Salt | Ion charges | $\lvert q_+q_-\rvert$ |
|---|---|---|
| NaCl | 1+, 1− | 1 |
| Na₂O, CaCl₂ | 1+/2−, 2+/1− | 2 |
| CaO | 2+, 2− | 4 |
| Ca₃N₂ | 2+, 3− | **6** (largest, slide 11) |

Same charges, compare size: LiF > NaF > KF; MgO > CaO > SrO.

**Traps:** use ion charges, not subscripts. "Greatest lattice energy" = most negative value.
`,
      },
      {
        title: 'Ion configurations',
        figure: 'l8-ion-removal',
        md: r`
**s/p block:** gain/lose e⁻ to reach the nearest noble gas (octet; H, He: 2).
Na⁺ [Ne] · Ca²⁺ [Ar] · Cl⁻ [Ar] · O²⁻ [Ne] · N³⁻ [Ne] · Cs⁺ [Xe]

**Transition metals: remove 4s (highest $n$) before 3d.**
| Ion | Config |
|---|---|
| Fe²⁺ / Fe³⁺ | [Ar]3d⁶ / [Ar]3d⁵ |
| Mn²⁺ | [Ar]3d⁵ (half-filled, stable) |
| Zn²⁺ | [Ar]3d¹⁰ |
| Cu (atom) / Cu²⁺ | [Ar]3d¹⁰4s¹ / [Ar]3d⁹ |
| Cr³⁺ | [Ar]3d³ |

**Post-transition:** lose $np$ first, then $ns$.
Sn [Kr]4d¹⁰5s²5p² → Sn²⁺ [Kr]4d¹⁰5s² → Sn⁴⁺ [Kr]4d¹⁰. Bi → Bi³⁺ (loses 6p³), Bi⁵⁺ (also 6s²).

**Procedure:** write the neutral atom, reorder by $n$ ([Ar]3d⁶4s²), then strip from the highest $n$ (then highest $\ell$).

**Traps:** Fe²⁺ is **not** [Ar]3d⁴4s². Na²⁺ / Ca³⁺ don't form: the next IE is ~10× larger (core e⁻). Octet rule fails for transition and post-transition metals.
`,
      },
      {
        title: 'Electronegativity and ΔEN',
        md: r`
**EN** = ability of a bonded atom to attract shared e⁻. Increases → across, decreases ↓ down.

Slide 34 values (learn by heart; +0.5 per step to the right):
| H | Li | Be | B | C | N | O | F |
|---|---|---|---|---|---|---|---|
| 2.0 | 1.0 | 1.5 | 2.0 | 2.5 | 3.0 | 3.5 | 4.0 |

P 2.0 · S 2.5 · Cl 3.0

| $\Delta\chi=\lvert\chi_A-\chi_B\rvert$ | Bond type |
|---|---|
| 0 – < 0.5 | (almost) nonpolar covalent, < 5 % ionic |
| 0.5 – 1.7 | polar covalent |
| > 1.7 | mostly ionic (> 50 %) |

Examples: C–H 0.5 · HCl 1.0 · CO 1.0 · BeO 2.0 · LiF 3.0. Least polar H–X: **HI**.

**Traps:** ΔEN is an absolute value. Nonmetal + nonmetal is covalent even when polar.
`,
      },
      {
        title: 'Polar bonds and dipole moment',
        md: r`
- Unequal sharing ⇒ partial charges δ+ / δ− (HCl: ±0.17). The bond is a **dipole**.
- **Dipole moment** $\mu=q\times r$, in debye: 1 D = $3.34\times10^{-30}$ C·m.
- Bigger ΔEN ⇒ more polar ⇒ larger μ (bond length also enters).
- δ− sits on the **more electronegative** atom: N–H is δ−N, δ+H; Si–F is δ+Si, δ−F.
- **Reactivity:** low-EN metals oxidise easily (groups 1, 2); high-EN metals (Pt, Au, Ir, Rh, Pd) resist. Oxidising power of nonmetals follows EN: rises across, falls down.
`,
      },
    ],
  },

  // ───────────────────────────── L9 ─────────────────────────────
  {
    lecture: 'L9',
    title: 'Molecular Structure',
    blocks: [
      {
        title: 'Lewis symbols and the octet',
        md: r`
- Representative elements: **group number = valence e⁻** (1A: 1 … 7A: 7, 8A: 8).
- Covalent bond = shared pair (bonding pair, **PEI**). Unshared pair = lone pair (**PEB**).
- Usual bond counts: C 4, N 3, O 2, H and halogens 1.
- Octet rule: atoms share until they have 8 e⁻ (H: 2).

**Exceptions**
- **Incomplete octet:** Be, B (BeCl₂, BCl₃, BBr₃: B has 6 e⁻).
- **Expanded octet:** period 3 and below only (empty $nd$ orbitals): PCl₅ (10), SF₆ (12), XeF₄.
- **Never** more than 8 around C, N, O, F.
- Odd-electron species (NO, NO₂) can’t all be octets.
`,
      },
      {
        title: 'Lewis structure procedure',
        figure: 'l9-n2f2-steps',
        md: r`
1. **Skeleton:** central atom = usually written first / **least electronegative** (never H). In oxoacids, H is on O.
2. **Count all valence e⁻**; add 1 per − charge, subtract 1 per + charge.
3. Put a single bond (2 e⁻) between each bonded pair.
4. Complete the octets of **terminal** atoms with lone pairs.
5. Put leftover e⁻ on the **central** atom in pairs.
6. Central atom short of an octet? Turn a terminal lone pair into a **double** (then triple) bond.
7. Check formal charges to choose between options.

**Worked (N₂F₂, slides 35–36):** 2(5) + 2(7) = 24 e⁻ → 3 single bonds use 6 (18 left) → 3 lone pairs on each F use 12 (6 left) → put the last 6 on the N atoms. Each N still has only 6 e⁻ ⇒ make **N=N**: F–N=N–F with 3 lone pairs on each F and 1 on each N.

**Traps:** forgetting ion charge in the count; recount the total at the end.
`,
      },
      {
        title: 'Formal charge',
        figure: 'l9-nco-fc',
        md: r`
$$FC=V-L-\tfrac12B$$
$V$ = valence e⁻ of the free atom, $L$ = lone-pair (unshared) e⁻, $B$ = bonding e⁻. Equivalent slide form: $FC=V-(\#\text{bonds}+\#\text{unshared e}^-)$.

**Choosing the best structure (slide 52)**
1. Fewest formal charges (ideally all 0).
2. All $|FC|\le1$.
3. Any negative FC on the **most electronegative** atom.
- Sum of FCs = overall charge.

**Examples**
- H₂SO₄: structure with two S=O gives S 0 (vs +2 with all singles) ⇒ preferred, matches X-ray (S=O 142 pm vs S–OH 157 pm).
- CO₂: O=C=O (all 0) beats ⁻O–C≡O⁺.
- BCl₃: all FC = 0 with 6 e⁻ on B ⇒ no double bond needed.

**Traps:** FC ≠ real charge (and ≠ oxidation number). Count each bond as 1, not 2, in the slide form.
`,
      },
      {
        title: 'Resonance',
        figure: 'l9-no3-resonance',
        md: r`
- When one Lewis structure can’t explain equal bond lengths (NO₃⁻: all three N–O equal), draw **several**; the real molecule is the **hybrid** (average). Use ↔.
- **Only electrons move** (π bonds and lone pairs); atoms, bond angles and unpaired-e⁻ count stay fixed.
- Delocalisation stabilises the molecule (resonance energy; benzene ≈ 146 kJ/mol).

**Good contributors (slide 62):** octets satisfied → as many bonds as possible → $|FC|\le1$, negative FC on EN atoms → least charge separation.

**NCO⁻ (slide 65):** N≡C–O⁻ (FC N 0, O −1) **best**; ⁻N=C=O OK; N(−2)–C≡O(+1) not acceptable.

**Bond order in resonance:** total bonds ÷ positions. NO₃⁻, CO₃²⁻: 4/3. O₃, SO₂, NO₂⁻, HCOO⁻: 3/2.

**Common resonance species:** NO₃⁻, CO₃²⁻, O₃, SO₂, NO₂⁻, HCOO⁻, N₃⁻, NCO⁻, benzene. **Not:** H₂O, CH₄, ethene.

**Traps:** resonance structures are not in equilibrium; the molecule doesn’t flip between them.
`,
      },
      {
        title: 'Bond order, length and energy',
        md: r`
- **Bond order** = number of shared pairs between two atoms (single 1, double 2, triple 3).
- Higher bond order ⇒ more e⁻ density ⇒ **shorter and stronger** (for the same two elements).

| C–C | C=C | C≡C |
|---|---|---|
| 348 | 612 | 960 kJ/mol |

- **Bond dissociation energy D:** energy to break 1 mol of bonds in the gas phase; **always positive**.
- Bond length ≈ $r_A+r_B$.
`,
      },
      {
        title: 'ΔH from bond energies',
        figure: 'l9-dh-bond-energy',
        md: r`
$$\Delta H^\circ_{rxn}=\sum D(\text{bonds broken})-\sum D(\text{bonds formed})$$

**Procedure**
1. Draw Lewis structures of every reactant and product (find double/triple bonds).
2. List bonds broken (reactants) × coefficients.
3. List bonds formed (products) × coefficients.
4. Broken − formed.

**Worked:** C₂H₄ + H₂ → C₂H₆
- Broken: C=C 612 + H–H 436 = 1048
- Formed: C–C 348 + 2 C–H (2 × 412) = 1172
- ΔH = 1048 − 1172 = **−124 kJ/mol** (exothermic)

You may cancel bonds that appear on both sides (the four C–H here).

**Traps:** it is broken − formed (not products − reactants as with ΔH°f). Forgetting coefficients. Gas phase only; values are averages, so answers are estimates.
`,
      },
      {
        title: 'Coordinate covalent bonds',
        figure: 'l9-coordinate',
        md: r`
- Both shared e⁻ come from **one** atom (a lone pair donor) into an empty orbital of the acceptor.
- NH₃ + H⁺ → NH₄⁺; H₃N + BCl₃ → H₃N–BCl₃; BF₃ + F⁻ → BF₄⁻.
- Once formed, it is identical to any other covalent bond.
- Boron (electron-deficient) is the classic acceptor.
`,
      },
    ],
  },

  // ───────────────────────────── L10 ─────────────────────────────
  {
    lecture: 'L10',
    title: 'Chemical Bonding Theory',
    blocks: [
      {
        title: 'VSEPR procedure',
        figure: 'l10-vsepr-2-4',
        md: r`
Electron domains repel ⇒ they get **as far apart as possible**.
1. Draw the Lewis structure (any one resonance form; FC not needed).
2. Count **domains on the central atom** = bonded atoms + lone pairs. A double or triple bond counts as **one** domain. (An unpaired e⁻ also counts.)
3. Domain count ⇒ **electron-domain geometry**.
4. Name the **molecular shape** from atom positions only (lone pairs invisible).
5. Lone pairs take more room ⇒ squeeze bond angles below ideal.

Repulsion strength: LP–LP > LP–BP > BP–BP (general knowledge; the slides say lone pairs "require more space").

**Placement:** in 5 domains lone pairs go **equatorial**; in 6 domains they go **axial** (opposite each other).
`,
      },
      {
        title: 'VSEPR master table',
        figure: 'l10-vsepr-5-6',
        md: r`
| Dom. | Type | Shape | Angle | Hyb. | Example |
|---|---|---|---|---|---|
| 2 | AX₂ | linear | 180° | sp | BeH₂, CO₂ |
| 3 | AX₃ | trigonal planar | 120° | sp² | BCl₃, BF₃ |
| 3 | AX₂E | bent | < 120° | sp² | SO₂, O₃ |
| 4 | AX₄ | tetrahedral | 109.5° | sp³ | CH₄, NH₄⁺ |
| 4 | AX₃E | trigonal pyramidal | ~107° | sp³ | NH₃ |
| 4 | AX₂E₂ | bent | ~104.5° | sp³ | H₂O, OCl₂ |
| 5 | AX₅ | trigonal bipyramidal | 90°, 120° | sp³d | PF₅, PCl₅ |
| 5 | AX₄E | seesaw | < 90°, < 120° | sp³d | SF₄, TeF₄ |
| 5 | AX₃E₂ | T-shaped | < 90° | sp³d | ClF₃ |
| 5 | AX₂E₃ | linear | 180° | sp³d | I₃⁻, XeF₂ |
| 6 | AX₆ | octahedral | 90° | sp³d² | SF₆ |
| 6 | AX₅E | square pyramidal | < 90° | sp³d² | BrF₅, ICl₅, XeOF₄ |
| 6 | AX₄E₂ | square planar | 90° | sp³d² | XeF₄ |

A = central atom, X = bonded atom, E = lone pair. Domains = X + E.

**Traps:** electron geometry ≠ molecular shape (NH₃: tetrahedral domains, pyramidal shape). AX₂E₃ is linear, not bent. ClF₂⁺ has 4 domains (2 X + 2 E) ⇒ bent, sp³.
`,
      },
      {
        title: 'Molecular polarity',
        figure: 'l10-polarity',
        md: r`
A molecule is polar if its **bond dipoles don’t cancel** (vector sum ≠ 0). Arrow points to the δ− (more EN) end.
1. Draw the correct 3-D shape.
2. Draw each bond dipole.
3. Cancel? → nonpolar. Uneven? → polar.

**Shortcuts**
- **Nonpolar:** no lone pairs on the central atom **and** all terminal atoms identical: CO₂, BCl₃, CH₄, PF₅, SF₆.
- **Polar:** lone pair(s) on the centre (H₂O, NH₃, SO₂, SF₄, ClF₃) **or** mixed terminal atoms (CH₃Cl, HCN, BClF₂).
- **Exceptions (nonpolar with lone pairs):** lone pairs placed symmetrically: XeF₂, I₃⁻ (linear), XeF₄ (square planar).

**Traps:** polar bonds ≠ polar molecule (CO₂). A symmetrical shape with **different** atoms (CH₂Cl₂) is still polar.
`,
      },
      {
        title: 'Hybridisation (VBT)',
        md: r`
- **VBT:** a bond forms when two half-filled AOs overlap and the e⁻ pair up (H₂: 1s–1s; HF: 1s–2p; F₂: 2p–2p). H₂S ≈ 90° from plain p orbitals.
- Plain AOs can’t give 109.5° in CH₄ ⇒ **hybridise** (promote, then mix).
- **Number of hybrid orbitals = number of domains** (σ bonds + lone pairs) on that atom. AOs in = hybrids out.

| Domains | Hybrid | AOs mixed |
|---|---|---|
| 2 | sp | s + p |
| 3 | sp² | s + 2p |
| 4 | sp³ | s + 3p |
| 5 | sp³d | s + 3p + $d_{z^2}$ |
| 6 | sp³d² | s + 3p + $d_{z^2}$ + $d_{x^2-y^2}$ |

- Lone pairs sit in hybrid orbitals (NH₃, H₂O are sp³). Expanded octets (5, 6 domains) need d orbitals ⇒ period 3+ only.
- Hybrids hold lone pairs + σ pairs + **only one** pair of each multiple bond.

**Traps:** hybridise by domains, not by bonds (O in H₂O is sp³, not sp). C in CO₂ is sp; carbonyl C is sp².
`,
      },
      {
        title: 'σ and π bonds',
        md: r`
| | σ | π |
|---|---|---|
| Overlap | head-on, on the axis | sideways p–p |
| e⁻ density | between nuclei | above and below the axis |
| From | s, p, or hybrids | **unhybridised p** only |
| Rotation | free | blocked |

**Counting:** single = 1σ · double = 1σ + 1π · triple = 1σ + 2π. Every bond (including each C–H) has exactly one σ.

| Molecule | σ | π | C hybrid |
|---|---|---|---|
| C₂H₄ | 5 | 1 | sp² |
| C₂H₂ | 3 | 2 | sp |
| HCN | 2 | 2 | sp |
| CO₂ | 2 | 2 | sp |
| H₂CO | 3 | 1 | sp² |
| CH₂=CH–CH=CH₂ | 9 | 2 | sp² |

sp² atoms keep 1 unhybridised p (one π); sp atoms keep 2.

**Traps:** a double bond is not 2σ. π never exists without σ.
`,
      },
      {
        title: 'MO theory basics',
        md: r`
- AOs from different atoms combine; **AOs in = MOs out**.
- **Bonding MO (σ, π):** constructive overlap, e⁻ density between nuclei, **lower** energy than the AOs.
- **Antibonding MO (σ\*, π\*):** destructive, node between nuclei, **higher** energy.
- Fill with Aufbau, Pauli (2 per MO, paired) and Hund.

$$\text{Bond order}=\tfrac12(\text{bonding e}^- - \text{antibonding e}^-)$$
BO = 0 ⇒ molecule does not exist. BO may be a fraction.

| Species | e⁻ | BO |
|---|---|---|
| H₂ | 2 | 1 |
| H₂⁺, H₂⁻, He₂⁺ | 1, 3, 3 | ½ |
| He₂ | 4 | 0 (doesn’t form) |
`,
      },
      {
        title: '2nd-row MO ordering',
        figure: 'l10-mo-li2-n2',
        md: r`
Use **valence (n = 2) e⁻ only**; 1s MOs are full and cancel.

**Li₂ → N₂** (π2p **below** σ2p):
σ2s < σ\*2s < **π2p** (×2) < **σ2p** < π\*2p (×2) < σ\*2p

**O₂, F₂, Ne₂** (σ2p **below** π2p):
σ2s < σ\*2s < **σ2p** < **π2p** (×2) < π\*2p (×2) < σ\*2p

| | Val. e⁻ | BO | Unpaired | Magnetism |
|---|---|---|---|---|
| Li₂ | 2 | 1 | 0 | dia |
| Be₂ | 4 | 0 | – | doesn’t form |
| B₂ | 6 | 1 | 2 | **para** |
| C₂ | 8 | 2 | 0 | dia |
| N₂ | 10 | 3 | 0 | dia |
| O₂ | 12 | 2 | 2 | **para** |
| F₂ | 14 | 1 | 0 | dia |
| Ne₂ | 16 | 0 | – | doesn’t form |

B₂ being paramagnetic is the evidence that π2p lies below σ2p for light atoms.
`,
      },
      {
        title: 'Ions, heteronuclear diatomics, magnetism',
        figure: 'l10-mo-o2',
        md: r`
**Paramagnetic** = ≥ 1 unpaired e⁻ (attracted by a magnet); **diamagnetic** = all paired. Lewis structures can’t predict O₂’s paramagnetism; MO theory can.

| Species | Val. e⁻ | BO | Unpaired |
|---|---|---|---|
| O₂⁺ | 11 | 2.5 | 1 |
| O₂ | 12 | 2 | 2 |
| O₂⁻ | 13 | 1.5 | 1 |
| O₂²⁻ | 14 | 1 | 0 |
| N₂⁺ | 9 | 2.5 | 1 |
| NO⁺ | 10 | 3 | 0 |
| NO | 11 | 2.5 | 1 |
| NO⁻ | 12 | 2 | 2 |

**Heteronuclear rule (slide 127):** both atoms Li–N ⇒ π below σ; O or heavier ⇒ σ below π; mixed ⇒ use the "average" atom. BC (7 e⁻) BO 1.5; NF (12 e⁻) BO 2. NO is tricky; the slides settle it by experiment (BO 2.5 either way).

Higher BO ⇒ shorter, stronger: NO⁺ (106 pm, 1025 kJ/mol) > NO (115, 630) > NO⁻ (130, 400).

**Isoelectronic** species share a diagram: N₂, CO, CN⁻, NO⁺ all BO 3.

**Traps:** count electrons after adding/removing the ion charge. Removing e⁻ from an antibonding MO **raises** BO (O₂ → O₂⁺).
`,
      },
      {
        title: 'Resonance in MO terms; VBT vs MOT',
        md: r`
- **Formate HCOO⁻:** C and both O are sp²; three unhybridised p orbitals ⇒ 3 π MOs (bonding, nonbonding, antibonding) holding 4 e⁻. The π bond is **delocalised** over O–C–O, which is the resonance hybrid.
- **Benzene:** 6 sp² C, 6 p orbitals ⇒ 6 π MOs (3 bonding filled): 3 π pairs spread over 6 C. Delocalisation energy = resonance energy.
- **VBT** is good for shapes and hybrids; **MOT** handles magnetism (O₂, B₂), fractional BO, and resonance. Neither is complete.
`,
      },
    ],
  },
]
