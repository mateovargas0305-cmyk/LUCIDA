import { useEffect, useState } from 'react'
import { getOverallStats, getLongestStreak, getRecentDaysPlayed } from '../db/sessions'

export interface StreakData {
  streakDays: number
  longestStreak: number
  playedToday: boolean
  /** Últimos 7 días: índice 0 = hace 6 días, índice 6 = hoy. */
  recentWeek: boolean[]
  loading: boolean
}

const EMPTY: StreakData = {
  streakDays: 0,
  longestStreak: 0,
  playedToday: false,
  recentWeek: Array<boolean>(7).fill(false),
  loading: true,
}

/**
 * Carga los datos de racha desde IndexedDB.
 * `refreshKey` puede cambiarse para forzar una recarga (útil en SessionSummary
 * después de que `recordSession` haya terminado de escribir).
 */
export function useStreak(refreshKey: unknown = null): StreakData {
  const [data, setData] = useState<StreakData>(EMPTY)

  useEffect(() => {
    let alive = true
    setData((prev) => ({ ...prev, loading: true }))

    void Promise.all([
      getOverallStats(),
      getLongestStreak(),
      getRecentDaysPlayed(7),
    ]).then(([stats, longest, week]) => {
      if (!alive) return
      setData({
        streakDays: stats.streakDays,
        longestStreak: longest,
        playedToday: week[6],
        recentWeek: week,
        loading: false,
      })
    })

    return () => {
      alive = false
    }
  }, [refreshKey])

  return data
}
