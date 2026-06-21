import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useMode } from '../modes/modeContext'
import { ACCENT, RADIUS_CLASS } from '../lib/accent'
import { tpx } from '../lib/typography'
import { useRetentionConfig } from './useRetentionConfig'
import { getDailyActivities } from './dailySession'
import { getBestScoreForActivities } from '../db/sessions'
import { ACTIVITY_LABELS, useNav } from '../navigation/navContext'
import { ActivityGlyph } from '../components/ActivityGlyph'
import type { ActivityId } from '../modes/types'

// ── Variante challenge (Ágil) ─────────────────────────────────────────────────

function ChallengeView({
  activities,
  softBg,
  strongText,
  radius,
  mode,
  reduce,
}: {
  activities: ActivityId[]
  softBg: string
  strongText: string
  radius: string
  mode: string
  reduce: boolean | null
}) {
  const { navigate } = useNav()
  const [combinedBest, setCombinedBest] = useState<number>(0)

  useEffect(() => {
    let alive = true
    void getBestScoreForActivities(activities, mode as never).then((bests) => {
      if (!alive) return
      setCombinedBest(Object.values(bests).reduce((s, v) => s + v, 0))
    })
    return () => { alive = false }
  }, [activities, mode])

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`${radius} border border-border p-3`}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <Flame size={13} className={strongText} aria-hidden />
        <span className={`text-[11px] font-bold uppercase tracking-wider ${strongText}`}>
          Desafío del día
        </span>
      </div>

      <div className="flex gap-2">
        {activities.map((id) => (
          <button
            key={id}
            onClick={() => navigate({ name: 'activity', activity: id })}
            className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface px-2 py-2 shadow-soft`}
            aria-label={`Empezar ${ACTIVITY_LABELS[id]}`}
          >
            <span className={strongText}>
              <ActivityGlyph id={id} size={18} />
            </span>
            <span className="text-center text-[11px] font-semibold leading-tight text-ink-soft">
              {ACTIVITY_LABELS[id]}
            </span>
          </button>
        ))}
      </div>

      {combinedBest > 0 && (
        <p className={`mt-2 text-[11px] font-bold ${strongText}`}>
          Récord combinado: {combinedBest.toLocaleString('es')} pts
        </p>
      )}
    </motion.div>
  )
}

// ── Variante routine (Sereno) ─────────────────────────────────────────────────

function RoutineView({
  activities,
  softBg,
  strongText,
  radius,
  baseTextPx,
  reduce,
}: {
  activities: ActivityId[]
  softBg: string
  strongText: string
  radius: string
  baseTextPx: number
  reduce: boolean | null
}) {
  const { navigate } = useNav()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`${softBg} ${radius} p-3.5`}
    >
      <p className={`mb-2 text-[12px] font-bold ${strongText}`}>
        Tu sesión sugerida
      </p>

      <div className="flex flex-col gap-2">
        {activities.map((id) => (
          <button
            key={id}
            onClick={() => navigate({ name: 'activity', activity: id })}
            className={`flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-left shadow-soft`}
            aria-label={`Empezar ${ACTIVITY_LABELS[id]}`}
          >
            <span className={strongText}>
              <ActivityGlyph id={id} size={18} />
            </span>
            <span
              className="font-semibold text-ink-strong"
              style={{ fontSize: tpx(baseTextPx) }}
            >
              {ACTIVITY_LABELS[id]}
            </span>
            <span className="ml-auto text-[20px] leading-none text-ink-muted" aria-hidden>
              ›
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ── Variante invitation (Calmo) ───────────────────────────────────────────────

function InvitationView({
  activity,
  softBg,
  strongText,
  solidBg,
  onSolid,
  radius,
  controlTextPx,
  headingPx,
  primaryButtonMinHeightPx,
  reduce,
}: {
  activity: ActivityId
  softBg: string
  strongText: string
  solidBg: string
  onSolid: string
  radius: string
  controlTextPx: number
  headingPx: number
  primaryButtonMinHeightPx: number
  reduce: boolean | null
}) {
  const { navigate } = useNav()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`${softBg} ${radius} p-5`}
    >
      <p
        className={`mb-4 font-serif font-semibold leading-snug ${strongText}`}
        style={{ fontSize: tpx(headingPx - 4) }}
      >
        ¿Empezamos con esto?
      </p>

      <div className="mb-5 flex items-center gap-4">
        <span
          className={`flex h-16 w-16 flex-none items-center justify-center rounded-3xl bg-surface ${strongText} shadow-soft`}
        >
          <ActivityGlyph id={activity} size={28} />
        </span>
        <span
          className="font-serif font-semibold text-ink-strong"
          style={{ fontSize: tpx(controlTextPx) }}
        >
          {ACTIVITY_LABELS[activity]}
        </span>
      </div>

      <button
        onClick={() => navigate({ name: 'activity', activity })}
        className={`flex w-full items-center justify-center ${radius} ${solidBg} ${onSolid} font-bold shadow-card`}
        style={{ minHeight: primaryButtonMinHeightPx, fontSize: tpx(controlTextPx - 2) }}
      >
        Empezar →
      </button>
    </motion.div>
  )
}

// ── Componente público ────────────────────────────────────────────────────────

export function DailySessionWidget() {
  const { config } = useMode()
  const retention = useRetentionConfig()
  const reduce = useReducedMotion()

  const accent = ACCENT[config.accent]
  const radius = RADIUS_CLASS[config.controls.radius]
  const { framing, count } = retention.dailySession
  const activities = getDailyActivities(count)

  if (framing === 'challenge') {
    return (
      <ChallengeView
        activities={activities}
        softBg={accent.softBg}
        strongText={accent.strongText}
        radius={radius}
        mode={config.id}
        reduce={reduce}
      />
    )
  }

  if (framing === 'routine') {
    return (
      <RoutineView
        activities={activities}
        softBg={accent.softBg}
        strongText={accent.strongText}
        radius={radius}
        baseTextPx={config.typography.baseTextPx}
        reduce={reduce}
      />
    )
  }

  // invitation (Calmo)
  return (
    <InvitationView
      activity={activities[0]}
      softBg={accent.softBg}
      strongText={accent.strongText}
      solidBg={accent.solidBg}
      onSolid={accent.onSolid}
      radius={radius}
      controlTextPx={config.typography.controlTextPx}
      headingPx={config.typography.headingPx}
      primaryButtonMinHeightPx={config.controls.primaryButtonMinHeightPx}
      reduce={reduce}
    />
  )
}
