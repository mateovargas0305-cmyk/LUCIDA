/**
 * Capa de configuración de retención por modo.
 *
 * Misma filosofía que `modes/types.ts`: un solo tipo, tres instancias.
 * Cada actividad de retención (racha, tendencia, sesión sugerida, push)
 * consume de acá; prohibido hardcodear comportamientos por modo en los
 * componentes.
 */

import type { ModeId } from '../modes/types'

/** Qué tan prominente es la racha en la UI. */
export type StreakProminence = 'high' | 'low' | 'minimal'

/**
 * Cómo comunicar un reseteo de racha.
 * - 'neutral': mensaje sin drama ("¡A empezar de nuevo!")
 * - 'silent':  nunca se menciona; a lo sumo "Bienvenido de nuevo"
 */
export type StreakResetTone = 'neutral' | 'silent'

/**
 * Qué dimensión del progreso se enfatiza en la vista de evolución personal.
 * - 'performance':   puntajes, récords, mejora porcentual
 * - 'consistency':   constancia y cantidad de sesiones, no rendimiento
 * - 'participation': framing cálido ("jugaste 4 veces esta semana"), sin métricas evaluativas
 */
export type TrendType = 'performance' | 'consistency' | 'participation'

/**
 * Cómo se encuadra la sesión sugerida del día.
 * - 'challenge':   "Desafío del día" con puntaje combinado a superar (Ágil)
 * - 'routine':     "Tu sesión sugerida", tono de rutina relajada (Sereno)
 * - 'invitation':  "¿Empezamos con esto?", lenguaje de invitación (Calmo)
 */
export type DailyFraming = 'challenge' | 'routine' | 'invitation'

/**
 * Tono de los mensajes push.
 * - 'motivator': orientado al reto ("Tu cerebro está listo para el desafío")
 * - 'neutral':   informativo ("Un momento para entrenar la mente")
 * - 'care':      cuidado y pausa ("Un momento de pausa para vos")
 */
export type PushTone = 'motivator' | 'neutral' | 'care'

// ── Sub-configs ───────────────────────────────────────────────────────────────

export interface StreakRetentionConfig {
  /** ¿Se renderiza la racha en algún lugar? */
  visible: boolean
  /** Cuánta pantalla / jerarquía visual ocupa. */
  prominence: StreakProminence
  /** Mostrar al abrir la app (no solo al cerrar sesión). */
  showOnOpen: boolean
  /** Tono del mensaje si el usuario perdió la racha. */
  resetTone: StreakResetTone
}

export interface DailySessionRetentionConfig {
  /** Cuántas actividades componen la sesión sugerida. */
  count: number
  /** Cómo se encuadra la sugerencia. */
  framing: DailyFraming
}

export interface PushRetentionConfig {
  /** Si las notificaciones vienen activadas por defecto (siempre false: opt-in). */
  defaultOn: false
  /** Tono del texto en las notificaciones push. */
  tone: PushTone
}

// ── Config completa ───────────────────────────────────────────────────────────

export interface RetentionConfig {
  /** Modo al que pertenece esta config (para diagnóstico). */
  mode: ModeId
  streak: StreakRetentionConfig
  trend: TrendType
  dailySession: DailySessionRetentionConfig
  push: PushRetentionConfig
}
