# KI1101 Quiz 2 study site (L7–L10: atoms & bonding)

## Run
```bash
cd app && npm install && npm run dev   # http://localhost:5180
```
Progress (quiz history, flashcards, workspace layout, notes) is saved in your browser's localStorage. Use Practice → Progress → Export to back it up.

## Sections
- **Materials**: 40 sections across L7–L10, with slide citations (click a chip to open the slide) and 23 embedded interactive workbenches. Learn mode checks each step with hints; Test mode stays silent until the final Check.
- **Practice**:
  - Quiz: 215 questions, including every "Your Turn!"/"Learning Check" slide question word for word.
  - Drill: 21 endless randomized generators.
  - Flashcards: 125 cards (Leitner).
  - Past quizzes: KI1101 Quiz 2 papers from 2021–2025 with every part answerable, in English and Indonesian (EN/ID switch). Out-of-scope problems are shown but kept out of the quiz pool.
  - Mock: timed 30-minute quiz.
  - Hints: every question in Learn mode has a hint ladder. It reveals the hints first, then the worked solution one step at a time.
  - Typing: in free-response boxes and the Notepad, `_2` gives ₂ and `^2-` gives ²⁻. ⌘= toggles subscript and ⇧⌘= toggles superscript.
  - Progress.
- **Workspace**: a free-form canvas. Press A or double-click to add panels: any widget, plus the periodic table, notepad, equation solver and sketch pad. It has presets and saved layouts.
  - Ink: with Apple Pencil on iPad, write straight on the empty canvas while fingers pan and zoom. **Draw** (D) lifts the ink above all panels like a smartboard, and mouse, trackpad and Sidecar Pencil draw while it's on. Undo is ⌘Z.
  - Scratchpad panel: handwriting pages (grid, lined or blank) with pressure ink, highlighter and eraser. There's no handwriting recognition; ink stays in the browser.

## Layout
- `materials_7-10/`: lecture PDFs.
- `knowledge/`: the per-slide text the content was built from (`corpus.md`, `chunks.jsonl`).
- `app/public/slides/`: rendered slide images.
- `app/src/`:
  - `content/`: Learn text
  - `practice/bank/`: questions and flashcards
  - `practice/generators.ts`: drill generators
  - `widgets/L7…L10, tools/`: the workbenches
  - `lib/kit.tsx`: shared step, feedback and number-input kit
  - `lib/chem/elements.ts`: periodic data, using the slides' EN scale
- `BRIEF.md`: the build brief, including the design principles.
