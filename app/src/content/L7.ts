// Learn content for L7. Owned by the content agent. Markdown + KaTeX; cite slides via `slides`.
import type { Lecture } from '../types'

const r = String.raw

export const lecture: Lecture = {
  id: 'L7',
  title: 'Atomic Structure',
  summary:
    'From light as a wave and a particle (λν = c, E = hν), through the photoelectric effect and the hydrogen line spectrum (Rydberg, Bohr), to wave functions, quantum numbers, orbital shapes and the periodic trends in radius, ionization energy and electron affinity.',
  sections: [
    {
      id: 'duality',
      title: 'Why classical physics failed: duality',
      slides: [2, 3],
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
- **Continuous spectrum**: unbroken range of all colours (white light through a prism). A spark through a gas under vacuum excites the atoms, which then emit light (leads to line spectra, section 5).

**Worked example.** Green light $\lambda = 500$ nm. 
$\nu = c/\lambda = 2.998\times10^8 / 500\times10^{-9} = 5.996\times10^{14}$ Hz.
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
      md: r`
Planck and Einstein (1905): radiation is a stream of **quanta (photons)**, each travelling at $c$ with frequency $\nu$.

$$E_{\text{photon}} = h\nu = \frac{hc}{\lambda}\qquad h = 6.626\times10^{-34}\ \text{J·s}$$

- $E \propto \nu$ and $E\propto 1/\lambda$: UV photons carry more energy than visible, visible more than IR.
- That is **per photon**. For **per mole** multiply by $N_A = 6.022\times10^{23}$ and divide by 1000 for kJ/mol.

**Worked example.** 500 nm photon:
$E = (6.626\times10^{-34})(2.998\times10^{8}) / (500\times10^{-9}) = 3.97\times10^{-19}$ J per photon
$\times 6.022\times10^{23} = 2.39\times10^{5}$ J/mol $= 239$ kJ/mol.

Quick route: ν from c/λ, then $h\nu$. Units: J·s × s$^{-1}$ = J.
`,
      traps: [
        'Photon energy is in **J per photon**, around $10^{-19}$ J. Multiply by $N_A$ to get J/mol.',
        'Doubling the **intensity** doubles the number of photons, not the energy per photon.',
      ],
    },
    {
      id: 'photoelectric',
      title: 'Photoelectric effect',
      slides: [14, 15, 16],
      widgets: ['photoelectric'],
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

**Worked example.** $\phi = 4.5\times10^{-19}$ J, light 200 nm. $E=hc/\lambda=9.93\times10^{-19}$ J, so KE $=9.93-4.5 = 5.43\times10^{-19}$ J. Threshold: $\lambda_0 = hc/\phi = 441$ nm.
`,
      traps: [
        'Brighter light below the threshold frequency still ejects **no** electrons.',
        'Intensity changes the **number** of electrons, not their KE. Frequency changes the KE.',
        'Energies of several low-energy photons cannot be pooled.',
      ],
    },
    {
      id: 'spectrum',
      title: 'Hydrogen line spectrum & Rydberg equation',
      slides: [17, 18, 19, 20, 21, 22],
      md: r`
- **Line (atomic/emission) spectrum**: only a few discrete lines; **each element has a unique one**.
- Hydrogen is simplest (one electron). Balmer found the visible lines empirically; Rydberg generalised it to IR, visible and UV.

$$\frac{1}{\lambda}=R_H\left(\frac{1}{n_1^2}-\frac{1}{n_2^2}\right),\qquad n_2>n_1$$

- $R_H = 109{,}678\ \text{cm}^{-1}$ (slide) $=1.097\times10^{7}$ m$^{-1}$. Keep units consistent!
- $n_1,n_2$ are whole numbers = allowed energy levels. $n_2$ is the **higher** level (emission: electron drops from $n_2$ to $n_1$).

| Series | $n_1$ (final) | Region |
|---|---|---|
| Lyman | 1 | UV |
| Balmer | 2 | visible |
| Paschen | 3 | IR |

**Slide 21 worked example.** Balmer, $n_2=6\to n_1=2$:
$1/\lambda = 109{,}678\,(1/4-1/36)=24{,}373$ cm$^{-1}$ → $\lambda = 4.103\times10^{-5}$ cm $=410.3$ nm (violet line).

**Significance:** only fixed energies are emitted, so the electron's energy is **quantised** (restricted to fixed levels). Any theory of the atom must explain line spectra and quantisation.
`,
      traps: [
        'Putting $n_1>n_2$ gives a negative $1/\\lambda$. The larger $n$ goes second.',
        'Mixing $R_H$ in cm$^{-1}$ with answers in m: convert 1 m = 100 cm = $10^9$ nm.',
      ],
    },
    {
      id: 'bohr',
      title: 'Quantisation & the Bohr model',
      slides: [23, 24, 25, 26, 27, 28, 29, 30],
      widgets: ['hatom'],
      md: r`
**Quantised** = only certain discrete values allowed (like rungs of a ladder, not a ramp).

- **Absorption** of a photon: electron goes to a higher level (excited state). **Emission**: it drops to a lower level and emits a photon.
- Each transition always gives the **same** photon energy, hence a sharp line.

**Bohr model (first model to explain the Rydberg equation):** electron moves in fixed orbits, each with fixed energy.

$$E_n=-\frac{b}{n^2}=-\frac{R_H h c}{n^2},\qquad b = 2.18\times10^{-18}\ \text{J/atom}\ (2.1788\times10^{-18}),\quad n=1,2,3,\dots$$

- $E<0$ because of Coulomb attraction; $E=0$ at $n=\infty$ (electron free). **More negative = more stable.**
- $n=1$: **ground state**, lowest energy. $n\ge2$: excited states.
- Photon energy for $n_h\to n_l$ (higher to lower):
$$\Delta E = E_h - E_l = b\left(\frac{1}{n_l^2}-\frac{1}{n_h^2}\right)=h\nu=\frac{hc}{\lambda}$$

**Worked example.** $n=4\to2$: $\Delta E = 2.18\times10^{-18}(1/4-1/16)=4.09\times10^{-19}$ J, $\lambda = hc/\Delta E = 486$ nm.
Ionisation of ground-state H: $n=1\to\infty$, $E=2.18\times10^{-18}$ J $= 1312$ kJ/mol.

**Bohr fails:** cannot explain spectra of multi-electron atoms, and cannot explain why the atom does not collapse (an orbiting charge should radiate and spiral into the nucleus). Replaced by wave mechanics.
`,
      traps: [
        'Levels get **closer together** as $n$ increases. The gap 3→2 is much smaller than 2→1.',
        'A negative $E_n$ is not "less energy than nothing"; it is bound. $n=1$ is the most negative.',
        'Absorption needs exactly $E_{n_f}-E_{n_i}$; an electron cannot absorb a photon that does not match a gap.',
      ],
    },
    {
      id: 'orbitals',
      title: 'Wave functions, quantum numbers & orbital shapes',
      slides: [31, 32, 33, 34, 35, 36, 37, 38],
      widgets: ['qnumbers'],
      md: r`
**Electrons are waves too** (slide 31: they show interference/diffraction). Schrödinger (slide 32): $\hat H\Psi = E\Psi$, with $\Psi$ the wave function, $E$ the energy and $\hat H$ the Hamiltonian operator. $|\Psi|^2$ gives the **probability density** of finding the electron. An **orbital** is a region described by one $\Psi$ (not an orbit).

*Beyond the slides:* de Broglie $\lambda = h/mv$; Heisenberg uncertainty: no exact position and momentum together.

**Quantum numbers (slide 34 table)**
| Symbol | Name | Allowed values | Controls |
|---|---|---|---|
| $n$ | principal | 1, 2, 3, … | size, energy (shell) |
| $\ell$ | angular momentum | 0 … $n-1$ (s=0, p=1, d=2, f=3) | shape (subshell) |
| $m_\ell$ | magnetic | $-\ell … +\ell$ ($2\ell+1$ values) | orientation |
| $m_s$ | spin (beyond slides) | $+\tfrac12,\ -\tfrac12$ | electron spin |

- Orbitals per subshell: s = 1, p = 3, d = 5, f = 7. Per shell: $n^2$ (1, 4, 9, 16). Max electrons per shell: $2n^2$.
- **Shapes:** s spherical; p dumbbell (3 orientations, $p_x,p_y,p_z$); d four-lobed cloverleaf (plus $d_{z^2}$).
- **Nodes (slide 38):** total nodes $=n-1$; **radial (spherical)** nodes $=n-\ell-1$; angular (planar) nodes $=\ell$. 3s has 2 spherical nodes; 3p has 1 planar + 1 radial; 3d has 2 planar.

**Worked example.** Is $n=2,\ \ell=2$ allowed? No: $\ell\le n-1=1$. Is $n=3,\ \ell=1,\ m_\ell=-1$ allowed? Yes (a 3p orbital).
`,
      traps: [
        'An orbital is **not** a path. It is a probability distribution.',
        '$\\ell$ must be **less than** $n$, so there is no 2d or 1p.',
        '$|m_\\ell|\\le\\ell$: a p subshell has $m_\\ell=-1,0,1$, never 2.',
      ],
    },
    {
      id: 'config',
      title: 'Orbitals in the periodic table & electron configuration',
      slides: [39],
      widgets: ['econfig'],
      md: r`
Slide 39: the table is divided into **blocks** by the subshell being filled.
- **s block**: groups 1–2 (+ He). **p block**: groups 13–18. **d block**: groups 3–12 (fills $(n-1)d$). **f block**: lanthanides/actinides (fills $(n-2)f$).

*Filling rules (general knowledge, needed for L8 too):*
- **Aufbau**: fill lowest energy first: 1s 2s 2p 3s 3p 4s 3d 4p 5s 4d 5p 6s 4f 5d 6p 7s …
- **Pauli**: max 2 electrons per orbital, opposite spins (no two electrons share all four quantum numbers).
- **Hund**: degenerate orbitals each get one electron (parallel spins) before pairing.
- **Exceptions**: **Cr** $[\text{Ar}]3d^54s^1$ and **Cu** $[\text{Ar}]3d^{10}4s^1$ (half-/fully-filled d is extra stable). Also Mo, Ag, Au similarly.

Examples: Fe $[\text{Ar}]3d^64s^2$; O $1s^22s^22p^4$ (two paired, two unpaired in 2p).
`,
      traps: [
        'Cr and Cu **promote** a 4s electron into 3d. Writing Cr as $3d^44s^2$ is wrong.',
        'The 4s fills before 3d, but is written **after** 3d and is the first lost on ionisation (L8).',
      ],
    },
    {
      id: 'trends',
      title: 'Periodic trends: radius, IE and EA',
      slides: [40, 41, 42, 43],
      widgets: ['trends'],
      md: r`
**Atomic radius (slide 40):** *decreases* across a period (Zeff up, same shell pulled tighter); *increases* down a group (more shells, $n$ up). Sawtooth drop within each period; biggest atoms are alkali metals.

**First ionization energy (slides 41–42):** energy to remove the outermost electron from a gaseous atom: $\text{X}(g)\to\text{X}^+(g)+e^-$ (always positive).
- *Increases* across a period; *decreases* down a group.
- Peaks at noble gases (He highest), troughs at alkali metals.
- **Dips** in the graph: Be→B (the p electron is higher in energy than s) and N→O (paired electron in 2p repels).
- Successive IEs always increase; a **huge jump** appears after removing the valence shell (Na: IE1 = 496, IE2 = 4563 kJ/mol).

**Electron affinity (slide 43):** energy change for $\text{X}(g)+e^-\to\text{X}^-(g)$. *More negative* = stronger attraction.
- Generally becomes more negative across a period (halogens most negative: **Cl** ≈ −349 kJ/mol is more negative than F ≈ −328, an exception caused by F's small compact 2p crowding).
- Noble gases, Be, Mg, N ≈ 0 (full or half-filled subshell, or nowhere comfortable to put the electron).

| Trend | → across | ↓ down |
|---|---|---|
| Radius | ↓ | ↑ |
| IE | ↑ | ↓ |
| EA (magnitude) | ↑ | ↓ (roughly) |
`,
      traps: [
        'IE is **always positive** (endothermic); EA is usually **negative**.',
        'Cl, not F, has the most negative EA.',
        'IE(O) < IE(N) and IE(B) < IE(Be): the dips are real, not drawing errors.',
      ],
    },
  ],
}
