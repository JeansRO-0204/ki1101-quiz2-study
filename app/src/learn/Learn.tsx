import { Suspense, useEffect } from 'react'
import { CONTENT } from '../content'
import { WIDGET } from '../registry'
import { LECTURES, type LectureId } from '../types'
import { Md, SlideRef, openInWorkspace } from '../lib/kit'
import { IconPopOut, IconSparkles } from '../lib/icons'

export default function Learn({ lecture, section }: { lecture: LectureId; section?: string }) {
  const L = CONTENT[lecture]
  const meta = LECTURES.find((l) => l.id === lecture)!
  useEffect(() => {
    if (section) document.getElementById('sec-' + section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else document.querySelector('.learn-main')?.scrollTo({ top: 0 })
  }, [lecture, section])

  return (
    <div className="learn">
      <aside className="learn-side">
        {LECTURES.map((l) => (
          <div key={l.id} className={'lec' + (l.id === lecture ? ' on' : '')} style={{ ['--c' as string]: l.color }}>
            <a className="lec-head" href={`#/learn/${l.id}`}><span className="dot" />{l.id.replace('L', '')}. {l.title}</a>
            {l.id === lecture && (
              <ul>
                {CONTENT[l.id].sections.map((s) => (
                  <li key={s.id}><a className={s.id === section ? 'on' : ''} href={`#/learn/${l.id}/${s.id}`}>{s.title}</a></li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </aside>
      <div className="learn-main">
        <nav className="learn-mnav" aria-label="Lectures and sections">
          <div className="learn-mlecs">{LECTURES.map((l) => <a key={l.id} href={`#/learn/${l.id}`} className={l.id === lecture ? 'on' : ''} style={{ ['--c' as string]: l.color }}>{l.id.replace('L', '')}. {l.title}</a>)}</div>
          <select className="field" value={section ?? ''} onChange={(e) => { location.hash = `#/learn/${lecture}${e.target.value ? '/' + e.target.value : ''}` }} aria-label="Jump to section">
            <option value="">Jump to section…</option>
            {L.sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </nav>
        <header className="lec-banner" style={{ ['--c' as string]: meta.color }}>
          <small>Lecture {lecture.replace('L', '')}</small>
          <h1>{L.title || meta.title}</h1>
          {L.summary && <p>{L.summary}</p>}
        </header>
        {!L.sections.length && <p className="muted">Content for this lecture is being written…</p>}
        {L.sections.map((s) => (
          <article key={s.id} id={'sec-' + s.id} className="sec">
            <h2>{s.title}</h2>
            <Md>{s.md}</Md>
            {s.traps && s.traps.length > 0 && (
              <div className="traps"><b>Common traps</b><ul>{s.traps.map((t, i) => <li key={i}><Md inline>{t}</Md></li>)}</ul></div>
            )}
            {s.slides.length > 0 && <div className="refs">Slides: {s.slides.map((n) => <SlideRef key={n} l={lecture} s={n} />)}</div>}
            {s.widgets?.map((id) => {
              const w = WIDGET.get(id)
              if (!w) return <div key={id} className="ph">Widget “{id}” coming soon</div>
              const C = w.component
              return (
                <div key={id} className="embed">
                  <div className="embed-bar"><span><IconSparkles size={14} style={{ color: 'var(--accent)' }} />Interactive · {w.title}</span><button className="btn ghost sm" onClick={() => openInWorkspace(id)}><IconPopOut size={14} />Pop out to Workspace</button></div>
                  <Suspense fallback={<div className="ph">Loading…</div>}><C /></Suspense>
                </div>
              )
            })}
          </article>
        ))}
      </div>
    </div>
  )
}
