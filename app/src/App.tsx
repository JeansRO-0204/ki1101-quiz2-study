import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { SlideCtx, SlideLightbox } from './lib/kit'
import type { LectureId } from './types'
// each top-level page is its own chunk: Materials doesn't download the question bank, Practice doesn't download the workspace…
const Learn = lazy(() => import('./learn/Learn'))
const Practice = lazy(() => import('./practice/Practice'))
const Workspace = lazy(() => import('./workspace/Workspace'))
import { AppIcon, IconAtom, IconBook, IconChecklist, IconPanels } from './lib/icons'

export type Route = { page: 'learn'; lecture: LectureId; section?: string; cram?: boolean } | { page: 'practice'; sub?: string; arg?: string } | { page: 'workspace' }

function parse(hash: string): Route {
  const [, page, a, b] = hash.replace(/^#/, '').split('/')
  if (page === 'practice') return { page: 'practice', sub: a, arg: b }
  if (page === 'workspace') return { page: 'workspace' }
  if (a === 'rangkuman') return { page: 'learn', lecture: 'L7', cram: true }
  const lecture = (['L7', 'L8', 'L9', 'L10'].includes(a) ? a : 'L7') as LectureId
  return { page: 'learn', lecture, section: b }
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parse(location.hash))
  useEffect(() => {
    const f = () => setRoute(parse(location.hash))
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  const [slide, setSlide] = useState<{ l: LectureId; n: number } | null>(null)
  const openSlide = useCallback((l: LectureId, n: number) => setSlide({ l, n }), [])

  return (
    <SlideCtx.Provider value={openSlide}>
      <div className="shell">
        <nav className="topnav">
          <a className="logo" href="#/learn/L7"><AppIcon size={30} tint="#0a84ff"><IconAtom size={19} /></AppIcon>KI1101 <span>Quiz 2 · Atoms & Bonding</span></a>
          <div className="tabs">
            <a className={route.page === 'learn' ? 'on' : ''} href={`#/learn/${route.page === 'learn' ? route.lecture : 'L7'}`}><IconBook size={16} /><span className="lbl">Materials</span></a>
            <a className={route.page === 'practice' ? 'on' : ''} href="#/practice"><IconChecklist size={16} /><span className="lbl">Practice</span></a>
            <a className={route.page === 'workspace' ? 'on' : ''} href="#/workspace"><IconPanels size={16} /><span className="lbl">Workspace</span></a>
          </div>
          <span className="nav-gap" />
        </nav>
        <main className="main"><Suspense fallback={<div className="page-loading" aria-label="Loading"><i /><i /><i /></div>}>
          {route.page === 'learn' && <Learn lecture={route.lecture} section={route.section} cram={route.cram} />}
          {route.page === 'practice' && <Practice sub={route.sub} arg={route.arg} />}
          {route.page === 'workspace' && <Workspace />}
        </Suspense></main>
      </div>
      <SlideLightbox at={slide} onClose={() => setSlide(null)} onNav={(n) => setSlide((s) => (s ? { ...s, n } : s))} />
    </SlideCtx.Provider>
  )
}
