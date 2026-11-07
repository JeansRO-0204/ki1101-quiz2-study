// SF Symbols–style icon set: 24×24 grid, rounded caps/joins, optical stroke weight ~1.7. All use currentColor.
import type { CSSProperties, ReactNode } from 'react'

type P = { size?: number; className?: string; style?: CSSProperties; title?: string }

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

function Svg({ size = 18, className, style, title, children }: P & { children: ReactNode }) {
  return (
    <svg className={'ico' + (className ? ' ' + className : '')} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} {...line}>
      {title && <title>{title}</title>}
      {children}
    </svg>
  )
}

/* ---- navigation ---- */
export const IconAtom = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="12" rx="9.5" ry="3.9" />
    <ellipse cx="12" cy="12" rx="9.5" ry="3.9" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="9.5" ry="3.9" transform="rotate(120 12 12)" />
  </Svg>
)
export const IconBook = (p: P) => (
  <Svg {...p}>
    <path d="M12 6.2C10.4 5 8.2 4.5 4.5 4.5v13.2c3.7 0 5.9.5 7.5 1.8 1.6-1.3 3.8-1.8 7.5-1.8V4.5c-3.7 0-5.9.5-7.5 1.7Z" />
    <path d="M12 6.2v13.3" />
  </Svg>
)
export const IconChecklist = (p: P) => (
  <Svg {...p}>
    <path d="m4 6.5 1.5 1.5L8 5" /><path d="m4 13 1.5 1.5L8 11.5" />
    <path d="M12 6.5h8M12 13h8M12 19.5h8" /><circle cx="5.9" cy="19" r="1.4" />
  </Svg>
)
export const IconGrid = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" /><rect x="13" y="3.5" width="7.5" height="7.5" rx="2" />
    <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" /><rect x="13" y="13" width="7.5" height="7.5" rx="2" />
  </Svg>
)
export const IconPanels = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="12.5" height="10" rx="2.4" />
    <path d="M8 19h10.5a2 2 0 0 0 2-2V9.5" />
  </Svg>
)

export const IconSidebar = (p: P) => <Svg {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="M9.5 4.5v15M5.8 8.5h1.6M5.8 11.5h1.6" /></Svg>
export const IconSlides = (p: P) => <Svg {...p}><rect x="3" y="4" width="18" height="12.5" rx="2.2" /><path d="M12 16.5V20M8.5 20h7" /><path d="m10 8 4.5 2.3L10 12.5Z" fill="currentColor" stroke="none" /></Svg>

/* ---- actions ---- */
export const IconPlus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
export const IconMinus = (p: P) => <Svg {...p}><path d="M5 12h14" /></Svg>
export const IconX = (p: P) => <Svg {...p}><path d="m6 6 12 12M18 6 6 18" /></Svg>
export const IconCheck = (p: P) => <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>
export const IconChevronLeft = (p: P) => <Svg {...p}><path d="m14.5 5.5-6.5 6.5 6.5 6.5" /></Svg>
export const IconChevronRight = (p: P) => <Svg {...p}><path d="m9.5 5.5 6.5 6.5-6.5 6.5" /></Svg>
export const IconChevronDown = (p: P) => <Svg {...p}><path d="m5.5 9.5 6.5 6.5 6.5-6.5" /></Svg>
export const IconArrowRight = (p: P) => <Svg {...p}><path d="M4.5 12h15M13.5 6l6 6-6 6" /></Svg>
export const IconArrowLeft = (p: P) => <Svg {...p}><path d="M19.5 12h-15M10.5 6l-6 6 6 6" /></Svg>
export const IconPopOut = (p: P) => (
  <Svg {...p}>
    <path d="M10 5.5H7.5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V14" />
    <path d="M14 4.5h5.5V10M19.5 4.5 11.5 12.5" />
  </Svg>
)
export const IconTrash = (p: P) => (
  <Svg {...p}><path d="M4.5 7h15M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2M6.5 7l.8 11.2a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8L17.5 7M10 11v5M14 11v5" /></Svg>
)
export const IconFit = (p: P) => <Svg {...p}><path d="M4 9V6a2 2 0 0 1 2-2h3M15 4h3a2 2 0 0 1 2 2v3M20 15v3a2 2 0 0 1-2 2h-3M9 20H6a2 2 0 0 1-2-2v-3" /><rect x="8.5" y="8.5" width="7" height="7" rx="1.5" /></Svg>
export const IconLayers = (p: P) => (
  <Svg {...p}><path d="m12 3.8 8.5 4.4L12 12.6 3.5 8.2 12 3.8Z" /><path d="m3.5 12.2 8.5 4.4 8.5-4.4M3.5 16.2 12 20.6l8.5-4.4" /></Svg>
)
export const IconMagnet = (p: P) => (
  <Svg {...p}><path d="M5 12V6.5m0 0h3.5V12a3.5 3.5 0 0 0 7 0V6.5H19V12a7 7 0 0 1-14 0V6.5ZM5 9.5h3.5M15.5 9.5H19" /></Svg>
)
export const IconReset = (p: P) => <Svg {...p}><path d="M5 12a7 7 0 1 0 2.1-5" /><path d="M5 4.5v4h4" /></Svg>

/* ---- practice ---- */
export const IconPencil = (p: P) => <Svg {...p}><path d="m4.5 19.5.9-3.9L16.6 4.4a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L8.4 18.6l-3.9.9ZM14.5 6.5l3 3" /></Svg>
export const IconInfinity = (p: P) => <Svg {...p}><path d="M12 12c-1.6-2.4-3-3.8-4.9-3.8a3.8 3.8 0 0 0 0 7.6c1.9 0 3.3-1.4 4.9-3.8Zm0 0c1.6 2.4 3 3.8 4.9 3.8a3.8 3.8 0 0 0 0-7.6c-1.9 0-3.3 1.4-4.9 3.8Z" /></Svg>
export const IconCards = (p: P) => (
  <Svg {...p}><rect x="3.5" y="7.5" width="14" height="11" rx="2.4" /><path d="M7 4.5h11.5a2 2 0 0 1 2 2V15" /></Svg>
)
export const IconTimer = (p: P) => (
  <Svg {...p}><circle cx="12" cy="13.5" r="7.2" /><path d="M12 13.5V9.5M9.5 3.5h5M18.2 6.6l1.3-1.3" /></Svg>
)
export const IconChart = (p: P) => (
  <Svg {...p}><path d="M5 20V12M12 20V5M19 20v-5.5" strokeWidth={2.6} /></Svg>
)
export const IconFlag = (p: P) => <Svg {...p}><path d="M6 21V4.5M6 5c3-1.6 5.5 1.6 8.5 0 1.6-.8 3-.6 3.5-.4v8.4c-.6-.2-1.9-.4-3.5.4-3 1.6-5.5-1.6-8.5 0" /></Svg>

/* ---- window chrome ---- */
export const IconMaximize = (p: P) => <Svg {...p}><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></Svg>
export const IconRestore = (p: P) => <Svg {...p}><path d="M20 10h-6V4M4 14h6v6M14 10l7-7M10 14l-7 7" /></Svg>

/* ---- filled status glyphs (SF “.fill” style) ---- */
function Fill({ size = 18, className, style, title, children }: P & { children: ReactNode }) {
  return (
    <svg className={'ico fill' + (className ? ' ' + className : '')} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      {children}
    </svg>
  )
}
const mark = { fill: 'none', stroke: '#fff', strokeWidth: 2.3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
export const IconCheckFill = (p: P) => <Fill {...p}><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="m7.6 12.4 3 3 5.8-6.2" {...mark} /></Fill>
export const IconXFill = (p: P) => <Fill {...p}><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="m8.6 8.6 6.8 6.8M15.4 8.6l-6.8 6.8" {...mark} /></Fill>
export const IconWarnFill = (p: P) => (
  <Fill {...p}>
    <path d="M10.6 3.9a1.6 1.6 0 0 1 2.8 0l8.2 14.4a1.6 1.6 0 0 1-1.4 2.4H3.8a1.6 1.6 0 0 1-1.4-2.4L10.6 3.9Z" fill="currentColor" />
    <path d="M12 9.3v4.6" {...mark} /><circle cx="12" cy="17.2" r="1.15" fill="#fff" />
  </Fill>
)
export const IconBulbFill = (p: P) => (
  <Fill {...p}>
    <path d="M12 2.5a6.8 6.8 0 0 0-3.9 12.4c.6.5.9 1.1.9 1.8v.3h6v-.3c0-.7.3-1.3.9-1.8A6.8 6.8 0 0 0 12 2.5Z" fill="currentColor" />
    <rect x="9" y="18.3" width="6" height="1.8" rx=".9" fill="currentColor" /><rect x="10" y="21" width="4" height="1.5" rx=".75" fill="currentColor" />
  </Fill>
)
export const IconInfoFill = (p: P) => <Fill {...p}><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M12 11v5.2" {...mark} /><circle cx="12" cy="7.8" r="1.25" fill="#fff" /></Fill>
export const IconLockFill = (p: P) => (
  <Fill {...p}>
    <path d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <rect x="4.5" y="10" width="15" height="11" rx="3" fill="currentColor" />
  </Fill>
)
export const IconSparkles = (p: P) => (
  <Fill {...p}>
    <path d="M10 3.5c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6Z" fill="currentColor" />
    <path d="M18 14c.3 2.3 1.2 3.2 3.5 3.5-2.3.3-3.2 1.2-3.5 3.5-.3-2.3-1.2-3.2-3.5-3.5 2.3-.3 3.2-1.2 3.5-3.5Z" fill="currentColor" />
  </Fill>
)

/** Status icon for Feedback lines (level → glyph). */
export const LEVEL_ICON = { ok: IconCheckFill, err: IconXFill, warn: IconWarnFill, hint: IconBulbFill, info: IconInfoFill } as const

/** Rounded-square “app icon” tile (iOS style) with a gradient tint. */
export function AppIcon({ children, tint = '#0a84ff', size = 40 }: { children: ReactNode; tint?: string; size?: number }) {
  return (
    <span className="app-ic" style={{ width: size, height: size, ['--tint' as string]: tint }}>
      {children}
    </span>
  )
}
