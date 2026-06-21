import type { ActivityId } from '../modes/types'
import { localDay } from '../db/sessions'

const ALL_ACTIVITIES: readonly ActivityId[] = [
  'quiz',
  'calc',
  'memory',
  'attention',
  'sequence',
  'chainedCalc',
  'stroop',
  'symbolSpeed',
]

/** Días transcurridos desde el 1 Jan 2024. Da un entero estable por día. */
function dayIndex(day: string): number {
  const EPOCH = new Date('2024-01-01T12:00:00').getTime()
  return Math.floor((new Date(day + 'T12:00:00').getTime() - EPOCH) / 86_400_000)
}

/** LCG rápido (Numerical Recipes). Transforma un seed en el siguiente. */
function lcg(s: number): number {
  return ((s * 1664525 + 1013904223) >>> 0)
}

/** Shuffle de Knuth determinístico a partir de un seed. */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = lcg(s)
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Devuelve `count` actividades para el día indicado (por defecto: hoy).
 * El resultado es siempre el mismo para el mismo día y cambia cada 24h.
 */
export function getDailyActivities(count: number, day = localDay()): ActivityId[] {
  const seed = dayIndex(day)
  return seededShuffle([...ALL_ACTIVITIES], seed).slice(0, count)
}
