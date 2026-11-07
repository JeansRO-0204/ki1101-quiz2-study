// Widget definitions for tools. Owned by the tools widget agent.
import { lazy } from 'react'
import type { WidgetDef } from '../../types'

export const widgets: WidgetDef[] = [
  { id: 'ptable', title: 'Periodic table', lecture: 'tool', blurb: 'Full table with f-block; colour by category, block or trend; click an element for configuration, ions and Lewis symbol.', component: lazy(() => import('./PTable')), size: { w: 820, h: 560 } },
  { id: 'notepad', title: 'Notepad', lecture: 'tool', blurb: 'Multi-note markdown + KaTeX pad with chemistry quick-insert bar; autosaved, export to .md.', component: lazy(() => import('./Notepad')), size: { w: 640, h: 480 } },
  { id: 'equations', title: 'Equation solver', lecture: 'tool', blurb: 'Pick a course formula, fill all but one variable, get the missing one with worked steps. Constants table included.', component: lazy(() => import('./Equations')), size: { w: 560, h: 640 } },
  { id: 'scratch', title: 'Scratchpad', lecture: 'tool', blurb: 'Handwriting pages for Apple Pencil, stylus, mouse or finger: pressure ink, highlighter, eraser, grid or lined paper. No recognition, just a place to work.', component: lazy(() => import('./Scratchpad')), size: { w: 620, h: 720 } },
  { id: 'sketch', title: 'Sketch pad', lecture: 'tool', blurb: 'Freehand pad with element/bond/electron-pair stamps for scribbling Lewis structures; export PNG.', component: lazy(() => import('./Sketch')), size: { w: 640, h: 480 } },
]
