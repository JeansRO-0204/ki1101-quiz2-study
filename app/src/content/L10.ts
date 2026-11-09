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

**How to find the lone pairs on the central atom** (from the Lewis structure)
1. Total valence e⁻ (add 1 per negative charge, subtract 1 per positive charge).
2. Subtract 2 e⁻ for each bond to the central atom, then give every outer atom its octet (H gets 2).
3. Whatever is left sits on the central atom, as pairs.

*Worked (I₃⁻, s11)*: 3 × 7 + 1 = 22 e⁻. Two I–I bonds use 4 → 18. Each outer I takes 6 → 18 − 12 = **6 e⁻ = 3 lone pairs on the central I**. Domains = 2 + 3 = **5**, trigonal bipyramidal.

**Learning Check (s11)**: NH₃ → 4 domains, tetrahedral; H₂O → 4 domains, tetrahedral; I₃⁻ → 5 domains (2 bonding + 3 lone pairs on the central I), trigonal bipyramidal.
**Your Turn (s12)**: SF₄O has 4 F + 1 O on S, no lone pair on S (S=O counts as one domain): **5 domains, trigonal bipyramid**.
`,
      essentials: [
        'Electron domains on the central atom = **bonded atoms + lone pairs**. A double or triple bond is **one** domain.',
        '2, 3, 4, 5, 6 domains → **linear (180°), trigonal planar (120°), tetrahedral (109.5°), trigonal bipyramidal (90°/120°), octahedral (90°)**.',
        'Lone pairs (and a single unpaired electron) **count as domains** and take more room than bond pairs.',
        'Electron-domain geometry uses **all** domains; the molecular shape is named from the **atoms only**.',
      ],
      formulas: [
        {
          name: 'Number of electron domains (steric number)',
          tex: r`\text{domains} = m + n \quad (\text{AX}_m\text{E}_n)`,
          where: 'm = number of atoms bonded to the central atom A (each single, double or triple bond counts once); n = number of lone pairs (E) on A. The AXₘEₙ notation is from the summary deck, not the slides; the slides say "bonding domains" and "nonbonding domains".',
        },
      ],
      widgets: ['vsepr'],
      traps: [
        'A double or triple bond is ONE domain: CO₂ has 2 domains (linear), not 4.',
        'Lone pairs ARE domains: H₂O has 4 domains (tetrahedral electron geometry) even though its shape is bent.',
        'Electron-pair geometry (all domains) ≠ molecular geometry (atoms only).',
      ],
    },
    {
      id: 'vsepr-master',
      title: 'VSEPR master table: every shape at a glance (AXₘEₙ)',
      slides: [16, 17, 18, 20, 22, 23, 24],
      md: r`
**Notation**: **A** = central atom, **X** = bonded atom, **E** = lone pair on A. H₂O is AX₂E₂ (4 domains). Hybridisation follows from the **total** number of domains.

| Domains | Electron-domain geometry | Bonding (X) | Lone pairs (E) | Type | Molecular shape | Ideal angle | Example | Hybridisation |
|---|---|---|---|---|---|---|---|---|
| 2 | linear | 2 | 0 | AX₂ | linear | 180° | CO₂, BeH₂ | sp |
| 3 | trigonal planar | 3 | 0 | AX₃ | trigonal planar | 120° | BCl₃ | sp² |
| 3 | trigonal planar | 2 | 1 | AX₂E | bent (V-shaped) | < 120° | SO₂ | sp² |
| 4 | tetrahedral | 4 | 0 | AX₄ | tetrahedral | 109.5° | CH₄ | sp³ |
| 4 | tetrahedral | 3 | 1 | AX₃E | trigonal pyramidal | < 109.5° (107°) | NH₃ | sp³ |
| 4 | tetrahedral | 2 | 2 | AX₂E₂ | bent (V-shaped) | < 109.5° (104.5°) | H₂O | sp³ |
| 5 | trigonal bipyramidal | 5 | 0 | AX₅ | trigonal bipyramidal | 90° (ax–eq), 120° (eq–eq) | PF₅, PCl₅ | sp³d |
| 5 | trigonal bipyramidal | 4 | 1 | AX₄E | seesaw (distorted tetrahedron, sawhorse) | ax–eq < 90° | SF₄ | sp³d |
| 5 | trigonal bipyramidal | 3 | 2 | AX₃E₂ | T-shaped | 90° | ClF₃ | sp³d |
| 5 | trigonal bipyramidal | 2 | 3 | AX₂E₃ | linear | 180° | XeF₂, I₃⁻ | sp³d |
| 6 | octahedral | 6 | 0 | AX₆ | octahedral | 90° | SF₆ | sp³d² |
| 6 | octahedral | 5 | 1 | AX₅E | square pyramidal | < 90° | BrF₅, ICl₅ | sp³d² |
| 6 | octahedral | 4 | 2 | AX₄E₂ | square planar | 90° | XeF₄ | sp³d² |

**How to use it** (4 steps, s15–s16)
1. Lewis structure → count X (atoms on A) and E (lone pairs on A).
2. X + E = domains → **row group** → electron-domain geometry and hybridisation.
3. Place the lone pairs: **5 domains → equatorial**; **6 domains → the second lone pair opposite the first (axial)**.
4. Name the shape from the atoms only.

*Worked (XeF₄, s24)*: 8 + 4 × 7 = 36 e⁻. 4 Xe–F bonds use 8, the F atoms take 24, so 4 e⁻ = **2 lone pairs on Xe**. AX₄E₂ → 6 domains, octahedral domain geometry, lone pairs opposite each other → **square planar, 90°, sp³d²**.

*Worked (ClF₃, s22)*: 7 + 21 = 28 e⁻. 3 bonds (6) + 18 on F leaves 4 = **2 lone pairs**. AX₃E₂ → 5 domains, both lone pairs equatorial → **T-shaped, sp³d**.

(AX₃E₃ and AX₂E₄ would be T-shaped and linear from 6 domains, but no stable examples exist: general knowledge from the summary deck, not on the slides.)
`,
      essentials: [
        'Learn the table by **row group**: total domains fix the electron geometry **and** the hybridisation (2 sp, 3 sp², 4 sp³, 5 sp³d, 6 sp³d²).',
        'Lone pairs **squeeze** the angles: CH₄ 109.5° > NH₃ 107° > H₂O 104.5°.',
        'Shapes from 5 domains: **trigonal bipyramidal → seesaw → T-shaped → linear** as lone pairs go 0 → 3 (all equatorial).',
        'Shapes from 6 domains: **octahedral → square pyramidal → square planar** (two lone pairs opposite).',
        'Two "linear" cases: AX₂ (CO₂, sp) and AX₂E₃ (XeF₂, I₃⁻, sp³d). Two "bent" cases: AX₂E (SO₂) and AX₂E₂ (H₂O).',
      ],
      figures: ['l10-vsepr-2-4', 'l10-vsepr-5-6'],
      widgets: ['vsepr'],
      traps: [
        'XeF₂ and I₃⁻ are linear but have 5 domains (sp³d), not 2.',
        'The hybridisation comes from the total domain count, so H₂O is sp³ (AX₂E₂), not sp.',
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

*Worked (SO₂, s17)*: 6 + 2 × 6 = 18 e⁻. Draw O=S–O (one resonance form is enough). S has 2 bonded atoms + 1 lone pair = 3 domains → trigonal planar domain geometry → **bent, < 120°**.
`,
      essentials: [
        '3 domains: AX₃ trigonal planar 120° (BCl₃); AX₂E bent < 120° (SO₂).',
        '4 domains: AX₄ tetrahedral 109.5° (CH₄); AX₃E trigonal pyramidal 107° (NH₃); AX₂E₂ bent 104.5° (H₂O).',
        'Each extra lone pair shrinks the bond angle a little more.',
      ],
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
**Trigonal bipyramid** (s19): 2 **axial** positions (90° to the equatorial plane) and 3 **equatorial** positions (120° apart). Equatorial positions have more room, so **with 5 domains lone pairs go equatorial** ("substitute here first").

**Why equatorial?** (s21) A lone pair is held by only one nucleus, so it is fatter and repels more than a bond pair. Repulsion at 90° is much stronger than at 120°, so count the 90° neighbours:
- **Axial** position: 3 neighbours at 90° (all three equatorial domains).
- **Equatorial** position: only 2 neighbours at 90° (the two axial domains); the other two are 120° away.

Fewer 90° contacts means less repulsion, so lone pairs take the equatorial positions. The lone pair then pushes the bonds out of the way: SF₄ becomes a **distorted tetrahedron (seesaw)** with ax–eq angles < 90°. (The ranking lone pair–lone pair > lone pair–bond pair > bond pair–bond pair is general VSEPR knowledge; the slides say "lone pairs require more space".)

**Octahedron**: all 6 positions are equivalent, so the first lone pair can go anywhere (call it axial). A second lone pair goes **opposite** the first (180°), the arrangement with no 90° lone pair–lone pair contact. That is why AX₄E₂ is square planar.

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
      essentials: [
        '5 domains (sp³d): AX₅ trigonal bipyramidal (PF₅) · AX₄E **seesaw** (SF₄) · AX₃E₂ **T-shaped** (ClF₃) · AX₂E₃ **linear** (XeF₂, I₃⁻).',
        'In a trigonal bipyramid, lone pairs go **equatorial**: 2 neighbours at 90° instead of 3.',
        '6 domains (sp³d²): AX₆ octahedral (SF₆) · AX₅E **square pyramidal** (BrF₅) · AX₄E₂ **square planar** (XeF₄, lone pairs opposite).',
      ],
      figures: ['l10-tbp-lone-pair'],
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

**Procedure: polar or nonpolar?**
1. **Lewis structure → VSEPR shape** (domains, lone pairs, 3D shape). Getting the shape wrong is the usual error.
2. **Any polar bonds?** Compare EN across each bond (slide scale). If every ΔEN = 0, the molecule is nonpolar; stop.
3. **Draw the bond dipoles** as crossed arrows, head at the more electronegative (δ⁻) atom.
4. **Add them as vectors.** Ask: is the shape symmetric **and** are all outer atoms identical **and** are the lone pairs (if any) placed symmetrically? Yes to all → dipoles cancel → **nonpolar**. Otherwise → **polar**.

*Worked*: CO₂: C=O dipoles (ΔEN = 3.5 − 2.5 = 1.0) point in opposite directions at 180° and cancel → nonpolar. H₂O: AX₂E₂ is bent, the two O–H dipoles (3.5 − 2.1 = 1.4) both point up towards O and add → polar. CH₃Cl: tetrahedral, but one outer atom differs → polar.

**Nonpolar** if
- all domains on the central atom are bonding pairs **and** all terminal atoms are identical: CO₂, BCl₃, CH₄, PF₅, SF₆ (symmetric shapes);
- or lone pairs are **symmetrically placed** around the central atom: XeF₄ (square planar, lone pairs opposite) and XeF₂ (linear, three equatorial lone pairs). ClF₃ (T-shaped) is NOT symmetric and is polar.

**Usually polar** if
- terminal atoms differ (CH₃Cl, HCN, BClF₂), **or**
- the central atom has one or more lone pairs not symmetric: H₂O, NH₃, SO₂, SF₄, ClF₃.

**Your Turn (s39)**: BClF₂ (trigonal planar but different terminal atoms) and OF₂ (bent) are **polar**; NH₄⁺ (tetrahedral), NO₃⁻ (trigonal planar) and C₂H₂ (linear) are symmetric, hence nonpolar. The question lists "which is polar": A and B both qualify.
`,
      essentials: [
        'Polarity = **vector sum of bond dipoles**. Polar bonds are needed, but they can cancel.',
        '**Nonpolar**: no lone pair on the central atom + identical outer atoms (CO₂, BCl₃, CH₄, PF₅, SF₆), or lone pairs placed symmetrically (XeF₂, XeF₄).',
        '**Polar**: a lone pair that breaks the symmetry (H₂O, NH₃, SO₂, SF₄, ClF₃, BrF₅) or different outer atoms (CH₃Cl, HCN, CHCl₃).',
      ],
      formulas: [
        {
          name: 'Bond polarity',
          tex: r`\Delta EN = \lvert EN_A - EN_B \rvert`,
          where: 'EN from the slides’ scale (H 2.1, B 2.0, C 2.5, N 3.1, O 3.5, F 4.1, Cl 2.9; L8 s33). ΔEN > 0 gives a bond dipole pointing to the more electronegative atom.',
        },
      ],
      figures: ['l10-polarity'],
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
      essentials: [
        'VBT: a bond = **overlap of one orbital from each atom**, holding **2 electrons of opposite spin**.',
        'Pure AO overlap predicts 90° bonds (works for H₂S, 92°) but **fails for CH₄** (109.5°, four equal bonds) → hybridization.',
        'MOT instead builds orbitals over the **whole molecule** (later sections).',
      ],
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

**How to assign the hybridization of any atom** (central or not)
1. Lewis structure → count domains on **that atom** (bonded atoms + lone pairs; a multiple bond counts once).
2. Read off: 2 → sp, 3 → sp², 4 → sp³, 5 → sp³d, 6 → sp³d².
3. Leftover p orbitals (sp: 2, sp²: 1, sp³: 0) are what form π bonds.

*Worked (s66)*: O in OCl₂: 2 bonded Cl + 2 lone pairs = 4 domains → **sp³** (bent, like H₂O).
`,
      essentials: [
        'Hybridization = mixing AOs **on one atom**. **Number of hybrids = number of AOs mixed = number of domains.**',
        'Domains → hybrid: **2 sp (180°) · 3 sp² (120°) · 4 sp³ (109.5°) · 5 sp³d · 6 sp³d²**.',
        'Hybrids hold the **σ bonds and lone pairs**; π bonds use the leftover **unhybridized p** orbitals.',
        'Energetics: promote (e.g. Be 2s² → 2s¹2p¹) then hybridize to get equal half-filled orbitals.',
      ],
      formulas: [
        {
          name: 'Conservation of orbitals',
          tex: r`n_{\text{hybrid orbitals}} = n_{\text{AOs mixed}} = \text{domains on the atom}`,
          where: 'sp = s + 1p (2 hybrids); sp² = s + 2p (3); sp³ = s + 3p (4); sp³d = s + 3p + 1d (5); sp³d² = s + 3p + 2d (6). The superscripts count the p and d orbitals used.',
        },
      ],
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
      essentials: [
        '**Lone pairs sit in hybrid orbitals**: NH₃ and H₂O are sp³ (angles 107°, 104.5°).',
        'Expanded octet (5 or 6 domains) needs d orbitals: **sp³d** or **sp³d²**, only for **period 3 and below**.',
        'Coordinate bond in VBT = a **full** orbital overlapping an **empty** one (BF₃ + F⁻ → BF₄⁻, B sp² → sp³).',
      ],
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

**How to count σ and π bonds**
1. Draw the full Lewis structure (every H shown).
2. **σ = number of bonded atom pairs** (every line between two atoms counts one σ, whatever the bond order).
3. **π = extra lines**: +1 for each double bond, +2 for each triple bond.

*Worked (HCN)*: H–C≡N. Two atom pairs → **2 σ**; one triple bond → **2 π**. C has 2 domains → sp.

**Your Turn (s89)**: CH₂=CH–CH=CH₂ (1,3-butadiene): 6 C–H + 3 C–C σ = **9 σ**; two C=C → **2 π**; every C is trigonal planar ⇒ **sp²**.
`,
      essentials: [
        'Single = **1σ**; double = **1σ + 1π**; triple = **1σ + 2π**.',
        'σ = **head-on** overlap, density on the axis, free rotation. π = **sideways** p–p overlap, density above/below, **blocks rotation**.',
        'π bonds need unhybridized p orbitals: an sp² atom forms at most 1 π, an sp atom 2.',
      ],
      formulas: [
        {
          name: 'Counting σ and π bonds',
          tex: r`n_\sigma = \text{number of bonded atom pairs},\qquad n_\pi = n_{\text{double}} + 2\,n_{\text{triple}}`,
          where: 'Count over the whole molecule. Example C₂H₄: 5 bonded pairs (4 C–H + 1 C–C) → 5σ; 1 double bond → 1π.',
        },
      ],
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
      figures: ['l10-mo-h2-he2'],
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
      figures: ['l10-mo-li2-n2', 'l10-mo-o2-ne2'],
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
      figures: ['l10-mo-no'],
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
