import type { PastPaper } from '../../../types'
const r = String.raw

export const paper: PastPaper = {
  id: 'kuis2-2025', year: 2025, title: 'Quiz 2 2025', titleId: 'Kuis 2 2025', date: '17 Nov 2025', minutes: 45,
  constants: r`The paper prints a periodic table (groups 1–18, with atomic masses) at the top of page 1. No other constants are given. Time: 45 minutes. Marks are shown in parentheses.`,
  constantsId: r`Kertas soal mencantumkan tabel periodik (golongan 1–18, dengan massa atom) di bagian atas halaman 1. Tidak ada konstanta lain. Waktu: 45 menit. Poin ditunjukkan dalam tanda kurung.`,
  note: 'The official answer key is not provided; the solutions are written for this site.',
  problems: [
    {
      n: 1, points: 20,
      intro: r`The ion $\text{A}^{2+}$ has the electron configuration $1s^2 2s^2 2p^6 3s^2 3p^6$.`,
      introId: r`Ion $\text{A}^{2+}$ memiliki konfigurasi elektron $1s^2 2s^2 2p^6 3s^2 3p^6$.`,
      parts: [
        {
          id: 'p25-1a', lecture: 'L7', topic: 'Electron configuration', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2025', label: '1a', points: 5 },
          kind: 'open',
          stem: r`Write the atomic number, group and period of atom A.`,
          answer: r`$Z = 20$ (Ca), group 2 (IIA), period 4.`,
          hints: [
            r`A²⁺ has lost 2 electrons. Count the electrons shown in the configuration, then think about what the neutral atom must have.`,
            r`The atomic number equals the number of electrons in the neutral atom. Write the neutral configuration to find the valence shell.`,
          ],
          work: [
            r`Electrons in A²⁺: $2+2+6+2+6 = 18$.`,
            r`Neutral A has $18 + 2 = 20$ electrons, so $Z = 20$ (calcium).`,
            r`Neutral configuration: $[\text{Ar}]4s^2$. Valence shell $n = 4$ gives period 4; two valence s electrons give group 2 (IIA).`,
          ],
          explanation: r`The ion $\text{A}^{2+}$ has $2+2+6+2+6 = 18$ electrons. A cation of charge $+2$ has lost two electrons, so the neutral atom has $18+2 = 20$ electrons, i.e. $Z = 20$, which is calcium. Its ground-state configuration is $[\text{Ar}]4s^2$ (the two electrons were removed from the outermost $4s$ orbital). The highest shell is $n=4$, so it is in **period 4**; two valence electrons in an s subshell place it in **group 2 (IIA)**.`,
          indo: {
            stem: r`Tuliskan nomor atom, golongan, dan periode untuk atom A.`,
            answer: r`$Z = 20$ (Ca), golongan 2 (IIA), periode 4.`,
            hints: [
              r`A²⁺ telah melepas 2 elektron. Hitung elektron pada konfigurasi yang diberikan, lalu pikirkan jumlah elektron atom netralnya.`,
              r`Nomor atom sama dengan jumlah elektron atom netral. Tuliskan konfigurasi atom netral untuk menemukan kulit valensi.`,
            ],
            work: [
              r`Elektron pada A²⁺: $2+2+6+2+6 = 18$.`,
              r`Atom A netral memiliki $18 + 2 = 20$ elektron, sehingga $Z = 20$ (kalsium).`,
              r`Konfigurasi netral: $[\text{Ar}]4s^2$. Kulit valensi $n = 4$ berarti periode 4; dua elektron valensi di subkulit s berarti golongan 2 (IIA).`,
            ],
            explanation: r`Ion $\text{A}^{2+}$ memiliki $2+2+6+2+6 = 18$ elektron. Kation bermuatan $+2$ telah melepas dua elektron, sehingga atom netralnya memiliki $18+2 = 20$ elektron, yaitu $Z = 20$ (kalsium). Konfigurasi keadaan dasarnya $[\text{Ar}]4s^2$ (dua elektron dilepas dari orbital terluar $4s$). Kulit tertinggi $n=4$ sehingga berada di **periode 4**; dua elektron valensi di subkulit s menempatkannya di **golongan 2 (IIA)**.`,
          },
        },
        {
          id: 'p25-1b-i', lecture: 'L7', topic: 'Quantum numbers', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2025', label: '1b(i)', points: 10 },
          kind: 'open',
          stem: r`Write the 4 quantum numbers ($n$, $l$, $m_l$ and $m_s$) for a valence electron of atom A in its ground state.`,
          answer: r`$n = 4$, $l = 0$, $m_l = 0$, $m_s = +\tfrac12$ (or $-\tfrac12$; the two valence electrons differ only in $m_s$).`,
          hints: [
            r`First write the ground-state valence configuration of A and identify the subshell holding the valence electrons.`,
            r`$n$ is the shell number; $l = 0, 1, 2, 3$ for s, p, d, f; $m_l$ runs from $-l$ to $+l$.`,
            r`The two electrons in the same orbital must have opposite spins.`,
          ],
          work: [
            r`Valence electrons of A (Ca): $4s^2$.`,
            r`$n = 4$ (shell); s subshell gives $l = 0$.`,
            r`For $l = 0$ only $m_l = 0$ is allowed.`,
            r`The two electrons are paired: one has $m_s = +\tfrac12$, the other $-\tfrac12$. Either is acceptable, e.g. $(4, 0, 0, +\tfrac12)$.`,
          ],
          explanation: r`A is calcium, $[\text{Ar}]4s^2$, so the valence electrons are in the $4s$ orbital: $n = 4$, $l = 0$ (s), $m_l = 0$ (the only value when $l = 0$). The two electrons in this orbital have opposite spins, so $m_s = +\tfrac12$ for one and $-\tfrac12$ for the other. A valid answer is $(n, l, m_l, m_s) = (4, 0, 0, +\tfrac12)$; $(4, 0, 0, -\tfrac12)$ is equally correct.`,
          indo: {
            stem: r`Tuliskan 4 bilangan kuantum ($n$, $l$, $m_l$, dan $m_s$) untuk elektron valensi atom A pada keadaan dasar.`,
            answer: r`$n = 4$, $l = 0$, $m_l = 0$, $m_s = +\tfrac12$ (atau $-\tfrac12$; kedua elektron valensi hanya berbeda pada $m_s$).`,
            hints: [
              r`Tuliskan dahulu konfigurasi valensi A pada keadaan dasar dan tentukan subkulit tempat elektron valensinya.`,
              r`$n$ adalah nomor kulit; $l = 0, 1, 2, 3$ untuk s, p, d, f; $m_l$ bernilai dari $-l$ sampai $+l$.`,
              r`Dua elektron dalam satu orbital harus memiliki spin berlawanan.`,
            ],
            work: [
              r`Elektron valensi A (Ca): $4s^2$.`,
              r`$n = 4$ (kulit); subkulit s berarti $l = 0$.`,
              r`Untuk $l = 0$ hanya $m_l = 0$ yang diperbolehkan.`,
              r`Kedua elektron berpasangan: satu dengan $m_s = +\tfrac12$, satunya $-\tfrac12$. Salah satunya boleh, misalnya $(4, 0, 0, +\tfrac12)$.`,
            ],
            explanation: r`A adalah kalsium, $[\text{Ar}]4s^2$, sehingga elektron valensi berada di orbital $4s$: $n = 4$, $l = 0$ (s), $m_l = 0$ (satu-satunya nilai bila $l = 0$). Dua elektron di orbital ini memiliki spin berlawanan, sehingga $m_s = +\tfrac12$ untuk satu elektron dan $-\tfrac12$ untuk yang lain. Jawaban yang valid adalah $(n, l, m_l, m_s) = (4, 0, 0, +\tfrac12)$; $(4, 0, 0, -\tfrac12)$ sama benarnya.`,
          },
        },
        {
          id: 'p25-1b-ii', lecture: 'L7', topic: 'Electron configuration', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2025', label: '1b(ii)', points: 5 },
          kind: 'mcq',
          stem: r`Is atom A (ground state) paramagnetic or diamagnetic?`,
          options: [r`Paramagnetic`, r`Diamagnetic`],
          answer: [1],
          hints: [
            r`Paramagnetism requires unpaired electrons. Look at how the valence electrons are arranged in orbitals.`,
            r`Check whether any subshell of the neutral atom is only partly filled.`,
          ],
          work: [
            r`Ground-state configuration of A: $[\text{Ar}]4s^2$.`,
            r`All subshells are completely filled; the two $4s$ electrons are paired in one orbital.`,
            r`No unpaired electrons, so A is diamagnetic.`,
          ],
          explanation: r`Calcium is $[\text{Ar}]4s^2$. Every orbital is either empty or contains a spin-paired pair of electrons (the $4s$ orbital holds two electrons of opposite spin). With no unpaired electrons, atom A is **diamagnetic** (weakly repelled by a magnetic field).`,
          indo: {
            stem: r`Apakah atom A (keadaan dasar) bersifat paramagnetik atau diamagnetik?`,
            options: [r`Paramagnetik`, r`Diamagnetik`],
            hints: [
              r`Paramagnetik membutuhkan elektron tak berpasangan. Lihat susunan elektron valensi dalam orbital.`,
              r`Periksa apakah ada subkulit atom netral yang terisi sebagian.`,
            ],
            work: [
              r`Konfigurasi keadaan dasar A: $[\text{Ar}]4s^2$.`,
              r`Semua subkulit terisi penuh; dua elektron $4s$ berpasangan dalam satu orbital.`,
              r`Tidak ada elektron tak berpasangan, sehingga A bersifat diamagnetik.`,
            ],
            explanation: r`Kalsium adalah $[\text{Ar}]4s^2$. Setiap orbital kosong atau berisi sepasang elektron dengan spin berlawanan (orbital $4s$ berisi dua elektron berspin berlawanan). Tanpa elektron tak berpasangan, atom A bersifat **diamagnetik** (ditolak lemah oleh medan magnet).`,
          },
        },
      ],
    },
    {
      n: 2, points: 20,
      intro: r`Crystalline lithium fluoride (LiF) has a high melting point and a low level of corrosion in the environment. The energy data for the steps in forming solid LiF from its elements are given below.

| Step | Energy (kJ/mol) |
|---|---|
| $\text{Li(s)} \longrightarrow \text{Li(g)}$ | 159.4 |
| $\tfrac12\text{F}_2\text{(g)} \longrightarrow \text{F(g)}$ | 79 |
| $\text{Li(g)} \longrightarrow \text{Li}^+\text{(g)} + \text{e}^-$ | 520 |
| $\text{F(g)} + \text{e}^- \longrightarrow \text{F}^-\text{(g)}$ | X |
| $\text{Li(s)} + \tfrac12\text{F}_2\text{(g)} \longrightarrow \text{LiF(s)}$ | -606 |
| $\text{Li}^+\text{(g)} + \text{F}^-\text{(g)} \longrightarrow \text{LiF(s)}$ | -1036.4 |`,
      introId: r`Padatan kristal litium fluorida (LiF) memiliki titik didih yang tinggi dan tingkat korosi yang rendah di lingkungan. Berikut data energi untuk tahap-tahap pembentukan padatan LiF dari unsur-unsurnya.

| Tahap | Energi (kJ/mol) |
|---|---|
| $\text{Li(s)} \longrightarrow \text{Li(g)}$ | 159,4 |
| $\tfrac12\text{F}_2\text{(g)} \longrightarrow \text{F(g)}$ | 79 |
| $\text{Li(g)} \longrightarrow \text{Li}^+\text{(g)} + \text{e}^-$ | 520 |
| $\text{F(g)} + \text{e}^- \longrightarrow \text{F}^-\text{(g)}$ | X |
| $\text{Li(s)} + \tfrac12\text{F}_2\text{(g)} \longrightarrow \text{LiF(s)}$ | -606 |
| $\text{Li}^+\text{(g)} + \text{F}^-\text{(g)} \longrightarrow \text{LiF(s)}$ | -1036,4 |`,
      parts: [
        {
          id: 'p25-2a', lecture: 'L8', topic: 'Born–Haber energetics', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2025', label: '2a', points: 10 },
          kind: 'numeric', answer: -328, unit: 'kJ/mol', tol: { rel: 0.01 },
          stem: r`Calculate the value of X.`,
          hints: [
            r`The overall formation of LiF(s) from the elements equals the sum of the individual steps (Hess's law / Born–Haber cycle).`,
            r`Add sublimation, F₂ dissociation, ionisation energy, X and lattice formation, and set the sum equal to the overall enthalpy.`,
          ],
          work: [
            r`Born–Haber cycle: $\Delta H_f = \Delta H_{sub} + \Delta H_{diss} + IE + X + \Delta H_{lattice}$.`,
            r`$-606 = 159.4 + 79 + 520 + X + (-1036.4)$.`,
            r`$159.4 + 79 + 520 - 1036.4 = -278.0$.`,
            r`$X = -606 - (-278.0) = -328\ \text{kJ/mol}$ (the electron affinity of F).`,
          ],
          explanation: r`The formation of LiF(s) from its elements can be done in five steps (Born–Haber cycle), so by Hess's law

$$\Delta H_f = \Delta H_{\text{sub}}(\text{Li}) + \tfrac12 D(\text{F}_2) + \text{IE}(\text{Li}) + X + \Delta H_{\text{lattice}}.$$

Substituting: $-606 = 159.4 + 79 + 520 + X + (-1036.4)$. The known terms add to $159.4 + 79 + 520 - 1036.4 = -278.0$, so

$$X = -606 - (-278.0) = \mathbf{-328\ kJ/mol}.$$

This is the electron affinity step of fluorine (energy released). The negative sign means the step is exothermic.`,
          indo: {
            stem: r`Hitung nilai X.`,
            hints: [
              r`Pembentukan total LiF(s) dari unsur-unsurnya sama dengan jumlah tiap tahap (hukum Hess / siklus Born–Haber).`,
              r`Jumlahkan sublimasi, disosiasi F₂, energi ionisasi, X, dan pembentukan kisi, lalu samakan dengan entalpi total.`,
            ],
            work: [
              r`Siklus Born–Haber: $\Delta H_f = \Delta H_{sub} + \Delta H_{diss} + IE + X + \Delta H_{kisi}$.`,
              r`$-606 = 159{,}4 + 79 + 520 + X + (-1036{,}4)$.`,
              r`$159{,}4 + 79 + 520 - 1036{,}4 = -278{,}0$.`,
              r`$X = -606 - (-278{,}0) = -328\ \text{kJ/mol}$ (afinitas elektron F).`,
            ],
            explanation: r`Pembentukan LiF(s) dari unsur-unsurnya dapat dilakukan dalam lima tahap (siklus Born–Haber), sehingga menurut hukum Hess

$$\Delta H_f = \Delta H_{\text{sub}}(\text{Li}) + \tfrac12 D(\text{F}_2) + \text{IE}(\text{Li}) + X + \Delta H_{\text{kisi}}.$$

Substitusi: $-606 = 159{,}4 + 79 + 520 + X + (-1036{,}4)$. Suku yang diketahui berjumlah $159{,}4 + 79 + 520 - 1036{,}4 = -278{,}0$, sehingga

$$X = -606 - (-278{,}0) = \mathbf{-328\ kJ/mol}.$$

Ini adalah tahap afinitas elektron fluorin (energi dilepaskan). Tanda negatif berarti tahap ini eksotermik.`,
          },
        },
        {
          id: 'p25-2b', lecture: 'L8', topic: 'Lattice energy', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2025', label: '2b', points: 10 },
          kind: 'open',
          stem: r`Rank the lattice energies of LiF, NaF and $\text{MgF}_2$ from highest to lowest.`,
          answer: r`$\text{MgF}_2 > \text{LiF} > \text{NaF}$`,
          hints: [
            r`Lattice energy scales roughly with $\dfrac{q_+ q_-}{d}$: the product of the ion charges over the distance between the ions.`,
            r`Compare the charges first. For ions with equal charge, compare the ionic radii.`,
          ],
          work: [
            r`Lattice energy $\propto \dfrac{|q_+ q_-|}{d}$, where $d = r_+ + r_-$.`,
            r`$\text{Mg}^{2+}$ has charge $+2$ (vs $+1$ for Li⁺, Na⁺), so $\text{MgF}_2$ has the largest charge product, and Mg²⁺ is also small.`,
            r`LiF vs NaF: same charges, but Li⁺ is smaller than Na⁺ so $d$ is smaller and LiF has the higher lattice energy.`,
            r`Order: $\text{MgF}_2 > \text{LiF} > \text{NaF}$.`,
          ],
          explanation: r`Lattice energy increases with the product of the ionic charges and decreases with the distance between ion centres, $E \propto \dfrac{q_+ q_-}{r_+ + r_-}$ (Coulomb's law; L8).

- $\text{MgF}_2$: charges $2+$ and $1-$ (per F⁻), and Mg²⁺ is small, so the charge product is double that of the alkali fluorides: highest.
- LiF vs NaF: the same charges, but $r(\text{Li}^+) < r(\text{Na}^+)$, so LiF has the shorter distance and the larger lattice energy.

Therefore $\text{MgF}_2 > \text{LiF} > \text{NaF}$. (Magnitudes: LiF about 1036 kJ/mol as given in the table; the trend follows the order above.)`,
          indo: {
            stem: r`Urutkan energi kisi dari yang paling tinggi untuk LiF, NaF, dan $\text{MgF}_2$.`,
            answer: r`$\text{MgF}_2 > \text{LiF} > \text{NaF}$`,
            hints: [
              r`Energi kisi kira-kira sebanding dengan $\dfrac{q_+ q_-}{d}$: hasil kali muatan ion dibagi jarak antar ion.`,
              r`Bandingkan muatan terlebih dahulu. Untuk ion dengan muatan sama, bandingkan jari-jari ionnya.`,
            ],
            work: [
              r`Energi kisi $\propto \dfrac{|q_+ q_-|}{d}$, dengan $d = r_+ + r_-$.`,
              r`$\text{Mg}^{2+}$ bermuatan $+2$ (dibanding $+1$ untuk Li⁺, Na⁺), sehingga $\text{MgF}_2$ memiliki hasil kali muatan terbesar, dan Mg²⁺ juga kecil.`,
              r`LiF vs NaF: muatan sama, tetapi Li⁺ lebih kecil daripada Na⁺ sehingga $d$ lebih kecil dan LiF memiliki energi kisi lebih tinggi.`,
              r`Urutan: $\text{MgF}_2 > \text{LiF} > \text{NaF}$.`,
            ],
            explanation: r`Energi kisi bertambah dengan hasil kali muatan ion dan berkurang dengan jarak antar pusat ion, $E \propto \dfrac{q_+ q_-}{r_+ + r_-}$ (hukum Coulomb; L8).

- $\text{MgF}_2$: muatan $2+$ dan $1-$ (per F⁻), dan Mg²⁺ kecil, sehingga hasil kali muatan dua kali lipat garam fluorida alkali: tertinggi.
- LiF vs NaF: muatan sama, tetapi $r(\text{Li}^+) < r(\text{Na}^+)$, sehingga LiF berjarak lebih pendek dan energi kisinya lebih besar.

Jadi $\text{MgF}_2 > \text{LiF} > \text{NaF}$. (Besarnya: LiF sekitar 1036 kJ/mol seperti pada tabel; tren mengikuti urutan di atas.)`,
          },
        },
      ],
    },
    {
      n: 3, points: 20,
      intro: r`The questions below relate to trends in the periodic table and ionisation steps.`,
      introId: r`Pertanyaan di bawah ini berkaitan dengan kecenderungan (*trend*) pada tabel periodik dan tahap ionisasi.`,
      parts: [
        {
          id: 'p25-3a', lecture: 'L7', topic: 'Periodic trends', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2025', label: '3a', points: 6 },
          kind: 'open',
          stem: r`Rank the ionic radii of $\text{Na}^+$, $\text{O}^{2-}$ and $\text{F}^-$ from smallest to largest.`,
          answer: r`$\text{Na}^+ < \text{F}^- < \text{O}^{2-}$`,
          hints: [
            r`Count the electrons in each ion. What do you notice?`,
            r`For isoelectronic species, compare the nuclear charge: more protons pull the same electron cloud tighter.`,
          ],
          work: [
            r`$\text{Na}^+$ ($Z=11$), $\text{F}^-$ ($Z=9$), $\text{O}^{2-}$ ($Z=8$) all have 10 electrons ($1s^2 2s^2 2p^6$): isoelectronic.`,
            r`Same electron count: larger $Z$ means stronger attraction and a smaller radius.`,
            r`$Z$: $11 > 9 > 8$, so radii: $\text{Na}^+ < \text{F}^- < \text{O}^{2-}$.`,
          ],
          explanation: r`$\text{Na}^+$, $\text{F}^-$ and $\text{O}^{2-}$ are isoelectronic (10 electrons, $[\text{Ne}]$ configuration). For isoelectronic ions the radius decreases as nuclear charge increases, because the same electron cloud is held by more protons: $Z(\text{Na}) = 11 > Z(\text{F}) = 9 > Z(\text{O}) = 8$. Smallest to largest: **$\text{Na}^+ < \text{F}^- < \text{O}^{2-}$**.`,
          indo: {
            stem: r`Urutkan ukuran jari-jari ion dari yang paling kecil untuk $\text{Na}^+$, $\text{O}^{2-}$, dan $\text{F}^-$.`,
            answer: r`$\text{Na}^+ < \text{F}^- < \text{O}^{2-}$`,
            hints: [
              r`Hitung jumlah elektron pada tiap ion. Apa yang kamu lihat?`,
              r`Untuk spesi isoelektronik, bandingkan muatan inti: proton lebih banyak menarik awan elektron yang sama lebih kuat.`,
            ],
            work: [
              r`$\text{Na}^+$ ($Z=11$), $\text{F}^-$ ($Z=9$), $\text{O}^{2-}$ ($Z=8$) semuanya memiliki 10 elektron ($1s^2 2s^2 2p^6$): isoelektronik.`,
              r`Jumlah elektron sama: $Z$ lebih besar berarti tarikan lebih kuat dan jari-jari lebih kecil.`,
              r`$Z$: $11 > 9 > 8$, sehingga jari-jari: $\text{Na}^+ < \text{F}^- < \text{O}^{2-}$.`,
            ],
            explanation: r`$\text{Na}^+$, $\text{F}^-$, dan $\text{O}^{2-}$ isoelektronik (10 elektron, konfigurasi $[\text{Ne}]$). Pada ion isoelektronik, jari-jari mengecil seiring bertambahnya muatan inti karena awan elektron yang sama ditarik oleh lebih banyak proton: $Z(\text{Na}) = 11 > Z(\text{F}) = 9 > Z(\text{O}) = 8$. Dari yang terkecil: **$\text{Na}^+ < \text{F}^- < \text{O}^{2-}$**.`,
          },
        },
        {
          id: 'p25-3b', lecture: 'L7', topic: 'Periodic trends', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2025', label: '3b', points: 6 },
          kind: 'open',
          stem: r`Rank the first ionisation energies of the atoms Br, K and Ni from largest to smallest.`,
          answer: r`$\text{Br} > \text{Ni} > \text{K}$`,
          hints: [
            r`Locate the three elements in period 4 using the periodic table on the paper.`,
            r`Within a period, ionisation energy generally rises from left (alkali metals) to right (halogens). Ask where the transition metal Ni falls between the two.`,
          ],
          work: [
            r`All three are in period 4: K (group 1), Ni (group 10), Br (group 17).`,
            r`First IE generally increases across a period as effective nuclear charge increases and radius shrinks.`,
            r`Order: $\text{Br} > \text{Ni} > \text{K}$.`,
          ],
          explanation: r`K, Ni and Br are all in period 4 (groups 1, 10 and 17). Across a period, $Z_{\text{eff}}$ increases and atomic radius decreases, so the outer electron is held more tightly and the first ionisation energy rises: the alkali metal K is lowest and the halogen Br is highest, with the transition metal Ni in between. Largest to smallest: **$\text{Br} > \text{Ni} > \text{K}$** (experimentally about 1140, 737 and 419 kJ/mol).`,
          indo: {
            stem: r`Urutkan nilai energi ionisasi pertama dari yang paling besar untuk atom-atom Br, K, dan Ni.`,
            answer: r`$\text{Br} > \text{Ni} > \text{K}$`,
            hints: [
              r`Tentukan posisi ketiga unsur pada periode 4 menggunakan tabel periodik di soal.`,
              r`Dalam satu periode, energi ionisasi umumnya naik dari kiri (logam alkali) ke kanan (halogen). Pikirkan di mana logam transisi Ni berada di antara keduanya.`,
            ],
            work: [
              r`Ketiganya berada di periode 4: K (golongan 1), Ni (golongan 10), Br (golongan 17).`,
              r`EI pertama umumnya naik sepanjang periode karena muatan inti efektif bertambah dan jari-jari mengecil.`,
              r`Urutan: $\text{Br} > \text{Ni} > \text{K}$.`,
            ],
            explanation: r`K, Ni, dan Br semuanya berada di periode 4 (golongan 1, 10, dan 17). Sepanjang periode, $Z_{\text{eff}}$ bertambah dan jari-jari atom berkurang, sehingga elektron terluar tertahan lebih kuat dan energi ionisasi pertama meningkat: logam alkali K terendah dan halogen Br tertinggi, dengan logam transisi Ni di antaranya. Dari terbesar: **$\text{Br} > \text{Ni} > \text{K}$** (secara eksperimen sekitar 1140, 737, dan 419 kJ/mol).`,
          },
        },
        {
          id: 'p25-3c', lecture: 'L7', topic: 'Periodic trends', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2025', label: '3c', points: 8 },
          kind: 'open',
          stem: r`Write the reaction equation for the fourth ionisation step of a Se atom.`,
          answer: r`$\text{Se}^{3+}\text{(g)} \longrightarrow \text{Se}^{4+}\text{(g)} + \text{e}^-$`,
          hints: [
            r`Ionisation steps are sequential: each removes one electron from the species left by the previous step.`,
            r`Work out the charge of the species that enters the fourth step and the charge it has afterwards. Remember the gas state.`,
          ],
          work: [
            r`Step 1: $\text{Se(g)} \to \text{Se}^+\text{(g)} + \text{e}^-$; step 2: $\text{Se}^+ \to \text{Se}^{2+}$; step 3: $\text{Se}^{2+} \to \text{Se}^{3+}$.`,
            r`Step 4 starts from $\text{Se}^{3+}$ and removes one more electron.`,
            r`$\text{Se}^{3+}\text{(g)} \to \text{Se}^{4+}\text{(g)} + \text{e}^-$.`,
          ],
          explanation: r`Each successive ionisation removes one electron from the gaseous ion produced in the previous step. After three steps selenium is $\text{Se}^{3+}$, so the fourth ionisation is

$$\text{Se}^{3+}\text{(g)} \longrightarrow \text{Se}^{4+}\text{(g)} + \text{e}^-$$

(this step is not $\text{Se(g)} \to \text{Se}^{4+} + 4\text{e}^-$, which would be the sum of the first four ionisations).`,
          indo: {
            stem: r`Tuliskan persamaan reaksi untuk tahap Ionisasi ke empat dari atom Se.`,
            answer: r`$\text{Se}^{3+}\text{(g)} \longrightarrow \text{Se}^{4+}\text{(g)} + \text{e}^-$`,
            hints: [
              r`Tahap ionisasi berurutan: tiap tahap melepas satu elektron dari spesi hasil tahap sebelumnya.`,
              r`Tentukan muatan spesi yang masuk ke tahap keempat dan muatannya sesudahnya. Ingat wujud gas.`,
            ],
            work: [
              r`Tahap 1: $\text{Se(g)} \to \text{Se}^+\text{(g)} + \text{e}^-$; tahap 2: $\text{Se}^+ \to \text{Se}^{2+}$; tahap 3: $\text{Se}^{2+} \to \text{Se}^{3+}$.`,
              r`Tahap 4 dimulai dari $\text{Se}^{3+}$ dan melepas satu elektron lagi.`,
              r`$\text{Se}^{3+}\text{(g)} \to \text{Se}^{4+}\text{(g)} + \text{e}^-$.`,
            ],
            explanation: r`Setiap ionisasi berikutnya melepas satu elektron dari ion gas hasil tahap sebelumnya. Setelah tiga tahap, selenium menjadi $\text{Se}^{3+}$, sehingga ionisasi keempat adalah

$$\text{Se}^{3+}\text{(g)} \longrightarrow \text{Se}^{4+}\text{(g)} + \text{e}^-$$

(bukan $\text{Se(g)} \to \text{Se}^{4+} + 4\text{e}^-$, yang merupakan jumlah empat ionisasi pertama).`,
          },
        },
      ],
    },
    {
      n: 4, points: 20,
      intro: r`Hyponitrous acid ($\text{H}_2\text{N}_2\text{O}_2$) can decompose to dinitrogen monoxide gas ($\text{N}_2\text{O}$), which is used in anaesthesia.`,
      introId: r`Asam hiponitrit ($\text{H}_2\text{N}_2\text{O}_2$) dapat terurai menjadi gas dinitrogen oksida ($\text{N}_2\text{O}$), yang digunakan pada anestesi.`,
      parts: [
        {
          id: 'p25-4a-i', lecture: 'L9', topic: 'Lewis structures', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2025', label: '4a(i)', points: 3 },
          kind: 'numeric', answer: 24, unit: 'electrons', tol: { abs: 0.5 },
          stem: r`Calculate the total number of electrons (valence electrons) in the $\text{N}_2\text{O}_2^{2-}$ ion from hyponitrous acid.`,
          hints: [
            r`Add the valence electrons of every atom (use the group number).`,
            r`Remember to adjust for the charge of the ion.`,
          ],
          work: [
            r`N: 5 valence electrons $\times 2 = 10$.`,
            r`O: 6 valence electrons $\times 2 = 12$.`,
            r`Charge $2-$ adds 2 electrons: $10 + 12 + 2 = 24$.`,
          ],
          explanation: r`Valence electrons: $2(5) + 2(6) = 22$. The $2-$ charge adds two more electrons, giving **24 valence electrons** (12 pairs).`,
          indo: {
            stem: r`Hitung total elektron (elektron valensi) pada ion $\text{N}_2\text{O}_2^{2-}$ dari asam hiponitrit.`,
            hints: [
              r`Jumlahkan elektron valensi semua atom (gunakan nomor golongan).`,
              r`Ingat untuk menyesuaikan dengan muatan ion.`,
            ],
            work: [
              r`N: 5 elektron valensi $\times 2 = 10$.`,
              r`O: 6 elektron valensi $\times 2 = 12$.`,
              r`Muatan $2-$ menambah 2 elektron: $10 + 12 + 2 = 24$.`,
            ],
            explanation: r`Elektron valensi: $2(5) + 2(6) = 22$. Muatan $2-$ menambah dua elektron, sehingga totalnya **24 elektron valensi** (12 pasang).`,
          },
        },
        {
          id: 'p25-4a-ii', lecture: 'L9', topic: 'Lewis structures', source: 'past', difficulty: 3,
          past: { paper: 'kuis2-2025', label: '4a(ii)', points: 7 },
          kind: 'open',
          stem: r`Draw three possible Lewis structures for the $\text{N}_2\text{O}_2^{2-}$ ion (24 valence electrons).`,
          answer: r`Three octet-satisfying structures (all 24 e⁻), for example:

- **I** (O–N–N–O skeleton): O–N=N–O; each N has 1 lone pair, each O has 3 lone pairs.
- **II** (O–N–N–O skeleton): O=N–N–O with the double bond at one end: left O 2 lone pairs, left N 1, right N 2, right O 3.
- **III** (N–O–O–N skeleton): N–O–O⁺=N with lone pairs completing the octets: left N 3 lone pairs, left O 2, right O 1, right N 2 (large formal charges, unlikely).

Structure I, $\text{O–N=N–O}$ with an N=N double bond, is the real hyponitrite structure.`,
          hints: [
            r`24 electrons = 12 pairs. Start with a skeleton and place single bonds, then complete octets on the outer atoms first.`,
            r`If a central atom lacks an octet, convert lone pairs into double bonds. N usually forms 3 bonds with 1 lone pair, O forms 2 bonds with 2 lone pairs when neutral.`,
            r`Different arrangements of the atoms (O–N–N–O vs other connectivities) and different positions of the double bond give different valid structures.`,
          ],
          work: [
            r`Total: 24 e⁻ = 12 pairs. Take skeleton O–N–N–O (3 single bonds use 3 pairs).`,
            r`Structure I: put an N=N double bond, 3 lone pairs on each O, 1 lone pair on each N. Pairs: $4 + 3 + 3 + 1 + 1 = 12$ ✓. All octets complete.`,
            r`Structure II: put the double bond at one end: O=N–N–O. Left O 2 lp, left N 1 lp, right N 2 lp, right O 3 lp. Bonding pairs: $2+1+1 = 4$; lone pairs: $2+1+2+3 = 8$; total 12 ✓.`,
            r`Structure III: a different skeleton, N–O–O–N, e.g. N–O–O⁺=N with 3, 2, 1, 2 lone pairs (left N, left O, right O, right N): bonding pairs $1+1+2 = 4$, lone pairs $3+2+1+2 = 8$; total 12 ✓.`,
          ],
          explanation: r`There are $2(5) + 2(6) + 2 = 24$ valence electrons (12 pairs). The expected skeleton is O–N–N–O (hyponitrite, $[\text{O–N=N–O}]^{2-}$); alternatives rearrange the atoms or move the double bond.

**Structure I** (the usual hyponitrite structure): $\overset{\cdot\cdot}{\underset{\cdot\cdot}{:\text{O}}}\!-\!\ddot{\text{N}}\!=\!\ddot{\text{N}}\!-\!\overset{\cdot\cdot}{\underset{\cdot\cdot}{\text{O}:}}$. Bonds: 1 + 2 + 1 = 4 pairs; lone pairs: 3 on each O (6) + 1 on each N (2) = 8. Total 12 pairs ✓.

**Structure II**: $\text{O}{=}\ddot{\text{N}}{-}\ddot{\text{N}}{-}\text{O}$ with the double bond at one end: left O 2 lp, left N 1 lp, right N 2 lp, right O 3 lp. Bonds 2 + 1 + 1 = 4 pairs, lone pairs 2 + 1 + 2 + 3 = 8. Total 12 pairs ✓.

**Structure III**: a different skeleton, N–O–O–N, written N–O–O⁺=N with 3, 2, 1 and 2 lone pairs on left N, left O, right O and right N: 4 bonding + 8 lone pairs = 12 ✓. It is peroxide-like and has large formal charges.

Because the question only asks for three possible structures, any three valid 24-electron octet structures are acceptable; the formal charges in part (b) decide which is best.`,
          indo: {
            stem: r`Gambarkan tiga struktur Lewis yang mungkin untuk ion $\text{N}_2\text{O}_2^{2-}$ tersebut (24 elektron valensi).`,
            answer: r`Tiga struktur yang memenuhi oktet (semua 24 e⁻), misalnya:

- **I** (kerangka O–N–N–O): O–N=N–O, tiap N 1 pasangan bebas, tiap O 3 pasangan bebas.
- **II** (kerangka O–N–N–O): O=N–N–O dengan ikatan rangkap di satu ujung: O kiri 2 pasangan bebas, N kiri 1, N kanan 2, O kanan 3.
- **III** (kerangka N–O–O–N): N–O–O⁺=N dengan pasangan bebas melengkapi oktet: N kiri 3, O kiri 2, O kanan 1, N kanan 2 (muatan besar, tidak lazim).

Struktur I, $\text{O–N=N–O}$ dengan ikatan rangkap N=N, adalah struktur hiponitrit yang sebenarnya.`,
            hints: [
              r`24 elektron = 12 pasang. Mulailah dengan kerangka dan ikatan tunggal, lalu lengkapi oktet atom terluar lebih dulu.`,
              r`Jika atom pusat belum oktet, ubah pasangan bebas menjadi ikatan rangkap. N biasanya 3 ikatan dengan 1 pasangan bebas; O netral 2 ikatan dengan 2 pasangan bebas.`,
              r`Susunan atom yang berbeda (O–N–N–O atau konektivitas lain) dan posisi ikatan rangkap yang berbeda menghasilkan struktur valid yang berbeda.`,
            ],
            work: [
              r`Total: 24 e⁻ = 12 pasang. Ambil kerangka O–N–N–O (3 ikatan tunggal memakai 3 pasang).`,
              r`Struktur I: ikatan rangkap N=N, 3 pasangan bebas pada tiap O, 1 pasangan bebas pada tiap N. Pasangan: $4 + 3 + 3 + 1 + 1 = 12$ ✓. Semua oktet terpenuhi.`,
              r`Struktur II: ikatan rangkap N=O di satu ujung: O=N–N–O. O kiri 2 pasangan bebas; N kiri 1; N kanan 2; O kanan 3. Total 12 pasang ✓.`,
              r`Struktur III: kerangka berbeda, N–O–O–N, ditulis N–O–O⁺=N dengan 3, 2, 1, dan 2 pasangan bebas (N kiri, O kiri, O kanan, N kanan): 4 pasangan ikatan + 8 pasangan bebas = 12 ✓.`,
            ],
            explanation: r`Terdapat $2(5) + 2(6) + 2 = 24$ elektron valensi (12 pasang). Kerangka yang diharapkan adalah O–N–N–O (hiponitrit, $[\text{O–N=N–O}]^{2-}$); alternatifnya menyusun ulang atom atau memindahkan ikatan rangkap.

**Struktur I** (struktur hiponitrit yang lazim): O–N=N–O. Ikatan: 1 + 2 + 1 = 4 pasang; pasangan bebas: 3 pada tiap O (6) + 1 pada tiap N (2) = 8. Total 12 pasang ✓.

**Struktur II**: $\text{O}{=}\text{N}{-}\text{N}{-}\text{O}$ dengan ikatan rangkap di satu ujung: O kiri 2 pb, N kiri 1 pb, N kanan 2 pb, O kanan 3 pb. Ikatan 2 + 1 + 1 = 4 pasang, pasangan bebas 2 + 1 + 2 + 3 = 8. Total 12 pasang ✓.

**Struktur III**: kerangka lain, N–O–O–N, ditulis N–O–O⁺=N dengan 3, 2, 1, dan 2 pasangan bebas pada N kiri, O kiri, O kanan, N kanan: 4 pasangan ikatan + 8 pasangan bebas = 12 ✓. Mirip peroksida dengan muatan formal besar.

Karena soal hanya meminta tiga struktur yang mungkin, tiga struktur valid 24 elektron yang memenuhi oktet dapat diterima; muatan formal pada bagian (b) menentukan yang terbaik.`,
          },
        },
        {
          id: 'p25-4b', lecture: 'L9', topic: 'Formal charge', source: 'past', difficulty: 3,
          past: { paper: 'kuis2-2025', label: '4b', points: 10 },
          kind: 'open',
          stem: r`Write the formal charge of each atom in each Lewis structure of the $\text{N}_2\text{O}_2^{2-}$ ion from your answer to part (a), then decide which Lewis structure is the most stable.`,
          answer: r`Structure I (O–N=N–O): O $-1$, N $0$, N $0$, O $-1$. Structure II (O=N–N–O): O $0$, N $0$, N $-1$, O $-1$. Structure III (N–O–O–N type): large charges ($-2$, $+1$, ...). Most stable: **structure I**, O–N=N–O, with $-1$ on each (more electronegative) O and $0$ on N.`,
          hints: [
            r`$FC = V - N_{\text{lone}} - B$, where $B$ is the number of bonds (shared pairs) to the atom.`,
            r`The sum of the formal charges must equal the charge of the ion ($2-$).`,
            r`The best structure has formal charges closest to zero, and any negative charge sits on the most electronegative atom.`,
          ],
          work: [
            r`Structure I, O–N=N–O: O: $6-6-1 = -1$; N: $5-2-3 = 0$. Sum: $-1+0+0-1 = -2$ ✓.`,
            r`Structure II, O=N–N–O: O(=): $6-4-2 = 0$; N(=): $5-2-3 = 0$; N: $5-4-2 = -1$; O: $6-6-1 = -1$. Sum $= -2$ ✓.`,
            r`Structure III (N–O–O–N type) has formal charges as large as $-2$ and $+1$, so it is unfavourable.`,
            r`Best: structure I. The two $-1$ charges are on O (more electronegative than N), no $+$ charge, and it is symmetric.`,
          ],
          explanation: r`Formal charge $= V - (\text{lone-pair electrons}) - (\text{bonds})$.

**Structure I, O–N=N–O:** each O: $6 - 6 - 1 = -1$; each N: $5 - 2 - 3 = 0$. Charges: $(-1, 0, 0, -1)$, sum $-2$ ✓.

**Structure II, O=N–N–O:** O(=): $6 - 4 - 2 = 0$; first N: $5 - 2 - 3 = 0$; second N: $5 - 4 - 2 = -1$; last O: $6 - 6 - 1 = -1$. Charges: $(0, 0, -1, -1)$, sum $-2$ ✓.

**Structure III (N–O–O–N type):** formal charges of $-2$, $0$, $+1$, $-1$ occur, which are the largest in magnitude.

The most stable structure has formal charges closest to zero, with negative formal charge on the most electronegative atom (L9 formal-charge rules). Structure I has the lowest charge magnitudes and puts both $-1$ charges on the more electronegative O atoms (II places one $-1$ on N). So **structure I (O–N=N–O) is the most stable** — consistent with the actual hyponitrite ion.`,
          indo: {
            stem: r`Tuliskan muatan formal setiap atom untuk setiap struktur Lewis ion $\text{N}_2\text{O}_2^{2-}$ pada jawaban soal a, kemudian tentukan struktur Lewis yang paling stabil.`,
            answer: r`Struktur I (O–N=N–O): O $-1$, N $0$, N $0$, O $-1$. Struktur II (O=N–N–O): O $0$, N $0$, N $-1$, O $-1$. Struktur III (jenis N–O–O–N): muatan besar ($-2$, $+1$, ...). Paling stabil: **struktur I**, O–N=N–O, dengan $-1$ pada tiap O (lebih elektronegatif) dan $0$ pada N.`,
            hints: [
              r`$MF = V - E_{\text{bebas}} - I$, dengan $I$ jumlah ikatan (pasangan bersama) pada atom.`,
              r`Jumlah muatan formal harus sama dengan muatan ion ($2-$).`,
              r`Struktur terbaik memiliki muatan formal paling mendekati nol, dan muatan negatif berada pada atom paling elektronegatif.`,
            ],
            work: [
              r`Struktur I, O–N=N–O: O: $6-6-1 = -1$; N: $5-2-3 = 0$. Jumlah: $-1+0+0-1 = -2$ ✓.`,
              r`Struktur II, O=N–N–O: O(=): $6-4-2 = 0$; N(=): $5-2-3 = 0$; N: $5-4-2 = -1$; O: $6-6-1 = -1$. Jumlah $= -2$ ✓.`,
              r`Struktur III (jenis N–O–O–N) memiliki muatan formal sebesar $-2$ dan $+1$, sehingga tidak menguntungkan.`,
              r`Terbaik: struktur I. Dua muatan $-1$ berada pada O (lebih elektronegatif daripada N), tidak ada muatan $+$, dan simetris.`,
            ],
            explanation: r`Muatan formal $= V - (\text{elektron pasangan bebas}) - (\text{ikatan})$.

**Struktur I, O–N=N–O:** tiap O: $6 - 6 - 1 = -1$; tiap N: $5 - 2 - 3 = 0$. Muatan: $(-1, 0, 0, -1)$, jumlah $-2$ ✓.

**Struktur II, O=N–N–O:** O(=): $6 - 4 - 2 = 0$; N pertama: $5 - 2 - 3 = 0$; N kedua: $5 - 4 - 2 = -1$; O terakhir: $6 - 6 - 1 = -1$. Muatan: $(0, 0, -1, -1)$, jumlah $-2$ ✓.

**Struktur III (jenis N–O–O–N):** muncul muatan formal $-2$, $0$, $+1$, $-1$, yang terbesar besarnya.

Struktur paling stabil memiliki muatan formal paling dekat dengan nol, dengan muatan formal negatif pada atom paling elektronegatif (aturan muatan formal L9). Struktur I memiliki besar muatan terendah dan menempatkan kedua muatan $-1$ pada atom O yang lebih elektronegatif (pada II satu muatan $-1$ berada pada N). Jadi **struktur I (O–N=N–O) paling stabil** — sesuai dengan ion hiponitrit yang sebenarnya.`,
          },
        },
      ],
    },
    {
      n: 5, points: 20,
      intro: r`An ion with charge $-1$ consists of a central atom X (atomic number = 7) and three oxygen atoms. The positions of the atoms in the Lewis structure are as follows (the figure shows one O above X, and two O atoms below X, to its lower left and lower right):

$$\begin{matrix} & \text{O} & \\ & \text{X} & \\ \text{O} & & \text{O} \end{matrix}$$`,
      introId: r`Suatu ion bermuatan $-1$ terdiri dari atom pusat X (nomor atom = 7) dan tiga atom oksigen, dengan posisi atom pada struktur Lewis sebagai berikut (gambar menunjukkan satu O di atas X, dan dua atom O di bawah X, di kiri-bawah dan kanan-bawah):

$$\begin{matrix} & \text{O} & \\ & \text{X} & \\ \text{O} & & \text{O} \end{matrix}$$`,
      parts: [
        {
          id: 'p25-5a', lecture: 'L10', topic: 'VSEPR shapes', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2025', label: '5a', points: 10 },
          kind: 'open',
          stem: r`Write the bond angle and the name of the molecular shape.`,
          answer: r`X is N, so the ion is $\text{NO}_3^-$: bond angle $120^\circ$, trigonal planar.`,
          hints: [
            r`Identify X from its atomic number, then count the total valence electrons of the ion.`,
            r`Draw the Lewis structure (with resonance), then count electron domains around the central atom.`,
            r`Compare the number of bonding domains and lone pairs on X to decide the shape.`,
          ],
          work: [
            r`$Z = 7$ is nitrogen, so the ion is $\text{NO}_3^-$.`,
            r`Valence electrons: $5 + 3(6) + 1 = 24$. Lewis structure: N=O and two N–O⁻ (three equivalent resonance forms); N has no lone pair.`,
            r`3 electron domains (3 bonded atoms, 0 lone pairs): AX₃ → trigonal planar.`,
            r`Bond angle $= 120^\circ$.`,
          ],
          explanation: r`The element with $Z = 7$ is nitrogen, so the ion is nitrate, $\text{NO}_3^-$, with $5 + 3(6) + 1 = 24$ valence electrons. The Lewis structure has one N=O and two N–O⁻ bonds (three equivalent resonance forms), and no lone pair on N. The central N therefore has three electron domains, all bonding (AX₃). By VSEPR (L10) the domains spread as far apart as possible: **trigonal planar**, with O–N–O bond angles of **$120^\circ$**. (The drawn arrangement in the question is only a skeleton, not the geometry.)`,
          indo: {
            stem: r`Tuliskan besar sudut ikatan dan nama bentuk molekulnya.`,
            answer: r`X adalah N, sehingga ion adalah $\text{NO}_3^-$: sudut ikatan $120^\circ$, bentuk segitiga planar (trigonal planar).`,
            hints: [
              r`Tentukan X dari nomor atomnya, lalu hitung total elektron valensi ion.`,
              r`Gambar struktur Lewis (dengan resonansi), lalu hitung domain elektron di sekitar atom pusat.`,
              r`Bandingkan jumlah domain ikatan dan pasangan bebas pada X untuk menentukan bentuknya.`,
            ],
            work: [
              r`$Z = 7$ adalah nitrogen, sehingga ion adalah $\text{NO}_3^-$.`,
              r`Elektron valensi: $5 + 3(6) + 1 = 24$. Struktur Lewis: N=O dan dua N–O⁻ (tiga bentuk resonansi ekuivalen); N tidak memiliki pasangan bebas.`,
              r`3 domain elektron (3 atom terikat, 0 pasangan bebas): AX₃ → trigonal planar.`,
              r`Sudut ikatan $= 120^\circ$.`,
            ],
            explanation: r`Unsur dengan $Z = 7$ adalah nitrogen, sehingga ion adalah nitrat, $\text{NO}_3^-$, dengan $5 + 3(6) + 1 = 24$ elektron valensi. Struktur Lewisnya memiliki satu N=O dan dua N–O⁻ (tiga bentuk resonansi ekuivalen), dan tidak ada pasangan bebas pada N. Jadi N pusat memiliki tiga domain elektron, semuanya ikatan (AX₃). Menurut VSEPR (L10), domain tersebar sejauh mungkin: **segitiga planar (trigonal planar)**, dengan sudut O–N–O **$120^\circ$**. (Susunan gambar pada soal hanyalah kerangka, bukan geometri.)`,
          },
        },
        {
          id: 'p25-5b', lecture: 'L10', topic: 'Molecular polarity', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2025', label: '5b', points: 10 },
          kind: 'mcq',
          stem: r`State whether the ion/molecule is polar or nonpolar.`,
          options: [r`Polar`, r`Nonpolar`],
          answer: [1],
          hints: [
            r`Each N–O bond is polar. Ask whether the bond dipoles cancel in the shape you found in part (a).`,
            r`Check the symmetry: are the three outer atoms identical and equally spaced around the centre?`,
          ],
          work: [
            r`Each N–O bond has a dipole because O is more electronegative than N.`,
            r`The shape is trigonal planar with three identical, symmetrically arranged O atoms (120° apart, no lone pair on N).`,
            r`The three bond dipoles sum to zero, so the species is nonpolar (zero net dipole).`,
          ],
          explanation: r`Each N–O bond is polar ($\chi(\text{O}) > \chi(\text{N})$), but $\text{NO}_3^-$ is trigonal planar with three identical O atoms at $120^\circ$ and no lone pair on the central atom. The three equal bond dipoles are vectors that cancel (net dipole $= 0$), so the species is **nonpolar** (L10).`,
          indo: {
            stem: r`Tuliskan apakah molekul tersebut bersifat polar atau tidak polar.`,
            options: [r`Polar`, r`Tidak polar`],
            hints: [
              r`Setiap ikatan N–O bersifat polar. Tanyakan apakah dipol ikatan saling meniadakan pada bentuk yang kamu temukan di bagian (a).`,
              r`Periksa simetri: apakah ketiga atom terluar identik dan tersebar sama jauh di sekitar pusat?`,
            ],
            work: [
              r`Setiap ikatan N–O memiliki dipol karena O lebih elektronegatif daripada N.`,
              r`Bentuknya trigonal planar dengan tiga atom O identik yang tersusun simetris (berjarak 120°, tanpa pasangan bebas pada N).`,
              r`Ketiga dipol ikatan berjumlah nol, sehingga spesi bersifat tidak polar (dipol total nol).`,
            ],
            explanation: r`Setiap ikatan N–O polar ($\chi(\text{O}) > \chi(\text{N})$), tetapi $\text{NO}_3^-$ berbentuk trigonal planar dengan tiga atom O identik pada $120^\circ$ dan tanpa pasangan bebas pada atom pusat. Tiga dipol ikatan yang sama besar adalah vektor yang saling meniadakan (dipol total $= 0$), sehingga spesi bersifat **tidak polar** (L10).`,
          },
        },
      ],
    },
  ],
}
