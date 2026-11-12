# KI1101 Quiz 2 study site: project guide

This is an interactive study site for ITB KI1101 General Chemistry 1, Quiz 2. The quiz is on **Tue 10 Nov 2026** and covers lectures L7–L10: atomic structure, bonding basics, Lewis/molecular structure, and VSEPR/hybridisation/MO.
- Live site: https://jeansro-0204.github.io/ki1101-quiz2-study/
- Repo: `JeansRO-0204/ki1101-quiz2-study`, which is **public**.

## Run / build / deploy
- `cd app && npm install && npm run dev` serves at http://localhost:5180. `.claude/launch.json` has a config named `chem`.
- `cd app && npx tsc -b && npm run build`. Typecheck and build before every commit.
- Deploy: pushing to `main` triggers `.github/workflows/pages.yml`, which builds `app/` and publishes `app/dist`. Watch it with `gh run watch`.
- Commit and push only when the user says so.

## Stack and layout
- Vite + React 19 + TypeScript (strict). Hash routes: `#/learn/L9/<section>`, `#/practice/<sub>/<arg>`, `#/workspace`. `base: './'`, fully static, no backend.
- Don't add npm deps without strong need. In use: react-markdown, remark-math/gfm, rehype-katex, katex, three.
- `app/src/`:
  - `App.tsx`: shell. Lazy-loads Learn, Practice and Workspace, so each page is its own chunk.
  - `types.ts`: all contracts:
    - `WidgetDef` (lecture is `LectureId | 'tool' | 'quiz'`), `Tasks`
    - `Question` = MCQ | NumericQ | WidgetQ | OpenQ | ShortQ | OrderQ, plus `Blank`, `QIndo`
    - `PastPaper` / `PastProblem`
  - `lib/`:
    - `kit.tsx`: Md, Tex, Step, Feedback, Verdict, NumInput, SlideCtx/SlideLightbox, `SLIDE_COUNT`, useLocalState, `PanelIdCtx`, openInWorkspace
    - `icons.tsx`: SF-style SVG icons, AppIcon
    - `ink.tsx`: pressure ink engine, palette, history
    - `scripts.tsx`: `_`/`^` sub/superscript typing
    - `chem/elements.ts`: uses the slides' EN scale
  - `content/L7..L10.ts`: Materials text. `learn/Learn.tsx` has the collapsible sidebar; `learn/SlidesModal.tsx` is the slide browser.
  - `practice/`:
    - `QuestionView.tsx`: renders every question kind, the "answer on paper" fallback, and `KeysCtx`
    - `Hints.tsx`: hint ladder, EN/ID `useLang`/`loc`
    - `answerCheck.ts`: tolerant checkers for config, formula, equation, number, text and order
    - `Past.tsx` / `PastFigures.tsx` / `PanelViews.tsx` / `panels.ts`: past papers and the Workspace quiz panels
  - `practice/bank/`:
    - `L7..L10.ts`: question bank and flashcards
    - `past/p2021..p2025.ts`: past papers, bilingual, with hints and work
    - `pastMeta.ts`: titles only; keep in sync with `past/`
    - `pastFigures.ts`: cropped figures in `public/past/`
  - `widgets/L7..L10, tools/`: workbenches, registered in each folder's `index.ts` → `registry.ts`. Tools: ptable, notepad, equations, sketch, scratch (Scratchpad).
  - `workspace/Workspace.tsx`:
    - pan/zoom canvas and panels with macOS window buttons
    - one-line scrolling toolbar
    - ink layer that always sits above panels; Draw mode (D) lets mouse, trackpad and Sidecar draw
    - pinch over a panel zooms the Workspace
- `knowledge/corpus.md`: the slide text, which is the **source of truth** for chemistry. `app/public/slides/`: slide images.
- `docs/briefs/`: past sub-agent briefs (design principles, past-paper schema, answer formats). `docs/mcp-integration.md`: parked MCP idea.

## Conventions
- **Interactive working.** The learner does each step and gets it checked. Learn mode gives hints per step and allows retry before revealing the answer. Test mode stays silent until the end, with live aids hidden.
- **Chemistry.** Use the slides' conventions: EN scale, MO ordering, formal-charge formula. Flag anything that goes beyond the slides.
- **Design.** Calm Apple style: near-white background, white cards, SF fonts, iOS blue `#007aff`, no backdrop blur (it's expensive and invisible on white). Must work at phone width; the toolbar must not wrap.
- **Privacy.** Never commit past-quiz PDFs or full-page scans; only tight figure crops, with no names or handwritten answers. The lecture PDFs in `materials_7-10/` are already in the public repo; the user hasn't decided whether to remove them.
- **Commits** end with a `Co-Authored-By` line for the current model.

## Open items / known doubts
- Checker-flagged chemistry judgement calls:
  - SO₂ π count
  - NO MO ordering vs slide s129
  - MgO lattice energy derived as −3891
  - photoelectric work functions not taken from the slides
- 2021 Q7 guanine hybridisation was inferred from grading. 2022's Ru answer accepts both configurations.
- Real-device Apple Pencil feel (latency, palm rejection) has not been checked yet.
