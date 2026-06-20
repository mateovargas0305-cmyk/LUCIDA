import { db, type SessionRecord } from './db'
import type { ActivityId, ModeId } from '../modes/types'

/** Día local en formato YYYY-MM-DD. */
function localDay(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export interface NewSession {
  activity: ActivityId
  mode: ModeId
  correct: number
  total: number
  score: number
  durationMs?: number
}

/** Guarda una sesión terminada. */
export async function recordSession(s: NewSession): Promise<void> {
  const now = new Date()
  await db.sessions.add({
    ...s,
    durationMs: s.durationMs ?? null,
    finishedAt: now.toISOString(),
    day: localDay(now),
  } as SessionRecord)
}

/** Mejor tiempo en ms para memoria con N parejas en el modo dado. Null si no hay historial. */
export async function getBestMemoryTime(
  mode: ModeId,
  pairs: number,
): Promise<number | null> {
  const sessions = await db.sessions
    .where('activity')
    .equals('memory')
    .and((s) => s.mode === mode && s.total === pairs && s.durationMs !== null)
    .toArray()
  if (sessions.length === 0) return null
  return sessions.reduce(
    (best, s) => Math.min(best, s.durationMs!),
    Infinity,
  )
}

/** Mejor puntaje de aciertos en atención time-attack para el modo dado. */
export async function getBestAttentionScore(mode: ModeId): Promise<number | null> {
  const sessions = await db.sessions
    .where('activity')
    .equals('attention')
    .and((s) => s.mode === mode)
    .toArray()
  if (sessions.length === 0) return null
  return sessions.reduce((best, s) => Math.max(best, s.correct), 0)
}

/** Mejor puntaje de aciertos en symbol speed time-attack, para la duración dada. */
export async function getBestSymbolSpeedScore(
  mode: ModeId,
  durationSeconds: number,
): Promise<number | null> {
  const sessions = await db.sessions
    .where('activity')
    .equals('symbolSpeed')
    .and((s) => s.mode === mode && s.total === durationSeconds)
    .toArray()
  if (sessions.length === 0) return null
  return sessions.reduce((best, s) => Math.max(best, s.correct), 0)
}

export interface OverallStats {
  totalSessions: number
  totalCorrect: number
  totalAnswered: number
  bestScore: number
  /** Días consecutivos (hasta hoy o ayer) con al menos una sesión. */
  streakDays: number
}

/** Racha de días consecutivos terminando hoy o ayer. */
function computeStreak(days: Set<string>): number {
  if (days.size === 0) return 0
  const cursor = new Date()
  const has = (d: Date) => days.has(localDay(d))

  if (!has(cursor)) {
    cursor.setDate(cursor.getDate() - 1)
    if (!has(cursor)) return 0
  }
  let streak = 0
  while (has(cursor)) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export async function getOverallStats(): Promise<OverallStats> {
  const all = await db.sessions.toArray()
  const days = new Set(all.map((s) => s.day))
  return {
    totalSessions: all.length,
    totalCorrect: all.reduce((n, s) => n + s.correct, 0),
    totalAnswered: all.reduce((n, s) => n + s.total, 0),
    bestScore: all.reduce((m, s) => Math.max(m, s.score), 0),
    streakDays: computeStreak(days),
  }
}

export async function clearHistory(): Promise<void> {
  await db.sessions.clear()
}
