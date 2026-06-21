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
import {
  buildStroopTrials,
  COLOR_NAME,
  COLOR_TEXT_CLASS,
  COLOR_BUTTON_CLASS,
  type StroopTrial,
  type StroopColorSlot,
} from './stroopEngine'
import { GameTimePicker } from '../shared/GameTimePicker'
import { useRafagaSession } from '../shared/useRafagaSession'
import type { TimedConfig } from '../shared/timedConfig'

type OptionStatus = 'idle' | 'correct' | 'wrongChosen' | 'dimmed'

// ── Vista Ráfaga ───────────────────────────────────────────────────────────────

function StroopRafagaView({ timedConfig, onHome }: { timedConfig: TimedConfig; onHome: () => void }) {
  const config = useModeConfig()
  const reduce = useReducedMotion()
  const stroopCfg = config.activities.stroop

  const session = useRafagaSession<StroopTrial>({
    buildPool: () => buildStroopTrials(stroopCfg),
    totalSeconds: timedConfig.seconds,
    lockMs: 500,
    pointsPerCorrect: config.scoring.enabled ? config.scoring.pointsPerCorrect : 1,
  })

  if (session.finished) {
    return (
      <SessionSummary
        headline="¡Tiempo!"
        subline={
          <>
            Acertaste{' '}
            <strong>
              {session.correct} de {session.total}
            </strong>{' '}
            en {timedConfig.seconds}s.
          </>
        }
        stats={[
          { label: 'Correctas', value: session.correct, accent: 'sereno' },
          { label: 'Puntaje', value: session.score, accent: 'agil' },
        ]}
        record={{
          activity: 'stroop',
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

  const trial = session.round
  const pct = (session.timeLeft / timedConfig.seconds) * 100

  const statusOf = (i: number): OptionStatus => {
    if (!session.locked) return 'idle'
    if (i === trial.correctIndex) return 'correct'
    if (i === session.selectedIndex) return 'wrongChosen'
    return 'dimmed'
  }

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-9 pt-8"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <ScreenHeader
        title="Stroop"
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

      <p className="text-center text-[14px] font-bold text-ink-soft">
        ¿De qué color está escrita la palabra?
      </p>

      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <span
          className={`select-none font-serif font-bold leading-none ${COLOR_TEXT_CLASS[trial.inkSlot]}`}
          style={{ fontSize: 'clamp(2rem, 10vw, 4.5rem)', whiteSpace: 'nowrap' }}
          aria-label={`La palabra "${COLOR_NAME[trial.wordSlot]}" escrita en color ${COLOR_NAME[trial.inkSlot]}`}
        >
          {COLOR_NAME[trial.wordSlot].toUpperCase()}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-3">
        {trial.optionSlots.map((colorSlot: StroopColorSlot, i) => {
          const status = statusOf(i)
          const isCorrect = status === 'correct'
          const isWrong = status === 'wrongChosen'
          const baseClass = stroopCfg.coloredOptionButtons
            ? COLOR_BUTTON_CLASS[colorSlot]
            : 'bg-surface border-border text-ink-strong'
          const stateOverride = isCorrect
            ? 'bg-positive-soft border-positive text-positive-ink'
            : isWrong
              ? 'bg-game-1 border-game-1-strong text-game-1-ink'
              : status === 'dimmed'
                ? 'opacity-50'
                : ''
          return (
            <li key={colorSlot}>
              <motion.button
                onClick={() => session.select(i)}
                disabled={session.locked}
                whileTap={reduce || session.locked ? undefined : { scale: 0.97 }}
                className={`flex w-full items-center justify-center gap-3 rounded-xl border-2 font-serif font-semibold transition-colors ${baseClass} ${stateOverride}`}
                style={{
                  minHeight: config.controls.primaryButtonMinHeightPx,
                  fontSize: tpx(config.typography.controlTextPx - 2),
                }}
              >
                {COLOR_NAME[colorSlot]}
                {isCorrect && (
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-positive text-[18px] text-surface" aria-hidden>
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
          className={`text-center text-[15px] font-bold ${
            session.lastCorrect ? 'text-positive' : 'text-game-1-strong'
          }`}
        >
          {session.lastCorrect
            ? config.feedback.successMessage
            : `Era ${COLOR_NAME[trial.inkSlot]}. ${config.feedback.errorMessage}`}
        </p>
      )}
    </main>
  )
}

// ── Vista Libre / Pulso ────────────────────────────────────────────────────────

function StroopLibrePulsoView({ timedConfig, onHome }: { timedConfig: TimedConfig; onHome: () => void }) {
  const config = useModeConfig()
  const reduce = useReducedMotion()
  const stroopCfg = config.activities.stroop

  const session = useChoiceSession<StroopTrial>({
    build: () => buildStroopTrials(stroopCfg),
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
        headline="¡Bien hecho!"
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
          activity: 'stroop',
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

  const trial = session.current
  const big = !config.scoring.enabled
  const isLast = session.index >= session.total - 1

  const isPulso = timedConfig.mode === 'pulso'
  const timerSeconds = isPulso ? timedConfig.seconds : config.timing.secondsPerQuestion
  const showTimer = isPulso || (config.timing.timerAllowed && timerSeconds !== null)

  const answeredCorrectly =
    session.locked && !session.timedOut && session.selected === trial.correctIndex

  const statusOf = (i: number): OptionStatus => {
    if (!session.locked) return 'idle'
    if (i === trial.correctIndex) return 'correct'
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
      {big ? (
        <div>
          <h1
            className="font-serif font-semibold leading-snug text-ink-strong"
            style={{ fontSize: tpx(config.typography.headingPx) }}
          >
            ¿De qué color está escrita?
          </h1>
          <p
            className="mt-2 leading-relaxed text-ink-soft"
            style={{ fontSize: tpx(config.typography.baseTextPx) }}
          >
            Tocá el color de la tinta, no el de la palabra.
          </p>
        </div>
      ) : (
        <>
          <ScreenHeader
            title="Stroop"
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

      {showTimer && timerSeconds !== null && (
        <CountdownTimer
          totalSeconds={timerSeconds}
          questionKey={session.index}
          onExpire={session.timeout}
          paused={session.locked}
        />
      )}

      {!big && (
        <p className="text-center text-[14px] font-bold text-ink-soft">
          ¿De qué color está escrita la palabra?
        </p>
      )}

      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <span
          className={`select-none font-serif font-bold leading-none ${COLOR_TEXT_CLASS[trial.inkSlot]}`}
          style={{ fontSize: 'clamp(2rem, 10vw, 4.5rem)', whiteSpace: 'nowrap' }}
          aria-label={`La palabra "${COLOR_NAME[trial.wordSlot]}" escrita en color ${COLOR_NAME[trial.inkSlot]}`}
        >
          {COLOR_NAME[trial.wordSlot].toUpperCase()}
        </span>
      </div>

      <ul className={big ? 'flex flex-col gap-4' : 'grid grid-cols-2 gap-3'}>
        {trial.optionSlots.map((colorSlot: StroopColorSlot, i) => {
          const status = statusOf(i)
          const isCorrect = status === 'correct'
          const isWrong = status === 'wrongChosen'
          const baseClass = stroopCfg.coloredOptionButtons
            ? COLOR_BUTTON_CLASS[colorSlot]
            : 'bg-surface border-border text-ink-strong'
          const stateOverride = isCorrect
            ? 'bg-positive-soft border-positive text-positive-ink'
            : isWrong
              ? 'bg-game-1 border-game-1-strong text-game-1-ink'
              : status === 'dimmed'
                ? 'opacity-50'
                : ''

          return (
            <li key={colorSlot}>
              <motion.button
                onClick={() => handleSelect(i)}
                disabled={session.locked}
                whileTap={reduce || session.locked ? undefined : { scale: 0.97 }}
                className={`flex w-full items-center justify-center gap-3 border-2 font-serif font-semibold transition-colors ${big ? 'rounded-2xl' : 'rounded-xl'} ${baseClass} ${stateOverride}`}
                style={{
                  minHeight: big
                    ? config.controls.tapTargetMinPx + 16
                    : config.controls.primaryButtonMinHeightPx,
                  fontSize: tpx(
                    big ? config.typography.controlTextPx : config.typography.controlTextPx - 2,
                  ),
                }}
              >
                {COLOR_NAME[colorSlot]}
                {isCorrect && (
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-positive text-[18px] text-surface" aria-hidden>
                    ✓
                  </span>
                )}
              </motion.button>
            </li>
          )
        })}
      </ul>

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
            <p className="text-center text-[15px] font-bold text-game-1-strong">
              Tiempo agotado. Era{' '}
              <span className="text-positive">{COLOR_NAME[trial.inkSlot]}</span>.
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
                answeredCorrectly ? 'text-positive' : 'text-game-1-strong'
              }`}
            >
              {answeredCorrectly
                ? `${config.feedback.successMessage}${config.scoring.enabled ? ` +${config.scoring.pointsPerCorrect} pts${bonusSuffix}` : ''}`
                : `Era ${COLOR_NAME[trial.inkSlot]}. ${config.feedback.errorMessage}`}
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

export function StroopScreen() {
  const config = useModeConfig()
  const { back } = useNav()

  const [timedConfig, setTimedConfig] = useState<TimedConfig | null>(
    config.id === 'calmo' ? { mode: 'libre', seconds: 0 } : null,
  )

  if (!timedConfig) {
    return <GameTimePicker title="Stroop" onStart={setTimedConfig} />
  }

  if (timedConfig.mode === 'rafaga') {
    return <StroopRafagaView timedConfig={timedConfig} onHome={back} />
  }

  return <StroopLibrePulsoView timedConfig={timedConfig} onHome={back} />
}
