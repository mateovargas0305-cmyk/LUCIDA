import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface CountdownTimerProps {
  totalSeconds: number
  /** Cambia con cada nueva pregunta/ronda para reiniciar el contador. */
  questionKey: string | number
  onExpire: () => void
  /** Detiene el contador (p. ej. cuando la pregunta ya fue respondida). */
  paused?: boolean
}

/**
 * Barra de tiempo regresivo para Modo Ágil.
 * Sólo debe renderizarse cuando `timing.timerAllowed` es true.
 */
export function CountdownTimer({
  totalSeconds,
  questionKey,
  onExpire,
  paused,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const firedRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  const reduce = useReducedMotion()

  // Ref actualizada para no incluir onExpire en la dep del efecto de cuenta.
  useEffect(() => {
    onExpireRef.current = onExpire
  })

  // Reiniciar al cambiar de pregunta.
  useEffect(() => {
    setRemaining(totalSeconds)
    firedRef.current = false
  }, [questionKey, totalSeconds])

  // Tick de un segundo.
  useEffect(() => {
    if (paused) return
    if (remaining <= 0) {
      if (!firedRef.current) {
        firedRef.current = true
        onExpireRef.current()
      }
      return
    }
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [remaining, paused])

  const pct = remaining / totalSeconds
  const urgent = pct <= 0.33

  return (
    <div
      className="flex items-center gap-3"
      role="timer"
      aria-label={`${remaining} segundos restantes`}
      aria-live="off"
    >
      <div className="h-2 flex-1 overflow-hidden rounded-pill bg-border">
        <div
          className={`h-full rounded-pill ${urgent ? 'bg-calmo' : 'bg-agil'}`}
          style={{
            width: `${pct * 100}%`,
            transition: reduce || paused ? 'none' : 'width 1s linear',
          }}
        />
      </div>
      <span
        className={`w-7 text-right font-bold tabular-nums ${urgent ? 'text-calmo-strong' : 'text-ink-muted'}`}
        style={{ fontSize: '14px' }}
      >
        {remaining}
      </span>
    </div>
  )
}
