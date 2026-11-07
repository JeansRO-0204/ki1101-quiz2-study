import { useMemo, useRef, useState } from 'react'
import './l7.css'
import { Workbench, useMode, type Note } from '../../lib/kit'
import type { WidgetProps } from '../../types'
import { ELEMENTS, type Element } from '../../lib/chem/elements'
import { StepRunner, type StepDef } from './StepRunner'
import { PTGrid } from './shared'

type Prop = 'radius' | 'ie1' | 'ea' | 'en'
const META: Record<Prop, { name: string; unit: string; stops: string[]; fmt: (e: Element) => string; val: (e: Element) => number | undefined; lo: number; hi: number; note: string }> = {
  radius: { name: 'Atomic radius', unit: 'pm', stops: ['#ecfeff', '#22d3ee', '#0e7490', '#083344'], fmt: (e) => String(e.radius), val: (e) => e.radius, lo: 30, hi: 300, note: 'Larger down a group (n ↑), smaller across a period (Z_eff ↑).' },
  ie1: { name: 'First ionization energy', unit: 'kJ/mol', stops: ['#f5f3ff', '#a78bfa', '#6d28d9', '#2e1065'], fmt: (e) => String(Math.round(e.ie1!)), val: (e) => e.ie1, lo: 350, hi: 2400, note: 'Larger across a period (Z_eff ↑), smaller down a group (n ↑, more shielding).' },
  ea: { name: 'Electron affinity (energy released)', unit: 'kJ/mol (shown as EA, more negative = more released)', stops: ['#f0fdf4', '#4ade80', '#15803d', '#052e16'], fmt: (e) => String(Math.round(e.ea!)), val: (e) => (e.ea == null ? undefined : -e.ea), lo: 0, hi: 350, note: 'Generally more negative toward the upper right (F/Cl); noble gases, Be, Mg, N ≈ 0.' },
  en: { name: 'Electronegativity (Pauling, slide values)', unit: '', stops: ['#fff7ed', '#fdba74', '#ea580c', '#7c2d12'], fmt: (e) => e.en!.toFixed(1), val: (e) => e.en, lo: 0.7, hi: 4.1, note: 'Increases across a period (Z_eff ↑) and decreases down a group (n ↑). F is highest.' },
}
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
function scale(stops: string[], t: number): string {
  const x = Math.max(0, Math.min(1, t)) * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(x)), f = x - i
  const a = hex(stops[i]), b = hex(stops[i + 1])
  return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',')})`
}
const ANOM: Record<Prop, { syms: string[]; msg: string }> = {
  ie1: { syms: ['Be', 'B', 'N', 'O', 'Mg', 'Al', 'P', 'S'], msg: '**Dips in IE₁:** Be (899) → B (801): B’s 2p electron is higher in energy and shielded by 2s², so it is easier to remove. N (1402) → O (1314): O’s paired 2p electron is repelled by its partner. Same pattern for Mg→Al and P→S.' },
  ea: { syms: ['Be', 'N', 'Mg', 'F', 'Cl', 'Ne', 'Ar'], msg: '**EA anomalies:** Be, Mg, N and noble gases have ≈ 0 (full ns or half-filled np or full shells: no stable anion). Cl (−349) is more negative than F (−328): F is so small that adding an electron raises electron–electron repulsion.' },
  radius: { syms: ['Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn'], msg: '**Transition metals:** radius changes little across the 3d series: added electrons go into the inner (n−1)d subshell which shields the outer 4s electrons, so Z_eff barely grows.' },
  en: { syms: [], msg: 'No big anomalies in EN: smooth rise to F (4.1 on the slide scale). Metals low (≈ 0.9–1.7), nonmetals high.' },
}

function tooltipText(e: Element) {
  return [`${e.name} (${e.symbol}, Z = ${e.z})`, `radius: ${e.radius ?? '—'} pm`, `IE₁: ${e.ie1 ?? '—'} kJ/mol`, `EA: ${e.ea != null ? e.ea + ' kJ/mol' : '≈ 0 / no stable anion'}`, `EN: ${e.en ?? '—'}`]
}

/* ---------- rank challenge ---------- */
interface Chal { prop: Prop; els: Element[]; dir: 'inc' | 'dec' }
const MAIN = ELEMENTS.filter((e) => e.z <= 56 && e.block !== 'd' && e.block !== 'f' && e.group !== 18 && e.z !== 1)
function mkChal(prop: Prop): Chal {
  const ok = (e: Element) => META[prop].val(e) != null
  for (let tries = 0; tries < 200; tries++) {
    const kind = ['period', 'group', 'mixed'][Math.floor(Math.random() * 3)]
    let pool: Element[]
    if (kind === 'period') { const p = 2 + Math.floor(Math.random() * 2); pool = MAIN.filter((e) => e.period === p) }
    else if (kind === 'group') { const g = [1, 2, 14, 15, 16, 17][Math.floor(Math.random() * 6)]; pool = MAIN.filter((e) => e.group === g) }
    else pool = MAIN.filter((e) => e.period >= 2 && e.period <= 5)
    pool = pool.filter(ok)
    if (pool.length < 4) continue
    const els = [...pool].sort(() => Math.random() - 0.5).slice(0, 4)
    const v = els.map((e) => META[prop].val(e)!).sort((a, b) => a - b)
    const rel = v.every((x, i) => i === 0 || (x - v[i - 1]) / Math.max(Math.abs(x), 1) > 0.05)
    if (rel) return { prop, els, dir: 'inc' }
  }
  return { prop, els: ['Li', 'Be', 'B', 'C'].map((s) => ELEMENTS.find((e) => e.symbol === s)!), dir: 'inc' }
}
function reason(a: Element, b: Element, prop: Prop): string {
  const samePeriod = a.period === b.period, sameGroup = a.group === b.group
  const lowIE = (x: Element, y: Element) => (x.symbol === 'B' && y.symbol === 'Be') || (x.symbol === 'O' && y.symbol === 'N') || (x.symbol === 'Al' && y.symbol === 'Mg') || (x.symbol === 'S' && y.symbol === 'P')
  if (prop === 'ie1' && (lowIE(a, b) || lowIE(b, a))) return 'this is one of the IE₁ dips (subshell energy / pairing repulsion), not the simple Z_eff trend.'
  if (prop === 'ea' && (samePeriod || sameGroup)) return 'electron affinity only follows the Z_eff / n trend roughly: there are well-known irregularities (e.g. Cl is more exothermic than F, S more than O, and B is below Li), so use the plotted values (L7 s43).'
  if (samePeriod) return `same period (same n), so Z_eff increases to the right: ${prop === 'radius' ? 'the electron cloud is pulled in (smaller radius)' : 'the nucleus holds electrons more strongly (higher IE / EN, more energy released for EA)'}.`
  if (sameGroup) return `same group (similar Z_eff), so going down adds a shell (n ↑) and more shielding: ${prop === 'radius' ? 'larger radius' : 'valence electrons are farther away and less tightly held: lower IE / EN, less EA'}.`
  return 'different period and group: moving down raises n (bigger, more shielded) while moving right raises Z_eff. Compare each step separately, the shell change usually dominates for radius and IE.'
}

function Rank({ mode, resetKey }: { mode: 'learn' | 'test'; resetKey: number }) {
  const [prop, setProp] = useState<Prop>('radius')
  const [chal, setChal] = useState(() => mkChal('radius'))
  const [order, setOrder] = useState<string[]>([])
  const shuffled = useMemo(() => chal.els, [chal])
  const sorted = [...chal.els].sort((a, b) => META[prop].val(a)! - META[prop].val(b)!)
  const label = prop === 'ea' ? 'increasing energy released when gaining an electron (|EA|)' : 'increasing ' + META[prop].name.toLowerCase().replace(/ \(.*/, '')
  const rel = (() => {
    const e = chal.els
    if (e.every((x) => x.period === e[0].period)) return 'period'
    if (e.every((x) => x.group === e[0].group)) return 'group'
    return 'mixed'
  })()
  const steps: StepDef[] = [
    { kind: 'choice', id: 'rel', title: 'What relates these four elements?', answer: rel,
      options: [{ value: 'period', label: 'Same period (n fixed → Z_eff decides)' }, { value: 'group', label: 'Same group (n and shielding decide)' }, { value: 'mixed', label: 'Mixed periods and groups' }],
      wrong: Object.fromEntries(['period', 'group', 'mixed'].map((k) => [k, `Look at the positions: ${chal.els.map((x) => `${x.symbol} (period ${x.period}, group ${x.group})`).join(', ')}.`])), explain: `Relation: ${rel}.` },
    { kind: 'custom', id: 'rank', title: <>Rank by <b>{label}</b> (smallest first): click elements in order</>,
      hint: prop === 'ie1' ? 'Remember the dips: Be > B and N > O.' : 'Think Z_eff across a period, n down a group.',
      check: () => {
        if (order.length < chal.els.length) return { ok: false, notes: [{ level: 'warn', msg: 'Place all four elements first.' } as Note] }
        const want = sorted.map((x) => x.symbol)
        if (order.join() === want.join()) return { ok: true, notes: [{ level: 'ok', msg: `Correct: ${sorted.map((x) => `${x.symbol} (${META[prop].fmt(x)})`).join(' < ')}.` } as Note] }
        const notes: Note[] = []
        for (let i = 0; i < order.length - 1; i++) {
          const a = ELEMENTS.find((x) => x.symbol === order[i])!, b = ELEMENTS.find((x) => x.symbol === order[i + 1])!
          if (META[prop].val(a)! > META[prop].val(b)!) notes.push({ level: 'err', msg: `${a.symbol} before ${b.symbol} is wrong: ${a.symbol} = ${META[prop].fmt(a)}, ${b.symbol} = ${META[prop].fmt(b)}. ${a.symbol}/${b.symbol}: ${reason(a, b, prop)}` })
        }
        notes.push({ level: 'info', msg: `Correct order: ${want.join(' < ')}.` })
        return { ok: false, notes }
      },
      render: () => (
        <div>
          <div className="tr-rank">{chal.els.map((x) => <button key={x.symbol} className="tr-chip" disabled={order.includes(x.symbol)} onClick={() => setOrder((o) => [...o, x.symbol])}>{x.symbol}</button>)}</div>
          <div className="tr-rank">{chal.els.map((_, i) => <button key={i} className={'tr-slot' + (order[i] ? ' f' : '')} onClick={() => setOrder((o) => o.slice(0, i))} title="click to remove this and later">{order[i] ?? i + 1}</button>)}</div>
        </div>) },
  ]
  void shuffled
  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <div className="seg">{(['radius', 'ie1', 'ea', 'en'] as Prop[]).map((p) => <button key={p} className={prop === p ? 'on' : ''} onClick={() => { setProp(p); setChal(mkChal(p)); setOrder([]) }}>{p === 'ie1' ? 'IE₁' : p === 'radius' ? 'Radius' : p.toUpperCase()}</button>)}</div>
        <button className="btn sm" onClick={() => { setChal(mkChal(prop)); setOrder([]) }}>New set</button>
      </div>
      <StepRunner steps={steps} mode={mode} resetKey={`${chal.els.map((x) => x.symbol).join('')}-${prop}-${mode}-${resetKey}`} />
    </div>
  )
}

export default function Trends(props: WidgetProps) {
  const [mode, setMode] = useMode(props.mode, 'chem.mode.trends')
  const [prop, setProp] = useState<Prop>('ie1')
  const [tab, setTab] = useState<'map' | 'rank'>('map')
  const [anom, setAnom] = useState(true)
  const [hover, setHover] = useState<{ e: Element; x: number; y: number } | null>(null)
  const [nonce, setNonce] = useState(0)
  const wrap = useRef<HTMLDivElement>(null)
  const M = META[prop]
  const an = new Set(anom ? ANOM[prop].syms : [])
  const cell = props.compact ? 28 : 38
  return (
    <Workbench title="Periodic trends" subtitle="radius · IE₁ · EA · EN" compact={props.compact} mode={tab === 'rank' ? mode : undefined} onMode={setMode} onReset={() => setNonce((n) => n + 1)}
      tools={<div className="seg"><button className={tab === 'map' ? 'on' : ''} onClick={() => setTab('map')}>Heatmap</button><button className={tab === 'rank' ? 'on' : ''} onClick={() => setTab('rank')}>Rank these</button></div>}>
      {tab === 'map' ? (
        <>
          <div className="row" style={{ marginBottom: 8 }}>
            <div className="seg">{(['radius', 'ie1', 'ea', 'en'] as Prop[]).map((p) => <button key={p} className={prop === p ? 'on' : ''} onClick={() => setProp(p)}>{p === 'ie1' ? 'IE₁' : p === 'radius' ? 'Radius' : p.toUpperCase()}</button>)}</div>
            <label style={{ fontSize: 12.5 }}><input type="checkbox" checked={anom} onChange={(e) => setAnom(e.target.checked)} /> highlight anomalies</label>
          </div>
          <div className="tr-wrap" ref={wrap} onMouseLeave={() => setHover(null)}>
            <PTGrid cell={cell} maxZ={86} render={(e) => {
              const v = M.val(e)
              const has = v != null
              const t = has ? (v! - M.lo) / (M.hi - M.lo) : 0
              const bg = has ? scale(M.stops, t) : undefined
              return (
                <div className={'tr-cell' + (has ? '' : ' na') + (an.has(e.symbol) ? ' anom' : '')} style={has ? { background: bg, color: t > 0.5 ? '#fff' : '#0f172a' } : undefined}
                  onMouseEnter={(ev) => { const r = ev.currentTarget.getBoundingClientRect(), w = wrap.current!.getBoundingClientRect(); setHover({ e, x: r.left - w.left + wrap.current!.scrollLeft + cell, y: r.top - w.top }) }}>
                  {e.symbol}{has && <small>{M.fmt(e)}</small>}
                </div>)
            }} />
            {hover && <div className="tr-tip" style={{ left: hover.x, top: Math.max(0, hover.y - 4) }}>{tooltipText(hover.e).map((l, i) => <div key={i} style={i === 0 ? { fontWeight: 700 } : undefined}>{l}</div>)}</div>}
          </div>
          <div className="tr-legend"><span>{prop === 'ea' ? '0' : M.lo}</span><i style={{ background: `linear-gradient(90deg, ${M.stops.join(',')})` }} /><span>{prop === 'ea' ? '−350' : M.hi}</span><span className="muted">{M.name} {M.unit && `(${M.unit.split(' ')[0]})`}</span></div>
          <div className="row" style={{ fontSize: 13, gap: 16 }}>
            <span>→ across a period: <b>{prop === 'radius' ? '↓ smaller' : '↑ larger'}</b></span>
            <span>↓ down a group: <b>{prop === 'radius' ? '↑ larger' : '↓ smaller'}</b></span>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>{M.note} Hatched cells: no stable anion / no data. Slides: L7 s40–s43, L8 s33–s37.</p>
          {anom && ANOM[prop].msg && <div className="wb-fb"><li className="info" style={{ display: 'flex', gap: 8, padding: '6px 10px', borderRadius: 8, listStyle: 'none' }}><span className="ic">ℹ</span><span dangerouslySetInnerHTML={{ __html: ANOM[prop].msg.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} /></li></div>}
        </>
      ) : <Rank mode={mode} resetKey={nonce} />}
    </Workbench>
  )
}
