# Idea: MCP server so chat agents can use this study site

Status: parked (Nov 2026, before the 10 Nov quiz). Revisit later.

## Goal
Let agents in chat apps (Claude, ChatGPT, …) call this site's logic, and ideally display and operate its interactive panels (past papers, quick quiz, Lewis workbench…) inside the chat.

## Tiers and rough effort
1. **Headless tools (~1–2 days).** The agent runs a study session in text; there is no UI.
   - Tools:
     - `list_papers`
     - `get_question(id|filter, lang)`
     - `check_answer(id, answer)`, reusing `practice/answerCheck.ts`
     - `get_hint(id, level)` / `next_worked_step`
     - `drill(generator)`, reusing `practice/generators.ts`
     - `validate_lewis(species, structure)`, reusing `widgets/L9/engine.ts` + `species.ts`
     - `element_info`
     - `solve_equation`
   - Work:
     - Decouple data and engines from React. Mostly done already; `practice/bank/index.ts` uses Vite-only `import.meta.glob`, so replace that with explicit imports.
     - Wrap the tools in an MCP server.
   - Hosting: stdio locally is free. A remote server needs a host (Cloudflare Workers / Vercel), because GitHub Pages is static.
2. **Interactive panels in chat via the MCP Apps extension (~3–6 days for 2–3 panels).** The server ships self-contained HTML, rendered in a sandboxed iframe.
   - Bundle each panel as a single file. Images are inlined, or loaded from Pages if the host allows that domain.
   - The real cost is a two-way bridge, plus refactoring each widget's internal React state so it can be controlled from outside: about 0.5–1 day per widget.
     - Panel → agent: state updates, e.g. "student drew N=O, FCs …".
     - Agent → panel: actions as tools, e.g. `lewis_set_bond`, `quiz_reveal_hint`.
   - localStorage may be unavailable in the sandbox, so progress has to live server-side or in the host.
   - Host support and quirks vary (CSP, sizing), so test per app.
3. **Polish (+1–2 weeks).**
   - All widgets controllable (MO, VSEPR 3D, orbital filler).
   - Per-user progress sync with auth.
   - Listing in app directories.

**Cheapest shortcut (~½ day):** tools that return deep links into the site (`#/practice/past/kuis2-2021`, `#/learn/L9/...`). The agent can point the student to the right place but can't see or operate it.

## Recommended path
- Start with Tier 1.
- Then do Tier 2 for the quiz and past-paper panels only. They are the easiest to make controllable and give the most "agent as tutor" value.
- Leave the Lewis workbench for last.
