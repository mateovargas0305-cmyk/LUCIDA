import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type { AttentionRound } from './attentionEngine'

interface State {
  timeLeft: number
  score: number
  currentStreak: number
  locked: boolean
  selectedIndex: number | null
  lastCorrect: boolean | null
  finished: boolean
}

type Action =
  | { type: 'tick' }
  | { type: 'select'; index: number; isCorrect: boolean; newStreak: number }
  | { type: 'unlock' }
  | { type: 'finish' }
  | { type: 'restart'; totalSeconds: number }

function makeInitial(totalSeconds: number): State {
  return {
    timeLeft: totalSeconds,
    score: 0,
    currentStreak: 0,
    locked: false,
    selectedIndex: null,
    lastCorrect: null,
    finished: false,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'tick':
      if (state.finished) return state
      return { ...state, timeLeft: Math.max(0, state.timeLeft - 1) }
    case 'select':
      if (state.locked || state.finished) return state
      return {
        ...state,
        locked: true,
        selectedIndex: action.index,
        lastCorrect: action.isCorrect,
        score: state.score + (action.isCorrect ? 1 : 0),
        currentStreak: action.newStreak,
      }
    case 'unlock':
      return { ...state, locked: false, selectedIndex: null, lastCorrect: null }
    case 'finish':
      return { ...state, finished: true }
    case 'restart':
      return makeInitial(action.totalSeconds)
  }
}

export interface TimeAttackSession {
  current: AttentionRound
  timeLeft: number
  score: number
  currentStreak: number
  locked: boolean
  selectedIndex: number | null
  lastCorrect: boolean | null
  finished: boolean
  select: (index: number) => void
  restart: () => void
}

interface Options {
  buildRound: (difficulty: number) => AttentionRound
  totalSeconds: number
  difficultyStep: number
  lockMs?: number
}

export function useTimeAttackSession(opts: Options): TimeAttackSession {
  const { totalSeconds, difficultyStep, lockMs = 450 } = opts

  const [state, dispatch] = useReducer(reducer, totalSeconds, makeInitial)
  const [round, setRound] = useState(() => opts.buildRound(0))

  const difficultyRef = useRef(0)
  const buildRoundRef = useRef(opts.buildRound)
  useEffect(() => {
    buildRoundRef.current = opts.buildRound
  })

  // Countdown tick
  useEffect(() => {
    if (state.finished) return
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => clearInterval(id)
  }, [state.finished])

  // Terminar cuando llega a 0
  useEffect(() => {
    if (state.timeLeft <= 0 && !state.finished) {
      dispatch({ type: 'finish' })
    }
  }, [state.timeLeft, state.finished])

  // Desbloquear tras pausa y generar nueva ronda
  useEffect(() => {
    if (!state.locked || state.finished) return
    const id = setTimeout(() => {
      dispatch({ type: 'unlock' })
      setRound(buildRoundRef.current(difficultyRef.current))
    }, lockMs)
    return () => clearTimeout(id)
  }, [state.locked, state.finished, lockMs])

  const select = useCallback(
    (index: number) => {
      if (state.locked || state.finished) return
      const isCorrect = index === round.correctIndex
      const newStreak = isCorrect ? state.currentStreak + 1 : 0

      const newDiff = isCorrect
        ? Math.min(1, difficultyRef.current + difficultyStep)
        : Math.max(0, difficultyRef.current - difficultyStep * 0.5)
      difficultyRef.current = newDiff

      dispatch({ type: 'select', index, isCorrect, newStreak })
    },
    [state.locked, state.finished, state.currentStreak, round.correctIndex, difficultyStep],
  )

  const restart = useCallback(() => {
    difficultyRef.current = 0
    setRound(buildRoundRef.current(0))
    dispatch({ type: 'restart', totalSeconds })
  }, [totalSeconds])

  return {
    current: round,
    timeLeft: state.timeLeft,
    score: state.score,
    currentStreak: state.currentStreak,
    locked: state.locked,
    selectedIndex: state.selectedIndex,
    lastCorrect: state.lastCorrect,
    finished: state.finished,
    select,
    restart,
  }
}
