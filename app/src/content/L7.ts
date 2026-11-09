// Learn content for L7. Owned by the content agent. Markdown + KaTeX; cite slides via `slides`.
import type { Lecture } from '../types'

const r = String.raw

export const lecture: Lecture = {
  id: 'L7',
  title: 'Atomic Structure',
  summary:
    'From light as a wave and a particle (λν = c, E = hν), through the photoelectric effect and the hydrogen line spectrum (Rydberg, Bohr), to wave functions, quantum numbers, orbital shapes, electron configurations of atoms and ions, and the periodic trends in radius, ionization energy and electron affinity.',
  sections: [
    {
      id: 'duality',
      title: 'Why classical physics failed: duality',
      slides: [2, 3],
      essentials: [
        'Light behaves as a **wave** (interference) *and* as **particles** (photons).',
        'Electrons behave as **particles** *and* as **waves** (diffraction, interference).',
        'So atoms need a **quantum** description: energy comes in fixed steps (quantised).',
      ],
      md: r`
- Late 1800s: **matter = particles**, **energy = waves**. Classical physics could not describe atoms and molecules.
- Early 1900s experiments broke the split:
  - **Light** shows interference (wave) *and* comes in packets (particle).
  - **Electrons** act as tiny charged particles in some experiments and as **waves** in others (diffraction, interference).
- Result: atoms need a *quantum* description. Everything in L7 follows from this: quantised energy, orbitals, quantum numbers.
`,
      traps: ['"Wave or particle?" is not either/or. Which behaviour you see depends on the experiment.'],
    },
    {
      id: 'wave',
      title: 'Light as a wave',
      slides: [4, 5, 6, 7, 9, 10, 11, 12],
      widgets: ['light'],
      essentials: [
        '$\\lambda\\nu = c$: wavelength and frequency are **inversely** proportional.',
        'Always convert nm → m ($\\times10^{-9}$) before using $c$ in m/s.',
        'Increasing $\\lambda$: γ-ray < X-ray < UV < visible (violet 400 → red 700 nm) < IR < microwave < radio. Energy runs the other way.',
      ],
      formulas: [
        { name: 'Speed of light', tex: r`c = \lambda\nu`, where: r`$c = 2.998\times10^{8}$ m/s; $\lambda$ = wavelength (m); $\nu$ = frequency (Hz = s$^{-1}$)` },
        { name: 'Unit conversions', tex: r`1\ \text{nm} = 10^{-9}\ \text{m},\quad 1\ \text{cm} = 10^{-2}\ \text{m},\quad 1\ \text{m} = 10^{9}\ \text{nm}`, where: 'convert before plugging in' },
      ],
      md: r`
**Wave properties**
- **Wavelength** $\lambda$: distance between successive peaks (m).
- **Frequency** $\nu$: waves passing a point per second (Hz = s$^{-1}$).
- **Amplitude**: maximum height = intensity. **Nodes**: points of zero amplitude.
- **Interference**: in-phase waves add (constructive, bigger amplitude); out-of-phase waves cancel (destructive).

**Electromagnetic radiation** (light) travels at $c = 2.998\times10^{8}$ m/s in vacuum (slide: $2.9979\times10^8$).

$$\lambda\,\nu = c \qquad\Rightarrow\qquad \nu=\frac{c}{\lambda}$$

- $\lambda$ and $\nu$ are **inversely proportional**: short wavelength means high frequency.
- Order of the EM spectrum by increasing $\lambda$ (decreasing $\nu$ and $E$): $\gamma$-ray < X-ray < UV < **visible (violet ≈ 400 nm → red ≈ 700 nm)** < IR < microwave < radio.
- **Continuous spectrum**: unbroken range of all colours (white light through a prism). A spark through a gas under vacuum excites the atoms, which then emit light (leads to line spectra below).

**Worked example.** Green light $\lambda = 500$ nm.
$\lambda = 500\times10^{-9}$ m $=5.00\times10^{-7}$ m, so $\nu = c/\lambda = 2.998\times10^8 / 5.00\times10^{-7} = 5.996\times10^{14}$ Hz.
`,
      traps: [
        'Convert nm to m ($10^{-9}$) before using $c=\\lambda\\nu$.',
        'Violet is the high-energy end of visible light, red the low-energy end.',
      ],
    },
    {
      id: 'photon',
      title: 'Light as particles: photons',
      slides: [13],
      widgets: ['light'],
      essentials: [
        '$E = h\\nu = hc/\\lambda$ gives energy **per photon** (≈ $10^{-19}$ J for visible light).',
        'Per mole of photons: multiply by $N_A = 6.022\\times10^{23}$, then ÷ 1000 for kJ/mol.',
        'Shorter λ → higher ν → more energy per photon. Brighter light = more photons, same energy each.',
      ],
      formulas: [
        { name: 'Photon energy', tex: r`E = h\nu = \frac{hc}{\lambda}`, where: r`$E$ in J per photon; $h = 6.626\times10^{-34}$ J·s; $\lambda$ in m` },
        { name: 'Energy per mole of photons', tex: r`E_{\text{mol}} = N_A\,\frac{hc}{\lambda}`, where: r`$N_A = 6.022\times10^{23}$ mol$^{-1}$; result in J/mol (÷1000 → kJ/mol)` },
        { name: 'Number of photons', tex: r`N = \frac{E_{\text{total}}}{E_{\text{photon}}}`, where: 'total energy delivered ÷ energy of one photon (both in J)' },
      ],
      md: r`
Planck and Einstein (1905): radiation is a stream of **quanta (photons)**, each travelling at $c$ with frequency $\nu$.

$$E_{\text{photon}} = h\nu = \frac{hc}{\lambda}\qquad h = 6.626\times10^{-34}\ \text{J·s}$$

- $E \propto \nu$ and $E\propto 1/\lambda$: UV photons carry more energy than visible, visible more than IR.
- That is **per photon**. For **per mole** multiply by $N_A = 6.022\times10^{23}$ and divide by 1000 for kJ/mol.

**How to use it (500 nm photon):**
1. Convert: $\lambda = 500\ \text{nm} = 5.00\times10^{-7}$ m.
2. Per photon: $E = \dfrac{(6.626\times10^{-34})(2.998\times10^{8})}{5.00\times10^{-7}} = 3.97\times10^{-19}$ J.
3. Per mole: $3.97\times10^{-19}\times6.022\times10^{23} = 2.39\times10^{5}$ J/mol $= 239$ kJ/mol.

Units check: J·s × (m/s) ÷ m = J.

**Going backwards** (energy → λ): $\lambda = hc/E$. If $E$ is given in kJ/mol, first convert to J per photon: ×1000, then ÷ $N_A$.
`,
      traps: [
        'Photon energy is in **J per photon**, around $10^{-19}$ J. Multiply by $N_A$ to get J/mol.',
        'Doubling the **intensity** doubles the number of photons, not the energy per photon.',
        'kJ/mol → J/photon: ×1000 **and** ÷ $N_A$. Forgetting either is the classic slip.',
      ],
    },
    {
      id: 'photoelectric',
      title: 'Photoelectric effect',
      slides: [14, 15, 16],
      widgets: ['photoelectric'],
      essentials: [
        'One photon ejects at most one electron, and only if $h\\nu \\ge \\phi$ (the work function).',
        'Extra energy becomes kinetic energy: $KE_{\\max} = h\\nu - \\phi$.',
        'Below the threshold frequency $\\nu_0$: **no** electrons, however bright the light.',
        'Intensity changes the **number** of electrons; frequency changes their **KE**.',
      ],
      formulas: [
        { name: 'Einstein photoelectric equation', tex: r`h\nu = \phi + KE_{\max}\quad\Rightarrow\quad KE_{\max} = h\nu - \phi`, where: r`$\phi$ = work function (J), minimum energy to free one electron from the metal; $KE_{\max}$ in J` },
        { name: 'Threshold frequency / wavelength', tex: r`\nu_0 = \frac{\phi}{h},\qquad \lambda_0 = \frac{hc}{\phi}`, where: r`light with $\nu<\nu_0$ (i.e. $\lambda>\lambda_0$) ejects nothing` },
        { name: 'Electron speed (if asked)', tex: r`KE = \tfrac12 m_e v^2`, where: r`$m_e = 9.109\times10^{-31}$ kg; general physics, not on the slides` },
      ],
      md: r`
Light shining on a metal can eject electrons (Einstein's Nobel Prize experiments).

$$h\nu = \phi + KE \qquad\Rightarrow\qquad KE = h\nu-\phi,\qquad \nu_0=\frac{\phi}{h}$$

$\phi$ = **work function** (minimum energy to free an electron from the metal; E of free e$^-$ minus E of bound e$^-$).

**What the experiment shows (slide 15 graphs):**
| Graph | Result | Why |
|---|---|---|
| (a) # e$^-$ vs $\nu$ | **No electrons below threshold $\nu_0$**, however bright | one photon must carry $\ge\phi$ |
| (b) # e$^-$ vs intensity ($\nu>\nu_0$) | straight line up | more photons → more electrons |
| (c) KE vs $\nu$ | zero at $\nu_0$, then linear rise (slope $h$) | extra energy becomes KE |
| (d) KE vs intensity | **flat** | each electron absorbs one photon of fixed $h\nu$ |

**Slide 16 energy diagrams:** $E_i>\phi$ ejects the electron with KE $=E_i-\phi$; $E_i=\phi/2$ does nothing; three photons of $\phi/2$ do **not** add up, since electrons absorb one photon at a time.

**How to use it.** $\phi = 4.5\times10^{-19}$ J, light 200 nm.
1. Photon energy: $E=hc/\lambda = (6.626\times10^{-34})(2.998\times10^8)/(2.00\times10^{-7}) = 9.93\times10^{-19}$ J.
2. Compare: $E>\phi$, so electrons are ejected.
3. $KE_{\max} = 9.93\times10^{-19}-4.5\times10^{-19} = 5.43\times10^{-19}$ J.
4. Threshold: $\lambda_0 = hc/\phi = 4.41\times10^{-7}$ m $= 441$ nm. Any light longer than 441 nm does nothing.

If $\phi$ is given in kJ/mol, convert it to J per electron first (×1000, ÷ $N_A$). The worked $\phi$ value here is illustrative, not from the slides.
`,
      traps: [
        'Brighter light below the threshold frequency still ejects **no** electrons.',
        'Intensity changes the **number** of electrons, not their KE. Frequency changes the KE.',
        'Energies of several low-energy photons cannot be pooled.',
        'If $h\\nu<\\phi$, the answer is "no electron", not a negative KE.',
      ],
    },
    {
      id: 'spectrum',
      title: 'Hydrogen line spectrum & Rydberg equation',
      slides: [17, 18, 19, 20, 21, 22, 25],
      figures: ['L7-h-series'],
      essentials: [
        'Each element gives a unique **line** spectrum: only fixed photon energies, so electron energy is **quantised**.',
        'Series is set by the **lower (final)** level: Lyman → n = 1 (UV), Balmer → n = 2 (visible), Paschen → n = 3 (IR).',
        'Rydberg: $1/\\lambda = R_H(1/n_1^2 - 1/n_2^2)$ with $n_1$ the lower level. Watch the units of $R_H$.',
        'Workflow: $1/\\lambda$ → $\\lambda$ (convert to nm) → $\\Delta E = hc/\\lambda$ (J/photon) → ×$N_A$ if per mole.',
      ],
      formulas: [
        { name: 'Rydberg equation', tex: r`\frac{1}{\lambda}=R_H\left(\frac{1}{n_1^2}-\frac{1}{n_2^2}\right),\quad n_2>n_1`, where: r`$R_H = 109{,}678$ cm$^{-1}$ (slide) $=1.097\times10^{7}$ m$^{-1}$; $n_1$ = lower level, $n_2$ = upper level` },
        { name: 'One-electron ions (He⁺, Li²⁺ …)', tex: r`\frac{1}{\lambda}=R_H Z^2\left(\frac{1}{n_1^2}-\frac{1}{n_2^2}\right)`, where: r`$Z$ = nuclear charge (He⁺: 2, Li²⁺: 3). General knowledge, not on the slides` },
        { name: 'Photon energy of the line', tex: r`\Delta E = \frac{hc}{\lambda} = hc\,R_H\left(\frac{1}{n_1^2}-\frac{1}{n_2^2}\right)`, where: r`J per photon; $hcR_H = b = 2.18\times10^{-18}$ J` },
      ],
      md: r`
- **Line (atomic/emission) spectrum** (slide 18): only a few discrete lines; **each element has a unique one**.
- Hydrogen is simplest (one electron). **Balmer** found an empirical equation for the visible lines; **Rydberg** generalised it to all H lines (IR, visible and UV).

$$\frac{1}{\lambda}=R_H\left(\frac{1}{n_1^2}-\frac{1}{n_2^2}\right),\qquad n_2>n_1$$

- $R_H = 109{,}678\ \text{cm}^{-1}$ (slide) $=1.097\times10^{7}$ m$^{-1}$. Keep units consistent!
- $n_1,n_2$ are whole numbers = allowed energy levels. In emission the electron drops **from $n_2$ (upper) to $n_1$ (lower)**. If $n_1 = 1$ then $n_2 = 2, 3, 4,\dots$

**The three series (named by the level the electron lands on):**
| Series | Lands on $n_1$ | Starts from $n_2$ | Region | Example line |
|---|---|---|---|---|
| Lyman | 1 | 2, 3, 4, … | UV | 2→1: 121.6 nm |
| Balmer | 2 | 3, 4, 5, … | visible | 3→2: 656 nm (red) |
| Paschen | 3 | 4, 5, 6, … | IR | 4→3: 1875 nm |

The series names and regions are standard (the slides name Balmer and the IR/Vis/UV ranges; Lyman and Paschen are general knowledge).

**Step-by-step workflow (Balmer $n_2 = 5 \to n_1 = 2$):**
1. **Identify** $n_1$ (lower) $=2$ and $n_2$ (upper) $=5$.
2. **Bracket:** $\tfrac{1}{2^2}-\tfrac{1}{5^2} = 0.25-0.04 = 0.21$.
3. **$1/\lambda$:** $1.097\times10^{7}\ \text{m}^{-1}\times0.21 = 2.304\times10^{6}\ \text{m}^{-1}$.
4. **$\lambda$:** $1/(2.304\times10^{6}) = 4.341\times10^{-7}$ m $\times10^{9}$ = **434.1 nm** (blue-violet, visible ✓).
5. **$\Delta E$:** $hc/\lambda = (6.626\times10^{-34})(2.998\times10^{8})/(4.341\times10^{-7}) = 4.58\times10^{-19}$ J per photon.
6. **Optional:** $\nu = c/\lambda = 6.91\times10^{14}$ Hz; per mole $4.58\times10^{-19}\times N_A = 276$ kJ/mol.

**Slide 21 exercise** (with $R_H$ in cm$^{-1}$): Balmer $6\to2$:
$1/\lambda = 109{,}678\,(1/4-1/36)=24{,}373$ cm$^{-1}$ → $\lambda = 4.103\times10^{-5}$ cm × (1 m/100 cm) × (1 nm/$10^{-9}$ m) $=410.3$ nm (violet line).

**One-electron ions (general knowledge):** for He⁺, Li²⁺ … multiply by $Z^2$. He⁺ $2\to1$: $1/\lambda = 1.097\times10^7\times4\times0.75 = 3.29\times10^7$ m$^{-1}$, $\lambda = 30.4$ nm (4× shorter than H's 121.6 nm).

**Significance (slide 22):** only fixed energies are emitted, so the electron's energy is **quantised** (restricted to fixed levels). Any theory of the atom must explain line spectra and quantisation.
`,
      traps: [
        'Putting $n_1>n_2$ gives a negative $1/\\lambda$. The larger $n$ goes second.',
        'Mixing $R_H$ in cm$^{-1}$ with answers in m: convert 1 m = 100 cm = $10^9$ nm.',
        'The series is named by where the electron **lands**, not where it starts: 5→2 is Balmer, 5→3 is Paschen.',
        'You get $1/\\lambda$ first. Don\'t forget to take the reciprocal.',
      ],
    },
    {
      id: 'bohr',
      title: 'Quantisation & the Bohr model',
      slides: [23, 24, 25, 26, 27, 28, 29, 30],
      widgets: ['hatom'],
      essentials: [
        '$E_n = -b/n^2$ with $b = 2.18\\times10^{-18}$ J: $E$ is **negative** (bound), 0 at $n=\\infty$.',
        '$n=1$ is the ground state (most negative, most stable). Levels crowd together as $n$ grows.',
        'Emission: $\\Delta E = E_h - E_l = b(1/n_l^2 - 1/n_h^2) = h\\nu$. Absorption needs exactly the same gap.',
        'Ionisation of H from $n=1$: $\\Delta E = b = 2.18\\times10^{-18}$ J/atom = 1312 kJ/mol.',
      ],
      formulas: [
        { name: 'Bohr energy levels (H)', tex: r`E_n = -\frac{b}{n^2} = -\frac{R_H h c}{n^2}`, where: r`$b = 2.1788\times10^{-18}$ J/atom; $n = 1, 2, 3, \dots$; $E$ in J, negative = bound` },
        { name: 'Energy of an emitted photon', tex: r`\Delta E = E_h - E_l = b\left(\frac{1}{n_l^2}-\frac{1}{n_h^2}\right) = h\nu = \frac{hc}{\lambda}`, where: r`$h$ = higher level, $l$ = lower level (slide 29); $\Delta E$ > 0 is the photon energy` },
        { name: 'One-electron ions', tex: r`E_n = -\frac{bZ^2}{n^2}`, where: r`$Z$ = nuclear charge. General knowledge, not on the slides` },
        { name: 'Ionisation energy from level n', tex: r`IE = E_\infty - E_n = \frac{b}{n^2}`, where: 'J per atom; ×N_A ÷ 1000 → kJ/mol' },
      ],
      md: r`
**Quantised** = only certain discrete values allowed (like rungs of a ladder, not a ramp; slide 23).

- **Absorption** of a photon (+$h\nu$): electron goes to a higher level (excited state). **Emission** (−$h\nu$): it drops to a lower level and emits a photon (slide 24).
- Each transition always gives the **same** photon energy, hence a sharp line. "Every time e⁻ drops from n = 3 to n = 1, the same frequency photon is emitted" (slide 25).

**Bohr model (first model to explain the Rydberg equation):** electron moves in fixed orbits, each with fixed energy.

$$E_n=-\frac{b}{n^2}=-\frac{R_H h c}{n^2},\qquad b = 2.18\times10^{-18}\ \text{J/atom}\ (2.1788\times10^{-18}),\quad n=1,2,3,\dots$$

| $n$ | 1 | 2 | 3 | 4 | ∞ |
|---|---|---|---|---|---|
| $E_n$ (slide 25 labels) | $-b$ | $-0.25b$ | $-0.11b$ | $-0.062b$ | 0 |
| $E_n$ (J) | $-2.18\times10^{-18}$ | $-5.45\times10^{-19}$ | $-2.42\times10^{-19}$ | $-1.36\times10^{-19}$ | 0 |

- $E<0$ because of Coulomb attraction; $E=0$ at $n=\infty$ (electron free). **More negative = more stable.**
- $n=1$: **ground state**, lowest energy. $n\ge2$: excited states (less stable, quickly drop back).
- Photon energy for $n_h\to n_l$ (higher to lower):
$$\Delta E = E_h - E_l = b\left(\frac{1}{n_l^2}-\frac{1}{n_h^2}\right)=h\nu=\frac{hc}{\lambda}$$

**Worked example ($n=4\to2$):**
1. $\Delta E = 2.18\times10^{-18}\,(1/4-1/16) = 2.18\times10^{-18}\times0.1875 = 4.09\times10^{-19}$ J.
2. $\lambda = hc/\Delta E = (1.986\times10^{-25}\ \text{J·m})/(4.09\times10^{-19}\ \text{J}) = 4.86\times10^{-7}$ m $= 486$ nm (blue-green Balmer line).

This is the same answer the Rydberg equation gives, because $b = R_H hc$.

Ionisation of ground-state H: $n=1\to\infty$, $\Delta E=2.18\times10^{-18}$ J $\times N_A = 1312$ kJ/mol.

**Bohr fails (slide 30):** cannot explain spectra of multi-electron atoms, and cannot explain why the atom does not collapse (an orbiting charge should radiate and spiral into the nucleus). Replaced by wave mechanics.
`,
      traps: [
        'Levels get **closer together** as $n$ increases. The gap 3→2 is much smaller than 2→1.',
        'A negative $E_n$ is not "less energy than nothing"; it is bound. $n=1$ is the most negative.',
        'Absorption needs exactly $E_{n_f}-E_{n_i}$; an electron cannot absorb a photon that does not match a gap.',
        '$\\Delta E$ for the photon is reported as a positive number, even though $E_{\\text{final}} - E_{\\text{initial}}$ is negative for emission.',
      ],
    },
    {
      id: 'lines',
      title: 'Counting & ranking emission lines',
      slides: [20, 25, 29],
      figures: ['L7-h-from-n4'],
      essentials: [
        'From level $n$, the number of possible emission lines is $\\dfrac{n(n-1)}{2}$: 2 → 1, 3 → 3, 4 → 6, 5 → 10, 6 → 15.',
        'List them systematically: every pair (upper, lower) with upper ≤ $n$.',
        '**Biggest jump** (to n = 1 from the top) = largest ΔE, highest ν, **shortest λ**.',
        '**Smallest jump** (top level to the one just below) = smallest ΔE, **longest λ**.',
      ],
      formulas: [
        { name: 'Number of emission lines from level n', tex: r`N_{\text{lines}} = \binom{n}{2} = \frac{n(n-1)}{2}`, where: 'count of distinct pairs of levels between n and 1. General knowledge, not stated on the slides' },
        { name: 'Ranking rule', tex: r`\Delta E \uparrow \;\Leftrightarrow\; \nu \uparrow \;\Leftrightarrow\; \lambda \downarrow`, where: r`because $\Delta E = h\nu = hc/\lambda$` },
      ],
      md: r`
An electron excited to level $n$ can come back down in one jump or in several smaller jumps, so many atoms together emit **every** pair of levels between $n$ and 1.

**How to list them (from $n = 4$):** go level by level from the top.
- From 4: 4→3, 4→2, 4→1 (3 lines)
- From 3: 3→2, 3→1 (2 lines)
- From 2: 2→1 (1 line)
- Total $3+2+1 = 6 = \tfrac{4\cdot3}{2}$.

| Line | Series | $\tfrac{1}{n_l^2}-\tfrac{1}{n_h^2}$ | λ (nm) | Region |
|---|---|---|---|---|
| 4→1 | Lyman | 0.9375 | 97.2 | UV, **highest E / shortest λ** |
| 3→1 | Lyman | 0.8889 | 102.6 | UV |
| 2→1 | Lyman | 0.7500 | 121.6 | UV |
| 4→2 | Balmer | 0.1875 | 486 | visible (blue-green) |
| 3→2 | Balmer | 0.1389 | 656 | visible (red) |
| 4→3 | Paschen | 0.0486 | 1875 | IR, **lowest E / longest λ** |

**Ranking without a calculator:** the bigger the bracket $\left(\tfrac{1}{n_l^2}-\tfrac{1}{n_h^2}\right)$, the bigger ΔE. Any jump to n = 1 beats any jump to n = 2, which beats any jump to n = 3, because the levels crowd together higher up.

**Variations a quiz uses:**
- "How many **visible** lines from n = 5?" Only Balmer lines count: 5→2, 4→2, 3→2 = 3.
- "Which transition **absorbs** the most energy?" Same ranking, arrows reversed (1→4 beats 1→3).
- "Single electron in n = 4, maximum number of photons it can emit?" One electron cascading 4→3→2→1 emits **3** photons; the 6 lines need many atoms.
`,
      traps: [
        'n(n−1)/2 counts **distinct lines** from many atoms. One electron cascading down step by step emits at most $n-1$ photons.',
        'The longest arrow has the **shortest** wavelength. Don\'t rank λ the same way as ΔE.',
        '3→2 (656 nm) has **less** energy than 2→1 (122 nm), although both are "one step".',
      ],
    },
    {
      id: 'orbitals',
      title: 'Wave functions, quantum numbers & orbital shapes',
      slides: [31, 32, 33, 34, 35, 36, 37, 38],
      widgets: ['qnumbers'],
      essentials: [
        '$n$ = 1, 2, 3 …; $\\ell$ = 0 … $n-1$; $m_\\ell$ = $-\\ell$ … $+\\ell$; $m_s$ = $+\\tfrac12$ or $-\\tfrac12$.',
        'Orbitals per subshell $2\\ell+1$ (s 1, p 3, d 5, f 7); per shell $n^2$; electrons per shell $2n^2$.',
        'Nodes: total $n-1$ = radial $(n-\\ell-1)$ + angular $(\\ell)$.',
        'No 1p, 2d or 3f: $\\ell$ must be smaller than $n$.',
      ],
      formulas: [
        { name: 'Counting orbitals and electrons', tex: r`\text{orbitals in subshell} = 2\ell+1,\quad \text{orbitals in shell} = n^2,\quad e^-_{\max} = 2n^2`, where: 'each orbital holds 2 electrons (opposite spins)' },
        { name: 'Nodes', tex: r`\text{total} = n-1,\quad \text{radial} = n-\ell-1,\quad \text{angular} = \ell`, where: 'general knowledge; slide 38 shows the radial nodes as dips to zero in the 2s, 3s, 3p plots' },
      ],
      md: r`
**Electrons are waves too** (slide 31: they show interference/diffraction). Schrödinger (slide 32): $\hat H\Psi = E\Psi$, with $\Psi$ the wave function, $E$ the energy and $\hat H$ the Hamiltonian operator. $|\Psi|^2$ gives the **probability density** of finding the electron. An **orbital** is a region described by one $\Psi$ (not an orbit).

*Beyond the slides:* de Broglie $\lambda = h/mv$; Heisenberg uncertainty: no exact position and momentum together.

**The four quantum numbers**
| Symbol | Name | Allowed values | What it tells you |
|---|---|---|---|
| $n$ | principal | 1, 2, 3, … | shell: size and energy |
| $\ell$ | angular momentum (azimuthal) | 0 … $n-1$ (s = 0, p = 1, d = 2, f = 3) | subshell: shape |
| $m_\ell$ | magnetic | $-\ell, …, 0, …, +\ell$ ($2\ell+1$ values) | orientation of the orbital |
| $m_s$ | spin (beyond slides) | $+\tfrac12$ or $-\tfrac12$ | spin of the electron |

**Slide 34 table, expanded with nodes:**
| $n$ | $\ell$ (letter) | $m_\ell$ values | Orbitals | Radial nodes $n-\ell-1$ | Angular nodes $\ell$ |
|---|---|---|---|---|---|
| 1 | 0 (1s) | 0 | 1 | 0 | 0 |
| 2 | 0 (2s) | 0 | 1 | 1 | 0 |
| 2 | 1 (2p) | −1, 0, 1 | 3 | 0 | 1 |
| 3 | 0 (3s) | 0 | 1 | 2 | 0 |
| 3 | 1 (3p) | −1, 0, 1 | 3 | 1 | 1 |
| 3 | 2 (3d) | −2 … 2 | 5 | 0 | 2 |
| 4 | 3 (4f) | −3 … 3 | 7 | 0 | 3 |

- **Shapes (slides 35–37):** s spherical; p dumbbell (3 orientations, $p_x,p_y,p_z$); d four-lobed cloverleaf (plus $d_{z^2}$).
- **Slide 38** plots the probability against distance $r$: 1s has one hump; 2s has a small inner hump, a node, then a big hump; 3s has two nodes. The number of humps is $n-\ell$.

**How to find $n$, $\ell$, $m_\ell$, $m_s$ for a given electron**
1. Write the ground-state configuration of the atom or ion (for a cation, remove electrons from the highest $n$ first; see the ions section).
2. Pick the electron you are asked about (outermost = highest $n$; if several subshells share it, the one still being filled; an *unpaired* electron sits in a half-filled orbital).
3. **$n$** = the number in front of the subshell (3d → $n=3$). **$\ell$** from the letter: s 0, p 1, d 2, f 3.
4. **$m_\ell$**: draw the subshell as $2\ell+1$ boxes labelled $-\ell\ \dots\ +\ell$ from left to right. Fill with Hund's rule (one ↑ in each box first, then pair with ↓). The box your electron sits in gives $m_\ell$.
5. **$m_s$**: $+\tfrac12$ for ↑, $-\tfrac12$ for ↓. First electron in a box is ↑ by convention.

*Example:* Mn$^{3+}$ is $[\text{Ar}]3d^4$. Four unpaired electrons in 3d: $n=3,\ \ell=2$, $m_\ell$ is any of $-2,-1,0,+1$ (the filled boxes), $m_s=+\tfrac12$. Any one of those sets is a correct answer to "write one possible set".

*Check any set:* $\ell<n$? $|m_\ell|\le\ell$? $m_s=\pm\tfrac12$? All three must pass; otherwise the set is not allowed.

**Worked example.** Is $n=2,\ \ell=2$ allowed? No: $\ell\le n-1=1$. Is $n=3,\ \ell=1,\ m_\ell=-1$ allowed? Yes (a 3p orbital). How many electrons can have $n = 3$? $2n^2 = 18$. How many with $n=3,\ \ell=1$? 3 orbitals × 2 = 6.
`,
      traps: [
        'An orbital is **not** a path. It is a probability distribution.',
        '$\\ell$ must be **less than** $n$, so there is no 2d or 1p.',
        '$|m_\\ell|\\le\\ell$: a p subshell has $m_\\ell=-1,0,1$, never 2.',
        '$m_s$ is never 0 or 1: only $\\pm\\tfrac12$.',
      ],
    },
    {
      id: 'config',
      title: 'Orbitals in the periodic table & electron configuration',
      slides: [39],
      widgets: ['aufbau', 'econfig'],
      essentials: [
        'Filling order: 1s 2s 2p 3s 3p **4s 3d** 4p 5s 4d 5p 6s 4f 5d 6p.',
        'Pauli: ≤ 2 electrons per orbital, opposite spins. Hund: spread out with parallel spins before pairing.',
        'Exceptions: **Cr** $[\\text{Ar}]3d^54s^1$, **Cu** $[\\text{Ar}]3d^{10}4s^1$.',
        'The block (s, p, d, f) tells you which subshell is being filled (slide 39).',
      ],
      md: r`
Slide 39: the table is divided into **blocks** by the subshell being filled.
- **s block**: groups 1–2 (+ He). **p block**: groups 13–18. **d block**: groups 3–12 (fills $(n-1)d$). **f block**: lanthanides/actinides (fills $(n-2)f$).

| Subshell | $\ell$ | Orbitals | Max e⁻ | Block | Groups | Fills |
|---|---|---|---|---|---|---|
| s | 0 | 1 | 2 | s block | 1–2 (+ He) | $ns$ |
| p | 1 | 3 | 6 | p block | 13–18 | $np$ |
| d | 2 | 5 | 10 | d block | 3–12 | $(n-1)d$ |
| f | 3 | 7 | 14 | f block | lanthanides / actinides | $(n-2)f$ |

Block width in the table equals max electrons: 2, 6, 10, 14 columns.

*Filling rules (general knowledge, needed for L8 too):*
- **Aufbau**: fill lowest energy first: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s …
- **Pauli**: max 2 electrons per orbital, opposite spins (no two electrons share all four quantum numbers).
- **Hund**: degenerate orbitals each get one electron (parallel spins) before pairing.
- **Exceptions**: **Cr** $[\text{Ar}]3d^54s^1$ and **Cu** $[\text{Ar}]3d^{10}4s^1$ (half-/fully-filled d is extra stable). Also Mo, Ag, Au similarly.

**How to write one (Fe, Z = 26):** count 26 electrons along the order: $1s^2\,2s^2\,2p^6\,3s^2\,3p^6\,4s^2\,3d^6$ → shorthand $[\text{Ar}]\,3d^6\,4s^2$. Check: superscripts add to 26.

Examples: O $1s^22s^22p^4$ (two paired, two unpaired in 2p); Sn $[\text{Kr}]4d^{10}5s^25p^2$.
`,
      traps: [
        'Cr and Cu **promote** a 4s electron into 3d. Writing Cr as $3d^44s^2$ is wrong.',
        'The 4s fills before 3d, but is written **after** 3d and is the first lost on ionisation.',
      ],
    },
    {
      id: 'ions',
      title: 'Ions, outermost electron & magnetism',
      slides: [34, 39],
      essentials: [
        'Cations lose electrons from the **highest n first**: for transition metals **4s empties before 3d**. Fe³⁺ = $[\\text{Ar}]3d^5$, not $3d^34s^2$.',
        'Anions add electrons to the next open orbital: O²⁻ = $[\\text{Ne}]$, Cl⁻ = $[\\text{Ar}]$.',
        'Count unpaired electrons with Hund\'s rule. Any unpaired → **paramagnetic** (attracted to a magnet); all paired → **diamagnetic**.',
        'Outermost electron = an electron in the highest occupied subshell; write its $n, \\ell, m_\\ell, m_s$.',
      ],
      formulas: [
        { name: 'Unpaired electrons in a dⁿ ion', tex: r`\text{unpaired} = \begin{cases} n & n\le5\\ 10-n & n\ge5\end{cases}`, where: 'Hund\'s rule on five d orbitals (free ion). General knowledge' },
      ],
      md: r`
*This section is general knowledge that the quiz expects alongside slide 39; the slides do not show ion configurations.*

**Recipe for a transition-metal cation**
1. Write the neutral atom: Mn $[\text{Ar}]3d^54s^2$.
2. Remove electrons from the **4s first**, then 3d: Mn²⁺ $[\text{Ar}]3d^5$, Mn³⁺ $[\text{Ar}]3d^4$.
3. Draw the d boxes and apply Hund: 3d⁵ = ↑ ↑ ↑ ↑ ↑ (5 unpaired); 3d⁴ = ↑ ↑ ↑ ↑ _ (4 unpaired).
4. Decide magnetism: unpaired > 0 → paramagnetic.

| Species | Configuration | Unpaired | Magnetism |
|---|---|---|---|
| Fe | $[\text{Ar}]3d^64s^2$ | 4 | para |
| Fe²⁺ | $[\text{Ar}]3d^6$ | 4 | para |
| Fe³⁺ | $[\text{Ar}]3d^5$ | 5 | para |
| Mn²⁺ | $[\text{Ar}]3d^5$ | 5 | para |
| Mn³⁺ | $[\text{Ar}]3d^4$ | 4 | para |
| Ni²⁺ | $[\text{Ar}]3d^8$ | 2 | para |
| Cu⁺ | $[\text{Ar}]3d^{10}$ | 0 | **dia** |
| Cu²⁺ | $[\text{Ar}]3d^9$ | 1 | para |
| Zn²⁺ | $[\text{Ar}]3d^{10}$ | 0 | **dia** |
| O²⁻, Na⁺ | $[\text{Ne}]$ | 0 | **dia** |

Isoelectronic species have the same configuration: Na⁺, Mg²⁺, F⁻, O²⁻ and Ne are all $[\text{Ne}]$; Fe³⁺ and Mn²⁺ are both $[\text{Ar}]3d^5$.

**Quantum numbers of the outermost electron**
- Na $[\text{Ne}]3s^1$: the 3s electron has $n=3,\ \ell=0,\ m_\ell=0,\ m_s=+\tfrac12$.
- Cl⁻ $[\text{Ne}]3s^23p^6$: outermost subshell 3p, so $n=3,\ \ell=1,\ m_\ell\in\{-1,0,+1\},\ m_s=\pm\tfrac12$.
- Mn²⁺ $[\text{Ar}]3d^5$: outermost is **3d** (4s is empty), so $n=3,\ \ell=2$, $m_\ell$ from −2 to +2, all five with the same $m_s$ (parallel spins).

Any allowed combination is correct unless the question asks for the **last** electron by a fixed convention. The common one: label boxes $m_\ell = -\ell \dots +\ell$ from the left, fill left to right with ↑ first ($m_s=+\tfrac12$), then go back pairing with ↓ ($-\tfrac12$). With that, the last electron of 3d⁵ has $m_\ell=+2,\ m_s=+\tfrac12$; of 3d⁶ it has $m_\ell=-2,\ m_s=-\tfrac12$. Check which convention your lecturer uses.
`,
      traps: [
        'Writing Fe²⁺ as $[\\text{Ar}]3d^44s^2$ is wrong: the 4s electrons leave first.',
        'For Mn²⁺ the outermost electron is in **3d**, not 4s ($n=3$, $\\ell=2$).',
        'Paramagnetic needs only **one** unpaired electron. Even electron count does not guarantee diamagnetic (Fe²⁺ has 24 e⁻ and 4 unpaired).',
      ],
    },
    {
      id: 'trends',
      title: 'Periodic trends: radius, IE and EA',
      slides: [40, 41, 42, 43],
      widgets: ['trends'],
      figures: ['L7-trends', 'L7-isoelectronic'],
      essentials: [
        'Atomic radius: **↓ across** a period (Zeff ↑), **↑ down** a group (more shells).',
        'IE₁: **↑ across**, **↓ down**; dips at B (after Be) and O (after N).',
        'EA: more negative across (halogens); **Cl** is more negative than F.',
        'Isoelectronic ions: same electrons, **more protons → smaller**: O²⁻ > F⁻ > Na⁺ > Mg²⁺ > Al³⁺.',
        'Cations are smaller than their atoms; anions are larger.',
      ],
      formulas: [
        { name: 'Effective nuclear charge (rough)', tex: r`Z_{\text{eff}} \approx Z - S`, where: 'Z = protons, S ≈ number of core (inner-shell) electrons that shield. General knowledge, not on the slides' },
        { name: 'First ionisation energy', tex: r`\text{X}(g)\to\text{X}^+(g)+e^-\qquad \Delta E = IE_1 > 0`, where: 'kJ/mol, always positive (energy must be put in)' },
        { name: 'Electron affinity', tex: r`\text{X}(g)+e^-\to\text{X}^-(g)\qquad \Delta E = EA`, where: 'kJ/mol; more negative = more energy released = stronger pull for the extra electron' },
      ],
      md: r`
**Why the trends happen: effective nuclear charge** (general knowledge). Core electrons shield the valence electrons, so these feel only $Z_{\text{eff}} \approx Z - (\text{core } e^-)$.
- Across period 3: Na $Z_{\text{eff}}\approx 11-10 = 1$, Cl $\approx 17-10 = 7$. Same shell, stronger pull, so **smaller** atom and **higher** IE.
- Down a group: $Z_{\text{eff}}$ stays about the same but $n$ grows, so the valence electron is farther away: **bigger** atom, **lower** IE.

**Atomic radius (slide 40):** *decreases* across a period; *increases* down a group. The graph is a sawtooth: each period starts with a jump at the alkali metal (biggest atoms) and falls across.

**Ionic radius (general knowledge):**
- Cation < parent atom (lost the outer shell or electron–electron repulsion drops): Na⁺ < Na.
- Anion > parent atom (extra electron repulsion): Cl⁻ > Cl.
- **Isoelectronic series:** same number of electrons, so the one with **more protons** pulls them in more and is **smaller**. O²⁻ (8 p) > F⁻ (9 p) > Na⁺ (11 p) > Mg²⁺ (12 p) > Al³⁺ (13 p). Likewise S²⁻ > Cl⁻ > K⁺ > Ca²⁺.

**First ionization energy (slides 41–42):** energy to remove the outermost electron from a gaseous atom: $\text{X}(g)\to\text{X}^+(g)+e^-$ (always positive).
- *Increases* across a period; *decreases* down a group.
- Peaks at noble gases (He highest), troughs at alkali metals.
- **Dips** in the graph: Be→B (the 2p electron is higher in energy than 2s) and N→O (the 4th 2p electron must pair, and the repulsion makes it easier to remove).
- Successive IEs always increase; a **huge jump** appears after removing the valence shell (Na: IE1 = 496, IE2 = 4563 kJ/mol). The jump tells you the group: big jump after IE$_k$ → $k$ valence electrons.

**Electron affinity (slide 43):** energy change for $\text{X}(g)+e^-\to\text{X}^-(g)$. *More negative* = stronger attraction.
- Generally becomes more negative across a period (halogens most negative: **Cl** ≈ −349 kJ/mol is more negative than F ≈ −328, an exception caused by F's small compact 2p crowding).
- Noble gases, Be, Mg, N ≈ 0 or positive (full or half-filled subshell, or nowhere comfortable to put the electron).

| Property | → across a period | ↓ down a group | Reason |
|---|---|---|---|
| Atomic radius | decreases | increases | Zeff ↑ across; more shells down |
| Ionisation energy IE₁ | increases | decreases | electron held tighter across; farther away down |
| Electron affinity (magnitude) | increases | decreases (roughly) | same as IE; exceptions F < Cl, group 2, 15, 18 |
| Zeff on valence e⁻ | increases | ≈ constant | more protons, same core across |
`,
      traps: [
        'IE is **always positive** (endothermic); EA is usually **negative**.',
        'Cl, not F, has the most negative EA.',
        'IE(O) < IE(N) and IE(B) < IE(Be): the dips are real, not drawing errors.',
        'In an isoelectronic series, the **most negative** ion is the **largest**, not the smallest.',
      ],
    },
  ],
}
