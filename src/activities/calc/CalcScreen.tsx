import { useEffect, useRef, useState } from 'react'
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
import { generateCalcProblems, type CalcProblem } from './calcEngine'
import { GameTimePicker } from '../shared/GameTimePicker'
import { useRafagaSession } from '../shared/useRafagaSession'
import type { TimedConfig } from '../shared/timedConfig'

type OptionStatus = 'idle' | 'correct' | 'wrongChosen' | 'dimmed'

const OPTION_BOX: Record<OptionStatus, string> = {
  idle: 'bg-surface border-border text-ink-strong',
  correct: 'bg-positive-soft border-positive text-positive-ink',
  wrongChosen: 'bg-calmo-soft border-calmo text-calmo-strong',
  dimmed: 'bg-surface border-border text-ink-muted',
}

// ── Vista Ráfaga ───────────────────────────────────────────────────────────────

function CalcRafagaView({ timedConfig, onHome }: { timedConfig: TimedConfig; onHome: () => void }) {
  const config = useModeConfig()
  const reduce = useReducedMotion()
  const calcCfg = config.activities.calc

  const session = useRafagaSession<CalcProblem>({
    buildPool: () => generateCalcProblems(calcCfg),
    totalSeconds: timedConfig.seconds,
    lockMs: 600,
    pointsPerCorrect: config.scoring.enabled ? config.scoring.pointsPerCorrect : 1,
  })

  if (session.finished) {
    return (
      <SessionSummary
        headline="¡Tiempo!"
        subline={
          <>
            Resolviste{' '}
            <strong>
              {session.correct} de {session.total}
            </strong>{' '}
            bien en {timedConfig.seconds}s.
          </>
        }
        stats={[
          { label: 'Correctas', value: session.correct, accent: 'sereno' },
          { label: 'Puntaje', value: session.score, accent: 'agil' },
        ]}
        record={{
          activity: 'calc',
          mode: config.id,
          correct: session.correct,
          total: session.total,
          score: session.score,
        }}
        onAgain={session.restart}
        onHome={onHome}
      />
    )
  }

  const problem = session.round
  const big = calcCfg.optionCount <= 3
  const pct = (session.timeLeft / timedConfig.seconds) * 100
  const exprFont = Math.round(config.typography.headingPx * 1.8)

  const statusOf = (i: number): OptionStatus => {
    if (!session.locked) return 'idle'
    if (i === problem.correctIndex) return 'correct'
    if (i === session.selectedIndex) return 'wrongChosen'
    return 'dimmed'
  }

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-9 pt-8"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <ScreenHeader
        title="Cálculo"
        right={
          <span className="flex items-center gap-2 rounded-pill bg-agil-soft px-3 py-1.5 text-[14px] font-bold text-agil-strong">
            <span className="h-2 w-2 rotate-45 rounded-[2px] bg-agil" aria-hidden />
            {session.score}
          </span>
        }
      />

      <div className="h-2.5 overflow-hidden rounded-pill bg-border" aria-hidden>
        <motion.div
          className={`h-full rounded-pill transition-colors ${pct <= 33 ? 'bg-calmo' : 'bg-agil'}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'linear' }}
        />
      </div>

      <div className="rounded-3xl border border-border bg-surface px-5 py-8 text-center shadow-card">
        <div
          className="font-sans font-bold uppercase tracking-wide text-ink-soft"
          style={{ fontSize: tpx(config.typography.captionPx) }}
        >
          ¿Cuánto es?
        </div>
        <div
          className="mt-2 font-serif font-bold leading-none text-ink-strong"
          style={{ fontSize: tpx(exprFont) }}
          aria-label={problem.prompt}
        >
          {problem.prompt}
        </div>
      </div>

      <ul
        className={big ? 'flex flex-col' : 'grid grid-cols-2'}
        style={{ gap: big ? config.controls.blockGapPx - 6 : 11 }}
      >
        {problem.options.map((value, i) => {
          const status = statusOf(i)
          return (
            <li key={i}>
              <motion.button
                onClick={() => session.select(i)}
                disabled={session.locked}
                whileTap={reduce || session.locked ? undefined : { scale: 0.98 }}
                className={`flex w-full items-center justify-center gap-3 border-2 font-serif font-bold transition-colors ${OPTION_BOX[status]} ${
                  big ? 'rounded-2xl' : 'rounded-xl'
                }`}
                style={{
                  minHeight: big
                    ? config.controls.tapTargetMinPx + 12
                    : config.controls.primaryButtonMinHeightPx + 10,
                  fontSize: big
                    ? tpx(config.typography.headingPx)
                    : tpx(config.typography.headingPx - 2),
                }}
              >
                <span>{value}</span>
                {status === 'correct' && (
                  <span
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-positive text-[20px] text-surface"
                    aria-hidden
                  >
                    ✓
                  </span>
                )}
              </motion.button>
            </li>
          )
        })}
      </ul>

      {session.locked && (
        <p
          className={`mt-auto text-center text-[15px] font-bold ${
            session.lastCorrect ? 'text-positive' : 'text-calmo-strong'
          }`}
        >
          {session.lastCorrect
            ? config.feedback.successMessage
            : `Era ${problem.answer}. ${config.feedback.errorMessage}`}
        </p>
      )}
    </main>
  )
}

// ── Vista Libre / Pulso ────────────────────────────────────────────────────────

function CalcLibrePulsoView({ timedConfig, onHome }: { timedConfig: TimedConfig; onHome: () => void }) {
  const config = useModeConfig()
  const reduce = useReducedMotion()
  const calcCfg = config.activities.calc

  const session = useChoiceSession<CalcProblem>({
    build: () => generateCalcProblems(calcCfg),
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
        headline="¡Gran sesión!"
        subline={
          <>
            Resolviste{' '}
            <strong>
              {session.correctCount} de {session.total}
            </strong>{' '}
            bien.
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
          activity: 'calc',
          mode: config.id,
          correct: session.correctCount,
          total: session.total,
          score: session.score,
        }}
        onAgain={session.restart}
        onHome={onHome}
      />
    )
  }

  const problem = session.current
  const big = calcCfg.optionCount <= 3
  const isLast = session.index >= session.total - 1
  const exprFont = Math.round(config.typography.headingPx * 1.8)

  const isPulso = timedConfig.mode === 'pulso'
  const timerSeconds = isPulso ? timedConfig.seconds : config.timing.secondsPerQuestion
  const showTimer = isPulso || (config.timing.timerAllowed && timerSeconds !== null)

  const answeredCorrectly =
    session.locked && !session.timedOut && session.selected === problem.correctIndex

  const statusOf = (i: number): OptionStatus => {
    if (!session.locked) return 'idle'
    if (i === problem.correctIndex) return 'correct'
    if (i === session.selected) return 'wrongChosen'
    return 'dimmed'
  }

  const handleSelect = (i: number) => {
    const elapsed = Date.now() - questionStartRef.current
    const secs = isPulso ? timedConfig.seconds : config.timing.secondsPerQuestion
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
      className="flex flex-1 flex-col px-6 pb-9 pt-8"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <ScreenHeader
        title="Cálculo"
        right={
          config.scoring.enabled ? (
            <div className="flex items-center gap-2">
              {session.currentStreak >= 3 && (
                <span className="rounded-pill bg-agil px-2.5 py-1 text-[12px] font-bold text-surface">
                  Racha {session.currentStreak}
                </span>
              )}
              <span className="flex items-center gap-2 rounded-pill bg-agil-soft px-3 py-1.5 text-[14px] font-bold text-agil-strong">
                <span className="h-2 w-2 rotate-45 rounded-[2px] bg-agil" aria-hidden />
                {session.score}
              </span>
            </div>
          ) : undefined
        }
      />

      {config.scoring.showProgressBar && (
        <div className="flex items-center gap-3" aria-hidden>
          <div className="h-2.5 flex-1 overflow-hidden rounded-pill bg-border">
            <div
              className="h-full rounded-pill bg-agil transition-[width] duration-300"
              style={{ width: `${((session.index + 1) / session.total) * 100}%` }}
            />
          </div>
          <span className="text-[13px] font-bold text-ink-muted">
            {session.index + 1}/{session.total}
          </span>
        </div>
      )}

      {showTimer && timerSeconds !== null && (
        <CountdownTimer
          totalSeconds={timerSeconds}
          questionKey={session.index}
          onExpire={session.timeout}
          paused={session.locked}
        />
      )}

      <div className="rounded-3xl border border-border bg-surface px-5 py-8 text-center shadow-card">
        <div
          className="font-sans font-bold uppercase tracking-wide text-ink-soft"
          style={{ fontSize: tpx(config.typography.captionPx) }}
        >
          ¿Cuánto es?
        </div>
        <div
          className="mt-2 font-serif font-bold leading-none text-ink-strong"
          style={{ fontSize: tpx(exprFont) }}
          aria-label={problem.prompt}
        >
          {problem.prompt}
        </div>
      </div>

      <ul
        className={big ? 'flex flex-col' : 'grid grid-cols-2'}
        style={{ gap: big ? config.controls.blockGapPx - 6 : 11 }}
      >
        {problem.options.map((value, i) => {
          const status = statusOf(i)
          return (
            <li key={i}>
              <motion.button
                onClick={() => handleSelect(i)}
                disabled={session.locked}
                whileTap={reduce || session.locked ? undefined : { scale: 0.98 }}
                className={`flex w-full items-center justify-center gap-3 border-2 font-serif font-bold transition-colors ${OPTION_BOX[status]} ${
                  big ? 'rounded-2xl' : 'rounded-xl'
                }`}
                style={{
                  minHeight: big
                    ? config.controls.tapTargetMinPx + 12
                    : config.controls.primaryButtonMinHeightPx + 10,
                  fontSize: big
                    ? tpx(config.typography.headingPx)
                    : tpx(config.typography.headingPx - 2),
                }}
              >
                <span>{value}</span>
                {status === 'correct' && (
                  <span
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-positive text-[20px] text-surface"
                    aria-hidden
                  >
                    ✓
                  </span>
                )}
                {status === 'wrongChosen' && config.feedback.showErrorMark && (
                  <span className="flex-none text-[18px] text-calmo" aria-hidden>
                    ✕
                  </span>
                )}
              </motion.button>
            </li>
          )
        })}
      </ul>

      <div className="mt-auto flex flex-col gap-3 pt-2">
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
              Tiempo agotado. La respuesta era{' '}
              <span className="text-positive">{problem.answer}</span>.
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
                ? `${config.feedback.successMessage}${
                    config.scoring.enabled
                      ? ` +${config.scoring.pointsPerCorrect} pts${bonusSuffix}`
                      : ''
                  }`
                : `Era ${problem.answer}. ${config.feedback.errorMessage}`}
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

// ── Orchestrator ───────────────────────────────────────────────────────────────

export function CalcScreen() {
  const config = useModeConfig()
  const { back } = useNav()

  const [timedConfig, setTimedConfig] = useState<TimedConfig | null>(
    config.id === 'calmo' ? { mode: 'libre', seconds: 0 } : null,
  )

  if (!timedConfig) {
    return <GameTimePicker title="Cálculo" onStart={setTimedConfig} />
  }

  if (timedConfig.mode === 'rafaga') {
    return <CalcRafagaView timedConfig={timedConfig} onHome={back} />
  }

  return <CalcLibrePulsoView timedConfig={timedConfig} onHome={back} />
}
