import { useMode } from '../modes/modeContext'
import { RETENTION_CONFIGS } from './retentionConfigs'
import type { RetentionConfig } from './types'

/** Devuelve la config de retención correspondiente al modo activo. */
export function useRetentionConfig(): RetentionConfig {
  const { mode } = useMode()
  return RETENTION_CONFIGS[mode]
}
