import { useState } from 'react'
import type { PastFigure } from './bank'

/** Original figure(s) cropped from the paper; click to enlarge. Alt text carries the description for screen readers. */
export function PastFigures({ figs, lang }: { figs?: PastFigure[]; lang: 'en' | 'id' }) {
  const [big, setBig] = useState<PastFigure | null>(null)
  if (!figs?.length) return null
  return (
    <>
      <div className="pp-figs">
        {figs.map((f) => (
          <figure key={f.src} className={'pp-fig' + (f.wide ? ' wide' : '')}>
            <button onClick={() => setBig(f)} title={lang === 'id' ? 'Perbesar' : 'Enlarge'}><img src={f.src} alt={lang === 'id' ? f.altId : f.alt} loading="lazy" /></button>
            <figcaption>{lang === 'id' ? 'Gambar dari soal asli' : 'Figure from the original paper'}</figcaption>
          </figure>
        ))}
      </div>
      {big && (
        <div className="lightbox" onClick={() => setBig(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={big.src} alt={lang === 'id' ? big.altId : big.alt} style={{ maxHeight: '70vh' }} />
            <figcaption><span>{lang === 'id' ? big.altId : big.alt}</span><button onClick={() => setBig(null)}>{lang === 'id' ? 'Tutup' : 'Close'}</button></figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
