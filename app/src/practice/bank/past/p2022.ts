import type { PastPaper, PastProblem, Question, LectureId, Blank, Tasks } from '../../../types'

const r = String.raw
const PID = 'kuis2-2022'

/* ---------- small builders (keep the data below readable) ---------- */
interface B {
  label: string // e.g. 'A-1a', 'B-4a(i)'
  pts: number
  lec: LectureId
  topic: string
  d?: 1 | 2 | 3
  s: string
  si: string
  h: string[]
  hi: string[]
  w: string[]
  wi: string[]
  e: string
  ei: string
}
const mkId = (label: string) => 'p22-' + label.toLowerCase().replace(/\(([a-z]+)\)/g, '-$1')
function common(b: B) {
  return {
    id: mkId(b.label),
    lecture: b.lec,
    topic: b.topic,
    source: 'past' as const,
    difficulty: (b.d ?? 1) as 1 | 2 | 3,
    past: { paper: PID, label: b.label, points: b.pts },
    stem: b.s,
    hints: b.h,
    work: b.w,
    explanation: b.e,
  }
}
function open(b: B & { a: string; ai: string; rub: string[]; rubi: string[] }): Question {
  return { ...common(b), kind: 'open', answer: b.a, rubric: b.rub, indo: { stem: b.si, answer: b.ai, hints: b.hi, work: b.wi, explanation: b.ei, rubric: b.rubi } }
}
function short(b: B & { blanks: Blank[]; labels: string[] }): Question {
  return { ...common(b), kind: 'short', blanks: b.blanks, indo: { stem: b.si, hints: b.hi, work: b.wi, explanation: b.ei, labels: b.labels } }
}
function wid<K extends keyof Tasks>(b: B & { widget: K; task: Tasks[K] }): Question {
  return { ...common(b), kind: 'widget', widget: b.widget, task: b.task, indo: { stem: b.si, hints: b.hi, work: b.wi, explanation: b.ei } }
}
const MS = ['+1/2', '-1/2', '1/2', '+½', '-½', '½', '0.5', '+0.5', '-0.5']
function num(b: B & { a: number; unit?: string; tol?: { rel?: number; abs?: number } }): Question {
  return { ...common(b), kind: 'numeric', answer: b.a, unit: b.unit, tol: b.tol, indo: { stem: b.si, hints: b.hi, work: b.wi, explanation: b.ei } }
}
function mcq(b: B & { o: string[]; oi: string[]; a: number[] }): Question {
  return { ...common(b), kind: 'mcq', options: b.o, answer: b.a, indo: { stem: b.si, options: b.oi, hints: b.hi, work: b.wi, explanation: b.ei } }
}

const HYB = ['sp', 'sp²', 'sp³']
const MAG = ['Paramagnetic', 'Diamagnetic']
const MAGI = ['Paramagnetik', 'Diamagnetik']

/* ---------- Problem 2 (element X, Z = 44 / 48 / 50): same four parts ---------- */
function q2(
  v: string,
  o: {
    Z: number
    sym: string
    nameEn: string
    cfg: string // KaTeX
    cfgFull: string
    fill: string // English: how many electrons beyond Kr
    fillId: string
    group: string
    groupId: string
    ions: string
    ionsWhy: string
    ionsWhyId: string
    extra?: string
    extraId?: string
    cfgAcc: string[] // typed-answer config(s)
    grpAcc: string[]
    ionRub: string[]
    ionRubId: string[]
  },
): Question[] {
  const ex = o.extra ?? ''
  const exI = o.extraId ?? ''
  return [
    short({
      label: `${v}-2a`, pts: 6, lec: 'L7', topic: 'Electron configuration',
      s: r`Write the electron configuration of element X (Z = ${o.Z}).`,
      si: r`Tuliskan konfigurasi elektron unsur tersebut.`,
      blanks: [{ label: 'Electron configuration', type: 'config', accept: o.cfgAcc, placeholder: '[Kr] 4d… 5s…' }],
      labels: ['Konfigurasi elektron'],
      h: [r`Start from the noble gas just below: Kr has 36 electrons. How many electrons are left to place?`, r`Fill in Aufbau order after Kr: 5s, then 4d, then 5p.`],
      hi: [r`Mulai dari gas mulia di bawahnya: Kr punya 36 elektron. Berapa elektron yang tersisa?`, r`Isi menurut urutan Aufbau setelah Kr: 5s, lalu 4d, lalu 5p.`],
      w: [r`${o.fill}`, r`Fill 5s first, then 4d, then 5p.`, r`$${o.cfg}$ — this is ${o.nameEn} (${o.sym}).`],
      wi: [r`${o.fillId}`, r`Isi 5s dahulu, kemudian 4d, lalu 5p.`, r`$${o.cfg}$ — ini adalah ${o.nameEn} (${o.sym}).`],
      e: r`${o.fill} Filling in Aufbau order gives $${o.cfgFull}$, i.e. $${o.cfg}$.${ex} Writing the shells out of order (e.g. $3d$ before $4s$) is also accepted. (L7)`,
      ei: r`${o.fillId} Pengisian menurut Aufbau memberi $${o.cfgFull}$, yaitu $${o.cfg}$.${exI} Penulisan kulit tidak berurutan (mis. $3d$ sebelum $4s$) juga dibenarkan. (L7)`,
    }),
    short({
      label: `${v}-2b`, pts: 8, lec: 'L7', topic: 'Quantum numbers',
      s: r`Give the four quantum numbers of the outermost electron of X.`,
      si: r`Tuliskan keempat bilangan kuantum untuk elektron terluar.`,
      blanks: [
        { label: 'n', type: 'text', accept: ['5'] },
        { label: 'ℓ', type: 'text', accept: o.Z === 50 ? ['0', '1'] : ['0'] },
        { label: 'mₗ', type: 'text', accept: o.Z === 50 ? ['0', '1', '+1', '-1'] : ['0'] },
        { label: 'mₛ', type: 'text', accept: MS },
      ],
      labels: ['n', 'ℓ', 'mₗ', 'mₛ'],
      h: [r`The outermost electron is in the highest-$n$ shell that is occupied.`, r`Identify its subshell letter, then convert it to $\ell$ ($s=0$, $p=1$, $d=2$). $m_\ell$ runs from $-\ell$ to $+\ell$.`],
      hi: [r`Elektron terluar berada di kulit dengan $n$ terbesar yang terisi.`, r`Tentukan subkulitnya lalu ubah ke $\ell$ ($s=0$, $p=1$, $d=2$). $m_\ell$ bernilai $-\ell$ sampai $+\ell$.`],
      w: [r`Outermost shell: $n=5$ (the $5s$ electrons, as in the answer key).`, r`$s$ subshell: $\ell=0$, so $m_\ell=0$ only.`, r`Spin is $m_s=+\tfrac12$ or $-\tfrac12$ (either is accepted).`],
      wi: [r`Kulit terluar: $n=5$ (elektron $5s$, sesuai kunci).`, r`Subkulit $s$: $\ell=0$, jadi $m_\ell=0$.`, r`Spin $m_s=+\tfrac12$ atau $-\tfrac12$ (keduanya diterima).`],
      e: r`The outermost electron is in the $5s$ orbital: $n=5$, $\ell=0$, $m_\ell=0$, $m_s=\pm\tfrac12$. (L7)${o.Z === 50 ? r` Note: the key uses a $5s$ electron; a $5p$ electron ($n=5,\ \ell=1,\ m_\ell=-1,0,+1$) would be an equally valid description of a valence electron of Sn.` : ''}`,
      ei: r`Elektron terluar berada pada orbital $5s$: $n=5$, $\ell=0$, $m_\ell=0$, $m_s=\pm\tfrac12$. (L7)${o.Z === 50 ? r` Catatan: kunci memakai elektron $5s$; elektron $5p$ ($n=5,\ \ell=1,\ m_\ell=-1,0,+1$) juga merupakan deskripsi elektron valensi Sn yang sah.` : ''}`,
    }),
    short({
      label: `${v}-2c`, pts: 6, lec: 'L7', topic: 'Electron configuration',
      s: r`Give the position (group and period) of X in the periodic table.`,
      si: r`Tentukan posisi (golongan dan periode) unsur tersebut dalam sistem periodik.`,
      blanks: [
        { label: 'Period', type: 'number', accept: ['5'], tol: { abs: 0.01 } },
        { label: 'Group', type: 'text', accept: o.grpAcc },
      ],
      labels: ['Periode', 'Golongan'],
      h: [r`Period = highest occupied shell $n$.`, r`Group: count valence electrons (outer $s$ + $d$ for transition metals, or outer $s$+$p$ for main group), or count across the row from the first column.`],
      hi: [r`Periode = nomor kulit $n$ tertinggi yang terisi.`, r`Golongan: hitung elektron valensi ($s$ + $d$ untuk logam transisi, $s$ + $p$ untuk golongan utama), atau hitung dari kolom pertama.`],
      w: [r`Highest shell is $n=5$ → period 5.`, r`${o.group === 'group 8 (VIII B)' ? r`Valence electrons $5s^2+4d^6=8$ → group 8 (VIII B).` : o.group === 'group 12 (II B)' ? r`$4d^{10}5s^2$: 12 electrons beyond Kr's $4p$ → group 12 (II B), the $d$ block is filled.` : r`Valence $5s^25p^2$ = 4 electrons → group 14 (IV A).`}`],
      wi: [r`Kulit tertinggi $n=5$ → perioda 5.`, r`${o.group === 'group 8 (VIII B)' ? r`Elektron valensi $5s^2+4d^6=8$ → golongan 8 (VIII B).` : o.group === 'group 12 (II B)' ? r`$4d^{10}5s^2$: 12 elektron di luar $4p$ Kr → golongan 12 (II B), subkulit $d$ penuh.` : r`Valensi $5s^25p^2$ = 4 elektron → golongan 14 (IV A).`}`],
      e: r`Highest occupied shell $n=5$ → period 5. ${o.group === 'group 8 (VIII B)' ? r`Eight electrons in $5s$ + $4d$ → group 8 (VIII B).` : o.group === 'group 12 (II B)' ? r`$4d^{10}5s^2$ → group 12 (II B).` : r`Four valence electrons ($5s^25p^2$) → group 14 (IV A).`}`,
      ei: r`Kulit tertinggi terisi $n=5$ → perioda 5. ${o.group === 'group 8 (VIII B)' ? r`Delapan elektron pada $5s$ + $4d$ → golongan 8 (VIII B).` : o.group === 'group 12 (II B)' ? r`$4d^{10}5s^2$ → golongan 12 (II B).` : r`Empat elektron valensi ($5s^25p^2$) → golongan 14 (IV A).`}`,
    }),
    open({
      label: `${v}-2d`, pts: 4, lec: 'L8', topic: 'Ion configurations',
      s: r`Write the possible ion(s) that X can form.`,
      si: r`Tuliskan kemungkinan ion yang terbentuk.`,
      a: r`${o.ions}`,
      ai: r`${o.ions}`,
      rub: o.ionRub,
      rubi: o.ionRubId,
      h: [r`Metals form cations by losing electrons. Which electrons leave first?`, r`Remove the outermost ($n=5$) electrons first; a further electron may come from $d$ or $p$.`],
      hi: [r`Logam membentuk kation dengan melepas elektron. Elektron mana yang dilepas lebih dulu?`, r`Lepaskan elektron kulit terluar ($n=5$) dahulu; elektron berikutnya dapat berasal dari $d$ atau $p$.`],
      w: [r`${o.ionsWhy}`],
      wi: [r`${o.ionsWhyId}`],
      e: r`${o.ionsWhy} (L8)`,
      ei: r`${o.ionsWhyId} (L8)`,
    }),
  ]
}

/* ---------- Problem 3c: lone pair count ---------- */
/* ---------- Problem 5: complexes ---------- */
function q5(
  v: string,
  o: {
    metal: string
    lig: string // English description of the ligand
    ligId: string
    X: string // other ligand, e.g. 'water' / 'bromide'
    XId: string
    chargeEn: string
    formula: string // KaTeX
    nameEn: string
    nameId: string
    why: string
    whyId: string
    stemA: string
    stemAi: string
    iso: string
    isoId: string
  },
): Question[] {
  return [
    open({
      label: `${v}-5a`, pts: 4, lec: 'L9', topic: 'Out of scope', d: 2,
      s: o.stemA, si: o.stemAi,
      a: r`$${o.formula}$`, ai: r`$${o.formula}$`,
      rub: [r`Uses coordination number 6, counting 2 donor sites per bidentate ligand`, r`Chooses the number of each ligand so the total charge of the complex matches the given charge`, r`Writes the formula $${o.formula}$`],
      rubi: [r`Memakai bilangan koordinasi 6, dengan 2 situs donor untuk tiap ligan bidentat`, r`Menentukan jumlah tiap ligan sehingga muatan total kompleks sesuai yang diberikan`, r`Menulis rumus $${o.formula}$`],
      h: [r`Coordination number 6: count how many donor atoms each ligand provides (bidentate = 2).`, r`Fill the remaining sites with the second ligand, then check that the total charge matches.`],
      hi: [r`Bilangan koordinasi 6: hitung berapa atom donor tiap ligan (bidentat = 2).`, r`Sisa posisi diisi ligan kedua, lalu cek muatan total.`],
      w: [r`${o.why}`],
      wi: [r`${o.whyId}`],
      e: r`${o.why} (L9, coordinate covalent bonds)`,
      ei: r`${o.whyId} (L9, ikatan kovalen koordinasi)`,
    }),
    open({
      label: `${v}-5b`, pts: 4, lec: 'L9', topic: 'Out of scope',
      s: r`Name the complex ion in part (a).`, si: r`Tuliskan nama ion kompleks pada poin a.`,
      a: r`${o.nameEn}`, ai: r`${o.nameId}`,
      rub: [r`Names the ligands first, in alphabetical order, with the correct multipliers (di-/bis-)`, r`Names the metal last with its oxidation state in Roman numerals, (III)`, r`Gives the full name: ${o.nameEn}`],
      rubi: [r`Menyebut ligan lebih dulu, urut abjad, dengan awalan jumlah yang benar (di-/bis-)`, r`Menyebut logam terakhir dengan bilangan oksidasi angka Romawi, (III)`, r`Memberi nama lengkap: ${o.nameId}`],
      h: [r`Name the ligands first (with prefixes di-/bis-), in alphabetical order, then the metal.`, r`Put the metal's oxidation state in Roman numerals at the end; for an anionic complex the metal gets the ending "-ate".`],
      hi: [r`Sebut ligan lebih dulu (dengan awalan di-/bis-), urut abjad, kemudian logamnya.`, r`Tuliskan bilangan oksidasi logam dengan angka Romawi di akhir; untuk kompleks anion logam berakhiran "-at".`],
      w: [r`Oxidation state of the metal is +3 (given).`, r`Ligands in alphabetical order, with multipliers; then the metal name and (III).`, r`Name: ${o.nameEn}.`],
      wi: [r`Bilangan oksidasi logam +3 (diketahui).`, r`Ligan urut abjad dengan awalan jumlah; lalu nama logam dan (III).`, r`Nama: ${o.nameId}.`],
      e: r`Ligands alphabetically, with multipliers, then the metal and its oxidation state: ${o.nameEn}. (Official key: ${o.nameId}.)`,
      ei: r`Ligan menurut abjad dengan awalan jumlah, lalu logam dan bilangan oksidasinya: ${o.nameId}.`,
    }),
    open({
      label: `${v}-5c`, pts: 8, lec: 'L9', topic: 'Out of scope', d: 2,
      s: r`Draw the 2 possible isomeric structures of the complex ion in part (a). (Describe them in words.)`,
      si: r`Gambarkan 2 struktur isomer yang mungkin pada ion kompleks di poin a.`,
      a: r`${o.iso}`, ai: r`${o.isoId}`,
      rub: [r`Both structures are octahedral with two bidentate ligands, each spanning two adjacent sites`, r`trans isomer: the two monodentate ligands on opposite (axial, 180°) positions`, r`cis isomer: the two monodentate ligands adjacent (90°)`],
      rubi: [r`Kedua struktur oktahedral dengan dua ligan bidentat, masing-masing menempati dua posisi bersebelahan`, r`Isomer trans: dua ligan monodentat berseberangan (aksial, 180°)`, r`Isomer cis: dua ligan monodentat bersebelahan (90°)`],
      h: [r`The complex is octahedral, $\text{M}(\text{AA})_2\text{X}_2$. Where can the two monodentate ligands X sit relative to each other?`, r`Place them 180° apart for one isomer, and 90° apart for the other.`],
      hi: [r`Kompleks berbentuk oktahedral, $\text{M}(\text{AA})_2\text{X}_2$. Di mana dua ligan monodentat X dapat berada satu terhadap yang lain?`, r`Letakkan pada 180° untuk satu isomer, dan 90° untuk isomer lainnya.`],
      w: [r`Octahedral geometry, two chelating ligands each spanning two adjacent sites.`, r`trans: the two X ligands on opposite (axial) positions; the two chelates lie in the equatorial plane.`, r`cis: the two X ligands adjacent (90°).`],
      wi: [r`Geometri oktahedral, dua ligan kelat masing-masing menempati dua posisi bersebelahan.`, r`trans: dua ligan X di posisi berseberangan (aksial); dua kelat berada pada bidang ekuator.`, r`cis: dua ligan X bersebelahan (90°).`],
      e: r`${o.iso}`,
      ei: r`${o.isoId}`,
    }),
  ]
}

/* ---------- MO part (diatomic with 10 valence electrons) ---------- */
function mo(v: string, sp: string, spTxt: string, species: string, atoms: string, atomsId: string, extra: string, extraId: string): Question[] {
  return [
    wid({
      label: `${v}-4e(i)`, pts: 2, lec: 'L10', topic: 'MO theory', d: 2,
      widget: 'mo', task: { species },
      s: r`Build the molecular-orbital diagram of ${spTxt} in the workbench (fill the MOs with its valence electrons in the correct order). ${atoms}`,
      si: r`Gambarkan diagram orbital molekul ${spTxt} pada workbench (isi orbital molekul dengan elektron valensinya menurut urutan yang benar). ${atomsId}`,
      h: [r`Count the total valence electrons first.`, r`For this diatomic the order is $\sigma_{2s}<\sigma^*_{2s}<\pi_{2p}<\sigma_{2p}<\pi^*_{2p}<\sigma^*_{2p}$. Fill from the bottom, pairing in each degenerate set only after the set is half full.`],
      hi: [r`Hitung dulu jumlah elektron valensi.`, r`Urutan untuk diatomik ini: $\sigma_{2s}<\sigma^*_{2s}<\pi_{2p}<\sigma_{2p}<\pi^*_{2p}<\sigma^*_{2p}$. Isi dari bawah; pada orbital setingkat, berpasangan setelah semuanya terisi satu.`],
      w: [r`${extra}`, r`Fill: $\sigma_{2s}^2\ \sigma^{*2}_{2s}\ \pi_{2p_x}^2\ \pi_{2p_y}^2\ \sigma_{2p_z}^2$ (10 electrons).`, r`Bonding electrons $=8$, antibonding $=2$: bond order $=\tfrac{8-2}{2}=3$.`],
      wi: [r`${extraId}`, r`Isi: $\sigma_{2s}^2\ \sigma^{*2}_{2s}\ \pi_{2p_x}^2\ \pi_{2p_y}^2\ \sigma_{2p_z}^2$ (10 elektron).`, r`Elektron ikatan $=8$, anti-ikatan $=2$: orde ikatan $=\tfrac{8-2}{2}=3$.`],
      e: r`${extra} The key's diagram places $\pi_{2p}$ below $\sigma_{2p}$ and fills: $\sigma_{2s}^2\sigma^{*2}_{2s}\pi_{2p}^4\sigma_{2p}^2$; $\pi^*$ and $\sigma^*_{2p}$ are empty. Bond order $=(8-2)/2=3$ (triple bond). (L10, MO theory)`,
      ei: r`${extraId} Diagram pada kunci menempatkan $\pi_{2p}$ di bawah $\sigma_{2p}$ dan mengisi: $\sigma_{2s}^2\sigma^{*2}_{2s}\pi_{2p}^4\sigma_{2p}^2$; $\pi^*$ dan $\sigma^*_{2p}$ kosong. Orde ikatan $=(8-2)/2=3$ (ikatan rangkap tiga). (L10, teori MO)`,
    }),
    num({
      label: `${v}-4e(i)b`, pts: 2, lec: 'L10', topic: 'MO theory', a: 3, tol: { abs: 0.01 },
      s: r`Give the bond order of ${spTxt} from your MO diagram.`,
      si: r`Tentukan orde ikatan ${spTxt} dari diagram orbital molekul Anda.`,
      h: [r`Bond order $=\tfrac12(\text{bonding e}^- - \text{antibonding e}^-)$.`],
      hi: [r`Orde ikatan $=\tfrac12(\text{e}^-\text{ ikatan} - \text{e}^-\text{ anti-ikatan})$.`],
      w: [r`Bonding electrons: $\sigma_{2s}^2+\pi_{2p}^4+\sigma_{2p}^2=8$; antibonding: $\sigma^{*2}_{2s}=2$.`, r`Bond order $=\tfrac{8-2}{2}=3$.`],
      wi: [r`Elektron ikatan: $\sigma_{2s}^2+\pi_{2p}^4+\sigma_{2p}^2=8$; anti-ikatan: $\sigma^{*2}_{2s}=2$.`, r`Orde ikatan $=\tfrac{8-2}{2}=3$.`],
      e: r`Bonding electrons $=8$, antibonding $=2$: bond order $=(8-2)/2=\mathbf{3}$ (triple bond). (L10, MO theory)`,
      ei: r`Elektron ikatan $=8$, anti-ikatan $=2$: orde ikatan $=(8-2)/2=\mathbf{3}$ (ikatan rangkap tiga). (L10, teori MO)`,
    }),
    mcq({
      label: `${v}-4e(ii)`, pts: 4, lec: 'L10', topic: 'MO theory',
      s: r`Is ${spTxt} paramagnetic or diamagnetic? Explain.`,
      si: r`Apakah ${spTxt} bersifat paramagnetik atau diamagnetik? Jelaskan.`,
      o: MAG, oi: MAGI, a: [1],
      h: [r`Paramagnetic means at least one unpaired electron in the MO diagram.`, r`Look at the occupied MOs of the 10-electron configuration: are any singly occupied?`],
      hi: [r`Paramagnetik berarti ada minimal satu elektron tunggal pada diagram MO.`, r`Lihat orbital molekul terisi pada konfigurasi 10 elektron: adakah yang terisi satu elektron?`],
      w: [r`Configuration $\sigma_{2s}^2\sigma^{*2}_{2s}\pi_{2p}^4\sigma_{2p}^2$.`, r`Every MO that is occupied holds 2 electrons: no unpaired electrons.`, r`So ${sp} is diamagnetic.`],
      wi: [r`Konfigurasi $\sigma_{2s}^2\sigma^{*2}_{2s}\pi_{2p}^4\sigma_{2p}^2$.`, r`Setiap orbital molekul terisi menampung 2 elektron: tidak ada elektron tunggal.`, r`Jadi ${sp} bersifat diamagnetik.`],
      e: r`Diamagnetic: no unpaired electron — all electrons are paired in the MO diagram (all occupied MOs are doubly filled). (L10)`,
      ei: r`Diamagnetik: tidak ada elektron tunggal — semua elektron berpasangan pada diagram orbital molekulnya. (L10)`,
    }),
  ]
}

const CONST = r`Avogadro constant $N_A = 6.023\times10^{23}$; Rydberg constant $R_H = 2.18\times10^{-18}\ \text{J} = 109737\ \text{cm}^{-1}$; speed of light $c = 3\times10^{8}\ \text{m s}^{-1}$; Planck constant $h = 6.63\times10^{-34}\ \text{J s}$; atomic numbers: P = 15, O = 8, N = 7.

$$\frac{1}{\lambda}=Z^2R_H\left(\frac{1}{n_1^2}-\frac{1}{n_2^2}\right)\qquad E=\frac{hc}{\lambda}$$

The PDF contains three parallel versions of the quiz (marked *, ** and ***), 50 minutes each. They are given here as Version A (*), Version B (**) and Version C (***).`
const CONSTID = r`Tetapan Avogadro $=6{,}023\times10^{23}$; tetapan Rydberg $R_H = 2{,}18\times10^{-18}\ \text{J} = 109737\ \text{cm}^{-1}$; kecepatan cahaya $c = 3\times10^{8}\ \text{m s}^{-1}$; tetapan Planck $h = 6{,}63\times10^{-34}\ \text{J s}$; nomor atom (Z) P = 15; O = 8; N = 7.

$$\frac{1}{\lambda}=Z^2R_H\left(\frac{1}{n_1^2}-\frac{1}{n_2^2}\right)\qquad E=\frac{hc}{\lambda}$$

File PDF memuat tiga versi kuis yang paralel (bertanda *, ** dan ***), masing-masing 50 menit. Di sini disebut Versi A (*), Versi B (**) dan Versi C (***).`

/* ======================================================================= */
/* VERSION A  (*)                                                          */
/* ======================================================================= */
const A: PastProblem[] = [
  {
    n: 1, points: 14,
    intro: r`**Version A (\*) — Problem 1.** In 1931 Niels Bohr explained the relation between the structure of the hydrogen atom and its spectrum quantitatively. Bohr's theory explains the energy absorbed or released when an electron moves between shells. An electron makes a transition from $n_2$ down to $n=2$ and emits light of $\lambda = 650.5$ nm.`,
    introId: r`**Versi A (\*) — Soal 1.** Pada tahun 1931 Niels Bohr menjelaskan hubungan antara struktur atom hidrogen dan spektrumnya secara kuantitatif. Teori atom Bohr dapat menjelaskan energi yang diserap atau dilepaskan ketika suatu elektron mengalami transisi dari satu kulit ke kulit yang lainnya. Jika sebuah elektron mengalami transisi dari $n_2$ turun ke $n = 2$ dan mengemisikan cahaya pada $\lambda = 650{,}5$ nm, maka:`,
    parts: [
      num({
        label: 'A-1a', pts: 8, lec: 'L7', topic: 'Line spectra & Bohr', d: 2, a: 184, unit: 'kJ/mol', tol: { rel: 0.02 },
        s: r`Determine the energy emitted per mole (in kJ) by this electron.`,
        si: r`Tentukan energi per mol (dalam kJ) yang diemisikan oleh elektron tersebut.`,
        h: [r`Energy of one photon: use $E = hc/\lambda$ with $\lambda$ in metres.`, r`Multiply the energy per photon by Avogadro's number to get J/mol, then convert J to kJ.`],
        hi: [r`Energi satu foton: gunakan $E = hc/\lambda$ dengan $\lambda$ dalam meter.`, r`Kalikan energi per foton dengan bilangan Avogadro untuk mendapat J/mol, lalu ubah ke kJ.`],
        w: [r`$E_{\text{photon}}=\dfrac{hc}{\lambda}=\dfrac{(6.63\times10^{-34})(3\times10^{8})}{650.5\times10^{-9}}=3.06\times10^{-19}\ \text{J}$.`, r`Per mole: $3.058\times10^{-19}\times6.023\times10^{23}=1.84\times10^{5}\ \text{J/mol}$.`, r`$E = 184\ \text{kJ/mol}$.`],
        wi: [r`$E_{\text{foton}}=\dfrac{hc}{\lambda}=\dfrac{(6{,}63\times10^{-34})(3\times10^{8})}{650{,}5\times10^{-9}}=3{,}06\times10^{-19}\ \text{J}$.`, r`Per mol: $3{,}058\times10^{-19}\times6{,}023\times10^{23}=1{,}84\times10^{5}\ \text{J/mol}$.`, r`$E = 184\ \text{kJ/mol}$.`],
        e: r`The Rydberg equation (or $E=hc/\lambda$) gives the energy of the emitted photon: $E=\dfrac{hc}{\lambda}=3.06\times10^{-19}$ J per photon. Times $N_A$: $1.84\times10^{5}$ J/mol $=\mathbf{184}$ kJ/mol. (Note: the key writes $3.06\times10^{-17}$ J, a typo; the mole value 184 kJ/mol is right.) (L7)`,
        ei: r`Persamaan Rydberg (atau $E=hc/\lambda$) memberi energi foton: $E=\dfrac{hc}{\lambda}=3{,}06\times10^{-19}$ J per foton. Dikali $N_A$: $1{,}84\times10^{5}$ J/mol $=\mathbf{184}$ kJ/mol. (Catatan: kunci menulis $3{,}06\times10^{-17}$ J, salah ketik; nilai per mol 184 kJ/mol benar.) (L7)`,
      }),
      num({
        label: 'A-1b', pts: 6, lec: 'L7', topic: 'Line spectra & Bohr', d: 2, a: 3, tol: { abs: 0.01 },
        s: r`Determine the initial position of the electron before the transition ($n_2$).`,
        si: r`Tentukan posisi awal elektron tersebut sebelum mengalami transisi ($n_2$).`,
        h: [r`Write the Rydberg equation with $Z=1$, $n_1=2$ and solve for $n_2$.`, r`Use $1/\lambda$ in cm⁻¹ with $R_H = 109737$ cm⁻¹.`],
        hi: [r`Tulis persamaan Rydberg dengan $Z=1$, $n_1=2$ lalu selesaikan untuk $n_2$.`, r`Gunakan $1/\lambda$ dalam cm⁻¹ dengan $R_H = 109737$ cm⁻¹.`],
        w: [r`$1/\lambda = 1/(650.5\times10^{-7}\ \text{cm}) = 1.537\times10^{4}\ \text{cm}^{-1}$.`, r`$\dfrac{1}{4}-\dfrac{1}{n_2^2}=\dfrac{15373}{109737}=0.1401$ → $\dfrac{1}{n_2^2}=0.1099$.`, r`$n_2^2 = 9.1\approx 9$ → $n_2 = 3$.`],
        wi: [r`$1/\lambda = 1/(650{,}5\times10^{-7}\ \text{cm}) = 1{,}537\times10^{4}\ \text{cm}^{-1}$.`, r`$\dfrac{1}{4}-\dfrac{1}{n_2^2}=\dfrac{15373}{109737}=0{,}1401$ → $\dfrac{1}{n_2^2}=0{,}1099$.`, r`$n_2^2 = 9{,}1\approx 9$ → $n_2 = 3$.`],
        e: r`$\dfrac{1}{\lambda}=R_H\left(\dfrac{1}{2^2}-\dfrac{1}{n_2^2}\right)$ with $1/\lambda=1.537\times10^4$ cm⁻¹ gives $1/n_2^2=0.25-0.140=0.110$, so $n_2^2\approx9$ and $\mathbf{n_2=3}$ (the red Balmer line H$\alpha$, 656 nm). (L7)`,
        ei: r`$\dfrac{1}{\lambda}=R_H\left(\dfrac{1}{2^2}-\dfrac{1}{n_2^2}\right)$ dengan $1/\lambda=1{,}537\times10^4$ cm⁻¹ memberi $1/n_2^2=0{,}25-0{,}140=0{,}110$, sehingga $n_2^2\approx9$ dan $\mathbf{n_2=3}$ (garis merah Balmer H$\alpha$, 656 nm). (L7)`,
      }),
    ],
  },
  {
    n: 2, points: 24,
    intro: r`**Version A (\*) — Problem 2.** An element X has atomic number 44.`,
    introId: r`**Versi A (\*) — Soal 2.** Suatu unsur X mempunyai nomor atom 44.`,
    parts: q2('A', {
      Z: 44, sym: 'Ru', nameEn: 'ruthenium',
      cfg: r`[\text{Kr}]4d^{6}5s^{2}`, cfgFull: r`1s^22s^22p^63s^23p^63d^{10}4s^24p^64d^65s^2`,
      fill: r`$44-36=8$ electrons go beyond the Kr core.`, fillId: r`$44-36=8$ elektron berada di luar inti Kr.`,
      group: 'group 8 (VIII B)', groupId: 'Golongan 8 atau VIII B',
      cfgAcc: ['[Kr]4d6 5s2', '[Kr]4d7 5s1'],
      grpAcc: ['8', 'VIII B', 'VIIIB', '8B', 'VIII', 'group 8', 'golongan 8', 'golongan VIII B'],
      ionRub: [r`States that X²⁺ can form (the two 5s electrons are lost)`, r`States that X³⁺ can form (one 4d electron is lost as well)`],
      ionRubId: [r`Menyebut X²⁺ dapat terbentuk (dua elektron 5s dilepas)`, r`Menyebut X³⁺ dapat terbentuk (satu elektron 4d ikut dilepas)`],
      ions: r`$\text{X}^{2+}$ and $\text{X}^{3+}$`,
      ionsWhy: r`The two $5s$ electrons are lost first → $\text{X}^{2+}$ ($[\text{Kr}]4d^6$); one $4d$ electron can go as well → $\text{X}^{3+}$ ($[\text{Kr}]4d^5$). Both $\text{X}^{2+}$ and $\text{X}^{3+}$ are accepted.`,
      ionsWhyId: r`Dua elektron $5s$ lepas lebih dulu → $\text{X}^{2+}$ ($[\text{Kr}]4d^6$); satu elektron $4d$ dapat ikut lepas → $\text{X}^{3+}$ ($[\text{Kr}]4d^5$). $\text{X}^{2+}$ dan $\text{X}^{3+}$ diterima.`,
      extra: r` Note: the key follows the Aufbau prediction. The measured ground state of Ru is $[\text{Kr}]4d^75s^1$ (an exception), but the outer-electron quantum numbers ($5s$) are the same either way.`,
      extraId: r` Catatan: kunci mengikuti prediksi Aufbau. Keadaan dasar Ru yang terukur adalah $[\text{Kr}]4d^75s^1$ (pengecualian), tetapi bilangan kuantum elektron terluarnya ($5s$) sama.`,
    }),
  },
  {
    n: 3, points: 18,
    intro: r`**Version A (\*) — Problem 3.** The compound P₂O₅ is a phosphorus oxide that can be used as a drying agent. It reacts with water to give phosphoric acid: $\text{P}_2\text{O}_5(s)+\text{H}_2\text{O}(l)\rightarrow\text{H}_3\text{PO}_4(aq)$ (unbalanced, as printed).`,
    introId: r`**Versi A (\*) — Soal 3.** Senyawa P₂O₅ merupakan salah satu oksida fosfor yang dapat digunakan sebagai pengering. Senyawa ini bereaksi dengan air menghasilkan asam fosfat menurut persamaan reaksi berikut: $\text{P}_2\text{O}_5(s)+\text{H}_2\text{O}(l)\rightarrow\text{H}_3\text{PO}_4(aq)$`,
    parts: [
      open({
        label: 'A-3a', pts: 6, lec: 'L9', topic: 'Lewis structures', d: 2,
        s: r`Draw the Lewis structure of the P₂O₅ molecule (P is not directly bonded to the other P atom, the molecule is symmetric, and the formal charge of every atom is zero).`,
        si: r`Gambarkan struktur Lewis dari molekul P₂O₅ (atom P tidak langsung terikat pada atom P lainnya, molekul bersifat simetris dan muatan formal masing-masing atom adalah nol).`,
        a: r`O=P(=O)–O–P(=O)=O: a bridging O bonded by single bonds to two P atoms; each P also carries two terminal O atoms by double bonds (P has 5 bonds, an expanded octet). Lone pairs: 2 on each O (4 terminal O + 1 bridging O).`,
        ai: r`O=P(=O)–O–P(=O)=O: satu O penghubung berikatan tunggal dengan dua atom P; tiap P juga mengikat dua O terminal dengan ikatan rangkap dua (P punya 5 ikatan, oktet diperluas). Pasangan bebas: 2 pada tiap O (4 O terminal + 1 O jembatan).`,
        rub: [r`Counts 40 valence electrons`, r`Skeleton O₂P–O–PO₂: one bridging O between the two P atoms (no P–P bond), two terminal O on each P`, r`Each terminal O is double-bonded to P; the bridging O has two single bonds`, r`All formal charges are zero (each P has 5 bonds, expanded octet; 2 lone pairs on each of the 5 O)`],
        rubi: [r`Menghitung 40 elektron valensi`, r`Kerangka O₂P–O–PO₂: satu O jembatan di antara dua P (tanpa ikatan P–P), dua O terminal pada tiap P`, r`Tiap O terminal berikatan rangkap dua dengan P; O jembatan punya dua ikatan tunggal`, r`Semua muatan formal nol (tiap P punya 5 ikatan, oktet diperluas; 2 pasangan bebas pada tiap dari 5 O)`],
        h: [r`Count the total valence electrons: $2(5)+5(6)$.`, r`The skeleton is P–O–P with two more O on each P. Which bond type gives each atom formal charge 0?`, r`O needs 2 bonds for FC = 0, so the terminal O's must be double-bonded to P.`],
        hi: [r`Hitung total elektron valensi: $2(5)+5(6)$.`, r`Kerangka: P–O–P dengan dua O tambahan pada tiap P. Jenis ikatan apa yang membuat muatan formal 0?`, r`O perlu 2 ikatan agar FC = 0, jadi O terminal berikatan rangkap dua dengan P.`],
        w: [r`Valence electrons: $2(5)+5(6)=40$.`, r`Skeleton: O₂P–O–PO₂ (bridging O in the middle, two terminal O on each P).`, r`Terminal O: double bond to P (FC = 6−(4+2) = 0); bridging O: two single bonds (FC = 0); P: 5 bonds (FC = 5−5 = 0).`, r`Electron count: 4 P=O ($4\times4=16$ e⁻) + 2 P–O ($2\times2=4$ e⁻) = 20 bonding e⁻; 5 O × 2 lone pairs = 20 e⁻; total 40 e⁻. ✓`],
        wi: [r`Elektron valensi: $2(5)+5(6)=40$.`, r`Kerangka: O₂P–O–PO₂ (O jembatan di tengah, dua O terminal pada tiap P).`, r`O terminal: ikatan rangkap dua ke P (FC = 6−(4+2) = 0); O jembatan: dua ikatan tunggal (FC = 0); P: 5 ikatan (FC = 5−5 = 0).`, r`Elektron ikatan $4\times4+2\times2=20$, pasangan bebas 2 pada tiap 5 atom O = 20 e⁻ → total 40 e⁻. ✓`],
        e: r`Total valence electrons $=2(5)+5(6)=40$. Skeleton O–P(–O)–O–P(–O)–O, i.e. P–O–P with two terminal O on each P. To make every formal charge zero each terminal O forms a double bond to P ($\text{FC}_O=6-4-2=0$) and the bridging O has two single bonds ($6-4-2=0$); each P then has 5 bonds ($\text{FC}_P=5-5=0$, expanded octet, allowed for period 3). Electron count: 4 P=O ($4\times4=16$ e⁻) + 2 P–O ($2\times2=4$ e⁻) $=20$ bonding e⁻, plus 2 lone pairs on each of the 5 O atoms (20 e⁻) $=40$ e⁻. (L9, Lewis structures & formal charge)`,
        ei: r`Total elektron valensi $=2(5)+5(6)=40$. Kerangka O–P(–O)–O–P(–O)–O, yaitu P–O–P dengan dua O terminal pada tiap P. Agar semua muatan formal nol, tiap O terminal berikatan rangkap dua dengan P ($\text{FC}_O=6-4-2=0$) dan O jembatan punya dua ikatan tunggal ($6-4-2=0$); tiap P punya 5 ikatan ($\text{FC}_P=5-5=0$, oktet diperluas, boleh untuk periode 3). Ikatan memakai 20 e⁻ dan 5 atom O membawa 2 pasangan bebas (20 e⁻): total 40. (L9, struktur Lewis & muatan formal)`,
      }),
      wid({
        label: 'A-3b', pts: 6, lec: 'L9', topic: 'Resonance & delocalisation', d: 2, widget: 'lewis', task: { species: 'PO4^3-', resonance: true },
        s: r`Draw 2 possible resonance structures of the $\text{PO}_4^{3-}$ ion (the formal charge of P is zero).`,
        si: r`Gambarkan 2 struktur resonansi yang mungkin dari ion $\text{PO}_4^{3-}$ (muatan formal P adalah nol).`,
        h: [r`Total valence electrons: $5+4(6)+3$.`, r`For $\text{FC}_P=0$, P needs 5 bonds.`, r`That means one P=O double bond; move it to another O for the second structure.`],
        hi: [r`Total elektron valensi: $5+4(6)+3$.`, r`Agar $\text{FC}_P=0$, P harus punya 5 ikatan.`, r`Artinya ada satu ikatan rangkap dua P=O; pindahkan ke O lain untuk struktur kedua.`],
        w: [r`Valence electrons $=5+24+3=32$.`, r`P with 5 bonds ($\text{FC}_P=0$): one P=O and three P–O⁻; the three singly bonded O carry −1 each (total −3 ✓).`, r`Move the double bond to another oxygen to obtain the second resonance form; the charges shift accordingly.`],
        wi: [r`Elektron valensi $=5+24+3=32$.`, r`P dengan 5 ikatan ($\text{FC}_P=0$): satu P=O dan tiga P–O⁻; tiga O ikatan tunggal masing-masing −1 (total −3 ✓).`, r`Pindahkan ikatan rangkap dua ke oksigen lain untuk struktur resonansi kedua; muatan bergeser sesuai.`],
        e: r`32 valence electrons. Making $\text{FC}_P=0$ requires P to have five bonds: one double bond P=O and three single P–O⁻ bonds. Each singly bonded O has three lone pairs and FC −1 (sum −3), the double-bonded O has two lone pairs and FC 0. The double bond can be placed on any of the four oxygens, giving equivalent resonance structures, e.g. $\text{O}{=}\text{P}(\text{O}^-)_3 \leftrightarrow \text{O}^-\text{–P}(\text{O}^-)_2{=}\text{O}$ (the real ion has four equivalent P–O bonds of order 1.25). (L9, resonance)`,
        ei: r`32 elektron valensi. Agar $\text{FC}_P=0$, P harus punya lima ikatan: satu ikatan rangkap dua P=O dan tiga ikatan tunggal P–O⁻. Tiap O ikatan tunggal punya tiga pasangan bebas dan FC −1 (jumlah −3), O ikatan rangkap dua punya dua pasangan bebas dan FC 0. Ikatan rangkap dua dapat ditempatkan pada salah satu dari empat oksigen sehingga terdapat struktur resonansi ekuivalen (ion sebenarnya punya empat ikatan P–O dengan orde 1,25). (L9, resonansi)`,
      }),
      num({
        label: 'A-3c', pts: 6, lec: 'L9', topic: 'Lewis structures', a: 11, tol: { abs: 0.01 },
        s: r`Give the number of lone pairs in the $\text{PO}_4^{3-}$ ion.`,
        si: r`Tuliskan jumlah pasangan elektron bebas pada ion $\text{PO}_4^{3-}$.`,
        h: [r`Use your structure from (b) (with $\text{FC}_P=0$).`, r`Count lone pairs on each O separately.`],
        hi: [r`Gunakan struktur pada (b) (dengan $\text{FC}_P=0$).`, r`Hitung pasangan bebas pada tiap O secara terpisah.`],
        w: [r`Double-bonded O: 2 lone pairs.`, r`Three single-bonded O⁻: $3\times3=9$ lone pairs.`, r`Total $2+9=11$ lone pairs (P has none).`],
        wi: [r`O ikatan rangkap dua: 2 pasangan bebas.`, r`Tiga O⁻ ikatan tunggal: $3\times3=9$ pasangan bebas.`, r`Total $2+9=11$ pasang (P tidak punya).`],
        e: r`With $\text{FC}_P=0$: one =O (2 lone pairs) + three O⁻ (3 lone pairs each) $=2+9=\mathbf{11}$ lone pairs. Check: 32 e⁻ − 5 bonding pairs (10 e⁻) = 22 e⁻ = 11 pairs. (L9)`,
        ei: r`Dengan $\text{FC}_P=0$: satu =O (2 pasangan bebas) + tiga O⁻ (masing-masing 3) $=2+9=\mathbf{11}$ pasang. Cek: 32 e⁻ − 5 pasang ikatan (10 e⁻) = 22 e⁻ = 11 pasang. (L9)`,
      }),
    ],
  },
  {
    n: 4, points: 28,
    intro: r`**Version A (\*) — Problem 4.** Ethyl cyanoacetate is a chemical used in the synthesis of drugs such as allopurinol (a gout drug). The figure shows its structure: $\text{N}_{(1)}{\equiv}\text{C}_{(2)}\text{–C}_{(3)}\text{H}_2\text{–C}_{(4)}(=\text{O})\text{–O}_{(5)}\text{–C}_{(6)}\text{H}_2\text{–C}_{(7)}\text{H}_3$ (atoms numbered 1–7 in the order written: N, C, CH₂, C=O, O, CH₂, CH₃).`,
    introId: r`**Versi A (\*) — Soal 4.** Etil sianoasetat merupakan senyawa kimia yang dapat digunakan dalam sintesis berbagai obat, seperti allupurinol yang merupakan obat asam urat. Struktur molekul etil sianoasetat ditunjukkan pada gambar: $\text{N}_{(1)}{\equiv}\text{C}_{(2)}\text{–C}_{(3)}\text{H}_2\text{–C}_{(4)}(=\text{O})\text{–O}_{(5)}\text{–C}_{(6)}\text{H}_2\text{–C}_{(7)}\text{H}_3$ (atom bernomor 1–7: N, C, CH₂, C=O, O, CH₂, CH₃).`,
    parts: [
      num({
        label: 'A-4a(i)', pts: 3, lec: 'L10', topic: 'Sigma & pi bonds', a: 14, tol: { abs: 0.01 },
        s: r`Count the number of σ bonds in one ethyl cyanoacetate molecule.`,
        si: r`Hitung jumlah ikatan σ pada satu molekul etil sianoasetat.`,
        h: [r`Every bond contains exactly one σ bond; multiple bonds add π bonds on top.`, r`Count bonds line by line (heavy-atom bonds, then C–H bonds).`],
        hi: [r`Setiap ikatan mengandung tepat satu ikatan σ; ikatan rangkap menambah ikatan π.`, r`Hitung ikatan satu per satu (ikatan antar atom berat, lalu ikatan C–H).`],
        w: [r`Heavy-atom bonds: N≡C (1), C–C (1), C–C(=O) (1), C=O (1), C–O (1), O–C (1), C–C (1) = 7 σ.`, r`C–H bonds: 2 (CH₂) + 2 (CH₂) + 3 (CH₃) = 7 σ.`, r`Total σ $=7+7=14$.`],
        wi: [r`Ikatan antar atom berat: N≡C (1), C–C (1), C–C(=O) (1), C=O (1), C–O (1), O–C (1), C–C (1) = 7 σ.`, r`Ikatan C–H: 2 (CH₂) + 2 (CH₂) + 3 (CH₃) = 7 σ.`, r`Total σ $=7+7=14$.`],
        e: r`σ bonds $=7$ (heavy-atom skeleton) $+\ 7$ (C–H) $=\mathbf{14}$. Check: $\text{C}_5\text{H}_7\text{NO}_2$ has $5+7+1+2=15$ atoms and no ring → $15-1=14$ σ bonds. ✓ (L10)`,
        ei: r`σ $=7$ (kerangka atom berat) $+\ 7$ (C–H) $=\mathbf{14}$. Cek: $\text{C}_5\text{H}_7\text{NO}_2$ memiliki $5+7+1+2=15$ atom → $15-1=14$ ikatan σ (molekul tanpa cincin). ✓ (L10)`,
      }),
      num({
        label: 'A-4a(ii)', pts: 3, lec: 'L10', topic: 'Sigma & pi bonds', a: 3, tol: { abs: 0.01 },
        s: r`Count the number of π bonds in one ethyl cyanoacetate molecule.`,
        si: r`Hitung jumlah ikatan π pada satu molekul etil sianoasetat.`,
        h: [r`A double bond has 1 π bond, a triple bond has 2.`, r`Find the multiple bonds in the structure.`],
        hi: [r`Ikatan rangkap dua punya 1 π, rangkap tiga punya 2.`, r`Cari ikatan rangkap pada struktur.`],
        w: [r`C≡N: 2 π.`, r`C=O: 1 π.`, r`Total π $=3$.`],
        wi: [r`C≡N: 2 π.`, r`C=O: 1 π.`, r`Total π $=3$.`],
        e: r`C≡N gives 2 π bonds and C=O gives 1 π bond: $\mathbf{3}$ π bonds in total. (L10)`,
        ei: r`C≡N memberi 2 ikatan π dan C=O memberi 1 ikatan π: total $\mathbf{3}$ ikatan π. (L10)`,
      }),
      mcq({
        label: 'A-4b(i)', pts: 3, lec: 'L10', topic: 'Hybridization', o: HYB, oi: HYB, a: [0],
        s: r`Which hybrid orbitals does atom no. 2 (the C of the C≡N group) use to form its σ bonds?`,
        si: r`Tentukan jenis orbital hibrida yang digunakan untuk membentuk ikatan σ oleh atom nomor 2 pada molekul etil sianoasetat di atas.`,
        h: [r`Count the electron domains (σ bonds + lone pairs) around the atom.`, r`Triple bond counts as one domain.`],
        hi: [r`Hitung domain elektron (ikatan σ + pasangan bebas) di sekitar atom.`, r`Ikatan rangkap tiga dihitung satu domain.`],
        w: [r`Atom 2 is bonded to N (triple bond) and C3 (single).`, r`2 domains → linear.`, r`Hybridisation $sp$.`],
        wi: [r`Atom 2 berikatan dengan N (rangkap tiga) dan C3 (tunggal).`, r`2 domain → linear.`, r`Hibridisasi $sp$.`],
        e: r`Atom 2 has two electron domains (the C≡N triple bond and the C–C single bond): linear, $\mathbf{sp}$ (two σ bonds; two $p$ orbitals form the π bonds). (L10)`,
        ei: r`Atom 2 memiliki dua domain elektron (ikatan rangkap tiga C≡N dan ikatan tunggal C–C): linear, $\mathbf{sp}$ (dua ikatan σ; dua orbital $p$ membentuk ikatan π). (L10)`,
      }),
      mcq({
        label: 'A-4b(ii)', pts: 3, lec: 'L10', topic: 'Hybridization', o: HYB, oi: HYB, a: [2],
        s: r`Which hybrid orbitals does atom no. 3 (the CH₂ carbon) use to form its σ bonds?`,
        si: r`Tentukan jenis orbital hibrida yang digunakan untuk membentuk ikatan σ oleh atom nomor 3 pada molekul etil sianoasetat di atas.`,
        h: [r`Count the σ bonds and lone pairs on atom 3.`, r`Four single bonds means four domains.`],
        hi: [r`Hitung ikatan σ dan pasangan bebas pada atom 3.`, r`Empat ikatan tunggal berarti empat domain.`],
        w: [r`Atom 3 is bonded to C2, C4 and two H: 4 σ bonds.`, r`4 domains → tetrahedral.`, r`Hybridisation $sp^3$.`],
        wi: [r`Atom 3 berikatan dengan C2, C4 dan dua H: 4 ikatan σ.`, r`4 domain → tetrahedral.`, r`Hibridisasi $sp^3$.`],
        e: r`Atom 3 has four σ bonds (C, C, H, H), no π bonds: four domains, tetrahedral, $\mathbf{sp^3}$. (L10)`,
        ei: r`Atom 3 punya empat ikatan σ (C, C, H, H), tanpa ikatan π: empat domain, tetrahedral, $\mathbf{sp^3}$. (L10)`,
      }),
      short({
        label: 'A-4c', pts: 4, lec: 'L10', topic: 'VSEPR shapes',
        blanks: [{ label: 'Bond angle', type: 'number', accept: ['104.5'], tol: { abs: 5.1 }, unit: '°' }], labels: ['Sudut ikatan C–O–C'],
        s: r`Give the C–O–C bond angle in ethyl cyanoacetate.`,
        si: r`Tentukan nilai sudut ikatan C-O-C pada molekul etil sianoasetat di atas.`,
        h: [r`Count the electron domains around the central oxygen (atom 5), including lone pairs.`, r`Lone pairs squeeze the bond angle slightly below the ideal value.`],
        hi: [r`Hitung domain elektron di sekitar oksigen pusat (atom 5), termasuk pasangan bebas.`, r`Pasangan bebas menekan sudut ikatan sedikit di bawah nilai ideal.`],
        w: [r`Oxygen 5: 2 σ bonds + 2 lone pairs = 4 domains.`, r`Electron geometry tetrahedral (109.5°), molecular shape bent.`, r`Angle ≈ 104.5° (the key also accepts ≈ 109°).`],
        wi: [r`Oksigen 5: 2 ikatan σ + 2 pasangan bebas = 4 domain.`, r`Geometri elektron tetrahedral (109,5°), bentuk molekul bengkok.`, r`Sudut ≈ 104,5° (kunci juga menerima ≈ 109°).`],
        e: r`The ester oxygen has 2 bonded atoms and 2 lone pairs ($\text{AX}_2\text{E}_2$): bent, with the angle near $104.5^\circ$ (ideal tetrahedral $109.5^\circ$ reduced by lone-pair repulsion). The key accepts "about 109° or 104.5°". (L10, VSEPR)`,
        ei: r`Oksigen ester punya 2 atom terikat dan 2 pasangan bebas ($\text{AX}_2\text{E}_2$): bengkok, sudut sekitar $104{,}5^\circ$ (tetrahedral ideal $109{,}5^\circ$ berkurang akibat tolakan pasangan bebas). Kunci menerima "sekitar 109° atau 104,5°". (L10, VSEPR)`,
      }),
      short({
        label: 'A-4d', pts: 4, lec: 'L10', topic: 'VSEPR shapes',
        blanks: [{ label: 'Shape', type: 'text', accept: ['trigonal planar', 'planar trigonal', 'triangular planar', 'trigonal flat', 'segitiga planar', 'segitiga datar', 'planar segitiga', 'trigonal datar'] }], labels: ['Bentuk'],
        s: r`Give the geometry (shape) around atom no. 4 (the carbonyl carbon).`,
        si: r`Tentukan bentuk geometri atom nomor 4.`,
        h: [r`Count the electron domains around atom 4 (a double bond counts as one).`, r`With no lone pairs the molecular shape equals the electron geometry.`],
        hi: [r`Hitung domain elektron di sekitar atom 4 (ikatan rangkap dua dihitung satu).`, r`Tanpa pasangan bebas, bentuk molekul sama dengan geometri elektron.`],
        w: [r`Atom 4 is bonded to C3, =O and O5.`, r`3 domains, no lone pairs → $\text{AX}_3$.`, r`Shape: trigonal planar (~120°).`],
        wi: [r`Atom 4 terikat pada C3, =O dan O5.`, r`3 domain, tanpa pasangan bebas → $\text{AX}_3$.`, r`Bentuk: segitiga planar (~120°).`],
        e: r`Atom 4 has three electron domains (C, =O, –O) and no lone pairs: $\text{AX}_3$ → **trigonal planar**, $sp^2$ hybridised. (L10)`,
        ei: r`Atom 4 punya tiga domain elektron (C, =O, –O) tanpa pasangan bebas: $\text{AX}_3$ → **segitiga planar**, terhibridisasi $sp^2$. (L10)`,
      }),
      ...mo('A', 'CN⁻', r`the cyanide ion $\text{CN}^-$`, 'CN^-', r`(Ethyl cyanoacetate can be made from ethyl chloroacetate and cyanide ion, $\text{CN}^-$. The template shows the 2s and 2p levels of atom C (left) and atom N (right) and the MOs of $\text{CN}^-$ in the middle.)`, r`(Etil sianoasetat dapat disintesis dari etil kloroasetat dengan ion sianida. Template menunjukkan tingkat 2s dan 2p atom C (kiri), atom N (kanan) dan orbital molekul $\text{CN}^-$ di tengah.)`,
        r`Valence electrons: C (4) + N (5) + 1 (charge) $=10$.`, r`Elektron valensi: C (4) + N (5) + 1 (muatan) $=10$.`),
    ],
  },
  {
    n: 5, points: 16, outOfScope: true,
    intro: r`**Version A (\*) — Problem 5.** Complex compounds are formed from a central ion and ligands. The $\text{Cr}^{3+}$ ion can form complexes with coordination number 6. (Oxalate, ox, is $\text{C}_2\text{O}_4^{2-}$, a bidentate ligand bound through two O atoms.)`,
    introId: r`**Versi A (\*) — Soal 5.** Senyawa kompleks dapat dibentuk oleh ion pusat dan ligan. Ion $\text{Cr}^{3+}$ dapat membentuk senyawa kompleks dengan bilangan koordinasi 6. (Oksalat (ox) adalah $\text{C}_2\text{O}_4^{2-}$, ligan bidentat yang terikat melalui dua atom O.)`,
    parts: q5('A', {
      metal: 'Cr', lig: 'oxalate', ligId: 'oksalat', X: 'water', XId: 'air', chargeEn: '−1',
      formula: r`[\text{Cr}(\text{ox})_2(\text{H}_2\text{O})_2]^{-}`,
      nameEn: 'diaquabis(oxalato)chromate(III) ion', nameId: 'Ion diaquabisoksalatokromat(III)',
      stemA: r`Write the chemical formula of the complex ion formed by $\text{Cr}^{3+}$ with oxalate (ox, bidentate, charge 2−) and water that has a charge of −1.`,
      stemAi: r`Tuliskan rumus kimia ion kompleks yang dibentuk oleh $\text{Cr}^{3+}$ dengan oksalat (ox) dan air yang mempunyai muatan -1.`,
      why: r`Coordination number 6 with bidentate ox: $n$ ox give $2n$ donor sites. Charge: $+3+n(-2)+0=-1$ → $n=2$ ox (4 sites), so $6-4=2$ $\text{H}_2\text{O}$. Formula $[\text{Cr}(\text{ox})_2(\text{H}_2\text{O})_2]^-$.`,
      whyId: r`Bilangan koordinasi 6 dengan ox bidentat: $n$ ox memberi $2n$ situs. Muatan: $+3+n(-2)+0=-1$ → $n=2$ ox (4 situs), sisa $6-4=2$ $\text{H}_2\text{O}$. Rumus $[\text{Cr}(\text{ox})_2(\text{H}_2\text{O})_2]^-$.`,
      iso: r`Octahedral $\text{trans}$-$[\text{Cr}(\text{ox})_2(\text{H}_2\text{O})_2]^-$ (the two $\text{H}_2\text{O}$ on opposite, axial positions; both ox in the equatorial plane) and $\text{cis}$-$[\text{Cr}(\text{ox})_2(\text{H}_2\text{O})_2]^-$ (the two $\text{H}_2\text{O}$ adjacent, 90°). The cis isomer is chiral (it exists as a pair of non-superimposable mirror images), the trans isomer is not.`,
      isoId: r`Oktahedral $\text{trans}$-$[\text{Cr}(\text{ox})_2(\text{H}_2\text{O})_2]^-$ (dua $\text{H}_2\text{O}$ berseberangan di posisi aksial; kedua ox pada bidang ekuator) dan $\text{cis}$-$[\text{Cr}(\text{ox})_2(\text{H}_2\text{O})_2]^-$ (dua $\text{H}_2\text{O}$ bersebelahan, 90°). Isomer cis bersifat kiral (ada sebagai pasangan bayangan cermin yang tidak dapat dihimpitkan), trans tidak.`,
    }),
  },
]

/* ======================================================================= */
/* VERSION B  (**)                                                         */
/* ======================================================================= */
const B_: PastProblem[] = [
  {
    n: 6, points: 14,
    intro: r`**Version B (\*\*) — Problem 1.** In 1860 J. J. Balmer studied the pattern of the line spectrum in the visible region produced by electron transitions in the hydrogen atom. An electron moves from the 8th energy level to the 2nd energy level.`,
    introId: r`**Versi B (\*\*) — Soal 1.** J. J. Balmer tahun 1860 mempelajari pola spektrum garis pada daerah sinar tampak yang dihasilkan oleh transisi elektron dari atom hidrogen. Jika suatu elektron berpindah dari tingkat energi ke-8 ke tingkat energi ke-2, maka:`,
    parts: [
      num({
        label: 'B-1a', pts: 8, lec: 'L7', topic: 'Line spectra & Bohr', d: 2, a: 308, unit: 'kJ/mol', tol: { rel: 0.01 },
        s: r`Determine the energy (in kJ) released by 1 mol of such electrons.`,
        si: r`Tentukan energi (dalam kJ) yang dilepaskan oleh 1 mol elektron tersebut.`,
        h: [r`Write the Rydberg expression for energy: $E=R_H\left(\frac{1}{n_1^2}-\frac{1}{n_2^2}\right)$ with $R_H$ in joules.`, r`Evaluate it for $n_1=2$, $n_2=8$, then multiply by $N_A$ and convert J → kJ.`],
        hi: [r`Tulis persamaan Rydberg untuk energi: $E=R_H\left(\frac{1}{n_1^2}-\frac{1}{n_2^2}\right)$ dengan $R_H$ dalam joule.`, r`Hitung untuk $n_1=2$, $n_2=8$, lalu kalikan $N_A$ dan ubah J → kJ.`],
        w: [r`$E=2.18\times10^{-18}\left(\dfrac14-\dfrac1{64}\right)=2.18\times10^{-18}(0.234375)=5.11\times10^{-19}\ \text{J}$.`, r`Per mole: $5.11\times10^{-19}\times6.023\times10^{23}=3.078\times10^{5}\ \text{J/mol}$.`, r`$E\approx308\ \text{kJ/mol}$.`],
        wi: [r`$E=2{,}18\times10^{-18}\left(\dfrac14-\dfrac1{64}\right)=2{,}18\times10^{-18}(0{,}234375)=5{,}11\times10^{-19}\ \text{J}$.`, r`Per mol: $5{,}11\times10^{-19}\times6{,}023\times10^{23}=3{,}078\times10^{5}\ \text{J/mol}$.`, r`$E\approx308\ \text{kJ/mol}$.`],
        e: r`$E=R_H\left(\dfrac{1}{2^2}-\dfrac{1}{8^2}\right)=2.18\times10^{-18}\times0.234375=5.11\times10^{-19}$ J per photon. $\times N_A$: $3.078\times10^{5}$ J/mol $=\mathbf{308}$ kJ/mol. (The key prints "$3.078\times10^4$" by typo; the correct power is $10^5$.) (L7)`,
        ei: r`$E=R_H\left(\dfrac{1}{2^2}-\dfrac{1}{8^2}\right)=2{,}18\times10^{-18}\times0{,}234375=5{,}11\times10^{-19}$ J per foton. $\times N_A$: $3{,}078\times10^{5}$ J/mol $=\mathbf{308}$ kJ/mol. (Kunci menulis "$3{,}078\times10^4$" karena salah ketik; pangkat yang benar $10^5$.) (L7)`,
      }),
      num({
        label: 'B-1b', pts: 6, lec: 'L7', topic: 'Line spectra & Bohr', d: 2, a: 388.8, unit: 'nm', tol: { rel: 0.01 },
        s: r`Determine the wavelength (in nm) of the light emitted in the process of part (a).`,
        si: r`Tentukan panjang gelombang cahaya dalam satuan nm yang diemisikan dalam proses yang terjadi pada soal (a).`,
        h: [r`Relate the photon energy to wavelength: $E=hc/\lambda$.`, r`Or use the Rydberg form directly: $1/\lambda=R_H(\ldots)$ in cm⁻¹.`],
        hi: [r`Hubungkan energi foton dengan panjang gelombang: $E=hc/\lambda$.`, r`Atau pakai bentuk Rydberg langsung: $1/\lambda=R_H(\ldots)$ dalam cm⁻¹.`],
        w: [r`$\lambda=\dfrac{hc}{E}=\dfrac{(6.63\times10^{-34})(3\times10^{8})}{5.11\times10^{-19}}=3.89\times10^{-7}\ \text{m}$.`, r`Alternatively $1/\lambda=109737(0.234375)=25720\ \text{cm}^{-1}$ → $\lambda=388.8$ nm.`, r`$\lambda\approx389$ nm (key: 388 nm).`],
        wi: [r`$\lambda=\dfrac{hc}{E}=\dfrac{(6{,}63\times10^{-34})(3\times10^{8})}{5{,}11\times10^{-19}}=3{,}89\times10^{-7}\ \text{m}$.`, r`Atau $1/\lambda=109737(0{,}234375)=25720\ \text{cm}^{-1}$ → $\lambda=388{,}8$ nm.`, r`$\lambda\approx389$ nm (kunci: 388 nm).`],
        e: r`$\lambda=\dfrac{hc}{E}=\dfrac{1.989\times10^{-25}}{5.11\times10^{-19}}=3.89\times10^{-7}$ m $\approx\mathbf{389}$ nm (the key gives 388 nm, from using $R_H$ in cm⁻¹: 388.8 nm). In the violet part of the Balmer series. (L7)`,
        ei: r`$\lambda=\dfrac{hc}{E}=\dfrac{1{,}989\times10^{-25}}{5{,}11\times10^{-19}}=3{,}89\times10^{-7}$ m $\approx\mathbf{389}$ nm (kunci: 388 nm, dari $R_H$ dalam cm⁻¹: 388,8 nm). Berada di daerah ungu deret Balmer. (L7)`,
      }),
    ],
  },
  {
    n: 7, points: 24,
    intro: r`**Version B (\*\*) — Problem 2.** An element X has atomic number 48.`,
    introId: r`**Versi B (\*\*) — Soal 2.** Suatu unsur X mempunyai nomor atom 48.`,
    parts: q2('B', {
      Z: 48, sym: 'Cd', nameEn: 'cadmium',
      cfg: r`[\text{Kr}]4d^{10}5s^{2}`, cfgFull: r`1s^22s^22p^63s^23p^64s^23d^{10}4p^65s^24d^{10}`,
      fill: r`$48-36=12$ electrons go beyond the Kr core.`, fillId: r`$48-36=12$ elektron berada di luar inti Kr.`,
      group: 'group 12 (II B)', groupId: 'Golongan 12 atau II B',
      cfgAcc: ['[Kr]4d10 5s2'],
      grpAcc: ['12', 'II B', 'IIB', '2B', 'XII', 'group 12', 'golongan 12', 'golongan II B'],
      ionRub: [r`States that X²⁺ is the ion formed (the two 5s electrons are lost)`, r`Notes that the filled 4d¹⁰ subshell is kept, so no higher charge forms`],
      ionRubId: [r`Menyebut ion yang terbentuk adalah X²⁺ (dua elektron 5s dilepas)`, r`Menyatakan subkulit 4d¹⁰ penuh tetap, sehingga tidak ada muatan lebih tinggi`],
      ions: r`$\text{X}^{2+}$`,
      ionsWhy: r`The two $5s$ electrons are lost, leaving the stable filled $4d^{10}$ subshell: $\text{X}^{2+}=[\text{Kr}]4d^{10}$. Removing a $4d$ electron costs far too much energy, so only $\text{X}^{2+}$ forms.`,
      ionsWhyId: r`Dua elektron $5s$ dilepas, meninggalkan subkulit $4d^{10}$ penuh yang stabil: $\text{X}^{2+}=[\text{Kr}]4d^{10}$. Melepas elektron $4d$ butuh energi terlalu besar, sehingga hanya $\text{X}^{2+}$ yang terbentuk.`,
    }),
  },
  {
    n: 8, points: 18,
    intro: r`**Version B (\*\*) — Problem 3.** A phosphorus oxide reacts with water to give phosphorous acid: $\text{P}_2\text{O}_3(s)+3\text{H}_2\text{O}(l)\rightarrow2\text{H}_3\text{PO}_3(aq)$.`,
    introId: r`**Versi B (\*\*) — Soal 3.** Senyawa oksida fosfor berikut ketika bereaksi dengan air menghasilkan asam fosfit menurut persamaan reaksi berikut: $\text{P}_2\text{O}_3(s)+3\text{H}_2\text{O}(l)\rightarrow2\text{H}_3\text{PO}_3(aq)$`,
    parts: [
      open({
        label: 'B-3a', pts: 6, lec: 'L9', topic: 'Lewis structures', d: 2,
        s: r`Draw the most stable Lewis structure of the P₂O₃ molecule (P is not directly bonded to the other P atom).`,
        si: r`Gambarkan struktur Lewis paling stabil untuk molekul P₂O₃ (atom P tidak langsung terikat pada atom P lainnya).`,
        a: r`O=P–O–P=O: a bridging O single-bonded to two P; each P has one terminal =O (double bond) and one lone pair. Lone pairs: 2 on each O (3 O) and 1 on each P.`,
        ai: r`O=P–O–P=O: satu O jembatan berikatan tunggal dengan dua P; tiap P punya satu =O terminal (ikatan rangkap dua) dan satu pasangan bebas. Pasangan bebas: 2 pada tiap O (3 O) dan 1 pada tiap P.`,
        rub: [r`Counts 28 valence electrons`, r`Skeleton O–P–O–P–O with a bridging O and no P–P bond`, r`Terminal O double-bonded to P; bridging O single-bonded to both P`, r`Each P has 3 bonds and 1 lone pair; all formal charges are zero`],
        rubi: [r`Menghitung 28 elektron valensi`, r`Kerangka O–P–O–P–O dengan O jembatan dan tanpa ikatan P–P`, r`O terminal berikatan rangkap dua dengan P; O jembatan berikatan tunggal dengan kedua P`, r`Tiap P punya 3 ikatan dan 1 pasangan bebas; semua muatan formal nol`],
        h: [r`Total valence electrons: $2(5)+3(6)$.`, r`Skeleton P–O–P with one terminal O on each P. Choose the bonds so that all formal charges are 0.`, r`Each P has 3 bonds + 1 lone pair for FC = 0.`],
        hi: [r`Total elektron valensi: $2(5)+3(6)$.`, r`Kerangka P–O–P dengan satu O terminal pada tiap P. Pilih ikatan agar semua muatan formal 0.`, r`Tiap P: 3 ikatan + 1 pasangan bebas untuk FC = 0.`],
        w: [r`Valence electrons $=10+18=28$.`, r`Skeleton O–P–O–P–O. Terminal O: double bond to P (FC 0); bridging O: two single bonds (FC 0).`, r`P: 3 bonds + 1 lone pair (FC $=5-3-2=0$).`, r`Electron count: bonds 6 pairs (12 e⁻) + lone pairs 8 (2 on each O ×3 = 6, plus 1 on each P = 2) = 16 e⁻ → 28. ✓`],
        wi: [r`Elektron valensi $=10+18=28$.`, r`Kerangka O–P–O–P–O. O terminal: ikatan rangkap dua ke P (FC 0); O jembatan: dua ikatan tunggal (FC 0).`, r`P: 3 ikatan + 1 pasangan bebas (FC $=5-3-2=0$).`, r`Hitung: ikatan 6 pasang (12 e⁻) + pasangan bebas 8 (masing-masing 2 pada tiga O = 6, ditambah 1 pada tiap P = 2) = 16 e⁻ → 28. ✓`],
        e: r`28 valence electrons. In O=P–O–P=O every atom obeys the octet with formal charge 0: terminal O (2 bonds, 2 lone pairs), bridging O (2 bonds, 2 lone pairs), P (3 bonds, 1 lone pair). There are 6 bonding pairs (12 e⁻) and 8 lone pairs (16 e⁻) = 28 e⁻. (L9)`,
        ei: r`28 elektron valensi. Pada O=P–O–P=O semua atom memenuhi oktet dengan muatan formal 0: O terminal (2 ikatan, 2 pasangan bebas), O jembatan (2 ikatan, 2 pasangan bebas), P (3 ikatan, 1 pasangan bebas). Terdapat 6 pasangan ikatan (12 e⁻) dan 8 pasangan bebas (16 e⁻) = 28 e⁻. (L9)`,
      }),
      open({
        label: 'B-3b', pts: 6, lec: 'L9', topic: 'Lewis structures', d: 2,
        s: r`Draw the Lewis structure of the $\text{PO}_3^{3-}$ ion (the formal charge of P is zero).`,
        si: r`Gambarkan struktur Lewis dari ion $\text{PO}_3^{3-}$ (muatan formal P adalah nol).`,
        a: r`P at the centre with three single P–O⁻ bonds and one lone pair on P; each O has 3 lone pairs and a formal charge of −1 (total −3).`,
        ai: r`P di tengah dengan tiga ikatan tunggal P–O⁻ dan satu pasangan bebas pada P; tiap O punya 3 pasangan bebas dan muatan formal −1 (total −3).`,
        rub: [r`Counts 26 valence electrons`, r`P in the centre with three P–O single bonds`, r`Each O has 3 lone pairs (formal charge −1); P has one lone pair (formal charge 0)`, r`Total charge is −3 (pyramidal, like NH₃)`],
        rubi: [r`Menghitung 26 elektron valensi`, r`P di tengah dengan tiga ikatan tunggal P–O`, r`Tiap O punya 3 pasangan bebas (muatan formal −1); P punya satu pasangan bebas (muatan formal 0)`, r`Muatan total −3 (piramida, seperti NH₃)`],
        h: [r`Total valence electrons: $5+3(6)+3$.`, r`With $\text{FC}_P=0$ P has 3 bonds — what must it also have?`],
        hi: [r`Total elektron valensi: $5+3(6)+3$.`, r`Dengan $\text{FC}_P=0$ P punya 3 ikatan — apa lagi yang harus dimilikinya?`],
        w: [r`Valence electrons $=5+18+3=26$.`, r`Three P–O single bonds use 6 e⁻; the three O's complete octets with 3 lone pairs each (18 e⁻).`, r`Remaining $26-6-18=2$ e⁻ → 1 lone pair on P. FC: P $=5-3-2=0$, O $=6-1-6=-1$ each.`],
        wi: [r`Elektron valensi $=5+18+3=26$.`, r`Tiga ikatan tunggal P–O memakai 6 e⁻; tiga O melengkapi oktet dengan 3 pasangan bebas (18 e⁻).`, r`Sisa $26-6-18=2$ e⁻ → 1 pasangan bebas pada P. FC: P $=5-3-2=0$, tiap O $=6-1-6=-1$.`],
        e: r`26 valence electrons. Three P–O single bonds (6 e⁻), three O each with 3 lone pairs (18 e⁻), and the last 2 e⁻ as a lone pair on P: $[\ :\ddot{\text{O}}^{-}\text{–}\ddot{\text{P}}(\text{–}\ddot{\text{O}}^-)\text{–}\ddot{\text{O}}^-\ ]$, pyramidal like $\text{NH}_3$. $\text{FC}_P=0$, each $\text{FC}_O=-1$, total −3 ✓. (L9)`,
        ei: r`26 elektron valensi. Tiga ikatan tunggal P–O (6 e⁻), tiga O masing-masing 3 pasangan bebas (18 e⁻), dan 2 e⁻ terakhir sebagai pasangan bebas pada P; bentuknya piramida seperti $\text{NH}_3$. $\text{FC}_P=0$, tiap $\text{FC}_O=-1$, total −3 ✓. (L9)`,
      }),
      num({
        label: 'B-3c', pts: 6, lec: 'L9', topic: 'Lewis structures', a: 10, tol: { abs: 0.01 },
        s: r`Give the number of lone pairs in the $\text{PO}_3^{3-}$ ion.`,
        si: r`Tuliskan jumlah pasangan elektron bebas pada ion $\text{PO}_3^{3-}$.`,
        h: [r`Use your structure from (b).`, r`Don't forget the lone pair on the central P.`],
        hi: [r`Gunakan struktur pada (b).`, r`Jangan lupa pasangan bebas pada P pusat.`],
        w: [r`3 O atoms × 3 lone pairs $=9$.`, r`P: 1 lone pair.`, r`Total $=10$.`],
        wi: [r`3 atom O × 3 pasangan bebas $=9$.`, r`P: 1 pasangan bebas.`, r`Total $=10$.`],
        e: r`$3\times3$ (on O) $+\ 1$ (on P) $=\mathbf{10}$ lone pairs. Check: $26-6=20$ e⁻ = 10 pairs. (L9)`,
        ei: r`$3\times3$ (pada O) $+\ 1$ (pada P) $=\mathbf{10}$ pasangan bebas. Cek: $26-6=20$ e⁻ = 10 pasang. (L9)`,
      }),
    ],
  },
  {
    n: 9, points: 28,
    intro: r`**Version B (\*\*) — Problem 4.** Nitroglycerin is an organic compound used as an explosive (the PDF says "ethyl nitroglycerin"). The figure shows the structure of $\text{C}_3\text{H}_5(\text{ONO}_2)_3$: a $\text{C}_{(2)}\text{H}_2$–$\text{C}_{(3)}\text{H}$–$\text{C}_{(4)}\text{H}_2$ chain; each carbon carries an –O–NO₂ group. The O bonded to the left CH₂ is atom 1 and the left CH₂ is atom 2 (atom 3 is the middle CH, atom 4 the right CH₂, atom 5 the O bonded to the right CH₂). Each nitro group is drawn as N⁺(=O)(–O⁻).`,
    introId: r`**Versi B (\*\*) — Soal 4.** Nitrogliserin merupakan suatu senyawa organik yang dapat dijadikan sebagai bahan peledak. Struktur molekul nitrogliserin $\text{C}_3\text{H}_5(\text{ONO}_2)_3$ ditunjukkan pada gambar: rantai $\text{C}_{(2)}\text{H}_2$–$\text{C}_{(3)}\text{H}$–$\text{C}_{(4)}\text{H}_2$; tiap karbon mengikat gugus –O–NO₂. O yang terikat pada CH₂ kiri adalah atom 1 dan CH₂ kiri adalah atom 2 (atom 3 CH tengah, atom 4 CH₂ kanan, atom 5 O yang terikat pada CH₂ kanan). Tiap gugus nitro digambar sebagai N⁺(=O)(–O⁻).`,
    parts: [
      num({
        label: 'B-4a(i)', pts: 3, lec: 'L10', topic: 'Sigma & pi bonds', a: 19, tol: { abs: 0.01 },
        s: r`Count the number of σ bonds in one nitroglycerin molecule.`,
        si: r`Hitung jumlah ikatan σ pada satu molekul nitrogliserin.`,
        h: [r`Every bond (single, double, ...) contains one σ bond.`, r`Count by type: C–C, C–H, C–O, O–N, N–O.`],
        hi: [r`Setiap ikatan (tunggal, rangkap, ...) mengandung satu ikatan σ.`, r`Hitung per jenis: C–C, C–H, C–O, O–N, N–O.`],
        w: [r`C–C: 2; C–H: 5 ($2+1+2$); C–O: 3; O–N: 3.`, r`Each NO₂ group has 2 N–O σ bonds (one of them is also a π bond): $3\times2=6$.`, r`Total $2+5+3+3+6=19$.`],
        wi: [r`C–C: 2; C–H: 5 ($2+1+2$); C–O: 3; O–N: 3.`, r`Tiap gugus NO₂ punya 2 ikatan σ N–O (salah satunya juga ikatan π): $3\times2=6$.`, r`Total $2+5+3+3+6=19$.`],
        e: r`σ bonds: 2 C–C + 5 C–H + 3 C–O + 3 O–N + 6 N–O $=\mathbf{19}$. Check: $\text{C}_3\text{H}_5\text{N}_3\text{O}_9$ has $3+5+3+9=20$ atoms and no ring → $20-1=19$ σ bonds. ✓ (L10)`,
        ei: r`σ: 2 C–C + 5 C–H + 3 C–O + 3 O–N + 6 N–O $=\mathbf{19}$. Cek: $\text{C}_3\text{H}_5\text{N}_3\text{O}_9$ punya $3+5+3+9=20$ atom tanpa cincin → $20-1=19$ ikatan σ. ✓ (L10)`,
      }),
      num({
        label: 'B-4a(ii)', pts: 3, lec: 'L10', topic: 'Sigma & pi bonds', a: 3, tol: { abs: 0.01 },
        s: r`Count the number of π bonds in one nitroglycerin molecule.`,
        si: r`Hitung jumlah ikatan π pada satu molekul nitrogliserin.`,
        h: [r`Where are the double bonds?`, r`Each nitro group contributes one N=O double bond in the drawn structure.`],
        hi: [r`Di mana ikatan rangkap dua?`, r`Tiap gugus nitro menyumbang satu ikatan rangkap N=O pada struktur gambar.`],
        w: [r`Three –NO₂ groups.`, r`Each has one N=O → 1 π bond.`, r`Total π $=3$.`],
        wi: [r`Tiga gugus –NO₂.`, r`Masing-masing punya satu N=O → 1 ikatan π.`, r`Total π $=3$.`],
        e: r`The only multiple bonds are the three N=O bonds of the nitro groups: $\mathbf{3}$ π bonds. (L10)`,
        ei: r`Satu-satunya ikatan rangkap adalah tiga ikatan N=O pada gugus nitro: $\mathbf{3}$ ikatan π. (L10)`,
      }),
      mcq({
        label: 'B-4b(i)', pts: 3, lec: 'L10', topic: 'Hybridization', o: HYB, oi: HYB, a: [2],
        s: r`Which hybrid orbitals does atom no. 1 (the O bonded to N and CH₂) use to form its σ bonds?`,
        si: r`Tentukan jenis orbital hibrida yang digunakan untuk membentuk ikatan σ oleh atom nomor 1 pada molekul nitrogliserin di atas.`,
        h: [r`Count electron domains on this oxygen (bonds + lone pairs).`, r`Two bonds and two lone pairs make four domains.`],
        hi: [r`Hitung domain elektron pada oksigen ini (ikatan + pasangan bebas).`, r`Dua ikatan dan dua pasangan bebas = empat domain.`],
        w: [r`Oxygen: 2 σ bonds (C, N) + 2 lone pairs.`, r`4 domains → tetrahedral electron geometry.`, r`$sp^3$.`],
        wi: [r`Oksigen: 2 ikatan σ (C, N) + 2 pasangan bebas.`, r`4 domain → geometri elektron tetrahedral.`, r`$sp^3$.`],
        e: r`O has 2 σ bonds and 2 lone pairs: four domains → $\mathbf{sp^3}$ (the key's answer). (L10)`,
        ei: r`O punya 2 ikatan σ dan 2 pasangan bebas: empat domain → $\mathbf{sp^3}$ (sesuai kunci). (L10)`,
      }),
      mcq({
        label: 'B-4b(ii)', pts: 3, lec: 'L10', topic: 'Hybridization', o: HYB, oi: HYB, a: [2],
        s: r`Which hybrid orbitals does atom no. 2 (the CH₂ carbon) use to form its σ bonds?`,
        si: r`Tentukan jenis orbital hibrida yang digunakan untuk membentuk ikatan σ oleh atom nomor 2 pada molekul nitrogliserin di atas.`,
        h: [r`Count the σ bonds on this carbon.`, r`No multiple bonds on it.`],
        hi: [r`Hitung ikatan σ pada karbon ini.`, r`Tidak ada ikatan rangkap padanya.`],
        w: [r`Atom 2: bonds to O, C, H, H (4 σ).`, r`4 domains, tetrahedral.`, r`$sp^3$.`],
        wi: [r`Atom 2: ikatan ke O, C, H, H (4 σ).`, r`4 domain, tetrahedral.`, r`$sp^3$.`],
        e: r`Four σ bonds (O, C, H, H), no π bonds → $\mathbf{sp^3}$. (L10)`,
        ei: r`Empat ikatan σ (O, C, H, H), tanpa ikatan π → $\mathbf{sp^3}$. (L10)`,
      }),
      short({
        label: 'B-4c', pts: 4, lec: 'L10', topic: 'VSEPR shapes',
        blanks: [{ label: 'Bond angle', type: 'number', accept: ['109.5'], tol: { abs: 3 }, unit: '°' }], labels: ['Sudut ikatan C–C–C'],
        s: r`Give the value of the C–C–C bond angle in nitroglycerin.`,
        si: r`Tentukan nilai sudut ikatan C-C-C pada molekul nitrogliserin di atas.`,
        h: [r`Which hybridisation do the carbons have?`, r`No lone pairs on carbon: the angle is the ideal tetrahedral one.`],
        hi: [r`Hibridisasi apa yang dimiliki karbon-karbon ini?`, r`Karbon tanpa pasangan bebas: sudutnya sudut tetrahedral ideal.`],
        w: [r`The central carbon of the C–C–C chain is $sp^3$ (4 σ bonds).`, r`Tetrahedral geometry.`, r`Angle ≈ 109.5°.`],
        wi: [r`Karbon tengah rantai C–C–C adalah $sp^3$ (4 ikatan σ).`, r`Geometri tetrahedral.`, r`Sudut ≈ 109,5°.`],
        e: r`The central carbon is $sp^3$ with four bonded atoms and no lone pairs ($\text{AX}_4$): tetrahedral, $\approx\mathbf{109.5^\circ}$. (L10, VSEPR)`,
        ei: r`Karbon tengah $sp^3$ dengan empat atom terikat dan tanpa pasangan bebas ($\text{AX}_4$): tetrahedral, $\approx\mathbf{109{,}5^\circ}$. (L10, VSEPR)`,
      }),
      short({
        label: 'B-4d', pts: 4, lec: 'L10', topic: 'VSEPR shapes',
        blanks: [{ label: 'Shape', type: 'text', accept: ['bent', 'v-shaped', 'v shape', 'angular', 'bengkok', 'bentuk v', 'v', 'menekuk', 'sudut'] }], labels: ['Bentuk'],
        s: r`Give the geometry (shape) around atom no. 5 (the O bonded to the right CH₂ and to N).`,
        si: r`Tentukan bentuk geometri atom nomor 5.`,
        h: [r`Count bonded atoms and lone pairs on atom 5.`, r`Which $\text{AX}_m\text{E}_n$ class is that?`],
        hi: [r`Hitung atom terikat dan pasangan bebas pada atom 5.`, r`Termasuk kelas $\text{AX}_m\text{E}_n$ yang mana?`],
        w: [r`Atom 5: 2 bonded atoms (C and N) + 2 lone pairs.`, r`$\text{AX}_2\text{E}_2$: tetrahedral electron geometry.`, r`Molecular shape: bent (V).`],
        wi: [r`Atom 5: 2 atom terikat (C dan N) + 2 pasangan bebas.`, r`$\text{AX}_2\text{E}_2$: geometri elektron tetrahedral.`, r`Bentuk molekul: bengkok (V).`],
        e: r`$\text{AX}_2\text{E}_2$: tetrahedral electron geometry, **bent** (V-shaped) molecular shape, angle ≈ 104.5°. (L10, VSEPR)`,
        ei: r`$\text{AX}_2\text{E}_2$: geometri elektron tetrahedral, bentuk molekul **bengkok** (V), sudut ≈ 104,5°. (L10, VSEPR)`,
      }),
      ...mo('B', 'N₂', r`$\text{N}_2$`, 'N2', r`(Nitroglycerin's decomposition gives $\text{N}_2$ gas. The template shows the 2s and 2p levels of the two N atoms and the MOs of $\text{N}_2$ in the middle.)`, r`(Peruraian nitrogliserin menghasilkan gas $\text{N}_2$. Template menunjukkan tingkat 2s dan 2p kedua atom N dan orbital molekul $\text{N}_2$ di tengah.)`,
        r`Valence electrons: $2\times5=10$.`, r`Elektron valensi: $2\times5=10$.`),
    ],
  },
  {
    n: 10, points: 16, outOfScope: true,
    intro: r`**Version B (\*\*) — Problem 5.** Complex compounds are formed from a central ion and ligands. The $\text{Fe}^{3+}$ ion can form complexes with coordination number 6. (Ethylenediamine, en, is $\text{H}_2\text{N–CH}_2\text{CH}_2\text{–NH}_2$, a neutral bidentate ligand.)`,
    introId: r`**Versi B (\*\*) — Soal 5.** Senyawa kompleks dapat dibentuk oleh ion pusat dan ligan. Ion $\text{Fe}^{3+}$ dapat membentuk senyawa kompleks dengan bilangan koordinasi 6. (Etilendiamin (en) adalah $\text{H}_2\text{N–CH}_2\text{CH}_2\text{–NH}_2$, ligan bidentat netral.)`,
    parts: q5('B', {
      metal: 'Fe', lig: 'ethylenediamine', ligId: 'etilendiamin', X: 'bromide', XId: 'bromida', chargeEn: '+1',
      formula: r`[\text{FeBr}_2(\text{en})_2]^{+}`,
      nameEn: 'dibromobis(ethylenediamine)iron(III) ion', nameId: 'Ion dibromobisetilendiaminbesi(III)',
      stemA: r`Write the chemical formula of the complex ion formed by $\text{Fe}^{3+}$ with ethylenediamine (en, neutral, bidentate) and bromide that has a charge of +1.`,
      stemAi: r`Tuliskan rumus kimia ion kompleks yang dibentuk oleh $\text{Fe}^{3+}$ dengan etilendiamin (en) dan bromida yang mempunyai muatan +1.`,
      why: r`Coordination number 6; each en gives 2 donor sites. Neutral en does not change the charge, so the 2 bromide ions ($+3-2=+1$) account for it; sites: $2\times2+2=6$ ✓. Formula $[\text{FeBr}_2(\text{en})_2]^+$.`,
      whyId: r`Bilangan koordinasi 6; tiap en memberi 2 situs donor. en netral tidak mengubah muatan, jadi 2 ion bromida ($+3-2=+1$) yang menentukannya; situs: $2\times2+2=6$ ✓. Rumus $[\text{FeBr}_2(\text{en})_2]^+$.`,
      iso: r`Octahedral $\text{trans}$-$[\text{FeBr}_2(\text{en})_2]^+$ (the two Br⁻ on opposite, axial positions; the two en in the equatorial plane) and $\text{cis}$-$[\text{FeBr}_2(\text{en})_2]^+$ (the two Br⁻ adjacent, 90°). The cis isomer is chiral (pair of enantiomers).`,
      isoId: r`Oktahedral $\text{trans}$-$[\text{FeBr}_2(\text{en})_2]^+$ (dua Br⁻ berseberangan di posisi aksial; dua en pada bidang ekuator) dan $\text{cis}$-$[\text{FeBr}_2(\text{en})_2]^+$ (dua Br⁻ bersebelahan, 90°). Isomer cis bersifat kiral (sepasang enantiomer).`,
    }),
  },
]

/* ======================================================================= */
/* VERSION C  (***)                                                        */
/* ======================================================================= */
const C: PastProblem[] = [
  {
    n: 11, points: 14,
    intro: r`**Version C (\*\*\*) — Problem 1.** The line spectrum of atomic hydrogen is produced when an electron makes a transition from a high quantum number to a low one. An electron makes a transition from $n_2$ down to $n=2$ and emits an energy of 2769.64 kJ/mol. **Note on the data:** as printed, 2769.64 kJ/mol is larger than the maximum possible for a transition to $n=2$ (about 328 kJ/mol), so no $n_2$ fits it. The official key (E = 4.598 × 10⁻¹⁹ J per photon, λ = 432.6 nm, $n_2=5$) corresponds to **276.964 kJ/mol**; the parts below use that intended value.`,
    introId: r`**Versi C (\*\*\*) — Soal 1.** Spektrum garis atom hidrogen dihasilkan ketika elektron mengalami transisi dari bilangan kuantum tinggi ke bilangan kuantum rendah. Jika sebuah elektron mengalami transisi dari $n_2$ turun ke $n = 2$ dan mengemisikan energi sebesar 2769,64 kJ/mol, maka: **Catatan data:** nilai 2769,64 kJ/mol seperti tercetak lebih besar dari energi maksimum transisi ke $n=2$ (sekitar 328 kJ/mol), sehingga tidak ada $n_2$ yang cocok. Kunci resmi (E = 4,598 × 10⁻¹⁹ J per foton, λ = 432,6 nm, $n_2=5$) sesuai dengan **276,964 kJ/mol**; sub-soal di bawah memakai nilai yang dimaksud tersebut.`,
    parts: [
      num({
        label: 'C-1a', pts: 8, lec: 'L7', topic: 'Line spectra & Bohr', d: 2, a: 432.6, unit: 'nm', tol: { rel: 0.01 },
        s: r`Determine the wavelength emitted by the electron (energy 276.964 kJ/mol, see the note).`,
        si: r`Tentukan panjang gelombang yang diemisikan oleh elektron tersebut.`,
        h: [r`Convert kJ/mol to joules per photon (divide by $N_A$).`, r`Then use $E=hc/\lambda$ and solve for $\lambda$.`],
        hi: [r`Ubah kJ/mol menjadi joule per foton (bagi dengan $N_A$).`, r`Lalu gunakan $E=hc/\lambda$ dan selesaikan $\lambda$.`],
        w: [r`$E_{\text{photon}}=\dfrac{276964\ \text{J/mol}}{6.023\times10^{23}}=4.598\times10^{-19}\ \text{J}$.`, r`$\lambda=\dfrac{hc}{E}=\dfrac{(6.63\times10^{-34})(3\times10^{8})}{4.598\times10^{-19}}=4.326\times10^{-7}\ \text{m}$.`, r`$\lambda=432.6$ nm.`],
        wi: [r`$E_{\text{foton}}=\dfrac{276964\ \text{J/mol}}{6{,}023\times10^{23}}=4{,}598\times10^{-19}\ \text{J}$.`, r`$\lambda=\dfrac{hc}{E}=\dfrac{(6{,}63\times10^{-34})(3\times10^{8})}{4{,}598\times10^{-19}}=4{,}326\times10^{-7}\ \text{m}$.`, r`$\lambda=432{,}6$ nm.`],
        e: r`Energy per photon $=276.964\times10^3/6.023\times10^{23}=4.598\times10^{-19}$ J, so $\lambda=hc/E=1.989\times10^{-25}/4.598\times10^{-19}=4.326\times10^{-7}$ m $=\mathbf{432.6}$ nm (blue-violet Balmer line, H$\gamma$). Note: the key prints "$4.598\times10^{-18}$ J", a typo for $10^{-19}$; with the printed 2769.64 kJ/mol one would get $4.598\times10^{-18}$ J and 43.3 nm, which is impossible for $n_1=2$. (L7)`,
        ei: r`Energi per foton $=276{,}964\times10^3/6{,}023\times10^{23}=4{,}598\times10^{-19}$ J, sehingga $\lambda=hc/E=1{,}989\times10^{-25}/4{,}598\times10^{-19}=4{,}326\times10^{-7}$ m $=\mathbf{432{,}6}$ nm (garis Balmer biru-ungu, H$\gamma$). Catatan: kunci menulis "$4{,}598\times10^{-18}$ J", salah ketik untuk $10^{-19}$; dengan 2769,64 kJ/mol seperti tercetak diperoleh $4{,}598\times10^{-18}$ J dan 43,3 nm, yang tidak mungkin untuk $n_1=2$. (L7)`,
      }),
      num({
        label: 'C-1b', pts: 6, lec: 'L7', topic: 'Line spectra & Bohr', d: 2, a: 5, tol: { abs: 0.01 },
        s: r`Determine the initial position of the electron before the transition ($n_2$).`,
        si: r`Tentukan posisi awal elektron tersebut sebelum mengalami transisi ($n_2$).`,
        h: [r`Write the Rydberg equation with $n_1=2$ and use $1/\lambda$ from (a).`, r`Solve for $1/n_2^2$ and take the reciprocal square root.`],
        hi: [r`Tulis persamaan Rydberg dengan $n_1=2$ dan gunakan $1/\lambda$ dari (a).`, r`Selesaikan $1/n_2^2$ lalu ambil akar kebalikannya.`],
        w: [r`$1/\lambda=1/(432.6\times10^{-7}\ \text{cm})=2.312\times10^{4}\ \text{cm}^{-1}$.`, r`$\dfrac14-\dfrac1{n_2^2}=\dfrac{23116}{109737}=0.2107$ → $\dfrac1{n_2^2}=0.0393$.`, r`$n_2^2\approx25.4$ → $n_2=5$.`],
        wi: [r`$1/\lambda=1/(432{,}6\times10^{-7}\ \text{cm})=2{,}312\times10^{4}\ \text{cm}^{-1}$.`, r`$\dfrac14-\dfrac1{n_2^2}=\dfrac{23116}{109737}=0{,}2107$ → $\dfrac1{n_2^2}=0{,}0393$.`, r`$n_2^2\approx25{,}4$ → $n_2=5$.`],
        e: r`$\dfrac{1}{\lambda}=R_H\left(\dfrac14-\dfrac1{n_2^2}\right)$: $\dfrac{1}{n_2^2}=0.25-0.2107=0.0393$, $n_2\approx5$ (the $n=5\to2$ line, 434 nm). **Note:** the official key's "$n_2=0.7\approx1$" is inconsistent with its own wavelength (a transition to $n=2$ needs $n_2\ge3$); $n_2=5$ is correct for the intended data. (L7)`,
        ei: r`$\dfrac{1}{\lambda}=R_H\left(\dfrac14-\dfrac1{n_2^2}\right)$: $\dfrac{1}{n_2^2}=0{,}25-0{,}2107=0{,}0393$, $n_2\approx5$ (garis $n=5\to2$, 434 nm). **Catatan:** "$n_2=0{,}7\approx1$" pada kunci resmi tidak konsisten dengan panjang gelombangnya sendiri (transisi ke $n=2$ butuh $n_2\ge3$); $n_2=5$ benar untuk data yang dimaksud. (L7)`,
      }),
    ],
  },
  {
    n: 12, points: 24,
    intro: r`**Version C (\*\*\*) — Problem 2.** An element X has atomic number 50.`,
    introId: r`**Versi C (\*\*\*) — Soal 2.** Suatu unsur X mempunyai nomor atom 50.`,
    parts: q2('C', {
      Z: 50, sym: 'Sn', nameEn: 'tin',
      cfg: r`[\text{Kr}]4d^{10}5s^{2}5p^{2}`, cfgFull: r`1s^22s^22p^63s^23p^64s^23d^{10}4p^65s^24d^{10}5p^2`,
      fill: r`$50-36=14$ electrons go beyond the Kr core.`, fillId: r`$50-36=14$ elektron berada di luar inti Kr.`,
      group: 'group 14 (IV A)', groupId: 'Golongan 14 atau IV A',
      cfgAcc: ['[Kr]4d10 5s2 5p2'],
      grpAcc: ['14', 'IV A', 'IVA', '4A', 'XIV', 'IV', 'group 14', 'golongan 14', 'golongan IV A'],
      ionRub: [r`States that X²⁺ can form (the two 5p electrons are lost)`, r`States that X⁴⁺ can form (the 5s electrons are lost as well)`],
      ionRubId: [r`Menyebut X²⁺ dapat terbentuk (dua elektron 5p dilepas)`, r`Menyebut X⁴⁺ dapat terbentuk (elektron 5s ikut dilepas)`],
      ions: r`$\text{X}^{2+}$ and $\text{X}^{4+}$`,
      ionsWhy: r`Losing the two $5p$ electrons gives $\text{X}^{2+}$ (the "inert-pair" ion, $[\text{Kr}]4d^{10}5s^2$); losing the $5s$ electrons as well gives $\text{X}^{4+}$ ($[\text{Kr}]4d^{10}$). Both $\text{X}^{2+}$ and $\text{X}^{4+}$ are accepted.`,
      ionsWhyId: r`Melepas dua elektron $5p$ memberi $\text{X}^{2+}$ (ion "pasangan inert", $[\text{Kr}]4d^{10}5s^2$); melepas juga elektron $5s$ memberi $\text{X}^{4+}$ ($[\text{Kr}]4d^{10}$). $\text{X}^{2+}$ dan $\text{X}^{4+}$ diterima.`,
    }),
  },
  {
    n: 13, points: 18,
    intro: r`**Version C (\*\*\*) — Problem 3.** Dinitrogen pentoxide is a strong oxidising agent. It reacts with water to give nitric acid: $\text{N}_2\text{O}_5(s)+\text{H}_2\text{O}(l)\rightarrow2\text{HNO}_3(aq)$.`,
    introId: r`**Versi C (\*\*\*) — Soal 3.** Dinitrogen pentaoksida merupakan oksidator kuat. Senyawa ini ketika bereaksi dengan air akan menghasilkan asam nitrat: $\text{N}_2\text{O}_5(s)+\text{H}_2\text{O}(l)\rightarrow2\text{HNO}_3(aq)$`,
    parts: [
      open({
        label: 'C-3a', pts: 6, lec: 'L9', topic: 'Lewis structures', d: 2,
        s: r`Draw the most stable Lewis structure of the $\text{N}_2\text{O}_5$ molecule (N is not directly bonded to the other N atom).`,
        si: r`Gambarkan struktur Lewis paling stabil dari molekul $\text{N}_2\text{O}_5$ (atom N tidak langsung terikat pada atom N lainnya).`,
        a: r`$\text{O}_2\text{N–O–NO}_2$: a bridging O with two single bonds to two N; each N has one N=O, one N–O⁻ and the bond to the bridging O (formal charges N⁺, O⁻; molecule neutral). Octets everywhere (N has 4 bonds, no lone pair).`,
        ai: r`$\text{O}_2\text{N–O–NO}_2$: satu O jembatan dengan dua ikatan tunggal ke dua N; tiap N punya satu N=O, satu N–O⁻ dan ikatan ke O jembatan (muatan formal N⁺, O⁻; molekul netral). Semua atom memenuhi oktet (N punya 4 ikatan, tanpa pasangan bebas).`,
        rub: [r`Counts 40 valence electrons`, r`Skeleton O₂N–O–NO₂ with a bridging O and no N–N bond`, r`Each N has one N=O, one N–O⁻ and one single bond to the bridging O (no expanded octet)`, r`Formal charges: N +1, single-bonded terminal O −1, net charge 0; all octets satisfied`],
        rubi: [r`Menghitung 40 elektron valensi`, r`Kerangka O₂N–O–NO₂ dengan O jembatan dan tanpa ikatan N–N`, r`Tiap N punya satu N=O, satu N–O⁻ dan satu ikatan tunggal ke O jembatan (tanpa oktet diperluas)`, r`Muatan formal: N +1, O terminal ikatan tunggal −1, muatan total 0; semua oktet terpenuhi`],
        h: [r`Total valence electrons: $2(5)+5(6)$.`, r`Skeleton: N–O–N with two terminal O on each N. N cannot exceed an octet.`, r`Give each N one double bond to a terminal O; the other terminal O carries a negative charge.`],
        hi: [r`Total elektron valensi: $2(5)+5(6)$.`, r`Kerangka: N–O–N dengan dua O terminal pada tiap N. N tidak boleh melebihi oktet.`, r`Beri tiap N satu ikatan rangkap dua ke O terminal; O terminal lainnya bermuatan negatif.`],
        w: [r`Valence electrons: $10+30=40$.`, r`Skeleton O₂N–O–NO₂; each N: bonds to bridging O, one =O, one –O.`, r`Octet at N requires 4 bonds → $\text{FC}_N=+1$; the single-bonded terminal O gets 3 lone pairs → $\text{FC}=-1$ (each N–O⁻ pair of charges cancels the N⁺).`, r`Count: 4 N–O single + 2 N=O = 8 bonding pairs (16 e⁻) + 12 lone pairs (24 e⁻) = 40. ✓`],
        wi: [r`Elektron valensi: $10+30=40$.`, r`Kerangka O₂N–O–NO₂; tiap N: ikatan ke O jembatan, satu =O, satu –O.`, r`Oktet N butuh 4 ikatan → $\text{FC}_N=+1$; O terminal ikatan tunggal punya 3 pasangan bebas → $\text{FC}=-1$ (jumlah per unit nol).`, r`Hitung: 4 ikatan tunggal N–O + 2 ikatan rangkap N=O = 8 pasang ikatan (16 e⁻) + 12 pasangan bebas (24 e⁻) = 40. ✓`],
        e: r`40 valence electrons. Skeleton $\text{O}_2\text{N–O–NO}_2$. Nitrogen (period 2) cannot expand its octet, so each N has one N=O double bond, one N–O⁻ single bond and one single bond to the bridging O (4 bonds → $\text{FC}_N=+1$; the single-bonded terminal O has 3 lone pairs → $\text{FC}_O=-1$; the bridging O has 2 lone pairs, FC 0). Total charge 0. Pairs: 8 bonding (16 e⁻) + 12 lone pairs (24 e⁻) = 40 e⁻. (The hand-drawn key shows O=N(–O)–O–N(=O)–O with the terminal O's carrying lone pairs; the formal charges N⁺/O⁻ complete it.) (L9)`,
        ei: r`40 elektron valensi. Kerangka $\text{O}_2\text{N–O–NO}_2$. Nitrogen (periode 2) tidak dapat memperluas oktet, sehingga tiap N punya satu ikatan rangkap dua N=O, satu ikatan tunggal N–O⁻ dan satu ikatan tunggal ke O jembatan (4 ikatan → $\text{FC}_N=+1$; O terminal ikatan tunggal punya 3 pasangan bebas → $\text{FC}_O=-1$; O jembatan punya 2 pasangan bebas, FC 0). Muatan total 0. Pasangan: 8 ikatan (16 e⁻) + 12 pasangan bebas (24 e⁻) = 40 e⁻. (Gambar tangan pada kunci memperlihatkan O=N(–O)–O–N(=O)–O dengan pasangan bebas pada O terminal; muatan formal N⁺/O⁻ melengkapinya.) (L9)`,
      }),
      wid({
        label: 'C-3b', pts: 6, lec: 'L9', topic: 'Resonance & delocalisation', d: 2, widget: 'lewis', task: { species: 'NO3^-', resonance: true },
        s: r`Draw 2 possible resonance structures of the $\text{NO}_3^-$ ion.`,
        si: r`Gambarkan 2 struktur resonansi yang mungkin dari ion $\text{NO}_3^-$.`,
        h: [r`Total valence electrons: $5+3(6)+1$.`, r`Central N has no room for more than an octet: one double bond is needed.`, r`The double bond can sit on any of the three O.`],
        hi: [r`Total elektron valensi: $5+3(6)+1$.`, r`N pusat tidak boleh melebihi oktet: perlu satu ikatan rangkap dua.`, r`Ikatan rangkap dua dapat berada pada salah satu dari tiga O.`],
        w: [r`Valence electrons $=5+18+1=24$.`, r`Draw N surrounded by 3 O, one N=O and two N–O⁻ (octet on all atoms).`, r`Move the double bond to another O for the second structure. Formal charges: N +1, the two single-bonded O −1 each, =O 0.`],
        wi: [r`Elektron valensi $=5+18+1=24$.`, r`Gambar N dikelilingi 3 O, satu N=O dan dua N–O⁻ (semua atom oktet).`, r`Pindahkan ikatan rangkap dua ke O lain untuk struktur kedua. Muatan formal: N +1, dua O ikatan tunggal −1, =O 0.`],
        e: r`24 valence electrons. Each resonance structure has one N=O and two N–O⁻ (3 lone pairs on each O⁻, 2 on =O). Formal charges N +1, O⁻ −1, =O 0; sum −1 ✓. The double bond may be placed on any of the three O atoms; the real ion is a hybrid with three equivalent N–O bonds of order 4/3. (L9, resonance)`,
        ei: r`24 elektron valensi. Setiap struktur resonansi punya satu N=O dan dua N–O⁻ (3 pasangan bebas pada tiap O⁻, 2 pada =O). Muatan formal N +1, O⁻ −1, =O 0; jumlah −1 ✓. Ikatan rangkap dua dapat ditempatkan pada salah satu dari tiga atom O; ion sebenarnya adalah hibrida dengan tiga ikatan N–O ekuivalen berorde 4/3. (L9, resonansi)`,
      }),
      num({
        label: 'C-3c', pts: 6, lec: 'L9', topic: 'Lewis structures', a: 8, tol: { abs: 0.01 },
        s: r`Give the number of lone pairs in the $\text{NO}_3^-$ ion.`,
        si: r`Tuliskan jumlah pasangan elektron bebas pada ion $\text{NO}_3^-$.`,
        h: [r`Use one resonance structure from (b).`, r`Count lone pairs per O; N has none.`],
        hi: [r`Gunakan satu struktur resonansi dari (b).`, r`Hitung pasangan bebas per O; N tidak punya.`],
        w: [r`=O: 2 lone pairs.`, r`Two O⁻: $2\times3=6$ lone pairs.`, r`Total $2+6=8$ (N has none).`],
        wi: [r`=O: 2 pasangan bebas.`, r`Dua O⁻: $2\times3=6$ pasangan bebas.`, r`Total $2+6=8$ (N tidak punya).`],
        e: r`One =O (2 lone pairs) + two O⁻ (3 each) $=\mathbf{8}$ lone pairs. Check: $24-8$ (4 bonding pairs) $=16$ e⁻ $=8$ pairs. (L9)`,
        ei: r`Satu =O (2 pasangan bebas) + dua O⁻ (masing-masing 3) $=\mathbf{8}$ pasang. Cek: $24-8$ (4 pasang ikatan) $=16$ e⁻ $=8$ pasang. (L9)`,
      }),
    ],
  },
  {
    n: 14, points: 28,
    intro: r`**Version C (\*\*\*) — Problem 4.** Furfural is an organic compound obtained by dehydration of sugars. The figure shows its structure: a five-membered ring O–C–C=C–C where the two C=C double bonds are drawn in the ring, and the ring carbon next to the ring O carries a –CHO group. Atom 1 is the aldehyde C (C=O, with H), atom 2 is the ring carbon bonded to it (next to the ring O), atom 3 is the ring carbon next to atom 2 (it carries an H).`,
    introId: r`**Versi C (\*\*\*) — Soal 4.** Furfural merupakan suatu senyawa organik yang dihasilkan dari dehidrasi senyawa gula. Struktur molekul furfural ditunjukkan pada gambar: cincin lima atom O–C–C=C–C dengan dua ikatan rangkap C=C pada cincin, dan karbon cincin di samping O cincin mengikat gugus –CHO. Atom 1 adalah C aldehida (C=O, dengan H), atom 2 adalah karbon cincin yang terikat padanya (di samping O cincin), atom 3 adalah karbon cincin di samping atom 2 (mengikat H).`,
    parts: [
      num({
        label: 'C-4a(i)', pts: 3, lec: 'L10', topic: 'Sigma & pi bonds', a: 11, tol: { abs: 0.01 },
        s: r`Count the number of σ bonds in one furfural molecule ($\text{C}_5\text{H}_4\text{O}_2$).`,
        si: r`Hitung jumlah ikatan σ pada satu molekul furfural.`,
        h: [r`Every bond has one σ bond. Count the ring bonds, then the substituent bonds, then C–H.`, r`Or use: σ = atoms − 1 + number of rings.`],
        hi: [r`Setiap ikatan punya satu ikatan σ. Hitung ikatan cincin, ikatan substituen, lalu C–H.`, r`Atau gunakan: σ = atom − 1 + jumlah cincin.`],
        w: [r`Ring: 5 bonds (O–C, C=C, C–C, C=C, C–O) → 5 σ.`, r`CHO group: C–C(ring) 1, C=O 1, C–H 1 → 3 σ.`, r`Ring C–H: 3 → total $5+3+3=11$.`],
        wi: [r`Cincin: 5 ikatan (O–C, C=C, C–C, C=C, C–O) → 5 σ.`, r`Gugus CHO: C–C(cincin) 1, C=O 1, C–H 1 → 3 σ.`, r`C–H cincin: 3 → total $5+3+3=11$.`],
        e: r`σ bonds: 5 (ring) + 3 (CHO: C–C, C=O, C–H) + 3 (ring C–H) $=\mathbf{11}$. Check: 11 atoms, 1 ring → $11-1+1=11$. (L10)`,
        ei: r`σ: 5 (cincin) + 3 (CHO: C–C, C=O, C–H) + 3 (C–H cincin) $=\mathbf{11}$. Cek: 11 atom, 1 cincin → $11-1+1=11$. (L10)`,
      }),
      num({
        label: 'C-4a(ii)', pts: 3, lec: 'L10', topic: 'Sigma & pi bonds', a: 3, tol: { abs: 0.01 },
        s: r`Count the number of π bonds in one furfural molecule.`,
        si: r`Hitung jumlah ikatan π pada satu molekul furfural.`,
        h: [r`Find all double bonds.`, r`Two are in the ring; one is outside it.`],
        hi: [r`Cari semua ikatan rangkap dua.`, r`Dua berada di cincin; satu di luar cincin.`],
        w: [r`Ring C=C: 2.`, r`C=O of the aldehyde: 1.`, r`Total π $=3$.`],
        wi: [r`C=C cincin: 2.`, r`C=O aldehida: 1.`, r`Total π $=3$.`],
        e: r`2 ring C=C + 1 C=O $=\mathbf{3}$ π bonds. (L10)`,
        ei: r`2 C=C cincin + 1 C=O $=\mathbf{3}$ ikatan π. (L10)`,
      }),
      mcq({
        label: 'C-4b(i)', pts: 3, lec: 'L10', topic: 'Hybridization', o: HYB, oi: HYB, a: [1],
        s: r`Which hybrid orbitals does atom no. 1 (the aldehyde C) use to form its σ bonds?`,
        si: r`Tentukan jenis orbital hibrida yang digunakan untuk membentuk ikatan σ oleh atom nomor 1 pada molekul furfural di atas.`,
        h: [r`Count its σ bonds and lone pairs.`, r`Three domains.`],
        hi: [r`Hitung ikatan σ dan pasangan bebasnya.`, r`Tiga domain.`],
        w: [r`Atom 1: σ bonds to C(ring), O, H (the C=O double bond counts as one domain).`, r`3 domains → trigonal planar.`, r`$sp^2$.`],
        wi: [r`Atom 1: ikatan σ ke C(cincin), O, H (ikatan rangkap C=O dihitung satu domain).`, r`3 domain → segitiga planar.`, r`$sp^2$.`],
        e: r`Three electron domains (C, =O, H), one π bond: $\mathbf{sp^2}$. (L10)`,
        ei: r`Tiga domain elektron (C, =O, H), satu ikatan π: $\mathbf{sp^2}$. (L10)`,
      }),
      mcq({
        label: 'C-4b(ii)', pts: 3, lec: 'L10', topic: 'Hybridization', o: HYB, oi: HYB, a: [1],
        s: r`Which hybrid orbitals does atom no. 2 (the ring carbon bonded to the CHO group) use to form its σ bonds?`,
        si: r`Tentukan jenis orbital hibrida yang digunakan untuk membentuk ikatan σ oleh atom nomor 2 pada molekul furfural di atas.`,
        h: [r`Count its σ bonds; it has a C=C double bond in the ring.`, r`Three σ domains, no lone pair.`],
        hi: [r`Hitung ikatan σ-nya; ia punya ikatan rangkap C=C di cincin.`, r`Tiga domain σ, tanpa pasangan bebas.`],
        w: [r`Atom 2: σ bonds to ring O, ring C3 and the CHO carbon.`, r`3 domains (the C=C π bond is not a domain of its own).`, r`$sp^2$.`],
        wi: [r`Atom 2: ikatan σ ke O cincin, C3 cincin dan C aldehida.`, r`3 domain (ikatan π C=C bukan domain tersendiri).`, r`$sp^2$.`],
        e: r`Atom 2 has three σ bonds and one π bond (C=C): trigonal planar, $\mathbf{sp^2}$. (L10)`,
        ei: r`Atom 2 punya tiga ikatan σ dan satu ikatan π (C=C): segitiga planar, $\mathbf{sp^2}$. (L10)`,
      }),
      short({
        label: 'C-4c', pts: 4, lec: 'L10', topic: 'VSEPR shapes',
        blanks: [{ label: 'Bond angle', type: 'number', accept: ['104.5'], tol: { abs: 5.1 }, unit: '°' }], labels: ['Sudut ikatan C–O–C'],
        s: r`Give the value of the C–O–C bond angle in furfural.`,
        si: r`Tentukan nilai sudut ikatan C-O-C pada molekul furfural di atas.`,
        h: [r`Count bonded atoms and lone pairs on the ring oxygen.`, r`The ideal angle for four domains is 109.5°; lone pairs reduce it.`],
        hi: [r`Hitung atom terikat dan pasangan bebas pada oksigen cincin.`, r`Sudut ideal untuk empat domain 109,5°; pasangan bebas menguranginya.`],
        w: [r`Ring O: 2 bonded atoms + 2 lone pairs → $\text{AX}_2\text{E}_2$.`, r`Bent, ideal tetrahedral 109.5° reduced by lone pairs.`, r`≈ 104.5° (key: 104.5° or about 109°).`],
        wi: [r`O cincin: 2 atom terikat + 2 pasangan bebas → $\text{AX}_2\text{E}_2$.`, r`Bengkok; tetrahedral ideal 109,5° berkurang karena pasangan bebas.`, r`≈ 104,5° (kunci: 104,5° atau sekitar 109°).`],
        e: r`The ring oxygen is $\text{AX}_2\text{E}_2$ (bent): $\approx\mathbf{104.5^\circ}$ by VSEPR (the key also accepts about $109^\circ$; in the real five-membered ring it is about $106^\circ$). (L10)`,
        ei: r`Oksigen cincin bertipe $\text{AX}_2\text{E}_2$ (bengkok): $\approx\mathbf{104{,}5^\circ}$ menurut VSEPR (kunci juga menerima sekitar $109^\circ$; pada cincin lima anggota sebenarnya sekitar $106^\circ$). (L10)`,
      }),
      short({
        label: 'C-4d', pts: 4, lec: 'L10', topic: 'VSEPR shapes',
        blanks: [{ label: 'Shape', type: 'text', accept: ['trigonal planar', 'planar trigonal', 'triangular planar', 'trigonal flat', 'segitiga planar', 'segitiga datar', 'planar segitiga', 'trigonal datar'] }], labels: ['Bentuk'],
        s: r`Give the geometry (shape) of ring carbon no. 3.`,
        si: r`Tentukan bentuk geometri atom C nomor 3.`,
        h: [r`Count bonded atoms and lone pairs on atom 3.`, r`A double bond counts as one electron domain.`],
        hi: [r`Hitung atom terikat dan pasangan bebas pada atom 3.`, r`Ikatan rangkap dua dihitung satu domain elektron.`],
        w: [r`Atom 3: bonded to C2 (double bond), C4 and H.`, r`3 domains, no lone pairs: $\text{AX}_3$.`, r`Trigonal planar.`],
        wi: [r`Atom 3: terikat pada C2 (rangkap dua), C4 dan H.`, r`3 domain, tanpa pasangan bebas: $\text{AX}_3$.`, r`Segitiga planar.`],
        e: r`Three domains (C=C, C, H), no lone pairs: $\text{AX}_3$ → **trigonal planar** ($sp^2$). (L10)`,
        ei: r`Tiga domain (C=C, C, H), tanpa pasangan bebas: $\text{AX}_3$ → **segitiga planar** ($sp^2$). (L10)`,
      }),
      ...mo('C', 'CO', r`$\text{CO}$`, 'CO', r`(Decarbonylation of furfural with a palladium catalyst gives CO gas and furan. The template shows the 2s and 2p levels of atom C (left) and atom O (right) and the MOs of CO in the middle.)`, r`(Reaksi dekarbonilasi furfural dengan katalis palladium menghasilkan gas CO dan furan. Template menunjukkan tingkat 2s dan 2p atom C (kiri), atom O (kanan) dan orbital molekul CO di tengah.)`,
        r`Valence electrons: C (4) + O (6) $=10$ (isoelectronic with $\text{N}_2$ and $\text{CN}^-$).`, r`Elektron valensi: C (4) + O (6) $=10$ (isoelektronik dengan $\text{N}_2$ dan $\text{CN}^-$).`),
    ],
  },
  {
    n: 15, points: 16, outOfScope: true,
    intro: r`**Version C (\*\*\*) — Problem 5.** Complex compounds are formed from a central ion and ligands. The $\text{Fe}^{3+}$ ion can form complexes with coordination number 6. (Bipyridine, bpy, is 2,2′-bipyridine, a neutral bidentate ligand bound through its two N atoms.)`,
    introId: r`**Versi C (\*\*\*) — Soal 5.** Senyawa kompleks dapat dibentuk oleh ion pusat dan ligan. Ion $\text{Fe}^{3+}$ dapat membentuk senyawa kompleks dengan bilangan koordinasi 6. (Bipiridil (bpy) adalah 2,2′-bipiridin, ligan bidentat netral yang terikat melalui dua atom N.)`,
    parts: q5('C', {
      metal: 'Fe', lig: 'bipyridine', ligId: 'bipiridil', X: 'chloride', XId: 'klorida', chargeEn: '+1',
      formula: r`[\text{FeCl}_2(\text{bpy})_2]^{+}`,
      nameEn: 'bis(bipyridine)dichloroiron(III) ion', nameId: 'Ion bisbipiridildiklorobesi(III)',
      stemA: r`Write the chemical formula of the complex ion formed by $\text{Fe}^{3+}$ with bipyridine (bpy, neutral, bidentate) and chloride that has a charge of +1.`,
      stemAi: r`Tuliskan rumus kimia ion kompleks yang dibentuk oleh $\text{Fe}^{3+}$ dengan bipiridil (bpy) dan klorida yang mempunyai muatan +1.`,
      why: r`Coordination number 6; each bpy gives 2 donor N atoms ($2\times2=4$ sites) and the other 2 sites hold chloride. Charge: $+3-2+0=+1$ ✓. Formula $[\text{FeCl}_2(\text{bpy})_2]^+$.`,
      whyId: r`Bilangan koordinasi 6; tiap bpy memberi 2 atom N donor ($2\times2=4$ situs) dan 2 situs lainnya diisi klorida. Muatan: $+3-2+0=+1$ ✓. Rumus $[\text{FeCl}_2(\text{bpy})_2]^+$.`,
      iso: r`Octahedral $\text{trans}$-$[\text{FeCl}_2(\text{bpy})_2]^+$ (the two Cl⁻ on opposite, axial positions; the two bpy in the equatorial plane) and $\text{cis}$-$[\text{FeCl}_2(\text{bpy})_2]^+$ (the two Cl⁻ adjacent, 90°). The cis isomer is chiral (pair of enantiomers).`,
      isoId: r`Oktahedral $\text{trans}$-$[\text{FeCl}_2(\text{bpy})_2]^+$ (dua Cl⁻ berseberangan di posisi aksial; dua bpy pada bidang ekuator) dan $\text{cis}$-$[\text{FeCl}_2(\text{bpy})_2]^+$ (dua Cl⁻ bersebelahan, 90°). Isomer cis bersifat kiral (sepasang enantiomer).`,
    }),
  },
]

export const paper: PastPaper = {
  id: PID,
  year: 2022,
  title: 'Quiz 2 2022',
  titleId: 'Kuis 2 2022',
  minutes: 50,
  constants: CONST,
  constantsId: CONSTID,
  note: 'The PDF holds three parallel versions (A *, B **, C ***) of the same quiz with an official answer key (problems 1–5 of each are numbered 1–5, 6–10 and 11–15 here). Typos in the key are noted in the explanations; Version C problem 1 has a data typo (see its intro).',
  problems: [...A, ...B_, ...C],
}
