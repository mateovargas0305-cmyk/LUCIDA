export type TimeMode = 'libre' | 'pulso' | 'rafaga'

export interface TimedConfig {
  mode: TimeMode
  /** Segundos por turno (Pulso) o duración total (Ráfaga). Ignorado en Libre. */
  seconds: number
}

export const PULSO_PRESETS = [5, 10, 15, 30] as const
export const RAFAGA_PRESETS = [30, 60, 90, 120] as const
export const PULSO_DEFAULT = 15
export const RAFAGA_DEFAULT = 60
