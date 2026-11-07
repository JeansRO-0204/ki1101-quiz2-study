// Figures cropped from the original past-quiz papers (question figures only: no names, no handwritten answers).
// Keyed by `${paperId}:${problemNumber}`. Alt text doubles as the description for screen readers.
export interface PastFigure { src: string; alt: string; altId: string; wide?: boolean }
const f = (file: string, alt: string, altId: string, wide = false): PastFigure => ({ src: `past/${file}.png`, alt, altId, wide })

export const PAST_FIGURES: Record<string, PastFigure[]> = {
  'kuis2-2021:2': [f('p21-spectrum', 'Visible emission line spectrum of lithium: lines at about 460, 495, 610 and 670 nm on a 400–750 nm scale.', 'Spektrum emisi garis litium: garis pada sekitar 460, 495, 610 dan 670 nm pada skala 400–750 nm.', true)],
  'kuis2-2021:4': [f('p21-asparagine', 'Asparagine (zwitterion) with carbons numbered C1–C4 and nitrogens N1 (NH₃⁺) and N2 (amide NH₂).', 'Asparagin (zwitterion) dengan karbon bernomor C1–C4 serta nitrogen N1 (NH₃⁺) dan N2 (NH₂ amida).')],
  'kuis2-2021:5': [f('p21-asparagine', 'Asparagine (zwitterion) with carbons numbered C1–C4 and nitrogens N1 (NH₃⁺) and N2 (amide NH₂).', 'Asparagin (zwitterion) dengan karbon bernomor C1–C4 serta nitrogen N1 (NH₃⁺) dan N2 (NH₂ amida).')],
  'kuis2-2021:7': [f('p21-guanine', 'Guanine drawn as fused six- and five-membered rings, atoms numbered 1–9 (N1–H, C2–NH₂, N3⁺–H, C4, C5, C6=O, N7, C8–H, N9–H).', 'Guanin sebagai cincin enam dan lima yang berfusi, atom bernomor 1–9 (N1–H, C2–NH₂, N3⁺–H, C4, C5, C6=O, N7, C8–H, N9–H).')],
  'kuis2-2022:4': [f('p22-ethyl-cyanoacetate', 'Ethyl cyanoacetate N≡C–CH₂–C(=O)–O–CH₂–CH₃ with atoms numbered 1 (N) to 7 (terminal C).', 'Etil sianoasetat N≡C–CH₂–C(=O)–O–CH₂–CH₃ dengan atom bernomor 1 (N) sampai 7 (C ujung).', true)],
  'kuis2-2022:5': [f('p22-oxalate', 'The oxalate ligand (ox), ⁻O–C(=O)–C(=O)–O⁻.', 'Ligan oksalat (ox), ⁻O–C(=O)–C(=O)–O⁻.')],
  'kuis2-2022:9': [f('p22-nitroglycerin', 'Nitroglycerin: a C–C–C backbone, each carbon bearing an –O–NO₂ group; atoms numbered 1 (O) to 5 (O).', 'Nitrogliserin: rantai C–C–C, tiap karbon mengikat gugus –O–NO₂; atom bernomor 1 (O) sampai 5 (O).', true)],
  'kuis2-2022:10': [f('p22-en', 'The ethylenediamine ligand (en), H₂N–CH₂–CH₂–NH₂, with a lone pair on each N.', 'Ligan etilendiamin (en), H₂N–CH₂–CH₂–NH₂, dengan pasangan elektron bebas pada tiap N.')],
  'kuis2-2022:14': [f('p22-furfural', 'Furfural: a five-membered furan ring (O, four C) with a –CHO group; atoms numbered 1 (aldehyde C), 2 and 3 (ring C).', 'Furfural: cincin furan beranggota lima (O, empat C) dengan gugus –CHO; atom bernomor 1 (C aldehida), 2 dan 3 (C cincin).')],
  'kuis2-2022:15': [f('p22-bpy', 'The bipyridyl ligand (bpy): two pyridine rings joined by a C–C bond, each N with a lone pair.', 'Ligan bipiridil (bpy): dua cincin piridin yang dihubungkan ikatan C–C, tiap N memiliki pasangan elektron bebas.')],
  'kuis2-2023:2': [f('p23-ie-table', 'Ionisation energies EI₁–EI₆ (kJ/mol) of second-period elements 1–4, as in the problem text.', 'Energi ionisasi EI₁–EI₆ (kJ/mol) unsur periode kedua 1–4, seperti pada teks soal.', true)],
  'kuis2-2023:4': [f('p23-aspirin', 'Aspirin: benzene ring with –COOH and, on the neighbouring carbon, –O–C(=O)–CH₃; the two starred atoms are the bond in question.', 'Aspirin: cincin benzena dengan –COOH dan, pada karbon tetangga, –O–C(=O)–CH₃; dua atom bertanda bintang adalah ikatan yang ditanyakan.')],
  'kuis2-2025:5': [f('p25-skeleton', 'Atom positions: one O above X, two O below X to the left and right.', 'Posisi atom: satu O di atas X, dua O di bawah X di kiri dan kanan.')],
}
