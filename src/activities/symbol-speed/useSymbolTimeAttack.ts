import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type { SymbolKey, SymbolSpeedRound } from './symbolSpeedEngine'
import { buildSymbolRound } from './symbolSpeedEngine'

interface State {
  timeLeft: number
  score: number
  locked: boolean
  selectedIndex: number | null
  lastCorrect: boolean | null
  finished: boolean
}

type Action =
  | { type: 'tick' }
  | { type: 'select'; index: number; isCorrect: boolean }
  | { type: 'unlock' }
  | { type: 'finish' }
  | { type: 'restart'; totalSeconds: number }

function makeInitial(totalSeconds: number): State {
  return {
    timeLeft: totalSeconds,
    score: 0,
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
      }
    case 'unlock':
      return { ...state, locked: false, selectedIndex: null, lastCorrect: null }
    case 'finish':
      return { ...state, finished: true }
    case 'restart':
      return makeInitial(action.totalSeconds)
  }
}

export interface SymbolTimeAttack {
  current: SymbolSpeedRound
  timeLeft: number
  score: number
  locked: boolean
  selectedIndex: number | null
  lastCorrect: boolean | null
  finished: boolean
  select: (index: number) => void
  restart: () => void
}

export function useSymbolTimeAttack(
  table: SymbolKey[],
  totalSeconds: number,
  lockMs = 450,
): SymbolTimeAttack {
  const [state, dispatch] = useReducer(reducer, totalSeconds, makeInitial)
  const [round, setRound] = useState(() => buildSymbolRound(table))

  const tableRef = useRef(table)
  useEffect(() => {
    tableRef.current = table
  })

  // Countdown
  useEffect(() => {
    if (state.finished) return
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => clearInterval(id)
  }, [state.finished])

  // Finish cuando timeLeft llega a 0
  useEffect(() => {
    if (state.timeLeft <= 0 && !state.finished) {
      dispatch({ type: 'finish' })
    }
  }, [state.timeLeft, state.finished])

  // Desbloquear y generar nueva ronda tras pausa
  useEffect(() => {
    if (!state.locked || state.finished) return
    const id = setTimeout(() => {
      dispatch({ type: 'unlock' })
      setRound(buildSymbolRound(tableRef.current))
    }, lockMs)
    return () => clearTimeout(id)
  }, [state.locked, state.finished, lockMs])

  const select = useCallback(
    (index: number) => {
      if (state.locked || state.finished) return
      dispatch({ type: 'select', index, isCorrect: index === round.correctIndex })
    },
    [state.locked, state.finished, round.correctIndex],
  )

  const restart = useCallback(
    () => dispatch({ type: 'restart', totalSeconds }),
    [totalSeconds],
  )

  return {
    current: round,
    timeLeft: state.timeLeft,
    score: state.score,
    locked: state.locked,
    selectedIndex: state.selectedIndex,
    lastCorrect: state.lastCorrect,
    finished: state.finished,
    select,
    restart,
  }
}
