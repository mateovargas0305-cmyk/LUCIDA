import { motion, useReducedMotion } from 'framer-motion'
import {
  BookOpen,
  Hash,
  LayoutGrid,
  Eye,
  Repeat2,
  Link2,
  Type,
  Zap,
  Settings,
  ArrowLeftRight,
} from 'lucide-react'
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
  'stroop',
  'symbolSpeed',
]

const ACTIVITY_HINT: Record<ActivityId, string> = {
  quiz: 'Preguntas de cultura general.',
  calc: 'Sumas, restas y más.',
  memory: 'Encontrá las parejas.',
  attention: 'Descubrí el diferente.',
  sequence: 'Repetí la secuencia de colores.',
  chainedCalc: 'Calculá paso a paso la cadena.',
  stroop: 'Identificá el color de la tinta.',
  symbolSpeed: 'Asociá cada símbolo con su código.',
}

function ActivityGlyph({ id }: { id: ActivityId }) {
  const iconProps = { size: 26, 'aria-hidden': true } as const
  switch (id) {
    case 'quiz':        return <BookOpen {...iconProps} />
    case 'calc':        return <Hash {...iconProps} />
    case 'memory':      return <LayoutGrid {...iconProps} />
    case 'attention':   return <Eye {...iconProps} />
    case 'sequence':    return <Repeat2 {...iconProps} />
    case 'chainedCalc': return <Link2 {...iconProps} />
    case 'stroop':      return <Type {...iconProps} />
    case 'symbolSpeed': return <Zap {...iconProps} />
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
      className="flex flex-1 flex-col px-6 pb-10 pt-8"
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
            <ArrowLeftRight size={14} aria-hidden />
          </button>
          <button
            onClick={() => navigate({ name: 'settings' })}
            aria-label="Ajustes"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface text-ink-soft shadow-soft"
          >
            <Settings size={18} aria-hidden />
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
