import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { FeedbackBanner } from '../../components/ui/FeedbackBanner'
import { CountdownTimer } from '../../components/ui/CountdownTimer'
import { SessionSummary } from '../../components/SessionSummary'
import { useModeConfig } from '../../modes/modeContext'
import { useNav } from '../../navigation/navContext'
import { ACCENT } from '../../lib/accent'
import { tpx } from '../../lib/typography'
import { useChoiceSession } from '../shared/useChoiceSession'
import { buildAttentionRounds, type AttentionRound } from './attentionEngine'

/** Color y forma de cada elemento según el tipo de diferencia del modo. */
function itemVisual(
  round: AttentionRound,
  index: number,
  accentBg: string,
): { bg: string; radius: string } {
  const isTarget = index === round.correctIndex
  if (round.differBy === 'color') {
    return {
      bg: isTarget ? 'bg-calmo' : 'bg-sereno',
      radius: '50%',
    }
  }
  const radius = isTarget ? (round.subtle ? '34%' : '20%') : '50%'
  return { bg: accentBg, radius }
}

export function AttentionScreen() {
  const config = useModeConfig()
  const { back } = useNav()
  const reduce = useReducedMotion()
  const attCfg = config.activities.attention
  const accent = ACCENT[config.accent]

  const session = useChoiceSession<AttentionRound>({
    build: () => buildAttentionRounds(attCfg),
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
        headline="¡Buen ojo!"
        subline={
          <>
            Encontraste{' '}
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
          activity: 'attention',
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
  const big = !config.scoring.enabled
  const isLast = session.index >= session.total - 1
  const showTimer =
    config.timing.timerAllowed && config.timing.secondsPerQuestion !== null
  const answeredCorrectly =
    session.locked && !session.timedOut && session.selected === round.correctIndex

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
        <h1
          className="font-serif font-semibold leading-snug text-ink-strong"
          style={{ fontSize: tpx(config.typography.headingPx) }}
        >
          Tocá el {round.differBy === 'color' ? 'color' : 'distinto'} diferente
        </h1>
      ) : (
        <>
          <ScreenHeader
            title="Atención"
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
          <h2 className="text-center font-serif text-[21px] font-semibold text-ink-strong">
            ¿Cuál es diferente?
          </h2>
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

      <ul
        className="grid flex-1 content-center justify-items-center"
        style={{
          gridTemplateColumns: `repeat(${attCfg.columns}, minmax(0, 1fr))`,
          gap: big ? 20 : 13,
        }}
      >
        {Array.from({ length: round.size }, (_, i) => {
          const v = itemVisual(round, i, accent.solidBg)
          const chosenWrong =
            session.locked && session.selected === i && i !== round.correctIndex
          const showCorrect =
            session.locked && i === round.correctIndex
          const ring = showCorrect
            ? 'ring-4 ring-positive'
            : chosenWrong
              ? 'ring-4 ring-gentle'
              : 'ring-0'
          return (
            <li key={i} className="w-full">
              <motion.button
                onClick={() => handleSelect(i)}
                disabled={session.locked}
                whileTap={reduce || session.locked ? undefined : { scale: 0.93 }}
                aria-label={i === round.correctIndex ? 'Elemento diferente' : 'Elemento'}
                className={`${v.bg} ${ring} shadow-card transition-shadow`}
                style={{
                  borderRadius: v.radius,
                  width: big ? '100%' : 54,
                  height: big ? undefined : 54,
                  aspectRatio: big ? '1 / 1' : undefined,
                }}
              />
            </li>
          )
        })}
      </ul>

      {/* Feedback + avance */}
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
              Tiempo agotado. El diferente{' '}
              <span className="text-positive">quedó marcado en verde</span>.
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
                : config.feedback.errorMessage}
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
