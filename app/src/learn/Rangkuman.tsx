// Rangkuman: cram sheet for Quiz 2. Curated blocks per lecture (content/rangkuman.ts) + every section's key formulas, collected automatically.
import { CONTENT } from '../content'
import { RANGKUMAN } from '../content/rangkuman'
import { LECTURES } from '../types'
import { Md } from '../lib/kit'
import { Figure, KeyFormulas } from './parts'

export default function Rangkuman() {
  return (
    <div className="cram">
      <header className="lec-banner cram-banner" style={{ ['--c' as string]: '#0a84ff' }}>
        <small>Quiz 2 · L7–L10</small>
        <h1>Rangkuman</h1>
        <p>Everything worth cramming on one page: definitions, rules, formulas, tables and the usual traps. Each block links back to the full section.</p>
        <div className="cram-tools">
          {LECTURES.map((l) => <a key={l.id} className="chip" href={`#cram-${l.id}`} onClick={(e) => { e.preventDefault(); document.getElementById('cram-' + l.id)?.scrollIntoView({ behavior: 'smooth' }) }}>{l.id} · {l.title}</a>)}
          <button className="btn sm" onClick={() => window.print()}>Print / save PDF</button>
        </div>
      </header>
      {LECTURES.map((l) => {
        const part = RANGKUMAN.find((p) => p.lecture === l.id)
        const formulas = CONTENT[l.id].sections.flatMap((s) => s.formulas ?? [])
        if (!part && !formulas.length) return null
        return (
          <section key={l.id} id={'cram-' + l.id} className="sec cram-part" style={{ ['--c' as string]: l.color }}>
            <h2><span className="cram-tag">{l.id}</span>{part?.title ?? l.title}</h2>
            <div className="cram-grid">
              {part?.blocks.map((b, i) => (
                <div key={i} className="cram-block">
                  <h3>{b.title}</h3>
                  <Md>{b.md}</Md>
                  {b.figure && <Figure id={b.figure} />}
                </div>
              ))}
            </div>
            {formulas.length > 0 && <KeyFormulas items={formulas} title={`All ${l.id} formulas`} />}
          </section>
        )
      })}
      {!RANGKUMAN.length && <p className="muted" style={{ margin: '18px 32px' }}>The Rangkuman is being written…</p>}
    </div>
  )
}
