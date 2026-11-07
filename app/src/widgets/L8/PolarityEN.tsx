import { useRef, useState } from 'react'
import type { WidgetProps } from '../../types'
import { Feedback, NumInput, SlideRef, Step, Tex, Verdict, Workbench, parseNum, recordAttempt, useMode, type Note, type StepStatus } from '../../lib/kit'
import { el } from '../../lib/chem/elements'
import './l8.css'

/** Slide L8 s33 table (fallback when elements.ts has no value) */
const S33: Record<string, number> = { H: 2.1, Li: 1.0, Be: 1.5, B: 2.0, C: 2.5, N: 3.1, O: 3.5, F: 4.1, Na: 1.0, Mg: 1.3, Al: 1.5, Si: 1.8, P: 2.1, S: 2.4, Cl: 2.9, K: 0.9, Ca: 1.1, Br: 2.8, I: 2.2, Cs: 0.9 }
/** Slide L8 s34 rounded values ("must know for 2nd row and H") */
const S34: Record<string, number> = { H: 2, Li: 1, Be: 1.5, B: 2, C: 2.5, N: 3, O: 3.5, F: 4, P: 2, S: 2.5, Cl: 3 }
const SYMS = ['H', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca', 'Br', 'I', 'Cs']
type Scale = 'table' | 's33' | 's34'
const enOf = (s: string, sc: Scale): number => {
  if (sc === 's34' && S34[s] != null) return S34[s]
  if (sc === 's33') return S33[s] ?? el(s)?.en ?? 0
  return el(s)?.en ?? S33[s] ?? 0
}
type Cls = 'nonpolar' | 'polar' | 'ionic'
const classify = (d: number): Cls => (d < 0.5 ? 'nonpolar' : d <= 1.7 ? 'polar' : 'ionic')
const CLS_NAME: Record<Cls, string> = { nonpolar: 'Nonpolar covalent', polar: 'Polar covalent', ionic: 'Ionic (mostly)' }
/** ionic character from Pauling's curve (≈ the plot on L8 s38: 50 % at 1.7) */
const ionicPct = (d: number) => 100 * (1 - Math.exp(-0.25 * d * d))
const r2 = (x: number) => Math.round(x * 100) / 100

const SETS: { label: string; bonds: [string, string][] }[] = [
  { label: 'H–X (slide s36)', bonds: [['H', 'Cl'], ['H', 'F'], ['H', 'I'], ['H', 'Br']] },
  { label: 'Learning check (s35)', bonds: [['H', 'Cl'], ['C', 'O'], ['C', 'H'], ['Li', 'F'], ['Be', 'O']] },
  { label: '2nd-row with F', bonds: [['Li', 'F'], ['B', 'F'], ['C', 'F'], ['N', 'F'], ['O', 'F']] },
]

function Picture({ a, b, ea, eb, d }: { a: string; b: string; ea: number; eb: number; d: number }) {
  const W = 520, H = 230
  const xa = 130, xb = 390, y = 95
  const pct = ionicPct(d) / 100
  const dir = eb > ea ? 1 : eb < ea ? -1 : 0
  const shift = dir * ((xb - xa) / 2) * Math.min(1, pct * 1.2 + (d > 0 ? 0.04 : 0)) * 0.95
  const cx = (xa + xb) / 2 + shift
  const plusX = dir >= 0 ? xa : xb, minusX = dir >= 0 ? xb : xa
  const showCharge = d >= 0.05
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pe-svg" role="img" aria-label="Electron density cloud and dipole">
      <defs>
        <radialGradient id="pe-grad"><stop offset="0%" stopColor="#2563eb" stopOpacity=".5" /><stop offset="70%" stopColor="#2563eb" stopOpacity=".18" /><stop offset="100%" stopColor="#2563eb" stopOpacity="0" /></radialGradient>
        <marker id="pe-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 L9 5 L1 9 Z" fill="#18202c" /></marker>
      </defs>
      <ellipse className="pe-cloud" cx={cx} cy={y} rx={190} ry={78} fill="url(#pe-grad)" style={{ transition: 'cx .5s' }} />
      <circle cx={xa} cy={y} r={Math.min(50, 34 + ea * 3)} fill="#475569" /><text x={xa} y={y + 8} className="pe-atom">{a}</text>
      <circle cx={xb} cy={y} r={Math.min(50, 34 + eb * 3)} fill="#0e7490" /><text x={xb} y={y + 8} className="pe-atom">{b}</text>
      <text x={xa} y={y + 70} textAnchor="middle" className="ie-t">χ = {ea}</text>
      <text x={xb} y={y + 70} textAnchor="middle" className="ie-t">χ = {eb}</text>
      {showCharge && <>
        <text x={plusX} y={y - 58} textAnchor="middle" className="pe-dpole" fill="#dc2626">δ+</text>
        <text x={minusX} y={y - 58} textAnchor="middle" className="pe-dpole" fill="#2563eb">δ−</text>
        <g>
          <line x1={plusX + dir * 0} y1={H - 34} x2={minusX} y2={H - 34} stroke="#18202c" strokeWidth={2.4} markerEnd="url(#pe-arr)" transform={dir === 0 ? '' : ''} style={{ display: 'none' }} />
          <line x1={Math.min(plusX, minusX) + 20} y1={H - 30} x2={Math.max(plusX, minusX) - 20} y2={H - 30} stroke="#18202c" strokeWidth={2.4} markerEnd="url(#pe-arr)" transform={dir < 0 ? `rotate(180 ${W / 2} ${H - 30})` : ''} />
          <path d={`M${plusX + (dir >= 0 ? 20 : -20)} ${H - 38} v16 M${plusX + (dir >= 0 ? 12 : -12)} ${H - 30} h16`} stroke="#18202c" strokeWidth={2} fill="none" />
          <text x={W / 2} y={H - 42} textAnchor="middle" className="ie-t">dipole moment μ points toward δ−</text>
        </g>
      </>}
      {!showCharge && <text x={W / 2} y={H - 30} textAnchor="middle" className="ie-t">equal sharing: no dipole</text>}
    </svg>
  )
}

interface R { ok: boolean; notes: Note[] }

export default function PolarityEN({ mode: forced, onResult, compact }: WidgetProps) {
  const [mode, setMode] = useMode(forced)
  const [view, setView] = useState<'pick' | 'slider'>('pick')
  const [scale, setScale] = useState<Scale>('table')
  const [A, setA] = useState('H'), [B, setB] = useState('Cl')
  const [slide, setSlide] = useState(1.0)
  const [dStr, setDStr] = useState('')
  const [cls, setCls] = useState<Cls | null>(null)
  const [neg, setNeg] = useState<string | null>(null)
  const [setIdx, setSetIdx] = useState(0)
  const [rank, setRank] = useState<string[]>([])
  const [res, setRes] = useState<Record<number, R | undefined>>({})
  const [wrong, setWrong] = useState(0)
  const [checked, setChecked] = useState(false)
  const fired = useRef(false)

  const ea = view === 'pick' ? enOf(A, scale) : r2(Math.max(0.7, 1.0)) ; const eb = view === 'pick' ? enOf(B, scale) : r2(ea + slide)
  const d = r2(Math.abs(eb - ea))
  const c = classify(d)
  const nameA = view === 'pick' ? A : 'A', nameB = view === 'pick' ? B : 'B'
  const clear = (i: number) => setRes((r) => { const x = { ...r }; delete x[i]; return x })
  const reset = () => { setDStr(''); setCls(null); setNeg(null); setRank([]); setRes({}); setWrong(0); setChecked(false); fired.current = false }
  const bonds = SETS[setIdx].bonds
  const bname = (b: [string, string]) => `${b[0]}–${b[1]}`
  const bd = (b: [string, string]) => r2(Math.abs(enOf(b[0], scale) - enOf(b[1], scale)))

  function ev(i: number): R {
    const n: Note[] = []
    if (i === 0) {
      const x = parseNum(dStr)
      if (Number.isFinite(x) && Math.abs(x - d) <= 0.06) return { ok: true, notes: [{ level: 'ok', msg: `Δχ = |${ea} − ${eb}| = **${d}** (s32).` }] }
      if (!Number.isFinite(x)) n.push({ level: 'err', msg: 'Enter the electronegativity difference as a number.' })
      else if (x < 0) n.push({ level: 'err', msg: 'Δχ is an **absolute** difference |χA − χB|, so it is never negative (s32).' })
      else if (Math.abs(x - (ea + eb)) < 0.06) n.push({ level: 'err', msg: 'You added the two values; subtract them: Δχ = |χA − χB|.' })
      else n.push({ level: 'hint', msg: `Look up both values (${nameA}: ${ea}, ${nameB}: ${eb}) and subtract the smaller from the larger.` })
      return { ok: false, notes: n }
    }
    if (i === 1) {
      if (!cls) return { ok: false, notes: [{ level: 'err', msg: 'Choose a bond type.' }] }
      if (cls === c) return { ok: true, notes: [{ level: 'ok', msg: `${CLS_NAME[c]}: Δχ = ${d} ${c === 'nonpolar' ? '< 0.5' : c === 'polar' ? 'lies between 0.5 and 1.7' : '> 1.7'} (s39). About ${Math.round(ionicPct(d))} % ionic character (curve on s38).` }] }
      const why = c === 'nonpolar' ? `Δχ = ${d} < 0.5: electrons are shared almost equally (< 5 % ionic).`
        : c === 'polar' ? `Δχ = ${d} is between 0.5 and 1.7: unequal sharing, partial charges, not a full transfer.`
          : `Δχ = ${d} > 1.7: more than 50 % ionic, the more electronegative atom almost completely controls the electrons.`
      return { ok: false, notes: [{ level: 'err', msg: `Not ${CLS_NAME[cls].toLowerCase()}. ${why} Cutoffs: < 0.5 nonpolar, 0.5–1.7 polar, > 1.7 ionic.` }] }
    }
    if (i === 2) {
      if (d < 0.05) return { ok: neg === 'none', notes: neg === 'none' ? [{ level: 'ok', msg: 'Equal χ: no partial charges.' }] : [{ level: 'err', msg: 'Both atoms have the same χ, so neither is δ−.' }] }
      const want = ea > eb ? A : B
      if (neg === want) return { ok: true, notes: [{ level: 'ok', msg: `${want} is more electronegative, so it carries δ− and the dipole arrow points toward it (the + end of the arrow is on ${want === A ? B : A}).` }] }
      return { ok: false, notes: [{ level: 'err', msg: neg ? `${neg} (χ = ${neg === A ? ea : eb}) is the less electronegative atom and therefore δ+. The electron cloud shifts toward the atom with the larger χ.` : 'Pick the atom that carries the partial negative charge.' }] }
    }
    // ranking: least polar first
    if (rank.length < bonds.length) return { ok: false, notes: [{ level: 'err', msg: `Click all ${bonds.length} bonds, least polar first.` }] }
    for (let k = 1; k < rank.length; k++) {
      const p = bonds.find((b) => bname(b) === rank[k - 1])!, q = bonds.find((b) => bname(b) === rank[k])!
      if (bd(q) < bd(p) - 1e-9) return { ok: false, notes: [{ level: 'err', msg: `${rank[k]} (Δχ = ${bd(q)}) is **less** polar than ${rank[k - 1]} (Δχ = ${bd(p)}). Larger Δχ means a more polar bond.` }] }
    }
    return { ok: true, notes: [{ level: 'ok', msg: 'Ranking correct: ' + rank.map((r) => `${r} (${bd(bonds.find((b) => bname(b) === r)!)})`).join(' < ') }] }
  }
  const finish = (ok: boolean, score: number, summary: string) => {
    if (fired.current) return
    fired.current = true
    onResult?.({ correct: ok, score, summary })
    if (onResult) recordAttempt({ id: 'polarity-en', lecture: 'L8', topic: 'Electronegativity & polarity', correct: ok, score })
  }
  const last = view === 'pick' ? 3 : 3
  const first = view === 'pick' ? 0 : 3
  const idxs = view === 'pick' ? [0, 1, 2, 3] : [3]
  const checkStep = (i: number) => {
    const r = ev(i); setRes((p) => ({ ...p, [i]: r }))
    if (!r.ok) setWrong((w) => w + 1)
    else if (i === last && mode === 'learn') finish(wrong === 0, Math.max(0, 1 - 0.15 * wrong), `${A}–${B}: Δχ ${d}, ${CLS_NAME[c]}`)
  }
  const checkAll = () => {
    const rs: Record<number, R> = {}; idxs.forEach((i) => { rs[i] = ev(i) }); setRes(rs); setChecked(true)
    const ok = idxs.filter((i) => rs[i].ok).length
    finish(ok === idxs.length, ok / idxs.length, ok === idxs.length ? 'All correct' : `${idxs.length - ok} of ${idxs.length} parts wrong`)
  }
  const isOk = (i: number) => !!res[i]?.ok
  const status = (i: number): StepStatus => {
    if (mode === 'learn') {
      const p = idxs[idxs.indexOf(i) - 1]
      if (p != null && !isOk(p)) return 'locked'
      return isOk(i) ? 'done' : res[i] ? 'error' : 'active'
    }
    return checked ? (isOk(i) ? 'done' : 'error') : 'active'
  }
  const btn = (i: number) => mode === 'learn' && status(i) !== 'done' && <div className="ie-check"><button className="btn primary sm" onClick={() => checkStep(i)}>Check</button></div>
  void first

  const pos = Math.min(100, (d / 3.3) * 100)
  const sel = (s: string, set: (v: string) => void) => (
    <select className="pe-select" value={s} onChange={(e) => { set(e.target.value); reset() }}>{SYMS.map((x) => <option key={x}>{x}</option>)}</select>
  )
  const allOk = idxs.every(isOk)

  return (
    <Workbench title="Electronegativity & bond polarity" compact={compact} mode={mode} onMode={setMode} onReset={reset}
      subtitle={<>Δχ = |χA − χB| <SlideRef l="L8" s={39} /></>}
      tools={<div className="seg"><button className={view === 'pick' ? 'on' : ''} onClick={() => { setView('pick'); reset() }}>Pick atoms</button><button className={view === 'slider' ? 'on' : ''} onClick={() => { setView('slider'); reset() }}>Slider</button></div>}>
      <div className={'pe-layout' + (compact ? ' compact' : '')}>
        <div>
          <div className="pe-pair">
            {view === 'pick' ? <>{sel(A, setA)}<b>–</b>{sel(B, setB)}</> : (
              <label className="ie-small" style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>Δχ <input type="range" min={0} max={3.3} step={0.05} value={slide} onChange={(e) => { setSlide(+e.target.value); clear(1) }} style={{ flex: 1 }} /> <b>{slide.toFixed(2)}</b></label>
            )}
            <div className="seg" title="Which electronegativity values to use">
              <button className={scale === 'table' ? 'on' : ''} onClick={() => { setScale('table'); reset() }}>Table</button>
              <button className={scale === 's33' ? 'on' : ''} onClick={() => { setScale('s33'); reset() }}>s33</button>
              <button className={scale === 's34' ? 'on' : ''} onClick={() => { setScale('s34'); reset() }}>s34 rounded</button>
            </div>
          </div>
          <Picture a={nameA} b={nameB} ea={ea} eb={eb} d={d} />
          <div className="pe-spec">
            <div className="pe-spec-bar" />
            <div className="pe-spec-mark" style={{ left: `calc(${pos}% - 2px)` }} />
            <div className="pe-spec-lbl"><span style={{ width: '15%' }}>nonpolar &lt; 0.5</span><span style={{ width: '36%' }}>polar covalent 0.5 – 1.7</span><span style={{ flex: 1, textAlign: 'right' }}>ionic &gt; 1.7</span></div>
          </div>
          <p className="ie-small"><b>{CLS_NAME[c]}</b> · Δχ = {d} · ≈ {Math.round(ionicPct(d))} % ionic character <SlideRef l="L8" s={38} />. {view === 'pick' && <span className="muted">χ from {scale === 'table' ? 'the periodic-table data' : scale === 's33' ? 'slide s33' : 'slide s34 (rounded)'}.</span>}</p>
        </div>

        <div>
          {view === 'pick' && <>
            <Step n={1} title={<>Compute Δχ for {A}–{B}</>} status={status(0)} notes={res[0]?.notes}>
              <div className="row"><Tex>{'\\Delta\\chi='}</Tex><NumInput value={dStr} onChange={(s) => { setDStr(s); clear(0) }} placeholder="e.g. 0.9" width={90} state={res[0] ? (res[0].ok ? 'ok' : 'err') : null} /></div>
              {btn(0)}
            </Step>
            <Step n={2} title="Classify the bond" status={status(1)} notes={res[1]?.notes}>
              <div className="bp-opts">{(['nonpolar', 'polar', 'ionic'] as Cls[]).map((k) => <button key={k} className={cls === k ? 'on' : ''} onClick={() => { setCls(k); clear(1) }}>{CLS_NAME[k]}</button>)}</div>
              {btn(1)}
            </Step>
            <Step n={3} title="Which atom is δ−? (dipole points toward it)" status={status(2)} notes={res[2]?.notes}>
              <div className="bp-opts">{[A, B].map((k) => <button key={k + 'x'} className={neg === k ? 'on' : ''} onClick={() => { setNeg(k); clear(2) }}>{k}</button>)}<button className={neg === 'none' ? 'on' : ''} onClick={() => { setNeg('none'); clear(2) }}>neither</button></div>
              {btn(2)}
            </Step>
          </>}
          {view === 'slider' && <p className="ie-small muted">Drag Δχ from 0 to 3.3 and watch the cloud shift. Cutoffs on s39: &lt; 0.5 nonpolar, 0.5–1.7 polar covalent, &gt; 1.7 mostly ionic. Switch to "Pick atoms" for the step-by-step tasks.</p>}
          <Step n={view === 'pick' ? 4 : 1} title="Rank bonds from least to most polar" status={status(3)} notes={res[3]?.notes}>
            <select className="pe-select" value={setIdx} onChange={(e) => { setSetIdx(+e.target.value); setRank([]); clear(3) }}>{SETS.map((s, i) => <option key={i} value={i}>{s.label}</option>)}</select>
            <div className="pe-rank">
              {bonds.map((b) => { const k = rank.indexOf(bname(b)); return (
                <button key={bname(b)} className={k >= 0 ? 'on' : ''} onClick={() => { setRank(k >= 0 ? rank.filter((x) => x !== bname(b)) : [...rank, bname(b)]); clear(3) }}>
                  {k >= 0 && <span className="ie-rank">{k + 1}</span>}{bname(b)}
                </button>) })}
            </div>
            {btn(3)}
          </Step>
          {mode === 'test' && !checked && <div className="ie-check"><button className="btn primary" onClick={checkAll}>Check all</button></div>}
          {(allOk || checked) && <Verdict correct={allOk ? true : 'partial'} title={allOk ? 'All correct' : 'Some parts need another look'}>{checked && !allOk && <Feedback notes={idxs.filter((i) => !isOk(i)).flatMap((i) => res[i]?.notes ?? [])} />}</Verdict>}
        </div>
      </div>
    </Workbench>
  )
}
