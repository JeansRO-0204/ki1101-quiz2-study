// Workspace: a free-form pannable/zoomable canvas of window-like widget panels. Owned by the workspace agent.
import { Component, Suspense, memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { WIDGET, WIDGETS } from '../registry'
import { LECTURES } from '../types'
import { AppIcon, IconChevronDown, IconFit, IconLayers, IconMagnet, IconMaximize, IconMinus, IconPanels, IconPlus, IconReset, IconRestore, IconX } from '../lib/icons'
import './workspace.css'

/* ---------- types & persistence ---------- */
interface Panel { id: string; widgetId: string; x: number; y: number; w: number; h: number; z: number; min?: boolean; max?: boolean }
interface View { x: number; y: number; k: number }
interface Layout { panels: Panel[]; view: View; snap: boolean }
interface SavedLayout { name: string; panels: Pick<Panel, 'widgetId' | 'x' | 'y' | 'w' | 'h' | 'min'>[] }

const MIN_K = 0.2, MAX_K = 2.5, GRID = 8, TITLE_H = 36, MIN_W = 220, MIN_H = 120
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const uid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const snapv = (v: number, on: boolean) => (on ? Math.round(v / GRID) * GRID : v)

const PRESETS: { name: string; blurb: string; ids: string[] }[] = [
  { name: 'Atoms desk', blurb: 'Periodic table, orbital boxes, H atom, equations', ids: ['ptable', 'econfig', 'hatom', 'equations'] },
  { name: 'Bonding desk', blurb: 'Lewis, VSEPR, periodic table, notepad', ids: ['lewis', 'vsepr', 'ptable', 'notepad'] },
  { name: 'MO desk', blurb: 'MO diagram, notepad, equations', ids: ['mo', 'notepad', 'equations'] },
]

function readJSON<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); if (s != null) return JSON.parse(s) as T } catch { /* ignore */ }
  return fallback
}
function sizeOf(widgetId: string) { return WIDGET.get(widgetId)?.size ?? { w: 520, h: 420 } }

function loadInitial(): Layout {
  const saved = readJSON<Partial<Layout>>('ws.layout', {})
  const panels = Array.isArray(saved.panels) ? saved.panels.filter((p) => p && typeof p.widgetId === 'string') : []
  const v = saved.view
  const view: View = v && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.k) ? { x: v.x, y: v.y, k: clamp(v.k, MIN_K, MAX_K) } : { x: 0, y: 0, k: 1 }
  const layout: Layout = { panels, view, snap: !!saved.snap }
  const pending = readJSON<unknown>('ws.pending', [])
  if (Array.isArray(pending) && pending.length) {
    // container size isn't known yet: guess from the window (top nav is 52px)
    const W = window.innerWidth, H = window.innerHeight - 52
    const cx = (W / 2 - view.x) / view.k, cy = (H / 2 - view.y) / view.k
    let z = Math.max(0, ...panels.map((p) => p.z))
    const added: Panel[] = []
    pending.forEach((wid, i) => {
      if (typeof wid !== 'string' || !WIDGET.has(wid)) return
      const s = sizeOf(wid)
      const left = -view.x / view.k + 12, top = -view.y / view.k + 12
      added.push({ id: uid() + i, widgetId: wid, w: s.w, h: s.h, z: ++z,
        x: Math.round(Math.max(left, cx - s.w / 2) + i * 28), y: Math.round(Math.max(top, cy - s.h / 2) + i * 28) })
    })
    layout.panels = [...panels, ...added]
  }
  return layout
}

/** Run `fn` at most once per animation frame with the latest argument. */
function rafThrottle<T>(fn: (a: T) => void) {
  let pending = false, last: T
  return (a: T) => { last = a; if (!pending) { pending = true; requestAnimationFrame(() => { pending = false; fn(last) }) } }
}
/** Window-level pointer drag. Calls onMove(dx, dy) in screen px relative to the start. */
function beginDrag(e: { clientX: number; clientY: number }, onMove: (dx: number, dy: number) => void, onEnd?: () => void, cursor?: string) {
  const sx = e.clientX, sy = e.clientY
  const move = rafThrottle<PointerEvent>((ev) => onMove(ev.clientX - sx, ev.clientY - sy))
  const mv = (ev: PointerEvent) => move(ev)
  const prev = document.body.style.cursor
  if (cursor) document.body.style.cursor = cursor
  document.body.classList.add('ws-dragging')
  const up = () => {
    window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up)
    document.body.style.cursor = prev; document.body.classList.remove('ws-dragging'); onEnd?.()
  }
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
}

class Boundary extends Component<{ children: ReactNode }, { err: string | null }> {
  state = { err: null as string | null }
  static getDerivedStateFromError(e: unknown) { return { err: String((e as Error)?.message ?? e) } }
  render() {
    if (this.state.err) return <div className="ws-err"><b>This widget crashed.</b><code>{this.state.err}</code><button className="btn sm" onClick={() => this.setState({ err: null })}>Retry</button></div>
    return this.props.children
  }
}

const PanelBody = memo(function PanelBody({ widgetId }: { widgetId: string }) {
  const def = WIDGET.get(widgetId)
  if (!def) return <div className="ws-err"><b>Unknown widget</b><code>{widgetId}</code></div>
  const C = def.component
  return <Boundary><Suspense fallback={<div className="ws-loading"><i /><i /><i /></div>}><C compact /></Suspense></Boundary>
})

const lectureColor = (l: string) => LECTURES.find((x) => x.id === l)?.color ?? '#475569'

/* ---------- panel window ---------- */
interface PanelProps {
  p: Panel; k: number; vw: number; vh: number; vx: number; vy: number; snap: boolean; top: boolean
  onFocus: (id: string) => void; onChange: (id: string, patch: Partial<Panel>) => void; onClose: (id: string) => void
}
const PanelWin = memo(function PanelWin({ p, k, vw, vh, vx, vy, snap, top, onFocus, onChange, onClose }: PanelProps) {
  const def = WIDGET.get(p.widgetId)
  const color = def ? lectureColor(def.lecture) : '#94a3b8'
  const geo = p.max ? { x: -vx / k, y: -vy / k, w: vw / k, h: vh / k } : { x: p.x, y: p.y, w: p.w, h: p.min ? TITLE_H : p.h }

  const startMove = (e: React.PointerEvent) => {
    if (e.button !== 0 || p.max) return
    e.preventDefault()
    const { x, y } = p
    beginDrag(e, (dx, dy) => onChange(p.id, { x: snapv(x + dx / k, snap), y: snapv(y + dy / k, snap) }), undefined, 'grabbing')
  }
  const startResize = (dir: string) => (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    const { x, y, w, h } = p
    beginDrag(e, (dx, dy) => {
      let nx = x, ny = y, nw = w, nh = h
      const ddx = dx / k, ddy = dy / k
      if (dir.includes('e')) nw = Math.max(MIN_W, w + ddx)
      if (dir.includes('s')) nh = Math.max(MIN_H, h + ddy)
      if (dir.includes('w')) { nw = Math.max(MIN_W, w - ddx); nx = x + (w - nw) }
      if (dir.includes('n')) { nh = Math.max(MIN_H, h - ddy); ny = y + (h - nh) }
      onChange(p.id, { x: snapv(nx, snap), y: snapv(ny, snap), w: snapv(nw, snap), h: snapv(nh, snap) })
    }, undefined, dir + '-resize')
  }
  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <div className={'ws-panel' + (p.max ? ' max' : '') + (p.min ? ' min' : '') + (top ? ' top' : '')}
      style={{ width: geo.w, height: geo.h, transform: `translate(${geo.x}px, ${geo.y}px)`, zIndex: p.max ? 100000 : p.z, ['--pc' as string]: color }}
      onPointerDownCapture={() => onFocus(p.id)}>
      <div className="ws-title" onPointerDown={startMove} onDoubleClick={() => onChange(p.id, { max: !p.max, min: false })}>
        <div className="ws-lights" onPointerDown={stop} onDoubleClick={stop}>
          <button className="tl x" title="Close" aria-label="Close" onClick={() => onClose(p.id)}><IconX size={9} style={{ strokeWidth: 3.4 }} /></button>
          <button className="tl m" title={p.min ? 'Restore' : 'Minimise'} aria-label="Minimise" onClick={() => onChange(p.id, { min: !p.min, max: false })}><IconMinus size={9} style={{ strokeWidth: 3.4 }} /></button>
          <button className="tl z" title={p.max ? 'Restore size' : 'Maximise'} aria-label="Maximise" onClick={() => onChange(p.id, { max: !p.max, min: false })}>{p.max ? <IconRestore size={9} style={{ strokeWidth: 3 }} /> : <IconMaximize size={9} style={{ strokeWidth: 3 }} />}</button>
        </div>
        <span className="ws-dot" />
        <span className="ws-ttl">{def?.title ?? p.widgetId}</span>
      </div>
      <div className="ws-body" style={p.min ? { display: 'none' } : undefined} onPointerDown={stop} onWheel={stop} onContextMenu={stop} onDoubleClick={stop}>
        <PanelBody widgetId={p.widgetId} />
      </div>
      {!p.min && !p.max && (
        <>
          {['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((d) => <div key={d} className={'ws-rz ws-rz-' + d} onPointerDown={startResize(d)} />)}
          <svg className="ws-grip" width="10" height="10" viewBox="0 0 10 10"><path d="M9 3L3 9M9 6.5L6.5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
        </>
      )}
    </div>
  )
})

/* ---------- launcher ---------- */
function Launcher({ onPick, onClose }: { onPick: (id: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  const groups = useMemo(() => {
    const t = q.trim().toLowerCase()
    const order: (string)[] = ['L7', 'L8', 'L9', 'L10', 'tool']
    return order.map((g) => ({
      g,
      title: g === 'tool' ? 'Tools' : `${g} · ${LECTURES.find((l) => l.id === g)?.title}`,
      items: WIDGETS.filter((w) => w.lecture === g && (!t || (w.title + ' ' + w.blurb + ' ' + w.id).toLowerCase().includes(t))),
    })).filter((x) => x.items.length)
  }, [q])
  const first = groups[0]?.items[0]
  return (
    <div className="ws-modal" onPointerDown={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose() }} onWheel={(e) => e.stopPropagation()}>
      <div className="ws-launcher" role="dialog" aria-label="Add panel">
        <div className="ws-l-head">
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search widgets…  (Enter adds the first, Esc closes)"
            onKeyDown={(e) => { if (e.key === 'Enter' && first) onPick(first.id) }} />
          <button className="btn ghost sm" onClick={onClose}>Esc</button>
        </div>
        <div className="ws-l-list">
          {groups.map((g) => (
            <section key={g.g}>
              <h4><i style={{ background: lectureColor(g.g) }} />{g.title}</h4>
              <div className="ws-l-grid">
                {g.items.map((w) => (
                  <button key={w.id} className="ws-l-item" style={{ ['--pc' as string]: lectureColor(w.lecture) }} onClick={() => onPick(w.id)}>
                    <b>{w.title}</b><span>{w.blurb}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
          {!groups.length && <p className="muted ws-l-none">No widget matches “{q}”.</p>}
        </div>
      </div>
    </div>
  )
}

/* ---------- main ---------- */
export default function Workspace() {
  const [init] = useState(loadInitial)
  const [panels, setPanels] = useState<Panel[]>(init.panels)
  const [view, setView] = useState<View>(init.view)
  const [snap, setSnap] = useState(init.snap)
  const [launch, setLaunch] = useState<{ at?: { x: number; y: number } } | null>(null)
  const [menu, setMenu] = useState(false)
  const [saved, setSaved] = useState<SavedLayout[]>(() => readJSON<SavedLayout[]>('ws.saved', []))
  const [saveName, setSaveName] = useState('')
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight - 52 })
  const boxRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef(view); viewRef.current = view
  const sizeRef = useRef(size); sizeRef.current = size
  const panelsRef = useRef(panels); panelsRef.current = panels

  useEffect(() => { try { localStorage.removeItem('ws.pending') } catch { /* ignore */ } }, [])
  useEffect(() => {
    const t = setTimeout(() => { try { localStorage.setItem('ws.layout', JSON.stringify({ panels, view, snap })) } catch { /* ignore */ } }, 250)
    return () => clearTimeout(t)
  }, [panels, view, snap])
  useEffect(() => { try { localStorage.setItem('ws.saved', JSON.stringify(saved)) } catch { /* ignore */ } }, [saved])

  useEffect(() => {
    const el = boxRef.current; if (!el) return
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el); setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  /* zoom helpers */
  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setView((v) => {
      const k = clamp(v.k * factor, MIN_K, MAX_K)
      const r = k / v.k
      return { k, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r }
    })
  }, [])
  const zoomCentre = (f: number) => zoomAt(f, sizeRef.current.w / 2, sizeRef.current.h / 2)

  /* wheel = zoom toward cursor (native listener so we can preventDefault) */
  useEffect(() => {
    const el = boxRef.current; if (!el) return
    const onWheel = (e: WheelEvent) => {
      const t = e.target as Element
      if (t.closest('.ws-body') || t.closest('.ws-modal') || t.closest('.ws-bar')) return
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
      zoomAt(Math.exp(-d * (e.ctrlKey ? 0.01 : 0.0016)), e.clientX - r.left, e.clientY - r.top)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  /* pan (1 pointer) / pinch (2 pointers) on empty background */
  const ptrs = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<null | { kind: 'pan'; sx: number; sy: number; v: View } | { kind: 'pinch'; d0: number; v: View; mx: number; my: number }>(null)
  const startGesture = () => {
    const pts = [...ptrs.current.values()]
    const v = viewRef.current
    if (pts.length === 1) gesture.current = { kind: 'pan', sx: pts[0].x, sy: pts[0].y, v }
    else if (pts.length >= 2) {
      const [a, b] = pts
      gesture.current = { kind: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, v, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }
    } else gesture.current = null
  }
  const onBgDown = (e: React.PointerEvent) => {
    const t = e.target as Element
    if (t.closest('.ws-panel') || t.closest('.ws-bar') || t.closest('.ws-modal') || t.closest('.ws-menu')) return
    if (e.button !== 0 && e.pointerType === 'mouse') return
    setMenu(false)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    startGesture()
    boxRef.current?.classList.add('panning')
  }
  const onBgMove = (e: React.PointerEvent) => {
    if (!ptrs.current.has(e.pointerId)) return
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current; if (!g) return
    if (g.kind === 'pan') setView({ ...g.v, x: g.v.x + e.clientX - g.sx, y: g.v.y + e.clientY - g.sy })
    else {
      const pts = [...ptrs.current.values()]; if (pts.length < 2) return
      const [a, b] = pts
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
      const r0 = boxRef.current!.getBoundingClientRect()
      const k = clamp(g.v.k * d / g.d0, MIN_K, MAX_K)
      // keep the world point that was under the initial midpoint under the current midpoint
      const wx = (g.mx - r0.left - g.v.x) / g.v.k, wy = (g.my - r0.top - g.v.y) / g.v.k
      setView({ k, x: mx - r0.left - wx * k, y: my - r0.top - wy * k })
    }
  }
  const onBgUp = (e: React.PointerEvent) => {
    ptrs.current.delete(e.pointerId)
    startGesture()
    if (!ptrs.current.size) boxRef.current?.classList.remove('panning')
  }

  /* world coordinates helpers */
  const toWorld = (cx: number, cy: number) => { const v = viewRef.current; return { x: (cx - v.x) / v.k, y: (cy - v.y) / v.k } }
  const centreWorld = () => toWorld(sizeRef.current.w / 2, sizeRef.current.h / 2)

  /* panel ops */
  const nextZ = () => Math.max(0, ...panelsRef.current.map((p) => p.z)) + 1
  const addPanel = useCallback((widgetId: string, at?: { x: number; y: number }) => {
    const s = sizeOf(widgetId)
    const c = at ?? centreWorld()
    const n = panelsRef.current.length % 6
    setPanels((ps) => {
      const z = Math.max(0, ...ps.map((p) => p.z)) + 1
      const x = snapv(Math.round(c.x - s.w / 2 + (at ? 0 : n * 24)), snap), y = snapv(Math.round(c.y - s.h / 2 + (at ? 0 : n * 24)), snap)
      return [...ps, { id: uid(), widgetId, x, y, w: s.w, h: s.h, z }]
    })
    setLaunch(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap])
  const onFocus = useCallback((id: string) => {
    setPanels((ps) => {
      const top = Math.max(...ps.map((p) => p.z))
      const p = ps.find((x) => x.id === id)
      if (!p || (p.z === top && ps.filter((x) => x.z === top).length === 1)) return ps
      return ps.map((x) => (x.id === id ? { ...x, z: top + 1 } : x))
    })
  }, [])
  const onChange = useCallback((id: string, patch: Partial<Panel>) => setPanels((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p))), [])
  const onClose = useCallback((id: string) => setPanels((ps) => ps.filter((p) => p.id !== id)), [])
  void nextZ

  /* view fitting & layouts */
  const fit = useCallback((ps: Pick<Panel, 'x' | 'y' | 'w' | 'h'>[]) => {
    if (!ps.length) { setView({ x: 0, y: 0, k: 1 }); return }
    const x0 = Math.min(...ps.map((p) => p.x)), y0 = Math.min(...ps.map((p) => p.y))
    const x1 = Math.max(...ps.map((p) => p.x + p.w)), y1 = Math.max(...ps.map((p) => p.y + p.h))
    const { w, h } = sizeRef.current, pad = 40
    const k = clamp(Math.min((w - pad * 2) / (x1 - x0), (h - pad * 2) / (y1 - y0), 1), MIN_K, MAX_K)
    setView({ k, x: (w - (x1 - x0) * k) / 2 - x0 * k, y: (h - (y1 - y0) * k) / 2 - y0 * k })
  }, [])
  const applyLayout = (items: Pick<Panel, 'widgetId' | 'x' | 'y' | 'w' | 'h' | 'min'>[]) => {
    const ps: Panel[] = items.filter((i) => WIDGET.has(i.widgetId)).map((i, n) => ({ id: uid() + n, ...i, z: n + 1 }))
    setPanels(ps); fit(ps.filter((p) => !p.min)); setMenu(false)
  }
  const applyPreset = (ids: string[]) => {
    const avail = ids.filter((i) => WIDGET.has(i))
    // simple row packing in world space
    const maxRow = 1500, gap = 20
    let x = 0, y = 0, rowH = 0
    const items = avail.map((widgetId) => {
      const s = sizeOf(widgetId)
      if (x > 0 && x + s.w > maxRow) { x = 0; y += rowH + gap; rowH = 0 }
      const it = { widgetId, x, y, w: s.w, h: s.h }
      x += s.w + gap; rowH = Math.max(rowH, s.h)
      return it
    })
    applyLayout(items)
  }
  const saveCurrent = () => {
    const name = saveName.trim(); if (!name) return
    const item: SavedLayout = { name, panels: panels.map(({ widgetId, x, y, w, h, min }) => ({ widgetId, x, y, w, h, min })) }
    setSaved((s) => [...s.filter((x) => x.name !== name), item]); setSaveName('')
  }

  /* keyboard */
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLaunch(null); setMenu(false); return }
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return
      if ((e.key === 'a' || e.key === 'A') && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); setLaunch({}) }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const openAt = (e: React.MouseEvent) => {
    const t = e.target as Element
    if (t.closest('.ws-panel') || t.closest('.ws-bar') || t.closest('.ws-modal') || t.closest('.ws-menu')) return
    e.preventDefault()
    const r = boxRef.current!.getBoundingClientRect()
    setLaunch({ at: toWorld(e.clientX - r.left, e.clientY - r.top) })
  }

  const topZ = Math.max(0, ...panels.map((p) => p.z))
  const presets = PRESETS.map((p) => ({ ...p, have: p.ids.filter((i) => WIDGET.has(i)) })).filter((p) => p.have.length > 0)

  return (
    <div className="ws" ref={boxRef} onPointerDown={onBgDown} onPointerMove={onBgMove} onPointerUp={onBgUp} onPointerCancel={onBgUp}
      onDoubleClick={openAt} onContextMenu={openAt}
      style={{ backgroundSize: `${24 * view.k}px ${24 * view.k}px`, backgroundPosition: `${view.x}px ${view.y}px` }}>
      <div className="ws-world" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}>
        {panels.map((p) => (
          <PanelWin key={p.id} p={p} k={view.k} vw={size.w} vh={size.h} vx={p.max ? view.x : 0} vy={p.max ? view.y : 0} snap={snap} top={p.z === topZ}
            onFocus={onFocus} onChange={onChange} onClose={onClose} />
        ))}
      </div>

      {!panels.length && (
        <div className="ws-empty">
          <div className="ws-empty-card">
            <AppIcon size={64} tint="#5e5ce6"><IconPanels size={34} /></AppIcon>
            <b>Your desk is empty</b>
            <span>Double-click the canvas or press <kbd>A</kbd> to add a panel</span>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn primary" onClick={() => setLaunch({})}>Add panel</button>
              {presets.map((p) => <button key={p.name} className="btn" onClick={() => applyPreset(p.ids)} title={p.blurb}>{p.name}</button>)}
            </div>
          </div>
        </div>
      )}

      <div className="ws-bar" onDoubleClick={(e) => e.stopPropagation()}>
        <button className="btn primary sm" onClick={() => setLaunch({})} title="Add panel (A)"><IconPlus size={14} style={{ strokeWidth: 2.4 }} />Add panel</button>
        <div className="ws-menu-wrap">
          <button className={'btn sm' + (menu ? ' on' : '')} onClick={() => setMenu((m) => !m)}><IconLayers size={14} />Layouts<IconChevronDown size={11} style={{ strokeWidth: 2.4 }} /></button>
          {menu && (
            <div className="ws-menu" onPointerDown={(e) => e.stopPropagation()}>
              <h5>Presets</h5>
              {presets.map((p) => (
                <button key={p.name} className="ws-menu-item" onClick={() => applyPreset(p.ids)}>
                  <b>{p.name}</b><span>{p.have.map((i) => WIDGET.get(i)!.title).join(' · ')}{p.have.length < p.ids.length ? ' (some not available yet)' : ''}</span>
                </button>
              ))}
              {saved.length > 0 && <h5>My layouts</h5>}
              {saved.map((s) => (
                <div key={s.name} className="ws-menu-item row2">
                  <button onClick={() => applyLayout(s.panels)}><b>{s.name}</b><span>{s.panels.length} panels</span></button>
                  <button className="del" title="Delete layout" onClick={() => setSaved((a) => a.filter((x) => x.name !== s.name))}><IconX size={14} /></button>
                </div>
              ))}
              <h5>Save current</h5>
              <div className="ws-save">
                <input value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Layout name" onKeyDown={(e) => { if (e.key === 'Enter') saveCurrent() }} />
                <button className="btn sm" onClick={saveCurrent} disabled={!saveName.trim() || !panels.length}>Save</button>
              </div>
              <button className="ws-menu-item danger" disabled={!panels.length} onClick={() => { setPanels([]); setMenu(false) }}><b>Clear desk</b><span>Close all panels</span></button>
            </div>
          )}
        </div>
        <span className="ws-sep" />
        <button className={'btn sm' + (snap ? ' on' : '')} onClick={() => setSnap((s) => !s)} title="Snap panels to an 8 px grid"><IconMagnet size={14} />Snap</button>
        <span className="ws-sep" />
        <button className="btn sm ico" onClick={() => zoomCentre(1 / 1.2)} title="Zoom out" aria-label="Zoom out"><IconMinus size={14} /></button>
        <button className="btn sm ws-zoom" onClick={() => setView((v) => ({ ...v, k: 1 }))} title="Zoom to 100%">{Math.round(view.k * 100)}%</button>
        <button className="btn sm ico" onClick={() => zoomCentre(1.2)} title="Zoom in" aria-label="Zoom in"><IconPlus size={14} /></button>
        <button className="btn sm" onClick={() => fit(panels.filter((p) => !p.min))} disabled={!panels.length} title="Fit all panels in view"><IconFit size={14} />Fit</button>
        <button className="btn sm" onClick={() => setView({ x: 0, y: 0, k: 1 })} title="Reset view"><IconReset size={14} />Reset view</button>
      </div>
      {launch && <Launcher onPick={(id) => addPanel(id, launch.at)} onClose={() => setLaunch(null)} />}
    </div>
  )
}
