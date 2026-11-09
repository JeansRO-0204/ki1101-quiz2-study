// Shared Materials pieces: the "Must know" + "Key formulas" boxes and static figures (also used by the Rangkuman).
import type { KeyFormula } from '../types'
import { Md, Tex } from '../lib/kit'
import { FIGURES } from '../content/figures'

export function MustKnow({ items }: { items?: string[] }) {
  if (!items?.length) return null
  return (
    <div className="must">
      <b className="must-h">Must know</b>
      <ul>{items.map((t, i) => <li key={i}><Md inline>{t}</Md></li>)}</ul>
    </div>
  )
}

export function KeyFormulas({ items, title = 'Key formulas' }: { items?: KeyFormula[]; title?: string }) {
  if (!items?.length) return null
  return (
    <div className="kf">
      <b className="kf-h">{title}</b>
      <div className="kf-grid">
        {items.map((f, i) => (
          <div key={i} className="kf-row">
            <span className="kf-name">{f.name}</span>
            <span className="kf-tex"><Tex>{f.tex}</Tex></span>
            {f.where && <span className="kf-where"><Md inline>{f.where}</Md></span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Figure({ id }: { id: string }) {
  const f = FIGURES[id]
  if (!f) return import.meta.env.DEV ? <div className="ph">Figure “{id}” missing</div> : null
  const C = f.C
  return (
    <figure className="fig">
      <C />
      <figcaption><b>{f.title}</b>{f.caption && <> · <Md inline>{f.caption}</Md></>}</figcaption>
    </figure>
  )
}
