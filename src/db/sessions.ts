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
}

/** Guarda una sesión terminada. */
export async function recordSession(s: NewSession): Promise<void> {
  const now = new Date()
  await db.sessions.add({
    ...s,
    finishedAt: now.toISOString(),
    day: localDay(now),
  } as SessionRecord)
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

  // La racha sigue viva si hubo actividad hoy o ayer.
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
