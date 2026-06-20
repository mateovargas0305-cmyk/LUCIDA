import { useMemo, useReducer } from 'react'
import type { ModeConfig } from '../../modes/types'
import { buildQuizSession, type PreparedQuestion } from './quizEngine'

export interface QuizSessionState {
  questions: PreparedQuestion[]
  index: number
  selected: number | null
  locked: boolean
  /** La pregunta se bloqueó por tiempo (sin respuesta del usuario). */
  timedOut: boolean
  retryHint: boolean
  correctCount: number
  score: number
  finished: boolean
  currentStreak: number
  lastBonus: number | null
}

type Action =
  | { type: 'select'; index: number; speedBonus: number }
  | { type: 'next' }
  | { type: 'timeout' }
  | { type: 'restart'; questions: PreparedQuestion[] }

interface Rules {
  retryOnError: boolean
  pointsPerCorrect: number
  streakBonusEnabled: boolean
  streakBonusThreshold: number
  streakBonusPoints: number
}

function makeReducer(rules: Rules) {
  return function reducer(
    state: QuizSessionState,
    action: Action,
  ): QuizSessionState {
    switch (action.type) {
      case 'select': {
        if (state.finished || state.locked) return state
        const q = state.questions[state.index]
        const isCorrect = action.index === q.correctIndex

        if (rules.retryOnError && !isCorrect) {
          return { ...state, retryHint: true }
        }

        const newStreak = isCorrect ? state.currentStreak + 1 : 0
        const streakBonus =
          rules.streakBonusEnabled &&
          isCorrect &&
          newStreak >= rules.streakBonusThreshold
            ? rules.streakBonusPoints
            : 0
        const totalBonus = isCorrect ? action.speedBonus + streakBonus : 0

        return {
          ...state,
          selected: action.index,
          locked: true,
          timedOut: false,
          retryHint: false,
          currentStreak: newStreak,
          correctCount: state.correctCount + (isCorrect ? 1 : 0),
          score: state.score + (isCorrect ? rules.pointsPerCorrect + totalBonus : 0),
          lastBonus: totalBonus > 0 ? totalBonus : null,
        }
      }
      case 'timeout': {
        if (state.finished || state.locked) return state
        return {
          ...state,
          selected: null,
          locked: true,
          timedOut: true,
          retryHint: false,
          currentStreak: 0,
          lastBonus: null,
        }
      }
      case 'next': {
        const isLast = state.index >= state.questions.length - 1
        if (isLast) return { ...state, finished: true }
        return {
          ...state,
          index: state.index + 1,
          selected: null,
          locked: false,
          timedOut: false,
          retryHint: false,
          lastBonus: null,
        }
      }
      case 'restart':
        return initState(action.questions)
    }
  }
}

function initState(questions: PreparedQuestion[]): QuizSessionState {
  return {
    questions,
    index: 0,
    selected: null,
    locked: false,
    timedOut: false,
    retryHint: false,
    correctCount: 0,
    score: 0,
    finished: false,
    currentStreak: 0,
    lastBonus: null,
  }
}

export interface QuizSession extends QuizSessionState {
  current: PreparedQuestion
  total: number
  select: (index: number, speedBonus?: number) => void
  next: () => void
  timeout: () => void
  restart: () => void
}

export function useQuizSession(config: ModeConfig): QuizSession {
  const rules: Rules = {
    retryOnError: config.activities.quiz.retryOnError,
    pointsPerCorrect: config.scoring.enabled
      ? config.scoring.pointsPerCorrect
      : 0,
    streakBonusEnabled: config.scoring.streakBonusEnabled,
    streakBonusThreshold: config.scoring.streakBonusThreshold,
    streakBonusPoints: config.scoring.streakBonusPoints,
  }

  const reducer = useMemo(
    () => makeReducer(rules),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      rules.retryOnError,
      rules.pointsPerCorrect,
      rules.streakBonusEnabled,
      rules.streakBonusThreshold,
      rules.streakBonusPoints,
    ],
  )

  const [state, dispatch] = useReducer(
    reducer,
    config,
    (cfg) => initState(buildQuizSession(cfg.activities.quiz)),
  )

  return {
    ...state,
    current: state.questions[state.index],
    total: state.questions.length,
    select: (index, speedBonus = 0) =>
      dispatch({ type: 'select', index, speedBonus }),
    next: () => dispatch({ type: 'next' }),
    timeout: () => dispatch({ type: 'timeout' }),
    restart: () =>
      dispatch({
        type: 'restart',
        questions: buildQuizSession(config.activities.quiz),
      }),
  }
}
