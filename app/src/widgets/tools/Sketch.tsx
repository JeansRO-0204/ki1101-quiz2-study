import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalState } from '../../lib/kit'
import type { WidgetProps } from '../../types'
import './tools.css'

type Pt = [number, number, number] // x, y, pressure (1 = no pressure info)
type Item =
  | { k: 's'; c: string; w: number; e?: boolean; p: Pt[] }
  | { k: 't'; s: string; x: number; y: number; c: string; r: number }
  | { k: 'b'; n: 1 | 2 | 3; x: number; y: number; c: string; r: number }
  | { k: 'd'; n: 1 | 2; x: number; y: number; c: string; r: number }
  | { k: 'x' }

const COLORS = ['#18202c', '#2563eb', '#dc2626', '#15803d', '#9333ea', '#d97706']
const ELEMS = ['H', 'C', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br', 'I', 'B', 'Be', 'Xe', 'Al', 'Si', 'Na', 'Mg']
const MARKS = ['+', '−', 'δ+', 'δ−', '→', '⇌', '²⁻', '⁻', '⁺']
type Tool = 'pen' | 'eraser' | { stamp: string }
const BOND_LEN = 42

function drawItem(ctx: CanvasRenderingContext2D, it: Item) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  if (it.k === 's') {
    const col = it.e ? '#ffffff' : it.c
    const wOf = (p: Pt) => (it.e ? it.w * 3 : it.w) * (p[2] === 1 ? 1 : 0.35 + p[2] * 1.3)
    ctx.strokeStyle = col; ctx.fillStyle = col
    const P = it.p
    if (P.length === 1) { ctx.beginPath(); ctx.arc(P[0][0], P[0][1], wOf(P[0]) / 2, 0, Math.PI * 2); ctx.fill(); return }
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], n = P[i + 1]
      const sx = i === 1 ? a[0] : (a[0] + b[0]) / 2, sy = i === 1 ? a[1] : (a[1] + b[1]) / 2
      const ex = n ? (b[0] + n[0]) / 2 : b[0], ey = n ? (b[1] + n[1]) / 2 : b[1]
      ctx.lineWidth = wOf(b)
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(b[0], b[1], ex, ey); ctx.stroke()
    }
  } else if (it.k === 't') {
    ctx.fillStyle = it.c; ctx.font = '600 26px -apple-system, "Inter", system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(it.s, it.x, it.y + 1)
  } else if (it.k === 'b') {
    ctx.strokeStyle = it.c; ctx.lineWidth = 2.6
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.r)
    const gap = 6, off = ((it.n - 1) * gap) / 2
    for (let i = 0; i < it.n; i++) { const y = i * gap - off; ctx.beginPath(); ctx.moveTo(-BOND_LEN / 2, y); ctx.lineTo(BOND_LEN / 2, y); ctx.stroke() }
    ctx.restore()
  } else if (it.k === 'd') {
    ctx.fillStyle = it.c
    ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.r)
    const xs = it.n === 1 ? [0] : [-5, 5]
    xs.forEach((x) => { ctx.beginPath(); ctx.arc(x, 0, 3, 0, Math.PI * 2); ctx.fill() })
    ctx.restore()
  }
}

export default function Sketch({ compact }: WidgetProps) {
  const [items, setItems] = useLocalState<Item[]>('tools.sketch', [])
  const [redo, setRedo] = useState<Item[]>([])
  const [color, setColor] = useLocalState<string>('tools.sketch.color', COLORS[0])
  const [width, setWidth] = useLocalState<number>('tools.sketch.w', 3)
  const [tool, setTool] = useState<Tool>('pen')
  const [rot, setRot] = useState(0) // quarter-steps of 45°
  const wrap = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)
  const live = useRef<Extract<Item, { k: 's' }> | null>(null)
  const itemsRef = useRef(items); itemsRef.current = items

  const redraw = useCallback(() => {
    const c = cv.current; if (!c) return
    const ctx = c.getContext('2d')!
    const dpr = c.width / (c.clientWidth || 1)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.clientWidth, c.clientHeight)
    let from = 0
    itemsRef.current.forEach((it, i) => { if (it.k === 'x') from = i + 1 })
    for (let i = from; i < itemsRef.current.length; i++) drawItem(ctx, itemsRef.current[i])
  }, [])

  useEffect(() => {
    const w = wrap.current, c = cv.current; if (!w || !c) return
    const fit = () => {
      const dpr = window.devicePixelRatio || 1
      c.width = Math.max(1, Math.round(w.clientWidth * dpr)); c.height = Math.max(1, Math.round(w.clientHeight * dpr))
      redraw()
    }
    const ro = new ResizeObserver(fit); ro.observe(w); fit()
    return () => ro.disconnect()
  }, [redraw])
  useEffect(() => { redraw() }, [items, redraw])

  const commit = (it: Item) => { setItems((a) => [...a, it].slice(-3000)); setRedo([]) }
  const xy = (e: React.PointerEvent): Pt => {
    const r = cv.current!.getBoundingClientRect()
    // r is in scaled (transformed) px if the panel is zoomed; convert back to CSS px of the canvas
    const sx = cv.current!.clientWidth / r.width, sy = cv.current!.clientHeight / r.height
    return [(e.clientX - r.left) * sx, (e.clientY - r.top) * sy, e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 1]
  }

  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const p = xy(e)
    if (typeof tool === 'object') {
      const s = tool.stamp, r = (rot * Math.PI) / 4
      if (s === '-') commit({ k: 'b', n: 1, x: p[0], y: p[1], c: color, r })
      else if (s === '=') commit({ k: 'b', n: 2, x: p[0], y: p[1], c: color, r })
      else if (s === '≡') commit({ k: 'b', n: 3, x: p[0], y: p[1], c: color, r })
      else if (s === '•') commit({ k: 'd', n: 1, x: p[0], y: p[1], c: color, r })
      else if (s === '••') commit({ k: 'd', n: 2, x: p[0], y: p[1], c: color, r })
      else commit({ k: 't', s, x: p[0], y: p[1], c: color, r: 0 })
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    const st: Extract<Item, { k: 's' }> = { k: 's', c: color, w: width, e: tool === 'eraser', p: [p] }
    live.current = st
    const ctx = cv.current!.getContext('2d')!
    const dpr = cv.current!.width / cv.current!.clientWidth
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawItem(ctx, st)
  }
  const move = (e: React.PointerEvent) => {
    const st = live.current; if (!st) return
    const evs = (e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent])
    const ctx = cv.current!.getContext('2d')!
    const dpr = cv.current!.width / cv.current!.clientWidth
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    for (const ev of evs) {
      const r = cv.current!.getBoundingClientRect()
      const sx = cv.current!.clientWidth / r.width, sy = cv.current!.clientHeight / r.height
      st.p.push([(ev.clientX - r.left) * sx, (ev.clientY - r.top) * sy, ev.pointerType === 'pen' && ev.pressure > 0 ? ev.pressure : 1])
      const n = st.p.length
      if (n >= 2) drawItem(ctx, { ...st, p: st.p.slice(Math.max(0, n - 3)) }) // draw only the newest segment(s)
    }
  }
  const up = () => {
    const st = live.current; live.current = null
    if (st) commit(st)
  }

  const undo = () => setItems((a) => { if (!a.length) return a; setRedo((r) => [...r, a[a.length - 1]]); return a.slice(0, -1) })
  const redoIt = () => { if (!redo.length) return; const it = redo[redo.length - 1]; setRedo((r) => r.slice(0, -1)); setItems((a) => [...a, it]) }
  const clear = () => { if (items.length && items[items.length - 1].k !== 'x') commit({ k: 'x' }) }
  const exportPng = () => {
    cv.current?.toBlob((b) => {
      if (!b) return
      const url = URL.createObjectURL(b)
      const a = document.createElement('a'); a.href = url; a.download = 'sketch.png'
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }

  const isStamp = typeof tool === 'object'
  const sel = (s: string) => isStamp && tool.stamp === s
  const rotatable = isStamp && ['-', '=', '≡', '••'].includes(tool.stamp)

  return (
    <div className={'sk' + (compact ? ' sk-compact' : '')}>
      <div className="sk-bar">
        <div className="seg">
          <button className={tool === 'pen' ? 'on' : ''} onClick={() => setTool('pen')}>✎ Pen</button>
          <button className={tool === 'eraser' ? 'on' : ''} onClick={() => setTool('eraser')}>⌫ Eraser</button>
        </div>
        <div className="sk-colors">
          {COLORS.map((c) => <button key={c} className={c === color ? 'on' : ''} style={{ background: c }} onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen') }} aria-label={'colour ' + c} />)}
        </div>
        <input type="range" min={1} max={12} value={width} onChange={(e) => setWidth(Number(e.target.value))} title={`Size ${width}`} className="sk-size" />
        <span className="sk-gap" />
        <button className="btn sm" onClick={undo} disabled={!items.length} title="Undo">↶</button>
        <button className="btn sm" onClick={redoIt} disabled={!redo.length} title="Redo">↷</button>
        <button className="btn sm" onClick={clear} disabled={!items.length || items[items.length - 1].k === 'x'} title="Clear (undoable)">Clear</button>
        <button className="btn sm" onClick={exportPng}>PNG</button>
      </div>
      <div className="sk-stamps">
        <span className="sk-lbl">Stamps</span>
        {ELEMS.map((s) => <button key={s} className={sel(s) ? 'on' : ''} onClick={() => setTool(sel(s) ? 'pen' : { stamp: s })}>{s}</button>)}
        <i />
        {[['-', '—'], ['=', '═'], ['≡', '≡'], ['•', '•'], ['••', '• •']].map(([s, l]) => <button key={s} className={sel(s) ? 'on' : ''} title={s === '••' ? 'Lone pair' : s === '•' ? 'Single electron' : 'Bond'} onClick={() => setTool(sel(s) ? 'pen' : { stamp: s })}>{l}</button>)}
        <i />
        {MARKS.map((s) => <button key={s} className={sel(s) ? 'on' : ''} onClick={() => setTool(sel(s) ? 'pen' : { stamp: s })}>{s}</button>)}
        {rotatable && <button className="rot" onClick={() => setRot((r) => (r + 1) % 4)} title="Rotate stamp 45°">↻ {rot * 45}°</button>}
      </div>
      <div className="sk-wrap" ref={wrap}>
        <canvas ref={cv} className={'sk-canvas' + (isStamp ? ' stamp' : tool === 'eraser' ? ' erase' : '')}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
        {isStamp && <div className="sk-tip">Click the canvas to place “{tool.stamp}”. Click the stamp again to go back to the pen.</div>}
      </div>
    </div>
  )
}
