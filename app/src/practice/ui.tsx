import type { ReactNode } from 'react'
import { LECTURES, type LectureId } from '../types'

export const lecColor = (l: LectureId) => LECTURES.find((x) => x.id === l)?.color ?? '#64748b'
export const pct = (x: number) => Math.round(x * 100) + '%'
export const accColor = (a: number) => (a >= 0.8 ? 'var(--ok)' : a >= 0.55 ? '#d97706' : 'var(--err)')

export function Bar({ value, color, label, right }: { value: number; color?: string; label?: ReactNode; right?: ReactNode }) {
  return (
    <div className="pr-bar">
      {label && <div className="pr-bar-label">{label}</div>}
      <div className="pr-bar-track"><div className="pr-bar-fill" style={{ width: `${Math.max(2, value * 100)}%`, background: color ?? accColor(value) }} /></div>
      {right && <div className="pr-bar-right">{right}</div>}
    </div>
  )
}

export function go(sub?: string) { location.hash = '#/practice' + (sub ? '/' + sub : '') }

/** One-shot hand-off between pages (Progress → Quiz/Drill). Not under chem.* so it is not exported. */
export interface Preset { lecture?: LectureId; topic?: string; gens?: string[]; flaggedOnly?: boolean }
export function setPreset(p: Preset) { try { sessionStorage.setItem('practice.preset', JSON.stringify(p)) } catch { /* ignore */ } }
export function takePreset(): Preset | null {
  try { const s = sessionStorage.getItem('practice.preset'); if (s) { sessionStorage.removeItem('practice.preset'); return JSON.parse(s) as Preset } } catch { /* ignore */ }
  return null
}
