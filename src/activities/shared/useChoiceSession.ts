import { useMemo, useReducer } from 'react'

/** Cualquier ronda con opciones y un índice correcto. */
export interface ChoiceRound {
  correctIndex: number
}

export interface ChoiceSessionState<T extends ChoiceRound> {
  rounds: T[]
  index: number
  selected: number | null
  locked: boolean
  retryHint: boolean
  correctCount: number
  score: number
  finished: boolean
}

type Action<T extends ChoiceRound> =
  | { type: 'select'; index: number }
  | { type: 'next' }
  | { type: 'restart'; rounds: T[] }

interface Rules {
  retryOnError: boolean
  pointsPerCorrect: number
}

function init<T extends ChoiceRound>(rounds: T[]): ChoiceSessionState<T> {
  return {
    rounds,
    index: 0,
    selected: null,
    locked: false,
    retryHint: false,
    correctCount: 0,
    score: 0,
    finished: false,
  }
}

function makeReducer<T extends ChoiceRound>(rules: Rules) {
  return (
    state: ChoiceSessionState<T>,
    action: Action<T>,
  ): ChoiceSessionState<T> => {
    switch (action.type) {
      case 'select': {
        if (state.finished || state.locked) return state
        const isCorrect = action.index === state.rounds[state.index].correctIndex
        if (rules.retryOnError && !isCorrect) {
          return { ...state, retryHint: true } // reorientar sin bloquear
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
        const isLast = state.index >= state.rounds.length - 1
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
        return init(action.rounds)
    }
  }
}

export interface ChoiceSession<T extends ChoiceRound>
  extends ChoiceSessionState<T> {
  current: T
  total: number
  select: (index: number) => void
  next: () => void
  restart: () => void
}

interface Options<T extends ChoiceRound> {
  /** Genera una tanda de rondas (se llama al iniciar y al reiniciar). */
  build: () => T[]
  retryOnError: boolean
  pointsPerCorrect: number
}

/**
 * Sesión genérica de rondas con opciones. La comparten Cálculo y Atención;
 * el feedback de error y el puntaje salen de la config del modo.
 */
export function useChoiceSession<T extends ChoiceRound>(
  opts: Options<T>,
): ChoiceSession<T> {
  const reducer = useMemo(
    () => makeReducer<T>({
      retryOnError: opts.retryOnError,
      pointsPerCorrect: opts.pointsPerCorrect,
    }),
    [opts.retryOnError, opts.pointsPerCorrect],
  )

  const [state, dispatch] = useReducer(reducer, undefined, () =>
    init(opts.build()),
  )

  return {
    ...state,
    current: state.rounds[state.index],
    total: state.rounds.length,
    select: (index) => dispatch({ type: 'select', index }),
    next: () => dispatch({ type: 'next' }),
    restart: () => dispatch({ type: 'restart', rounds: opts.build() }),
  }
}
