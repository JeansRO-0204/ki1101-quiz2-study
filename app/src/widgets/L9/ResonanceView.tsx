// Animated resonance viewer: cycles the forms, shows curved-arrow electron pushes and the averaged hybrid.
import { useEffect, useMemo, useState } from 'react'
import StructureSvg, { freeAnchor, subDigits, type Arrow, type DrawBond, type Pt } from './draw'
import { atomLabels } from './engine'
import type { ResForm } from './species'
import { enOf, formalCharges } from './species'

export function frac(x: number): string {
  if (Math.abs(x - Math.round(x)) < 0.005) return String(Math.round(x))
  for (let d = 2; d <= 6; d++) {
    const n = Math.round(x * d)
    if (Math.abs(x - n / d) < 0.004) return `${n}/${d}`
  }
  return x.toFixed(2)
}
export function parseFrac(s: string): number {
  const t = s.trim().replace(',', '.')
  const m = t.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (m) return Number(m[1]) / Number(m[2])
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : NaN
}

export interface Averages {
  keys: { key: string; a: number; b: number; orders: number[]; avg: number; max: number }[]
  fcAvg: number[]
  fcEach: number[][]
  used: boolean[]
}
export function averages(atoms: string[], forms: ResForm[]): Averages {
  const used = forms.map((f) => f.rank !== 'poor')
  if (!used.some(Boolean)) used.fill(true)
  const map = new Map<string, { a: number; b: number; orders: number[] }>()
  forms.forEach((f, fi) => {
    f.s.bonds.forEach(([a, b, o]) => {
      const key = `${a}-${b}`
      if (!map.has(key)) map.set(key, { a, b, orders: new Array(forms.length).fill(0) })
      map.get(key)!.orders[fi] = o
    })
  })
  const cnt = used.filter(Boolean).length
  const keys = [...map.entries()].map(([key, v]) => ({
    key, a: v.a, b: v.b, orders: v.orders,
    avg: v.orders.reduce((t, o, i) => (used[i] ? t + o : t), 0) / cnt,
    max: Math.max(...v.orders),
  }))
  const fcEach = forms.map((f) => formalCharges(atoms, f.s))
  const fcAvg = atoms.map((_, i) => fcEach.reduce((t, f, k) => (used[k] ? t + f[i] : t), 0) / cnt)
  return { keys, fcAvg, fcEach, used }
}

const RANK_LABEL = { best: 'major contributor', ok: 'minor contributor', poor: 'poor contributor' } as const
const RANK_CHIP = { best: 'ok', ok: 'warn', poor: 'err' } as const

export default function ResonanceView({ atoms, pos, forms, compact, note, charge }: {
  atoms: string[]; pos: Pt[]; forms: ResForm[]; compact?: boolean; note?: string; charge: number
}) {
  const [k, setK] = useState(0)
  const [view, setView] = useState<'cycle' | 'hybrid'>('cycle')
  const [play, setPlay] = useState(forms.length > 1)
  const [arrows, setArrows] = useState(true)
  useEffect(() => { setK(0); setPlay(forms.length > 1); setView('cycle') }, [forms])
  useEffect(() => {
    if (!play || view !== 'cycle' || forms.length < 2) return
    const t = setInterval(() => setK((x) => (x + 1) % forms.length), 2300)
    return () => clearInterval(t)
  }, [play, view, forms.length])

  const av = useMemo(() => averages(atoms, forms), [atoms, forms])
  const subs = useMemo(() => subDigits(atoms), [atoms])
  const lab = useMemo(() => atomLabels(atoms), [atoms])
  const lpSlots = atoms.map((_, i) => Math.max(...forms.map((f) => f.s.lp[i] ?? 0)))
  const lpMin = atoms.map((_, i) => Math.min(...forms.filter((_, fi) => av.used[fi]).map((f) => f.s.lp[i] ?? 0)))
  const cur = forms[Math.min(k, forms.length - 1)]
  const next = forms[(k + 1) % forms.length]
  const keysAll: [number, number][] = av.keys.map((x) => [x.a, x.b])

  const bonds: DrawBond[] = av.keys.map((x) => {
    const order = view === 'hybrid' ? x.avg : cur.s.bonds.find((b) => b[0] === x.a && b[1] === x.b)?.[2] ?? 0
    return { a: x.a, b: x.b, order, slots: Math.ceil(x.max), label: view === 'hybrid' && Math.abs(x.avg - Math.round(x.avg)) > 0.005 ? frac(x.avg) : undefined }
  })
  const fcShown = view === 'hybrid'
    ? av.fcAvg.map((v) => (Math.abs(v) < 0.005 ? 0 : v > 0 ? 'δ+' : 'δ−'))
    : av.fcEach[Math.min(k, forms.length - 1)]

  // curved arrows from the current form to the next one
  const arrowList: Arrow[] = []
  if (arrows && view === 'cycle' && forms.length > 1) {
    const ordOf = (f: ResForm, a: number, b: number) => f.s.bonds.find((x) => x[0] === a && x[1] === b)?.[2] ?? 0
    const lpA = cur.s.lp, lpB = next.s.lp
    const mid = (a: number, b: number): Pt => [(pos[a][0] + pos[b][0]) / 2, (pos[a][1] + pos[b][1]) / 2]
    av.keys.forEach(({ a, b }) => {
      const d = ordOf(next, a, b) - ordOf(cur, a, b)
      if (d > 0) {
        const donor = [a, b].find((x) => lpB[x] < lpA[x])
        if (donor != null) arrowList.push({ from: freeAnchor(donor, atoms, pos, keysAll, lpSlots[donor], Math.max(lpA[donor] - 1, 0), 30), to: mid(a, b), bend: 0.5 })
        else {
          // pi-bond shift (e.g. benzene): arrow from a neighbouring bond that loses order
          const src = av.keys.find((y) => (y.a === a || y.b === a || y.a === b || y.b === b) && ordOf(next, y.a, y.b) < ordOf(cur, y.a, y.b))
          if (src) arrowList.push({ from: mid(src.a, src.b), to: mid(a, b), bend: 0.55 })
        }
      } else if (d < 0) {
        const acc = [a, b].find((x) => lpB[x] > lpA[x])
        if (acc != null) arrowList.push({ from: mid(a, b), to: freeAnchor(acc, atoms, pos, keysAll, lpSlots[acc], Math.max(lpB[acc] - 1, 0), 30), bend: 0.5 })
      }
    })
  }

  const varying = av.keys.filter((x) => Math.max(...x.orders) !== Math.min(...x.orders))
  const rows = varying.length ? varying : av.keys.filter((x) => atoms[x.a] !== 'H' && atoms[x.b] !== 'H')
  const chargedAtoms = atoms.map((_, i) => i).filter((i) => forms.some((_, fi) => av.fcEach[fi][i] !== 0))
  const equiv = forms.every((f) => f.rank === 'best')

  return (
    <div className="res-view">
      <div className="res-stage">
        <div className="res-badge">
          {view === 'cycle' ? (
            <>
              <span className="chip">Form {Math.min(k, forms.length - 1) + 1} / {forms.length}</span>
              {!equiv && <span className={'chip ' + RANK_CHIP[cur.rank]}>{RANK_LABEL[cur.rank]}</span>}
            </>
          ) : <span className="chip">Resonance hybrid{equiv ? '' : ' (acceptable forms, unweighted)'}</span>}
        </div>
        <StructureSvg
          atoms={atoms} pos={pos} bonds={bonds} lp={view === 'hybrid' ? lpMin : cur.s.lp} lpSlots={lpSlots}
          fc={fcShown} subs={subs} arrows={arrowList} vh={compact ? 260 : 300}
        />
      </div>
      <div className="res-ctl">
        <div className="seg">
          <button className={view === 'cycle' ? 'on' : ''} onClick={() => setView('cycle')}>Cycle forms</button>
          <button className={view === 'hybrid' ? 'on' : ''} onClick={() => { setView('hybrid'); setPlay(false) }}>Hybrid</button>
        </div>
        {view === 'cycle' && forms.length > 1 && (
          <>
            <button className="btn sm" onClick={() => setPlay((p) => !p)}>{play ? '❚❚ Pause' : '▶ Play'}</button>
            <button className="btn sm" onClick={() => { setPlay(false); setK((x) => (x + 1) % forms.length) }}>Next ›</button>
            <label className="row" style={{ gap: 5, fontSize: 12.5 }}>
              <input type="checkbox" checked={arrows} onChange={(e) => setArrows(e.target.checked)} /> electron-push arrows
            </label>
          </>
        )}
      </div>
      <div className="res-forms">
        {forms.map((f, fi) => (
          <button key={fi} className={'res-form' + (fi === k && view === 'cycle' ? ' on' : '') + (f.rank === 'poor' ? ' poor' : '')}
            onClick={() => { setView('cycle'); setPlay(false); setK(fi) }} title={RANK_LABEL[f.rank]}>
            <StructureSvg atoms={atoms} pos={pos} bonds={f.s.bonds.map(([a, b, o]) => ({ a, b, order: o }))} lp={f.s.lp}
              fc={av.fcEach[fi]} subs={subs} vh={compact ? 260 : 300} />
            <small>{equiv ? `Form ${fi + 1}` : RANK_LABEL[f.rank]}</small>
          </button>
        ))}
      </div>

      <table className="lewis-tbl">
        <thead>
          <tr><th>Bond</th>{forms.map((_, fi) => <th key={fi} style={{ opacity: av.used[fi] ? 1 : 0.5 }}>#{fi + 1}</th>)}<th>Average order</th></tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.key}>
              <td>{lab[x.a]}–{lab[x.b]}</td>
              {x.orders.map((o, fi) => <td key={fi} style={{ opacity: av.used[fi] ? 1 : 0.5 }}>{o}</td>)}
              <td className="info"><b>{frac(x.avg)}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
      {chargedAtoms.length > 0 && (
        <table className="lewis-tbl">
          <thead><tr><th>Atom</th>{forms.map((_, fi) => <th key={fi} style={{ opacity: av.used[fi] ? 1 : 0.5 }}>FC #{fi + 1}</th>)}<th>Average FC</th></tr></thead>
          <tbody>
            {chargedAtoms.map((i) => (
              <tr key={i}>
                <td>{lab[i]}</td>
                {forms.map((_, fi) => <td key={fi} style={{ opacity: av.used[fi] ? 1 : 0.5 }}>{av.fcEach[fi][i] > 0 ? '+' : av.fcEach[fi][i] < 0 ? '−' : ''}{Math.abs(av.fcEach[fi][i])}</td>)}
                <td className="info"><b>{av.fcAvg[i] > 0 ? '+' : av.fcAvg[i] < 0 ? '−' : ''}{frac(Math.abs(av.fcAvg[i]))}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="res-note">
        Average bond order = mean over the {av.used.filter(Boolean).length} contributing form{av.used.filter(Boolean).length > 1 ? 's' : ''}
        {av.used.some((u) => !u) ? ' (poor contributors are left out)' : ''}. The real structure is the hybrid: electrons are delocalised, so equivalent bonds have equal length.
        {charge !== 0 && <> Average FCs add up to the ion charge ({charge > 0 ? '+' : '−'}{Math.abs(charge)}).</>}
        {note ? ' ' + note : ''}
      </p>
    </div>
  )
}

/** Criteria text for one form (slide 62): used by the contribution quiz explanation. */
export function formCriteria(atoms: string[], f: ResForm): { fc: number[]; sumAbs: number; negOnEn: boolean; maxAbs: number } {
  const fc = formalCharges(atoms, f.s)
  const neg = fc.map((v, i) => (v < 0 ? i : -1)).filter((i) => i >= 0)
  const pos = fc.map((v, i) => (v > 0 ? i : -1)).filter((i) => i >= 0)
  const negOnEn = neg.every((n) => pos.every((p) => enOf(atoms[n]) >= enOf(atoms[p])))
  return { fc, sumAbs: fc.reduce((t, v) => t + Math.abs(v), 0), negOnEn, maxAbs: Math.max(...fc.map(Math.abs)) }
}
