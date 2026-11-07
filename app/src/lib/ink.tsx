// Pressure-sensitive vector ink for Apple Pencil / stylus / mouse / finger. No recognition, just strokes.
// - Pencil detected → Pencil draws, fingers/palm don't (palm rejection; fingers keep scrolling/panning).
// - Strokes are SVG paths in the host's coordinate space (world units on the Workspace, page px in the Scratchpad).
import { useCallback, useRef, useState, type PointerEvent as RPointerEvent } from 'react'

export type InkKind = 'pen' | 'hl' | 'erase'
export interface Stroke { id: string; kind: 'pen' | 'hl'; color: string; w: number; pts: number[] /* x,y,p triples */ }
export interface InkTool { kind: InkKind; color: string; w: number }

export const PEN_COLORS = ['#1d1d1f', '#0a6cf0', '#e5322d', '#1f8a3c']
export const HL_COLORS = ['#ffd60a', '#64d2ff', '#ff9fd2']
export const WIDTHS = [1.6, 2.8, 5]

let penSeenGlobal = false
/** true once any Apple Pencil / stylus input has been seen this session */
export const penSeen = () => penSeenGlobal

/* ---------- geometry ---------- */
const r1 = (x: number) => Math.round(x * 10) / 10
function smooth(p: number[]): number[] {
  const n = p.length / 3
  if (n < 3) return p
  const o = [...p]
  for (let i = 1; i < n - 1; i++) for (const k of [0, 1]) o[i * 3 + k] = (p[(i - 1) * 3 + k] + 2 * p[i * 3 + k] + p[(i + 1) * 3 + k]) / 4
  return o
}
/** Filled outline of a variable-width pen stroke (pressure → radius), with round caps. */
export function penPath(s: Stroke): string {
  const p = smooth(s.pts)
  const n = p.length / 3
  const rad = (i: number) => (s.w / 2) * (0.35 + 0.9 * Math.min(1, p[i * 3 + 2]))
  if (n === 1) { const r = rad(0); return `M${r1(p[0] - r)},${r1(p[1])}a${r1(r)},${r1(r)} 0 1,0 ${r1(2 * r)},0a${r1(r)},${r1(r)} 0 1,0 ${r1(-2 * r)},0Z` }
  const L: [number, number][] = [], R: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1)
    let dx = p[b * 3] - p[a * 3], dy = p[b * 3 + 1] - p[a * 3 + 1]
    const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len
    const r = rad(i), x = p[i * 3], y = p[i * 3 + 1]
    L.push([x - dy * r, y + dx * r]); R.push([x + dy * r, y - dx * r])
  }
  const curve = (pts: [number, number][]) => {
    let d = ''
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2
      d += `Q${r1(pts[i][0])},${r1(pts[i][1])} ${r1(mx)},${r1(my)}`
    }
    const l = pts[pts.length - 1]; return d + `L${r1(l[0])},${r1(l[1])}`
  }
  const re = rad(n - 1), rs = rad(0)
  const Rr = R.slice().reverse()
  return `M${r1(L[0][0])},${r1(L[0][1])}` + curve(L) + `A${r1(re)},${r1(re)} 0 0,1 ${r1(Rr[0][0])},${r1(Rr[0][1])}` + curve(Rr) + `A${r1(rs)},${r1(rs)} 0 0,1 ${r1(L[0][0])},${r1(L[0][1])}Z`
}
/** Centre line for highlighter strokes (constant width, drawn with stroke). */
export function linePath(s: Stroke): string {
  const p = s.pts
  let d = `M${r1(p[0])},${r1(p[1])}`
  for (let i = 3; i < p.length; i += 3) d += `L${r1(p[i])},${r1(p[i + 1])}`
  return p.length === 3 ? d + `l0.1,0` : d
}
function hits(s: Stroke, x: number, y: number, r: number) {
  const rr = (r + s.w) ** 2
  for (let i = 0; i < s.pts.length; i += 3) if ((s.pts[i] - x) ** 2 + (s.pts[i + 1] - y) ** 2 < rr) return true
  return false
}

/* ---------- rendering ---------- */
export function InkPaths({ strokes, live }: { strokes: Stroke[]; live?: Stroke | null }) {
  const all = live ? [...strokes, live] : strokes
  return (
    <>
      {all.map((s) => s.kind === 'hl'
        ? <path key={s.id} d={linePath(s)} fill="none" stroke={s.color} strokeWidth={s.w * 5} strokeLinecap="round" strokeLinejoin="round" opacity={0.38} style={{ mixBlendMode: 'multiply' }} />
        : <path key={s.id} d={penPath(s)} fill={s.color} />)}
    </>
  )
}

/* ---------- input ---------- */
/**
 * Pointer handlers that turn input into strokes. `toLocal` maps client coords to the ink space; `scale` = ink units per
 * screen px (so the eraser radius and minimum point spacing feel the same at any zoom).
 * Returns `false` from onPointerDown when it chose not to handle the event (e.g. a finger while a Pencil is in use),
 * so the host can pan/scroll instead.
 */
export function useInk({ setStrokes, tool, toLocal, scale = 1, enabled = true, fingers = 'auto' }: {
  setStrokes: (f: (s: Stroke[]) => Stroke[]) => void
  tool: InkTool
  toLocal: (cx: number, cy: number) => [number, number]
  scale?: number
  enabled?: boolean
  /** 'auto' = fingers draw until a Pencil is seen; 'never' = fingers never draw */
  fingers?: 'auto' | 'never'
}) {
  const [live, setLive] = useState<Stroke | null>(null)
  const cur = useRef<{ id: number; s: Stroke | null } | null>(null)
  const raf = useRef(0)
  const accept = (e: RPointerEvent) => {
    if (e.pointerType === 'pen') { penSeenGlobal = true; return true }
    if (e.pointerType === 'touch') return fingers === 'auto' && !penSeenGlobal
    return e.button === 0
  }
  const pt = (e: { clientX: number; clientY: number; pressure: number; pointerType: string }) => {
    const [x, y] = toLocal(e.clientX, e.clientY)
    return [x, y, e.pointerType === 'pen' ? Math.max(0.05, e.pressure || 0.5) : 0.5] as const
  }
  const erase = (x: number, y: number) => setStrokes((a) => { const b = a.filter((s) => !hits(s, x, y, 8 * scale)); return b.length === a.length ? a : b })

  const onPointerDown = useCallback((e: RPointerEvent<Element>): boolean => {
    if (!enabled || !accept(e) || cur.current) return false
    e.preventDefault(); e.stopPropagation()
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId) } catch { /* ignore */ }
    const [x, y, p] = pt(e)
    if (tool.kind === 'erase') { cur.current = { id: e.pointerId, s: null }; erase(x, y); return true }
    const s: Stroke = { id: Math.random().toString(36).slice(2, 9), kind: tool.kind, color: tool.color, w: tool.w, pts: [x, y, p] }
    cur.current = { id: e.pointerId, s }
    setLive({ ...s })
    return true
  }, [enabled, tool, toLocal, scale]) // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerMove = useCallback((e: RPointerEvent<Element>) => {
    const c = cur.current
    if (!c || c.id !== e.pointerId) return
    e.preventDefault(); e.stopPropagation()
    const evs = (e.nativeEvent as PointerEvent).getCoalescedEvents?.() ?? [e.nativeEvent]
    for (const ev of evs.length ? evs : [e.nativeEvent]) {
      const [x, y, p] = pt(ev)
      if (!c.s) { erase(x, y); continue }
      const q = c.s.pts, n = q.length
      const d = Math.hypot(q[n - 3] - x, q[n - 2] - y)
      if (d < 0.6 * scale) continue
      // no real pressure (mouse, trackpad, Sidecar Pencil, finger): fake it from speed, so fast strokes thin out like ink
      const pp = ev.pointerType === 'pen' && ev.pressure > 0 ? p : Math.max(0.25, Math.min(0.85, 0.85 - (d / scale) / 45)) * 0.5 + q[n - 1] * 0.5
      q.push(x, y, pp)
    }
    if (c.s && !raf.current) raf.current = requestAnimationFrame(() => { raf.current = 0; if (cur.current?.s) setLive({ ...cur.current.s }) })
  }, [toLocal, scale]) // eslint-disable-line react-hooks/exhaustive-deps

  const onPointerUp = useCallback((e: RPointerEvent<Element>) => {
    const c = cur.current
    if (!c || c.id !== e.pointerId) return
    cur.current = null
    cancelAnimationFrame(raf.current); raf.current = 0
    setLive(null)
    if (c.s) { const s = c.s; s.pts = s.pts.map((v, i) => (i % 3 === 2 ? Math.round(v * 100) / 100 : r1(v))); setStrokes((a) => [...a, s]) }
  }, [setStrokes])

  return { live, onPointerDown, onPointerMove, onPointerUp, drawing: () => !!cur.current }
}

/* ---------- undo/redo over a stroke list ---------- */
export function useInkHistory(strokes: Stroke[], set: (s: Stroke[]) => void) {
  const past = useRef<Stroke[][]>([]), future = useRef<Stroke[][]>([])
  const latest = useRef(strokes); latest.current = strokes
  const [, bump] = useState(0)
  // reads the latest list through a ref so several changes in one frame (eraser drags) compose correctly
  const change = useCallback((f: (s: Stroke[]) => Stroke[]) => {
    const cur = latest.current, next = f(cur)
    if (next === cur) return
    past.current = [...past.current.slice(-80), cur]; future.current = []
    latest.current = next; set(next); bump((x) => x + 1)
  }, [set])
  const undo = useCallback(() => { const p = past.current.pop(); if (!p) return; future.current.push(latest.current); latest.current = p; set(p); bump((x) => x + 1) }, [set])
  const redo = useCallback(() => { const f = future.current.pop(); if (!f) return; past.current.push(latest.current); latest.current = f; set(f); bump((x) => x + 1) }, [set])
  return { change, undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0 }
}

/* ---------- palette ---------- */
export function InkPalette({ tool, setTool, undo, redo, canUndo, canRedo, onClear, vertical, extra }: {
  tool: InkTool; setTool: (t: InkTool) => void; undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean; onClear: () => void; vertical?: boolean; extra?: React.ReactNode
}) {
  const [confirm, setConfirm] = useState(false)
  const pick = (kind: InkKind, color?: string) => setTool({ kind, color: color ?? tool.color, w: tool.w })
  return (
    <div className={'ink-pal' + (vertical ? ' vert' : '')} onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      {PEN_COLORS.map((c) => (
        <button key={c} className={'ink-sw' + (tool.kind === 'pen' && tool.color === c ? ' on' : '')} onClick={() => pick('pen', c)} title="Pen" aria-label={`Pen ${c}`}><i style={{ background: c }} /></button>
      ))}
      <span className="ink-sep" />
      {HL_COLORS.map((c) => (
        <button key={c} className={'ink-sw hl' + (tool.kind === 'hl' && tool.color === c ? ' on' : '')} onClick={() => pick('hl', c)} title="Highlighter" aria-label={`Highlighter ${c}`}><i style={{ background: c }} /></button>
      ))}
      <button className={'ink-b' + (tool.kind === 'erase' ? ' on' : '')} onClick={() => pick('erase')} title="Eraser (removes whole strokes)" aria-label="Eraser">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m7 20-3.5-3.5a2 2 0 0 1 0-2.8L13.7 3.5a2 2 0 0 1 2.8 0l4 4a2 2 0 0 1 0 2.8L11 20H7ZM20 20h-9M8.5 9 15 15.5" /></svg>
      </button>
      <span className="ink-sep" />
      {WIDTHS.map((w) => (
        <button key={w} className={'ink-b' + (tool.w === w ? ' on' : '')} onClick={() => setTool({ ...tool, w, kind: tool.kind === 'erase' ? 'pen' : tool.kind })} title={`Width ${w}`} aria-label={`Width ${w}`}>
          <i className="ink-dot" style={{ width: w * 2.4 + 2, height: w * 2.4 + 2 }} />
        </button>
      ))}
      <span className="ink-sep" />
      <button className="ink-b" onClick={undo} disabled={!canUndo} title="Undo" aria-label="Undo">↶</button>
      <button className="ink-b" onClick={redo} disabled={!canRedo} title="Redo" aria-label="Redo">↷</button>
      {confirm
        ? <><button className="ink-b danger" onClick={() => { onClear(); setConfirm(false) }}>Clear?</button><button className="ink-b" onClick={() => setConfirm(false)} aria-label="Cancel">✕</button></>
        : <button className="ink-b" onClick={() => setConfirm(true)} title="Clear all ink (undoable)" aria-label="Clear all ink">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4.5 7h15M9.5 7V5h5v2M6.5 7l.8 12.2a1 1 0 0 0 1 .8h7.4a1 1 0 0 0 1-.8L17.5 7" /></svg>
        </button>}
      {extra}
    </div>
  )
}
