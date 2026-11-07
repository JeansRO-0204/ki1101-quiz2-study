// Past quizzes: list of past KI1101 Quiz 2 papers → full paper view, every part answerable with progressive hints and worked solutions.
import { useState } from 'react'
import { Md, openInWorkspace } from '../lib/kit'
import type { PastPaper, Question } from '../types'
import { PAST_FIGURES, PAST_PAPERS } from './bank'
import { PAST_META } from './bank/pastMeta'
if (import.meta.env.DEV) for (const p of PAST_PAPERS) { const m = PAST_META.find((x) => x.id === p.id); if (!m || m.title !== p.title || m.problems !== p.problems.length) console.warn('pastMeta.ts is out of sync with', p.id) }
import { PastFigures } from './PastFigures'
import { LangSwitch, useLang } from './Hints'
import QuestionView, { KeysCtx, type Outcome } from './QuestionView'
import { logAttempt, usePStore } from './store'
import { go, setPreset } from './ui'
import { AppIcon, IconPopOut, IconChevronLeft, IconChevronRight, IconFlag, IconInfoFill } from '../lib/icons'

const T = {
  en: { source: 'Papers pulled from the STEI-K 25 ACADS (academic drive) site.', title: 'Past quizzes', sub: 'Previous years’ KI1101 Quiz 2 papers with hints and worked solutions. Indonesian originals are kept: switch with EN / ID.', problems: 'problems', parts: 'parts', min: 'min', back: 'Past quizzes', constants: 'Constants given on the paper', soal: 'Problem', pts: 'pts', oos: 'Outside L7–L10: not on your quiz', none: 'No past papers loaded yet.', done: 'answered', quiz: 'Quiz me on all past questions' },
  id: { source: 'Soal diambil dari situs ACADS (academic drive) STEI-K 25.', title: 'Kuis tahun lalu', sub: 'Soal Kuis 2 KI1101 tahun-tahun sebelumnya, lengkap dengan petunjuk dan pembahasan.', problems: 'soal', parts: 'bagian', min: 'menit', back: 'Kuis tahun lalu', constants: 'Tetapan yang diberikan', soal: 'Soal', pts: 'poin', oos: 'Di luar L7–L10: tidak keluar di kuis ini', none: 'Belum ada soal.', done: 'terjawab', quiz: 'Latihan semua soal tahun lalu' },
}

export default function Past({ arg }: { arg?: string }) {
  const paper = PAST_PAPERS.find((p) => p.id === arg)
  return paper ? <Paper paper={paper} /> : <PaperList />
}

const nParts = (p: PastPaper) => p.problems.reduce((a, pr) => a + pr.parts.length, 0)

function PaperList() {
  const [lang, setLang] = useLang()
  const store = usePStore()
  const t = T[lang]
  const seen = new Set(store.attempts.map((a) => a.id))
  return (
    <div className="pr-page">
      <button className="btn ghost sm" onClick={() => go()}><IconChevronLeft size={14} />Practice</button>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2>{t.title}</h2>
        <LangSwitch lang={lang} setLang={setLang} />
      </div>
      <p className="muted">{t.sub}</p>
      <div className="pp-note"><IconInfoFill size={16} /><span>{t.source}</span></div>
      {!PAST_PAPERS.length && <div className="pr-empty">{t.none}</div>}
      <div className="pp-list">
        {PAST_PAPERS.map((p) => {
          const parts = p.problems.flatMap((pr) => pr.parts)
          const done = parts.filter((q) => seen.has(q.id)).length
          return (
            <a key={p.id} className="pp-item" href={`#/practice/past/${p.id}`}>
              <AppIcon size={46} tint={p.year === Math.max(...PAST_PAPERS.map((x) => x.year)) ? '#ff453a' : '#8e8e93'}><b className="pp-year">{String(p.year).slice(2)}</b></AppIcon>
              <div className="pp-main">
                <b>{lang === 'id' ? p.titleId : p.title}</b>
                <span className="muted">{[p.date, p.minutes && `${p.minutes} ${t.min}`, `${p.problems.length} ${t.problems}`, `${nParts(p)} ${t.parts}`].filter(Boolean).join(' · ')}</span>
                <div className="pr-bar-track pp-prog"><div className="pr-bar-fill" style={{ width: `${(done / Math.max(1, parts.length)) * 100}%`, background: 'var(--accent)' }} /></div>
              </div>
              <span className="muted pr-small">{done}/{parts.length} {t.done}</span>
              <IconChevronRight size={16} style={{ color: 'var(--muted)' }} />
            </a>
          )
        })}
      </div>
      {PAST_PAPERS.length > 0 && <button className="btn" onClick={() => { setPreset({ source: 'past' }); go('quiz') }}>{t.quiz}</button>}
    </div>
  )
}

export function Paper({ paper, embedded }: { paper: PastPaper; embedded?: boolean }) {
  const [lang, setLang] = useLang()
  const t = T[lang]
  const [out, setOut] = useState<Record<string, Outcome>>({})
  const submit = (q: Question) => (o: Outcome) => {
    setOut((m) => ({ ...m, [q.id]: o }))
    if (!o.skipped) logAttempt({ id: q.id, lecture: q.lecture, topic: q.topic, correct: o.correct, score: o.score, src: 'quiz', kind: q.kind })
  }
  const parts = paper.problems.flatMap((p) => p.parts)
  const got = parts.reduce((a, q) => a + (out[q.id]?.score ?? 0), 0)
  const answered = parts.filter((q) => out[q.id]).length
  return (
    <KeysCtx.Provider value={false}>
    <div className={'pr-page pp' + (embedded ? ' pp-embed' : '')}>
      {!embedded && <button className="btn ghost sm" onClick={() => go('past')}><IconChevronLeft size={14} />{t.back}</button>}
      <div className="pp-head">
        <div>
          <h2>{lang === 'id' ? paper.titleId : paper.title}</h2>
          <p className="muted">{[paper.date, paper.minutes && `${paper.minutes} ${t.min}`, `${paper.problems.length} ${t.problems}`].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="row">
          {answered > 0 && <span className="chip">{answered}/{parts.length} · {Math.round((got / answered) * 100)}%</span>}
          {!embedded && <button className="btn sm" onClick={() => openInWorkspace('past:' + paper.id)} title="Open this paper as a Workspace panel, next to the periodic table, notepad…"><IconPopOut size={14} />Workspace</button>}
          <LangSwitch lang={lang} setLang={setLang} />
        </div>
      </div>
      <div className="pp-note"><IconInfoFill size={16} /><span>{t.source}</span></div>
      {paper.note && <div className="pp-note"><IconInfoFill size={16} /><span>{paper.note}</span></div>}
      {(paper.constants || paper.constantsId) && (
        <details className="pp-const">
          <summary>{t.constants}</summary>
          <Md>{(lang === 'id' ? paper.constantsId : paper.constants) ?? paper.constants ?? ''}</Md>
        </details>
      )}
      {paper.problems.map((pr) => (
        <section key={pr.n} className={'pp-prob' + (pr.outOfScope ? ' oos' : '')}>
          <header>
            <h3>{t.soal} {pr.n}{pr.points != null && <small> · {pr.points} {t.pts}</small>}</h3>
            {pr.outOfScope && <span className="chip warn"><IconFlag size={12} />{t.oos}</span>}
          </header>
          <PastFigures figs={PAST_FIGURES[`${paper.id}:${pr.n}`]} lang={lang} />
          {(pr.intro || pr.introId) && <div className="pp-intro"><Md>{(lang === 'id' ? pr.introId : pr.intro) ?? pr.intro ?? ''}</Md></div>}
          {pr.parts.map((q) => (
            <div key={q.id} className="pp-part">
              <span className="pp-label">{q.past?.label.replace(/^\d+/, '') || q.past?.label}{q.past?.points != null && <small>{q.past.points}</small>}</span>
              <div className="pp-q"><QuestionView q={q} mode="learn" onSubmit={submit(q)} hideMeta /></div>
            </div>
          ))}
        </section>
      ))}
    </div>
    </KeysCtx.Provider>
  )
}

