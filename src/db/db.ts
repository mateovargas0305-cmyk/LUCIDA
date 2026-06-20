import Dexie, { type EntityTable } from 'dexie'
import type { ActivityId, ModeId } from '../modes/types'

/** Una sesión completada de cualquier actividad. */
export interface SessionRecord {
  id: number
  activity: ActivityId
  mode: ModeId
  correct: number
  total: number
  score: number
  /** Fecha ISO (YYYY-MM-DD…T…) del cierre de la sesión. */
  finishedAt: string
  /** Día local (YYYY-MM-DD) para calcular racha sin líos de zona horaria. */
  day: string
  /** Duración en ms (para memoria: tiempo total; otros: null). */
  durationMs: number | null
}

/**
 * Base local-first. Sin backend, sin nube: todo vive en IndexedDB del
 * dispositivo. Las preferencias que hacen falta antes del primer render
 * (tema, modo, escala de texto) viven en localStorage para evitar parpadeos;
 * acá guardamos el historial, que se lee de forma asíncrona.
 */
const db = new Dexie('lucida') as Dexie & {
  sessions: EntityTable<SessionRecord, 'id'>
}

db.version(1).stores({
  sessions: '++id, activity, mode, day, finishedAt',
})

// Versión 2: agrega durationMs (campo nullable, no requiere migración de datos).
db.version(2).stores({
  sessions: '++id, activity, mode, day, finishedAt',
})

export { db }
