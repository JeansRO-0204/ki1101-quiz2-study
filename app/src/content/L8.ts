// Learn content for L8. Owned by the content agent. Markdown + KaTeX; cite slides via `slides`.
import type { Lecture } from '../types'

const r = String.raw

export const lecture: Lecture = {
  id: 'L8',
  title: 'Basics of Chemical Bonding',
  summary:
    'Why ionic compounds form (Born–Haber energetics and lattice energy), which ions atoms form (octet rule, noble-gas cores, and the special cases of transition and post-transition metals), and how electronegativity differences describe bond polarity, dipole moment and ionic character.',
  sections: [
    {
      id: 'bonds',
      title: 'Chemical bonds & their classes',
      slides: [2, 3],
      essentials: [
        'A **chemical bond** is the attractive force holding atoms together. Reactions = break old bonds + form new ones.',
        '**Covalent** = electrons **shared** (molecules). **Ionic** = electrons **transferred** (ionic solids).',
        'Real bonds sit on a **continuum** between the two; $\\Delta\\chi$ tells you where (last sections).',
      ],
      md: r`
- **Chemical bond** = attractive force holding atoms together in molecules and ionic compounds. Reactions = **break old bonds, form new bonds**, so bond changes underlie all reactivity.
- **Covalent bonding**: occurs in molecules; electrons are **shared**.
- **Ionic bonding**: occurs in ionic solids; electrons are **transferred** from one atom to another. Simpler, so the lecture starts here.
- In reality bonding is a continuum between the two extremes (the last two sections quantify this with electronegativity).
`,
    },
    {
      id: 'ionic',
      title: 'Ionic bonds & ionic compounds',
      slides: [4, 5, 6],
      essentials: [
        'Ionic bond = **electrostatic attraction** between oppositely charged ions; typical for **metal + nonmetal**.',
        'Three reasons it works: metal has **low IE**, nonmetal has a **very exothermic EA**, and the **lattice** releases a lot of energy.',
        'Ionic formulas are **empirical** (smallest whole-number ratio): NaCl, CaCl$_2$, Ca$_3$N$_2$. There are no molecules in the solid.',
        'To write the formula: balance charges, $a\\cdot(\\text{cation charge}) = b\\cdot|\\text{anion charge}|$ for M$_a$X$_b$.',
      ],
      md: r`
- **Ionic bond** = electrostatic attraction between oppositely charged ions: Na$^+$ Cl$^-$.
- Metal + nonmetal gives ionic bonding because:
  - metals have **low ionization energies** (lose e$^-$ easily);
  - nonmetals have **very exothermic electron affinities** (gain e$^-$ readily);
  - **formation of the lattice** stabilises the ions (the big energy payoff; see the Born–Haber section).
- Questions the lecture answers next: why Na$^+$ and not Na$^{2+}$ or Na$^-$? Why Cl$^-$ and not Cl$^{2-}$ or Cl$^+$?
- **Ionic crystal** = 3-D array of cations and anions (lattice). Formulas are always **empirical formulas**: the smallest whole-number ratio (NaCl, not Na$_2$Cl$_2$).
- Charge balance: Ca$^{2+}$ + N$^{3-}$ → 3 × (+2) = 2 × (−3) → **Ca$_3$N$_2$**.
`,
      traps: ['There are no discrete "NaCl molecules" in the solid. The formula is a ratio, not a molecule.'],
    },
    {
      id: 'energetics',
      title: 'Energetics: the Born–Haber cycle',
      slides: [7, 8],
      widgets: ['ionic-energetics'],
      figures: ['l8-born-haber-nacl', 'l8-born-haber-cacl2'],
      essentials: [
        'A compound forms only if the energy drops: $\\Delta H_f^\\circ < 0$.',
        '**Hess\'s law**: the direct path (elements → salt) and the step path (atoms → ions → lattice) have the **same total**. So $\\Delta H_f^\\circ$ = sum of the steps.',
        'Signs: atomising (**+**), ionising (**+**), adding an electron to Cl (**−**), forming the lattice (**−**).',
        'To find **one unknown step**: unknown = $\\Delta H_f^\\circ$ − (sum of all the other steps). Usually the unknown is the lattice energy.',
        'The uphill steps for NaCl cost +375.7 kJ/mol. Only the lattice energy (−787) makes the overall reaction exothermic.',
      ],
      formulas: [
        {
          name: 'Born–Haber for MX (NaCl type, slide 8)',
          tex: r`\Delta H_f^\circ=\Delta H_{sub}(\text{M})+\tfrac12 D(\text{X}_2)+IE_1(\text{M})+EA(\text{X})+\Delta H_{lattice}`,
          where: r`all in kJ/mol. $\Delta H_{sub}$: solid metal → gas atoms (+). $\tfrac12 D$: half a mole of X–X bonds broken (+); the slide writes it as $\Delta H_f^\circ$(Cl, g). $IE_1$ (+). $EA$ (− for Cl). $\Delta H_{lattice}$ (always −).`,
        },
        {
          name: 'Solve for the lattice energy',
          tex: r`\Delta H_{lattice}=\Delta H_f^\circ-\left(\Delta H_{sub}+\tfrac12 D+IE_1+EA\right)`,
          where: r`swap in whichever step is unknown: it always equals $\Delta H_f^\circ$ minus the sum of the other steps`,
        },
        {
          name: 'General salt MₐXᵦ (beyond the slides)',
          tex: r`\Delta H_f^\circ=a\,\Delta H_{sub}+\tfrac{b}{2}D+a\textstyle\sum IE+b\textstyle\sum EA+\Delta H_{lattice}`,
          where: r`$\sum IE$ = $IE_1+IE_2+\dots$ up to the cation charge; $\sum EA$ = $EA_1+EA_2+\dots$ up to the anion charge; $\tfrac b2 D$ for a diatomic X$_2$. Template from general chemistry, not on the slides`,
        },
      ],
      md: r`
A stable compound forms only if the potential energy of the system **decreases**: $\Delta H_f^\circ<0$. **Hess's law** (energy is conserved): the energy change is the same along any path. So compare the **direct path** (path 1, one step) with a **stepwise path** (path 2) through gaseous atoms and ions.

**The five steps for NaCl (slide 8, kJ/mol).** Numbers ①–⑤ match the diagram below.

| # | Step (symbol) | Equation | $\Delta H$ | What it means physically |
|---|---|---|---|---|
| ① | **Sublimation** (atomisation) of the metal, $\Delta H_{sub}$ | Na(s) → Na(g) | **+107.8** (endo) | pull Na atoms out of the solid metal into the gas |
| ② | **Bond dissociation** of half a mole of Cl$_2$, $\tfrac12 D$ | ½Cl$_2$(g) → Cl(g) | **+121.3** (endo) | break Cl–Cl bonds to get 1 mol of Cl atoms (½ mol of Cl$_2$) |
| ③ | **First ionisation energy** of Na, $IE_1$ | Na(g) → Na$^+$(g) + e$^-$ | **+495.4** (endo) | tear the 3s electron off a gaseous Na atom |
| ④ | **Electron affinity** of Cl, $EA$ | Cl(g) + e$^-$ → Cl$^-$(g) | **−348.8** (exo) | gaseous Cl atom captures that electron and releases energy |
| ⑤ | **Lattice formation**, $\Delta H_{lattice}$ | Na$^+$(g) + Cl$^-$(g) → NaCl(s) | **−787** (exo) | gaseous ions rush together into the crystal: the big payoff |
| Σ | **Enthalpy of formation**, $\Delta H_f^\circ$ (path 1) | Na(s) + ½Cl$_2$(g) → NaCl(s) | **−411.1** (exo) | the overall reaction from the elements in their standard states |

Check: ① + ② + ③ + ④ + ⑤ = 107.8 + 121.3 + 495.4 − 348.8 − 787 = **−411.3** ≈ −411 (slide), and path 1 is −411.1. Same start, same end, same total.

**How to solve for any one unknown step**
1. Write $\Delta H_f^\circ$ = ① + ② + ③ + ④ + ⑤, each with its own sign.
2. Put in every value you know.
3. Unknown = $\Delta H_f^\circ$ − (sum of the other four). Keep the signs inside the bracket.

*Lattice energy of NaCl (the usual question):*
$$\Delta H_{lattice}=-411.1-(107.8+121.3+495.4-348.8)=-411.1-375.7=-786.8\approx-787\ \text{kJ/mol}$$

*Electron affinity of Cl, if instead $\Delta H_{lattice}=-787$ is given:*
$$EA=-411.1-(107.8+121.3+495.4-787)=-411.1-(-62.5)=-348.6\approx-348.8\ \text{kJ/mol}$$

*$\Delta H_f^\circ$ if all five steps are given:* just add them: −411.3 kJ/mol.

**Salts that are not 1:1, e.g. CaCl$_2$ (MX$_2$; beyond the slides)**
The slides only work NaCl. For other formulas, count what you need per formula unit:
- **Ca$^{2+}$** needs **two** ionisation steps: $IE_1 + IE_2$ (slide 14: 590 + 1140).
- **Two** Cl atoms: break a **whole** mole of Cl$_2$ ($D$ = 2 × 121.3 = 242.6, not ½D) and add **2 × EA** (2 × −348.8 = −697.6).

| # | Step | Equation | $\Delta H$ (kJ/mol) |
|---|---|---|---|
| ① | sublimation of Ca | Ca(s) → Ca(g) | +178* |
| ② | dissociate one whole Cl$_2$ | Cl$_2$(g) → 2Cl(g) | +242.6 |
| ③ | $IE_1$(Ca) | Ca(g) → Ca$^+$(g) + e$^-$ | +590 |
| ④ | $IE_2$(Ca) | Ca$^+$(g) → Ca$^{2+}$(g) + e$^-$ | +1140 |
| ⑤ | 2 × EA(Cl) | 2Cl(g) + 2e$^-$ → 2Cl$^-$(g) | −697.6 |
| ⑥ | lattice formation | Ca$^{2+}$(g) + 2Cl$^-$(g) → CaCl$_2$(s) | ? |
| Σ | $\Delta H_f^\circ$ | Ca(s) + Cl$_2$(g) → CaCl$_2$(s) | −796* |

$\Delta H_{lattice}=-796-(178+242.6+590+1140-697.6)=-796-1453=-2249$ kJ/mol. *Values marked * are general data, not from the slides. The same idea gives Na$_2$O: 2 × sublimation, 2 × $IE_1$, ½D(O$_2$), and $EA_1+EA_2$ for O (slide 16: −141 + 844).
`,
      traps: [
        'Sign errors: atomisation and IE are **positive**, EA of Cl is **negative**, lattice energy is **negative**. Write each sign before you add.',
        'Don\'t forget the **½** for Cl$_2$ in NaCl (½ mol Cl$_2$ per mol NaCl). For CaCl$_2$ it is a **whole** $D$, and **2 × EA**.',
        'When you move the other steps to the other side, subtract the **whole bracket**: $-411.1-(+375.7)$, not $-411.1+375.7$.',
        'Some books quote lattice energy as a **positive** number (energy to break the lattice). On these slides it is always **negative** (energy released on forming).',
        'The slide\'s five steps sum to −411.3; the slide rounds to −411 and uses −411.1 for the direct path.',
      ],
    },
    {
      id: 'lattice',
      title: 'Lattice energy',
      slides: [9, 10, 11],
      essentials: [
        'Lattice energy = energy change when **1 mol of solid** forms from its **gaseous ions**: always **negative** (exothermic).',
        '$\\Delta H_{lattice} \\propto q_+q_-/d$: **bigger charges** and **smaller ions** (shorter $d$) give a more negative value.',
        'Compare **charges first** (they change the product by ×2, ×4, ×6); use ion **size** only to break ties.',
        'Use the **ion charges**, not the subscripts: Ca$_3$N$_2$ is $2+ \\times 3- \\to 6$.',
      ],
      formulas: [
        {
          name: 'Lattice energy (Coulomb dependence, slide 10)',
          tex: r`\Delta H_{lattice}\ \propto\ \frac{q_+\,q_-}{d}`,
          where: r`$q_+$, $q_-$ = ion charges (their product is negative, so $\Delta H$ is negative); $d$ = distance between the ion centres ≈ $r_+ + r_-$. Compare $|q_+q_-|$ to rank.`,
        },
      ],
      md: r`
- **Lattice energy**: the amount the PE of the system decreases when **1 mol of solid salt forms from its gaseous ions**: $M^{n+}(g)+X^{m-}(g)\to MX(s)$. Energy released.
- $\Delta H_{lattice}$ is **always negative** (exothermic).
- It becomes **more negative** as oppositely charged ions get **closer** (small ions) and as charges get **larger**:

$$\Delta H_{lattice}\ \propto\ \frac{q_+\,q_-}{d}$$

- Even for $+2/-2$ ions, the PE gained from the lattice more than pays for ionisation, so ionic solids are stable.

**Comparing (slide 11, same separation $d$): only $q_+q_-$ matters**

| Salt | Ions | $\lvert q_+q_-\rvert$ |
|---|---|---|
| NaCl | 1+, 1− | 1 |
| Na$_2$O | 1+, 2− | 2 |
| CaCl$_2$ | 2+, 1− | 2 |
| CaO | 2+, 2− | 4 |
| Ca$_3$N$_2$ | 2+, 3− | **6** |

Greatest lattice energy (slide 11) = **C, calcium nitride**.

**When the charges are equal, size decides.** Smaller ions sit closer, so $d$ is smaller: NaCl (−787) is more negative than KCl (−709), and LiF is more negative than CsI. Real values from the summary deck (not on the slides), kJ/mol: NaCl −787, CaCl$_2$ −2258, AlCl$_3$ −5492, CaO −3401, Al$_2$O$_3$ −15 916. Charge has the bigger effect.

**Ranking recipe:** (1) write each ion's charge; (2) rank by $|q_+q_-|$; (3) for ties, the pair with smaller ions (higher up the group) wins.
`,
      traps: [
        'Use the **ion charges**, not subscripts in the formula (Ca$_3$N$_2$: 2+ and 3−, product 6).',
        '"Greatest lattice energy" means most negative $\\Delta H$. Don\'t confuse magnitude with sign.',
        'Size only matters when the charge products are equal; a charge change outweighs any size change.',
      ],
    },
    {
      id: 'why-ions',
      title: 'Why metals form cations and nonmetals anions',
      slides: [12, 13, 14, 15, 16, 17],
      essentials: [
        'Metals: **small IE**, poor EA → cheapest to form **cations**. Nonmetals: **large IE**, large negative EA → cheapest to form **anions**.',
        'A metal loses electrons until it reaches a **noble-gas core**. Breaking into that core (a huge IE jump) can\'t be repaid by the lattice.',
        'Na: IE$_2$ ≈ 10 × IE$_1$, so Na$^+$ only. Ca: IE$_3$ ≫ IE$_2$, so Ca$^{2+}$ only.',
        'O$^{2-}$: net EA is **+703 kJ/mol** (endothermic), yet it forms because the 2− charge gives a much larger lattice energy.',
      ],
      md: r`
| | Metal (left of the table) | Nonmetal (right of the table) |
|---|---|---|
| IE | small, positive: cheap to remove e$^-$ | large, positive: hard to remove e$^-$ |
| EA | small negative or positive: unfavourable | large, negative: e$^-$ added with a big energy release |
| Cheapest route | form a **cation** | form an **anion** |

**The noble-gas core limits the charge.** Removing electrons from a stable core costs far more than the lattice can repay:
- Na [Ne]3s¹: IE$_1$ = 496, IE$_2$ = 4563 kJ/mol (~10× jump, because the 2nd electron comes from the [Ne] core). So Na$^+$ = [Ne] forms, Na$^{2+}$ doesn't.
- Ca [Ar]4s²: IE$_1$ = 590, IE$_2$ = 1140, IE$_3$ = 4940. Ca$^{2+}$ = [Ar] forms (lattice energy ≈ 2000 kJ/mol for 2+/2− repays IE$_1$+IE$_2$); Ca$^{3+}$ doesn't.
- Anions: Cl [Ne]3s²3p⁵ → Cl$^-$ = [Ar]. A second e$^-$ would have to go into the next shell ($n$ = 4): far too costly, so no Cl$^{2-}$.

**Oxide, the exception that proves the rule (slide 16):**
- O → O$^-$: EA$_1$ = −141 kJ/mol (exo)
- O$^-$ → O$^{2-}$: EA$_2$ = +844 kJ/mol (endo: adding e$^-$ to an ion that is already negative)
- net EA = −141 + 844 = **+703 kJ/mol** (endothermic!). The much larger lattice energy from the 2− charge more than repays this.
`,
      traps: [
        'Successive IEs always increase; the cut-off is the **big jump** where the next electron comes from a **noble-gas core**.',
        'O$^{2-}$ is stable only **in a lattice** (net EA is endothermic), not as a free gas-phase ion.',
      ],
    },
    {
      id: 'octet',
      title: 'Octet rule & s/p-block ions',
      slides: [17, 18, 19, 24, 25],
      widgets: ['econfig'],
      essentials: [
        's- and p-block atoms gain or lose electrons to reach the **nearest noble-gas** configuration (8 valence e$^-$; He has 2).',
        'Works for groups 1, 2, Al and nonmetals. **Fails** for H/He (2 e$^-$), **transition** and **post-transition** metals.',
        'Cations → the **previous** noble gas (lose all valence e$^-$). Anions → the **next** noble gas.',
        'Charge from the group: group 1 → 1+, group 2 → 2+, Al → 3+; N → 3−, O → 2−, halogens → 1−.',
      ],
      md: r`
**Octet rule:** atoms gain or lose electrons until the valence shell has **8 electrons** (the nearest noble-gas configuration; He has 2).
- Works for: **groups 1 and 2, Al, nonmetals**.
- Fails for: **H and He** (limited to 2 e$^-$ in $n=1$), **transition metals**, **post-transition metals**.
- **Cations** lose their valence electrons to match the *previous* noble gas; **anions** gain to match the *next* noble gas.

| Atom | Ion | Configuration |
|---|---|---|
| Na ([Ne]3s¹) | Na$^+$ | [Ne] |
| Cs ([Xe]6s¹) | Cs$^+$ | [Xe] (slide 19: answer A) |
| Ca ([Ar]4s²) | Ca$^{2+}$ | [Ar] |
| Cl ([Ne]3s²3p⁵) | Cl$^-$ | [Ar] |
| O ([He]2s²2p⁴) + 2 e$^-$ | O$^{2-}$ | [He]2s²2p⁶ = [Ne] |
| N ([He]2s²2p³) + 3 e$^-$ | N$^{3-}$ | [He]2s²2p⁶ = [Ne] |

**Isoelectronic** species share the same electron count: N$^{3-}$, O$^{2-}$, F$^-$, Ne, Na$^+$, Mg$^{2+}$, Al$^{3+}$ all have 10 e$^-$ ([Ne]).

**Quick check:** electrons in an ion = $Z$ − charge. O$^{2-}$: 8 − (−2) = 10 ✓.
`,
      traps: ['Don\'t give Cs$^+$ a leftover 6s electron: the **whole** valence s shell is lost.', 'Count electrons added: O needs **2**, N needs **3** to reach [Ne].'],
    },
    {
      id: 'tm',
      title: 'Transition & post-transition metal ions',
      slides: [20, 21, 22, 23, 24],
      widgets: ['econfig'],
      figures: ['l8-ion-removal'],
      essentials: [
        'Electrons leave from the **highest $n$ first**, then the highest $\\ell$. For transition metals the **4s goes before 3d**, even though 4s filled first.',
        'Fe [Ar]3d⁶4s² → Fe$^{2+}$ **[Ar]3d⁶** → Fe$^{3+}$ **[Ar]3d⁵**. Cu [Ar]3d¹⁰4s¹ → Cu$^{2+}$ **[Ar]3d⁹**.',
        'Exactly **half-filled (d⁵)** or **filled (d¹⁰)** d subshells are extra stable: Mn$^{2+}$, Fe$^{3+}$ (d⁵), Zn$^{2+}$ (d¹⁰).',
        'Post-transition metals (Sn, Pb, Bi) lose **np first, then ns**: Sn$^{2+}$/Sn$^{4+}$, Bi$^{3+}$/Bi$^{5+}$.',
      ],
      md: r`
**The one rule for cations:** rewrite the neutral configuration **in order of $n$** (e.g. [Ar]3d⁶4s², not [Ar]4s²3d⁶), then peel electrons off the **right-hand end**: highest $n$ first, and within that $n$, p before s.

**Post-transition metals** (Sn, Pb, Bi…): do **not** reach a noble-gas configuration. They lose the outer **p electrons first, then s**.
- Sn [Kr]4d¹⁰5s²5p² → **Sn$^{2+}$ [Kr]4d¹⁰5s²** (5p emptied) → **Sn$^{4+}$ [Kr]4d¹⁰** (5s also lost; the whole $n$ = 5 shell is empty).
- Pb behaves the same: Pb$^{2+}$ [Xe]4f¹⁴5d¹⁰6s², Pb$^{4+}$ [Xe]4f¹⁴5d¹⁰.
- Bi [Xe]6s²4f¹⁴5d¹⁰6p³ → rewrite as [Xe]4f¹⁴5d¹⁰6s²6p³ → **Bi$^{3+}$** (loses 6p³) and **Bi$^{5+}$** (also 6s²) (slide 24).

**Transition metals:** electrons are removed from the **highest $n$ first, then highest $\ell$**. So the **ns electrons go before (n−1)d**.
- Fe [Ar]3d⁶4s² → **Fe$^{2+}$ [Ar]3d⁶** (loses 4s²) → **Fe$^{3+}$ [Ar]3d⁵** (then one 3d; half-filled d, extra stable).
- Mn$^{2+}$ [Ar]3d⁵, Fe$^{3+}$ [Ar]3d⁵, Zn$^{2+}$ [Ar]3d¹⁰ (exactly half/fully filled d are favoured; slide 22).
- Cu [Ar]3d¹⁰4s¹ → **Cu$^{2+}$ [Ar]3d⁹** (slide 23, answer C: remove 4s¹, then one 3d).
- **M$^{2+}$ is the common state** (lose the two ns electrons); higher charges come from losing d electrons.

**Electron-count check:** Fe$^{3+}$ has 26 − 3 = 23 e$^-$ = 18 ([Ar]) + 5 ✓.
`,
      traps: [
        'Fe$^{3+}$ is [Ar]3d⁵, **not** [Ar]3d³4s². The 4s electrons leave first.',
        'Cu$^{2+}$ is [Ar]3d⁹ (not 3d⁸4s¹): start from Cu [Ar]3d¹⁰4s¹.',
        'Sn$^{2+}$ and Pb$^{2+}$ keep their ns² pair; the $4+$ ions lose it too.',
        'These ions do not follow the octet rule: don\'t force a noble-gas configuration on them.',
      ],
    },
    {
      id: 'polarity',
      title: 'Electronegativity, polar bonds & dipole moment',
      slides: [26, 27, 28, 29, 30, 31],
      essentials: [
        'Same atoms → **equal** sharing (nonpolar). Different atoms → **unequal** sharing: partial charges $\\delta^+$/$\\delta^-$, **not** a full transfer.',
        'The more electronegative atom gets $\\delta^-$ (HCl: Cl $-0.17$, H $+0.17$).',
        'Dipole moment $\\mu = q\\times r$, in debye: **1 D = 3.34 × 10⁻³⁰ C·m**.',
        'Typical calculation: $\\mu$ (D) and bond length (pm) → partial charge $q$ (C) → fraction of $e$.',
      ],
      formulas: [
        {
          name: 'Dipole moment (slide 30)',
          tex: r`\mu = q\times r,\qquad 1\ \text{D}=3.34\times10^{-30}\ \text{C·m}`,
          where: r`$q$ = charge on either end (C); $r$ = distance between the charges = bond length (m; 1 pm = $10^{-12}$ m); $\mu$ in C·m or debye (D)`,
        },
        {
          name: 'Partial charge from μ',
          tex: r`q=\frac{\mu}{r},\qquad \delta=\frac{q}{e},\quad e=1.602\times10^{-19}\ \text{C}`,
          where: r`$\delta$ = partial charge as a fraction of an electron charge (HCl ≈ 0.18). $e$ is the elementary charge (general data, not on the slides)`,
        },
      ],
      md: r`
- Same-element bond (H–H, Cl–Cl): **equal sharing**, nonpolar. Different elements: one atom pulls harder, giving **unequal sharing**: electron density shifts but is **not a full transfer**.
- Partial charges: in H–Cl the electron cloud is tighter around Cl, so Cl is $\delta^-$ and H is $\delta^+$ (slide 28: ±0.17).
- **Polar covalent bond** = a **dipole** (two poles). **Polar molecule** = has partial + and − ends due to polar bond(s).

**Dipole moment** (quantitative polarity):
$$\mu = q\times r,\qquad 1\ \text{D}=3.34\times10^{-30}\ \text{C·m}$$
($q$ = charge on either end, $r$ = distance between them.) Its size depends on the **difference in electronegativity** of the two atoms.

Slide 31 data:

| | HF | HCl | HBr | HI | CO | NO |
|---|---|---|---|---|---|---|
| $\mu$ (D) | 1.83 | 1.09 | 0.82 | 0.45 | 0.11 | 0.16 |
| length (pm) | 91.7 | 127 | 141 | 161 | 113 | 115 |

**Worked example (HCl):**
1. $\mu$ to SI: $1.09\times3.34\times10^{-30}=3.64\times10^{-30}$ C·m.
2. $r$ to m: 127 pm $=1.27\times10^{-10}$ m.
3. $q=\mu/r=3.64\times10^{-30}/1.27\times10^{-10}=2.87\times10^{-20}$ C.
4. As a fraction of $e$: $2.87\times10^{-20}/1.602\times10^{-19}=0.18$, close to the slide's 0.17.

Polarity falls from HF to HI as the electronegativity difference shrinks, even though the bond gets longer: HI is the **least polar** (slide 36).
`,
      traps: [
        'A polar **bond** ≠ polar **molecule** (shape matters: L10). Here we only treat diatomics.',
        'Partial charge is a **fraction** of $e$, never a full transfer, even in HF.',
        'Convert pm to m (×10⁻¹²) and D to C·m before using $\\mu=qr$.',
        'A longer bond does **not** mean a bigger dipole here: HI is longest but least polar, because $\\Delta\\chi$ controls $q$.',
      ],
    },
    {
      id: 'en',
      title: 'Electronegativity scale & trends',
      slides: [32, 33, 34, 35, 36, 37],
      widgets: ['polarity-en'],
      essentials: [
        '$\\chi$ = how strongly a **bonded** atom pulls bonding electrons. Bond polarity ≈ $\\Delta\\chi = |\\chi_1-\\chi_2|$.',
        'Memorise period 2 (slide 34): H 2, Li 1, Be 1.5, B 2, C 2.5, N 3, O 3.5, F 4 (+0.5 per step right); P 2, S 2.5, Cl 3.',
        '$\\chi$ **increases left → right** ($Z_{eff}$ up) and **decreases down a group** ($n$ up). F is the highest.',
        'The **higher-χ** atom is $\\delta^-$.',
      ],
      formulas: [
        {
          name: 'Electronegativity difference (slide 32)',
          tex: r`\Delta\chi=\lvert\chi_1-\chi_2\rvert`,
          where: r`unitless; 0 = nonpolar, bigger = more polar / more ionic`,
        },
      ],
      md: r`
**Electronegativity ($\chi$)**: ability of a bonded atom to attract bonding electrons to itself. **Bond polarity estimate:** $\Delta\chi=|\chi_1-\chi_2|$. Direction: the **more electronegative** atom is $\delta^-$ (slide 32: N$^{\delta-}$–H$^{\delta+}$, Si$^{\delta+}$–F$^{\delta-}$).

**Shortcut to memorise (slide 34):** $\chi$(H) ≈ 2.0, $\chi$(F) ≈ 4.0, and it **drops by 0.5 per element going left** across period 2:

| H | Li | Be | B | C | N | O | F |
|---|---|---|---|---|---|---|---|
| 2 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 |

Third period: P 2, S 2.5, Cl 3.0. (Slide 33's full table differs slightly: H 2.1, C 2.5, N 3.1, O 3.5, F 4.1, Cl 2.9, Br 2.8, Na 1.0, Cs 0.9. Use the slide 34 shortcut unless a table is given.)

**Learning Check (slide 35):**

| Bond | $\chi$ values | $\Delta\chi$ | More negative end |
|---|---|---|---|
| H–Cl | 2, 3 | 1 | Cl |
| C–O | 2.5, 3.5 | 1 | O |
| C–H | 2.5, 2 | 0.5 | C |
| Li–F | 1, 4 | 3 | F |
| Be–O | 1.5, 3.5 | 2 | O |

**Trends (slide 37):** $\chi$ **increases left → right** across a period ($Z_{eff}$ increases) and **decreases top → bottom** down a group ($n$ increases). So F is the most electronegative; Cs/Fr are the least.

**Your Turn (slide 36):** least polar of HCl, HF, HI, HBr → **HI** (I has the lowest $\chi$ of the halogens, so the smallest $\Delta\chi$ with H).
`,
      traps: ['Δχ is an absolute difference: write it positive and put δ⁻ on the higher-χ atom.', 'Hydrogen ≈ 2.0–2.1 sits between B and C, so C–H is only weakly polar.'],
    },
    {
      id: 'ionic-char',
      title: 'Ionic character & reactivity',
      slides: [38, 39, 40, 41, 42],
      figures: ['l8-ionic-character'],
      essentials: [
        '$\\Delta\\chi$ measures **ionic character**: < 0.5 nonpolar covalent (< 5% ionic), 0.5–1.7 **polar covalent**, > 1.7 **mostly ionic** (> 50%).',
        'Two nonmetals → covalent. Metal + nonmetal → mostly ionic.',
        'Metals: **low χ = easy to oxidise** (reactive, groups 1–2); high χ = noble metals (Pt, Au…).',
        'Nonmetals: **high χ = strong oxidiser** (F$_2$ strongest); oxidising power rises across a row, falls down a group.',
      ],
      md: r`
$\Delta\chi$ is a measure of the **ionic character** of a bond (slides 38–39):

| $\Delta\chi$ | Bond type |
|---|---|
| 0 | nonpolar covalent (identical atoms) |
| $<0.5$ | almost purely covalent, nonpolar (<5% ionic) |
| $0.5-1.7$ | **polar covalent** |
| $>1.7$ | mostly **ionic** (>50% ionic): the more electronegative atom almost fully controls the electrons |

- Two **nonmetals** (same region of the table, similar $\chi$): more **covalent**. **Metal + nonmetal** (different $\chi$): predominantly **ionic** (slide 40).
- Applying it: Li–F (Δ3) ionic; Be–O (Δ2) ionic by the slide's cut-off; H–Cl and C–O (Δ1) polar covalent; C–H (Δ0.5) borderline, nearly nonpolar.

**Reactivity parallels $\chi$ (redox, slides 41–42):**
- **Metals**: low $\chi$ = easy to oxidise (groups 1, 2: very reactive). High $\chi$ = hard to oxidise (Pt, Ir, Rh, Au, Pd: noble metals). Reactivity **decreases across a row** as $\chi$ rises.
- **Nonmetals**: oxidising power (how easily reduced) parallels $\chi$: **increases across a row** and **decreases down a column**. F$_2$ is the strongest oxidiser.
`,
      traps: [
        'The 1.7 and 0.5 cut-offs are rules of thumb; bonding is a continuum, not two boxes.',
        'High $\\chi$ for a **metal** means *unreactive*, but high $\\chi$ for a **nonmetal** means a *strong oxidiser*.',
      ],
    },
  ],
}
