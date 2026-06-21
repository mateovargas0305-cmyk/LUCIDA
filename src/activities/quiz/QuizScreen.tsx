import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { FeedbackBanner } from '../../components/ui/FeedbackBanner'
import { CountdownTimer } from '../../components/ui/CountdownTimer'
import { SessionSummary } from '../../components/SessionSummary'
import { useModeConfig } from '../../modes/modeContext'
import { usePreferences } from '../../preferences/preferencesContext'
import { useNav } from '../../navigation/navContext'
import { CATEGORY_LABEL } from '../../data/quiz'
import { canSpeak, speak } from '../../lib/speech'
import { tpx } from '../../lib/typography'
import { useQuizSession } from './useQuizSession'
import { buildQuizPool, OPTION_LETTERS, type PreparedQuestion } from './quizEngine'
import { GameTimePicker } from '../shared/GameTimePicker'
import { useRafagaSession } from '../shared/useRafagaSession'
import type { TimedConfig } from '../shared/timedConfig'

type OptionStatus = 'idle' | 'correct' | 'wrongChosen' | 'dimmed'

const OPTION_BOX: Record<OptionStatus, string> = {
  idle: 'bg-surface border-border text-ink',
  correct: 'bg-positive-soft border-positive text-positive-ink',
  wrongChosen: 'bg-calmo-soft border-calmo text-calmo-strong',
  dimmed: 'bg-surface border-border text-ink-muted',
}

const LETTER_CHIP: Record<OptionStatus, string> = {
  idle: 'bg-canvas text-ink-muted',
  correct: 'bg-positive text-surface',
  wrongChosen: 'bg-calmo text-surface',
  dimmed: 'bg-canvas text-ink-muted',
}

// ── Vista Ráfaga ───────────────────────────────────────────────────────────────

function QuizRafagaView({ timedConfig, onHome }: { timedConfig: TimedConfig; onHome: () => void }) {
  const config = useModeConfig()
  const reduce = useReducedMotion()
  const quizCfg = config.activities.quiz

  const session = useRafagaSession<PreparedQuestion>({
    buildPool: () => buildQuizPool(quizCfg),
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
            Respondiste{' '}
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
          activity: 'quiz',
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

  const q = session.round
  const lettered = quizCfg.letteredOptions
  const pct = (session.timeLeft / timedConfig.seconds) * 100

  const statusOf = (i: number): OptionStatus => {
    if (!session.locked) return 'idle'
    if (i === q.correctIndex) return 'correct'
    if (i === session.selectedIndex) return 'wrongChosen'
    return 'dimmed'
  }

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-9 pt-8"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <ScreenHeader
        title="Cultura general"
        right={
          <span className="flex items-center gap-2 rounded-pill bg-agil-soft px-3 py-1.5 text-[14px] font-bold text-agil-strong">
            <span className="h-2 w-2 rotate-45 rounded-[2px] bg-agil" aria-hidden />
            {session.score}
          </span>
        }
      />

      {/* Barra de tiempo total */}
      <div className="h-2.5 overflow-hidden rounded-pill bg-border" aria-hidden>
        <motion.div
          className={`h-full rounded-pill transition-colors ${pct <= 33 ? 'bg-calmo' : 'bg-agil'}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'linear' }}
        />
      </div>

      {/* Enunciado */}
      {lettered ? (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
          {quizCfg.showCategoryTag && (
            <span className="rounded-pill bg-sereno-soft px-2.5 py-1 text-[11px] font-bold text-sereno-strong">
              {CATEGORY_LABEL[q.category]}
            </span>
          )}
          <p
            className="mt-3 font-serif font-semibold leading-snug text-ink-strong"
            style={{ fontSize: tpx(config.typography.headingPx) }}
          >
            {q.prompt}
          </p>
        </div>
      ) : (
        <h1
          className="font-serif font-semibold leading-snug text-ink-strong"
          style={{ fontSize: tpx(config.typography.headingPx) }}
        >
          {q.prompt}
        </h1>
      )}

      {/* Opciones */}
      <ul
        className="flex flex-col"
        style={{ rowGap: lettered ? 10 : config.controls.blockGapPx - 6 }}
      >
        {q.options.map((text, i) => {
          const status = statusOf(i)
          return (
            <li key={i}>
              <motion.button
                onClick={() => session.select(i)}
                disabled={session.locked}
                whileTap={reduce || session.locked ? undefined : { scale: 0.99 }}
                aria-label={text}
                className={`flex w-full items-center border-2 text-left font-bold transition-colors ${OPTION_BOX[status]} ${
                  lettered ? 'gap-3 rounded-xl p-3.5' : 'justify-center gap-4 rounded-2xl'
                }`}
                style={{
                  fontSize: tpx(config.typography.controlTextPx),
                  minHeight: lettered ? undefined : config.controls.tapTargetMinPx + 12,
                  padding: lettered ? undefined : '14px 20px',
                }}
              >
                {lettered && (
                  <span
                    className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg text-[14px] ${LETTER_CHIP[status]}`}
                  >
                    {OPTION_LETTERS[i]}
                  </span>
                )}
                <span className={lettered ? 'flex-1' : undefined}>{text}</span>
                {status === 'correct' && (
                  <span className="flex-none text-positive" aria-hidden>
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
          {session.lastCorrect ? config.feedback.successMessage : config.feedback.errorMessage}
        </p>
      )}
    </main>
  )
}

// ── Vista Libre / Pulso ────────────────────────────────────────────────────────

function QuizLibrePulsoView({ timedConfig, onHome }: { timedConfig: TimedConfig; onHome: () => void }) {
  const config = useModeConfig()
  const { soundEnabled } = usePreferences()
  const reduce = useReducedMotion()
  const session = useQuizSession(config)
  const quizCfg = config.activities.quiz

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
            Acertaste{' '}
            <strong>
              {session.correctCount} de {session.total}
            </strong>{' '}
            preguntas.
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
          activity: 'quiz',
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

  const q = session.current
  const lettered = quizCfg.letteredOptions
  const isLast = session.index >= session.total - 1

  const isPulso = timedConfig.mode === 'pulso'
  const timerSeconds = isPulso ? timedConfig.seconds : config.timing.secondsPerQuestion
  const showTimer =
    timedConfig.mode !== 'libre' &&
    (isPulso || (config.timing.timerAllowed && timerSeconds !== null))

  const statusOf = (i: number): OptionStatus => {
    if (!session.locked) return 'idle'
    if (i === q.correctIndex) return 'correct'
    if (i === session.selected) return 'wrongChosen'
    return 'dimmed'
  }

  const answeredCorrectly =
    session.locked && !session.timedOut && session.selected === q.correctIndex

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
        title="Cultura general"
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

      {lettered ? (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
          {quizCfg.showCategoryTag && (
            <span className="rounded-pill bg-sereno-soft px-2.5 py-1 text-[11px] font-bold text-sereno-strong">
              {CATEGORY_LABEL[q.category]}
            </span>
          )}
          <p
            className="mt-3 font-serif font-semibold leading-snug text-ink-strong"
            style={{ fontSize: tpx(config.typography.headingPx) }}
          >
            {q.prompt}
          </p>
        </div>
      ) : (
        <div>
          <h1
            className="font-serif font-semibold leading-snug text-ink-strong"
            style={{ fontSize: tpx(config.typography.headingPx) }}
          >
            {q.prompt}
          </h1>
          {quizCfg.showVoiceButton && soundEnabled && canSpeak() && (
            <button
              onClick={() => speak(q.prompt)}
              className="mt-4 flex items-center gap-3 font-sans font-bold text-ink-soft"
              style={{ fontSize: tpx(config.typography.captionPx + 1) }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-border text-ink">
                ▶
              </span>
              Escuchar la pregunta
            </button>
          )}
        </div>
      )}

      <ul
        className="flex flex-col"
        style={{ rowGap: lettered ? 10 : config.controls.blockGapPx - 6 }}
      >
        {q.options.map((text, i) => {
          const status = statusOf(i)
          return (
            <li key={i}>
              <motion.button
                onClick={() => handleSelect(i)}
                disabled={session.locked}
                whileTap={reduce || session.locked ? undefined : { scale: 0.99 }}
                aria-label={text}
                className={`flex w-full items-center border-2 text-left font-bold transition-colors ${OPTION_BOX[status]} ${
                  lettered ? 'gap-3 rounded-xl p-3.5' : 'justify-center gap-4 rounded-2xl'
                }`}
                style={{
                  fontSize: tpx(config.typography.controlTextPx),
                  minHeight: lettered ? undefined : config.controls.tapTargetMinPx + 12,
                  padding: lettered ? undefined : '14px 20px',
                }}
              >
                {lettered && (
                  <span
                    className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg text-[14px] ${LETTER_CHIP[status]}`}
                  >
                    {OPTION_LETTERS[i]}
                  </span>
                )}
                <span className={lettered ? 'flex-1' : undefined}>{text}</span>
                {status === 'correct' && (
                  <span className="flex-none text-positive" aria-hidden>
                    ✓
                  </span>
                )}
                {status === 'wrongChosen' && config.feedback.showErrorMark && (
                  <span className="flex-none text-calmo" aria-hidden>
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
              Tiempo agotado. La respuesta era la{' '}
              <span className="text-positive">marcada en verde</span>.
            </p>
          ) : lettered ? (
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
                : config.feedback.errorMessage}
            </p>
          ) : (
            <FeedbackBanner
              variant="success"
              message={config.feedback.successMessage}
              fontSize={config.typography.controlTextPx - 2}
              withCheck
            />
          ))}

        {!session.timedOut &&
          (() => {
            const showNext = lettered
              ? config.navigation.persistentNext || session.locked
              : session.locked
            if (!showNext) return null
            return (
              <PrimaryButton onClick={session.next} disabled={!session.locked}>
                {isLast ? 'Ver resultado' : lettered ? 'Siguiente' : 'Continuar'} ›
              </PrimaryButton>
            )
          })()}
      </div>
    </main>
  )
}

// ── Orchestrator ───────────────────────────────────────────────────────────────

export function QuizScreen() {
  const config = useModeConfig()
  const { back } = useNav()

  const [timedConfig, setTimedConfig] = useState<TimedConfig | null>(
    config.id === 'calmo' ? { mode: 'libre', seconds: 0 } : null,
  )

  if (!timedConfig) {
    return <GameTimePicker title="Cultura general" onStart={setTimedConfig} />
  }

  if (timedConfig.mode === 'rafaga') {
    return <QuizRafagaView timedConfig={timedConfig} onHome={back} />
  }

  return <QuizLibrePulsoView timedConfig={timedConfig} onHome={back} />
}
