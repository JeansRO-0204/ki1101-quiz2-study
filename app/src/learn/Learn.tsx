import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { CONTENT } from '../content'
import { WIDGET } from '../registry'
import { LECTURES, type LectureId } from '../types'
import { Md, SlideRef, openInWorkspace, useLocalState } from '../lib/kit'
import { IconChevronLeft, IconPopOut, IconSidebar, IconSlides, IconSparkles } from '../lib/icons'
const SlidesModal = lazy(() => import('./SlidesModal'))
const Rangkuman = lazy(() => import('./Rangkuman'))
import { Figure, KeyFormulas, MustKnow } from './parts'
import { SearchBox, SearchResults, useSlashFocus } from './Search'

export default function Learn({ lecture, section, cram }: { lecture: LectureId; section?: string; cram?: boolean }) {
  const L = CONTENT[lecture]
  const meta = LECTURES.find((l) => l.id === lecture)!
  useEffect(() => {
    if (section) document.getElementById('sec-' + section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else document.querySelector('.learn-main')?.scrollTo({ top: 0 })
  }, [lecture, section, cram])

  const [collapsed, setCollapsed] = useLocalState('learn.side.collapsed', false)
  const [slides, setSlides] = useState(false)
  const [q, setQ] = useState('')
  const sideSearch = useRef<HTMLInputElement>(null)
  useSlashFocus(sideSearch)

  return (
    <div className={'learn' + (collapsed ? ' collapsed' : '')}>
      {collapsed ? (
        <aside className="learn-rail" aria-label="Lectures">
          <button className="rail-b" onClick={() => setCollapsed(false)} title="Show sidebar" aria-label="Show sidebar"><IconSidebar size={18} /></button>
          <a href="#/learn/rangkuman" className={'rail-l rail-cram' + (cram ? ' on' : '')} title="Rangkuman">★</a>
          {LECTURES.map((l) => <a key={l.id} href={`#/learn/${l.id}`} className={'rail-l' + (l.id === lecture && !cram ? ' on' : '')} style={{ ['--c' as string]: l.color }} title={l.title}>{l.id.replace('L', '')}</a>)}
          <span className="grow" />
          <button className="rail-b" onClick={() => setSlides(true)} title="Lecture slides" aria-label="Lecture slides"><IconSlides size={18} /></button>
        </aside>
      ) : (
      <aside className="learn-side">
        <div className="side-top">
          <span className="muted side-cap">Lectures</span>
          <button className="btn ghost sm" onClick={() => setCollapsed(true)} title="Hide sidebar" aria-label="Hide sidebar"><IconChevronLeft size={14} /><IconSidebar size={16} /></button>
        </div>
        <div className="side-search"><SearchBox q={q} setQ={setQ} inputRef={sideSearch} /></div>
        <div className="side-list">
        {q.trim() ? <SearchResults q={q} onPick={() => setQ('')} /> : <>
        <a className={'cram-link' + (cram ? ' on' : '')} href="#/learn/rangkuman"><b>★ Rangkuman</b><span>Everything for the quiz on one page</span></a>
        {LECTURES.map((l) => (
          <div key={l.id} className={'lec' + (l.id === lecture && !cram ? ' on' : '')} style={{ ['--c' as string]: l.color }}>
            <a className="lec-head" href={`#/learn/${l.id}`}><span className="dot" />{l.id.replace('L', '')}. {l.title}</a>
            {l.id === lecture && !cram && (
              <ul>
                {CONTENT[l.id].sections.map((s) => (
                  <li key={s.id}><a className={s.id === section ? 'on' : ''} href={`#/learn/${l.id}/${s.id}`}>{s.title}</a></li>
                ))}
              </ul>
            )}
          </div>
        ))}
        </>}
        </div>
        <div className="side-foot">
          <button className="btn side-slides" onClick={() => setSlides(true)}><IconSlides size={16} />Lecture slides</button>
        </div>
      </aside>
      )}
      <div className="learn-main">
        <nav className="learn-mnav" aria-label="Lectures and sections">
          <div className="learn-mlecs"><a href="#/learn/rangkuman" className={cram ? 'on' : ''}>★ Rangkuman</a>{LECTURES.map((l) => <a key={l.id} href={`#/learn/${l.id}`} className={l.id === lecture && !cram ? 'on' : ''} style={{ ['--c' as string]: l.color }}>{l.id.replace('L', '')}. {l.title}</a>)}</div>
          <button className="btn sm" onClick={() => setSlides(true)}><IconSlides size={14} />Slides</button>
          <div className="mnav-search"><SearchBox q={q} setQ={setQ} />{q.trim() && <SearchResults q={q} onPick={() => setQ('')} />}</div>
          {!cram && <select className="field" value={section ?? ''} onChange={(e) => { location.hash = `#/learn/${lecture}${e.target.value ? '/' + e.target.value : ''}` }} aria-label="Jump to section">
            <option value="">Jump to section…</option>
            {L.sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>}
        </nav>
        {cram ? <Suspense fallback={<div className="ph">Loading…</div>}><Rangkuman /></Suspense> : <>
        <header className="lec-banner" style={{ ['--c' as string]: meta.color }}>
          <small>Lecture {lecture.replace('L', '')}</small>
          <h1>{L.title || meta.title}</h1>
          {L.summary && <p>{L.summary}</p>}
        </header>
        {!L.sections.length && <p className="muted">Content for this lecture is being written…</p>}
        {L.sections.map((s) => (
          <article key={s.id} id={'sec-' + s.id} className="sec">
            <h2>{s.title}</h2>
            <MustKnow items={s.essentials} />
            <KeyFormulas items={s.formulas} />
            <Md>{s.md}</Md>
            {s.figures?.map((id) => <Figure key={id} id={id} />)}
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
        </>}
      </div>
      {slides && <Suspense fallback={null}><SlidesModal initial={lecture} onClose={() => setSlides(false)} /></Suspense>}
    </div>
  )
}
