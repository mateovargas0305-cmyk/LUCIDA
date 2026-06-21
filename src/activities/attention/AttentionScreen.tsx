import { useState } from 'react'
import { useModeConfig } from '../../modes/modeContext'
import { GameTimePicker } from '../shared/GameTimePicker'
import { AttentionRoundsView } from './AttentionRoundsView'
import { AttentionTimeAttackView } from './AttentionTimeAttackView'
import type { TimedConfig } from '../shared/timedConfig'

/** Despacha entre picker → rondas (Libre/Pulso) o time-attack (Ráfaga). Calmo va directo a rondas. */
export function AttentionScreen() {
  const config = useModeConfig()

  const [timedConfig, setTimedConfig] = useState<TimedConfig | null>(
    config.id === 'calmo' ? { mode: 'libre', seconds: 0 } : null,
  )

  if (!timedConfig) {
    return <GameTimePicker title="Atención" onStart={setTimedConfig} />
  }

  if (timedConfig.mode === 'rafaga') {
    return (
      <AttentionTimeAttackView
        key={timedConfig.seconds}
        config={config}
        totalSeconds={timedConfig.seconds}
      />
    )
  }

  return (
    <AttentionRoundsView
      config={config}
      pulsoSeconds={timedConfig.mode === 'pulso' ? timedConfig.seconds : undefined}
    />
  )
}
