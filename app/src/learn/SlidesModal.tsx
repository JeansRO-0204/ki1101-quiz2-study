// Browse a lecture's original slides as a thumbnail grid; clicking one opens the full-size slide viewer on top.
import { useContext, useEffect, useState } from 'react'
import { SLIDE_COUNT, SlideCtx, slideSrc } from '../lib/kit'
import { LECTURES, type LectureId } from '../types'
import { IconX } from '../lib/icons'

export default function SlidesModal({ initial, onClose }: { initial: LectureId; onClose: () => void }) {
  const [l, setL] = useState<LectureId>(initial)
  const open = useContext(SlideCtx)
  useEffect(() => {
    // Escape closes the grid only when the slide viewer isn't open above it
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('.lightbox')) onClose() }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [onClose])
  const meta = LECTURES.find((x) => x.id === l)!
  return (
    <div className="sm-back" onClick={onClose}>
      <div className="smodal" role="dialog" aria-label="Lecture slides" onClick={(e) => e.stopPropagation()}>
        <header className="sm-head">
          <div>
            <h3>Lecture slides</h3>
            <small className="muted">{meta.id.replace('L', 'Lecture ')} · {meta.title} · {SLIDE_COUNT[l]} slides</small>
          </div>
          <div className="seg">{LECTURES.map((x) => <button key={x.id} className={x.id === l ? 'on' : ''} onClick={() => setL(x.id)}>{x.id}</button>)}</div>
          <button className="btn ghost sm" onClick={onClose} aria-label="Close"><IconX size={16} /></button>
        </header>
        <div className="sm-grid" key={l}>
          {Array.from({ length: SLIDE_COUNT[l] }, (_, i) => i + 1).map((n) => (
            <button key={n} className="sm-th" onClick={() => open(l, n)} title={`Slide ${n}`}>
              <img src={slideSrc(l, n)} alt={`${l} slide ${n}`} loading="lazy" decoding="async" />
              <span>{n}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
