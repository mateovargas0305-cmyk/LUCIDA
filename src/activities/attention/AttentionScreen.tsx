import { useModeConfig } from '../../modes/modeContext'
import { AttentionRoundsView } from './AttentionRoundsView'
import { AttentionTimeAttackView } from './AttentionTimeAttackView'

/** Despacha entre vista clásica (Calmo) y time-attack (Ágil/Sereno) según la config del modo. */
export function AttentionScreen() {
  const config = useModeConfig()
  if (config.activities.attention.sessionMode === 'time-attack') {
    return <AttentionTimeAttackView config={config} />
  }
  return <AttentionRoundsView config={config} />
}
