import { motion, useReducedMotion } from 'framer-motion'
import { Logo } from '../components/Logo'
import { useMode } from '../modes/modeContext'
import { ACTIVITY_LABELS, useNav } from '../navigation/navContext'
import { ACCENT, RADIUS_CLASS } from '../lib/accent'
import { tpx } from '../lib/typography'
import type { ActivityId } from '../modes/types'

const ACTIVITY_ORDER: readonly ActivityId[] = [
  'quiz',
  'calc',
  'memory',
  'attention',
  'sequence',
  'chainedCalc',
]

const ACTIVITY_HINT: Record<ActivityId, string> = {
  quiz: 'Preguntas de cultura general.',
  calc: 'Sumas, restas y más.',
  memory: 'Encontrá las parejas.',
  attention: 'Descubrí el diferente.',
  sequence: 'Repetí la secuencia de colores.',
  chainedCalc: 'Calculá paso a paso la cadena.',
}

function ActivityGlyph({ id }: { id: ActivityId }) {
  const common = 'h-7 w-7'
  switch (id) {
    case 'quiz':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" />
          <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'calc':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <path d="M5 8h6M8 5v6M14 7h5M14 17h5M14.5 14.5l4 5M18.5 14.5l-4 5" />
        </svg>
      )
    case 'memory':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden>
          <rect x="4" y="4" width="7" height="7" rx="2" />
          <rect x="13" y="4" width="7" height="7" rx="2" />
          <rect x="4" y="13" width="7" height="7" rx="2" />
          <rect x="13" y="13" width="7" height="7" rx="2" />
        </svg>
      )
    case 'attention':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="7" r="2.5" />
          <circle cx="7" cy="17" r="2.5" />
          <circle cx="17" cy="17" r="2.5" fill="currentColor" />
        </svg>
      )
    case 'sequence':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor" stroke="none" opacity={0.4} />
          <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor" />
          <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor" stroke="none" opacity={0.6} />
          <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor" stroke="none" opacity={0.2} />
        </svg>
      )
    case 'chainedCalc':
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <circle cx="5" cy="12" r="3" />
          <path d="M8 12h2" />
          <rect x="10" y="9" width="4" height="6" rx="1" />
          <path d="M14 12h2" />
          <circle cx="19" cy="12" r="3" />
        </svg>
      )
  }
}

export function HomeScreen() {
  const { config } = useMode()
  const { navigate } = useNav()
  const reduce = useReducedMotion()
  const accent = ACCENT[config.accent]
  const radius = RADIUS_CLASS[config.controls.radius]

  const open = (activity: ActivityId) =>
    navigate({ name: 'activity', activity })

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-10 pt-12"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <header className="flex items-center justify-between gap-2">
        <Logo size={26} />
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ name: 'mode-select' })}
            className={`flex items-center gap-2 rounded-pill ${accent.softBg} ${accent.strongText} px-3.5 py-1.5 text-[13px] font-bold`}
          >
            Modo {config.label}
            <span aria-hidden>⇄</span>
          </button>
          <button
            onClick={() => navigate({ name: 'settings' })}
            aria-label="Ajustes"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface text-ink-soft shadow-soft"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.3a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.3 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H7a1.7 1.7 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2 1.7 1.7 0 0 0-.3 1.9l.1.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V12a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
          </button>
        </div>
      </header>

      <div>
        <h1
          className="font-serif font-semibold leading-tight text-ink-strong"
          style={{ fontSize: tpx(config.typography.headingPx) }}
        >
          ¿Con qué empezamos?
        </h1>
        <p
          className="mt-1.5 leading-relaxed text-ink-soft"
          style={{ fontSize: tpx(config.typography.baseTextPx) }}
        >
          Elegí una actividad para practicar.
        </p>
      </div>

      <ul
        className={
          config.navigation.multiColumnHome
            ? 'grid grid-cols-2 gap-3.5'
            : 'flex flex-col'
        }
        style={
          config.navigation.multiColumnHome
            ? undefined
            : { rowGap: config.controls.blockGapPx }
        }
      >
        {ACTIVITY_ORDER.map((id, i) =>
          config.navigation.multiColumnHome ? (
            <motion.li
              key={id}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.04 * i, duration: 0.3 }}
            >
              <button
                onClick={() => open(id)}
                className={`flex h-full w-full flex-col items-start gap-3 border border-border bg-surface p-4 text-left shadow-soft ${radius}`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.softBg} ${accent.strongText}`}
                >
                  <ActivityGlyph id={id} />
                </span>
                <span>
                  <span className="block font-serif text-[18px] font-semibold text-ink-strong">
                    {ACTIVITY_LABELS[id]}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">
                    {ACTIVITY_HINT[id]}
                  </span>
                </span>
              </button>
            </motion.li>
          ) : (
            // Calmo: lista lineal, targets enormes, una decisión clara por fila.
            <motion.li
              key={id}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.05 * i, duration: 0.3 }}
            >
              <button
                onClick={() => open(id)}
                className={`flex w-full items-center gap-5 border border-border bg-surface p-5 text-left shadow-card ${radius}`}
                style={{ minHeight: config.controls.tapTargetMinPx + 24 }}
              >
                <span
                  className={`flex h-16 w-16 flex-none items-center justify-center rounded-3xl ${accent.softBg} ${accent.strongText}`}
                >
                  <ActivityGlyph id={id} />
                </span>
                <span
                  className="font-serif font-semibold text-ink-strong"
                  style={{ fontSize: tpx(config.typography.controlTextPx) }}
                >
                  {ACTIVITY_LABELS[id]}
                </span>
                <span className="ml-auto text-[26px] leading-none text-ink-muted" aria-hidden>
                  ›
                </span>
              </button>
            </motion.li>
          ),
        )}
      </ul>
    </main>
  )
}
