import { motion, useReducedMotion } from 'framer-motion'
import { useMode } from '../modes/modeContext'
import { ACCENT, RADIUS_CLASS } from '../lib/accent'
import { tpx } from '../lib/typography'
import { ScreenHeader } from '../components/ui/ScreenHeader'
import { useRetentionConfig } from '../retention/useRetentionConfig'
import { useProgressData, type WeekSummary } from '../retention/useProgressData'
import type { DailyProgress } from '../db/sessions'
import { ACTIVITY_LABELS } from '../navigation/navContext'
import type { ActivityId } from '../modes/types'

// ── SVG Sparkline (Ágil) ─────────────────────────────────────────────────────

function SparkLine({
  data,
  strongText,
}: {
  data: number[]
  strongText: string
}) {
  const reduce = useReducedMotion()
  const W = 300
  const H = 80
  const PAD_X = 4
  const PAD_Y = 6
  const hasData = data.some((v) => v > 0)

  if (!hasData) {
    return (
      <div className="flex h-20 items-center justify-center">
        <p className="text-center text-[14px] text-ink-muted">
          Jugá algunas sesiones para ver tu evolución aquí
        </p>
      </div>
    )
  }

  const max = Math.max(...data, 1)
  const n = data.length
  const xStep = (W - PAD_X * 2) / Math.max(n - 1, 1)
  const pts = data.map((v, i): [number, number] => [
    PAD_X + i * xStep,
    H - PAD_Y - (v / max) * (H - PAD_Y * 2),
  ])

  const linePath = pts
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')

  const areaPath =
    linePath +
    ` L${pts[pts.length - 1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`

  // Separador semana pasada / esta semana (en el día 7 de los últimos 14)
  const sepX = PAD_X + 6.5 * xStep

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full ${strongText}`}
      aria-hidden
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Área bajo la línea */}
      <path d={areaPath} fill="url(#sparkGrad)" />

      {/* Separador sutil entre semana pasada y esta semana */}
      <line
        x1={sepX}
        y1={PAD_Y}
        x2={sepX}
        y2={H - PAD_Y}
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {/* Línea principal animada */}
      <motion.path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />

      {/* Puntos por día con sesiones */}
      {pts.map(([x, y], i) =>
        data[i] > 0 ? (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill="currentColor"
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: reduce ? 0 : 0.6 + i * 0.03, duration: 0.2 }}
          />
        ) : null,
      )}
    </svg>
  )
}

// ── Variante performance (Ágil) ───────────────────────────────────────────────

function pctChange(a: number, b: number): number | null {
  if (b === 0) return null
  return Math.round(((a - b) / b) * 100)
}

function WeekCard({
  label,
  summary,
  compareScore,
  softBg,
  strongText,
  radius,
}: {
  label: string
  summary: WeekSummary
  compareScore?: number
  softBg: string
  strongText: string
  radius: string
}) {
  const change = compareScore !== undefined ? pctChange(summary.totalScore, compareScore) : null

  return (
    <div className={`flex-1 ${softBg} ${radius} p-4`}>
      <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <p className={`font-serif text-[28px] font-bold leading-none ${strongText}`}>
        {summary.sessions}
      </p>
      <p className="mt-0.5 text-[13px] text-ink-soft">
        {summary.sessions === 1 ? 'sesión' : 'sesiones'}
      </p>
      {summary.sessions > 0 && (
        <p className="mt-2 text-[13px] text-ink-soft">
          {summary.totalScore.toLocaleString('es')} pts
        </p>
      )}
      {change !== null && (
        <p
          className={`mt-1 text-[13px] font-bold ${
            change >= 0 ? strongText : 'text-ink-muted'
          }`}
        >
          {change >= 0 ? `+${change}%` : `${change}%`}
        </p>
      )}
    </div>
  )
}

function PerformanceView({
  data,
  softBg,
  strongText,
  radius,
  baseTextPx,
}: {
  data: ReturnType<typeof useProgressData>
  softBg: string
  strongText: string
  radius: string
  baseTextPx: number
}) {
  const last14 = data.daily28.slice(14).map((d) => d.maxScore)

  return (
    <div className="flex flex-col gap-5">
      {/* Comparación semanal */}
      <section aria-label="Comparación semanal">
        <p
          className="mb-3 font-semibold text-ink-soft"
          style={{ fontSize: tpx(13) }}
        >
          Esta semana vs. semana pasada
        </p>
        <div className="flex gap-3">
          <WeekCard
            label="Esta semana"
            summary={data.thisWeek}
            compareScore={data.lastWeek.totalScore}
            softBg={softBg}
            strongText={strongText}
            radius={radius}
          />
          <WeekCard
            label="Semana pasada"
            summary={data.lastWeek}
            softBg="bg-surface border border-border"
            strongText="text-ink-strong"
            radius={radius}
          />
        </div>
      </section>

      {/* Sparkline últimas 2 semanas */}
      <section aria-label="Evolución de puntaje">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold text-ink-soft" style={{ fontSize: tpx(13) }}>
            Últimas 2 semanas
          </p>
          {data.allTimeBest > 0 && (
            <p className={`text-[12px] font-bold ${strongText}`}>
              Récord: {data.allTimeBest.toLocaleString('es')} pts
            </p>
          )}
        </div>
        <div className={`${softBg} ${radius} px-3 py-4`}>
          <div className="mb-1 flex justify-between px-1">
            <span className="text-[11px] text-ink-muted">Sem. pas.</span>
            <span className="text-[11px] text-ink-muted">Esta sem.</span>
          </div>
          <SparkLine data={last14} strongText={strongText} />
        </div>
      </section>

      {/* Total histórico */}
      {data.totalSessions > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4 text-center">
          <p
            className={`font-serif font-bold leading-none ${strongText}`}
            style={{ fontSize: tpx(baseTextPx + 8) }}
          >
            {data.totalSessions}
          </p>
          <p className="mt-1 text-[13px] text-ink-muted">
            sesiones completadas en total
          </p>
        </div>
      )}
    </div>
  )
}

// ── Variante consistency (Sereno) ─────────────────────────────────────────────

function DotGrid({
  daily28,
  solidBg,
  radius,
  reduce,
}: {
  daily28: DailyProgress[]
  solidBg: string
  radius: string
  reduce: boolean | null
}) {
  const weeks = [
    { label: 'Hace 3 sem.', days: daily28.slice(0, 7) },
    { label: 'Hace 2 sem.', days: daily28.slice(7, 14) },
    { label: 'Sem. pas.', days: daily28.slice(14, 21) },
    { label: 'Esta sem.', days: daily28.slice(21) },
  ]

  return (
    <div className={`${radius} bg-surface border border-border p-4`} aria-hidden>
      <div className="flex flex-col gap-2.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex items-center gap-3">
            <span className="w-20 flex-none text-right text-[11px] text-ink-muted">
              {week.label}
            </span>
            <div className="flex flex-1 justify-between">
              {week.days.map((d, di) => (
                <motion.div
                  key={di}
                  className={`h-6 w-6 rounded-full transition-colors ${
                    d.sessions > 0 ? solidBg : 'bg-border'
                  }`}
                  initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: reduce ? 0 : (wi * 7 + di) * 0.025,
                    duration: 0.25,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConsistencyView({
  data,
  softBg,
  strongText,
  solidBg,
  radius,
  reduce,
  baseTextPx,
}: {
  data: ReturnType<typeof useProgressData>
  softBg: string
  strongText: string
  solidBg: string
  radius: string
  reduce: boolean | null
  baseTextPx: number
}) {
  const { thisWeek, lastWeek } = data

  const headline = thisWeek.daysActive === 0
    ? 'Cuando quieras, retomamos.'
    : thisWeek.daysActive >= 5
      ? 'Venís entrenando muy seguido.'
      : thisWeek.daysActive >= 3
        ? 'Venís entrenando con constancia.'
        : 'Buen comienzo de semana.'

  return (
    <div className="flex flex-col gap-5">
      {/* Titular motivacional */}
      <p
        className={`font-serif font-semibold leading-snug ${strongText}`}
        style={{ fontSize: tpx(baseTextPx + 2) }}
      >
        {headline}
      </p>

      {/* Grilla de puntos */}
      <DotGrid
        daily28={data.daily28}
        solidBg={solidBg}
        radius={radius}
        reduce={reduce}
      />

      {/* Resumen semanas */}
      <div className="flex gap-3">
        {[
          { label: 'Esta semana', d: thisWeek },
          { label: 'Sem. pasada', d: lastWeek },
        ].map(({ label, d }) => (
          <div
            key={label}
            className={`flex-1 ${softBg} ${radius} p-4 text-center`}
          >
            <p className={`font-serif text-[28px] font-bold leading-none ${strongText}`}>
              {d.daysActive}
            </p>
            <p className="mt-0.5 text-[13px] text-ink-soft">
              {d.daysActive === 1 ? 'día activo' : 'días activos'}
            </p>
            <p className="mt-1.5 text-[12px] text-ink-muted">
              {label}
            </p>
          </div>
        ))}
      </div>

      {data.totalSessions > 0 && (
        <p className="text-center text-[14px] text-ink-soft">
          {data.totalSessions} sesiones completadas en total
        </p>
      )}
    </div>
  )
}

// ── Variante participation (Calmo) ────────────────────────────────────────────

function ParticipationView({
  data,
  softBg,
  strongText,
  radius,
  headingPx,
  baseTextPx,
}: {
  data: ReturnType<typeof useProgressData>
  softBg: string
  strongText: string
  radius: string
  headingPx: number
  baseTextPx: number
}) {
  const count = data.thisWeek.sessions
  const activitiesThisWeek = [
    ...new Set(
      data.daily28.slice(21).flatMap((d) => d.activities),
    ),
  ] as ActivityId[]

  const warmMessage =
    count === 0
      ? 'Cuando quieras, acá estamos.'
      : count === 1
        ? 'Qué bueno que pasaste por acá.'
        : count <= 3
          ? 'Gracias por practicar esta semana.'
          : 'Qué lindo verte por acá tan seguido.'

  return (
    <div className="flex flex-col gap-6">
      {/* Número grande */}
      <div className={`${softBg} ${radius} px-6 py-8 text-center`}>
        <p
          className={`font-serif font-bold leading-none ${strongText}`}
          style={{ fontSize: tpx(headingPx + 16) }}
          aria-label={`Esta semana participaste ${count} veces`}
        >
          {count}
        </p>
        <p
          className={`mt-3 leading-snug ${strongText}`}
          style={{ fontSize: tpx(baseTextPx) }}
        >
          {count === 1 ? 'vez esta semana' : 'veces esta semana'}
        </p>
      </div>

      {/* Mensaje cálido */}
      <p
        className="text-center leading-relaxed text-ink-soft"
        style={{ fontSize: tpx(baseTextPx) }}
      >
        {warmMessage}
      </p>

      {/* Actividades practicadas */}
      {activitiesThisWeek.length > 0 && (
        <section aria-label="Actividades practicadas">
          <p
            className="mb-3 font-semibold text-ink-soft"
            style={{ fontSize: tpx(baseTextPx - 2) }}
          >
            Practicaste esta semana:
          </p>
          <div className="flex flex-wrap gap-2.5">
            {activitiesThisWeek.map((id) => (
              <span
                key={id}
                className={`${softBg} ${strongText} ${radius} px-4 py-2 font-semibold`}
                style={{ fontSize: tpx(baseTextPx - 2) }}
              >
                {ACTIVITY_LABELS[id]}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Pantalla principal ────────────────────────────────────────────────────────

export function ProgressScreen() {
  const { config } = useMode()
  const retention = useRetentionConfig()
  const data = useProgressData()
  const reduce = useReducedMotion()

  const accent = ACCENT[config.accent]
  const radius = RADIUS_CLASS[config.controls.radius]

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-10 pt-8"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <ScreenHeader title="Mi progreso" />

      {data.loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[15px] text-ink-muted">Cargando…</p>
        </div>
      ) : (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-5"
        >
          {retention.trend === 'performance' && (
            <PerformanceView
              data={data}
              softBg={accent.softBg}
              strongText={accent.strongText}
              radius={radius}
              baseTextPx={config.typography.baseTextPx}
            />
          )}
          {retention.trend === 'consistency' && (
            <ConsistencyView
              data={data}
              softBg={accent.softBg}
              strongText={accent.strongText}
              solidBg={accent.solidBg}
              radius={radius}
              reduce={reduce}
              baseTextPx={config.typography.baseTextPx}
            />
          )}
          {retention.trend === 'participation' && (
            <ParticipationView
              data={data}
              softBg={accent.softBg}
              strongText={accent.strongText}
              radius={radius}
              headingPx={config.typography.headingPx}
              baseTextPx={config.typography.baseTextPx}
            />
          )}
        </motion.div>
      )}
    </main>
  )
}
