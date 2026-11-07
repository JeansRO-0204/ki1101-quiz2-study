// Practice section root. `sub` = hash segment after #/practice/ (quiz | drill | cards | mock | progress).
import './practice.css'
import { useMemo } from 'react'
import Cards from './Cards'
import Drill from './Drill'
import Mock from './Mock'
import Progress, { practiceTopic, useAllAttempts } from './Progress'
import Quiz from './Quiz'
import Past from './Past'
import { PAST_PAPERS } from './bank'
import { POOL_C, POOL_Q, USING_SAMPLE_Q } from './pool'
import { isDue, usePStore, weakest } from './store'
import { GENERATORS } from './generators'
import { go, lecColor, pct, setPreset } from './ui'
import { AppIcon, IconCards, IconChart, IconInfinity, IconPencil, IconTimer, IconBook } from '../lib/icons'
import type { ReactNode } from 'react'

const TABS: [string, string][] = [['', 'Overview'], ['quiz', 'Quiz'], ['past', 'Past quizzes'], ['drill', 'Drill'], ['cards', 'Flashcards'], ['mock', 'Mock'], ['progress', 'Progress']]
const EXAM = new Date(2026, 10, 10, 8, 0, 0) // Tue 10 Nov 2026

export default function Practice({ sub, arg }: { sub?: string; arg?: string }) {
  const body = sub === 'past' ? <Past arg={arg} /> : sub === 'quiz' ? <Quiz /> : sub === 'drill' ? <Drill /> : sub === 'cards' ? <Cards /> : sub === 'mock' ? <Mock /> : sub === 'progress' ? <Progress /> : <Hub />
  return (
    <div className="pr-root">
      <nav className="pr-nav">
        {TABS.map(([k, l]) => <a key={k} href={'#/practice' + (k ? '/' + k : '')} className={(sub ?? '') === k ? 'on' : ''}>{l}</a>)}
      </nav>
      <div className="pr-scroll">{body}</div>
    </div>
  )
}

function daysLeft() {
  const t = new Date(); t.setHours(0, 0, 0, 0)
  const e = new Date(EXAM); e.setHours(0, 0, 0, 0)
  return Math.round((e.getTime() - t.getTime()) / 86400000)
}

function Hub() {
  const store = usePStore()
  const atts = useAllAttempts()
  const due = POOL_C.filter((c) => isDue(store.cards[c.id])).length
  const weak = useMemo(() => weakest(atts, 3), [atts])
  const d = daysLeft()
  const correct = atts.filter((a) => a.correct).length
  return (
    <div className="pr-page">
      <div className="pr-hero">
        <div>
          <h2>Practice</h2>
          <p className="muted">Quiz 2 covers L7 Atomic structure, L8 Bonding basics, L9 Molecular structure and L10 Bonding theory.</p>
        </div>
        <div className={'pr-count' + (d <= 3 ? ' urgent' : '')}>
          <b>{d > 0 ? d : d === 0 ? 'Today' : '–'}</b>
          <span>{d > 1 ? 'days to the quiz' : d === 1 ? 'day to the quiz' : d === 0 ? 'quiz day, good luck' : 'quiz passed'}<br /><small>Tue 10 Nov 2026</small></span>
        </div>
      </div>
      {USING_SAMPLE_Q && <div className="pr-banner">The question bank is still being written: the quiz uses a small <b>dev sample</b>; drill and mock already work with generated questions.</div>}
      <div className="pr-modes">
        <ModeCard sub="quiz" icon={<IconPencil size={22} />} tint="#007aff" title="Quiz" text="Pick lectures, topics and question types. Learn mode checks every step; Test mode saves feedback for the end." meta={`${POOL_Q.length} questions`} />
        <ModeCard sub="past" icon={<IconBook size={22} />} tint="#5e5ce6" title="Past quizzes" text="Previous years’ Quiz 2 papers (2021–2025), in English and Indonesian, with step-by-step hints and worked solutions." meta={`${PAST_PAPERS.length} papers`} />
        <ModeCard sub="drill" icon={<IconInfinity size={24} />} tint="#af52de" title="Drill" text="Endless fresh numeric and conceptual problems with random values and full worked solutions." meta={`${GENERATORS.length} generators`} />
        <ModeCard sub="cards" icon={<IconCards size={22} />} tint="#ff9f0a" title="Flashcards" text="Leitner boxes at 1, 2, 4 and 8 days. Flip with Space, grade 1–4." meta={due ? `${due} due today` : 'nothing due'} accent={due > 0} />
        <ModeCard sub="mock" icon={<IconTimer size={22} />} tint="#ff453a" title="Mock quiz" text="A timed mixed exam balanced across L7–L10. No feedback until you submit." meta="30 min" />
        <ModeCard sub="progress" icon={<IconChart size={22} />} tint="#30b857" title="Progress" text="Accuracy by lecture and topic, weak spots, backups." meta={atts.length ? `${pct(correct / atts.length)} of ${atts.length}` : 'no attempts yet'} />
        {store.flagged.length > 0 && (
          <button className="pr-mode flag" onClick={() => { setPreset({ flaggedOnly: true }); go('quiz') }}>
            <span className="pr-mode-ic">⚑</span><b>Flagged</b><p>Retry the questions you marked for review.</p><small>{store.flagged.length} flagged</small>
          </button>
        )}
      </div>
      <section className="pr-card">
        <h3>Weakest topics</h3>
        {weak.length ? weak.map((w) => (
          <div key={w.lecture + w.topic} className="pr-weak">
            <div><span className="pr-lec" style={{ background: lecColor(w.lecture) }}>{w.lecture}</span> <b>{w.topic}</b> <span className="muted pr-small">{pct(w.acc)} · {w.n} attempts</span></div>
            <button className="btn primary sm" onClick={() => practiceTopic(w.lecture, w.topic)}>Practice these</button>
          </div>
        )) : <p className="muted">Answer a few questions and your weakest topics will show up here.</p>}
      </section>
    </div>
  )
}

function ModeCard({ sub, icon, tint, title, text, meta, accent }: { sub: string; icon: ReactNode; tint: string; title: string; text: string; meta: string; accent?: boolean }) {
  return (
    <a className={'pr-mode' + (accent ? ' accent' : '')} href={'#/practice/' + sub}>
      <AppIcon size={44} tint={tint}>{icon}</AppIcon><b>{title}</b><p>{text}</p><small>{meta}</small>
    </a>
  )
}
