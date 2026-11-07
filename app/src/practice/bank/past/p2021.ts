import type { PastPaper } from '../../../types'

const r = String.raw

export const paper: PastPaper = {
  id: 'kuis2-2021',
  year: 2021,
  title: 'Quiz 2 2021',
  titleId: 'Kuis 2 2021',
  date: '20 Nov 2021',
  minutes: 60,
  constants: r`No constants were printed in the reconstructed paper. Use $h = 6.626\times10^{-34}$ J s, $c = 3.00\times10^{8}$ m/s, $E_n = -2.18\times10^{-18}\,\text{J}/n^2$ for hydrogen-like energy levels.`,
  constantsId: r`Tidak ada konstanta yang tercetak pada soal yang direkonstruksi. Gunakan $h = 6{,}626\times10^{-34}$ J s, $c = 3{,}00\times10^{8}$ m/s, $E_n = -2{,}18\times10^{-18}\,\text{J}/n^2$ untuk tingkat energi mirip-hidrogen.`,
  note: 'Reconstructed from one student\'s Moodle attempt review (Kuis 2 Kimia Dasar IA 2021/2022, FTI-J and FTSL-J). Correct answers are taken from the "correct answer" lines where shown; otherwise solved by us. Q7 hybridisation answers are not shown in the review, so they are inferred. Problems 9–13 (coordination compounds) are outside the L7–L10 slides.',
  problems: [
    /* ───────────── 1 ───────────── */
    {
      n: 1, points: 3,
      intro: r`Lithium is used in rechargeable batteries. Answer about the ground-state Li atom.`,
      introId: r`Unsur litium merupakan unsur yang digunakan dalam baterai isi ulang.`,
      parts: [
        {
          id: 'p21-1a', lecture: 'L7', topic: 'Quantum numbers', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2021', label: '1a', points: 1 },
          kind: 'numeric', answer: 0, unit: '', tol: { abs: 0.01 },
          stem: r`The secondary (azimuthal) quantum number $l$ of the outermost electron of lithium in its ground state is ____ (give a number).`,
          hints: [r`Write the ground-state configuration of Li (Z = 3).`, r`Which subshell does the outermost electron occupy? Recall $s \to l=0$, $p \to l=1$.`],
          work: [r`Li: $1s^2 2s^1$.`, r`The outermost electron is in the $2s$ subshell.`, r`For an s subshell $l = 0$.`],
          explanation: r`Lithium ($Z=3$) has the ground-state configuration $1s^2 2s^1$. The outermost electron sits in a $2s$ orbital; s subshells have $l = 0$. So $l = 0$.`,
          indo: {
            stem: r`Bilangan kuantum sekunder (l) untuk elektron terluar litium pada keadaan dasar adalah ____ (Jawaban dalam angka).`,
            hints: [r`Tuliskan konfigurasi elektron keadaan dasar Li (Z = 3).`, r`Elektron terluar berada di subkulit apa? Ingat $s \to l=0$, $p \to l=1$.`],
            work: [r`Li: $1s^2 2s^1$.`, r`Elektron terluar berada di subkulit $2s$.`, r`Untuk subkulit s, $l = 0$.`],
            explanation: r`Litium ($Z=3$) berkonfigurasi $1s^2 2s^1$. Elektron terluar berada di orbital $2s$; subkulit s memiliki $l = 0$. Jadi $l = 0$.`,
          },
        },
        {
          id: 'p21-1b', lecture: 'L7', topic: 'Electron configuration', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2021', label: '1b', points: 1 },
          kind: 'mcq', options: ['paramagnetic', 'diamagnetic'], answer: [0],
          stem: r`The magnetic property of ground-state lithium is ____.`,
          hints: [r`Count the unpaired electrons in $1s^2 2s^1$.`, r`Unpaired electrons are attracted to a magnetic field.`],
          work: [r`$1s^2$ is paired; $2s^1$ is a single unpaired electron.`, r`One unpaired electron → attracted by a magnetic field → paramagnetic.`],
          explanation: r`Li is $1s^2 2s^1$: the 2s electron is unpaired, so the atom is **paramagnetic**.`,
          indo: {
            stem: r`Sifat magnet litium pada keadaan dasar adalah ____.`,
            options: ['paramagnetik', 'diamagnetik'],
            hints: [r`Hitung elektron tidak berpasangan pada $1s^2 2s^1$.`, r`Elektron tak berpasangan tertarik oleh medan magnet.`],
            work: [r`$1s^2$ berpasangan; $2s^1$ adalah satu elektron tak berpasangan.`, r`Satu elektron tak berpasangan → tertarik medan magnet → paramagnetik.`],
            explanation: r`Li berkonfigurasi $1s^2 2s^1$: elektron 2s tidak berpasangan, sehingga atom bersifat **paramagnetik**.`,
          },
        },
        {
          id: 'p21-1c', lecture: 'L7', topic: 'Periodic trends', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2021', label: '1c', points: 1 },
          kind: 'mcq', options: ['smaller', 'larger', 'the same'], answer: [0],
          stem: r`The first ionisation of a lithium atom gives a positive ion whose radius is ____ than the radius of the neutral atom.`,
          hints: [r`Which electron is removed, and from which shell?`, r`What happens to the effective nuclear charge felt by the remaining electrons?`],
          work: [r`Li⁺ forms by removing the $2s$ electron, leaving $1s^2$.`, r`The outer shell $n=2$ disappears, and the nuclear charge ($+3$) now pulls only 2 electrons.`, r`So Li⁺ is much smaller than Li.`],
          explanation: r`Li → Li⁺ + e⁻ removes the lone $2s$ electron, so the $n = 2$ shell is gone and the two remaining $1s$ electrons feel the full +3 nuclear charge. A cation is always smaller than its parent atom; here the radius is **smaller**.`,
          indo: {
            stem: r`Ionisasi pertama atom litium menghasilkan ion positif dengan ukuran jari-jari yang ____ daripada jari-jari atom netralnya.`,
            options: ['lebih kecil', 'lebih besar', 'sama'],
            hints: [r`Elektron mana yang dilepas, dari kulit mana?`, r`Apa yang terjadi pada muatan inti efektif yang dirasakan elektron tersisa?`],
            work: [r`Li⁺ terbentuk dengan melepas elektron $2s$, tersisa $1s^2$.`, r`Kulit terluar $n=2$ hilang, dan muatan inti $+3$ kini hanya menarik 2 elektron.`, r`Jadi Li⁺ jauh lebih kecil daripada Li.`],
            explanation: r`Li → Li⁺ + e⁻ melepas satu-satunya elektron $2s$, sehingga kulit $n = 2$ hilang dan dua elektron $1s$ tersisa merasakan muatan inti +3 penuh. Kation selalu lebih kecil daripada atom induknya; jari-jarinya **lebih kecil**.`,
          },
        },
      ],
    },
    /* ───────────── 2 ───────────── */
    {
      n: 2, points: 4,
      intro: r`The emission spectrum of lithium metal is observed at wavelengths of 460, 495, 610 and 670 nm, resulting from electron transitions from higher orbits to the orbit $n = 2$. (The figure shows the visible line spectrum of Li with lines at about 460 nm (blue), 495 nm (blue-green), 610 nm (orange) and 670 nm (red).)`,
      introId: r`Spektrum emisi logam litium diamati pada panjang gelombang 460, 495, 610, dan 670 nm, yang merupakan hasil perpindahan elektron dari orbit yang lebih tinggi ke orbit n = 2. (Gambar menunjukkan spektrum garis tampak Li dengan garis pada sekitar 460 nm (biru), 495 nm (biru-hijau), 610 nm (jingga) dan 670 nm (merah).)`,
      parts: [
        {
          id: 'p21-2a', lecture: 'L7', topic: 'Line spectra & Bohr', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2021', label: '2a', points: 2 },
          kind: 'numeric', answer: 2.96e-19, unit: 'J', tol: { rel: 0.01 },
          stem: r`Based on the emission spectrum above, the energy emitted by a Li electron at wavelength 670 nm is ____ J (answer in scientific notation).`,
          hints: [r`A photon's energy is linked to its wavelength by Planck's relation.`, r`Use $E = hc/\lambda$ and convert nm to m.`],
          work: [r`$\lambda = 670\ \text{nm} = 6.70\times10^{-7}$ m.`, r`$E = \dfrac{(6.626\times10^{-34})(3.00\times10^{8})}{6.70\times10^{-7}}$.`, r`$E \approx 2.96\times10^{-19}$ J.`],
          explanation: r`$E = \dfrac{hc}{\lambda} = \dfrac{(6.626\times10^{-34}\,\text{J s})(3.00\times10^{8}\,\text{m/s})}{6.70\times10^{-7}\,\text{m}} = 2.96\times10^{-19}\ \text{J}$.`,
          indo: {
            stem: r`Berdasarkan spektrum emisi di atas, energi yang diemisikan elektron Li pada panjang gelombang 670 nm sebesar ____ Joule. (Jawaban dalam angka format saintifik)`,
            hints: [r`Energi foton berhubungan dengan panjang gelombang melalui persamaan Planck.`, r`Gunakan $E = hc/\lambda$ dan ubah nm menjadi m.`],
            work: [r`$\lambda = 670\ \text{nm} = 6{,}70\times10^{-7}$ m.`, r`$E = \dfrac{(6{,}626\times10^{-34})(3{,}00\times10^{8})}{6{,}70\times10^{-7}}$.`, r`$E \approx 2{,}96\times10^{-19}$ J.`],
            explanation: r`$E = \dfrac{hc}{\lambda} = \dfrac{(6{,}626\times10^{-34}\,\text{J s})(3{,}00\times10^{8}\,\text{m/s})}{6{,}70\times10^{-7}\,\text{m}} = 2{,}96\times10^{-19}\ \text{J}$.`,
          },
        },
        {
          id: 'p21-2b', lecture: 'L7', topic: 'Line spectra & Bohr', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '2b', points: 2 },
          kind: 'numeric', answer: 3, unit: '', tol: { abs: 0.01 },
          stem: r`That energy corresponds to the electron transition from energy level $n =$ ____ to $n = 2$.`,
          hints: [r`Emission to $n=2$ from level $n_i$: $E = 2.18\times10^{-18}\left(\frac{1}{2^2}-\frac{1}{n_i^2}\right)$ J.`, r`Solve for $1/n_i^2$ and take the nearest integer.`],
          work: [r`$\dfrac{1}{4}-\dfrac{1}{n_i^2} = \dfrac{2.96\times10^{-19}}{2.18\times10^{-18}} = 0.136$.`, r`$\dfrac{1}{n_i^2} = 0.250-0.136 = 0.114$, so $n_i^2 \approx 8.8$.`, r`$n_i \approx 3$.`],
          explanation: r`Using the Bohr energies, $E = 2.18\times10^{-18}\left(\frac{1}{4}-\frac{1}{n_i^2}\right)$. With $E = 2.96\times10^{-19}$ J: $\frac{1}{4}-\frac{1}{n_i^2} = 0.136$, so $n_i^2 \approx 8.8$ and $n_i \approx 3$. The 670 nm line is the transition $n = 3 \to n = 2$ (the answer given by the review is 3; the small mismatch from 9 is because Li is not strictly hydrogen-like).`,
          indo: {
            stem: r`Energi tersebut berkaitan dengan transisi elektron dari tingkat energi $n =$ ____ ke $n = 2$.`,
            hints: [r`Emisi ke $n=2$ dari tingkat $n_i$: $E = 2{,}18\times10^{-18}\left(\frac{1}{2^2}-\frac{1}{n_i^2}\right)$ J.`, r`Selesaikan $1/n_i^2$ lalu ambil bilangan bulat terdekat.`],
            work: [r`$\dfrac{1}{4}-\dfrac{1}{n_i^2} = \dfrac{2{,}96\times10^{-19}}{2{,}18\times10^{-18}} = 0{,}136$.`, r`$\dfrac{1}{n_i^2} = 0{,}250-0{,}136 = 0{,}114$, sehingga $n_i^2 \approx 8{,}8$.`, r`$n_i \approx 3$.`],
            explanation: r`Dengan energi Bohr, $E = 2{,}18\times10^{-18}\left(\frac{1}{4}-\frac{1}{n_i^2}\right)$. Dengan $E = 2{,}96\times10^{-19}$ J: $\frac{1}{4}-\frac{1}{n_i^2} = 0{,}136$, sehingga $n_i^2 \approx 8{,}8$ dan $n_i \approx 3$. Garis 670 nm adalah transisi $n = 3 \to n = 2$ (jawaban pada review adalah 3; selisih kecil dari 9 karena Li tidak benar-benar mirip hidrogen).`,
          },
        },
      ],
    },
    /* ───────────── 3 ───────────── */
    {
      n: 3, points: 3,
      parts: [
        {
          id: 'p21-3', lecture: 'L7', topic: 'Photoelectric effect', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '3', points: 3 },
          kind: 'numeric', answer: 339, unit: 'nm', tol: { rel: 0.01 },
          stem: r`The binding energies (work functions, $w$) of Li and Mg are $4.65\times10^{-19}$ and $5.86\times10^{-19}$ J respectively. The wavelength (in nm) of the minimum photon required to release electrons from the surface of lithium metal but not from the surface of magnesium metal is ____ (answer to two decimals).`,
          hints: [r`A photon ejects an electron only if $hc/\lambda \ge w$.`, r`The photon must have $E < w_{\text{Mg}}$ so that Mg is not affected; the boundary of that condition is $E = w_{\text{Mg}}$.`, r`Convert $w_{\text{Mg}}$ to a wavelength with $\lambda = hc/w$.`],
          work: [r`Li is ejected if $\lambda \le hc/w_{\text{Li}} = 427$ nm; Mg is not ejected if $\lambda > hc/w_{\text{Mg}}$.`, r`The limiting wavelength set by Mg: $\lambda = \dfrac{(6.626\times10^{-34})(3.00\times10^{8})}{5.86\times10^{-19}}$.`, r`$\lambda = 3.39\times10^{-7}\ \text{m} \approx 339$ nm.`],
          explanation: r`The photon must satisfy $w_{\text{Li}} \le E < w_{\text{Mg}}$, i.e. $\dfrac{hc}{w_{\text{Mg}}} < \lambda \le \dfrac{hc}{w_{\text{Li}}}$, which is $339\ \text{nm} < \lambda \le 427\ \text{nm}$. The "minimum photon" asked for by the quiz (official answer 339) is the limiting wavelength set by Mg: $\lambda = hc/w_{\text{Mg}} = (6.626\times10^{-34})(3.00\times10^{8})/(5.86\times10^{-19}) = 3.39\times10^{-7}$ m $= 339$ nm. Note: the student's answer 425 (the Li threshold, ≈ 427 nm) was marked wrong; the key is 339.`,
          indo: {
            stem: r`Jika diketahui besar energi ikat (fungsi kerja, w) Li dan Mg berturut-turut adalah $4{,}65 \times 10^{-19}$ dan $5{,}86 \times 10^{-19}$ Joule, panjang gelombang (dalam nm) foton minimum yang dibutuhkan untuk melepas elektron pada permukaan logam litium tetapi tidak melepaskan elektron pada permukaan logam magnesium adalah …. (Jawaban dalam angka dua desimal)`,
            hints: [r`Foton melepas elektron hanya jika $hc/\lambda \ge w$.`, r`Foton harus berenergi $E < w_{\text{Mg}}$ agar Mg tidak terpengaruh; batas kondisi ini adalah $E = w_{\text{Mg}}$.`, r`Ubah $w_{\text{Mg}}$ menjadi panjang gelombang dengan $\lambda = hc/w$.`],
            work: [r`Li terlepas jika $\lambda \le hc/w_{\text{Li}} = 427$ nm; Mg tidak terlepas jika $\lambda > hc/w_{\text{Mg}}$.`, r`Panjang gelombang batas dari Mg: $\lambda = \dfrac{(6{,}626\times10^{-34})(3{,}00\times10^{8})}{5{,}86\times10^{-19}}$.`, r`$\lambda = 3{,}39\times10^{-7}\ \text{m} \approx 339$ nm.`],
            explanation: r`Foton harus memenuhi $w_{\text{Li}} \le E < w_{\text{Mg}}$, yaitu $\dfrac{hc}{w_{\text{Mg}}} < \lambda \le \dfrac{hc}{w_{\text{Li}}}$, atau $339\ \text{nm} < \lambda \le 427\ \text{nm}$. "Foton minimum" yang ditanyakan (kunci 339) adalah panjang gelombang batas dari Mg: $\lambda = hc/w_{\text{Mg}} = (6{,}626\times10^{-34})(3{,}00\times10^{8})/(5{,}86\times10^{-19}) = 3{,}39\times10^{-7}$ m $= 339$ nm. Catatan: jawaban mahasiswa 425 (ambang Li, ≈ 427 nm) dinilai salah; kuncinya 339.`,
          },
        },
      ],
    },
    /* ───────────── 4 ───────────── */
    {
      n: 4, points: 3,
      intro: r`The figure shows the structure of asparagine (zwitterion form), drawn with atom labels: C1 is the carboxylate carbon, O=C1–O⁻; C2 is CH bonded to C1, to N1 (the –NH₃⁺ group) and to C3; C3 is CH₂; C4 is the amide carbon, C4(=O)–N2H₂, bonded to C3.`,
      introId: r`Perhatikan struktur berikut. (Gambar menunjukkan asparagin dalam bentuk zwitterion dengan label atom: C1 adalah karbon karboksilat, O=C1–O⁻; C2 adalah CH yang terikat pada C1, N1 (gugus –NH₃⁺) dan C3; C3 adalah CH₂; C4 adalah karbon amida, C4(=O)–N2H₂, terikat pada C3.)`,
      parts: [
        {
          id: 'p21-4', lecture: 'L10', topic: 'Hybridization', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '4', points: 3 },
          kind: 'mcq',
          options: ['i, iii', 'i, ii', 'i, ii, iii', 'i only', 'ii, iii'], answer: [3],
          stem: r`Among the following statements:
  
i. asparagine is an amino acid containing 5 electropositive H atoms.
ii. the geometry around the central atom C1 is tetrahedral, while around N1 it is trigonal bipyramidal.
iii. the pi bond between atom C4 and the O atom forms from overlap of an $sp^2$ hybrid orbital of C and an $sp^2$ hybrid orbital of O.

the correct statement(s) is/are …`,
          hints: [r`Count domains around C1 and N1 separately, then match to a shape.`, r`Is a pi bond formed from hybrid orbitals or from unhybridised ones?`, r`Which H atoms are bonded to an element more electronegative than H (so they are δ⁺)?`],
          work: [r`(i) H on N (3 in –NH₃⁺ and 2 in –NH₂) are bonded to N (more electronegative) → 5 electropositive H. True.`, r`(ii) C1 has 3 domains (C=O, C–O⁻, C–C2) → trigonal planar, not tetrahedral. N1 has 4 domains (3 N–H + C) → tetrahedral, not trigonal bipyramidal. False.`, r`(iii) A pi bond is made by side-on overlap of unhybridised $p$ orbitals, not $sp^2$ hybrids ($sp^2$ hybrids form the sigma framework). False.`, r`Only (i) is true.`],
          explanation: r`**(i)** True: the 3 H on N1 and 2 H on N2 are attached to the more electronegative N, so they are electropositive (δ⁺); the C–H hydrogens are not counted. **(ii)** False: C1 has three electron domains → trigonal planar ($sp^2$); N1 has four domains → tetrahedral ($sp^3$). **(iii)** False: the C=O pi bond comes from side-on overlap of the unhybridised $2p$ orbitals on C and O; the $sp^2$ hybrids make the sigma bond. Answer: **i only**.`,
          indo: {
            stem: r`Di antara pernyataan berikut ini:

i. asparagin merupakan asam amino yang mengandung 5 atom H yang elektropositif.
ii. geometri atom pusat C1 adalah tetrahedral, sementara atom pusat N1 segitiga bipiramida.
iii. ikatan pi antara atom C4 dan atom O terbentuk akibat tumpangsuh (overlap) antara orbital hibrida $sp^2$ dari atom C dan orbital hibrida $sp^2$ dari atom O

pernyataan yang benar adalah …….`,
            options: ['i, iii', 'i, ii', 'i, ii, iii', 'i saja', 'ii, iii'],
            hints: [r`Hitung domain di sekitar C1 dan N1 secara terpisah, lalu cocokkan dengan bentuknya.`, r`Apakah ikatan pi dibentuk dari orbital hibrida atau orbital tak terhibridisasi?`, r`H mana yang terikat pada unsur yang lebih elektronegatif daripada H (sehingga δ⁺)?`],
            work: [r`(i) H pada N (3 di –NH₃⁺ dan 2 di –NH₂) terikat pada N (lebih elektronegatif) → 5 H elektropositif. Benar.`, r`(ii) C1 punya 3 domain (C=O, C–O⁻, C–C2) → segitiga planar, bukan tetrahedral. N1 punya 4 domain (3 N–H + C) → tetrahedral, bukan segitiga bipiramida. Salah.`, r`(iii) Ikatan pi dibentuk dari tumpangsuh samping orbital $p$ tak terhibridisasi, bukan hibrida $sp^2$ (hibrida $sp^2$ membentuk kerangka sigma). Salah.`, r`Hanya (i) yang benar.`],
            explanation: r`**(i)** Benar: 3 H pada N1 dan 2 H pada N2 terikat pada N yang lebih elektronegatif, sehingga elektropositif (δ⁺); H pada C tidak dihitung. **(ii)** Salah: C1 punya tiga domain elektron → segitiga planar ($sp^2$); N1 punya empat domain → tetrahedral ($sp^3$). **(iii)** Salah: ikatan pi C=O berasal dari tumpangsuh samping orbital $2p$ tak terhibridisasi pada C dan O; hibrida $sp^2$ membentuk ikatan sigma. Jawaban: **i saja**.`,
          },
        },
      ],
    },
    /* ───────────── 5 ───────────── */
    {
      n: 5, points: 3,
      intro: r`Same asparagine structure as in problem 4 (atoms labelled C1–C4, N1, N2, O).`,
      introId: r`Perhatikan struktur asparagin yang sama seperti pada soal 4 (atom berlabel C1–C4, N1, N2, O).`,
      parts: [
        {
          id: 'p21-5', lecture: 'L10', topic: 'VSEPR shapes', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '5', points: 3 },
          kind: 'mcq',
          options: ['i, ii', 'i, iii', 'ii, iii', 'i only', 'i, ii, iii'], answer: [2],
          stem: r`The correct statement(s) is/are:

i. The central atom N2 has only 3 bonding domains.
ii. The bond angle O–C1–C2 equals the bond angle N2–C4–C3, namely 120°.
iii. The pi bond between atom C4 and the O atom forms from overlap of one of the $p$ orbitals of C4 and one of the $p$ orbitals of O.`,
          hints: [r`Count all electron domains (bonding and lone pairs) at N2.`, r`What is the ideal angle at a carbon with three domains?`, r`Pi bonds use unhybridised p orbitals overlapping side by side.`],
          work: [r`(i) N2 has 3 bonds (2 N–H, 1 N–C4) and 1 lone pair → 4 electron domains, so "only 3 domains" is not right per the key. False.`, r`(ii) C1 and C4 each have 3 domains → trigonal planar → both angles ≈ 120°. True.`, r`(iii) The C4=O pi bond is a side-on overlap of a $p$ orbital on C4 with a $p$ orbital on O. True.`, r`Answer: ii and iii.`],
          explanation: r`**(i)** N2 has three bonding domains plus a lone pair (four electron domains); the key treats the statement as false. **(ii)** True: C1 (O=C–O⁻, C–C2) and C4 (C=O, C–N2, C–C3) are both trigonal planar, so both angles are ≈ 120°. **(iii)** True: the pi bond is formed by side-on overlap of unhybridised $p$ orbitals on C4 and O. Answer: **ii, iii**. Note: the key regards (i) as false, presumably because N2 also carries a lone pair.`,
          indo: {
            stem: r`Pernyataan berikut yang benar adalah

i. Atom pusat N2 hanya memiliki 3 domain ikatan.
ii. Sudut ikatan O-C1-C2 sama dengan sudut ikatan N2-C4-C3, yaitu 120°.
iii. Ikatan pi antara atom C4 dan atom O terbentuk akibat tumpangsuh antara salah satu orbital p atom C4 dan salah satu orbital p atom O.`,
            options: ['i, ii', 'i, iii', 'ii, iii', 'i saja', 'i, ii, iii'],
            hints: [r`Hitung semua domain elektron (ikatan dan pasangan bebas) pada N2.`, r`Berapa sudut ideal pada karbon dengan tiga domain?`, r`Ikatan pi memakai orbital p tak terhibridisasi yang bertumpangsuh secara samping.`],
            work: [r`(i) N2 punya 3 ikatan (2 N–H, 1 N–C4) dan 1 pasangan bebas → 4 domain elektron, sehingga "hanya 3 domain" salah menurut kunci. Salah.`, r`(ii) C1 dan C4 masing-masing punya 3 domain → segitiga planar → kedua sudut ≈ 120°. Benar.`, r`(iii) Ikatan pi C4=O adalah tumpangsuh samping orbital $p$ pada C4 dengan orbital $p$ pada O. Benar.`, r`Jawaban: ii dan iii.`],
            explanation: r`**(i)** N2 memiliki tiga domain ikatan ditambah satu pasangan bebas (empat domain elektron); kunci menganggap pernyataan ini salah. **(ii)** Benar: C1 (O=C–O⁻, C–C2) dan C4 (C=O, C–N2, C–C3) keduanya segitiga planar, sehingga kedua sudut ≈ 120°. **(iii)** Benar: ikatan pi terbentuk dari tumpangsuh samping orbital $p$ tak terhibridisasi pada C4 dan O. Jawaban: **ii, iii**. Catatan: kunci menganggap (i) salah, kemungkinan karena N2 juga memiliki pasangan bebas.`,
          },
        },
      ],
    },
    /* ───────────── 6 ───────────── */
    {
      n: 6, points: 9,
      intro: r`Reaction: PCl₅ + Cl⁻ → PCl₆⁻. Regarding the formation of the PCl₆⁻ ion above, fill in the table: molecular shape (PCl₅ and PCl₆⁻), polarity (PCl₅), total number of covalent bonds (PCl₅ and PCl₆⁻), number of coordinate covalent bonds (PCl₅ and PCl₆⁻), and formal charge of P (PCl₅ and PCl₆⁻).`,
      introId: r`Reaksi: PCl₅ + Cl⁻ → PCl₆⁻. Terkait dengan reaksi pembentukan ion PCl₆⁻ di atas, isilah Tabel berikut: bentuk molekul (PCl₅ dan PCl₆⁻), sifat kepolaran (PCl₅), jumlah ikatan kovalen total (PCl₅ dan PCl₆⁻), jumlah ikatan kovalen koordinasi (PCl₅ dan PCl₆⁻), dan muatan formal atom P (PCl₅ dan PCl₆⁻).`,
      parts: [
        {
          id: 'p21-6a', lecture: 'L10', topic: 'VSEPR shapes', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2021', label: '6a', points: 2 },
          kind: 'open',
          stem: r`Molecular shape of PCl₅ and of PCl₆⁻.`,
          answer: r`PCl₅: trigonal bipyramidal. PCl₆⁻: octahedral.`,
          hints: [r`Count the electron domains on P in each species.`, r`5 domains and 6 domains (no lone pairs) correspond to which standard geometries?`],
          work: [r`PCl₅: 5 bonding pairs, 0 lone pairs → AX₅.`, r`PCl₆⁻: 6 bonding pairs, 0 lone pairs → AX₆.`, r`AX₅ = trigonal bipyramidal; AX₆ = octahedral.`],
          explanation: r`PCl₅ has five bonding domains and no lone pair on P (AX₅): **trigonal bipyramidal**. PCl₆⁻ has six bonding domains and no lone pair (AX₆): **octahedral**.`,
          indo: {
            stem: r`Bentuk molekul PCl₅ dan ion PCl₆⁻.`,
            answer: r`PCl₅: bipiramida segitiga. PCl₆⁻: oktahedral.`,
            hints: [r`Hitung domain elektron pada P di tiap spesi.`, r`5 domain dan 6 domain (tanpa pasangan bebas) sesuai geometri standar yang mana?`],
            work: [r`PCl₅: 5 pasangan ikatan, 0 pasangan bebas → AX₅.`, r`PCl₆⁻: 6 pasangan ikatan, 0 pasangan bebas → AX₆.`, r`AX₅ = bipiramida segitiga; AX₆ = oktahedral.`],
            explanation: r`PCl₅ memiliki lima domain ikatan tanpa pasangan bebas pada P (AX₅): **bipiramida segitiga**. PCl₆⁻ memiliki enam domain ikatan tanpa pasangan bebas (AX₆): **oktahedral**.`,
          },
        },
        {
          id: 'p21-6b', lecture: 'L10', topic: 'Molecular polarity', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2021', label: '6b', points: 1 },
          kind: 'mcq', options: ['polar', 'non-polar'], answer: [1],
          stem: r`Polarity of the PCl₅ molecule.`,
          hints: [r`P–Cl bonds are polar; what matters is whether the bond dipoles cancel.`, r`Is the trigonal bipyramid symmetric when all five outer atoms are identical?`],
          work: [r`All five outer atoms are Cl and no lone pair is on P.`, r`The three equatorial dipoles cancel, and the two axial dipoles cancel.`, r`Net dipole = 0 → non-polar.`],
          explanation: r`Each P–Cl bond is polar, but the trigonal bipyramid with five identical Cl atoms and no lone pair is symmetric: the equatorial dipoles cancel each other and the axial ones cancel each other. $\mu_{\text{net}} = 0$ → **non-polar**.`,
          indo: {
            stem: r`Sifat kepolaran molekul PCl₅.`,
            options: ['polar', 'non polar'],
            hints: [r`Ikatan P–Cl polar; yang penting apakah dipol ikatan saling meniadakan.`, r`Apakah bipiramida segitiga simetris bila kelima atom luarnya identik?`],
            work: [r`Kelima atom luar adalah Cl dan tidak ada pasangan bebas pada P.`, r`Tiga dipol ekuatorial saling meniadakan, dua dipol aksial juga saling meniadakan.`, r`Dipol total = 0 → non polar.`],
            explanation: r`Tiap ikatan P–Cl polar, tetapi bipiramida segitiga dengan lima atom Cl identik dan tanpa pasangan bebas bersifat simetris: dipol ekuatorial saling meniadakan, begitu juga dipol aksial. $\mu_{\text{total}} = 0$ → **non polar**.`,
          },
        },
        {
          id: 'p21-6c', lecture: 'L9', topic: 'Covalent bonding', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2021', label: '6c', points: 2 },
          kind: 'open',
          stem: r`Total number of covalent bonds in PCl₅ and in PCl₆⁻.`,
          answer: r`PCl₅: 5. PCl₆⁻: 6.`,
          hints: [r`Each P–Cl bond is one shared pair.`, r`Count the P–Cl bonds in each species.`],
          work: [r`PCl₅ has five P–Cl single bonds → 5.`, r`PCl₆⁻ has six P–Cl single bonds → 6.`],
          explanation: r`Every P–Cl link is a single covalent bond (a shared pair). PCl₅ has **5** and PCl₆⁻ has **6**.`,
          indo: {
            stem: r`Jumlah ikatan kovalen total pada PCl₅ dan pada PCl₆⁻.`,
            answer: r`PCl₅: 5. PCl₆⁻: 6.`,
            hints: [r`Setiap ikatan P–Cl adalah satu pasangan elektron yang dipakai bersama.`, r`Hitung ikatan P–Cl pada tiap spesi.`],
            work: [r`PCl₅ memiliki lima ikatan tunggal P–Cl → 5.`, r`PCl₆⁻ memiliki enam ikatan tunggal P–Cl → 6.`],
            explanation: r`Setiap ikatan P–Cl adalah ikatan kovalen tunggal (satu pasangan bersama). PCl₅ memiliki **5** dan PCl₆⁻ memiliki **6**.`,
          },
        },
        {
          id: 'p21-6d', lecture: 'L9', topic: 'Coordinate covalent bonds', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '6d', points: 2 },
          kind: 'open',
          stem: r`Number of coordinate covalent bonds in PCl₅ and in PCl₆⁻.`,
          answer: r`PCl₅: 0. PCl₆⁻: 1 (the P–Cl bond from Cl⁻ donating a lone pair to PCl₅).`,
          hints: [r`A coordinate bond is a bond whose shared pair comes from only one atom.`, r`In the reaction, which species supplies the lone pair for the new bond?`],
          work: [r`In PCl₅ each Cl contributes one electron and P contributes one: all 5 bonds are ordinary covalent → 0 coordinate.`, r`In PCl₆⁻ the sixth bond is made when Cl⁻ donates a lone pair to P in PCl₅.`, r`So PCl₆⁻ has 1 coordinate covalent bond.`],
          explanation: r`In PCl₅ every bond is a normal covalent bond (each atom supplies one electron): **0** coordinate bonds. In PCl₅ + Cl⁻ → PCl₆⁻, the Cl⁻ donates a lone pair to P to form the sixth P–Cl bond: **1** coordinate covalent bond (L9).`,
          indo: {
            stem: r`Jumlah ikatan kovalen koordinasi pada PCl₅ dan pada PCl₆⁻.`,
            answer: r`PCl₅: 0. PCl₆⁻: 1 (ikatan P–Cl dari Cl⁻ yang menyumbangkan pasangan bebas ke PCl₅).`,
            hints: [r`Ikatan koordinasi adalah ikatan yang pasangan elektron bersamanya berasal dari satu atom saja.`, r`Pada reaksi, spesi mana yang menyediakan pasangan bebas untuk ikatan baru?`],
            work: [r`Pada PCl₅ tiap Cl menyumbang satu elektron dan P satu elektron: kelima ikatan kovalen biasa → 0 koordinasi.`, r`Pada PCl₆⁻ ikatan keenam terbentuk ketika Cl⁻ menyumbangkan pasangan bebas ke P pada PCl₅.`, r`Jadi PCl₆⁻ memiliki 1 ikatan kovalen koordinasi.`],
            explanation: r`Pada PCl₅ semua ikatan adalah kovalen biasa (tiap atom menyumbang satu elektron): **0** ikatan koordinasi. Pada PCl₅ + Cl⁻ → PCl₆⁻, Cl⁻ menyumbangkan pasangan bebas ke P untuk membentuk ikatan P–Cl keenam: **1** ikatan kovalen koordinasi (L9).`,
          },
        },
        {
          id: 'p21-6e', lecture: 'L9', topic: 'Formal charge', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '6e', points: 2 },
          kind: 'open',
          stem: r`Formal charge of the P atom in PCl₅ and in PCl₆⁻.`,
          answer: r`PCl₅: 0. PCl₆⁻: −1.`,
          hints: [r`$FC = V - L - B$ (valence − nonbonding e⁻ − bonds).`, r`P has 5 valence electrons and no lone pairs in either species.`],
          work: [r`PCl₅: $FC = 5 - 0 - 5 = 0$.`, r`PCl₆⁻: $FC = 5 - 0 - 6 = -1$.`, r`The −1 charge of the ion sits on P.`],
          explanation: r`$FC = V - L - B$. In PCl₅: $5 - 0 - 5 = \mathbf{0}$. In PCl₆⁻: $5 - 0 - 6 = \mathbf{-1}$ (the whole −1 charge of the ion is on P, since each Cl has FC = 0).`,
          indo: {
            stem: r`Muatan formal atom P pada PCl₅ dan pada PCl₆⁻.`,
            answer: r`PCl₅: 0. PCl₆⁻: −1.`,
            hints: [r`$FC = V - L - B$ (elektron valensi − elektron non-ikatan − jumlah ikatan).`, r`P memiliki 5 elektron valensi dan tanpa pasangan bebas pada kedua spesi.`],
            work: [r`PCl₅: $FC = 5 - 0 - 5 = 0$.`, r`PCl₆⁻: $FC = 5 - 0 - 6 = -1$.`, r`Muatan −1 ion berada pada P.`],
            explanation: r`$FC = V - L - B$. Pada PCl₅: $5 - 0 - 5 = \mathbf{0}$. Pada PCl₆⁻: $5 - 0 - 6 = \mathbf{-1}$ (seluruh muatan −1 ion berada pada P, karena tiap Cl memiliki FC = 0).`,
          },
        },
      ],
    },
    /* ───────────── 7 ───────────── */
    {
      n: 7, points: 8,
      intro: r`The molecular formula of guanine is C₅H₅N₅O. The figure shows the (zwitterionic) structure of guanine as a fused six- and five-membered ring system with atoms numbered: N1(–H) bonded to C6(=O) and C2; C2 bonded to an NH₂ group and double-bonded to N3⁺(–H); C4 and C5 form the fused C=C bond (C4 bonded to N3 and N9; C5 bonded to C6 and N7); in the five-membered ring N7=C8(–H)–N9(–H)–C4. Based on the structure, answer the following.`,
      introId: r`Rumus molekul guanin adalah C₅H₅N₅O. Berdasarkan struktur guanin di bawah, jawablah pertanyaan berikut. (Gambar menunjukkan struktur guanin sebagai sistem cincin enam dan lima anggota yang berfusi dengan atom bernomor: N1(–H) terikat pada C6(=O) dan C2; C2 terikat pada gugus NH₂ dan berikatan rangkap dengan N3⁺(–H); C4 dan C5 membentuk ikatan rangkap C=C yang berfusi (C4 terikat pada N3 dan N9; C5 pada C6 dan N7); pada cincin lima anggota N7=C8(–H)–N9(–H)–C4.)`,
      parts: [
        {
          id: 'p21-7a', lecture: 'L10', topic: 'Sigma & pi bonds', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '7a', points: 2 },
          kind: 'numeric', answer: 18, unit: '', tol: { abs: 0.01 },
          stem: r`The number of sigma bonds in the guanine molecule is ____ (answer as a number).`,
          hints: [r`Every bond (single or double) contains exactly one sigma bond.`, r`Count ring bonds, then the bonds to the substituents (C=O, NH₂) and the X–H bonds.`],
          work: [r`Ring skeleton: 9 ring atoms in two fused rings → 10 ring bonds → 10 σ.`, r`Exocyclic: C6=O (1 σ) and C2–NH₂ (1 σ) → 2 σ.`, r`X–H bonds as drawn: N1–H, N3–H, N9–H, C8–H, and 2 on NH₂ → 6 σ.`, r`Total $10 + 2 + 6 = 18$.`],
          explanation: r`Each single bond is 1 σ and each double bond is 1 σ + 1 π. The fused ring system has 9 atoms and 10 ring bonds (10 σ); C=O and C–NH₂ add 2 σ; the six N–H/C–H bonds add 6 σ: total **18 σ**. The review marked 18 as correct.`,
          indo: {
            stem: r`Jumlah ikatan sigma pada molekul guanin adalah ____ (Jawaban dalam angka).`,
            hints: [r`Setiap ikatan (tunggal atau rangkap) memuat tepat satu ikatan sigma.`, r`Hitung ikatan pada cincin, lalu ikatan ke substituen (C=O, NH₂) dan ikatan X–H.`],
            work: [r`Kerangka cincin: 9 atom cincin pada dua cincin berfusi → 10 ikatan cincin → 10 σ.`, r`Eksosiklik: C6=O (1 σ) dan C2–NH₂ (1 σ) → 2 σ.`, r`Ikatan X–H pada gambar: N1–H, N3–H, N9–H, C8–H, dan 2 pada NH₂ → 6 σ.`, r`Total $10 + 2 + 6 = 18$.`],
            explanation: r`Setiap ikatan tunggal = 1 σ dan setiap ikatan rangkap dua = 1 σ + 1 π. Sistem cincin berfusi memiliki 9 atom dan 10 ikatan cincin (10 σ); C=O dan C–NH₂ menambah 2 σ; enam ikatan N–H/C–H menambah 6 σ: total **18 σ**. Review menandai 18 sebagai benar.`,
          },
        },
        {
          id: 'p21-7b', lecture: 'L10', topic: 'Sigma & pi bonds', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2021', label: '7b', points: 2 },
          kind: 'numeric', answer: 4, unit: '', tol: { abs: 0.01 },
          stem: r`The number of pi bonds in the guanine molecule is ____ (answer as a number).`,
          hints: [r`Each double bond contains one pi bond (and one sigma).`, r`Find all the double bonds in the drawn structure.`],
          work: [r`Double bonds: C6=O, C2=N3⁺, C4=C5, N7=C8.`, r`Each contributes 1 π → 4 π.`],
          explanation: r`The structure has four double bonds: C6=O, C2=N3⁺, C4=C5 and N7=C8, and no triple bonds, so there are **4 π bonds**.`,
          indo: {
            stem: r`Jumlah ikatan pi adalah ____ (Jawaban dalam angka).`,
            hints: [r`Setiap ikatan rangkap dua memuat satu ikatan pi (dan satu sigma).`, r`Temukan semua ikatan rangkap pada struktur yang digambar.`],
            work: [r`Ikatan rangkap: C6=O, C2=N3⁺, C4=C5, N7=C8.`, r`Masing-masing menyumbang 1 π → 4 π.`],
            explanation: r`Struktur memiliki empat ikatan rangkap dua: C6=O, C2=N3⁺, C4=C5 dan N7=C8, tanpa ikatan rangkap tiga, sehingga ada **4 ikatan π**.`,
          },
        },
        {
          id: 'p21-7c', lecture: 'L10', topic: 'Hybridization', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '7c', points: 2 },
          kind: 'open',
          stem: r`The hybridisation of atom N7 in guanine is ____ with ____ bonding electron domains and ____ non-bonding electron domains.`,
          answer: r`$sp^2$, with 2 bonding domains and 1 non-bonding domain (lone pair).`,
          hints: [r`N7 is in the five-membered ring, N7=C8 and N7–C5. Count the domains (a double bond counts as one).`, r`Total domains → hybridisation: 2 → sp, 3 → sp², 4 → sp³.`],
          work: [r`N7 bonds: one double bond (to C8) and one single bond (to C5) → 2 bonding domains.`, r`N has 5 valence e⁻; it uses 3 in bonds, so 1 lone pair → 1 non-bonding domain.`, r`3 domains → $sp^2$.`],
          explanation: r`N7 has 2 bonding domains (N7=C8 and N7–C5) and 1 lone pair = 3 electron domains → trigonal planar → **$sp^2$** hybridisation. (The student answered $sp$ and lost the mark; the domain counts 2 and 1 were correct. The correct hybridisation is not shown in the review; it follows from 3 domains.)`,
          indo: {
            stem: r`Hibridisasi orbital atom N7 pada molekul guanin adalah ____ dengan ____ domain elektron ikatan dan ____ domain elektron non ikatan.`,
            answer: r`$sp^2$, dengan 2 domain elektron ikatan dan 1 domain non ikatan (pasangan bebas).`,
            hints: [r`N7 berada pada cincin lima anggota, N7=C8 dan N7–C5. Hitung domain (ikatan rangkap dihitung satu).`, r`Jumlah domain → hibridisasi: 2 → sp, 3 → sp², 4 → sp³.`],
            work: [r`Ikatan N7: satu ikatan rangkap (ke C8) dan satu ikatan tunggal (ke C5) → 2 domain ikatan.`, r`N memiliki 5 e⁻ valensi; 3 dipakai untuk ikatan, sehingga ada 1 pasangan bebas → 1 domain non ikatan.`, r`3 domain → $sp^2$.`],
            explanation: r`N7 memiliki 2 domain ikatan (N7=C8 dan N7–C5) dan 1 pasangan bebas = 3 domain elektron → segitiga planar → hibridisasi **$sp^2$**. (Mahasiswa menjawab $sp$ sehingga salah; jumlah domain 2 dan 1 sudah benar. Hibridisasi yang benar tidak ditampilkan dalam review; diturunkan dari 3 domain.)`,
          },
        },
        {
          id: 'p21-7d', lecture: 'L10', topic: 'Hybridization', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '7d', points: 2 },
          kind: 'open',
          stem: r`The hybridisation of atom N9 in guanine is ____ with ____ bonding electron domains and ____ non-bonding electron domains.`,
          answer: r`$sp^3$ (by domain counting), with 3 bonding domains and 1 non-bonding domain (lone pair).`,
          hints: [r`List the atoms N9 is bonded to, including H, then add its lone pair.`, r`Total domains → hybridisation (4 domains → sp³).`],
          work: [r`N9 is bonded to C4, C8 and H: 3 single bonds → 3 bonding domains.`, r`5 − 3 = 2 electrons → 1 lone pair → 1 non-bonding domain.`, r`3 + 1 = 4 domains → $sp^3$ (tetrahedral electron geometry).`],
          explanation: r`N9 has three single bonds (to C4, C8 and H) and one lone pair: 4 electron domains → **$sp^3$** by the domain-counting method used in the course. (The student's answer $sp^2$ was marked wrong, consistent with $sp^3$; the correct hybridisation is not displayed in the review, so this is inferred. In reality, the lone pair on N9 is delocalised into the aromatic π system, which would make N9 effectively $sp^2$, but the quiz counts domains.)`,
          indo: {
            stem: r`Sementara, hibridisasi orbital atom N9 pada molekul guanin adalah ____ dengan ____ domain elektron ikatan dan ____ domain elektron non ikatan.`,
            answer: r`$sp^3$ (berdasarkan hitungan domain), dengan 3 domain elektron ikatan dan 1 domain non ikatan (pasangan bebas).`,
            hints: [r`Daftar atom yang terikat pada N9, termasuk H, lalu tambahkan pasangan bebasnya.`, r`Jumlah domain → hibridisasi (4 domain → sp³).`],
            work: [r`N9 terikat pada C4, C8 dan H: 3 ikatan tunggal → 3 domain ikatan.`, r`5 − 3 = 2 elektron → 1 pasangan bebas → 1 domain non ikatan.`, r`3 + 1 = 4 domain → $sp^3$ (geometri elektron tetrahedral).`],
            explanation: r`N9 memiliki tiga ikatan tunggal (ke C4, C8 dan H) dan satu pasangan bebas: 4 domain elektron → **$sp^3$** menurut metode hitung domain dalam kuliah. (Jawaban mahasiswa $sp^2$ dinilai salah, sesuai dengan $sp^3$; hibridisasi yang benar tidak ditampilkan dalam review, jadi ini hasil penurunan. Secara nyata pasangan bebas N9 terdelokalisasi ke sistem π aromatik sehingga N9 efektif $sp^2$, tetapi soal ini menghitung domain.)`,
          },
        },
      ],
    },
    /* ───────────── 8 ───────────── */
    {
      n: 8, points: 5,
      intro: r`The NO molecule is easily oxidised to the NO⁺ cation, which is isoelectronic with N₂. The molecular orbitals $(\sigma_{2p_z})$, $(\pi_{2p_x}, \pi_{2p_y})$, $(\sigma^*_{2p_z})$ and $(\pi^*_{2p_x}, \pi^*_{2p_y})$ of NO⁺ are filled with ____, ____, ____ and ____ electrons respectively.`,
      introId: r`Molekul NO mudah teroksidasi menjadi kation NO⁺ yang merupakan isoelektronik dengan N₂. Orbital (σ2pz), (π2px, π2py), (σ*2pz), dan (π*2px, π*2py) pada orbital molekul NO⁺ berturut-turut diisi oleh ____, ____, ____, dan ____ elektron.`,
      parts: [
        {
          id: 'p21-8a', lecture: 'L10', topic: 'MO theory', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '8a', points: 3 },
          kind: 'open',
          stem: r`Give the electron occupancy of $\sigma_{2p_z}$, $(\pi_{2p_x}, \pi_{2p_y})$, $\sigma^*_{2p_z}$ and $(\pi^*_{2p_x}, \pi^*_{2p_y})$ in NO⁺.`,
          answer: r`2, 4, 0 and 0 electrons respectively.`,
          hints: [r`NO⁺ is isoelectronic with N₂: count its valence electrons.`, r`For N₂-type MO ordering, $\pi_{2p}$ lies below $\sigma_{2p_z}$ — but here fill the listed orbitals after the 2s-derived MOs are full.`],
          work: [r`Valence electrons of NO⁺: $5 + 6 - 1 = 10$.`, r`Ten valence e⁻ fill $\sigma_{2s}^2\,\sigma^{*2}_{2s}$ (4 e⁻), then $\pi_{2p}^4$ (4 e⁻), then $\sigma_{2p_z}^2$ (2 e⁻).`, r`So: $\sigma_{2p_z} = 2$, $\pi_{2p} = 4$, $\sigma^*_{2p_z} = 0$, $\pi^*_{2p} = 0$.`],
          explanation: r`NO⁺ has $5 + 6 - 1 = 10$ valence electrons, like N₂. Using the N₂-type ordering ($\sigma_{2s} < \sigma^*_{2s} < \pi_{2p} < \sigma_{2p_z} < \pi^*_{2p} < \sigma^*_{2p_z}$): $\sigma_{2s}^2\,\sigma_{2s}^{*2}\,\pi_{2p}^4\,\sigma_{2p_z}^2$. Hence occupancies **2, 4, 0, 0**.`,
          indo: {
            stem: r`Tentukan jumlah elektron pada $\sigma_{2p_z}$, $(\pi_{2p_x}, \pi_{2p_y})$, $\sigma^*_{2p_z}$ dan $(\pi^*_{2p_x}, \pi^*_{2p_y})$ pada NO⁺.`,
            answer: r`Berturut-turut 2, 4, 0 dan 0 elektron.`,
            hints: [r`NO⁺ isoelektronik dengan N₂: hitung elektron valensinya.`, r`Pada urutan MO tipe N₂, $\pi_{2p}$ berada di bawah $\sigma_{2p_z}$ — isi orbital yang ditanyakan setelah MO turunan 2s penuh.`],
            work: [r`Elektron valensi NO⁺: $5 + 6 - 1 = 10$.`, r`Sepuluh e⁻ valensi mengisi $\sigma_{2s}^2\,\sigma^{*2}_{2s}$ (4 e⁻), lalu $\pi_{2p}^4$ (4 e⁻), lalu $\sigma_{2p_z}^2$ (2 e⁻).`, r`Jadi: $\sigma_{2p_z} = 2$, $\pi_{2p} = 4$, $\sigma^*_{2p_z} = 0$, $\pi^*_{2p} = 0$.`],
            explanation: r`NO⁺ memiliki $5 + 6 - 1 = 10$ elektron valensi, seperti N₂. Dengan urutan tipe N₂ ($\sigma_{2s} < \sigma^*_{2s} < \pi_{2p} < \sigma_{2p_z} < \pi^*_{2p} < \sigma^*_{2p_z}$): $\sigma_{2s}^2\,\sigma_{2s}^{*2}\,\pi_{2p}^4\,\sigma_{2p_z}^2$. Jadi okupansinya **2, 4, 0, 0**.`,
          },
        },
        {
          id: 'p21-8b', lecture: 'L10', topic: 'MO theory', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2021', label: '8b', points: 2 },
          kind: 'numeric', answer: 3, unit: '', tol: { abs: 0.01 },
          stem: r`The bond order of the NO⁺ ion is ____ (answer as a number).`,
          hints: [r`$\text{BO} = \tfrac12(n_{\text{bonding}} - n_{\text{antibonding}})$.`, r`Include the 2s-derived σ and σ* pairs; they cancel.`],
          work: [r`Bonding: $\sigma_{2s}^2 + \pi_{2p}^4 + \sigma_{2p_z}^2 = 8$.`, r`Antibonding: $\sigma^{*2}_{2s} = 2$.`, r`$\text{BO} = \tfrac12(8 - 2) = 3$.`],
          explanation: r`Bonding electrons = 8 ($\sigma_{2s}^2$, $\pi_{2p}^4$, $\sigma_{2p_z}^2$); antibonding electrons = 2 ($\sigma^{*2}_{2s}$). $\text{BO} = \tfrac12(8-2) = \mathbf{3}$, same as N₂ (triple bond).`,
          indo: {
            stem: r`Orde ikatan ion NO⁺ adalah ____ (Jawaban dalam angka).`,
            hints: [r`$\text{OI} = \tfrac12(n_{\text{ikatan}} - n_{\text{anti-ikatan}})$.`, r`Sertakan pasangan σ dan σ* turunan 2s; keduanya saling meniadakan.`],
            work: [r`Ikatan: $\sigma_{2s}^2 + \pi_{2p}^4 + \sigma_{2p_z}^2 = 8$.`, r`Anti-ikatan: $\sigma^{*2}_{2s} = 2$.`, r`$\text{OI} = \tfrac12(8 - 2) = 3$.`],
            explanation: r`Elektron ikatan = 8 ($\sigma_{2s}^2$, $\pi_{2p}^4$, $\sigma_{2p_z}^2$); elektron anti-ikatan = 2 ($\sigma^{*2}_{2s}$). $\text{OI} = \tfrac12(8-2) = \mathbf{3}$, sama dengan N₂ (ikatan rangkap tiga).`,
          },
        },
      ],
    },
    /* ───────────── 9–13: coordination chemistry ───────────── */
    {
      n: 9, points: 2, outOfScope: true,
      parts: [
        {
          id: 'p21-9', lecture: 'L9', topic: 'Out of scope', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '9', points: 2 },
          kind: 'mcq',
          options: ['CaC₂O₄', 'Ca(NO₃)₂·4H₂O', '[Ca(C₂O₄)₂]²⁻', '[Ca(EDTA)]²⁻', 'CaSO₄·4H₂O'], answer: [3],
          stem: r`The compound that has coordination number 6 at its central metal atom is`,
          hints: [r`Coordination number = number of donor atoms bonded to the metal.`, r`EDTA⁴⁻ is a polydentate ligand: how many donor atoms does it have?`],
          work: [r`Oxalate is bidentate: $[\text{Ca(C}_2\text{O}_4)_2]^{2-}$ → CN = 4.`, r`EDTA⁴⁻ is hexadentate (2 N + 4 carboxylate O) → $[\text{Ca(EDTA)}]^{2-}$ has CN = 6.`, r`The others are simple salts/hydrates, not 6-coordinate complexes.`],
          explanation: r`EDTA⁴⁻ binds through 6 donor atoms (2 N and 4 carboxylate O), so [Ca(EDTA)]²⁻ has coordination number **6**. [Ca(C₂O₄)₂]²⁻ has two bidentate oxalates, CN = 4. The others are ordinary salts or hydrates without a defined complex of CN 6. (Coordination chemistry is outside the L7–L10 slides.)`,
          indo: {
            stem: r`Senyawa yang memiliki bilangan koordinasi 6 pada atom logam pusatnya adalah`,
            options: ['CaC₂O₄', 'Ca(NO₃)₂·4H₂O', '[Ca(C₂O₄)₂]²⁻', '[Ca(EDTA)]²⁻', 'CaSO₄·4H₂O'],
            hints: [r`Bilangan koordinasi = jumlah atom donor yang terikat pada logam.`, r`EDTA⁴⁻ adalah ligan polidentat: berapa atom donornya?`],
            work: [r`Oksalat bidentat: $[\text{Ca(C}_2\text{O}_4)_2]^{2-}$ → BK = 4.`, r`EDTA⁴⁻ heksadentat (2 N + 4 O karboksilat) → $[\text{Ca(EDTA)}]^{2-}$ memiliki BK = 6.`, r`Lainnya adalah garam/hidrat sederhana, bukan kompleks berkoordinasi 6.`],
            explanation: r`EDTA⁴⁻ berikatan melalui 6 atom donor (2 N dan 4 O karboksilat), sehingga [Ca(EDTA)]²⁻ memiliki bilangan koordinasi **6**. [Ca(C₂O₄)₂]²⁻ memiliki dua oksalat bidentat, BK = 4. Lainnya garam atau hidrat biasa tanpa kompleks BK 6. (Kimia koordinasi di luar slide L7–L10.)`,
          },
        },
      ],
    },
    {
      n: 10, points: 2, outOfScope: true,
      parts: [
        {
          id: 'p21-10', lecture: 'L9', topic: 'Out of scope', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2021', label: '10', points: 2 },
          kind: 'mcq', options: ['+1', '-1', '+2', '0', '+3'], answer: [4],
          stem: r`The oxidation number of Cr in the complex ion $[\text{Cr(NH}_3)_4\text{Cl}_2]^+$ is`,
          hints: [r`The overall charge equals the oxidation number of Cr plus the charges of the ligands.`, r`NH₃ is neutral; Cl⁻ is −1.`],
          work: [r`$x + 4(0) + 2(-1) = +1$.`, r`$x = +3$.`],
          explanation: r`$x + 4(0) + 2(-1) = +1 \Rightarrow x = +3$. Cr is in the **+3** oxidation state.`,
          indo: {
            stem: r`Bilangan oksidasi Cr pada ion kompleks $[\text{Cr(NH}_3)_4\text{Cl}_2]^+$ adalah`,
            options: ['+1', '-1', '+2', '0', '+3'],
            hints: [r`Muatan total sama dengan bilangan oksidasi Cr ditambah muatan ligan.`, r`NH₃ netral; Cl⁻ bermuatan −1.`],
            work: [r`$x + 4(0) + 2(-1) = +1$.`, r`$x = +3$.`],
            explanation: r`$x + 4(0) + 2(-1) = +1 \Rightarrow x = +3$. Cr berada pada bilangan oksidasi **+3**.`,
          },
        },
      ],
    },
    {
      n: 11, points: 2, outOfScope: true,
      parts: [
        {
          id: 'p21-11', lecture: 'L9', topic: 'Out of scope', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '11', points: 2 },
          kind: 'mcq',
          options: ['[CrCl₃(H₂O)₃]·3H₂O', '[CrCl₂(H₂O)₄]Cl·2H₂O', '[CrCl(H₂O)₅]Cl₂·H₂O', '[Cr(H₂O)₆]Cl₂·H₂O', '[Cr(H₂O)₆]Cl₃'], answer: [4],
          stem: r`When 1 mol of the complex compound CrCl₃·6H₂O is reacted with excess AgNO₃, 3 mol of AgCl(s) are produced. The formula of that complex compound is`,
          hints: [r`Only chloride that is outside the coordination sphere (free Cl⁻) precipitates with Ag⁺.`, r`How many Cl⁻ must be free to give 3 mol AgCl per mole?`],
          work: [r`3 mol AgCl per mol compound → all 3 Cl⁻ are free ions.`, r`So none of the Cl is bonded to Cr; all 6 H₂O are ligands.`, r`Formula: $[\text{Cr(H}_2\text{O)}_6]\text{Cl}_3$.`],
          explanation: r`Ag⁺ precipitates only free chloride. Three AgCl per mole means all three Cl⁻ are outside the coordination sphere, so all six waters are ligands: **[Cr(H₂O)₆]Cl₃**. (The student chose [CrCl₂(H₂O)₄]Cl·2H₂O, which would give only 1 mol AgCl.)`,
          indo: {
            stem: r`Ketika 1 mol senyawa kompleks CrCl₃·6H₂O direaksikan dengan AgNO₃ berlebih akan menghasilkan 3 mol AgCl(s). Rumus senyawa kompleks tersebut adalah`,
            options: ['[CrCl₃(H₂O)₃]·3H₂O', '[CrCl₂(H₂O)₄]Cl·2H₂O', '[CrCl(H₂O)₅]Cl₂·H₂O', '[Cr(H₂O)₆]Cl₂·H₂O', '[Cr(H₂O)₆]Cl₃'],
            hints: [r`Hanya klorida di luar bola koordinasi (Cl⁻ bebas) yang mengendap dengan Ag⁺.`, r`Berapa Cl⁻ bebas yang diperlukan untuk menghasilkan 3 mol AgCl per mol?`],
            work: [r`3 mol AgCl per mol senyawa → ketiga Cl⁻ adalah ion bebas.`, r`Jadi tidak ada Cl yang terikat pada Cr; keenam H₂O adalah ligan.`, r`Rumus: $[\text{Cr(H}_2\text{O)}_6]\text{Cl}_3$.`],
            explanation: r`Ag⁺ hanya mengendapkan klorida bebas. Tiga AgCl per mol berarti ketiga Cl⁻ berada di luar bola koordinasi, sehingga keenam air adalah ligan: **[Cr(H₂O)₆]Cl₃**. (Mahasiswa memilih [CrCl₂(H₂O)₄]Cl·2H₂O, yang hanya menghasilkan 1 mol AgCl.)`,
          },
        },
      ],
    },
    {
      n: 12, points: 2, outOfScope: true,
      parts: [
        {
          id: 'p21-12', lecture: 'L9', topic: 'Out of scope', source: 'past', difficulty: 2,
          past: { paper: 'kuis2-2021', label: '12', points: 2 },
          kind: 'mcq',
          options: ['[Co(en)₃]³⁺', '[Co(NH₃)₄Cl₂]⁺', '[Co(en)₂Cl₂]⁺', '[Co(NH₃)₅Cl]²⁺', '[CoCl₆]³⁻'], answer: [2],
          stem: r`The complex ion below that has both geometric and optical isomers is`,
          hints: [r`Geometric (cis/trans) isomers need at least two different kinds of ligand arranged in more than one way.`, r`Optical isomers need a chiral (non-superimposable on mirror image) arrangement, as in cis-bis(chelate) octahedra.`],
          work: [r`[Co(en)₃]³⁺: optical only (no geometric).`, r`[Co(NH₃)₄Cl₂]⁺: cis/trans, but neither isomer is chiral.`, r`[Co(en)₂Cl₂]⁺: cis and trans exist; the cis form is chiral (two enantiomers) → both types.`, r`[Co(NH₃)₅Cl]²⁺ and [CoCl₆]³⁻: neither.`],
          explanation: r`[Co(en)₃]³⁺ is chiral but has no geometric isomers. [Co(NH₃)₄Cl₂]⁺ has cis/trans isomers, but both have a mirror plane (achiral). **[Co(en)₂Cl₂]⁺** has cis and trans geometric isomers, and the cis isomer is chiral (non-superimposable mirror images), so it shows both geometric and optical isomerism. The other two have no isomers.`,
          indo: {
            stem: r`Ion kompleks berikut yang memiliki isomer geometri sekaligus optik adalah`,
            options: ['[Co(en)₃]³⁺', '[Co(NH₃)₄Cl₂]⁺', '[Co(en)₂Cl₂]⁺', '[Co(NH₃)₅Cl]²⁺', '[CoCl₆]³⁻'],
            hints: [r`Isomer geometri (cis/trans) memerlukan minimal dua jenis ligan berbeda yang dapat tersusun lebih dari satu cara.`, r`Isomer optik memerlukan susunan kiral (tidak dapat ditumpangkan pada bayangan cerminnya), seperti oktahedral cis-bis(kelat).`],
            work: [r`[Co(en)₃]³⁺: hanya optik (tanpa geometri).`, r`[Co(NH₃)₄Cl₂]⁺: cis/trans, tetapi keduanya tidak kiral.`, r`[Co(en)₂Cl₂]⁺: ada cis dan trans; bentuk cis kiral (dua enantiomer) → kedua jenis.`, r`[Co(NH₃)₅Cl]²⁺ dan [CoCl₆]³⁻: tidak ada.`],
            explanation: r`[Co(en)₃]³⁺ kiral tetapi tidak memiliki isomer geometri. [Co(NH₃)₄Cl₂]⁺ memiliki isomer cis/trans, tetapi keduanya memiliki bidang cermin (akiral). **[Co(en)₂Cl₂]⁺** memiliki isomer geometri cis dan trans, dan isomer cis bersifat kiral (bayangan cermin tak dapat ditumpangkan), sehingga menunjukkan isomer geometri sekaligus optik. Dua lainnya tidak punya isomer.`,
          },
        },
      ],
    },
    {
      n: 13, points: 2, outOfScope: true,
      parts: [
        {
          id: 'p21-13', lecture: 'L9', topic: 'Out of scope', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2021', label: '13', points: 2 },
          kind: 'mcq',
          options: ['Potassium hexacyanoferrate(III)', 'Tripotassium cyanoiron(II)', 'Tripotassium hexacyanoiron(II)', 'Tripotassium hexacyanoiron(III)', 'Potassium hexacyanoferrate(II)'], answer: [0],
          stem: r`The correct IUPAC name of the coordination compound K₃[Fe(CN)₆] is ....`,
          hints: [r`Find the oxidation number of Fe from the charges: 3 K⁺, 6 CN⁻.`, r`When the complex is an anion, the metal name ends in "-ate" (ferrate for iron), and cations are named without a prefix count.`],
          work: [r`$[\text{Fe(CN)}_6]^{3-}$: $x + 6(-1) = -3 \Rightarrow x = +3$.`, r`Ligand: 6 cyano → hexacyano.`, r`Anionic complex of iron → ferrate(III); cation K⁺ is named "potassium" without a count prefix.`],
          explanation: r`The complex ion is $[\text{Fe(CN)}_6]^{3-}$ (balancing 3 K⁺), so Fe is +3. The name lists the cation first (potassium, no multiplier prefix), then the ligands (hexacyano), then the metal with "-ate" because the complex is an anion (ferrate) and its oxidation number: **potassium hexacyanoferrate(III)**.`,
          indo: {
            stem: r`Nama senyawa koordinasi K₃[Fe(CN)₆] yang tepat menurut IUPAC adalah ....`,
            options: ['Potassium hexacyanoferrate(III)', 'Tripotassium cyanoiron(II)', 'Tripotassium hexacyanoiron(II)', 'Tripotassium hexacyanoiron(III)', 'Potassium hexacyanoferrate(II)'],
            hints: [r`Tentukan bilangan oksidasi Fe dari muatan: 3 K⁺, 6 CN⁻.`, r`Bila kompleks berupa anion, nama logam berakhiran "-ate" (ferrate untuk besi), dan kation dinamai tanpa awalan jumlah.`],
            work: [r`$[\text{Fe(CN)}_6]^{3-}$: $x + 6(-1) = -3 \Rightarrow x = +3$.`, r`Ligan: 6 siano → heksasiano.`, r`Kompleks anion besi → ferrat(III); kation K⁺ dinamai "potassium" tanpa awalan jumlah.`],
            explanation: r`Ion kompleksnya $[\text{Fe(CN)}_6]^{3-}$ (menyeimbangkan 3 K⁺), sehingga Fe bernilai +3. Penamaan: kation lebih dulu (potassium, tanpa awalan jumlah), lalu ligan (heksasiano), lalu logam berakhiran "-ate" karena kompleks adalah anion (ferrate) beserta bilangan oksidasinya: **potassium hexacyanoferrate(III)**.`,
          },
        },
      ],
    },
  ],
}
