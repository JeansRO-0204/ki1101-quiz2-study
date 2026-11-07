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
      md: r`
- **Chemical bond** = attractive force holding atoms together in molecules and ionic compounds. Reactions = **break old bonds, form new bonds**, so bond changes underlie all reactivity.
- **Covalent bonding**: occurs in molecules; electrons are **shared**.
- **Ionic bonding**: occurs in ionic solids; electrons are **transferred** from one atom to another. Simpler, so we start here.
- In reality bonding is a continuum between the two extremes (the last two sections quantify this with electronegativity).
`,
    },
    {
      id: 'ionic',
      title: 'Ionic bonds & ionic compounds',
      slides: [4, 5, 6],
      md: r`
- **Ionic bond** = electrostatic attraction between oppositely charged ions: Na$^+$ Cl$^-$.
- Metal + nonmetal gives ionic bonding because:
  - metals have **low ionization energies** (lose e$^-$ easily);
  - nonmetals have **very exothermic electron affinities** (gain e$^-$ readily);
  - **formation of the lattice** stabilises the ions (the big energy payoff).
- Open questions the lecture answers: why Na$^+$ not Na$^{2+}$ or Na$^-$? Why Cl$^-$ not Cl$^{2-}$ or Cl$^+$? (Sections 4–6.)
- **Ionic crystal** = 3-D array of cations and anions (lattice). Formulas are always **empirical formulas**: the smallest whole-number ratio (NaCl, not Na$_2$Cl$_2$).
`,
      traps: ['There are no discrete "NaCl molecules" in the solid. The formula is a ratio, not a molecule.'],
    },
    {
      id: 'energetics',
      title: 'Energetics: the Born–Haber path',
      slides: [7, 8],
      widgets: ['ionic-energetics'],
      md: r`
A stable compound forms only if the potential energy of the system **decreases**: $\Delta H_f^\circ<0$. Use **Hess's law**: the net energy change is the same along any path (energy conserved), so compare the direct path with a step-by-step path.

**NaCl from its elements (slide 8, kJ/mol):**
| Step | Equation | $\Delta H$ |
|---|---|---|
| Atomise metal (sublimation) | Na(s) → Na(g) | +107.8 |
| Atomise nonmetal | ½Cl$_2$(g) → Cl(g) | +121.3 |
| Ionise metal | Na(g) → Na$^+$(g) + e$^-$ | IE = +495.4 |
| Add electron | Cl(g) + e$^-$ → Cl$^-$(g) | EA = −348.8 |
| Form lattice | Na$^+$(g) + Cl$^-$(g) → NaCl(s) | $\Delta H_{lattice}$ = −787 |
| **Sum** | Na(s) + ½Cl$_2$(g) → NaCl(s) | **−411** (direct: −411.1) |

$$\Delta H_f^\circ=\Delta H_{sub}+\tfrac12 D+IE+EA+\Delta H_{lattice}$$

**Use it backwards:** if $\Delta H_f^\circ$ is known, $\Delta H_{lattice}=\Delta H_f^\circ-(\text{sum of the other four steps})$. For NaCl: $-411.1-(107.8+121.3+495.4-348.8)=-786.8\approx-787$ kJ/mol.

Note the energy-uphill steps (+375.7 total) are paid back, with interest, by the lattice term (−787).
`,
      traps: [
        'Sign errors: atomisation and IE are **positive**, EA is usually **negative**, lattice energy is **negative**.',
        'Don\'t forget the ½ for Cl$_2$ (you atomise half a mole of Cl$_2$ per mole of NaCl). For O$_2$ it is ½ O$_2$ per O.',
        'The slide\'s steps sum to −411.3; the slide rounds to −411 (and uses −411.1 for the direct path).',
      ],
    },
    {
      id: 'lattice',
      title: 'Lattice energy',
      slides: [9, 10, 11],
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

Greatest lattice energy = **calcium nitride**. In reality, smaller ions also raise it (MgO > CaO; LiF > CsI).
`,
      traps: [
        'Use the **ion charges**, not subscripts in the formula (Ca$_3$N$_2$: 2+ and 3−, product 6).',
        '"Greatest lattice energy" means most negative $\\Delta H$. Don\'t confuse magnitude with sign.',
      ],
    },
    {
      id: 'why-ions',
      title: 'Why metals form cations and nonmetals anions',
      slides: [12, 13, 14, 15, 16, 17],
      md: r`
| | Metal (left) | Nonmetal (right) |
|---|---|---|
| IE | small, positive: cheap to remove e$^-$ | large: hard to remove e$^-$ |
| EA | small / unfavourable | large, negative: e$^-$ added with a big energy release |
| Cheapest route | form cation | form anion |

**The noble-gas core limits the charge.** Removing electrons from a stable core costs far more than the lattice can repay:
- Na: IE$_1$ = 496, IE$_2$ = 4563 kJ/mol (~10× jump). So Na$^+$ = [Ne] forms, Na$^{2+}$ doesn't.
- Ca: IE$_1$ = 590, IE$_2$ = 1140, IE$_3$ = 4940. Ca$^{2+}$ = [Ar] forms (lattice energy ≈ 2000 kJ/mol repays IE$_1$+IE$_2$); Ca$^{3+}$ doesn't.
- Anions: Cl [Ne]3s²3p⁵ → Cl$^-$ = [Ar]. A second e$^-$ would have to go into the next shell: far too costly.

**Oxide is the exception that proves the rule:** O → O$^-$: EA$_1$ = −141 kJ/mol; O$^-$ → O$^{2-}$: EA$_2$ = +844 kJ/mol; net EA = **+703 kJ/mol** (endothermic!). The much larger lattice energy from the 2− charge more than repays this.
`,
      traps: [
        'Successive IEs always increase; the cut-off is where the next electron comes from a **noble-gas core**.',
        'O$^{2-}$ is stable only **in a lattice** (net EA is endothermic), not as a free gas-phase ion.',
      ],
    },
    {
      id: 'octet',
      title: 'Octet rule & s/p-block ions',
      slides: [17, 18, 19, 24, 25],
      widgets: ['econfig'],
      md: r`
**Octet rule:** atoms gain or lose electrons until the valence shell has **8 electrons** (the nearest noble-gas configuration; He has 2).
- Works for: **groups 1 and 2, Al, nonmetals**.
- Fails for: **H and He** (limited to 2 e$^-$ in $n=1$), **transition metals**, **post-transition metals**.
- **Cations** lose their valence electrons to match the *previous* noble gas; **anions** gain to match the *next* noble gas.

| Atom | Ion | Configuration |
|---|---|---|
| Na | Na$^+$ | [Ne] |
| Cs ([Xe]6s¹) | Cs$^+$ | [Xe] |
| Ca ([Ar]4s²) | Ca$^{2+}$ | [Ar] |
| Cl ([Ne]3s²3p⁵) | Cl$^-$ | [Ar] |
| O ([He]2s²2p⁴) + 2 e$^-$ | O$^{2-}$ | [He]2s²2p⁶ = [Ne] |
| N ([He]2s²2p³) + 3 e$^-$ | N$^{3-}$ | [Ne] |

**Isoelectronic** species share the same electron count: N$^{3-}$, O$^{2-}$, F$^-$, Ne, Na$^+$, Mg$^{2+}$, Al$^{3+}$ all have 10 e$^-$.
`,
      traps: ['Don\'t give Cs$^+$ a leftover 6s electron: **all** of the valence s electron is lost.', 'Count electrons added: O needs **2**, N needs **3** to reach [Ne].'],
    },
    {
      id: 'tm',
      title: 'Transition & post-transition metal ions',
      slides: [20, 21, 22, 23, 24],
      widgets: ['econfig'],
      md: r`
**Post-transition metals** (Sn, Pb, Bi…): do **not** reach a noble-gas configuration. They lose the outer **p electrons first, then s**.
- Sn [Kr]4d¹⁰5s²5p² → **Sn$^{2+}$ [Kr]4d¹⁰5s²** (5p emptied) → **Sn$^{4+}$ [Kr]4d¹⁰** (5s also lost; pseudo-noble 4d¹⁰ core).
- Pb behaves the same: Pb$^{2+}$ [Xe]4f¹⁴5d¹⁰6s², Pb$^{4+}$ [Xe]4f¹⁴5d¹⁰.
- Bi [Xe]4f¹⁴5d¹⁰6s²6p³ → **Bi$^{3+}$** (loses 6p³) and **Bi$^{5+}$** (also 6s²).

**Transition metals:** electrons are removed from the **highest $n$ first, then highest $\ell$**. So the **ns electrons go before (n−1)d**, even though ns filled first.
- Fe [Ar]3d⁶4s² → **Fe$^{2+}$ [Ar]3d⁶** → **Fe$^{3+}$ [Ar]3d⁵** (half-filled d, extra stable).
- Mn$^{2+}$ [Ar]3d⁵, Fe$^{3+}$ [Ar]3d⁵, Zn$^{2+}$ [Ar]3d¹⁰ (exactly half/fully filled d are favoured).
- Cu [Ar]3d¹⁰4s¹ → **Cu$^{2+}$ [Ar]3d⁹** (slide 23: remove 4s¹ then one 3d). Cr is [Ar]3d⁵4s¹.
- M$^{2+}$ is the common state (lose the 2 ns electrons); higher charges come from losing d electrons.

**Trick:** rewrite the neutral configuration with the higher-$n$ subshell last (e.g. [Ar]3d⁶4s²), then peel electrons off the *right* end, p first.
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
      md: r`
- Same-element bond (H–H, Cl–Cl): **equal sharing**, nonpolar. Different elements: one atom pulls harder, giving **unequal sharing**: electron density shifts but is **not a full transfer**.
- Partial charges: in H–Cl the Cl end is $\delta^-$ and H is $\delta^+$ (slide: ±0.17).
- **Polar covalent bond** = a **dipole** (two poles). **Polar molecule** = has partial + and − ends due to polar bond(s).

**Dipole moment** (quantitative polarity):
$$\mu = q\times r,\qquad 1\ \text{D}=3.34\times10^{-30}\ \text{C·m}$$
($q$ = charge on either end, $r$ = distance between them.)

Slide 31 data: 
| | HF | HCl | HBr | HI | CO | NO |
|---|---|---|---|---|---|---|
| $\mu$ (D) | 1.83 | 1.09 | 0.82 | 0.45 | 0.11 | 0.16 |
| length (pm) | 91.7 | 127 | 141 | 161 | 113 | 115 |

**Worked example (HCl):** $\mu=1.09\times3.34\times10^{-30}=3.64\times10^{-30}$ C·m. $q=\mu/r=3.64\times10^{-30}/1.27\times10^{-10}=2.87\times10^{-20}$ C $=0.179\,e$ (0.18 of an electron charge, close to the slide's 0.17). 

Polarity falls from HF to HI as electronegativity difference shrinks, even though bond length grows.
`,
      traps: [
        'A polar **bond** ≠ polar **molecule** (shape matters: L10). Here we only treat diatomics.',
        'Partial charge is a **fraction** of $e$, never a full transfer, even in HF.',
        'Convert pm to m (×10⁻¹²) and D to C·m before using $\\mu=qr$.',
      ],
    },
    {
      id: 'en',
      title: 'Electronegativity scale & trends',
      slides: [32, 33, 34, 35, 36, 37],
      widgets: ['polarity-en'],
      md: r`
**Electronegativity ($\chi$)**: ability of a bonded atom to attract bonding electrons to itself. **Bond polarity estimate:** $\Delta\chi=|\chi_1-\chi_2|$. Direction: the **more electronegative** atom is $\delta^-$.

**Shortcut to memorise (slide 34):** $\chi$(H) ≈ 2.0, $\chi$(F) ≈ 4.0, and it **drops by 0.5 per element going left** across period 2:
| H | Li | Be | B | C | N | O | F |
|---|---|---|---|---|---|---|---|
| 2 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 |
Third period: P 2, S 2.5, Cl 3.0. (Slide 33's full table: H 2.1, C 2.5, N 3.1, O 3.5, F 4.1, Cl 2.9, Br 2.8, Na 1.0, Cs 0.9.)

**Learning Check (slide 35):**
| Bond | $\chi$ values | $\Delta\chi$ |
|---|---|---|
| H–Cl | 2, 3 | 1 |
| C–O | 2.5, 3.5 | 1 |
| C–H | 2.5, 2 | 0.5 |
| Li–F | 1, 4 | 3 |
| Be–O | 1.5, 3.5 | 2 |

**Trends:** $\chi$ **increases left → right** across a period (Zeff increases) and **decreases top → bottom** down a group ($n$ increases). So F is the most electronegative; Cs/Fr are the least.
`,
      traps: ['Δχ is an absolute difference: write it positive and put δ⁻ on the higher-χ atom.', 'Hydrogen ≈ 2.0–2.1 sits between B and C, so C–H is only weakly polar.'],
    },
    {
      id: 'ionic-char',
      title: 'Ionic character & reactivity',
      slides: [38, 39, 40, 41, 42],
      md: r`
$\Delta\chi$ is a measure of the **ionic character** of a bond (slides 38–39):
| $\Delta\chi$ | Bond type |
|---|---|
| $<0.5$ | almost purely covalent, nonpolar (<5% ionic) |
| $0.5-1.7$ | **polar covalent** |
| $>1.7$ | mostly **ionic** (>50% ionic): the more electronegative atom almost fully controls the electrons |
| 0 | nonpolar covalent (identical atoms) |

- Two **nonmetals** (same region of the table, similar $\chi$): more **covalent**. **Metal + nonmetal** (different $\chi$): predominantly **ionic**.
- Applying it: Li–F (Δ3) ionic; Be–O (Δ2) ionic by the slide's cut-off; H–Cl (Δ1) polar covalent; C–H (Δ≈0.5) borderline/nearly nonpolar.

**Reactivity parallels $\chi$ (redox):**
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
