// Helpers shared by the L7 widgets (not exported to the registry).
import { useEffect, useRef, type ReactNode } from 'react'
import { ELEMENTS, type Element } from '../../lib/chem/elements'

/* ---------- light ---------- */
/** Approximate RGB for a visible wavelength in nm (Bruton). */
export function wavelengthRGB(nm: number): [number, number, number] {
  let r = 0, g = 0, b = 0
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1 }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1 }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20 }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1 }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65 }
  else if (nm <= 750) { r = 1 }
  const f = nm < 420 ? 0.3 + (0.7 * (nm - 380)) / 40 : nm > 700 ? 0.3 + (0.7 * (750 - nm)) / 50 : 1
  const c = (x: number) => Math.round(255 * Math.pow(Math.max(0, x * f), 0.8))
  return [c(r), c(g), c(b)]
}
export function lightColor(nm: number): string {
  if (nm < 380) return '#7c3aed'
  if (nm > 750) return '#b91c1c'
  const [r, g, b] = wavelengthRGB(nm)
  return `rgb(${r},${g},${b})`
}

export interface Region { id: string; name: string; lo: number; hi: number; color: string }
/** Boundaries in metres. */
export const REGIONS: Region[] = [
  { id: 'gamma', name: 'γ-ray', lo: 1e-14, hi: 1e-11, color: '#7c3aed' },
  { id: 'xray', name: 'X-ray', lo: 1e-11, hi: 1e-8, color: '#6366f1' },
  { id: 'uv', name: 'UV', lo: 1e-8, hi: 380e-9, color: '#8b5cf6' },
  { id: 'vis', name: 'visible', lo: 380e-9, hi: 750e-9, color: '#22c55e' },
  { id: 'ir', name: 'IR', lo: 750e-9, hi: 1e-3, color: '#dc2626' },
  { id: 'micro', name: 'microwave', lo: 1e-3, hi: 0.3, color: '#ea580c' },
  { id: 'radio', name: 'radio', lo: 0.3, hi: 1e6, color: '#0891b2' },
]
export const regionOf = (m: number): Region => REGIONS.find((r) => m >= r.lo && m < r.hi) ?? REGIONS[REGIONS.length - 1]

export function fmtLen(m: number): string {
  const units: [string, number][] = [['pm', 1e-12], ['nm', 1e-9], ['μm', 1e-6], ['mm', 1e-3], ['m', 1], ['km', 1e3]]
  let u = units[0]
  for (const x of units) if (m >= x[1] * 0.9999) u = x
  const v = m / u[1]
  return `${Number(v.toPrecision(3))} ${u[0]}`
}
export function fmtFreq(hz: number): string {
  const units: [string, number][] = [['Hz', 1], ['kHz', 1e3], ['MHz', 1e6], ['GHz', 1e9], ['THz', 1e12], ['PHz', 1e15], ['EHz', 1e18], ['ZHz', 1e21]]
  let u = units[0]
  for (const x of units) if (hz >= x[1] * 0.9999) u = x
  return `${Number((hz / u[1]).toPrecision(3))} ${u[0]}`
}

/* ---------- text ---------- */
const SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹'
export const sup = (n: number | string) => String(n).replace(/[0-9]/g, (d) => SUPD[+d]).replace('-', '⁻').replace('+', '⁺')
/** "4s2 3d6" style config → React with superscripts */
export function Cfg({ cfg, core }: { cfg: [string, number][]; core?: string }) {
  return (
    <span className="l7-cfg">
      {core && <span>[{core}] </span>}
      {cfg.filter(([, k]) => k > 0).map(([s, k], i) => (
        <span key={s}>{i > 0 ? ' ' : ''}{s}<sup>{k}</sup></span>
      ))}
    </span>
  )
}
export function chargeStr(q: number): string {
  if (q === 0) return ''
  const m = Math.abs(q)
  return (m === 1 ? '' : String(m)) + (q > 0 ? '+' : '−')
}

/* ---------- animation ---------- */
/** requestAnimationFrame loop; cb gets elapsed seconds since start and dt. */
export function useRaf(cb: (t: number, dt: number) => void, active = true) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    if (!active) return
    let id = 0
    let t0 = 0
    let last = 0
    const loop = (now: number) => {
      if (!t0) { t0 = now; last = now }
      ref.current((now - t0) / 1000, (now - last) / 1000)
      last = now
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [active])
}

/* ---------- periodic table grid ---------- */
export function ptPos(e: Element): { row: number; col: number } {
  if (e.group === null) return { row: e.period === 6 ? 9 : 10, col: e.z - (e.period === 6 ? 57 : 89) + 3 }
  return { row: e.period, col: e.group }
}
/** 18-column periodic table (f-block rows below). `render` draws the inside of each cell. */
export function PTGrid({ render, maxZ = 118, cell = 34, gap = 2 }: {
  render: (e: Element) => ReactNode; maxZ?: number; cell?: number; gap?: number
}) {
  const els = ELEMENTS.filter((e) => e.z <= maxZ)
  const rows = els.some((e) => e.group === null) ? 10 : 7
  return (
    <div className="l7-ptgrid" style={{ gridTemplateColumns: `repeat(18, ${cell}px)`, gridTemplateRows: `repeat(${rows}, ${cell}px)`, gap }}>
      {els.map((e) => {
        const { row, col } = ptPos(e)
        return <div key={e.z} className="l7-ptcell" style={{ gridRow: row, gridColumn: col }}>{render(e)}</div>
      })}
    </div>
  )
}
