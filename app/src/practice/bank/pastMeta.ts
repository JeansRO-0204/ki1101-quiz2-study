// Lightweight list of past papers (titles only) so the widget registry doesn't pull every paper into the first download.
// Keep in sync with ./past/*.ts (checked at runtime in dev by Past.tsx).
export const PAST_META = [
  { id: 'kuis2-2025', title: 'Quiz 2 2025', date: '17 Nov 2025', problems: 5 },
  { id: 'kuis2-2024', title: 'Quiz 2 2024', date: '28 Nov 2024', problems: 2 },
  { id: 'kuis2-2023', title: 'Quiz 2 2023', date: 'Nov 2023', problems: 4 },
  { id: 'kuis2-2022', title: 'Quiz 2 2022', date: '2022', problems: 15 },
  { id: 'kuis2-2021', title: 'Quiz 2 2021', date: '20 Nov 2021', problems: 13 },
]
