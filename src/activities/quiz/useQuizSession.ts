import { useMemo, useReducer } from 'react'
import type { ModeConfig } from '../../modes/types'
import { buildQuizSession, type PreparedQuestion } from './quizEngine'

export interface QuizSessionState {
  questions: PreparedQuestion[]
  index: number
  /** Opción elegida en la pregunta actual (null si aún no respondió). */
  selected: number | null
  /** La respuesta quedó fija (revela la correcta, habilita "Siguiente"). */
  locked: boolean
  /** Último toque fue incorrecto y se permite reintentar (Calmo). */
  retryHint: boolean
  correctCount: number
  score: number
  finished: boolean
}

type Action =
  | { type: 'select'; index: number }
  | { type: 'next' }
  | { type: 'restart'; questions: PreparedQuestion[] }

interface Rules {
  retryOnError: boolean
  pointsPerCorrect: number
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
          // Calmo: reorientar sin bloquear ni penalizar; puede reintentar.
          return { ...state, retryHint: true }
        }

        return {
          ...state,
          selected: action.index,
          locked: true,
          retryHint: false,
          correctCount: state.correctCount + (isCorrect ? 1 : 0),
          score: state.score + (isCorrect ? rules.pointsPerCorrect : 0),
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
          retryHint: false,
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
    retryHint: false,
    correctCount: 0,
    score: 0,
    finished: false,
  }
}

export interface QuizSession extends QuizSessionState {
  current: PreparedQuestion
  total: number
  select: (index: number) => void
  next: () => void
  restart: () => void
}

/** Maneja una sesión de quiz completa según el modo. */
export function useQuizSession(config: ModeConfig): QuizSession {
  const rules: Rules = {
    retryOnError: config.activities.quiz.retryOnError,
    pointsPerCorrect: config.scoring.enabled
      ? config.scoring.pointsPerCorrect
      : 0,
  }

  const reducer = useMemo(
    () => makeReducer(rules),
    // Reglas estables por modo; se reconstruye sólo si cambian.
    [rules.retryOnError, rules.pointsPerCorrect], // eslint-disable-line react-hooks/exhaustive-deps
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
    select: (index) => dispatch({ type: 'select', index }),
    next: () => dispatch({ type: 'next' }),
    restart: () =>
      dispatch({
        type: 'restart',
        questions: buildQuizSession(config.activities.quiz),
      }),
  }
}
