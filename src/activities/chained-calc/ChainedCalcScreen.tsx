import { useCallback, useEffect, useRef, useState } from 'react'
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
import { buildChainedCalcProblems, type ChainedCalcProblem } from './chainedCalcEngine'
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

function ChainDisplay({
  problem,
  config,
  currentStep,
  revealPrevious,
}: {
  problem: ChainedCalcProblem
  config: ReturnType<typeof useModeConfig>
  /** Índice del paso que muestra '?'. */
  currentStep: number
  /** Si true, los pasos anteriores a currentStep muestran su resultado. */
  revealPrevious: boolean
}) {
  return (
    <div className="rounded-3xl border border-border bg-surface px-4 py-6 shadow-card">
      <p
        className="mb-4 text-center font-sans font-bold uppercase tracking-wide text-ink-soft"
        style={{ fontSize: tpx(config.typography.captionPx) }}
      >
        ¿Cuánto da la cadena?
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span
          className="flex h-14 min-w-[3.5rem] items-center justify-center rounded-2xl bg-canvas px-3 font-serif font-bold text-ink-strong"
          style={{ fontSize: tpx(config.typography.headingPx) }}
        >
          {problem.startValue}
        </span>
        {problem.steps.map((step, i) => {
          const isQuestion = i === currentStep
          const isRevealed = revealPrevious && i < currentStep
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="font-serif font-bold text-ink-soft"
                style={{ fontSize: tpx(config.typography.headingPx - 4) }}
              >
                {step.expr}
              </span>
              {isQuestion ? (
                <span
                  className="flex h-14 min-w-[3.5rem] items-center justify-center rounded-2xl bg-agil-soft px-3 font-serif font-bold text-agil-strong"
                  style={{ fontSize: tpx(config.typography.headingPx) }}
                >
                  ?
                </span>
              ) : isRevealed ? (
                <span
                  className="flex h-14 min-w-[3.5rem] items-center justify-center rounded-2xl bg-canvas px-3 font-serif font-bold text-ink-strong"
                  style={{ fontSize: tpx(config.typography.headingPx) }}
                >
                  {step.result}
                </span>
              ) : (
                <span
                  className="flex h-14 min-w-[3rem] items-center justify-center rounded-2xl bg-canvas px-3 font-serif font-bold text-ink-muted"
                  style={{ fontSize: tpx(config.typography.headingPx - 2) }}
                  aria-label="resultado intermedio oculto"
                >
                  ···
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Vista Ráfaga ───────────────────────────────────────────────────────────────

function ChainedCalcRafagaView({ timedConfig, onHome }: { timedConfig: TimedConfig; onHome: () => void }) {
  const config = useModeConfig()
  const reduce = useReducedMotion()
  const cfg = config.activities.chainedCalc

  const session = useRafagaSession<ChainedCalcProblem>({
    buildPool: () => buildChainedCalcProblems(cfg),
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
            cadenas bien en {timedConfig.seconds}s.
          </>
        }
        stats={[
          { label: 'Correctas', value: session.correct, accent: 'sereno' },
          { label: 'Puntaje', value: session.score, accent: 'agil' },
        ]}
        record={{
          activity: 'chainedCalc',
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
  const big = !config.scoring.enabled
  const pct = (session.timeLeft / timedConfig.seconds) * 100

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
        title="Cálculo encadenado"
        right={
          <span className="flex items-center gap-1.5 rounded-full bg-agil-soft px-3 py-1.5 text-[14px] font-bold text-agil-strong">
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

      <ChainDisplay
        problem={problem}
        config={config}
        currentStep={problem.steps.length - 1}
        revealPrevious={cfg.showIntermediateResults}
      />

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

function ChainedCalcLibrePulsoView({ timedConfig, onHome }: { timedConfig: TimedConfig; onHome: () => void }) {
  const config = useModeConfig()
  const reduce = useReducedMotion()
  const cfg = config.activities.chainedCalc

  const session = useChoiceSession<ChainedCalcProblem>({
    build: () => buildChainedCalcProblems(cfg),
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

  // ── Estado de sub-pasos (step-by-step cuando showIntermediateResults = true) ──
  const isStepByStep = cfg.showIntermediateResults
  const [subStep, setSubStep] = useState(0)
  const [subStepLocked, setSubStepLocked] = useState(false)
  const [subStepSelectedIdx, setSubStepSelectedIdx] = useState<number | null>(null)

  useEffect(() => {
    setSubStep(0)
    setSubStepLocked(false)
    setSubStepSelectedIdx(null)
  }, [sessionIndex])

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
            cadenas bien.
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
          activity: 'chainedCalc',
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
  const big = !config.scoring.enabled
  const isLast = session.index >= session.total - 1

  const isPulso = timedConfig.mode === 'pulso'
  const timerSeconds = isPulso ? timedConfig.seconds : config.timing.secondsPerQuestion
  const showTimer = isPulso || (config.timing.timerAllowed && timerSeconds !== null)

  // ── Lógica de sub-pasos ─────────────────────────────────────────────────────
  const isFinalStep = !isStepByStep || subStep >= problem.steps.length - 1
  const isIntermediate = isStepByStep && !isFinalStep
  const stepData = isIntermediate ? problem.stepOptions[subStep] : null
  const currentOptions = stepData ? stepData.options : problem.options
  const currentCorrectIndex = stepData ? stepData.correctIndex : problem.correctIndex

  const isLocked = isIntermediate ? subStepLocked : session.locked

  const statusOf = useCallback(
    (i: number): OptionStatus => {
      if (!isLocked) return 'idle'
      const selIdx = isIntermediate ? subStepSelectedIdx : session.selected
      if (i === currentCorrectIndex) return 'correct'
      if (i === selIdx) return 'wrongChosen'
      return 'dimmed'
    },
    [isLocked, isIntermediate, subStepSelectedIdx, session.selected, currentCorrectIndex],
  )

  const handleSelect = (i: number) => {
    if (isIntermediate) {
      if (subStepLocked) return
      setSubStepLocked(true)
      setSubStepSelectedIdx(i)
      return
    }
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

  const handleNext = () => {
    if (isIntermediate) {
      setSubStep((s) => s + 1)
      setSubStepLocked(false)
      setSubStepSelectedIdx(null)
      return
    }
    session.next()
  }

  const answeredCorrectly =
    !isIntermediate && session.locked && !session.timedOut && session.selected === problem.correctIndex
  const subStepCorrect = isIntermediate && subStepLocked && subStepSelectedIdx === currentCorrectIndex

  const bonusSuffix =
    answeredCorrectly && session.lastBonus ? ` · +${session.lastBonus} bonus` : ''

  const showNextBtn = isIntermediate
    ? subStepLocked
    : big
      ? session.locked
      : config.navigation.persistentNext || session.locked

  return (
    <main className="flex flex-1 flex-col" style={{ minHeight: 0 }}>
      {/* Contenido desplazable */}
      <div
        className="flex flex-1 flex-col overflow-y-auto px-6 pt-8"
        style={{ gap: config.controls.blockGapPx, paddingBottom: 8 }}
      >
        <ScreenHeader
          title="Cálculo encadenado"
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

        {showTimer && timerSeconds !== null && (
          <CountdownTimer
            totalSeconds={timerSeconds}
            questionKey={session.index}
            onExpire={session.timeout}
            paused={isLocked}
          />
        )}

        <ChainDisplay
          problem={problem}
          config={config}
          currentStep={isStepByStep ? subStep : problem.steps.length - 1}
          revealPrevious={isStepByStep}
        />

        <ul
          className={big ? 'flex flex-col' : 'grid grid-cols-2'}
          style={{ gap: big ? config.controls.blockGapPx - 6 : 11 }}
        >
          {currentOptions.map((value, i) => {
            const status = statusOf(i)
            return (
              <li key={i}>
                <motion.button
                  onClick={() => handleSelect(i)}
                  disabled={isLocked}
                  whileTap={reduce || isLocked ? undefined : { scale: 0.98 }}
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
      </div>

      {/* Área de acción fija — siempre visible */}
      <div className="flex flex-col gap-3 px-6 pb-9 pt-2">
        {isIntermediate && subStepLocked && (
          <FeedbackBanner
            variant={subStepCorrect ? 'success' : 'gentle'}
            message={subStepCorrect ? config.feedback.successMessage : config.feedback.errorMessage}
            fontSize={config.typography.controlTextPx - 2}
            withCheck={subStepCorrect}
          />
        )}

        {!isIntermediate && (
          <>
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
          </>
        )}

        {!session.timedOut && showNextBtn && (
          <PrimaryButton onClick={handleNext} disabled={!isLocked}>
            {!isIntermediate && isLast ? 'Ver resultado' : 'Siguiente'} ›
          </PrimaryButton>
        )}
      </div>
    </main>
  )
}

// ── Orchestrator ───────────────────────────────────────────────────────────────

export function ChainedCalcScreen() {
  const config = useModeConfig()
  const { back } = useNav()

  const [timedConfig, setTimedConfig] = useState<TimedConfig | null>(
    config.id === 'calmo' ? { mode: 'libre', seconds: 0 } : null,
  )

  if (!timedConfig) {
    return <GameTimePicker title="Cálculo encadenado" onStart={setTimedConfig} />
  }

  if (timedConfig.mode === 'rafaga') {
    return <ChainedCalcRafagaView timedConfig={timedConfig} onHome={back} />
  }

  return <ChainedCalcLibrePulsoView timedConfig={timedConfig} onHome={back} />
}
