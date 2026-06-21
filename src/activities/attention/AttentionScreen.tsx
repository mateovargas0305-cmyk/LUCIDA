import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { useModeConfig } from '../../modes/modeContext'
import { tpx } from '../../lib/typography'
import { AttentionRoundsView } from './AttentionRoundsView'
import { AttentionTimeAttackView } from './AttentionTimeAttackView'

function DurationSelectView({
  defaultSeconds,
  onStart,
}: {
  defaultSeconds: number
  onStart: (s: number) => void
}) {
  const config = useModeConfig()
  const reduce = useReducedMotion()
  const [seconds, setSeconds] = useState(defaultSeconds)
  const MIN = 15
  const MAX = 60
  const STEP = 5
  const pct = ((seconds - MIN) / (MAX - MIN)) * 100

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 pb-9 pt-12">
      <ScreenHeader title="Atención" />

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

      <div className="flex flex-col items-center gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={seconds}
            initial={reduce ? false : { scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
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

      <div className="relative px-1">
        <div className="relative h-3 overflow-hidden rounded-full bg-border">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-agil"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        </div>
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
        <motion.div
          className="pointer-events-none absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-2 border-agil bg-surface shadow-card"
          animate={{ left: `calc(${pct}% - 14px)` }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
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

/** Despacha entre vista clásica (Calmo) y time-attack (Ágil/Sereno) según la config del modo. */
export function AttentionScreen() {
  const config = useModeConfig()
  const attCfg = config.activities.attention

  const [phase, setPhase] = useState<'select' | 'playing'>('select')
  const [duration, setDuration] = useState(attCfg.sessionDurationSeconds ?? 15)

  if (attCfg.sessionMode !== 'time-attack') {
    return <AttentionRoundsView config={config} />
  }

  if (phase === 'select') {
    return (
      <DurationSelectView
        defaultSeconds={duration}
        onStart={(s) => {
          setDuration(s)
          setPhase('playing')
        }}
      />
    )
  }

  return (
    <AttentionTimeAttackView
      key={duration}
      config={config}
      totalSeconds={duration}
    />
  )
}
