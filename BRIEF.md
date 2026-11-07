# KI1101 Chem Quiz 2 study site: shared brief for build agents

A student (ITB, KI1101 General Chemistry 1) has a quiz on **Tue 10 Nov 2026** covering 4 lectures by Rino R. Mukti:
- **L7 Atomic Structure** (43 slides): light as a wave (λν = c), EM spectrum, photons (E = hν), photoelectric effect, H line spectrum, Rydberg equation, Bohr model, wave functions, quantum numbers, orbital shapes, periodic trends (atomic radius, IE, EA).
- **L8 Basics of Chemical Bonding** (42): ionic bonds, energetics (Born–Haber style paths), lattice energy, octet rule, electron configurations of ions (incl. transition/post-transition metals), electronegativity, bond polarity, dipole moment.
- **L9 Molecular Structure** (72): Lewis symbols and structures, covalent bonds, bond dissociation energy, multiple bonds, carbon compounds, method for drawing Lewis structures, bond order/length/energy, formal charge, resonance, coordinate covalent bonds.
- **L10 Chemical Bonding Theory** (142): VSEPR (2–6 domains, where lone pairs go), polarity, valence bond theory, hybridization (sp…sp³d²), σ/π bonds, MO theory (H₂…Ne₂, heteronuclear NO/NO⁺/NO⁻, bond order, magnetism), delocalized MOs (formate, benzene).

**The source of truth is the slides.** Their text is in `knowledge/corpus.md` (each slide is headed `## [L9 s42] Title`) and `knowledge/chunks.jsonl`. Slide images are in `app/public/slides/L7/s-01.jpg` (L10 uses 3 digits: `s-001.jpg`). Read the images with the Read tool when the slide text is thin (diagrams, tables, "Your Turn!" questions). Follow the slides' notation, values and conventions (e.g. the MO ordering they use for Li₂–N₂ vs O₂–Ne₂, and their formal-charge formula). Label general knowledge that goes beyond the slides as such.

## Core design principle: "interactive working"
Widgets are **workbenches where the student does each step and gets it checked**. They do not just display answers.
- The flow is: the learner does step 1, which is checked → step 2, which is checked → … → proposes the final answer → **Check**, which gives a specific diagnosis of what's wrong and why.
- **Learn mode:** steps unlock one at a time, each step is checked immediately, and wrong answers get targeted hints (e.g. "Did you add electrons for the 2− charge?").
- **Test mode:** all steps are open, nothing is checked until the final Check, and then you get a full report.
- Error messages must name the *specific* mistake and the rule behind it, not just "wrong".
- There is always a free-exploration path when no `task` is given (pick a species / element / slider values).

## Tech
Vite + React 19 + TypeScript (strict), in `app/`. Deps available: `react-markdown`, `remark-math`, `rehype-katex`, `katex`, `remark-gfm`, `three` (+ `@types/three`). **Don't add npm dependencies** without strong need. If you must, say so in your final report rather than installing.

Read these first (short):
- `app/src/types.ts`: shared contracts (`WidgetProps`, `WidgetDef`, `Tasks` task shapes, `Question`, `Flashcard`, `Lecture`/`Section`).
- `app/src/lib/kit.tsx`: UI kit. Use it: `Workbench`, `useMode`, `Step`, `Feedback`/`Note`, `Verdict`, `NumInput` + `parseNum` + `within`, `sci`, `Tex`, `Md`, `Formula`, `SlideRef`, `CONST`, `useLocalState`, `recordAttempt`, `openInWorkspace`.
- `app/src/styles.css`: design tokens (`--ok`, `--err`, `--electron`, `--lone`, `--s-orb`, `--p-orb`…) and shared classes (`.btn`, `.seg`, `.chip`, `.row`, `.grid2`, `.wb-*`).
- `app/src/lib/chem/elements.ts`: periodic table (positions, configs with exceptions, `configString`, `aufbau`).
- `app/src/registry.ts`: widgets are registered via `app/src/widgets/<L>/index.ts` (lazy imports).

## Rules for working in parallel (other agents are editing other folders right now)
- **Only edit files inside the folders/files your brief assigns you.** Never edit `types.ts`, `lib/kit.tsx`, `styles.css`, `registry.ts`, `App.tsx`, or other agents' folders. If you need a change there, describe it in your final report.
- Put widget CSS in your own `.css` file next to the component (import it from the component), with class names prefixed by your widget id (e.g. `.lewis-…`).
- Typecheck with `cd app && npx tsc -b`. Fix errors in YOUR files only. Errors in other folders are someone else's work in progress, so ignore them. Do **not** start a dev server or open a browser; the lead does browser testing.
- The UI is English. Be visually polished: clean, roomy, consistent with the tokens, with SVG for diagrams, smooth transitions and good hover states. Must be usable at ~380 px width when `compact` (Workspace panels) and look great at ~1000 px in the Learn page.
- Chemistry correctness is paramount. Double-check every number, rule and edge case against the slides.
- Final report (≤ 250 words): files created, widget ids + task shapes supported, anything you need the lead to wire up, and known gaps.
