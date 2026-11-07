// Handwriting scratchpad for Apple Pencil / stylus (also mouse and finger). A page that grows as you write; no recognition.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { WidgetProps } from '../../types'
import { useLocalState } from '../../lib/kit'
import { InkPalette, InkPaths, PEN_COLORS, WIDTHS, penSeen, useInk, useInkHistory, type InkTool, type Stroke } from '../../lib/ink'
import './tools.css'

type Paper = 'grid' | 'lines' | 'blank'
interface Page { id: string; strokes: Stroke[] }
interface Store { pages: Page[]; at: number; paper: Paper }
const W = 800 // logical page width: ink stays put when the panel is resized
const mk = (): Page => ({ id: Math.random().toString(36).slice(2, 8), strokes: [] })

export default function Scratchpad(_: WidgetProps) {
  const [store, setStore] = useLocalState<Store>('chem.scratch', { pages: [mk()], at: 0, paper: 'grid' })
  const [tool, setTool] = useLocalState<InkTool>('ink.tool', { kind: 'pen', color: PEN_COLORS[0], w: WIDTHS[1] })
  const page = store.pages[Math.min(store.at, store.pages.length - 1)]
  const setStrokes = useMemo(() => (s: Stroke[]) => setStore((st) => ({ ...st, pages: st.pages.map((p) => (p.id === page.id ? { ...p, strokes: s } : p)) })), [page.id, setStore])
  const hist = useInkHistory(page.strokes, setStrokes)
  const svgRef = useRef<SVGSVGElement>(null)
  const [pen, setPen] = useState(penSeen())
  const toLocal = (cx: number, cy: number): [number, number] => {
    const r = svgRef.current!.getBoundingClientRect()
    const k = W / r.width
    return [(cx - r.left) * k, (cy - r.top) * k]
  }
  const ink = useInk({ setStrokes: hist.change, tool, toLocal, scale: 1 })
  const maxY = page.strokes.reduce((m, s) => { for (let i = 1; i < s.pts.length; i += 3) if (s.pts[i] > m) m = s.pts[i]; return m }, 0)
  const H = Math.max(1100, Math.ceil((maxY + 500) / 100) * 100)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (!svgRef.current?.closest('.sp')?.contains(document.activeElement) && !svgRef.current?.closest('.sp')?.matches(':hover')) return
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) hist.redo(); else hist.undo() }
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [hist])
  const go = (d: number) => setStore((st) => ({ ...st, at: Math.max(0, Math.min(st.pages.length - 1, st.at + d)) }))
  const addPage = () => setStore((st) => ({ ...st, pages: [...st.pages, mk()], at: st.pages.length }))
  const delPage = () => setStore((st) => {
    const pages = st.pages.filter((p) => p.id !== page.id)
    return pages.length ? { ...st, pages, at: Math.min(st.at, pages.length - 1) } : { ...st, pages: [mk()], at: 0 }
  })
  return (
    <div className="sp" tabIndex={-1}>
      <div className="sp-bar">
        <InkPalette tool={tool} setTool={setTool} undo={hist.undo} redo={hist.redo} canUndo={hist.canUndo} canRedo={hist.canRedo} onClear={() => hist.change(() => [])} />
        <span className="grow" />
        <div className="seg">{(['grid', 'lines', 'blank'] as const).map((p) => <button key={p} className={store.paper === p ? 'on' : ''} onClick={() => setStore((st) => ({ ...st, paper: p }))}>{p[0].toUpperCase() + p.slice(1)}</button>)}</div>
        <div className="sp-pages">
          <button className="btn sm ghost" onClick={() => go(-1)} disabled={store.at === 0} aria-label="Previous page">‹</button>
          <span className="muted">{store.at + 1}/{store.pages.length}</span>
          <button className="btn sm ghost" onClick={() => go(1)} disabled={store.at >= store.pages.length - 1} aria-label="Next page">›</button>
          <button className="btn sm" onClick={addPage} title="New page">+ Page</button>
          {store.pages.length > 1 && <button className="btn sm ghost" onClick={delPage} title="Delete this page">Delete</button>}
        </div>
      </div>
      <div className="sp-scroll">
        <svg ref={svgRef} className={'sp-page' + (tool.kind === 'erase' ? ' erase' : '')} viewBox={`0 0 ${W} ${H}`} style={{ aspectRatio: `${W} / ${H}`, touchAction: pen ? 'pan-y pinch-zoom' : 'none' }}
          onPointerDown={(e) => { if (e.pointerType === 'pen' && !pen) setPen(true); ink.onPointerDown(e) }} onPointerMove={ink.onPointerMove} onPointerUp={ink.onPointerUp} onPointerCancel={ink.onPointerUp}>
          <defs>
            <pattern id="sp-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#dfe3ea" strokeWidth="0.8" /></pattern>
            <pattern id="sp-lines" width={W} height="32" patternUnits="userSpaceOnUse"><path d={`M0 31.5H${W}`} stroke="#dbe2ee" strokeWidth="1" /></pattern>
          </defs>
          <rect width={W} height={H} fill="#fff" />
          {store.paper !== 'blank' && <rect width={W} height={H} fill={`url(#sp-${store.paper})`} />}
          {store.paper === 'lines' && <path d={`M64 0V${H}`} stroke="#f4b4b4" strokeWidth="1" />}
          <InkPaths strokes={page.strokes} live={ink.live} />
        </svg>
        <p className="sp-tip muted">{pen ? 'Apple Pencil detected: the Pencil writes, fingers scroll.' : 'Write with Apple Pencil, a mouse or your finger. Once a Pencil is used, fingers scroll instead of drawing.'} Nothing is sent anywhere: ink stays in this browser.</p>
      </div>
    </div>
  )
}
