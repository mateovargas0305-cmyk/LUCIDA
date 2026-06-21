import { useEffect, useState } from 'react'
import { getProgressHistory, getOverallStats, type DailyProgress } from '../db/sessions'

export interface WeekSummary {
  sessions: number
  daysActive: number
  totalScore: number
}

function summarize(days: DailyProgress[]): WeekSummary {
  return {
    sessions: days.reduce((n, d) => n + d.sessions, 0),
    daysActive: days.filter((d) => d.sessions > 0).length,
    totalScore: days.reduce((n, d) => n + d.totalScore, 0),
  }
}

export interface ProgressData {
  /** 28 días, oldest-first. Índice 27 = hoy. */
  daily28: DailyProgress[]
  thisWeek: WeekSummary    // daily28[21–27]
  lastWeek: WeekSummary    // daily28[14–20]
  allTimeBest: number
  totalSessions: number
  loading: boolean
}

const EMPTY: ProgressData = {
  daily28: [],
  thisWeek: { sessions: 0, daysActive: 0, totalScore: 0 },
  lastWeek: { sessions: 0, daysActive: 0, totalScore: 0 },
  allTimeBest: 0,
  totalSessions: 0,
  loading: true,
}

export function useProgressData(): ProgressData {
  const [data, setData] = useState<ProgressData>(EMPTY)

  useEffect(() => {
    let alive = true
    void Promise.all([getProgressHistory(28), getOverallStats()]).then(
      ([daily28, stats]) => {
        if (!alive) return
        setData({
          daily28,
          thisWeek: summarize(daily28.slice(21)),
          lastWeek: summarize(daily28.slice(14, 21)),
          allTimeBest: stats.bestScore,
          totalSessions: stats.totalSessions,
          loading: false,
        })
      },
    )
    return () => { alive = false }
  }, [])

  return data
}
