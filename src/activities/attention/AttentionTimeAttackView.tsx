import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { SessionSummary } from '../../components/SessionSummary'
import type { ModeConfig } from '../../modes/types'
import { useNav } from '../../navigation/navContext'
import { useTimeAttackSession } from './useTimeAttackSession'
import { buildAttentionRound, shapeStyles } from './attentionEngine'
import { getBestAttentionScore } from '../../db/sessions'

interface Props {
  config: ModeConfig
}

/** Vista time-attack: tiempo total fijo, se cuentan aciertos. Ágil y Sereno. */
export function AttentionTimeAttackView({ config }: Props) {
  const { back } = useNav()
  const reduce = useReducedMotion()
  const attCfg = config.activities.attention
  const totalSeconds = attCfg.sessionDurationSeconds ?? 15
  const [bestScore, setBestScore] = useState<number | null>(null)
  const savedRef = useRef(false)

  useEffect(() => {
    void getBestAttentionScore(config.id).then(setBestScore)
  }, [config.id])

  const session = useTimeAttackSession({
    buildRound: (difficulty) => buildAttentionRound(attCfg, difficulty),
    totalSeconds,
    difficultyStep: attCfg.difficultyStep,
  })

  // Refrescar récord al terminar (la grabación la hace SessionSummary).
  useEffect(() => {
    if (!session.finished || savedRef.current) return
    savedRef.current = true
    void getBestAttentionScore(config.id).then(setBestScore)
  }, [session.finished, config.id])

  if (session.finished) {
    const isNewRecord = bestScore === null || session.score > bestScore
    return (
      <SessionSummary
        headline={isNewRecord ? '¡Nuevo récord!' : '¡Tiempo!'}
        subline={
          <>
            Encontraste <strong>{session.score}</strong> en {totalSeconds}s.
            {bestScore !== null && !isNewRecord && <> Récord: {bestScore}.</>}
          </>
        }
        stats={[
          { label: 'Encontrados', value: session.score, accent: 'agil' },
          {
            label: isNewRecord ? '¡Récord!' : 'Récord anterior',
            value: bestScore !== null ? bestScore : '—',
            accent: 'sereno',
          },
        ]}
        record={{
          activity: 'attention',
          mode: config.id,
          correct: session.score,
          total: 0,
          score: session.score,
        }}
        onAgain={() => {
          savedRef.current = false
          session.restart()
        }}
        onHome={back}
        againLabel="Otra ronda"
      />
    )
  }

  const round = session.current
  const pct = session.timeLeft / totalSeconds
  const urgent = pct <= 0.33

  return (
    <main className="flex flex-1 flex-col px-6 pb-9 pt-12 gap-4">
      <ScreenHeader
        title="Atención"
        right={
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
        }
      />

      {/* Barra de tiempo total */}
      <div
        className="flex items-center gap-3"
        role="timer"
        aria-label={`${session.timeLeft} segundos restantes`}
      >
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full ${urgent ? 'bg-calmo' : 'bg-agil'}`}
            style={{
              width: `${pct * 100}%`,
              transition: reduce ? 'none' : 'width 1s linear',
            }}
          />
        </div>
        <span
          className={`w-6 text-right font-bold tabular-nums text-[14px] ${urgent ? 'text-calmo-strong' : 'text-ink-muted'}`}
        >
          {session.timeLeft}
        </span>
      </div>

      <h2 className="text-center font-serif text-[20px] font-semibold text-ink-strong">
        ¿Cuál es diferente?
      </h2>

      <ul
        className="grid flex-1 content-center justify-items-center"
        style={{
          gridTemplateColumns: `repeat(${round.columns}, minmax(0, 1fr))`,
          gap: 10,
        }}
      >
        {round.elements.map((el, i) => {
          const shape = shapeStyles(el.shape)
          const isSelected = session.selectedIndex === i
          const isCorrect = i === round.correctIndex
          const ring =
            session.locked && isCorrect
              ? 'ring-4 ring-positive'
              : session.locked && isSelected && !isCorrect
                ? 'ring-4 ring-gentle'
                : ''
          return (
            <li key={i} className="w-full">
              <motion.button
                onClick={() => session.select(i)}
                disabled={session.locked}
                whileTap={reduce || session.locked ? undefined : { scale: 0.93 }}
                aria-label={isCorrect ? 'Elemento diferente' : 'Elemento'}
                className={`relative flex aspect-square w-full items-center justify-center rounded-xl border-2 border-transparent transition-colors ${ring}`}
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

      <div className="h-5 text-center text-[14px] font-bold">
        {session.locked ? (
          <span className={session.lastCorrect ? 'text-positive' : 'text-calmo-strong'}>
            {session.lastCorrect
              ? config.feedback.successMessage
              : config.feedback.errorMessage}
          </span>
        ) : (
          <span className="text-ink-muted">
            {bestScore !== null ? `Récord: ${bestScore} aciertos` : ' '}
          </span>
        )}
      </div>
    </main>
  )
}
