import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useModeConfig } from '../modes/modeContext'
import { playComplete } from '../lib/audioManager'
import { PrimaryButton } from './ui/PrimaryButton'
import { ACCENT } from '../lib/accent'
import { tpx } from '../lib/typography'
import type { AccentToken } from '../modes/types'
import { recordSession, type NewSession } from '../db/sessions'
import { useNav } from '../navigation/navContext'
import { StreakWidget } from '../retention/StreakWidget'

export interface SummaryStat {
  label: string
  value: ReactNode
  accent: AccentToken
}

interface SessionSummaryProps {
  /** Título de la pantalla con puntaje (ignorado en Calmo). */
  headline: string
  /** Subtítulo descriptivo (ignorado en Calmo). */
  subline: ReactNode
  /** Tarjetas de estadística (sólo se muestran si el modo tiene puntaje). */
  stats: SummaryStat[]
  /** Datos a persistir en el historial (Dexie). */
  record: NewSession
  onAgain: () => void
  onHome: () => void
  againLabel?: string
}

const STAT_STYLE: Record<AccentToken, string> = {
  agil: 'bg-agil-soft text-agil-strong',
  sereno: 'bg-sereno-soft text-sereno-strong',
  calmo: 'bg-calmo-soft text-calmo-strong',
}

/**
 * Cierre de sesión, adaptado al modo:
 *  - con puntaje (Ágil/Sereno): resumen con energía y estadísticas.
 *  - sin puntaje (Calmo): cierre cálido, una sola acción, sin números.
 */
export function SessionSummary({
  headline,
  subline,
  stats,
  record,
  onAgain,
  onHome,
  againLabel = 'Otra ronda',
}: SessionSummaryProps) {
  const config = useModeConfig()
  const reduce = useReducedMotion()
  const accent = ACCENT[config.accent]
  const { screen } = useNav()
  // Origen del lanzamiento: la ruta 'activity' sigue activa al mostrar el cierre.
  const source = screen.name === 'activity' ? screen.source : undefined

  // Guardar la sesión y reproducir sonido de cierre una sola vez.
  // `sessionSaved` se usa como refreshKey del StreakWidget para que lea el
  // historial *después* de que la sesión quede escrita en IndexedDB.
  const [sessionSaved, setSessionSaved] = useState(false)
  const saved = useRef(false)
  useEffect(() => {
    if (saved.current) return
    saved.current = true
    playComplete()
    void recordSession({ ...record, source }).then(() => setSessionSaved(true))
  }, [record, source])

  if (!config.scoring.enabled) {
    // Calmo: nada de puntaje, nada de "errores". Sólo gratitud y calma.
    return (
      <main className="flex flex-1 flex-col items-center px-7 pb-9 pt-8 text-center">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="relative mb-8 h-[120px] w-[140px]" aria-hidden>
            <span className="absolute left-3 top-4 h-[84px] w-[84px] rounded-full bg-agil-soft opacity-90" />
            <span className="absolute right-2 top-0 h-[70px] w-[70px] rounded-full bg-calmo opacity-90" />
            <span className="absolute bottom-0 left-11 h-[58px] w-[58px] rounded-full bg-sereno opacity-90" />
          </div>
          <h1
            className="font-serif font-semibold leading-snug text-ink-strong"
            style={{ fontSize: tpx(config.typography.headingPx) }}
          >
            Qué lindo rato compartimos hoy
          </h1>
          <p
            className="mt-5 leading-relaxed text-ink-soft"
            style={{ fontSize: tpx(config.typography.baseTextPx) }}
          >
            Gracias por estar acá. Volvé cuando quieras.
          </p>
        </div>
        <PrimaryButton onClick={onHome}>Volver al inicio</PrimaryButton>
      </main>
    )
  }

  // Ágil / Sereno: resumen con estadísticas.
  return (
    <main className="flex flex-1 flex-col px-6 pb-9 pt-8">
      <div className="text-center">
        <motion.div
          initial={reduce ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${accent.solidBg} ${accent.shadow}`}
        >
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-surface" aria-hidden>
            <path d="M12 3l2.6 6 6.4.5-5 4.3 1.6 6.2L12 16.5 6.4 20l1.6-6.2-5-4.3 6.4-.5z" />
          </svg>
        </motion.div>
        <h1 className="mt-4 font-serif text-[28px] font-semibold text-ink-strong">
          {headline}
        </h1>
        <p className="mt-1 text-[15px] text-ink-soft">{subline}</p>
      </div>

      {stats.length > 0 && (
        <div className="mt-7 flex gap-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`flex-1 rounded-2xl border border-border p-4 text-center ${STAT_STYLE[s.accent]}`}
            >
              <div className="font-serif text-[26px] font-bold leading-none">
                {s.value}
              </div>
              <div className="mt-1 text-[12px] font-bold">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {sessionSaved && <StreakWidget context="session-end" refreshKey={sessionSaved} />}

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <PrimaryButton onClick={onAgain}>{againLabel} ›</PrimaryButton>
        <button
          onClick={onHome}
          className="min-h-11 font-sans text-[15px] font-bold text-ink-muted"
        >
          Volver al inicio
        </button>
      </div>
    </main>
  )
}
