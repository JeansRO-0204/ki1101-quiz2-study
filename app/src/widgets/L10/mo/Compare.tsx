import { useState } from 'react'
import { Tex } from '../../../lib/kit'
import { LIT, findSpecies, speciesInfo } from './engine'
import './mo.css'

const IDS = ['Li2', 'Be2', 'B2', 'C2', 'N2', 'O2', 'F2', 'Ne2']
type Metric = 'bo' | 'energy' | 'len'

/** Bar chart across Li2…Ne2: bond order (from the engine / slides s119-s126); energy & length are literature values (beyond slides). */
export function Compare({ current, onPick, compact }: { current: string; onPick?: (id: string) => void; compact?: boolean }) {
  const [metric, setMetric] = useState<Metric>('bo')
  const [hover, setHover] = useState<string | null>(null)
  const rows = IDS.map((id) => {
    const info = speciesInfo(findSpecies(id)!)
    const lit = LIT[id]
    const v = metric === 'bo' ? info.bo : metric === 'energy' ? lit?.energy : lit?.len
    return { id, info, v }
  })
  const max = Math.max(...rows.map((r) => r.v ?? 0)) || 1
  const W = 560, H = 210, L = 36, B = 40, T = 22
  const bw = (W - L - 10) / rows.length
  const label = metric === 'bo' ? 'Bond order' : metric === 'energy' ? 'Bond energy (kJ/mol)' : 'Bond length (pm)'
  const show = hover ?? current
  const sr = rows.find((r) => r.id === show) ?? rows[0]
  return (
    <div className="mo-compare">
      <div className="mo-cmp-head">
        <b>Compare Li₂ → Ne₂</b>
        <div className="seg">
          <button className={metric === 'bo' ? 'on' : ''} onClick={() => setMetric('bo')}>Bond order</button>
          <button className={metric === 'energy' ? 'on' : ''} onClick={() => setMetric('energy')}>Energy*</button>
          <button className={metric === 'len' ? 'on' : ''} onClick={() => setMetric('len')}>Length*</button>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mo-svg mo-cmp-svg" role="img" aria-label={label + ' across Li2 to Ne2'}>
        <line x1={L} x2={W - 6} y1={H - B} y2={H - B} stroke="#cfd6e2" />
        <text x={L} y={12} className="mo-axis">{label}</text>
        {rows.map((r, i) => {
          const x = L + i * bw + bw * 0.18
          const w = bw * 0.64
          const h = r.v == null ? 0 : ((H - B - T) * r.v) / max
          const sel = r.id === current
          return (
            <g key={r.id} className={'mo-bar' + (sel ? ' sel' : '')} onMouseEnter={() => setHover(r.id)} onMouseLeave={() => setHover(null)} onClick={() => onPick?.(r.id)} style={{ cursor: onPick ? 'pointer' : 'default' }}>
              <rect x={x} y={H - B - h} width={w} height={Math.max(h, 0)} rx={4} className={r.info.bo === 0 ? 'zero' : ''} />
              {r.v == null || r.v === 0 ? <text x={x + w / 2} y={H - B - 6} textAnchor="middle" className="mo-axis">{metric === 'bo' || r.v === 0 ? '0' : 'n/a'}</text> : (
                <text x={x + w / 2} y={H - B - h - 5} textAnchor="middle" className="mo-axis">{r.v}</text>
              )}
              <text x={x + w / 2} y={H - B + 16} textAnchor="middle" className="mo-bar-l">{r.id.replace('2', '')}₂</text>
              <circle cx={x + w / 2} cy={H - B + 28} r={4.2} className={r.info.unpaired > 0 ? 'para' : 'dia'} />
            </g>
          )
        })}
      </svg>
      <div className="mo-cmp-foot">
        <span className="chip"><i className="mo-dot para" /> paramagnetic</span>
        <span className="chip"><i className="mo-dot dia" /> diamagnetic</span>
        {!compact && <span className="muted mo-small">
          {sr.id.replace('2', '')}₂: <Tex>{`\\text{BO}=\\tfrac12(${sr.info.bonding}-${sr.info.anti})=${sr.info.bo}`}</Tex>, {sr.info.unpaired} unpaired{sr.info.bo === 0 ? ', does not form' : ''}
        </span>}
      </div>
      {metric !== 'bo' && <p className="mo-small muted">* Energy and length are typical literature values, not given on the slides. Slides give BO and stability (s119–s126). Be₂ and Ne₂ do not form (BO 0). Trend: higher BO → shorter, stronger bond (L9 s46); F₂ is weak because BO = 1 with many lone-pair repulsions (general knowledge).</p>}
    </div>
  )
}
