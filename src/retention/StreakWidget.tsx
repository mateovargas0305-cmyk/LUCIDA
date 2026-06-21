import { motion, useReducedMotion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useMode } from '../modes/modeContext'
import { ACCENT, RADIUS_CLASS } from '../lib/accent'
import { useRetentionConfig } from './useRetentionConfig'
import { useStreak } from './useStreak'
import type { StreakProminence } from './types'

/** Dónde aparece el widget — determina qué variantes se renderizan. */
export type StreakContext = 'home' | 'session-end' | 'progress'

interface StreakWidgetProps {
  context: StreakContext
  /** Cambiarlo fuerza una recarga desde IndexedDB (pasar `sessionSaved` en SessionSummary). */
  refreshKey?: unknown
}

function shouldShow(context: StreakContext, prominence: StreakProminence): boolean {
  if (context === 'home') return prominence === 'high'
  if (context === 'session-end') return prominence === 'high' || prominence === 'low'
  return true // 'progress': siempre
}

// ── Variante high (Ágil) ─────────────────────────────────────────────────────

interface HighProps {
  streakDays: number
  longestStreak: number
  resetTone: 'neutral' | 'silent'
  softBg: string
  strongText: string
  radius: string
  reduce: boolean | null
  context: StreakContext
}

function StreakHigh({ streakDays, longestStreak, resetTone, softBg, strongText, radius, reduce, context }: HighProps) {
  const broken = streakDays === 0 && longestStreak > 0
  const virgin = streakDays === 0 && longestStreak === 0

  // ── Home: chip compacto, sin bloque de fondo ─────────────────────────────
  if (context === 'home') {
    if (virgin || broken) {
      return (
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`text-[13px] font-medium ${strongText}`}
        >
          {virgin
            ? '¡Comenzá tu racha hoy!'
            : resetTone === 'neutral'
              ? '¡A empezar de nuevo!'
              : 'Bienvenido de nuevo'}
        </motion.p>
      )
    }
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="inline-flex items-center gap-1.5 self-start rounded-pill border border-border bg-surface px-3 py-1.5"
        aria-label={`Racha: ${streakDays} días`}
      >
        <Flame size={13} className={`flex-none ${strongText}`} aria-hidden />
        <span className={`text-[13px] font-bold ${strongText}`}>
          {streakDays} {streakDays === 1 ? 'día' : 'días'}
        </span>
        {longestStreak === streakDays && longestStreak > 1 && (
          <span className={`text-[11px] font-semibold opacity-60 ${strongText}`}>· récord</span>
        )}
      </motion.div>
    )
  }

  // ── Session-end / progress: escala según magnitud de la racha ────────────

  // Racha baja (1-2): discreta, flame pequeño
  if (!broken && !virgin && streakDays < 3) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex items-center gap-2 px-3 py-2 ${softBg} ${radius}`}
        aria-label={`Racha: ${streakDays} días`}
      >
        <Flame size={14} className={`flex-none ${strongText}`} aria-hidden />
        <span className={`text-[13px] font-semibold ${strongText}`}>
          {streakDays === 1 ? 'Primer día de racha · ¡a seguir!' : '2 días seguidos · ¡bien!'}
        </span>
      </motion.div>
    )
  }

  // Racha 3+ o estado vacío/roto: diseño completo
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex items-center gap-3 px-4 py-3 ${softBg} ${radius}`}
      aria-label={`Racha: ${streakDays} días`}
    >
      <span className={`flex-none ${strongText}`} aria-hidden>
        <Flame size={24} strokeWidth={1.8} />
      </span>

      {(broken || virgin) ? (
        <div className="min-w-0 flex-1">
          <p className={`font-serif text-[16px] font-semibold leading-snug ${strongText}`}>
            {virgin
              ? '¡Comenzá tu racha hoy!'
              : resetTone === 'neutral'
                ? '¡A empezar de nuevo!'
                : 'Bienvenido de nuevo'}
          </p>
          {longestStreak > 0 && (
            <p className="mt-0.5 text-[12px] text-ink-soft">
              Récord: {longestStreak} {longestStreak === 1 ? 'día' : 'días'}
            </p>
          )}
        </div>
      ) : (
        <>
          <motion.span
            key={streakDays}
            initial={reduce ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`font-serif text-[30px] font-bold leading-none ${strongText}`}
            aria-hidden
          >
            {streakDays}
          </motion.span>
          <div className="min-w-0 flex-1">
            <p className={`text-[14px] font-semibold leading-tight ${strongText}`}>
              {streakDays === 1 ? 'día seguido' : 'días seguidos'}
            </p>
            {longestStreak > streakDays && (
              <p className="mt-0.5 text-[12px] text-ink-soft">
                Récord: {longestStreak} {longestStreak === 1 ? 'día' : 'días'}
              </p>
            )}
            {longestStreak === streakDays && longestStreak > 1 && (
              <p className={`mt-0.5 text-[12px] font-bold ${strongText}`}>¡Nuevo récord!</p>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}

// ── Variante low (Sereno) ────────────────────────────────────────────────────

interface LowProps {
  streakDays: number
  recentWeek: boolean[]
  solidBg: string
  radius: string
  reduce: boolean | null
}

function StreakLow({ streakDays, recentWeek, solidBg, radius, reduce }: LowProps) {
  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const todayDow = new Date().getDay()
  const dowOrder = [1, 2, 3, 4, 5, 6, 0]

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`px-4 py-2.5 ${radius} bg-surface border border-border`}
      aria-label={`Racha: ${streakDays} días`}
    >
      <div className="flex justify-between" aria-hidden>
        {recentWeek.map((played, i) => {
          const offsetFromToday = 6 - i
          const dow = (todayDow - offsetFromToday + 7) % 7
          const label = dayLabels[dowOrder.indexOf(dow)]
          return (
            <motion.div
              key={i}
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: reduce ? 0 : 0.04 * i, duration: 0.25 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`h-6 w-6 rounded-full transition-colors ${
                  played ? solidBg : 'bg-border'
                }`}
              />
              <span className="text-[10px] font-bold text-ink-muted">{label}</span>
            </motion.div>
          )
        })}
      </div>
      <p className="mt-2 text-center text-[13px] text-ink-soft">
        {streakDays === 0
          ? 'Empezá a jugar para construir tu racha'
          : streakDays === 1
            ? 'Jugaste ayer y hoy · seguí así'
            : `${streakDays} días seguidos`}
      </p>
    </motion.div>
  )
}

// ── Variante minimal (Calmo) ─────────────────────────────────────────────────

interface MinimalProps {
  playedToday: boolean
  softBg: string
  strongText: string
  radius: string
  reduce: boolean | null
}

function StreakMinimal({ playedToday, softBg, strongText, radius, reduce }: MinimalProps) {
  if (!playedToday) return null

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`flex items-center gap-3 px-4 py-3 ${softBg} ${radius}`}
      aria-label="Jugaste hoy"
    >
      <span className={`text-[20px] leading-none ${strongText}`} aria-hidden>✓</span>
      <span className={`text-[17px] font-semibold ${strongText}`}>Jugaste hoy</span>
    </motion.div>
  )
}

// ── Componente público ────────────────────────────────────────────────────────

export function StreakWidget({ context, refreshKey }: StreakWidgetProps) {
  const { config } = useMode()
  const retention = useRetentionConfig()
  const streak = useStreak(refreshKey)
  const reduce = useReducedMotion()

  const { prominence, resetTone } = retention.streak

  if (!shouldShow(context, prominence)) return null
  if (streak.loading) return null

  const accent = ACCENT[config.accent]
  const radius = RADIUS_CLASS[config.controls.radius]

  if (prominence === 'high') {
    return (
      <StreakHigh
        streakDays={streak.streakDays}
        longestStreak={streak.longestStreak}
        resetTone={resetTone}
        softBg={accent.softBg}
        strongText={accent.strongText}
        radius={radius}
        reduce={reduce}
        context={context}
      />
    )
  }

  if (prominence === 'low') {
    return (
      <StreakLow
        streakDays={streak.streakDays}
        recentWeek={streak.recentWeek}
        solidBg={accent.solidBg}
        radius={radius}
        reduce={reduce}
      />
    )
  }

  // minimal
  return (
    <StreakMinimal
      playedToday={streak.playedToday}
      softBg={accent.softBg}
      strongText={accent.strongText}
      radius={radius}
      reduce={reduce}
    />
  )
}
