import { useState } from 'react'
import './l7.css'
import { Workbench, useMode, Feedback, Verdict, NumInput, parseNum, type Note } from '../../lib/kit'
import type { WidgetProps } from '../../types'

const LET = 'spdfghik'
const fmtMs = (m: number) => (m === 0.5 ? '+½' : m === -0.5 ? '−½' : String(m))
type V3 = [number, number, number]

/* ---------- orbital drawing ---------- */
const AX: Record<'x' | 'y' | 'z', [number, number]> = { x: [-0.55, 0.5], y: [1, 0], z: [0, -1] }
const proj = ([x, y, z]: V3): [number, number] => [x * AX.x[0] + y * AX.y[0] + z * AX.z[0], x * AX.x[1] + y * AX.y[1] + z * AX.z[1]]
interface Lobe { d: V3; s: 1 | -1; len?: number; w?: number }
const POS = '#60a5fa', NEG = '#f472b6'

function lobePath(d: V3, R: number, len: number, w: number) {
  const n = Math.hypot(...d)
  const [px, py] = proj([d[0] / n, d[1] / n, d[2] / n])
  const pl = Math.max(0.35, Math.hypot(px, py))
  const ux = px / pl, uy = py / pl
  const tx = ux * R * len * pl, ty = uy * R * len * pl
  const nx = -uy * R * w, ny = ux * R * w
  return `M0,0 C${tx * 0.15 + nx * 0.9},${ty * 0.15 + ny * 0.9} ${tx + nx * 0.95},${ty + ny * 0.95} ${tx},${ty} C${tx - nx * 0.95},${ty - ny * 0.95} ${tx * 0.15 - nx * 0.9},${ty * 0.15 - ny * 0.9} 0,0Z`
}
const r2 = Math.SQRT1_2
function lobesFor(l: number, ml: number): { lobes: Lobe[]; ring?: boolean; name: string } {
  if (l === 1) {
    if (ml === 0) return { name: 'pz', lobes: [{ d: [0, 0, 1], s: 1 }, { d: [0, 0, -1], s: -1 }] }
    if (ml === 1) return { name: 'px', lobes: [{ d: [1, 0, 0], s: 1 }, { d: [-1, 0, 0], s: -1 }] }
    return { name: 'py', lobes: [{ d: [0, 1, 0], s: 1 }, { d: [0, -1, 0], s: -1 }] }
  }
  if (l === 2) {
    if (ml === 0) return { name: 'dz²', ring: true, lobes: [{ d: [0, 0, 1], s: 1, w: 0.2 }, { d: [0, 0, -1], s: 1, w: 0.2 }] }
    if (ml === 2) return { name: 'dx²−y²', lobes: [{ d: [1, 0, 0], s: 1 }, { d: [-1, 0, 0], s: 1 }, { d: [0, 1, 0], s: -1 }, { d: [0, -1, 0], s: -1 }].map((o) => ({ ...o, w: 0.17, len: 0.85 })) as Lobe[] }
    const mk = (a: 'x' | 'y' | 'z', b: 'x' | 'y' | 'z'): Lobe[] => {
      const v = (sa: number, sb: number): V3 => { const o: V3 = [0, 0, 0]; o['xyz'.indexOf(a)] = sa * r2; o['xyz'.indexOf(b)] = sb * r2; return o }
      return [{ d: v(1, 1), s: 1 }, { d: v(-1, -1), s: 1 }, { d: v(1, -1), s: -1 }, { d: v(-1, 1), s: -1 }].map((o) => ({ ...o, w: 0.17, len: 0.85 })) as Lobe[]
    }
    if (ml === 1) return { name: 'dxz', lobes: mk('x', 'z') }
    if (ml === -1) return { name: 'dyz', lobes: mk('y', 'z') }
    return { name: 'dxy', lobes: mk('x', 'y') }
  }
  if (l === 3 && ml === 0) return { name: 'fz³', ring: true, lobes: [{ d: [0, 0, 1], s: 1, w: 0.16 }, { d: [0, 0, -1], s: -1, w: 0.16 }] }
  const c3 = 1 / Math.sqrt(3)
  const L8: Lobe[] = []
  for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) L8.push({ d: [sx * c3, sy * c3, sz * c3], s: (sx * sy * sz) as 1 | -1, w: 0.14, len: 0.8 })
  return { name: 'f (generic, 8 lobes)', lobes: L8 }
}

function Orbital({ n, l, ml }: { n: number; l: number; ml: number }) {
  const R = 78, rad = n - l - 1
  const axes = (['x', 'y', 'z'] as const).map((k) => { const [x, y] = AX[k]; return <g key={k}><line x1={-x * R * 1.25} y1={-y * R * 1.25} x2={x * R * 1.25} y2={y * R * 1.25} stroke="#cbd5e1" /><text x={x * R * 1.33} y={y * R * 1.33 + 4} fontSize="12" fill="#64748b" textAnchor="middle">{k}</text></g> })
  let body
  if (l === 0) {
    body = (
      <g>
        <circle r={R * 0.8} fill="#f59e0b" opacity=".55" stroke="#b45309" />
        <circle r={R * 0.8} fill="url(#qn-g)" />
        {Array.from({ length: rad }, (_, i) => <circle key={i} r={(R * 0.8 * (i + 1)) / (rad + 1)} fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="5 4" />)}
      </g>)
  } else {
    const { lobes, ring } = lobesFor(l, ml)
    body = (
      <g>
        {ring && <path d={`M${R * 0.55},0 A${R * 0.55},${R * 0.2} 0 1 0 ${-R * 0.55},0 A${R * 0.55},${R * 0.2} 0 1 0 ${R * 0.55},0Z M${R * 0.25},0 A${R * 0.25},${R * 0.08} 0 1 1 ${-R * 0.25},0 A${R * 0.25},${R * 0.08} 0 1 1 ${R * 0.25},0Z`} fillRule="evenodd" fill={NEG} opacity=".75" stroke="#be185d" />}
        {lobes.map((o, i) => <path key={i} d={lobePath(o.d, R, o.len ?? 1, o.w ?? 0.25)} fill={o.s > 0 ? POS : NEG} opacity=".82" stroke={o.s > 0 ? '#1d4ed8' : '#be185d'} />)}
        {rad > 0 && Array.from({ length: rad }, (_, i) => <circle key={i} r={10 + i * 9} fill="none" stroke="#475569" strokeDasharray="3 3" />)}
      </g>)
  }
  return (
    <svg className="qn-shape" viewBox="-130 -110 260 220">
      <defs><radialGradient id="qn-g"><stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#f59e0b" stopOpacity="0" /></radialGradient></defs>
      {axes}{body}
    </svg>
  )
}

function validate(n: number, l: number, ml: number, ms: number): Note[] {
  const out: Note[] = []
  if (!Number.isInteger(n) || n < 1) out.push({ level: 'err', msg: '**n** must be a positive integer (1, 2, 3, …).' })
  const nOk = n >= 1
  if (l < 0) out.push({ level: 'err', msg: '**l** cannot be negative: l = 0, 1, …, n−1.' })
  else if (nOk && l >= n) out.push({ level: 'err', msg: `**l must be < n**: for n = ${n}, l can only be 0 … ${n - 1} (a ${n}${LET[l] ?? '?'} subshell does not exist).` })
  if (Math.abs(ml) > l) out.push({ level: 'err', msg: `**m_l ranges −l … +l**: for l = ${l} that is ${-l} … ${l}, but you have m_l = ${ml}.` })
  if (ms !== 0.5 && ms !== -0.5) out.push({ level: 'err', msg: '**m_s** can only be +½ or −½ (spin up / spin down).' })
  return out
}

function Stepper({ label, value, set, min, max, bad }: { label: string; value: number; set: (v: number) => void; min: number; max: number; bad?: boolean }) {
  return (
    <div className={'qn-ctl' + (bad ? ' bad' : '')}><label>{label}</label>
      <div className="qn-step"><button onClick={() => set(Math.max(min, value - 1))} aria-label="decrease">−</button><b>{value}</b><button onClick={() => set(Math.min(max, value + 1))} aria-label="increase">+</button></div></div>
  )
}

interface QF { q: string; a: number; why: string }
function quick(): QF {
  const n = 2 + Math.floor(Math.random() * 4), l = Math.floor(Math.random() * Math.min(n, 4)), sub = `${n}${LET[l]}`
  const kinds: QF[] = [
    { q: `How many orbitals are there in the shell n = ${n}?`, a: n * n, why: `Σ(2l+1) over l = 0…${n - 1} = n² = ${n * n}.` },
    { q: `Maximum number of electrons with n = ${n}?`, a: 2 * n * n, why: `${n * n} orbitals × 2 = 2n² = ${2 * n * n}.` },
    { q: `How many orbitals are in the ${sub} subshell?`, a: 2 * l + 1, why: `m_l = −${l}…+${l} gives 2l+1 = ${2 * l + 1}.` },
    { q: `How many electrons fit in the ${sub} subshell?`, a: 2 * (2 * l + 1), why: `${2 * l + 1} orbitals × 2 = ${2 * (2 * l + 1)}.` },
    { q: `How many radial nodes does a ${sub} orbital have?`, a: n - l - 1, why: `radial nodes = n − l − 1 = ${n - l - 1}.` },
    { q: `How many angular nodes does a ${sub} orbital have?`, a: l, why: `angular nodes = l = ${l}.` },
    { q: `How many subshells are there in the shell n = ${n}?`, a: n, why: `l = 0…n−1 → ${n} subshells.` },
    { q: `How many electrons can have n = ${n} and m_s = +½?`, a: n * n, why: `one ↑ electron per orbital: n² = ${n * n}.` },
    { q: `How many orbitals have n = ${n}, l = ${l}?`, a: 2 * l + 1, why: `m_l has 2l+1 = ${2 * l + 1} values.` },
  ]
  return kinds[Math.floor(Math.random() * kinds.length)]
}

export default function QNumbers(props: WidgetProps) {
  const [mode, setMode] = useMode(props.mode, 'chem.mode.qn')
  const [tab, setTab] = useState<'explore' | 'build' | 'quick'>('explore')
  const [n, setN] = useState(3), [l, setL] = useState(2), [ml, setMl] = useState(0), [ms, setMs] = useState(0.5)
  const [checked, setChecked] = useState(false)
  const [target, setTarget] = useState(() => mkTarget())
  const [bres, setBres] = useState<Note[] | null>(null)
  const [qf, setQf] = useState<QF>(quick), [ans, setAns] = useState(''), [qres, setQres] = useState<null | boolean>(null)
  const [score, setScore] = useState({ ok: 0, tot: 0, streak: 0 })

  function mkTarget() {
    const nn = 2 + Math.floor(Math.random() * 4), ll = Math.floor(Math.random() * Math.min(nn, 4))
    return { n: nn, l: ll, ml: Math.floor(Math.random() * (2 * ll + 1)) - ll, ms: Math.random() < 0.5 ? 0.5 : -0.5 }
  }
  const errs = validate(n, l, ml, ms)
  const valid = errs.length === 0
  const live = mode === 'learn' || tab === 'build' && bres != null || checked
  const sub = n >= 1 && l >= 0 ? `${n}${LET[l] ?? '?'}` : '—'
  const shown = (valid && sub !== '—')
  const lobes = shown ? lobesFor(l, ml).name : ''
  const rad = n - l - 1

  const checkBuild = () => {
    const notes: Note[] = validate(n, l, ml, ms)
    if (!notes.length) {
      if (n !== target.n || l !== target.l) notes.push({ level: 'err', msg: `That set is allowed but it is a ${sub} electron; you need ${target.n}${LET[target.l]}.` })
      else if (ml !== target.ml) notes.push({ level: 'err', msg: `Valid, but m_l should be ${target.ml}.` })
      else if (ms !== target.ms) notes.push({ level: 'err', msg: `Valid, but the spin should be ${fmtMs(target.ms)}.` })
      else notes.push({ level: 'ok', msg: `Correct: (${n}, ${l}, ${ml}, ${fmtMs(ms)}).` })
    }
    setBres(notes)
    props.onResult?.({ correct: notes.every((x) => x.level === 'ok'), summary: notes[0]?.msg })
  }
  const answerQ = () => {
    const v = parseNum(ans)
    const ok = v === qf.a
    setQres(ok)
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), tot: s.tot + 1, streak: ok ? s.streak + 1 : 0 }))
  }

  const tabs = <div className="seg">{(['explore', 'build', 'quick'] as const).map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'explore' ? 'Explore' : t === 'build' ? 'Build a set' : 'Quick-fire'}</button>)}</div>
  return (
    <Workbench title="Quantum numbers & orbitals" subtitle="n, l, m_l, m_s" compact={props.compact} mode={tab === 'quick' ? undefined : mode} onMode={setMode} tools={tabs}
      onReset={() => { setN(3); setL(2); setMl(0); setMs(0.5); setChecked(false); setBres(null); setScore({ ok: 0, tot: 0, streak: 0 }) }}>
      {tab !== 'quick' && (
        <>
          {tab === 'build' && <p style={{ marginTop: 0 }}><b>Task:</b> set the controls to a valid set for a <b>{target.n}{LET[target.l]}</b> electron with <b>m_l = {target.ml}</b> and spin <b>{fmtMs(target.ms)}</b>. <button className="btn sm" onClick={() => { setTarget(mkTarget()); setBres(null) }}>New</button></p>}
          <div className="qn-grid">
            <Stepper label="n (shell)" value={n} set={setN} min={0} max={7} bad={live && n < 1} />
            <Stepper label="l (subshell)" value={l} set={setL} min={-1} max={7} bad={live && (l < 0 || (n >= 1 && l >= n))} />
            <Stepper label="m_l (orbital)" value={ml} set={setMl} min={-7} max={7} bad={live && Math.abs(ml) > l} />
            <div className={'qn-ctl' + (live && ms !== 0.5 && ms !== -0.5 ? ' bad' : '')}><label>m_s (spin)</label>
              <div className="seg">{[0.5, -0.5, 0, 1].map((v) => <button key={v} className={ms === v ? 'on' : ''} onClick={() => setMs(v)}>{fmtMs(v)}</button>)}</div></div>
          </div>
          {tab === 'explore' && mode === 'test' && <button className="btn primary sm" onClick={() => setChecked(true)}>Check this set</button>}
          {tab === 'build' && <button className="btn primary sm" onClick={checkBuild}>Check</button>}
          {tab === 'explore' && live && <Feedback notes={valid ? [{ level: 'ok', msg: `Allowed set: (${n}, ${l}, ${ml}, ${fmtMs(ms)}). Subshell **${sub}**.` }] : errs} />}
          {tab === 'build' && bres && <Feedback notes={bres} />}
          {tab === 'build' && mode === 'learn' && !bres && <Feedback notes={valid ? [{ level: 'info', msg: `This set is allowed (${sub}, orbital ${lobes}).` }] : errs} />}
          <div className="qn-main" style={{ marginTop: 10 }}>
            {shown ? <Orbital n={n} l={l} ml={ml} /> : <div className="ph" style={{ minHeight: 200 }}>Choose a valid set to see the orbital</div>}
            <div>
              <div className="qn-big">{sub}</div>
              {shown && (
                <>
                  <p style={{ margin: '4px 0' }}>Orbital: <b>{lobes}</b>{l === 1 && ' (m_l = 0, +1, −1 ↔ pz, px, py)'}{l === 2 && ' (convention for the real d orbitals)'}</p>
                  <div className="row"><span className="chip">radial nodes n−l−1 = {rad}</span><span className="chip">angular nodes l = {l}</span><span className="chip">total n−1 = {n - 1}</span></div>
                  <p className="muted" style={{ fontSize: 13 }}>{sub} subshell: {2 * l + 1} orbital{l ? 's' : ''}, up to {2 * (2 * l + 1)} e⁻. Shell n = {n}: {n * n} orbitals, up to {2 * n * n} e⁻.</p>
                </>
              )}
              <p className="muted" style={{ fontSize: 12.5 }}>Allowed: l = 0…n−1 (s p d f); m_l = −l…+l; m_s = ±½ (slide L7 s34).</p>
            </div>
          </div>
        </>
      )}
      {tab === 'quick' && (
        <div>
          <div className="row"><span className="chip">score {score.ok}/{score.tot}</span><span className="chip">streak {score.streak}</span></div>
          <p style={{ fontSize: 16 }}><b>{qf.q}</b></p>
          <div className="row">
            <NumInput value={ans} onChange={setAns} placeholder="number" width={90} state={qres == null ? null : qres ? 'ok' : 'err'} disabled={qres != null} />
            {qres == null ? <button className="btn primary sm" onClick={answerQ}>Check</button> : <button className="btn sm" onClick={() => { setQf(quick()); setAns(''); setQres(null) }}>Next →</button>}
          </div>
          {qres != null && <Verdict correct={qres} title={qres ? 'Correct' : `Not quite, the answer is ${qf.a}`}><span>{qf.why}</span></Verdict>}
        </div>
      )}
    </Workbench>
  )
}
