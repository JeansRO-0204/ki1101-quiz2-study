// Small "i" disclaimer (expands on click) shown on questions and answers that were produced with AI assistance.
import { useLang } from './Hints'
import { IconInfoFill } from '../lib/icons'

const T = {
  en: {
    label: 'AI-assisted content',
    problem: 'This problem and its answer were generated with the help of generative AI, deterministic algorithms, and physics-informed neural networks (PINN).',
    answer: 'The hints, worked solutions and answers here were produced with the help of generative AI, deterministic algorithms, and physics-informed neural networks (PINN). The problem itself is from the original source.',
    check: 'Always cross-check with the lecture slides and your lecturer.',
  },
  id: {
    label: 'Konten dibantu AI',
    problem: 'Soal dan jawaban ini dibuat dengan bantuan generative AI, algoritma deterministik, dan physics-informed neural networks (PINN).',
    answer: 'Petunjuk, pembahasan, dan jawaban di sini dibuat dengan bantuan generative AI, algoritma deterministik, dan physics-informed neural networks (PINN). Soalnya sendiri berasal dari sumber aslinya.',
    check: 'Selalu cocokkan dengan slide kuliah dan dosenmu.',
  },
}

/** kind 'problem': the question itself is AI/algorithm-made; 'answer': only the answers/hints/solutions are. */
export function AiNote({ kind }: { kind: 'problem' | 'answer' }) {
  const [lang] = useLang()
  const t = T[lang]
  return (
    <details className="ai-note">
      <summary title={t.label} aria-label={t.label}><IconInfoFill size={15} /><span>{t.label}</span></summary>
      <p>{t[kind]} {t.check}</p>
    </details>
  )
}
