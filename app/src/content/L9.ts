// Learn content for L9. Owned by the content agent. Markdown + KaTeX; cite slides via `slides`.
import type { Lecture } from '../types'

const r = String.raw

export const lecture: Lecture = {
  id: 'L9',
  title: 'Molecular Structure',
  summary:
    'How atoms share electrons: Lewis symbols, covalent bonds and bond energies (ΔH from bonds broken − bonds formed), the step-by-step method for drawing Lewis structures, octet exceptions (incomplete, expanded, odd-electron), bond order / length / energy, formal charge as the tie-breaker, resonance and average bond order, and coordinate covalent bonds.',
  sections: [
    {
      id: 'lewis-symbols',
      title: 'Lewis symbols and ionic electron bookkeeping',
      slides: [2, 3, 4],
      essentials: [
        'Representative elements: **group number = number of valence electrons** = number of dots (H 1, C 4, N 5, O 6, halogens 7).',
        'Ionic bonding with Lewis symbols: the metal **loses all its valence dots**; the nonmetal ends with **8 dots in brackets** with its charge, e.g. Mg²⁺ [:O:]²⁻.',
      ],
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
      essentials: [
        'A covalent bond is a **shared electron pair** with paired spins (↑↓). The bond length is where nucleus–electron attraction and nucleus–nucleus repulsion balance (energy minimum).',
        'Bond dissociation energy **D** = energy to break 1 mol of a bond in the gas phase. **D is always positive.**',
        'Breaking bonds costs energy (+), forming bonds releases energy (−): **ΔH = ΣD(broken) − ΣD(formed)**. Negative ΔH = exothermic.',
        'Draw the Lewis structures first so you count **every** bond, times the coefficient. Bonds that appear unchanged on both sides cancel.',
      ],
      formulas: [
        {
          name: 'ΔH from bond energies (s10)',
          tex: r`\Delta H^\circ_{rxn} = \sum D(\text{bonds broken}) - \sum D(\text{bonds formed})`,
          where: 'D in kJ/mol from the slide 10 table; multiply each D by how many of that bond there are (and by the reaction coefficient). The summary deck writes the same thing as ΣBE(reactants) − ΣBE(products).',
        },
      ],
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

**How to do it**
1. Draw the Lewis structure of every reactant and product.
2. List the bonds **broken** (in reactants) and **formed** (in products), times their counts and coefficients.
3. Shortcut: a bond present unchanged on both sides (e.g. the four C–H of C₂H₄ that survive into C₂H₆) cancels, so list only the bonds that change.
4. ΔH = ΣD(broken) − ΣD(formed).

**Worked example (s10 numbers)**: C₂H₄ + H₂ → C₂H₆. Broken: C=C (612) + H–H (436) = 1048. Formed: C–C (348) + 2 C–H (824) = 1172. $\Delta H = 1048 - 1172 = -124$ kJ/mol (exothermic).

**Practice (reaction not on the slides; values from the s10 table)**: C₂H₄ + HCl → C₂H₅Cl. Broken: C=C (612) + H–Cl (431) = 1043. Formed: C–C (348) + C–H (412) + C–Cl (338) = 1098. $\Delta H = 1043 - 1098 = -55$ kJ/mol.

**Your Turn (slide 12)**: the most likely covalent species is **CO** (two nonmetals). CsCl, NaF, CaF₂, MgBr₂ all pair a metal with a nonmetal, so they are ionic.
`,
      figures: ['l9-dh-bond-energy'],
      traps: [
        'ΔH = bonds BROKEN minus bonds FORMED (the opposite order from "products minus reactants" thinking). Breaking costs energy (+), forming releases it.',
        'D is always positive: it is the energy to break a bond, never negative.',
        'A double bond is ONE entry with its own D (C=C 612), not 2 × C–C (696).',
        'Metal + nonmetal = ionic (CsCl, NaF, CaF₂, MgBr₂); two nonmetals = covalent.',
      ],
    },
    {
      id: 'octet-multiple',
      title: 'Octet rule, lone pairs and multiple bonds',
      slides: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
      essentials: [
        '**Octet rule**: each atom shares electrons until it has 8 around it ($ns^2np^6$). **H needs only 2.**',
        'Usual number of bonds = electrons still needed: **C 4, N 3, O 2, H and halogens 1** (when neutral, with no formal charge).',
        'Single bond = 1 shared pair, double = 2 pairs, triple = 3 pairs. Electron pairs not in a bond are **lone pairs**.',
      ],
      md: r`
**Octet rule**: when atoms form covalent bonds they share enough electrons to reach an outer shell of 8 ($ns^2np^6$, noble-gas configuration). **Exception: H**, which is complete with 2 electrons.

- A shared pair is drawn as a line; electron pairs not in a bond are **lone pairs**.
- When counting electrons around an atom, **both** electrons of each bond count for that atom (for the octet), plus all its lone-pair electrons.
- Diatomic gases: H₂ (one shared pair), F₂ (1 bond + 3 lone pairs per F), HF. Halogens need only **one** electron, so they form one bond.

**Bonds formed = electrons needed to reach the octet**

| Atom | Needs | Bonds | Lone pairs | Example |
|---|---|---|---|---|
| C | 4 e⁻ | 4 | 0 | CH₄ |
| N | 3 e⁻ | 3 | 1 | NH₃ |
| O | 2 e⁻ | 2 | 2 | H₂O |
| F, Cl, Br, I | 1 e⁻ | 1 | 3 | HF |
| H | 1 e⁻ | 1 | 0 | all of the above |

(The lone-pair column follows from 8 − 2 × bonds; it is the "FC = 0" pattern used later.)

**Multiple bonds**: sharing 2 pairs (double, e.g. O=C=O) or 3 pairs (triple, e.g. N≡N) between the same two atoms.

**Your Turn (s18)**: N has 5 valence e⁻, needs **3** more to complete the octet in N₂: it forms a triple bond.
**Your Turn (s22)**: **CO** is the species most likely to have multiple bonds; C needs 4 and O needs 2 and there are too few atoms to supply single partners (C≡O). H₂O, PH₃, CH₄ have all octets from single bonds with H; BF₃ is electron-deficient and stays single-bonded.
`,
      traps: [
        'N₂ needs 3 electrons per N (triple bond), not 2 or 1.',
        'H is satisfied with 2 electrons, never 8, and always forms exactly one bond.',
      ],
    },
    {
      id: 'carbon-compounds',
      title: 'Carbon compounds and functional groups',
      slides: [23, 24, 25, 26, 27, 28, 29, 30],
      essentials: [
        'C always forms **4 bonds**; alkanes have only single bonds, alkenes ≥ 1 C=C, alkynes ≥ 1 C≡C.',
        'The **carbonyl** C=O is in aldehydes, ketones, carboxylic acids, esters and amides; alcohols have –OH.',
        '**Isomers**: same molecular formula, different connectivity and properties.',
      ],
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
      essentials: [
        'Order of work (s33–34): **skeleton → count e⁻ → single bonds → terminal octets → leftovers on the central atom (in pairs) → multiple bonds if the central atom is short**.',
        'Central atom: usually written first and **least electronegative**. **H and F are always terminal.** In oxoacids the acidic H sits on O.',
        'Ions: **add 1 e⁻ per negative charge, remove 1 e⁻ per positive charge** (SO₄²⁻: 32 e⁻; NH₄⁺: 8 e⁻).',
        'Check at the end: 2 × (number of bonds) + lone-pair e⁻ = total e⁻, and C, N, O, F each have exactly 8.',
        'Several drawings satisfy the octets (CO₂)? **Formal charge** decides.',
      ],
      formulas: [
        {
          name: 'Total valence electrons',
          tex: r`N_{e^-} = \sum_{\text{atoms}} (\text{valence } e^-) - q`,
          where: 'valence e⁻ = group number; $q$ = charge of the species with its sign (SO₄²⁻: $q = -2$, so add 2; NH₄⁺: $q = +1$, so remove 1).',
        },
        {
          name: 'Electron check',
          tex: r`N_{e^-} = 2 \times (\#\,\text{bonds}) + (\#\,\text{lone-pair } e^-)`,
          where: 'a double bond counts as 2 bonds, a triple as 3. N₂F₂: 2 × 4 + 16 = 24 ✓.',
        },
      ],
      md: r`
**The method (slides 33–34)**
1. **Skeleton**: decide how atoms are bonded. The central atom is usually written first and is usually the **least electronegative**. H (one bond only) and F are always terminal; in oxoacids such as H₂CO₃ and H₂SO₄ the central atom is surrounded by O and the H's sit on O.
2. **Count all valence electrons** of all atoms (add for negative charge, subtract for positive).
3. Place **2 e⁻ between each pair** of bonded atoms (single bonds). Subtract them.
4. Complete the octets of the **terminal atoms** with lone pairs (H gets none). Subtract them.
5. Put any **remaining e⁻ on the central atom, in pairs**.
6. If the central atom still lacks an octet, **turn a lone pair of a neighbour into a shared pair**: form a double bond, and if necessary a triple bond.
7. (Summary deck) Check octets and **formal charges**: they should be as close to 0 as possible.

**The electron ledger** (the slides do every example this way): total → − single-bond e⁻ → − terminal lone-pair e⁻ → the rest goes on the central atom. If the rest is 0 and the central atom has < 8, make multiple bonds; if the rest is > 0 for a period-3+ central atom, it just keeps them (expanded octet).

**Worked examples from the slides**

| Species | Valence e⁻ | Ledger | Result |
|---|---|---|---|
| N₂F₂ | 2(5) + 2(7) = 24 | − 6 (3 bonds) − 12 (F lone pairs) = 6 on the N's | 6 e⁻ is not enough for two N octets, so one N lone pair becomes a 2nd N–N bond: **F–N=N–F**, 1 lone pair per N |
| SiF₄ | 4 + 28 = 32 | − 8 − 24 = 0 | 4 single bonds, 3 lp per F; Si has 8 ✓ |
| H₂CO₃ | 4 + 18 + 2 = 24 | − 10 (5 bonds) − 14 (O lone pairs) = 0 | C has only 6 e⁻, so one O lone pair becomes **C=O** (the O without H) |
| PCl₅ | 5 + 35 = 40 | − 10 − 30 = 0 | P has **10 e⁻**: expanded octet, allowed for period 3 |
| BBr₃ | 3 + 21 = 24 | − 6 − 18 = 0 | B has only **6 e⁻**: incomplete octet, **no** double bond (all FC 0) |
| CO₂ | 4 + 12 = 16 | − 4 − 12 = 0 | C has only 4 e⁻, needs 2 more bonds: O=C=O, O–C≡O or O≡C–O. All give octets, so **formal charge** decides: O=C=O |

**Which lone pair moves in step 6?** One from a terminal atom bonded to the electron-poor atom (an O in H₂CO₃ and CO₂, the other N in N₂F₂). **Never from F or another halogen**: a halogen with a double bond gets a + formal charge.
`,
      figures: ['l9-n2f2-steps'],
      widgets: ['lewis'],
      traps: [
        'Forgetting to add electrons for a negative charge (or remove for positive).',
        'Using more than 8 e⁻ on a second-row atom (C, N, O, F): only period 3 and below can expand.',
        'Putting leftover electrons on terminal atoms instead of the central atom (step 5).',
        'Making a double bond when electrons are LEFT OVER: leftovers mean lone pairs on the central atom; double bonds are only for a central atom that is short of 8.',
        'Forcing a double bond on B in BBr₃/BCl₃: boron stays electron-deficient (all formal charges are 0).',
      ],
    },
    {
      id: 'octet-exceptions',
      title: 'Octet exceptions: incomplete, expanded and odd-electron',
      slides: [32, 40, 41, 47, 53, 72],
      essentials: [
        '**Incomplete octet: B and Be** (BCl₃, BBr₃: B has 6 e⁻; BeCl₂: Be has 4 e⁻). All FC = 0, so no double bond is drawn (s53).',
        '**Expanded octet: period 3 and below only** (P, S, Cl, Br, I, Xe). The n = 3 shell has d orbitals and can hold up to 18 e⁻. **C, N, O, F never exceed 8.**',
        'Expansion shows up when: more than 4 atoms are bonded (PCl₅), e⁻ are left over after the terminal octets (XeF₄, I₃⁻, ClF₃, BrF₅), or it lowers the formal charges (H₂SO₄, HClO₄).',
        '**Odd number of e⁻** (NO₂: 17, NO: 11): one atom must have 7 e⁻ (an unpaired electron, usually on N). Beyond the L9 slides; L10 treats these with MO theory.',
      ],
      md: r`
The octet rule is rigorous only for the **second-row elements C, N, O and F** (slide 32). Three kinds of exception:

**1. Incomplete octet (electron-deficient): B and Be**
- BBr₃ (s41): 24 e⁻, three single bonds, 3 lp per Br, **0 left**: B has 6 e⁻. BCl₃ and BF₃ are the same.
- BeCl₂: 2 + 14 = 16 e⁻, two single bonds, 3 lp per Cl, 0 left: **Be has 4 e⁻**.
- Why no double bond? FC(B) = 3 − 0 − 3 = **0** and FC(Cl) = 7 − 6 − 1 = **0** (s53). A B=Cl bond would make Cl **+1** and B **−1**: worse.
- Electron-deficient B is why BCl₃ accepts a lone pair from NH₃ (coordinate bond, s71).

**2. Expanded octet: period 3 and below**
- n = 3 has d orbitals in the valence shell, so up to 18 e⁻ are possible (s32).
- **Leftover electrons go on the central atom** even past 8. The summary deck says S up to 12, P up to 10.

| Species | Valence e⁻ | Central atom | e⁻ on central atom |
|---|---|---|---|
| PCl₅ (s40) | 40 | 5 bonds | 10 |
| ClF₃ | 28 | 3 bonds + 2 lp | 10 |
| I₃⁻ (s72) | 22 | 2 bonds + 3 lp | 10 |
| XeF₄ (s72) | 36 | 4 bonds + 2 lp | 12 |
| BrF₅ (s72) | 42 | 5 bonds + 1 lp | 12 |
| H₂SO₄ (s47) | 32 | 2 S=O + 2 S–O | 12 |
| HClO₄ (s72) | 32 | 3 Cl=O + 1 Cl–O | 14 |

- In H₂SO₄ and HClO₄ the all-single-bond drawing already obeys the octet, but the central atom carries +2 / +3. Turning O⁻ lone pairs into S=O / Cl=O bonds brings every FC to 0, which the slides prefer (and the S–O bond lengths agree, s48).

**3. Odd-electron species** *(beyond the L9 slides: they only say the number of unpaired electrons stays the same between resonance structures, s63, and ask about NO₂, s44 and s67)*
- An odd total cannot be split into pairs, so one atom keeps a **single unpaired electron** and has only 7 e⁻.
- NO₂ (5 + 12 = 17 e⁻): O=N–O with the unpaired electron on N. FC: N +1, single-bonded O −1, double-bonded O 0. Two resonance forms.
- NO (11 e⁻): N=O, N has 1 lone pair + 1 unpaired electron (7 e⁻), all FC 0.
- Such species (radicals) are paramagnetic; L10 handles them properly with MO theory and also counts the single electron as a VSEPR domain.
`,
      figures: ['l9-expanded-octet'],
      widgets: ['lewis'],
      traps: [
        'N, O, C, F with 10 e⁻ is always wrong, however neat the formal charges look.',
        'A period-3 atom MAY expand, it does not have to: PCl₃ and SiF₄ are plain octets.',
        'XeF₄, I₃⁻, BrF₅: count the leftover e⁻ carefully: they all go on the central atom as lone pairs, and they matter for the L10 shape.',
        'Odd total e⁻ (17 for NO₂) is not an arithmetic mistake: it means a radical with one atom at 7 e⁻.',
      ],
    },
    {
      id: 'bond-properties',
      title: 'Bond order, bond length and bond energy',
      slides: [43, 44, 45, 46, 47, 48],
      essentials: [
        '**Bond order** = number of electron pairs shared between two atoms (single 1, double 2, triple 3).',
        '**Higher bond order → larger D and shorter bond**, but only comparing bonds between the **same two elements**.',
        'Bond lengths are experimental evidence for which Lewis structure is right: H₂SO₄ has two short S–O (142 pm, S=O) and two long S–O(H) (157 pm).',
        'Resonance gives fractional bond orders (NO₃⁻ 1.33); the bond length then lies between single and double.',
      ],
      formulas: [
        {
          name: 'Trend (same two elements)',
          tex: r`\text{bond order}\uparrow \;\Rightarrow\; D\uparrow,\ \text{bond length}\downarrow`,
          where: 'C–C 348, C=C 612, C≡C 960 kJ/mol (s10). D = bond dissociation energy.',
        },
      ],
      md: r`
- **Bond order** = number of electron pairs shared between 2 atoms (measure of electron density in the bond). Single 1, double 2, triple 3.
- **Bond length**: distance between nuclei.
- **Bond energy**: energy to separate bonded atoms into neutral particles.

**Higher bond order ⇒ more electron density ⇒ nuclei held more tightly ⇒ larger D, shorter bond length** (compare bonds between the *same two elements*).

| Bond | Order | D (kJ/mol) | Length |
|---|---|---|---|
| C–C | 1 | 348 | longest |
| C=C | 2 | 612 | shorter |
| C≡C | 3 | 960 | shortest |

**Experiment decides between candidate structures (H₂SO₄, s47–48)**
- 32 e⁻. The all-single-bond structure obeys the octet, but S could expand (n = 3 has empty d orbitals) and form two S=O.
- X-ray data: S–O bonds with no H attached are **shorter (142 pm)**; S–O(H) are **longer (157 pm)**.
- So two S–O bonds differ from the other two: the structure with **S=O to the two O's without H** is correct, even though it "violates" the octet rule. Formal charge (next section) predicts the same.

**Your Turn (s44)**: in the drawn O–N–O structure N has 8 electrons (2 bonds + 2 lone pairs) and the total is 4 + 6 + 4 + 4 = 18 e⁻, one more than NO₂ (17). Intended answer: **too many total electrons**. (The right-hand O has only 6 e⁻ in the drawing: its octet is not complete either.)
`,
      widgets: ['bond-props'],
      traps: [
        'Bond order and bond energy increase together; bond length goes the opposite way.',
        'The trend only compares bonds between the same two elements (C=O vs C–O, not C=O vs N–O).',
      ],
    },
    {
      id: 'formal-charge',
      title: 'Formal charge: choosing the best Lewis structure',
      slides: [49, 50, 51, 52, 53, 54, 55],
      essentials: [
        '**FC = valence e⁻ − lone-pair e⁻ − ½ bonding e⁻** = valence e⁻ − [bonds to the atom + unshared e⁻]. Bookkeeping only, not a real charge.',
        '**Sum of all FCs = charge of the molecule or ion.** Use it to check your arithmetic.',
        'Best structure (s52, in order): **1. fewest formal charges (ideally all 0); 2. all |FC| ≤ 1; 3. any negative FC on the most electronegative atom.**',
        'For a period-3+ central atom the expanded structure with all FC = 0 beats the octet structure with +2/−1 (H₂SO₄). For B it is the reverse: keep B at 6 e⁻ (all FC 0).',
      ],
      formulas: [
        {
          name: 'Formal charge (s50)',
          tex: r`FC = V - L - \tfrac{1}{2}B`,
          where: '$V$ = valence e⁻ of the free atom (group number); $L$ = lone-pair (unshared) e⁻ on the atom, counting each electron; $B$ = bonding e⁻ around the atom (a double bond is 4).',
        },
        {
          name: 'Same formula, slide 51 form',
          tex: r`FC = V - (\#\,\text{bonds to the atom} + \#\,\text{unshared } e^-)`,
          where: 'a double bond counts as 2 bonds, a triple as 3. Example: O in S=O: 6 − (2 + 4) = 0.',
        },
        {
          name: 'Charge check',
          tex: r`\sum FC = \text{overall charge}`,
          where: 'NO₃⁻: +1 + 0 + 2(−1) = −1 ✓.',
        },
      ],
      md: r`
**Formal charge (FC)** is a bookkeeping method: the apparent charge on an atom if electrons in every bond were shared equally (each atom "owns" half of every shared pair, s49). It does **not** represent real charges. Write FCs in small circles next to the atoms.

$$FC = (\#\text{valence } e^-) - (\#\text{lone-pair } e^-) - \tfrac{1}{2}(\#\text{bonding } e^-)$$

Equivalent form used on the slides: $FC = \#\text{valence } e^- - [\#\text{bonds to the atom} + \#\text{unshared } e^-]$.

**Rules for the most stable (preferred) structure (s52, in slide order)**
1. **Least number of formal charges** is best (ideally all 0).
2. All $|FC| \le 1$.
3. Any **negative FC on the most electronegative** element.

**Patterns worth memorising** (they follow straight from the formula)

| Atom | FC = 0 | FC = −1 | FC = +1 |
|---|---|---|---|
| O (V = 6) | 2 bonds + 2 lp | 1 bond + 3 lp | 3 bonds + 1 lp |
| N (V = 5) | 3 bonds + 1 lp | 2 bonds + 2 lp | 4 bonds, 0 lp |
| C (V = 4) | 4 bonds | | |
| Halogen (V = 7) | 1 bond + 3 lp | | |
| B (V = 3) | 3 bonds | 4 bonds (BCl₃ after accepting a pair) | |

**Slide examples**
- **H₂SO₄** (s51): structure 1 (all single bonds): FC(S) = 6 − (4 + 0) = **+2**, FC(O, 1 bond) = 6 − (1 + 6) = **−1**. Structure 2 (two S=O): FC(S) = 6 − (6 + 0) = 0 and every atom is 0. **Structure 2 is preferred** (fewest charges), and the X-ray bond lengths agree.
- **BCl₃** (s53): FC(B) = 3 − 0 − 3 = 0, FC(Cl) = 7 − 6 − 1 = 0, so there is no need for a double bond.
- **CO₂** (s54): O=C=O all 0 (**best**). O–C≡O: single-bonded O = 6 − (1 + 6) = −1, triple-bonded O = 6 − (3 + 2) = **+1**. Worse.

**Using FC in a problem**
1. Draw every candidate that satisfies the octets (plus expanded ones for period-3+ central atoms).
2. Compute every FC; check the sum equals the charge.
3. Apply rules 1 → 2 → 3 in order.

**Your Turn (s55)**: XeO₄ (8 + 24 = 32 e⁻, no lone pair left on Xe) with 4 single bonds: FC(Xe) = 8 − 4 = **+4**. With two double and two single bonds (bonds = 6): FC = 8 − 6 = **+2**. Answer D (+4, +2). Four double bonds would give 0.
`,
      figures: ['l9-h2so4-fc'],
      widgets: ['lewis'],
      traps: [
        'Formal charge ≠ oxidation state ≠ real charge. Count shared electrons as half each.',
        'Lone-pair electrons are counted individually (a lone pair = 2), bonds are counted once each in the "bonds + unshared" form.',
        'The expanded-octet structure with all FC = 0 is preferred to the octet structure with +2/−1 charges for period-3 central atoms (H₂SO₄, XeO₄). Never expand C, N, O or F to remove a formal charge.',
        'If your FCs do not add up to the overall charge, you have miscounted electrons.',
      ],
    },
    {
      id: 'resonance',
      title: 'Resonance and delocalisation',
      slides: [56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67],
      essentials: [
        'Resonance: **two or more valid Lewis structures** that differ only in where **electrons** (π bonds, lone pairs) are; nuclei never move. Drawn with ↔.',
        'The real species is **one resonance hybrid** (the average): NO₃⁻ has three equal N–O bonds, each of order **4/3 = 1.33**.',
        'Good contributors (s62): **1. all octets; 2. as many bonds as possible; 3a. |FC| ≤ 1; 3b. negative charge on the electronegative atom; 4. least charge separation.**',
        'The hybrid is **more stable** than any single structure (resonance energy; benzene ≈ 146 kJ/mol).',
        'Typical giveaway: a double bond that could equally sit on another identical atom next to it (NO₃⁻, CO₃²⁻, O₃, NO₂).',
      ],
      formulas: [
        {
          name: 'Average bond order',
          tex: r`\overline{BO} = \frac{\text{total shared pairs to the equivalent atoms}}{\text{number of equivalent positions}}`,
          where: 'NO₃⁻ and CO₃²⁻: (2 + 1 + 1)/3 = 1.33. O₃, NO₂⁻, benzene C–C: 3/2 = 1.5. SO₄²⁻ (summary deck): 6/4 = 1.5.',
        },
      ],
      md: r`
**When one Lewis structure fails** (s56–57): NO₃⁻ has 5 + 18 + 1 = 24 e⁻, and one Lewis structure predicts one short N=O and two longer N–O bonds. Experiment shows **all three N–O bonds are the same length**, shorter than an N–O single bond.

- **Resonance structures**: multiple valid Lewis structures for one species; none is correct alone. The real species is a **resonance hybrid** (average), drawn with a double-headed arrow ↔.
- Electrons are **delocalised** (smeared over several atoms). Only **electrons** move, never nuclei.
- Every NO₃⁻ form has the same FCs (N +1, two single-bonded O −1, double-bonded O 0); in the hybrid the −1 charge is spread over the three O's.

**Rules for good resonance contributors (s62)**
1. All octets satisfied.
2. All atoms have as many bonds as possible.
3. (a) $|FC| \le 1$; (b) any negative charges on the electronegative atoms.
4. As little charge separation as possible.

**Drawing valid resonance structures (s63)**
1. Each must be a valid Lewis structure (same total e⁻).
2. Only electrons shift (usually a double/triple bond and a lone pair); nuclei and bond angles stay put.
3. The number of unpaired electrons, if any, stays the same.
4. The major contributors are the ones with the lowest energy (rules above).
5. Resonance matters most when it spreads charge over 2 or more atoms.

**Average bond order**

| Species | e⁻ | Forms | Average BO |
|---|---|---|---|
| NO₃⁻ (s58) | 24 | 3 | (2 + 1 + 1)/3 = **1.33** |
| CO₃²⁻ (s60–61) | 24 | 3 | **1.33**; FC −1 on each single-bonded O, 0 on C and on the C=O |
| O₃, NO₂⁻ *(not on the slides)* | 18 | 2 | 1.5 |
| Benzene C–C | | 2 | 1.5 |

**NCO⁻ (16 e⁻), slides 64–65**: three candidates, all with octets, compared by formal charge (EN: O 3.5 > N 3.0 > C 2.5):
- [N≡C–O]⁻: FC(N) = 5 − 2 − 3 = 0, FC(C) = 0, FC(O) = 6 − 6 − 1 = **−1**: **best** (negative charge on the most electronegative atom).
- [N=C=O]⁻: FC(N) = 5 − 4 − 2 = **−1**, FC(C) = 0, FC(O) = 0: **OK**.
- [N–C≡O]⁻: FC(N) = 5 − 6 − 1 = **−2**, FC(O) = 6 − 2 − 3 = **+1**: **not acceptable**.

**N₂O (N–N–O, 16 e⁻), summary deck**: N≡N–O (FC 0, +1, −1) is the most stable, since its −1 is on O; N=N=O puts −1 on N and N–N≡O puts −2 on N.

**Resonance stabilisation (s66)**: the real structure is more stable than any single contributor; for benzene the extra stability (resonance energy) is about **146 kJ/mol**.

**Your Turn (s67)**: NO₂, N₃⁻ and N₂O (N central) all exhibit resonance; H₂O and CH₃CH₂CH do not.
`,
      figures: ['l9-no3-resonance', 'l9-nco-fc'],
      widgets: ['resonance', 'lewis'],
      traps: [
        'The molecule does NOT flip between structures: it is ONE hybrid with equal bonds.',
        'Moving an atom is not resonance (that makes an isomer). Only electrons move.',
        'Average bond order for CO₃²⁻ is 4/3 = 1.33, not 1.5 (three equivalent positions share 4 bonds).',
        'Negative formal charge belongs on the more electronegative atom (O in NCO⁻, not N or C).',
        'Resonance forms that are not equivalent are not equally important: rank them with the s62 rules.',
      ],
    },
    {
      id: 'coordinate',
      title: 'Coordinate covalent bonds and the Learning Check',
      slides: [68, 69, 70, 71, 72],
      essentials: [
        '**Coordinate (dative) covalent bond**: **both** shared electrons come from **one** atom (a lone pair) going to an atom with room (H⁺, B).',
        'Once formed it is **identical** to any other covalent bond: all four N–H in NH₄⁺ are equivalent.',
        'Typical pairs: NH₃ + H⁺ → NH₄⁺ (FC on N +1); H₃N: + BCl₃ → H₃N–BCl₃ (B reaches 8 e⁻).',
      ],
      md: r`
**Normal covalent bond**: each atom contributes one electron (3 H + N → NH₃).

**Coordinate covalent (dative) bond**: **both** shared electrons come from **one** atom.
- NH₃ + H⁺ → NH₄⁺: H⁺ has no electrons, N has a lone pair, the lone pair forms the new N–H bond.
- Once formed it is **indistinguishable** from any other covalent bond (all four N–H bonds in NH₄⁺ are equivalent): you cannot tell where the electrons came from.
- **Electron-deficient boron** (BCl₃, BF₃) reacts with lone-pair donors: H₃N: + BCl₃ → H₃N–BCl₃ (B reaches an octet).
- FC check: N in NH₄⁺ = 5 − 0 − 4 = **+1** (8 e⁻: 5 + 4 − 1). In H₃N–BCl₃, N = **+1** and B = 3 − 0 − 4 = **−1** (these two are not written on the slides; they follow from the formula).
- Useful for understanding reactions: donor = has a lone pair, acceptor = has an empty spot (H⁺, B).

**Learning Check (slide 72): draw the best Lewis structure for HClO₄, XeF₄, I₃⁻, BrF₅**

| Species | Valence e⁻ | Best structure | FC |
|---|---|---|---|
| HClO₄ | 1 + 7 + 24 = 32 | H–O–Cl with three Cl=O (Cl expanded to 14 e⁻) | all 0 (the all-single version has Cl +3) |
| XeF₄ | 8 + 28 = 36 | Xe with 4 single bonds and **2 lone pairs** (12 e⁻ on Xe) | all 0 |
| I₃⁻ | 21 + 1 = 22 | I–I–I with **3 lone pairs on the central I** (10 e⁻), 3 on each end | central I −1, ends 0 |
| BrF₅ | 7 + 35 = 42 | Br with 5 single bonds and **1 lone pair** (12 e⁻) | all 0 |

These species expand the octet and are the starting points for VSEPR in L10.
`,
      figures: ['l9-coordinate'],
      widgets: ['lewis'],
      traps: [
        'In a coordinate bond only the donor supplies the pair, but the bond is afterwards identical to any other covalent bond.',
        'I₃⁻: do not try to give the central I only 8 e⁻; it has 3 lone pairs and 2 bonds (10 e⁻).',
        'NH₄⁺ has 8 valence e⁻ (5 + 4 − 1), not 9 or 10.',
      ],
    },
  ],
}
