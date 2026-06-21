import { useCallback, useEffect, useReducer, useRef } from 'react'

export interface RafagaOptions<T extends { correctIndex: number }> {
  buildPool: () => T[]
  totalSeconds: number
  lockMs?: number
  pointsPerCorrect?: number
}

export interface RafagaSession<T extends { correctIndex: number }> {
  round: T
  timeLeft: number
  score: number
  correct: number
  total: number
  locked: boolean
  selectedIndex: number | null
  lastCorrect: boolean | null
  finished: boolean
  select: (index: number) => void
  restart: () => void
}

interface State {
  phase: 'playing' | 'locked' | 'finished'
  currentIndex: number
  timeLeft: number
  score: number
  correct: number
  total: number
  selectedIndex: number | null
  lastCorrect: boolean | null
}

type Action =
  | { type: 'tick' }
  | { type: 'select'; selectedIndex: number; isCorrect: boolean; points: number }
  | { type: 'unlock' }
  | { type: 'restart'; totalSeconds: number }

function makeInitial(totalSeconds: number): State {
  return {
    phase: 'playing',
    currentIndex: 0,
    timeLeft: totalSeconds,
    score: 0,
    correct: 0,
    total: 0,
    selectedIndex: null,
    lastCorrect: null,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'tick':
      if (state.phase !== 'playing') return state
      if (state.timeLeft <= 1) return { ...state, timeLeft: 0, phase: 'finished' }
      return { ...state, timeLeft: state.timeLeft - 1 }
    case 'select':
      if (state.phase !== 'playing') return state
      return {
        ...state,
        phase: 'locked',
        selectedIndex: action.selectedIndex,
        lastCorrect: action.isCorrect,
        score: state.score + action.points,
        correct: state.correct + (action.isCorrect ? 1 : 0),
        total: state.total + 1,
      }
    case 'unlock':
      if (state.phase !== 'locked') return state
      return {
        ...state,
        phase: 'playing',
        currentIndex: state.currentIndex + 1,
        selectedIndex: null,
        lastCorrect: null,
      }
    case 'restart':
      return makeInitial(action.totalSeconds)
  }
}

export function useRafagaSession<T extends { correctIndex: number }>(
  opts: RafagaOptions<T>,
): RafagaSession<T> {
  const buildPoolRef = useRef(opts.buildPool)
  buildPoolRef.current = opts.buildPool

  const totalSecondsRef = useRef(opts.totalSeconds)
  totalSecondsRef.current = opts.totalSeconds

  const poolRef = useRef<T[] | null>(null)
  if (poolRef.current === null) {
    poolRef.current = opts.buildPool()
  }

  const [state, dispatch] = useReducer(reducer, opts.totalSeconds, makeInitial)

  useEffect(() => {
    if (state.phase !== 'playing') return
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => clearInterval(id)
  }, [state.phase])

  const lockMs = opts.lockMs ?? 600
  useEffect(() => {
    if (state.phase !== 'locked') return
    const id = setTimeout(() => dispatch({ type: 'unlock' }), lockMs)
    return () => clearTimeout(id)
  }, [state.phase, lockMs])

  const select = useCallback(
    (index: number) => {
      if (state.phase !== 'playing') return
      const pool = poolRef.current!
      const round = pool[state.currentIndex % pool.length]
      const isCorrect = index === round.correctIndex
      const points = isCorrect ? (opts.pointsPerCorrect ?? 1) : 0
      dispatch({ type: 'select', selectedIndex: index, isCorrect, points })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.phase, state.currentIndex],
  )

  const restart = useCallback(() => {
    poolRef.current = buildPoolRef.current()
    dispatch({ type: 'restart', totalSeconds: totalSecondsRef.current })
  }, [])

  const pool = poolRef.current!
  const round = pool[state.currentIndex % pool.length]

  return {
    round,
    timeLeft: state.timeLeft,
    score: state.score,
    correct: state.correct,
    total: state.total,
    locked: state.phase === 'locked',
    selectedIndex: state.selectedIndex,
    lastCorrect: state.lastCorrect,
    finished: state.phase === 'finished',
    select,
    restart,
  }
}
