import { db, type SessionRecord } from './db'
import type { ActivityId, ModeId } from '../modes/types'

export interface DailyProgress {
  day: string
  sessions: number
  maxScore: number
  totalScore: number
  activities: ActivityId[]
}

/** Día local en formato YYYY-MM-DD. */
export function localDay(date = new Date()): string {
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

/**
 * Para cada actividad del array, devuelve el mejor puntaje histórico
 * del usuario en ese modo. Hace un solo recorrido de la tabla.
 */
export async function getBestScoreForActivities(
  activityIds: ActivityId[],
  mode: ModeId,
): Promise<Record<ActivityId, number>> {
  const all = await db.sessions
    .where('mode')
    .equals(mode)
    .toArray()

  return Object.fromEntries(
    activityIds.map((id) => [
      id,
      all.filter((s) => s.activity === id).reduce((m, s) => Math.max(m, s.score), 0),
    ]),
  ) as Record<ActivityId, number>
}

export async function clearHistory(): Promise<void> {
  await db.sessions.clear()
}

/** Actividades con al menos una sesión terminada hoy. */
export async function getActivitiesDoneToday(): Promise<Set<ActivityId>> {
  const today = localDay()
  const sessions = await db.sessions.where('day').equals(today).toArray()
  return new Set(sessions.map((s) => s.activity))
}

/** Mayor racha histórica (en días) del usuario. */
export async function getLongestStreak(): Promise<number> {
  const all = await db.sessions.toArray()
  const unique = [...new Set(all.map((s) => s.day))].sort()
  if (unique.length === 0) return 0
  let max = 1
  let run = 1
  for (let i = 1; i < unique.length; i++) {
    const a = new Date(unique[i - 1] + 'T12:00:00')
    const b = new Date(unique[i] + 'T12:00:00')
    const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000)
    if (diff === 1) {
      if (++run > max) max = run
    } else {
      run = 1
    }
  }
  return max
}

/**
 * Para cada uno de los últimos `n` días (de más antiguo a hoy),
 * devuelve true si el usuario jugó ese día, false si no.
 * El último elemento siempre corresponde a hoy.
 */
/**
 * Retorna un array de `days` entradas (oldest first, última = hoy) con
 * datos agregados por día: sesiones, puntaje máximo, puntaje total y actividades.
 */
export async function getProgressHistory(days: number): Promise<DailyProgress[]> {
  const all = await db.sessions.toArray()
  const today = new Date()
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (days - 1 - i))
    const dayStr = localDay(d)
    const daySessions = all.filter((s) => s.day === dayStr)
    return {
      day: dayStr,
      sessions: daySessions.length,
      maxScore: daySessions.reduce((m, s) => Math.max(m, s.score), 0),
      totalScore: daySessions.reduce((sum, s) => sum + s.score, 0),
      activities: [...new Set(daySessions.map((s) => s.activity))],
    }
  })
}

export async function getRecentDaysPlayed(n: number): Promise<boolean[]> {
  const all = await db.sessions.toArray()
  const days = new Set(all.map((s) => s.day))
  const today = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (n - 1 - i))
    return days.has(localDay(d))
  })
}
