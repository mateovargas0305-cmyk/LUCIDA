import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { PrimaryButton } from '../../components/ui/PrimaryButton'
import { useModeConfig } from '../../modes/modeContext'
import { tpx } from '../../lib/typography'
import {
  PULSO_PRESETS,
  RAFAGA_PRESETS,
  PULSO_DEFAULT,
  RAFAGA_DEFAULT,
  type TimeMode,
  type TimedConfig,
} from './timedConfig'

interface Props {
  title: string
  onStart: (cfg: TimedConfig) => void
}

const MODES: { id: TimeMode; label: string; desc: string }[] = [
  { id: 'libre', label: 'Libre', desc: 'Sin límite de tiempo' },
  { id: 'pulso', label: 'Pulso', desc: 'Tiempo por turno' },
  { id: 'rafaga', label: 'Ráfaga', desc: 'Cuántas en X segundos' },
]

export function GameTimePicker({ title, onStart }: Props) {
  const config = useModeConfig()
  const [mode, setMode] = useState<TimeMode>('libre')
  const [seconds, setSeconds] = useState(PULSO_DEFAULT)

  const handleMode = (m: TimeMode) => {
    setMode(m)
    if (m === 'pulso') setSeconds(PULSO_DEFAULT)
    else if (m === 'rafaga') setSeconds(RAFAGA_DEFAULT)
  }

  const presets = mode === 'pulso' ? PULSO_PRESETS : RAFAGA_PRESETS

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 pb-9 pt-8">
      <ScreenHeader title={title} />

      <p
        className="font-serif font-semibold text-ink-strong"
        style={{ fontSize: tpx(config.typography.headingPx) }}
      >
        ¿Cómo querés jugar?
      </p>

      {/* Tarjetas de modo */}
      <div className="flex gap-3">
        {MODES.map(({ id, label, desc }) => {
          const selected = mode === id
          return (
            <motion.button
              key={id}
              onClick={() => handleMode(id)}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 px-2 py-5 text-center transition-colors ${
                selected ? 'border-agil bg-agil-soft' : 'border-border bg-surface'
              }`}
            >
              <span
                className={`font-serif font-bold ${selected ? 'text-agil-strong' : 'text-ink-strong'}`}
                style={{ fontSize: tpx(config.typography.controlTextPx) }}
              >
                {label}
              </span>
              <span
                className="leading-tight text-ink-muted"
                style={{ fontSize: tpx(config.typography.captionPx) }}
              >
                {desc}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Presets de tiempo (solo para Pulso y Ráfaga) */}
      {mode !== 'libre' && (
        <div className="flex flex-col gap-3">
          <p
            className="font-sans font-bold text-ink-muted"
            style={{ fontSize: tpx(config.typography.captionPx) }}
          >
            {mode === 'pulso' ? 'Segundos por turno' : 'Duración total'}
          </p>
          <div className="flex gap-3">
            {presets.map((s) => (
              <button
                key={s}
                onClick={() => setSeconds(s)}
                className={`flex-1 rounded-xl border-2 py-3 font-serif font-bold transition-colors ${
                  seconds === s
                    ? 'border-agil bg-agil text-surface'
                    : 'border-border bg-surface text-ink-strong'
                }`}
                style={{ fontSize: tpx(config.typography.controlTextPx) }}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <PrimaryButton onClick={() => onStart({ mode, seconds })}>
          Empezar ›
        </PrimaryButton>
      </div>
    </main>
  )
}
