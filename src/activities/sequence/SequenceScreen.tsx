import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { FeedbackBanner } from '../../components/ui/FeedbackBanner'
import { CountdownTimer } from '../../components/ui/CountdownTimer'
import { SessionSummary } from '../../components/SessionSummary'
import { useModeConfig } from '../../modes/modeContext'
import { useNav } from '../../navigation/navContext'
import { tpx } from '../../lib/typography'
import { useSequenceGame } from './useSequenceGame'
import {
  getSequenceColors,
  COLOR_BG,
  COLOR_HIGHLIGHT,
  COLOR_LABEL,
  type SequenceColorId,
} from './sequenceEngine'
import { GameTimePicker } from '../shared/GameTimePicker'
import type { TimedConfig } from '../shared/timedConfig'

// ── Juego de Secuencias ────────────────────────────────────────────────────────

function SequenceGameView({ timedConfig, onHome }: { timedConfig: TimedConfig; onHome: () => void }) {
  const config = useModeConfig()
  const reduce = useReducedMotion()
  const seqCfg = config.activities.sequence
  const pointsPerCorrect = config.scoring.enabled ? config.scoring.pointsPerCorrect : 0

  const game = useSequenceGame(seqCfg, pointsPerCorrect)

  // Ráfaga: countdown total
  const [rafagaExpired, setRafagaExpired] = useState(false)
  const [restartCount, setRestartCount] = useState(0)
  const isRafaga = timedConfig.mode === 'rafaga'
  const isPulso = timedConfig.mode === 'pulso'

  // Pulso: key para resetear el timer de input al iniciar cada nueva fase input
  const inputKeyRef = useRef(0)
  const prevPhase = useRef(game.phase)
  if (prevPhase.current !== 'input' && game.phase === 'input') {
    inputKeyRef.current += 1
  }
  prevPhase.current = game.phase

  if (game.phase === 'done' || rafagaExpired) {
    return (
      <SessionSummary
        headline={rafagaExpired ? '¡Tiempo!' : '¡Sesión completa!'}
        subline={
          isRafaga ? (
            <>
              Completaste <strong>{game.roundsWon}</strong> secuencias en {timedConfig.seconds}s.
            </>
          ) : (
            <>
              Completaste <strong>{game.roundsWon}</strong> de {seqCfg.maxRounds} secuencias.
            </>
          )
        }
        stats={[
          { label: 'Puntaje', value: game.score, accent: 'agil' },
          {
            label: 'Rondas',
            value: isRafaga ? game.roundsWon : `${game.roundsWon}/${seqCfg.maxRounds}`,
            accent: 'sereno',
          },
        ]}
        record={{
          activity: 'sequence',
          mode: config.id,
          correct: game.roundsWon,
          total: isRafaga ? game.roundsWon : seqCfg.maxRounds,
          score: game.score,
        }}
        onAgain={() => {
          game.restart()
          setRafagaExpired(false)
          setRestartCount((c) => c + 1)
        }}
        onHome={onHome}
        againLabel="Jugar de nuevo"
      />
    )
  }

  const big = !config.scoring.enabled
  const colors = getSequenceColors(seqCfg.colorCount)
  const isPlaying = game.phase === 'playing'
  const isInput = game.phase === 'input'
  const isSuccess = game.phase === 'success'
  const isError = game.phase === 'error'
  const useGrid = colors.length >= 4

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
            Repetí la secuencia
          </h1>
          <p
            className="mt-2 leading-relaxed text-ink-soft"
            style={{ fontSize: tpx(config.typography.baseTextPx) }}
          >
            {isPlaying
              ? 'Mirá con atención.'
              : isInput
                ? 'Tocá los colores en el mismo orden.'
                : 'Observá y repetí.'}
          </p>
        </div>
      ) : (
        <>
          <ScreenHeader
            title="Secuencias"
            right={
              config.scoring.enabled ? (
                <span className="flex items-center gap-1.5 rounded-full bg-agil-soft px-3 py-1.5 text-[14px] font-bold text-agil-strong">
                  <span className="h-2 w-2 rotate-45 rounded-[2px] bg-agil" aria-hidden />
                  {game.score}
                </span>
              ) : undefined
            }
          />
          {/* Progreso de rondas */}
          {!isRafaga && (
            <div className="flex items-center gap-2">
              {Array.from({ length: seqCfg.maxRounds }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    i < game.roundsWon
                      ? 'bg-positive'
                      : i === game.roundsWon
                        ? 'bg-sereno'
                        : 'bg-border'
                  }`}
                />
              ))}
            </div>
          )}
          <p className="text-center font-serif text-[20px] font-semibold text-ink-strong">
            {isPlaying ? 'Mirá...' : isInput ? '¿Cuál era el orden?' : ' '}
          </p>
        </>
      )}

      {/* Ráfaga: barra de tiempo total */}
      {isRafaga && (
        <CountdownTimer
          totalSeconds={timedConfig.seconds}
          questionKey={restartCount}
          onExpire={() => setRafagaExpired(true)}
          paused={false}
        />
      )}

      {/* Pulso: countdown durante fase de input */}
      {isPulso && isInput && (
        <CountdownTimer
          totalSeconds={timedConfig.seconds}
          questionKey={inputKeyRef.current}
          onExpire={game.inputTimeout}
          paused={false}
        />
      )}

      {/* Indicador de progreso de entrada */}
      {isInput && game.sequence.length > 0 && (
        <div className="flex justify-center gap-2" aria-label="Progreso de entrada">
          {game.sequence.map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full transition-colors ${
                i < game.inputProgress ? 'bg-positive' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}

      {/* Botones de colores */}
      <ul
        className={
          useGrid
            ? 'grid grid-cols-2 flex-1 content-center gap-3'
            : 'flex flex-1 flex-col content-center justify-center gap-3'
        }
      >
        {colors.map((colorIdx: SequenceColorId) => {
          const isHighlighted = game.highlightIndex !== null
            ? game.sequence[game.highlightIndex] === colorIdx && isPlaying
            : false
          const colorClass = isHighlighted
            ? COLOR_HIGHLIGHT[colorIdx]
            : COLOR_BG[colorIdx]

          return (
            <li key={colorIdx} className={useGrid ? '' : 'mx-auto w-full max-w-xs'}>
              <motion.button
                onClick={() => game.tap(colorIdx)}
                disabled={!isInput}
                animate={
                  reduce
                    ? undefined
                    : { scale: isHighlighted ? 1.06 : 1, opacity: isPlaying && !isHighlighted ? 0.55 : 1 }
                }
                transition={{ duration: 0.12 }}
                aria-label={`Color ${COLOR_LABEL[colorIdx]}`}
                aria-pressed={isHighlighted}
                className={`w-full rounded-3xl border-2 border-transparent transition-all ${colorClass}`}
                style={{
                  minHeight: big ? config.controls.tapTargetMinPx + 24 : 86,
                  aspectRatio: useGrid ? '1 / 1' : undefined,
                }}
              />
            </li>
          )
        })}
      </ul>

      {/* Feedback y acciones */}
      <div className="mt-auto flex flex-col gap-3 pt-2">
        {isError && (
          <FeedbackBanner
            variant="gentle"
            message={
              seqCfg.retryOnError
                ? config.feedback.errorMessage
                : `${config.feedback.errorMessage} Veamos cómo te fue.`
            }
            fontSize={config.typography.baseTextPx - 2}
          />
        )}
        {isSuccess && !big && (
          <p className="text-center text-[15px] font-bold text-positive">
            {config.feedback.successMessage} Secuencia {game.length} →{' '}
            {game.length + 1}…
          </p>
        )}
        {game.phase === 'intro' && (
          <PrimaryButton onClick={game.start}>
            Comenzar ›
          </PrimaryButton>
        )}
      </div>
    </main>
  )
}

// ── Orchestrator ───────────────────────────────────────────────────────────────

export function SequenceScreen() {
  const config = useModeConfig()
  const { back } = useNav()

  const [timedConfig, setTimedConfig] = useState<TimedConfig | null>(
    config.id === 'calmo' ? { mode: 'libre', seconds: 0 } : null,
  )

  if (!timedConfig) {
    return <GameTimePicker title="Secuencias" onStart={setTimedConfig} />
  }

  return (
    <SequenceGameView
      key={timedConfig.mode + timedConfig.seconds}
      timedConfig={timedConfig}
      onHome={back}
    />
  )
}
