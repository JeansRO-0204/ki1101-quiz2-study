# Brief: transcribe a past KI1101 Quiz 2 (KBF 2) into the study site

The site is a Vite + React + TS study app for ITB KI1101 Quiz 2 (L7 atomic structure, L8 bonding basics, L9 Lewis/molecular structure, L10 VSEPR/hybridisation/MO). Read `BRIEF.md` (project root) for background. The slides' text is in `knowledge/corpus.md`. Use the slides' conventions, e.g. the slide electronegativity scale in `app/src/lib/chem/elements.ts` and the MO ordering.

## Your job
Transcribe ONE past quiz PDF (given in your task) into a TypeScript data file, `app/src/practice/bank/past/<id>.ts`, that exports `paper: PastPaper`.
- Translate it into English and keep the original Indonesian.
- Write hints and a worked solution for every part.
- **Only create that one file.** Do not edit any other file.

## Reading the PDF
- Use the Read tool on the PDF with `pages` (≤ 20 per call). Also run `pdftotext -layout file.pdf -`.
- Render pages with `pdftoppm -r 110 -png file.pdf <scratch dir>/p` and read the PNGs when you need to see diagrams, tables or handwriting. Put the PNGs in the scratchpad or `/tmp`, never in the repo.
- Files whose name contains "Jawaban" include an official answer key; follow it, but check the chemistry. If the key looks wrong, say so in `explanation` with "Note: the official key gives X; …".
- The 2021 file is a Moodle "attempt review" of one student's attempt. It shows that student's answers, marks and sometimes the correct answer ("The correct answer is …"). Use the shown correct answers; where none is shown, solve it yourself.
- When a problem relies on a figure, describe the figure in words in `intro`/`stem`, e.g. "The figure shows …".

## Schema (see `app/src/types.ts`: `PastPaper`, `PastProblem`, `Question`, `QIndo`)
```ts
import type { PastPaper } from '../../../types'
const r = String.raw
export const paper: PastPaper = {
  id: 'kuis2-2025', year: 2025, title: 'Quiz 2 2025', titleId: 'Kuis 2 2025', date: '17 Nov 2025', minutes: 45,
  constants: r`...English markdown...`, constantsId: r`...Indonesian...`,
  note: 'Official answer key not provided; worked solutions written for this site.', // or omit
  problems: [
    { n: 1, points: 20, intro: r`The ion $\text{A}^{2+}$ has the configuration …`, introId: r`Ion $\text{A}^{2+}$ memiliki konfigurasi …`,
      parts: [
        { id: 'p25-1a', lecture: 'L7', topic: 'Electron configuration', source: 'past', difficulty: 1,
          past: { paper: 'kuis2-2025', label: '1a', points: 5 },
          kind: 'open',
          stem: r`Give the atomic number, group and period of atom A.`,
          answer: r`$Z = 20$ (Ca), group 2 (IIA), period 4.`,          // concise model answer
          hints: [r`A²⁺ lost 2 electrons: count the electrons shown, then add 2.`, r`The last shell being filled tells you the period.`],
          work: [r`Electrons in A²⁺: $2+2+6+2+6 = 18$.`, r`Neutral A has $18+2 = 20$ electrons, so $Z = 20$: calcium.`, r`Config $[\text{Ar}]4s^2$: valence shell $n=4$ → period 4; 2 valence s electrons → group 2 (IIA).`],
          explanation: r`…the full worked solution as one markdown block (may repeat work steps)…`,
          indo: { stem: r`Tuliskan nomor atom, golongan, dan periode untuk atom A.`, answer: r`…`, hints: [r`…`, r`…`], work: [r`…`, r`…`, r`…`], explanation: r`…` } },
        // numeric example
        { id: 'p25-3b', lecture: 'L7', topic: 'Line spectra & Bohr', source: 'past', past: { paper: 'kuis2-2025', label: '3b', points: 10 },
          kind: 'numeric', answer: 486.2, unit: 'nm', tol: { rel: 0.01 },
          steps: [{ prompt: r`$1/\lambda$ in cm$^{-1}$`, answer: 20565, unit: 'cm⁻¹', tol: { rel: 0.01 } }],   // optional checked intermediate steps
          stem: r`…`, explanation: r`…`, hints: [...], work: [...], indo: { stem: r`…`, hints: [...], work: [...], explanation: r`…` } },
      ] },
  ],
}
```

## Rules
- **Pick the right kind for each part.**
  - `numeric` when the part asks for one number. Use a sensible `tol`: rel 0.01–0.03 for computed values, depending on rounding in the given constants. Use the constants printed on the paper.
  - `mcq` (`options`, `answer: number[]` of 0-based indexes) when the paper itself is multiple choice, or a part has a small closed set of answers (e.g. paramagnetic/diamagnetic, polar/nonpolar). In `indo.options`, translate the options in the same order.
  - Otherwise use `open` with a concise model `answer`.
  - Split multi-answer parts sensibly. For example, "4 quantum numbers + magnetic property" can be `open` for the quantum numbers plus a separate `mcq` part for the magnetism. Give split parts labels like `1b(i)` and `1b(ii)`.
- **Hints:** 2–3 per part, progressive, from a general nudge to the specific method. Never give the final answer in a hint.
- **Worked solution (`work`):** 2–6 short ordered steps that end with the answer. Use markdown and KaTeX: `$...$` inline, `$$...$$` display. Use `String.raw` (`r`) for any text containing backslashes. Use the chemistry formula style of the existing banks: unicode sub/superscripts (H₂O, SO₄²⁻) in prose, or `\text{}` inside math.
- **Explanation:** the full worked solution as one block. Add the relevant L-slide refs where useful, like "(L9 s42)", but don't invent slide numbers. Check `knowledge/corpus.md` if you cite one.
- **Bilingual:** keep the original Indonesian wording in `indo.stem` and `introId`, verbatim except for fixing obvious OCR glitches. Write the Indonesian hints, work, explanation and answer yourself in natural Indonesian.
- **Lectures and topics:** set `lecture` and `topic` using EXACTLY one of these topic names:
  - L7: Light & photons, Photoelectric effect, Line spectra & Bohr, Quantum numbers, Electron configuration, Periodic trends
  - L8: Born–Haber energetics, Lattice energy, Ion formation & octet, Ion configurations, Electronegativity & polarity, Dipole moment, Ionic character & reactivity
  - L9: Lewis symbols, Covalent bonding, Lewis structures, Formal charge, Bond properties, Resonance & delocalisation, Carbon compounds, Coordinate covalent bonds
  - L10: VSEPR shapes, Molecular polarity, Hybridization, Sigma & pi bonds, MO theory
- **Out-of-scope problems** (e.g. thermochemistry/calorimetry, stoichiometry): include them in full, with `outOfScope: true` on the problem. Set the parts to the nearest lecture with topic `'Out of scope'`.
- **ids:** `p<yy>-<label>`, lowercase, no spaces, unique (e.g. `p21-q7`, `p22-2b`, `p22-2b-ii`).
- **Chemistry correctness is paramount.** Double-check every number. Recompute with the paper's constants. Watch Z² in the Rydberg formula for hydrogen-like ions.
- **Done when:** `cd app && npx tsc -b` passes with no errors in your file. Ignore errors in other files, which other agents are writing right now. Do not start a dev server.

## Final report (≤ 150 words)
File path, the number of problems and parts, which parts were out of scope, any places where you disagreed with the official key, and anything illegible you had to guess.
