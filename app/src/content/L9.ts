// Learn content for L9. Owned by the content agent. Markdown + KaTeX; cite slides via `slides`.
import type { Lecture } from '../types'

const r = String.raw

export const lecture: Lecture = {
  id: 'L9',
  title: 'Molecular Structure',
  summary:
    'How atoms share electrons: Lewis symbols, covalent bonds and bond energies, the step-by-step method for drawing Lewis structures (octet exceptions included), bond order / length / energy, formal charge as the tie-breaker, resonance and delocalisation, and coordinate covalent bonds.',
  sections: [
    {
      id: 'lewis-symbols',
      title: 'Lewis symbols and ionic electron bookkeeping',
      slides: [2, 3, 4],
      md: r`
A **Lewis symbol** is the element symbol surrounded by one dot per **valence electron**: an electron-bookkeeping method.

| Group | IA | IIA | IIIA | IVA | VA | VIA | VIIA | VIIIA |
|---|---|---|---|---|---|---|---|---|
| Valence e⁻ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| Configuration | $ns^1$ | $ns^2$ | $ns^2np^1$ | $ns^2np^2$ | $ns^2np^3$ | $ns^2np^4$ | $ns^2np^5$ | $ns^2np^6$ |

- For the **representative elements: group number = number of valence electrons** (He is the exception: 2).
- Dots are placed singly first (one on each side), then paired.
- Lewis symbols diagram electron transfer in ionic bonding:
  - Na· + ·Cl: → Na⁺ + [:Cl:]⁻
  - Mg: + ·O: → Mg²⁺ + [:O:]²⁻ (two electrons move from Mg to O)
`,
      traps: [
        'Transition metals do not follow "group number = valence electrons"; this rule is for representative (s- and p-block) elements.',
        'The ion in brackets shows the NEW octet: the cation has lost its valence dots, the anion has 8.',
      ],
    },
    {
      id: 'covalent-bond',
      title: 'The covalent bond, bond energy and ΔH from bond energies',
      slides: [5, 6, 7, 8, 9, 10, 11, 12],
      md: r`
**Covalent compounds**: individual separate molecules, atoms bound by *sharing* electrons, do not conduct electricity, often low melting point.

**Why do 2 H atoms bond?** The valence electron of one atom is attracted by the nucleus of the other. As the nuclei approach, electron density shifts between them (attraction) but the nuclei also begin to repel. The bond length is the distance where attraction and repulsion balance: **net attraction, so the bond forms** (potential energy minimum).

- In H₂ each 1s orbital is "filled" by sharing; the two electrons share the same region so their spins must be paired (↑↓): an **electron-pair bond**.

**Two quantities characterise a bond**
- **Bond length**: distance between the two nuclei ($r_A + r_B$).
- **Bond energy / strength**: energy released when the bond forms, or energy that must be put in to break it.

**Bond dissociation energy $D$**: energy needed to break one mole of bonds in a covalent molecule in the gas phase. $D$ varies with bond type (single, double, triple) and atoms involved, and is **always positive**.

$$\Delta H^\circ_{rxn} = \sum D(\text{bonds broken}) - \sum D(\text{bonds formed})$$

| Bond | D (kJ/mol) | Bond | D (kJ/mol) |
|---|---|---|---|
| C–C | 348 | C–Br | 276 |
| C=C | 612 | C–I | 238 |
| C≡C | 960 | H–H | 436 |
| C–H | 412 | H–F | 565 |
| C–N | 305 | H–Cl | 431 |
| C=N | 613 | H–Br | 366 |
| C≡N | 890 | H–I | 299 |
| C–O | 360 | H–N | 388 |
| C=O | 743 | H–O | 463 |
| C–F | 484 | H–S | 338 |
| C–Cl | 338 | H–Si | 376 |

**Worked example**: C₂H₄ + H₂ → C₂H₆. Broken: C=C (612) + H–H (436) = 1048. Formed: C–C (348) + 2 C–H (824) = 1172. $\Delta H = 1048 - 1172 = -124$ kJ/mol (exothermic).

**Your Turn (slide 12)**: the most likely covalent species is **CO** (two nonmetals). CsCl, NaF, CaF₂, MgBr₂ all pair a metal with a nonmetal, so they are ionic.
`,
      traps: [
        'ΔH = bonds BROKEN minus bonds FORMED (the opposite order from "products minus reactants" thinking). Breaking costs energy (+), forming releases it.',
        'D is always positive: it is the energy to break a bond, never negative.',
        'Metal + nonmetal = ionic (CsCl, NaF, CaF₂, MgBr₂); two nonmetals = covalent.',
      ],
    },
    {
      id: 'octet-multiple',
      title: 'Octet rule, lone pairs and multiple bonds',
      slides: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
      md: r`
**Octet rule**: when atoms form covalent bonds they share enough electrons to reach an outer shell of 8 ($ns^2np^6$, noble-gas configuration). **Exception: H**, which is complete with 2 electrons.

- A shared pair is drawn as a line; electron pairs not in a bond are **lone pairs**.
- Diatomic gases: H₂ (one shared pair), F₂ (1 bond + 3 lone pairs per F), HF. Halogens need only **one** electron, so they form one bond.

**Bonds formed = electrons needed to reach the octet**

| Atom | Needs | Bonds | Example |
|---|---|---|---|
| C | 4 e⁻ | 4 | CH₄ |
| N | 3 e⁻ | 3 | NH₃ |
| O | 2 e⁻ | 2 | H₂O |
| F, Cl, Br, I | 1 e⁻ | 1 | HF |

**Multiple bonds**: sharing 2 pairs (double, e.g. O=C=O) or 3 pairs (triple, e.g. N≡N) between the same two atoms.

**Your Turn (s18)**: N has 5 valence e⁻, needs **3** more to complete the octet in N₂: it forms a triple bond.
**Your Turn (s22)**: **CO** is the species most likely to have multiple bonds; C needs 4 and O needs 2 and there are too few atoms to supply single partners (C≡O). H₂O, PH₃, CH₄ have all octets from single bonds with H; BF₃ is electron-deficient and stays single-bonded.
`,
      traps: [
        'N₂ needs 3 electrons per N (triple bond), not 2 or 1.',
        'H is satisfied with 2 electrons, never 8.',
      ],
    },
    {
      id: 'carbon-compounds',
      title: 'Carbon compounds and functional groups',
      slides: [23, 24, 25, 26, 27, 28, 29, 30],
      md: r`
C forms 4 bonds in many arrangements, hence the huge variety of carbon compounds. **Functional groups** are groups of atoms with similar bonding.

| Family | Feature | Examples |
|---|---|---|
| Alkanes | only single bonds | CH₄ methane, C₂H₆ ethane, C₃H₈ propane |
| Alkenes | ≥ 1 C=C | ethene (ethylene), butene |
| Alkynes | ≥ 1 C≡C | ethyne (acetylene), butyne |
| Alcohols | replace H with –OH | methanol, ethanol |
| Ketones | replace CH₂ with C=O (carbonyl) | acetone |
| Aldehydes | at least one atom on the C=O carbon is H | acetaldehyde |
| Carboxylic acids | –COOH | acetic acid |
| Esters | alkyl replaces the H of the acid | methyl acetate |
| Amines | NH₃ with H replaced by alkyl | methylamine, dimethylamine |
| Amides | –NH₂ on a carbonyl carbon chain | acetamide |

**Isomers**: same molecular formula, different connectivity, different physical properties (butane vs iso-butane).

**Your Turn (s30)**: butanol, C₄H₉OH, has **4** isomers: 1-butanol, 2-butanol, 2-methyl-1-propanol (isobutanol) and 2-methyl-2-propanol (tert-butanol).
`,
      traps: [
        'Isomers share a formula but NOT connectivity or properties.',
        'The carbonyl group C=O appears in aldehydes, ketones, carboxylic acids, esters and amides.',
      ],
    },
    {
      id: 'lewis-method',
      title: 'Method for drawing Lewis structures',
      slides: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42],
      md: r`
**Octet exceptions** (slide 32)
- Rigorous for 2nd-row C, N, O, F: **never more than 8 e⁻**.
- **B and Be** can have **less than an octet** (BeCl₂, BCl₃).
- **3rd row and below** often **exceed** the octet (n = 3 has d orbitals; up to 18 e⁻).

**The method**
1. **Skeleton**: decide how atoms are bonded. Central atom is usually written first / least electronegative (H and halogens are terminal).
2. **Count all valence electrons** (add for negative charge, subtract for positive).
3. Place **2 e⁻ between each pair** of bonded atoms (single bonds).
4. Complete octets of **terminal atoms** with lone pairs.
5. Put any remaining e⁻ on the **central atom** in pairs.
6. If the central atom lacks an octet, **move lone pairs from terminal atoms** to form double (then triple) bonds.

**Worked examples from the slides**

| Species | Valence e⁻ | Result |
|---|---|---|
| N₂F₂ | 2(5)+2(7) = 24 | F–N=N–F: 3 single bonds (6 e⁻) + 12 e⁻ on F leave 6 for the N's, not enough for two octets, so an N=N double bond is needed |
| SiF₄ | 4+28 = 32 | 4 single bonds, 3 lp per F, 0 left |
| H₂CO₃ | 4+18+2 = 24 | C central, H on two O's; C has only 6 e⁻ so one O forms C=O |
| PCl₅ | 5+35 = 40 | P has **10 e⁻**: expanded octet allowed (3rd row) |
| BBr₃ | 3+21 = 24 | B has only **6 e⁻**: incomplete octet, no double bond |
| CO₂ | 4+12 = 16 | C has only 4 e⁻ after single bonds, so 2 extra bonds are needed; O=C=O, O–C≡O and O≡C–O all give C an octet, so formal charge decides (O=C=O) |

**Tips for exam**
- Oxoanions/oxoacids: central atom surrounded by O; acid H's go on O.
- Total electrons = valence sum ± charge. Check: bonds×2 + lone-pair e⁻ = total.
`,
      widgets: ['lewis'],
      traps: [
        'Forgetting to add electrons for a negative charge (or remove for positive).',
        'Using more than 8 e⁻ on a second-row atom (N, O, C, F): only period 3 and below can expand.',
        'Putting leftover electrons on terminal atoms instead of the central atom (step 5).',
        'Forcing a double bond on B in BBr₃/BCl₃: boron stays electron-deficient (all formal charges are 0).',
      ],
    },
    {
      id: 'bond-properties',
      title: 'Bond order, bond length and bond energy',
      slides: [43, 44, 45, 46, 47, 48],
      md: r`
- **Bond order** = number of electron pairs shared between 2 atoms (measure of electron density in the bond). Single 1, double 2, triple 3.
- **Bond length**: distance between nuclei.
- **Bond energy**: energy to separate bonded atoms into neutral particles.

**Higher bond order ⇒ more electron density ⇒ nuclei held more tightly ⇒ larger D, shorter bond length** (compare bonds between the *same two elements*).

| Bond | Order | D (kJ/mol) |
|---|---|---|
| C–C | 1 | 348 |
| C=C | 2 | 612 |
| C≡C | 3 | 960 |

**Experiment decides between candidate structures (H₂SO₄)**
- X-ray data: S–O bonds with no H attached are **shorter (142 pm)**; S–O(H) are **longer (157 pm)**.
- So two S–O bonds are different from the other two: the structure with **S=O to the two O's without H** is correct, even though it "violates" the octet rule. S is period 3 so it may expand.

**Your Turn (s44)**: in the drawn O–N–O structure N has 8 electrons (2 bonds + 2 lone pairs) and the total is 4 + 6 + 4 + 4 = 18 e⁻, one more than NO₂ (17). Intended answer: **too many total electrons**. (The right-hand O has only 6 e⁻ in the drawing: its octet is not complete either.)
`,
      widgets: ['bond-props'],
      traps: [
        'Bond order, bond energy increase together; bond length goes the opposite way.',
        'The trend only compares bonds between the same two elements (C=O vs C–O, not C=O vs N–O).',
      ],
    },
    {
      id: 'formal-charge',
      title: 'Formal charge: choosing the best Lewis structure',
      slides: [49, 50, 51, 52, 53, 54, 55],
      md: r`
**Formal charge (FC)** is a bookkeeping method: the apparent charge on an atom if electrons in every bond were shared equally. It does **not** represent real charges.

$$FC = (\#\text{valence } e^-) - (\#\text{lone-pair } e^-) - \tfrac{1}{2}(\#\text{bonding } e^-)$$

Equivalent form used on the slides: $FC = \#\text{valence } e^- - [\#\text{bonds to the atom} + \#\text{unshared } e^-]$.

The sum of formal charges = the overall charge of the species.

**Rules for the most stable (preferred) structure**
1. The **fewest / smallest** formal charges are best (ideally all 0).
2. All $|FC| \le 1$.
3. Any negative FC should sit on the **most electronegative** atom.

**Slide examples**
- **H₂SO₄**: structure 1 (all single bonds): FC(S) = 6 − (4+0) = **+2**, FC(O, single) = 6 − (1+6) = −1. Structure 2 (two S=O): FC(S) = 6 − (6+0) = 0, every atom 0. Structure 2 is preferred.
- **BCl₃**: FC(B) = 3 − 0 − 3 = 0, FC(Cl) = 7 − 6 − 1 = 0, so no need for a double bond.
- **CO₂**: O=C=O all 0 (best). O–C≡O: O = −1, O(triple) = 6 − (3+2) = **+1**. Worse.

**Your Turn (s55)**: XeO₄ with 4 single bonds: FC(Xe) = 8 − 4 = **+4**. With two double and two single bonds (bonds = 6): FC = 8 − 6 = **+2**. Answer D (+4, +2). Four double bonds would give 0.
`,
      widgets: ['lewis'],
      traps: [
        'Formal charge ≠ oxidation state ≠ real charge. Count shared electrons as half each.',
        'Lone-pair electrons are counted individually (a lone pair = 2), bonds are counted once each in the "bonds + unshared" form.',
        'The expanded-octet structure with all FC = 0 is preferred to the octet structure with +2/−1 charges for period-3 central atoms (H₂SO₄, XeO₄).',
      ],
    },
    {
      id: 'resonance',
      title: 'Resonance and delocalisation',
      slides: [56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67],
      md: r`
**When one Lewis structure fails**: NO₃⁻ has 24 e⁻ and a single structure predicts one short N=O and two longer N–O bonds, but experiment shows **all 3 N–O bonds equal** and shorter than a single bond.

- **Resonance structures**: multiple valid Lewis structures for one species; none is correct alone. The real species is a **resonance hybrid** (average), drawn with a double-headed arrow ↔.
- Electrons are **delocalised** (smeared over several atoms). Only **electrons** move, never nuclei.
- **Averaged bond order** = (total bonds in one structure) / (number of equivalent positions):
  - NO₃⁻: (1+1+2)/3 = **1.33** per N–O.
  - CO₃²⁻: **1.33** per C–O (formal charge −1 on single-bonded O, 0 on the C=O).
  - O₃, NO₂⁻: 1.5. Benzene C–C: 1.5.

**Rules for good resonance contributors (slide 62–63)**
1. All octets satisfied; 2. as many bonds as possible; 3. |FC| ≤ 1 with negative on the more electronegative atom; 4. as little charge separation as possible.
- Must be valid Lewis structures; only electrons shift (usually a π bond and a lone pair); same number of unpaired electrons; nuclei fixed.

**NCO⁻ (16 e⁻), slide 64–65**: three candidate structures, compared by formal charge:
- [N≡C–O]⁻: FC(N) = 5−2−3 = 0, FC(C) = 0, FC(O) = 6−6−1 = **−1**: **best** (negative charge on the most electronegative atom).
- [N=C=O]⁻: FC(N) = 5−4−2 = **−1**, FC(C) = 0, FC(O) = 0: **OK**.
- [N–C≡O]⁻: FC(N) = 5−6−1 = **−2**, FC(O) = 6−2−3 = **+1**: **not acceptable**.

**Resonance stabilisation**: the real structure is more stable than any single contributor; for benzene the extra stability (resonance energy) is about **146 kJ/mol**.

**Your Turn (s67)**: NO₂, N₃⁻ and N₂O (N central) all exhibit resonance; H₂O and CH₃CH₂CH do not.
`,
      widgets: ['resonance', 'lewis'],
      traps: [
        'The molecule does NOT flip between structures: it is ONE hybrid with equal bonds.',
        'Moving an atom is not resonance (that makes an isomer). Only electrons move.',
        'Average bond order for CO₃²⁻ is 4/3 = 1.33, not 1.5 (three equivalent positions share 4 bonds).',
        'Negative formal charge belongs on the more electronegative atom (O in NCO⁻, not N or C).',
      ],
    },
    {
      id: 'coordinate',
      title: 'Coordinate covalent bonds and the Learning Check',
      slides: [68, 69, 70, 71, 72],
      md: r`
**Normal covalent bond**: each atom contributes one electron (3 H + N → NH₃).

**Coordinate covalent (dative) bond**: **both** shared electrons come from **one** atom.
- NH₃ + H⁺ → NH₄⁺: H⁺ has no electrons, N has a lone pair, the lone pair forms the new N–H bond.
- Once formed it is **indistinguishable** from any other covalent bond (all four N–H bonds in NH₄⁺ are equivalent).
- **Electron-deficient boron** (BCl₃, BF₃) reacts with lone-pair donors: H₃N: + BCl₃ → H₃N–BCl₃ (B reaches an octet).
- FC check in NH₄⁺: N = 5 − 0 − 4 = **+1**.

**Learning Check (slide 72): draw the best Lewis structure for HClO₄, XeF₄, I₃⁻, BrF₅**

| Species | Valence e⁻ | Best structure |
|---|---|---|
| HClO₄ | 1+7+24 = 32 | H–O–Cl with Cl=O ×3 (all FC 0, Cl expanded to 14 e⁻) |
| XeF₄ | 8+28 = 36 | Xe with 4 single bonds and **2 lone pairs** (12 e⁻ on Xe) |
| I₃⁻ | 21+1 = 22 | I–I–I with 3 lone pairs on central I (10 e⁻), 3 on each end; charge −1 on the central atom formally |
| BrF₅ | 7+35 = 42 | Br with 5 single bonds and **1 lone pair** (12 e⁻) |

These species expand the octet and are the starting points for VSEPR in L10.
`,
      widgets: ['lewis'],
      traps: [
        'In a coordinate bond only the donor supplies the pair, but the bond is afterwards identical to any other covalent bond.',
        'I₃⁻: do not try to give the central I only 8 e⁻; it has 3 lone pairs and 2 bonds (10 e⁻).',
      ],
    },
  ],
}
