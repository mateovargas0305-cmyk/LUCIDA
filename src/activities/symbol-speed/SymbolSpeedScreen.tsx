import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { FeedbackBanner } from '../../components/ui/FeedbackBanner'
import { CountdownTimer } from '../../components/ui/CountdownTimer'
import { SessionSummary } from '../../components/SessionSummary'
import { useModeConfig } from '../../modes/modeContext'
import { useNav } from '../../navigation/navContext'
import { useChoiceSession } from '../shared/useChoiceSession'
import { useSymbolTimeAttack } from './useSymbolTimeAttack'
import { GameTimePicker } from '../shared/GameTimePicker'
import { tpx } from '../../lib/typography'
import { getBestSymbolSpeedScore } from '../../db/sessions'
import {
  buildSymbolTable,
  buildSymbolRounds,
  type SymbolKey,
  type SymbolSpeedRound,
} from './symbolSpeedEngine'
import type { TimedConfig } from '../shared/timedConfig'

// ── Vista time-attack (Ráfaga) ─────────────────────────────────────────────────

interface TimeAttackProps {
  table: SymbolKey[]
  totalSeconds: number
  onFinish: (score: number) => void
  onBack: () => void
  bestScore: number | null
}

function SymbolTimeAttackView({ table, totalSeconds, onFinish, onBack, bestScore }: TimeAttackProps) {
  const config = useModeConfig()
  const reduce = useReducedMotion()

  const session = useSymbolTimeAttack(table, totalSeconds)

  const finishedRef = useRef(false)
  useEffect(() => {
    if (!session.finished) {
      finishedRef.current = false
      return
    }
    if (!finishedRef.current) {
      finishedRef.current = true
      onFinish(session.score)
    }
  }, [session.finished, session.score, onFinish])

  if (session.finished) {
    const displayBest = bestScore !== null ? Math.max(bestScore, session.score) : session.score
    return (
      <SessionSummary
        headline="¡Tiempo!"
        subline={
          <>
            Acertaste <strong>{session.score}</strong> en {totalSeconds} segundos.
          </>
        }
        stats={[
          { label: 'Aciertos', value: session.score, accent: 'agil' },
          { label: 'Récord', value: displayBest, accent: 'sereno' },
        ]}
        record={{
          activity: 'symbolSpeed',
          mode: config.id,
          correct: session.score,
          total: totalSeconds,
          score: session.score,
        }}
        onAgain={session.restart}
        onHome={onBack}
      />
    )
  }

  const round = session.current
  const pctLeft = (session.timeLeft / totalSeconds) * 100

  type Status = 'idle' | 'correct' | 'wrongChosen' | 'dimmed'
  const statusOf = (i: number): Status => {
    if (!session.locked) return 'idle'
    if (i === round.correctIndex) return 'correct'
    if (i === session.selectedIndex) return 'wrongChosen'
    return 'dimmed'
  }
  const OPTION_BOX: Record<Status, string> = {
    idle: 'bg-surface border-border text-ink-strong',
    correct: 'bg-positive-soft border-positive text-positive-ink',
    wrongChosen: 'bg-game-1 border-game-1-strong text-game-1-ink',
    dimmed: 'bg-surface border-border text-ink-muted',
  }

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-9 pt-8"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <ScreenHeader
        title="Velocidad de símbolos"
        right={
          <span className="flex items-center gap-1.5 rounded-full bg-agil-soft px-3 py-1.5 text-[14px] font-bold text-agil-strong">
            <span className="h-2 w-2 rotate-45 rounded-[2px] bg-agil" aria-hidden />
            {session.score}
          </span>
        }
      />

      {/* Barra de tiempo */}
      <div className="h-3 overflow-hidden rounded-full bg-border" aria-hidden>
        <motion.div
          className={`h-full rounded-full transition-colors ${pctLeft <= 33 ? 'bg-game-1' : 'bg-agil'}`}
          animate={{ width: `${pctLeft}%` }}
          transition={{ duration: 0.9, ease: 'linear' }}
        />
      </div>
      <div
        className="text-center text-[22px] font-bold tabular-nums text-ink-strong"
        aria-live="polite"
        aria-label={`${session.timeLeft} segundos restantes`}
      >
        {session.timeLeft}s
      </div>

      {/* Tabla de referencia */}
      <div
        className="rounded-2xl border border-border bg-canvas px-4 py-3"
        aria-label="Tabla de referencia de símbolos"
      >
        <ul className="grid grid-cols-5 gap-2">
          {table.map((entry) => (
            <li
              key={entry.symbol}
              className="flex flex-col items-center gap-0.5 rounded-xl bg-surface px-2 py-2 shadow-soft"
            >
              <span className="text-[26px] font-bold leading-none text-ink-strong" aria-hidden>
                {entry.symbol}
              </span>
              <span className="text-[15px] font-bold tabular-nums text-ink-soft">
                {entry.code}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Símbolo objetivo */}
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${round.targetSymbol}-${session.score}`}
            initial={reduce ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="font-bold leading-none text-ink-strong"
            style={{ fontSize: tpx(80) }}
            aria-label={`Símbolo: ${round.targetSymbol}`}
          >
            {round.targetSymbol}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Opciones numéricas */}
      <ul className="grid grid-cols-2 gap-3">
        {round.options.map((code, i) => {
          const status = statusOf(i)
          return (
            <li key={i}>
              <motion.button
                onClick={() => session.select(i)}
                disabled={session.locked}
                whileTap={reduce || session.locked ? undefined : { scale: 0.97 }}
                className={`flex w-full items-center justify-center gap-3 rounded-xl border-2 font-serif font-bold transition-colors ${OPTION_BOX[status]}`}
                style={{
                  minHeight: config.controls.primaryButtonMinHeightPx + 8,
                  fontSize: tpx(config.typography.headingPx),
                }}
              >
                {code}
                {status === 'correct' && (
                  <span
                    className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-positive text-[16px] text-surface"
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
    </main>
  )
}

// ── Vista rounds (Libre / Pulso) ───────────────────────────────────────────────

interface RoundsViewProps {
  pulsoSeconds?: number
}

function SymbolRoundsView({ pulsoSeconds }: RoundsViewProps) {
  const config = useModeConfig()
  const { back } = useNav()
  const reduce = useReducedMotion()
  const symCfg = config.activities.symbolSpeed

  const tableRef = useRef<SymbolKey[]>(buildSymbolTable(symCfg.symbolCount))

  const session = useChoiceSession<SymbolSpeedRound>({
    build: () => {
      tableRef.current = buildSymbolTable(symCfg.symbolCount)
      return buildSymbolRounds(symCfg, tableRef.current)
    },
    retryOnError: config.activities.quiz.retryOnError,
    pointsPerCorrect: 0,
    streakBonusEnabled: false,
    streakBonusThreshold: 3,
    streakBonusPoints: 0,
  })

  const { timedOut, next } = session
  useEffect(() => {
    if (!timedOut) return
    const id = setTimeout(() => next(), 1300)
    return () => clearTimeout(id)
  }, [timedOut, next])

  if (session.finished) {
    return (
      <SessionSummary
        headline="¡Sesión completa!"
        subline={
          <>
            Acertaste <strong>{session.correctCount} de {session.total}</strong>.
          </>
        }
        stats={[
          {
            label: 'Aciertos',
            value: `${session.correctCount}/${session.total}`,
            accent: 'sereno',
          },
        ]}
        record={{
          activity: 'symbolSpeed',
          mode: config.id,
          correct: session.correctCount,
          total: session.total,
          score: session.correctCount,
        }}
        onAgain={session.restart}
        onHome={back}
      />
    )
  }

  const round = session.current
  const table = tableRef.current
  const isLast = session.index >= session.total - 1

  type Status = 'idle' | 'correct' | 'wrongChosen' | 'dimmed'
  const statusOf = (i: number): Status => {
    if (!session.locked) return 'idle'
    if (i === round.correctIndex) return 'correct'
    if (i === session.selected) return 'wrongChosen'
    return 'dimmed'
  }
  const OPTION_BOX: Record<Status, string> = {
    idle: 'bg-surface border-border text-ink-strong',
    correct: 'bg-positive-soft border-positive text-positive-ink',
    wrongChosen: 'bg-calmo-soft border-calmo text-calmo-strong',
    dimmed: 'bg-surface border-border text-ink-muted',
  }
  const answeredCorrectly =
    session.locked && !session.timedOut && session.selected === round.correctIndex

  return (
    <main className="flex flex-1 flex-col" style={{ minHeight: 0 }}>
      {/* Contenido desplazable */}
      <div
        className="flex flex-1 flex-col overflow-y-auto px-6 pt-8"
        style={{ gap: config.controls.blockGapPx, paddingBottom: 8 }}
      >
        <ScreenHeader title="Velocidad de símbolos" />

        {pulsoSeconds !== undefined && (
          <CountdownTimer
            totalSeconds={pulsoSeconds}
            questionKey={session.index}
            onExpire={session.timeout}
            paused={session.locked}
          />
        )}

        <div>
          <h1
            className="font-serif font-semibold leading-snug text-ink-strong"
            style={{ fontSize: tpx(config.typography.headingPx) }}
          >
            ¿Qué número le toca?
          </h1>
          <p
            className="mt-2 leading-relaxed text-ink-soft"
            style={{ fontSize: tpx(config.typography.baseTextPx) }}
          >
            Buscá el símbolo en la tabla de arriba.
          </p>
        </div>

        <div
          className="rounded-2xl border border-border bg-canvas px-4 py-3"
          aria-label="Tabla de referencia de símbolos"
        >
          <ul className="flex flex-wrap justify-center gap-3">
            {table.map((entry) => (
              <li
                key={entry.symbol}
                className="flex flex-col items-center gap-1 rounded-xl bg-surface px-4 py-2 shadow-soft"
              >
                <span
                  className="font-bold leading-none text-ink-strong"
                  style={{ fontSize: tpx(32) }}
                  aria-hidden
                >
                  {entry.symbol}
                </span>
                <span className="font-bold tabular-nums text-ink-soft" style={{ fontSize: tpx(20) }}>
                  {entry.code}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center gap-3 py-4">
          <p
            className="font-sans font-bold text-ink-muted"
            style={{ fontSize: tpx(config.typography.captionPx) }}
          >
            ¿Qué número le corresponde a…?
          </p>
          <span
            className="font-bold leading-none text-ink-strong"
            style={{ fontSize: tpx(100) }}
            aria-label={`Símbolo: ${round.targetSymbol}`}
          >
            {round.targetSymbol}
          </span>
        </div>

        <ul className="grid grid-cols-2 gap-3">
          {round.options.map((code, i) => {
            const status = statusOf(i)
            return (
              <li key={i}>
                <motion.button
                  onClick={() => {
                    if (!session.locked) session.select(i, 0)
                  }}
                  disabled={session.locked}
                  whileTap={reduce || session.locked ? undefined : { scale: 0.97 }}
                  className={`flex w-full items-center justify-center gap-3 rounded-2xl border-2 font-serif font-bold transition-colors ${OPTION_BOX[status]}`}
                  style={{
                    minHeight: config.controls.tapTargetMinPx + 16,
                    fontSize: tpx(config.typography.headingPx),
                  }}
                >
                  {code}
                  {status === 'correct' && (
                    <span
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-positive text-[18px] text-surface"
                      aria-hidden
                    >
                      ✓
                    </span>
                  )}
                  {status === 'wrongChosen' && (
                    <span className="text-[16px] text-calmo" aria-hidden>
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
        {session.locked && (
          session.timedOut ? (
            <p className="text-center text-[15px] font-bold text-calmo-strong">
              Tiempo agotado. {config.feedback.errorMessage}
            </p>
          ) : (
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
          )
        )}
        {!session.timedOut && session.locked && (
          <PrimaryButton onClick={session.next}>
            {isLast ? 'Ver resultado' : 'Siguiente'} ›
          </PrimaryButton>
        )}
      </div>
    </main>
  )
}

// ── Dispatcher principal ───────────────────────────────────────────────────────

export function SymbolSpeedScreen() {
  const config = useModeConfig()
  const symCfg = config.activities.symbolSpeed

  const [timedConfig, setTimedConfig] = useState<TimedConfig | null>(
    config.id === 'calmo' ? { mode: 'libre', seconds: 0 } : null,
  )
  const [bestScore, setBestScore] = useState<number | null>(null)
  const tableRef = useRef<SymbolKey[]>(buildSymbolTable(symCfg.symbolCount))

  const handleFinish = useCallback((score: number) => {
    setBestScore((prev) => (prev === null ? score : Math.max(prev, score)))
  }, [])

  useEffect(() => {
    if (!timedConfig || timedConfig.mode !== 'rafaga') return
    void getBestSymbolSpeedScore(config.id, timedConfig.seconds).then(setBestScore)
  }, [config.id, timedConfig])

  if (!timedConfig) {
    return <GameTimePicker title="Velocidad de símbolos" onStart={setTimedConfig} />
  }

  if (timedConfig.mode === 'rafaga') {
    return (
      <SymbolTimeAttackView
        key={timedConfig.seconds}
        table={tableRef.current}
        totalSeconds={timedConfig.seconds}
        onFinish={handleFinish}
        onBack={() => setTimedConfig(null)}
        bestScore={bestScore}
      />
    )
  }

  return (
    <SymbolRoundsView
      pulsoSeconds={timedConfig.mode === 'pulso' ? timedConfig.seconds : undefined}
    />
  )
}
