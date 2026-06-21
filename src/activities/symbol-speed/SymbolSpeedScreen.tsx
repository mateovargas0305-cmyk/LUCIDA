import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { FeedbackBanner } from '../../components/ui/FeedbackBanner'
import { SessionSummary } from '../../components/SessionSummary'
import { useModeConfig } from '../../modes/modeContext'
import { useNav } from '../../navigation/navContext'
import { useChoiceSession } from '../shared/useChoiceSession'
import { useSymbolTimeAttack } from './useSymbolTimeAttack'
import { tpx } from '../../lib/typography'
import { getBestSymbolSpeedScore } from '../../db/sessions'
import {
  buildSymbolTable,
  buildSymbolRounds,
  type SymbolKey,
  type SymbolSpeedRound,
} from './symbolSpeedEngine'

// ── Selector de duración ───────────────────────────────────────────────────────

interface DurationSelectProps {
  defaultSeconds: number
  onStart: (seconds: number) => void
}

function DurationSelectView({ defaultSeconds, onStart }: DurationSelectProps) {
  const config = useModeConfig()
  const reduce = useReducedMotion()
  const [seconds, setSeconds] = useState(defaultSeconds)
  const MIN = 15
  const MAX = 60
  const STEP = 5

  const pct = ((seconds - MIN) / (MAX - MIN)) * 100

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 pb-9 pt-8">
      <ScreenHeader title="Velocidad de símbolos" />

      <div className="flex flex-col items-center gap-2 text-center">
        <p
          className="font-serif font-semibold text-ink-strong"
          style={{ fontSize: tpx(config.typography.headingPx) }}
        >
          ¿Cuánto tiempo querés jugar?
        </p>
        <p className="text-ink-soft" style={{ fontSize: tpx(config.typography.baseTextPx) }}>
          Elegí la duración de la partida.
        </p>
      </div>

      {/* Valor seleccionado */}
      <div className="flex flex-col items-center gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={seconds}
            initial={reduce ? false : { scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="font-serif font-bold tabular-nums text-ink-strong"
            style={{ fontSize: tpx(72) }}
            aria-live="polite"
            aria-label={`${seconds} segundos`}
          >
            {seconds}
          </motion.span>
        </AnimatePresence>
        <span className="text-[18px] font-bold text-ink-muted">segundos</span>
      </div>

      {/* Slider con track animado */}
      <div className="relative px-1">
        {/* Track visual */}
        <div className="relative h-3 overflow-hidden rounded-full bg-border">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-agil"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        </div>
        {/* Input range invisible sobre el track */}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={seconds}
          onChange={(e) => setSeconds(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
          style={{ height: '44px', top: '50%', transform: 'translateY(-50%)' }}
          aria-label="Duración en segundos"
        />
        {/* Thumb visual */}
        <motion.div
          className="pointer-events-none absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-2 border-agil bg-surface shadow-card"
          animate={{ left: `calc(${pct}% - 14px)` }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
        {/* Labels de extremos */}
        <div className="mt-5 flex justify-between text-[13px] font-bold text-ink-muted">
          <span>{MIN}s</span>
          <span>{MAX}s</span>
        </div>
      </div>

      <div className="mt-auto">
        <PrimaryButton onClick={() => onStart(seconds)}>
          Empezar con {seconds}s ›
        </PrimaryButton>
      </div>
    </main>
  )
}

// ── Vista time-attack ──────────────────────────────────────────────────────────

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

// ── Vista rounds (Calmo) ───────────────────────────────────────────────────────

function SymbolRoundsView() {
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
    <main
      className="flex flex-1 flex-col px-6 pb-9 pt-8"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      <ScreenHeader title="Velocidad de símbolos" />
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

      <div className="flex flex-1 flex-col items-center justify-center gap-3">
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

      <div className="flex flex-col gap-3 pt-1">
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
          <PrimaryButton onClick={session.next}>
            {isLast ? 'Ver resultado' : 'Siguiente'} ›
          </PrimaryButton>
        )}
      </div>
    </main>
  )
}

// ── Dispatcher principal ───────────────────────────────────────────────────────

type Phase = 'select-duration' | 'playing'

export function SymbolSpeedScreen() {
  const config = useModeConfig()
  const symCfg = config.activities.symbolSpeed

  const [phase, setPhase] = useState<Phase>(
    symCfg.sessionMode === 'time-attack' ? 'select-duration' : 'playing',
  )
  const [duration, setDuration] = useState(symCfg.defaultDurationSeconds ?? 30)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const tableRef = useRef<SymbolKey[]>(buildSymbolTable(symCfg.symbolCount))

  useEffect(() => {
    if (symCfg.sessionMode !== 'time-attack') return
    void getBestSymbolSpeedScore(config.id, duration).then(setBestScore)
  }, [config.id, duration, symCfg.sessionMode])

  const handleStart = useCallback(
    (seconds: number) => {
      setDuration(seconds)
      tableRef.current = buildSymbolTable(symCfg.symbolCount)
      setPhase('playing')
    },
    [symCfg.symbolCount],
  )

  const handleFinish = useCallback((score: number) => {
    setBestScore((prev) => (prev === null ? score : Math.max(prev, score)))
  }, [])

  if (symCfg.sessionMode === 'rounds') {
    return <SymbolRoundsView />
  }

  if (phase === 'select-duration') {
    return <DurationSelectView defaultSeconds={duration} onStart={handleStart} />
  }

  return (
    <SymbolTimeAttackView
      table={tableRef.current}
      totalSeconds={duration}
      onFinish={handleFinish}
      onBack={() => setPhase('select-duration')}
      bestScore={bestScore}
    />
  )
}
