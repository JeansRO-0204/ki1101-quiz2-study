// Learn content for L10. Owned by the content agent. Markdown + KaTeX; cite slides via `slides`.
import type { Lecture } from '../types'

const r = String.raw

export const lecture: Lecture = {
  id: 'L10',
  title: 'Chemical Bonding Theory',
  summary:
    'Predicting molecular shape with VSEPR (2–6 electron domains, where lone pairs go), deciding polarity from bond-dipole sums, explaining bonding with valence bond theory (hybridization sp to sp³d², σ and π bonds), and then molecular orbital theory: bonding/antibonding MOs, bond order, magnetism of the second-row diatomics, NO/NO⁺/NO⁻, and delocalised MOs (formate, benzene).',
  sections: [
    {
      id: 'vsepr-basics',
      title: 'VSEPR: electron domains and the five basic geometries',
      slides: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      md: r`
**VSEPR** (valence shell electron pair repulsion): electron domains around the central atom arrange themselves as **far apart as possible** to minimise repulsion (lowest potential energy).

**Two types of electron domain**
- **Bonding domain**: electrons shared between 2 atoms. **A single, double or triple bond is ONE domain.**
- **Nonbonding domain**: a **lone pair**, or a **single unpaired electron** (odd-electron molecules). Lone pairs occupy more space than bonding pairs (balloon-shaped, only one nucleus at the end) and **must be counted as domains**.

**The five basic electron-pair geometries**

| Electron domains | Electron-pair geometry | Angle(s) |
|---|---|---|
| 2 | linear | 180° |
| 3 | trigonal planar | 120° |
| 4 | tetrahedral | 109.5° |
| 5 | trigonal bipyramidal (axial + equatorial positions) | 90° and 120° |
| 6 | octahedral (axial + equatorial) | 90° |

**Counting domains**: domains = (number of atoms bonded to the central atom) + (lone pairs on the central atom). Draw the Lewis structure first (no formal charge needed; for resonance pick any one structure).

**Learning Check (s11)**: NH₃ → 4 domains, tetrahedral; H₂O → 4 domains, tetrahedral; I₃⁻ → 5 domains (2 bonding + 3 lone pairs on the central I), trigonal bipyramidal.
**Your Turn (s12)**: SF₄O has 4 F + 1 O on S, no lone pair on S (S=O counts as one domain): **5 domains, trigonal bipyramid**.
`,
      widgets: ['vsepr'],
      traps: [
        'A double or triple bond is ONE domain: CO₂ has 2 domains (linear), not 4.',
        'Lone pairs ARE domains: H₂O has 4 domains (tetrahedral electron geometry) even though its shape is bent.',
        'Electron-pair geometry (all domains) ≠ molecular geometry (atoms only).',
      ],
    },
    {
      id: 'vsepr-shapes-3-4',
      title: 'Molecular shapes from 3 and 4 domains',
      slides: [15, 16, 17, 18],
      md: r`
**Procedure**
1. Draw the Lewis structure. 2. Count electron domains on the central atom (multiple bond = 1). 3. Arrange domains to minimise repulsion (lone pairs need more room and slightly **squeeze bond angles**). 4. **Name the molecular shape by the positions of the atoms only.**

**3 electron domains (trigonal planar family)**

| Bonding | Lone | Shape | Angle | Example |
|---|---|---|---|---|
| 3 | 0 | trigonal planar | 120° | BCl₃ |
| 2 | 1 | bent (V-shaped) | < 120° | SO₂ |

**4 electron domains (tetrahedral family)**

| Bonding | Lone | Shape | Angle | Example |
|---|---|---|---|---|
| 4 | 0 | tetrahedral | 109.5° | CH₄ |
| 3 | 1 | trigonal pyramidal | < 109.5° (NH₃ 107°) | NH₃ |
| 2 | 2 | bent | < 109.5° (H₂O 104.5°) | H₂O |

**Trend**: more lone pairs, smaller angle (CH₄ 109.5° > NH₃ 107° > H₂O 104.5°), because a lone pair repels more strongly than a bonding pair.
`,
      widgets: ['vsepr'],
      traps: [
        'Bent can come from 3 domains (SO₂, angle < 120°) or 4 domains (H₂O, angle < 109.5°): always quote the electron geometry too.',
        'NH₃ is trigonal PYRAMIDAL, not planar: the lone pair is the fourth tetrahedral domain.',
      ],
    },
    {
      id: 'vsepr-shapes-5-6',
      title: 'Molecular shapes from 5 and 6 domains: where do lone pairs go?',
      slides: [19, 20, 21, 22, 23, 24, 25, 26, 27],
      md: r`
**Trigonal bipyramid**: 2 axial positions (90° to the equatorial plane) and 3 equatorial positions (120° apart). Equatorial positions have more room, so **in AX₅-type geometries lone pairs go equatorial**.

| Domains | Bonding | Lone | Shape | Example | Angles |
|---|---|---|---|---|---|
| 5 | 5 | 0 | trigonal bipyramidal | PF₅ / PCl₅ | ax–eq 90°, eq–eq 120° |
| 5 | 4 | 1 | seesaw (distorted tetrahedron) | SF₄ | ax–eq < 90° |
| 5 | 3 | 2 | T-shaped | ClF₃ | 90° |
| 5 | 2 | 3 | linear | XeF₂, I₃⁻ | 180° |

**Octahedron**: all six positions equivalent for a single lone pair; with two lone pairs they go **axial** (opposite each other, 180° apart) so they are as far apart as possible.

| Domains | Bonding | Lone | Shape | Example |
|---|---|---|---|---|
| 6 | 6 | 0 | octahedral | SF₆ |
| 6 | 5 | 1 | square pyramidal | BrF₅ |
| 6 | 4 | 2 | square planar | XeF₄ |

**Quick algorithm**: AXₙEₘ with n + m = domains. Name = electron geometry minus the lone pairs.

**Learning Check (s25)**: NH₃ 3 bonding / 1 nonbonding, trigonal pyramidal; H₂O 2 / 2, bent; I₃⁻ 2 / 3, linear.
**Your Turn (s26)**: TeF₄ has 6 + 28 = 34 e⁻: four Te–F bonds + 24 e⁻ on F leave **1 lone pair on Te**: the "best" structure shows exactly one lone pair (seesaw, lone pair equatorial); structures with no or two lone pairs on Te are wrong electron counts.
**Your Turn (s27)**: ICl₅ → **5 bonding, 1 nonbonding, octahedral domain geometry, square pyramidal molecule**.
`,
      widgets: ['vsepr'],
      traps: [
        'Lone pairs go equatorial in trigonal bipyramids (5 domains) but axial (opposite each other) when two are on an octahedron (XeF₄).',
        'T-shaped ClF₃ has TWO lone pairs (3 bonding + 2 lone = 5 domains).',
        'SF₄ is seesaw, not tetrahedral: 5 domains with one lone pair.',
      ],
    },
    {
      id: 'polarity',
      title: 'Molecular polarity: summing bond dipoles',
      slides: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
      md: r`
A **polar molecule** has a net dipole moment (δ⁻ end and δ⁺ end); polar molecules attract each other (δ⁺ to δ⁻), affecting mp and bp. Polarity = **vector sum of the bond dipoles** (arrow head at the negative end).

For a molecule to be polar it must first **have polar bonds** (ΔEN ≠ 0; e.g. H–Cl: 2.9 − 2.1 = 0.8 in the slides' scale). Many molecules with polar bonds are nonpolar because the dipoles **cancel**.

**Procedure**: (1) draw the correct 3D shape, (2) draw bond dipoles, (3) cancel ⇒ nonpolar; uneven ⇒ polar.

**Nonpolar** if
- all domains on the central atom are bonding pairs **and** all terminal atoms are identical: CO₂, BCl₃, CH₄, PF₅, SF₆ (symmetric shapes);
- or lone pairs are **symmetrically placed** around the central atom: XeF₄ (square planar, lone pairs opposite) and XeF₂ (linear, three equatorial lone pairs). ClF₃ (T-shaped) is NOT symmetric and is polar.

**Usually polar** if
- terminal atoms differ (CH₃Cl, HCN, BClF₂), **or**
- the central atom has one or more lone pairs not symmetric: H₂O, NH₃, SO₂, SF₄, ClF₃.

**Your Turn (s39)**: BClF₂ (trigonal planar but different terminal atoms) and OF₂ (bent) are **polar**; NH₄⁺ (tetrahedral), NO₃⁻ (trigonal planar) and C₂H₂ (linear) are symmetric, hence nonpolar. The question lists "which is polar": A and B both qualify.
`,
      widgets: ['mol-polarity'],
      traps: [
        'Polar bonds ≠ polar molecule: CO₂, BCl₃, CCl₄, SF₆ have polar bonds but are nonpolar.',
        'A lone pair on the central atom usually makes a molecule polar, but symmetric arrangements (XeF₄, XeF₂) cancel.',
        'Replacing one identical terminal atom by a different one (CH₃Cl vs CH₄) breaks the symmetry.',
      ],
    },
    {
      id: 'vbt',
      title: 'Valence bond theory and why it needs hybridization',
      slides: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
      md: r`
Lewis + VSEPR do not explain **why** bonds form, how electrons are shared, or how electron pairs avoid each other. Two complementary quantum models do:

| Valence Bond Theory (VBT) | Molecular Orbital Theory (MOT) |
|---|---|
| Atoms keep their own orbitals; a bond forms when **one AO from each atom overlap** and share a **pair of electrons with opposite spins** | Molecule = nuclei in a set of **molecular orbitals** covering the whole molecule |
| Asks how AOs rearrange for best overlap | Does not care how atoms come together |

**VBT examples**: H₂ (1s + 1s overlap); F₂ (2p + 2p); HF (H 1s + F 2p); H₂S (H 1s + S 3p, predicted 90° vs experimental 92°).

**Problem**: simple AO overlap fails for methane. C is 1s²2s²2p² but CH₄ has four equal bonds at 109.5° (p orbitals are only 90° apart, and not all valence e⁻ are in p orbitals). It also cannot explain multiple bonds directly. **Solution: hybridization.**
`,
      traps: [
        'VBT bond = overlap of two AOs sharing 2 paired electrons (one AO per atom; a full + an empty orbital also works, see coordinate bonds).',
      ],
    },
    {
      id: 'hybridization',
      title: 'Hybridization: sp, sp², sp³',
      slides: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65],
      md: r`
**Hybridization** = mixing of atomic orbitals **on the same atom** to give hybrid orbitals (HOs) with realistic bond angles and **maximum overlap** (strongest bonds).

**Rules**
1. **Number of HOs = number of AOs mixed** (orbitals are conserved) = number of electron domains (bonding + nonbonding) on the atom.
2. All HOs have the same shape, size, energy but point in different directions.
3. The large lobe extends farther than the parent AOs, so overlap is better and the bond stronger.
4. Name: spⁿ, where the superscript counts the p orbitals mixed.

**Hybridization ↔ domains table**

| Domains | Hybrid | AOs used | Electron geometry | Angle |
|---|---|---|---|---|
| 2 | sp | s + p | linear | 180° |
| 3 | sp² | s + 2p | trigonal planar | 120° |
| 4 | sp³ | s + 3p | tetrahedral | 109.5° |
| 5 | sp³d | s + 3p + d(z²) | trigonal bipyramidal | 90°, 120° |
| 6 | sp³d² | s + 3p + 2d | octahedral | 90° |

**Energetics (promote then hybridize)**: Be 2s²: **promote** one e⁻ 2s → 2p, then **hybridize** 2s + 2p → two **sp** HOs, each half-filled. Bonding in BeH₂: Be sp + H 1s, linear 180°. Similarly B (BCl₃): sp² (120°); C (CH₄): sp³ (109.5°).
- **Ethane C₂H₆**: C–H = sp³(C) + 1s(H); C–C = sp³ + sp³ overlap. Rotation about C–C is free (cylindrical symmetry), giving different **conformations**.
`,
      widgets: ['hybrid'],
      traps: [
        'Hybridization depends on the number of electron DOMAINS (including lone pairs), not just bonded atoms.',
        'Number of hybrid orbitals = number of AOs mixed (conservation): 1 s + 3 p → 4 sp³.',
        'The "promotion" step is a bookkeeping device for half-filled orbitals; it is not a real separate step.',
      ],
    },
    {
      id: 'hybrid-expanded',
      title: 'Hybridization with lone pairs, expanded octets and coordinate bonds',
      slides: [66, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78],
      md: r`
**Expanded octets**: more than 4 equivalent bonds need **d orbitals**; only period 3 and below (empty d orbitals with the same n as s and p) can do it. **One d orbital is added for each pair of electrons beyond the octet.**
- 5 domains → sp³d; 6 domains → sp³d².

**Lone pairs occupy hybrid orbitals too** (this is why VSEPR counts them):

| Molecule | Bond angle | Hybridization of central atom |
|---|---|---|
| CH₄ | 109.5° | sp³ |
| NH₃ | 107° | sp³ (3 bonding HOs + 1 lone pair) |
| H₂O | 104.5° | sp³ (2 bonding HOs + 2 lone pairs) |

**Coordinate covalent bond (VBT)**: both electrons come from one atom, which VBT allows via **a full orbital overlapping an empty one** (BF₃ + F⁻ → BF₄⁻: B goes sp² → sp³).

**Hybrid orbitals contain**: all lone pairs on the central atom; the pairs forming single bonds (σ bonds); and **only one** of the pairs in a multiple bond (the σ part).

**Your Turns**
- **s66: oxygen in OCl₂**: 2 bonds + 2 lone pairs = 4 domains → **sp³**.
- **s77: ClF₂⁺** (7 + 14 − 1 = 20 e⁻; Cl has 2 bonds + 2 lone pairs): electron geometry **tetrahedral**, molecular geometry **bent**, **sp³**, **polar**.
- **s78: XeF₄O**: 8 + 28 + 6 = 42 e⁻; Xe has 5 σ bonds (4 F + O) + 1 lone pair = 6 domains: electron geometry **octahedral**, molecular geometry **square pyramidal**, **sp³d²**, **polar**.
`,
      widgets: ['hybrid'],
      traps: [
        'ClF₂⁺ is bent with sp³ (4 domains): do not confuse it with linear ClF₂⁻ / XeF₂ (5 domains).',
        'Period 2 atoms (N, O, F, C) never use d orbitals; sp³d and sp³d² are for period 3+ central atoms.',
        'NH₃ and H₂O are sp³ even though their angles are below 109.5°: lone pairs compress the angle, they do not change the hybridization.',
      ],
    },
    {
      id: 'sigma-pi',
      title: 'Sigma and pi bonds',
      slides: [79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89],
      md: r`
Multiple bonds do not change VSEPR geometry because the extra pairs are **not in hybrid orbitals**.

| | σ bond | π bond |
|---|---|---|
| Overlap | **head-on** along the internuclear axis (s+s, p+p, sp+sp, s+p, s+sp, p+sp) | **sideways** overlap of unhybridized p orbitals |
| Electron density | concentrated between the nuclei | two lobes above and below the axis; **none on the axis** |
| Occurs | first bond between any two atoms | 2nd and 3rd bond; **never alone**; needs leftover unhybridized p orbitals |
| Rotation | allowed | **prevents rotation** (π bond must be broken) |

**Counting rule**: single bond = 1σ; double = 1σ + 1π; triple = 1σ + 2π.

| Molecule | Hybridization | σ | π |
|---|---|---|---|
| C₂H₄ (ethene) | each C sp² (+ 1 unhybridized p) | 5 | 1 |
| CH₂O (formaldehyde) | C and O sp² | 3 | 1 |
| C₂H₂ (ethyne) / N₂ | each C (N) sp (+ 2 unhybridized p) | 3 (N₂: 1) | 2 |

- C=C: σ (sp²–sp²) + π (p–p). C≡C: σ (sp–sp) + π(pₓ–pₓ) + π(p_y–p_y).

**Your Turn (s89)**: CH₂=CH–CH=CH₂ (1,3-butadiene): 6 C–H + 3 C–C σ = **9 σ**; two C=C → **2 π**; every C is trigonal planar ⇒ **sp²**.
`,
      widgets: ['sigma-pi'],
      traps: [
        'A double bond is NOT two σ bonds: it is 1σ + 1π.',
        'Count σ bonds including every C–H; the π count is simply bond order − 1 per bond.',
        'sp² carbons keep one unhybridized p orbital (for π); sp carbons keep two.',
      ],
    },
    {
      id: 'mo-basics',
      title: 'Molecular orbital theory: bonding and antibonding MOs (H₂, He₂)',
      slides: [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109],
      md: r`
**MOT basics**: AOs of bonded atoms combine into **molecular orbitals** that belong to the **whole molecule**. **Number of MOs out = number of AOs in.**

- **Bonding MO (σ)**: AOs add with **constructive interference** (1sₐ + 1s_b). Electron density builds up **between** the nuclei. Lower in energy than the AOs, so electrons stabilise the molecule.
- **Antibonding MO (σ\*)**: AOs subtract (**destructive interference**, 1sₐ − 1s_b) giving a **node** between the nuclei. Higher in energy than the AOs, so electrons destabilise the molecule (σ lowered by the same amount that σ\* is raised).

**Rules for filling MOs**: (1) **Aufbau**, lowest energy first; (2) **Pauli**: max 2 e⁻, paired; (3) **Hund**: spread out with parallel spins over degenerate orbitals.

$$\text{Bond order} = \tfrac12\left(n_{\text{bonding}} - n_{\text{antibonding}}\right)$$

| Species | Valence e⁻ | Configuration | Bond order | Result |
|---|---|---|---|---|
| H₂ | 2 | σ₁ₛ² | 1 | stable |
| H₂ excited | 2 | σ₁ₛ¹(σ\*₁ₛ)¹ | 0 | dissociates |
| He₂ | 4 | σ₁ₛ²(σ\*₁ₛ)² | 0 | does not exist |
| He₂⁺ | 3 | σ₁ₛ²(σ\*₁ₛ)¹ | ½ | exists |
| H₂⁻ | 3 | σ₁ₛ²(σ\*₁ₛ)¹ | ½ | exists (weak) |

Bond order need **not** be an integer (odd-electron species).

**Your Turn (s109)**: H₂⁻ has 3 electrons: 2 in σ₁ₛ, 1 in σ\*₁ₛ, bond order = ½(2 − 1) = **½**.
`,
      widgets: ['mo'],
      traps: [
        'Bond order = ½(bonding − antibonding), including the halving; BO = 0 means no bond.',
        'An electron in an antibonding MO cancels a bonding electron AND adds repulsion.',
        'Number of MOs = number of AOs combined (2 AOs → 2 MOs).',
      ],
    },
    {
      id: 'mo-diatomics',
      title: 'MO diagrams of the second-row homonuclear diatomics',
      slides: [110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126],
      md: r`
**2p overlaps**: head-on gives σ₂ₚ and σ\*₂ₚ (z axis); sideways gives two π₂ₚ (x, y) and two π\*₂ₚ. 2s always lies below 2p. For Li₂ onwards the 1s² pairs fill σ₁ₛ and σ\*₁ₛ (no net bonding): **ignore the core**, use valence electrons.

**Two orderings (the slides' convention)**
- **Li₂ → N₂** (s–p mixing): π₂ₚ is **lower** than σ₂ₚ.
  σ₂ₛ < σ\*₂ₛ < **π₂ₚₓ, π₂ₚ_y < σ₂ₚz** < π\*₂ₚₓ, π\*₂ₚ_y < σ\*₂ₚz
- **O₂, F₂ and higher**: σ₂ₚ is **lower** than π₂ₚ.
  σ₂ₛ < σ\*₂ₛ < **σ₂ₚz < π₂ₚₓ, π₂ₚ_y** < π\*₂ₚₓ, π\*₂ₚ_y < σ\*₂ₚz

(B₂ being paramagnetic is the evidence that π₂ₚ is below σ₂ₚ for the early elements.)

| Molecule | Valence e⁻ | Valence MO configuration | Bond order | Magnetism |
|---|---|---|---|---|
| Li₂ | 2 | σ₂ₛ² | 1 | diamagnetic |
| Be₂ | 4 | σ₂ₛ²σ\*₂ₛ² | 0 | does not form |
| B₂ | 6 | …π₂ₚₓ¹π₂ₚ_y¹ | 1 | **paramagnetic** (2 unpaired) |
| C₂ | 8 | …π₂ₚₓ²π₂ₚ_y² | 2 | diamagnetic |
| N₂ | 10 | …π₂ₚ⁴σ₂ₚ² | 3 | diamagnetic |
| O₂ | 12 | …σ₂ₚ²π₂ₚ⁴(π\*₂ₚₓ)¹(π\*₂ₚ_y)¹ | 2 | **paramagnetic** (2 unpaired) |
| F₂ | 14 | …(π\*₂ₚ)⁴ | 1 | diamagnetic |
| Ne₂ | 16 | all filled | 0 | does not form |

- Bond order from the slides: Li₂ (2−0)/2; B₂ (4−2)/2; C₂ (6−2)/2; N₂ (8−2)/2; O₂ (8−4)/2; F₂ (8−6)/2; Ne₂ (8−8)/2.
- **Paramagnetic** = ≥ 1 unpaired electron (attracted to a magnetic field); **diamagnetic** = all paired.
- MOT explains **O₂ paramagnetism**, which Lewis structures (O=O, all paired) cannot.
`,
      widgets: ['mo'],
      traps: [
        'Know which ordering applies: B₂, C₂, N₂ use π below σ; O₂, F₂ use σ below π (and the slides apply the O₂-type ordering to NO).',
        'O₂ is paramagnetic with 2 unpaired electrons in the degenerate π\*₂ₚ pair (Hund), even though Lewis says all paired.',
        'B₂ is paramagnetic; C₂ is diamagnetic with bond order 2 and NO σ bond contribution (both bonds are π).',
        'Count only valence electrons (the 1s core cancels).',
      ],
    },
    {
      id: 'mo-hetero',
      title: 'Heteronuclear diatomics, NO/NO⁺/NO⁻ and ions of O₂',
      slides: [127, 128, 129, 130, 131, 132, 133, 134, 135],
      md: r`
**Which ordering for heteronuclear diatomics?** Elements left of N (B, C): π₂ₚ below σ₂ₚ. Elements right of N (O, F): σ₂ₚ below π₂ₚ. For NF, each is one away from O, so the O₂-type order is used.

| Molecule | Valence e⁻ | Bond order |
|---|---|---|
| BC | 3 + 4 = 7 | (5 − 2)/2 = 1.5 |
| NF | 5 + 7 = 12 | (8 − 4)/2 = 2 |
| NO | 5 + 6 = 11 | (8 − 3)/2 = 2.5 (1 unpaired e⁻ in π\*) |
| NO⁺ | 10 | (8 − 2)/2 = 3 |
| NO⁻ | 12 | (8 − 4)/2 = 2 |

**Stability of NO, NO⁺, NO⁻ (slide 131)**: bond order ↑ ⇒ bond length ↓ ⇒ bond energy ↑.

| Species | Bond order | Length (pm) | Bond energy (kJ/mol) |
|---|---|---|---|
| NO⁺ | 3 | 106 | 1025 |
| NO | 2.5 | 115 | 630 |
| NO⁻ | 2 | 130 | 400 |

NO⁺ is the most stable form (highest bond order, shortest, strongest bond). The slides draw NO with the σ₂ₚ-below-π₂ₚ order; the bond order is the same either way.

**Ions of O₂ (Your Turn s132)**

| Species | Valence e⁻ | Bond order | Unpaired e⁻ |
|---|---|---|---|
| O₂⁺ | 11 | (8 − 3)/2 = 2.5 | 1 |
| O₂ | 12 | (8 − 4)/2 = 2 | 2 |
| O₂⁻ | 13 | (8 − 5)/2 = 1.5 | 1 |
| O₂²⁻ | 14 | (8 − 6)/2 = 1 | 0 |

Answer to the slide: bond orders 2, 2½, 1½ (O₂, O₂⁺, O₂⁻) with 2, 1, 1 unpaired electrons.

**Your Turn (s135)**: which species is paramagnetic? The slide lists N₂, F₂(?), O₂²⁻, N₂²⁺, O₂²⁺ (the charge/subscript on option B is unreadable in the slide image). Check each by valence-electron count: N₂ (10 e⁻), O₂²⁻ (14 e⁻), N₂²⁺ (8 e⁻) and O₂²⁺ (10 e⁻) all have every electron paired, so they are **diamagnetic**. Neutral F₂ (14 e⁻) is also diamagnetic. So the paramagnetic answer must be option B, taken here as F₂⁺ (13 e⁻, one unpaired electron in π\*₂ₚ). General rule: odd electron count, or O₂/B₂-type filling of a degenerate pair, ⇒ paramagnetic.

**VBT vs MOT**: neither is complete. MOT correctly predicts O₂ paramagnetism (VBT/Lewis do not) and handles resonance well, but is harder; MOT also explains why noble gases do not bond (Ne₂ BO = 0).
`,
      widgets: ['mo'],
      traps: [
        'Adding an electron to O₂ lowers bond order (goes into π\*); removing one raises it: O₂⁺ is stronger and shorter than O₂.',
        'Isoelectronic species have the same MO configuration: CO, CN⁻, NO⁺, N₂ all have bond order 3.',
        'Count unpaired electrons using Hund: degenerate π\* orbitals each get one electron first.',
      ],
    },
    {
      id: 'delocalized-mo',
      title: 'Delocalised MOs: formate and benzene',
      slides: [136, 137, 138, 139, 140, 141, 142],
      md: r`
MOT handles **resonance** naturally via **delocalised π MOs**.

**Formate HCOO⁻**
- C: 3 domains → sp², trigonal planar. Each O: 3 domains (1 bond + 2 lone pairs) → sp².
- Left over: one **unhybridized p orbital** on each of C, O, O, perpendicular to the plane.
- Lewis needs 2 structures (O=C–O⁻ ↔ ⁻O–C=O). MOT: 3 p orbitals → **3 π MOs**: 1 bonding, 1 nonbonding, 1 antibonding.
- **4 electrons**: 2 in the π bonding MO, 2 in the π nonbonding MO. The bonding MO spreads over all 3 atoms: this is the resonance hybrid.

**Benzene C₆H₆**
- 6 C each sp² (3 σ bonds); each has 1 unhybridized p orbital, so **6 π MOs: 3 bonding + 3 antibonding**.
- 3 electron pairs delocalised over 6 carbons (3 π bonds' worth); the extra stability = **delocalisation (resonance) energy** ≈ 146 kJ/mol.

**Your Turn (s142)**: which species exhibits resonance? **SO₂** (O=S–O ↔ O–S=O). H₂O, ethene, propene and cyclohexane have no alternative placement of π electrons.
`,
      traps: [
        'Delocalised ≠ electrons hopping: the bonding π MO extends over all atoms at once.',
        'Benzene has 6 π electrons (3 bonding MOs filled), not 12.',
      ],
    },
  ],
}
