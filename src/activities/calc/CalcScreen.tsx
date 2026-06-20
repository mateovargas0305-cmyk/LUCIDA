import { motion, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { FeedbackBanner } from '../../components/ui/FeedbackBanner'
import { SessionSummary } from '../../components/SessionSummary'
import { useModeConfig } from '../../modes/modeContext'
import { useNav } from '../../navigation/navContext'
import { useChoiceSession } from '../shared/useChoiceSession'
import { tpx } from '../../lib/typography'
import { generateCalcProblem, type CalcProblem } from './calcEngine'

type OptionStatus = 'idle' | 'correct' | 'wrongChosen' | 'dimmed'

const OPTION_BOX: Record<OptionStatus, string> = {
  idle: 'bg-surface border-border text-ink-strong',
  correct: 'bg-positive-soft border-positive text-positive-ink',
  wrongChosen: 'bg-calmo-soft border-calmo text-calmo-strong',
  dimmed: 'bg-surface border-border text-ink-muted',
}

export function CalcScreen() {
  const config = useModeConfig()
  const { back } = useNav()
  const reduce = useReducedMotion()
  const calcCfg = config.activities.calc

  const session = useChoiceSession<CalcProblem>({
    build: () =>
      Array.from({ length: calcCfg.rounds }, () =>
        generateCalcProblem(calcCfg),
      ),
    retryOnError: config.activities.quiz.retryOnError,
    pointsPerCorrect: config.scoring.enabled
      ? config.scoring.pointsPerCorrect
      : 0,
  })

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
        onHome={back}
      />
    )
  }

  const problem = session.current
  const big = calcCfg.optionCount <= 3 // Calmo: pocas opciones, grandes
  const isLast = session.index >= session.total - 1
  const exprFont = Math.round(config.typography.headingPx * 1.8)
  const answeredCorrectly =
    session.locked && session.selected === problem.correctIndex

  const statusOf = (i: number): OptionStatus => {
    if (!session.locked) return 'idle'
    if (i === problem.correctIndex) return 'correct'
    if (i === session.selected) return 'wrongChosen'
    return 'dimmed'
  }

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-9 pt-12"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <ScreenHeader
        title="Cálculo"
        right={
          config.scoring.enabled ? (
            <span className="flex items-center gap-2 rounded-pill bg-agil-soft px-3 py-1.5 text-[14px] font-bold text-agil-strong">
              <span className="h-2 w-2 rotate-45 rounded-[2px] bg-agil" aria-hidden />
              {session.score}
            </span>
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

      {/* Operación */}
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

      {/* Opciones */}
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
          (big ? (
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
                      ? ` +${config.scoring.pointsPerCorrect} puntos`
                      : ''
                  }`
                : `Era ${problem.answer}. ${config.feedback.errorMessage}`}
            </p>
          ))}

        {(() => {
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
