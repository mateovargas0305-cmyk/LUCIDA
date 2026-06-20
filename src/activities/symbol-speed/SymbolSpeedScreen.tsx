import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { FeedbackBanner } from '../../components/ui/FeedbackBanner'
import { CountdownTimer } from '../../components/ui/CountdownTimer'
import { SessionSummary } from '../../components/SessionSummary'
import { useModeConfig } from '../../modes/modeContext'
import { useNav } from '../../navigation/navContext'
import { useChoiceSession } from '../shared/useChoiceSession'
import { tpx } from '../../lib/typography'
import {
  buildSymbolTable,
  buildSymbolRounds,
  type SymbolKey,
  type SymbolSpeedRound,
} from './symbolSpeedEngine'

type OptionStatus = 'idle' | 'correct' | 'wrongChosen' | 'dimmed'

const OPTION_BOX: Record<OptionStatus, string> = {
  idle: 'bg-surface border-border text-ink-strong',
  correct: 'bg-positive-soft border-positive text-positive-ink',
  wrongChosen: 'bg-calmo-soft border-calmo text-calmo-strong',
  dimmed: 'bg-surface border-border text-ink-muted',
}

export function SymbolSpeedScreen() {
  const config = useModeConfig()
  const { back } = useNav()
  const reduce = useReducedMotion()
  const symCfg = config.activities.symbolSpeed

  // La tabla de referencia se construye UNA sola vez por sesión (y en cada restart).
  const tableRef = useRef<SymbolKey[]>(buildSymbolTable(symCfg.symbolCount))

  const session = useChoiceSession<SymbolSpeedRound>({
    build: () => {
      tableRef.current = buildSymbolTable(symCfg.symbolCount)
      return buildSymbolRounds(symCfg, tableRef.current)
    },
    retryOnError: config.activities.quiz.retryOnError,
    pointsPerCorrect: config.scoring.enabled ? config.scoring.pointsPerCorrect : 0,
    streakBonusEnabled: config.scoring.streakBonusEnabled,
    streakBonusThreshold: config.scoring.streakBonusThreshold,
    streakBonusPoints: config.scoring.streakBonusPoints,
  })

  const questionStartRef = useRef(Date.now())
  const sessionIndex = session.index
  useEffect(() => {
    questionStartRef.current = Date.now()
  }, [sessionIndex])

  const { timedOut, next } = session
  useEffect(() => {
    if (!timedOut) return
    const id = setTimeout(() => next(), 1300)
    return () => clearTimeout(id)
  }, [timedOut, next])

  if (session.finished) {
    return (
      <SessionSummary
        headline="¡Sesión completa!"
        subline={
          <>
            Acertaste{' '}
            <strong>
              {session.correctCount} de {session.total}
            </strong>
            .
          </>
        }
        stats={[
          { label: 'Puntaje', value: session.score, accent: 'agil' },
          {
            label: 'Aciertos',
            value: `${session.correctCount}/${session.total}`,
            accent: 'sereno',
          },
        ]}
        record={{
          activity: 'symbolSpeed',
          mode: config.id,
          correct: session.correctCount,
          total: session.total,
          score: session.score,
        }}
        onAgain={session.restart}
        onHome={back}
      />
    )
  }

  const round = session.current
  const table = tableRef.current
  const big = !config.scoring.enabled
  const isLast = session.index >= session.total - 1
  const showTimer = config.timing.timerAllowed && config.timing.secondsPerQuestion !== null
  const answeredCorrectly =
    session.locked && !session.timedOut && session.selected === round.correctIndex

  const statusOf = (i: number): OptionStatus => {
    if (!session.locked) return 'idle'
    if (i === round.correctIndex) return 'correct'
    if (i === session.selected) return 'wrongChosen'
    return 'dimmed'
  }

  const handleSelect = (i: number) => {
    const elapsed = Date.now() - questionStartRef.current
    const secs = config.timing.secondsPerQuestion
    const speedBonus =
      config.scoring.speedBonusEnabled &&
      secs !== null &&
      elapsed < secs * config.scoring.speedBonusThresholdPct * 1000
        ? config.scoring.speedBonusPoints
        : 0
    session.select(i, speedBonus)
  }

  const bonusSuffix =
    answeredCorrectly && session.lastBonus ? ` · +${session.lastBonus} bonus` : ''

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-9 pt-12"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      {big ? (
        <div>
          <h1
            className="font-serif font-semibold leading-snug text-ink-strong"
            style={{ fontSize: tpx(config.typography.headingPx) }}
          >
            ¿Qué número le toca?
          </h1>
          <p
            className="mt-2 leading-relaxed text-ink-soft"
            style={{ fontSize: tpx(config.typography.baseTextPx) }}
          >
            Buscá el símbolo en la tabla de arriba.
          </p>
        </div>
      ) : (
        <>
          <ScreenHeader
            title="Velocidad de símbolos"
            right={
              config.scoring.enabled ? (
                <div className="flex items-center gap-2">
                  {session.currentStreak >= 3 && (
                    <span className="rounded-full bg-agil px-2.5 py-1 text-[12px] font-bold text-surface">
                      Racha {session.currentStreak}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 rounded-full bg-agil-soft px-3 py-1.5 text-[14px] font-bold text-agil-strong">
                    <span className="h-2 w-2 rotate-45 rounded-[2px] bg-agil" aria-hidden />
                    {session.score}
                  </span>
                </div>
              ) : undefined
            }
          />
          {config.scoring.showProgressBar && (
            <div className="flex items-center gap-3" aria-hidden>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-agil transition-[width] duration-300"
                  style={{ width: `${((session.index + 1) / session.total) * 100}%` }}
                />
              </div>
              <span className="text-[13px] font-bold text-ink-muted">
                {session.index + 1}/{session.total}
              </span>
            </div>
          )}
        </>
      )}

      {showTimer && (
        <CountdownTimer
          totalSeconds={config.timing.secondsPerQuestion!}
          questionKey={session.index}
          onExpire={session.timeout}
          paused={session.locked}
        />
      )}

      {/* Tabla de referencia (siempre visible) */}
      <div
        className="rounded-2xl border border-border bg-canvas px-4 py-3"
        aria-label="Tabla de referencia de símbolos"
      >
        <ul className="flex flex-wrap justify-center gap-3">
          {table.map((entry) => (
            <li
              key={entry.symbol}
              className="flex flex-col items-center gap-1 rounded-xl bg-surface px-4 py-2 shadow-soft"
            >
              <span
                className="font-bold leading-none text-ink-strong"
                style={{ fontSize: big ? tpx(32) : tpx(24) }}
                aria-hidden
              >
                {entry.symbol}
              </span>
              <span
                className="font-bold tabular-nums text-ink-soft"
                style={{ fontSize: big ? tpx(20) : tpx(15) }}
              >
                {entry.code}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Símbolo objetivo */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p
          className="font-sans font-bold text-ink-muted"
          style={{ fontSize: tpx(config.typography.captionPx) }}
        >
          ¿Qué número le corresponde a…?
        </p>
        <span
          className="font-bold leading-none text-ink-strong"
          style={{ fontSize: big ? tpx(100) : tpx(80) }}
          aria-label={`Símbolo: ${round.targetSymbol}`}
        >
          {round.targetSymbol}
        </span>
      </div>

      {/* Opciones numéricas */}
      <ul className="grid grid-cols-2 gap-3">
        {round.options.map((code, i) => {
          const status = statusOf(i)
          return (
            <li key={i}>
              <motion.button
                onClick={() => handleSelect(i)}
                disabled={session.locked}
                whileTap={reduce || session.locked ? undefined : { scale: 0.97 }}
                className={`flex w-full items-center justify-center gap-3 border-2 font-serif font-bold transition-colors ${big ? 'rounded-2xl' : 'rounded-xl'} ${OPTION_BOX[status]}`}
                style={{
                  minHeight: big
                    ? config.controls.tapTargetMinPx + 16
                    : config.controls.primaryButtonMinHeightPx + 8,
                  fontSize: tpx(config.typography.headingPx),
                }}
              >
                {code}
                {status === 'correct' && (
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-positive text-[18px] text-surface" aria-hidden>
                    ✓
                  </span>
                )}
                {status === 'wrongChosen' && config.feedback.showErrorMark && (
                  <span className="text-[16px] text-calmo" aria-hidden>✕</span>
                )}
              </motion.button>
            </li>
          )
        })}
      </ul>

      {/* Feedback + avance */}
      <div className="flex flex-col gap-3 pt-1">
        {session.retryHint && !session.locked && (
          <FeedbackBanner
            variant="gentle"
            message={config.feedback.errorMessage}
            fontSize={config.typography.baseTextPx - 2}
          />
        )}

        {session.locked &&
          (session.timedOut ? (
            <p className="text-center text-[15px] font-bold text-calmo-strong">
              Tiempo agotado. Era el{' '}
              <span className="text-positive">{round.correctCode}</span>.
            </p>
          ) : big ? (
            <FeedbackBanner
              variant={answeredCorrectly ? 'success' : 'gentle'}
              message={
                answeredCorrectly
                  ? config.feedback.successMessage
                  : config.feedback.errorMessage
              }
              fontSize={config.typography.controlTextPx - 2}
              withCheck={answeredCorrectly}
            />
          ) : (
            <p
              className={`text-center text-[15px] font-bold ${
                answeredCorrectly ? 'text-positive' : 'text-calmo-strong'
              }`}
            >
              {answeredCorrectly
                ? `${config.feedback.successMessage}${config.scoring.enabled ? ` +${config.scoring.pointsPerCorrect} pts${bonusSuffix}` : ''}`
                : `Era el ${round.correctCode}. ${config.feedback.errorMessage}`}
            </p>
          ))}

        {!session.timedOut &&
          (() => {
            const showNext = big
              ? session.locked
              : config.navigation.persistentNext || session.locked
            if (!showNext) return null
            return (
              <PrimaryButton onClick={session.next} disabled={!session.locked}>
                {isLast ? 'Ver resultado' : 'Siguiente'} ›
              </PrimaryButton>
            )
          })()}
      </div>
    </main>
  )
}
