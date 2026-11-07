import { useMemo, useRef, useState } from 'react'
import type { WidgetProps } from '../../types'
import { Feedback, NumInput, SlideRef, Step, Verdict, Workbench, parseNum, recordAttempt, useMode, type Note, type StepStatus } from '../../lib/kit'
import './l8.css'

interface Bond { id: string; bo: number; len: number; en: number; lenSrc: 's' | 'g'; enSrc: 's' | 'g' }
interface Fam { id: string; name: string; bonds: Bond[] }
// s = on the slides (L9 s10 energies, L10 s131 / L8 s31 lengths), g = typical literature value (beyond slides)
const FAMS: Fam[] = [
  { id: 'cc', name: 'C–C', bonds: [
    { id: 'C–C', bo: 1, len: 154, en: 348, lenSrc: 'g', enSrc: 's' }, { id: 'C=C', bo: 2, len: 134, en: 612, lenSrc: 'g', enSrc: 's' }, { id: 'C≡C', bo: 3, len: 120, en: 960, lenSrc: 'g', enSrc: 's' }] },
  { id: 'cn', name: 'C–N', bonds: [
    { id: 'C–N', bo: 1, len: 147, en: 305, lenSrc: 'g', enSrc: 's' }, { id: 'C=N', bo: 2, len: 128, en: 613, lenSrc: 'g', enSrc: 's' }, { id: 'C≡N', bo: 3, len: 116, en: 890, lenSrc: 'g', enSrc: 's' }] },
  { id: 'co', name: 'C–O', bonds: [
    { id: 'C–O', bo: 1, len: 143, en: 360, lenSrc: 'g', enSrc: 's' }, { id: 'C=O', bo: 2, len: 123, en: 743, lenSrc: 'g', enSrc: 's' }, { id: 'C≡O', bo: 3, len: 113, en: 1072, lenSrc: 's', enSrc: 'g' }] },
  { id: 'nn', name: 'N–N', bonds: [
    { id: 'N–N', bo: 1, len: 145, en: 163, lenSrc: 'g', enSrc: 'g' }, { id: 'N=N', bo: 2, len: 125, en: 409, lenSrc: 'g', enSrc: 'g' }, { id: 'N≡N', bo: 3, len: 110, en: 945, lenSrc: 'g', enSrc: 'g' }] },
  { id: 'no', name: 'NO⁺ / NO / NO⁻', bonds: [
    { id: 'NO⁺', bo: 3, len: 106, en: 1025, lenSrc: 's', enSrc: 's' }, { id: 'NO', bo: 2.5, len: 115, en: 630, lenSrc: 's', enSrc: 's' }, { id: 'NO⁻', bo: 2, len: 130, en: 400, lenSrc: 's', enSrc: 's' }] },
]

interface Res { id: string; name: string; note: string; n: number; p: number; what: string }
const RES: Res[] = [
  { id: 'no3', name: 'NO₃⁻', what: 'N–O', n: 4, p: 3, note: 'Three equivalent resonance structures: one N=O (2 bonds) + two N–O (1 each) = 4 bonds shared over 3 N–O positions (L9 s57).' },
  { id: 'co3', name: 'CO₃²⁻', what: 'C–O', n: 4, p: 3, note: 'One C=O + two C–O = 4 bonds over 3 C–O positions (L9 s60).' },
  { id: 'no2', name: 'NO₂⁻', what: 'N–O', n: 3, p: 2, note: 'One N=O + one N–O = 3 bonds over 2 N–O positions.' },
  { id: 'o3', name: 'O₃', what: 'O–O', n: 3, p: 2, note: 'One O=O + one O–O = 3 bonds over 2 O–O positions.' },
  { id: 'hcoo', name: 'HCOO⁻ (formate)', what: 'C–O', n: 3, p: 2, note: 'One C=O + one C–O = 3 bonds over 2 C–O positions (L10 s137).' },
  { id: 'c6h6', name: 'C₆H₆ (benzene)', what: 'C–C ring', n: 9, p: 6, note: 'Kekulé structure: 3 C=C (6) + 3 C–C (3) = 9 bonds over 6 ring C–C positions (L10 s140).' },
]

function rng(seed: number) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

interface Q { fam: Fam; a: Bond; b: Bond; prop: 'len' | 'en' }
const qText = (q: Q) => (q.prop === 'len' ? `Which bond is longer: ${q.a.id} or ${q.b.id}?` : `Which bond is stronger (larger bond energy): ${q.a.id} or ${q.b.id}?`)
const qAns = (q: Q) => (q.prop === 'len' ? (q.a.len > q.b.len ? q.a : q.b) : q.a.en > q.b.en ? q.a : q.b)
const unitSrc = (b: Bond, p: 'len' | 'en') => (p === 'len' ? b.lenSrc : b.enSrc) === 's' ? '' : '*'
function qExplain(q: Q) {
  const w = qAns(q), o = w === q.a ? q.b : q.a
  const v = (b: Bond) => (q.prop === 'len' ? `${b.len} pm${unitSrc(b, 'len')}` : `${b.en} kJ/mol${unitSrc(b, 'en')}`)
  const hi = q.a.bo > q.b.bo ? q.a : q.b, lo = hi === q.a ? q.b : q.a
  return `${hi.id} has the higher bond order (${hi.bo} vs ${lo.bo}) → more electron density between the nuclei → nuclei held closer and more tightly: **shorter bond, larger bond energy** (L9 s46). So ${w.id} (${v(w)}) ${q.prop === 'len' ? 'is longer' : 'is stronger'} than ${o.id} (${v(o)}).`
}

function Chart({ fam, sel, onSel }: { fam: Fam; sel: string; onSel: (id: string) => void }) {
  const W = 520, H = 130
  const mk = (title: string, key: 'len' | 'en', unit: string, x0: number, color: string) => {
    const max = Math.max(...fam.bonds.map((b) => b[key]))
    const bw = 46, gap = 18
    return (
      <g>
        <text x={x0} y={14} className="bp-l">{title} <tspan className="bp-t">({unit})</tspan></text>
        {fam.bonds.map((b, i) => {
          const h = (b[key] / max) * (H - 54)
          const x = x0 + i * (bw + gap)
          return (
            <g key={b.id} className={'bp-bar' + (b.id === sel ? ' on' : '')} onClick={() => onSel(b.id)}>
              <rect x={x} y={H - 28 - h} width={bw} height={h} rx={5} fill={color} />
              <text x={x + bw / 2} y={H - 32 - h} textAnchor="middle" className="bp-t">{b[key]}{unitSrc(b, key)}</text>
              <text x={x + bw / 2} y={H - 10} textAnchor="middle" className="bp-l">{b.id}</text>
            </g>
          )
        })}
      </g>
    )
  }
  return (
    <svg viewBox={`0 0 ${W} ${H + 8}`} className="bp-svg" role="img" aria-label="Bond length and bond energy">
      {mk('Bond length', 'len', 'pm', 12, '#0ea5e9')}
      {mk('Bond energy', 'en', 'kJ/mol', 276, '#f59e0b')}
    </svg>
  )
}

export default function BondProps({ mode: forced, onResult, compact }: WidgetProps) {
  const [mode, setMode] = useMode(forced)
  const [fid, setFid] = useState('cc')
  const fam = FAMS.find((f) => f.id === fid)!
  const [sel, setSel] = useState('C=C')
  const cur = fam.bonds.find((b) => b.id === sel) ?? fam.bonds[0]
  const [seed, setSeed] = useState(1)
  const [ans, setAns] = useState<Record<number, string>>({})
  const [shown, setShown] = useState(false)

  const qs: Q[] = useMemo(() => {
    const r = rng(seed * 7919)
    const pool: Q[] = []
    FAMS.forEach((f) => { for (let i = 0; i < f.bonds.length; i++) for (let j = i + 1; j < f.bonds.length; j++) (['len', 'en'] as const).forEach((prop) => {
      const flip = r() < 0.5
      pool.push({ fam: f, a: flip ? f.bonds[j] : f.bonds[i], b: flip ? f.bonds[i] : f.bonds[j], prop })
    }) })
    return pool.map((q) => ({ q, k: r() })).sort((x, y) => x.k - y.k).slice(0, 4).map((x) => x.q)
  }, [seed])
  const newRound = () => { setSeed((s) => s + 1); setAns({}); setShown(false) }

  // resonance
  const [rid, setRid] = useState('no3')
  const rs = RES.find((r) => r.id === rid)!
  const [nStr, setNStr] = useState(''), [pStr, setPStr] = useState(''), [boStr, setBoStr] = useState(''), [rel, setRel] = useState<string | null>(null)
  const [rres, setRres] = useState<Record<number, { ok: boolean; notes: Note[] } | undefined>>({})
  const [rwrong, setRwrong] = useState(0)
  const [rChecked, setRChecked] = useState(false)
  const fired = useRef(false)
  const rclear = (i: number) => setRres((r) => { const x = { ...r }; delete x[i]; return x })
  const rreset = () => { setNStr(''); setPStr(''); setBoStr(''); setRel(null); setRres({}); setRwrong(0); setRChecked(false); fired.current = false }
  const frac = (n: number, p: number) => (n % p === 0 ? String(n / p) : `${n}/${p} = ${(n / p).toFixed(2)}`)

  function rev(i: number): { ok: boolean; notes: Note[] } {
    if (i === 0) {
      const x = parseNum(nStr)
      if (x === rs.n) return { ok: true, notes: [{ level: 'ok', msg: `${rs.n} bonds (double = 2, single = 1). ${rs.note}` }] }
      return { ok: false, notes: [{ level: 'err', msg: x === rs.p ? 'That is the number of positions. Count the bonds themselves in ONE resonance structure: a double bond counts 2, a single bond 1.' : 'Draw one Lewis structure and add up the bond order of every bond from the central atom to the equivalent atoms (double = 2, single = 1).' }] }
    }
    if (i === 1) {
      const x = parseNum(pStr)
      if (x === rs.p) return { ok: true, notes: [{ level: 'ok', msg: `${rs.p} equivalent ${rs.what} positions share the bonding.` }] }
      return { ok: false, notes: [{ level: 'err', msg: `Count only the equivalent ${rs.what} bonds over which the double bond can move, not the lone pairs or the central atom.` }] }
    }
    if (i === 2) {
      const x = parseNum(boStr), v = rs.n / rs.p
      const sx = boStr.includes('/') ? (() => { const [a, b] = boStr.split('/'); return parseNum(a) / parseNum(b) })() : x
      if (Math.abs(sx - v) < 0.01) return { ok: true, notes: [{ level: 'ok', msg: `Average bond order = ${rs.n}/${rs.p} = **${frac(rs.n, rs.p)}**.` }] }
      const notes: Note[] = []
      if (Math.abs(sx - rs.n) < 0.01) notes.push({ level: 'err', msg: 'You forgot to divide by the number of equivalent positions: BO = total bonds / positions.' })
      else if (Math.abs(sx - 1.5) < 0.01 && rs.p === 3) notes.push({ level: 'err', msg: 'With 3 equivalent positions and 4 bonds the average is 4/3, not 1.5.' })
      else notes.push({ level: 'hint', msg: `BO = (bonds in one structure) / (equivalent positions) = ${rs.n} / ${rs.p}.` })
      return { ok: false, notes }
    }
    if (rel === 'between') return { ok: true, notes: [{ level: 'ok', msg: `Yes: a bond order between 1 and 2 gives a length and energy **between** the single- and double-bond values; all ${rs.what} bonds are identical, not one short + others long (L9 s58, s46).` }] }
    return { ok: false, notes: [{ level: 'err', msg: rel ? 'Resonance does not make some bonds double and others single; the electrons are delocalized, so every equivalent bond has the same intermediate length.' : 'Pick one.' }] }
  }
  const rfinish = (ok: boolean, score: number) => {
    if (fired.current) return
    fired.current = true
    onResult?.({ correct: ok, score, summary: `${rs.name}: average bond order ${frac(rs.n, rs.p)}` })
    if (onResult) recordAttempt({ id: `bond-props:${rs.id}`, lecture: 'L9', topic: 'Bond order / resonance', correct: ok, score })
  }
  const rcheck = (i: number) => {
    const r = rev(i); setRres((p) => ({ ...p, [i]: r }))
    if (!r.ok) setRwrong((w) => w + 1)
    else if (i === 3 && mode === 'learn') rfinish(rwrong === 0, Math.max(0, 1 - 0.15 * rwrong))
  }
  const rcheckAll = () => {
    const o: Record<number, { ok: boolean; notes: Note[] }> = {}
    for (let i = 0; i < 4; i++) o[i] = rev(i)
    setRres(o); setRChecked(true)
    const n = [0, 1, 2, 3].filter((i) => o[i].ok).length
    rfinish(n === 4, n / 4)
  }
  const rstatus = (i: number): StepStatus => {
    if (mode === 'learn') { if (i > 0 && !rres[i - 1]?.ok) return 'locked'; return rres[i] ? (rres[i]!.ok ? 'done' : 'error') : 'active' }
    return rChecked ? (rres[i]?.ok ? 'done' : 'error') : 'active'
  }
  const rbtn = (i: number) => mode === 'learn' && rstatus(i) !== 'done' && <div className="ie-check"><button className="btn primary sm" onClick={() => rcheck(i)}>Check</button></div>
  const rst = (i: number) => (mode === 'learn' || rChecked) && rres[i] ? (rres[i]!.ok ? 'ok' : 'err') : null

  const answered = qs.every((_, i) => ans[i])
  const reveal = (i: number) => mode === 'learn' ? !!ans[i] : shown
  const score = qs.filter((q, i) => ans[i] === qAns(q).id).length

  return (
    <Workbench title="Bond order · length · energy" compact={compact} mode={mode} onMode={setMode} onReset={() => { newRound(); rreset() }}
      subtitle={<>Higher bond order → shorter, stronger bond <SlideRef l="L9" s={46} /></>}>
      <div className={'bp-layout' + (compact ? ' compact' : '')}>
        <div>
          <div className="bp-tabs">
            {FAMS.map((f) => <button key={f.id} className={'btn sm' + (f.id === fid ? ' on' : '')} onClick={() => { setFid(f.id); setSel(f.bonds[1].id) }}>{f.name}</button>)}
          </div>
          <Chart fam={fam} sel={cur.id} onSel={setSel} />
          <div className="bp-card">
            <b>{cur.id}</b> · bond order <b>{cur.bo}</b><br />
            length {cur.len} pm{unitSrc(cur, 'len')} · energy {cur.en} kJ/mol{unitSrc(cur, 'en')}
            <div className="ie-small muted">
              {fam.id === 'no' ? 'NO⁺ / NO / NO⁻ values: L10 s131.' : 'Bond energies of C–C … C=O: L9 s10.'} * = typical literature value, not on the slides. Compare only bonds between the same two elements (L9 s46).
            </div>
          </div>
        </div>

        <div>
          <div className="bp-q-head"><b>Predict, then reveal</b></div>
          {qs.map((q, i) => (
            <div key={seed + '-' + i} className="bp-q">
              <div className="ie-small"><b>{i + 1}.</b> {qText(q)}</div>
              <div className="bp-opts">
                {[q.a, q.b].map((b) => {
                  const done = reveal(i)
                  const cls = done ? (b.id === qAns(q).id ? 'ok' : ans[i] === b.id ? 'err' : '') : ans[i] === b.id ? 'on' : ''
                  return <button key={b.id} className={cls} disabled={mode === 'learn' ? !!ans[i] : shown} onClick={() => setAns({ ...ans, [i]: b.id })}>{b.id}</button>
                })}
              </div>
              {reveal(i) && <Feedback notes={[{ level: ans[i] === qAns(q).id ? 'ok' : 'err', msg: qExplain(q) }]} />}
            </div>
          ))}
          <div className="row">
            {mode === 'test' && !shown && <button className="btn primary sm" disabled={!answered} onClick={() => setShown(true)}>Check all</button>}
            {(mode === 'learn' ? answered : shown) && <><span className="chip ok">{score}/4 correct</span><button className="btn sm" onClick={newRound}>New questions</button></>}
          </div>

          <div className="bp-q-head" style={{ marginTop: 18 }}><b>Resonance-averaged bond order</b></div>
          <div className="row" style={{ margin: '6px 0' }}>
            <select className="pe-select" value={rid} onChange={(e) => { setRid(e.target.value); rreset() }}>{RES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
          </div>
          <Step n={1} title={<>Total bonds in one structure ({rs.what})</>} status={rstatus(0)} notes={rres[0]?.notes}>
            <NumInput value={nStr} onChange={(s) => { setNStr(s); rclear(0) }} placeholder="e.g. 4" width={80} state={rst(0)} />{rbtn(0)}
          </Step>
          <Step n={2} title="Number of equivalent positions" status={rstatus(1)} notes={rres[1]?.notes}>
            <NumInput value={pStr} onChange={(s) => { setPStr(s); rclear(1) }} placeholder="e.g. 3" width={80} state={rst(1)} />{rbtn(1)}
          </Step>
          <Step n={3} title="Average bond order" status={rstatus(2)} notes={rres[2]?.notes}>
            <NumInput value={boStr} onChange={(s) => { setBoStr(s); rclear(2) }} placeholder="e.g. 4/3" width={90} state={rst(2)} />{rbtn(2)}
          </Step>
          <Step n={4} title="So the bond length is…" status={rstatus(3)} notes={rres[3]?.notes}>
            <div className="bp-opts">
              {[['between', 'between single and double'], ['mixed', 'one short double + others long single'], ['single', 'same as a single bond']].map(([k, t]) => <button key={k} className={rel === k ? 'on' : ''} onClick={() => { setRel(k); rclear(3) }}>{t}</button>)}
            </div>
            {rbtn(3)}
          </Step>
          {mode === 'test' && !rChecked && <div className="ie-check"><button className="btn primary sm" onClick={rcheckAll}>Check resonance steps</button></div>}
          {(mode === 'learn' ? !!rres[3]?.ok : rChecked) && <Verdict correct={[0, 1, 2, 3].every((i) => rres[i]?.ok) ? true : 'partial'} title={`${rs.name}: ${rs.what} bond order = ${frac(rs.n, rs.p)}`} />}
        </div>
      </div>
    </Workbench>
  )
}
