import { motion, useReducedMotion } from 'framer-motion'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { FeedbackBanner } from '../../components/ui/FeedbackBanner'
import { SessionSummary } from '../../components/SessionSummary'
import type { ModeConfig } from '../../modes/types'
import { useNav } from '../../navigation/navContext'
import { tpx } from '../../lib/typography'
import { useChoiceSession } from '../shared/useChoiceSession'
import { buildAttentionRounds, shapeStyles, type AttentionRound } from './attentionEngine'

interface Props {
  config: ModeConfig
}

/** Vista clásica de rondas: N turnos, sin presión de tiempo. Usada por Calmo. */
export function AttentionRoundsView({ config }: Props) {
  const { back } = useNav()
  const reduce = useReducedMotion()
  const attCfg = config.activities.attention

  const session = useChoiceSession<AttentionRound>({
    build: () => buildAttentionRounds(attCfg),
    retryOnError: config.activities.quiz.retryOnError,
    pointsPerCorrect: config.scoring.enabled ? config.scoring.pointsPerCorrect : 0,
    streakBonusEnabled: config.scoring.streakBonusEnabled,
    streakBonusThreshold: config.scoring.streakBonusThreshold,
    streakBonusPoints: config.scoring.streakBonusPoints,
  })

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
  const answeredCorrectly =
    session.locked && !session.timedOut && session.selected === round.correctIndex

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-9 pt-12"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <h1
        className="font-serif font-semibold leading-snug text-ink-strong"
        style={{ fontSize: tpx(config.typography.headingPx) }}
      >
        Tocá el diferente
      </h1>

      <ul
        className="grid flex-1 content-center justify-items-center"
        style={{
          gridTemplateColumns: `repeat(${round.columns}, minmax(0, 1fr))`,
          gap: big ? 20 : 13,
        }}
      >
        {round.elements.map((el, i) => {
          const shape = shapeStyles(el.shape)
          const chosenWrong =
            session.locked && session.selected === i && i !== round.correctIndex
          const showCorrect = session.locked && i === round.correctIndex
          const ring = showCorrect
            ? 'ring-4 ring-positive'
            : chosenWrong
              ? 'ring-4 ring-gentle'
              : ''
          return (
            <li key={i} className="w-full">
              <motion.button
                onClick={() => session.select(i)}
                disabled={session.locked}
                whileTap={reduce || session.locked ? undefined : { scale: 0.93 }}
                aria-label={i === round.correctIndex ? 'Elemento diferente' : 'Elemento'}
                className={`relative flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-transparent transition-colors ${ring}`}
              >
                <span
                  className={el.colorClass}
                  style={{
                    display: 'block',
                    width: `${el.sizePct}%`,
                    height: `${el.sizePct}%`,
                    borderRadius: shape.borderRadius,
                    clipPath: shape.clipPath,
                  }}
                  aria-hidden
                />
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

        {session.locked && (
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
        )}

        {session.locked && (
          <PrimaryButton onClick={session.next} disabled={!session.locked}>
            {isLast ? 'Ver resultado' : 'Continuar'} ›
          </PrimaryButton>
        )}
      </div>
    </main>
  )
}
