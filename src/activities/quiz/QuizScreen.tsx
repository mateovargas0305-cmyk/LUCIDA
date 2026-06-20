import { motion, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { FeedbackBanner } from '../../components/ui/FeedbackBanner'
import { SessionSummary } from '../../components/SessionSummary'
import { useModeConfig } from '../../modes/modeContext'
import { usePreferences } from '../../preferences/preferencesContext'
import { useNav } from '../../navigation/navContext'
import { CATEGORY_LABEL } from '../../data/quiz'
import { canSpeak, speak } from '../../lib/speech'
import { tpx } from '../../lib/typography'
import { useQuizSession } from './useQuizSession'
import { OPTION_LETTERS } from './quizEngine'

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

export function QuizScreen() {
  const config = useModeConfig()
  const { soundEnabled } = usePreferences()
  const { back } = useNav()
  const reduce = useReducedMotion()
  const session = useQuizSession(config)
  const quizCfg = config.activities.quiz

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
        onHome={back}
      />
    )
  }

  const q = session.current
  const lettered = quizCfg.letteredOptions
  const isLast = session.index >= session.total - 1

  const statusOf = (i: number): OptionStatus => {
    if (!session.locked) return 'idle'
    if (i === q.correctIndex) return 'correct'
    if (i === session.selected) return 'wrongChosen'
    return 'dimmed'
  }

  const answeredCorrectly =
    session.locked && session.selected === q.correctIndex

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-9 pt-12"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <ScreenHeader
        title="Cultura general"
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
              style={{
                width: `${((session.index + 1) / session.total) * 100}%`,
              }}
            />
          </div>
          <span className="text-[13px] font-bold text-ink-muted">
            {session.index + 1}/{session.total}
          </span>
        </div>
      )}

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
                  lettered
                    ? 'gap-3 rounded-xl p-3.5'
                    : 'justify-center gap-4 rounded-2xl'
                }`}
                style={{
                  fontSize: tpx(config.typography.controlTextPx),
                  minHeight: lettered
                    ? undefined
                    : config.controls.tapTargetMinPx + 12,
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
          (lettered ? (
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

        {(() => {
          // Calmo: el avance aparece sólo tras acertar (una acción por pantalla).
          // Ágil/Sereno: si el modo pide "Siguiente" siempre visible, se muestra
          // deshabilitado hasta responder.
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
