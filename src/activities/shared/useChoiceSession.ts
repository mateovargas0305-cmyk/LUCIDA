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
  /** La pregunta se bloqueó por tiempo (sin respuesta del usuario). */
  timedOut: boolean
  retryHint: boolean
  correctCount: number
  score: number
  finished: boolean
  /** Aciertos consecutivos actuales. */
  currentStreak: number
  /** Puntos de bonus ganados en la última respuesta correcta (null = ninguno). */
  lastBonus: number | null
}

type Action<T extends ChoiceRound> =
  | { type: 'select'; index: number; speedBonus: number }
  | { type: 'next' }
  | { type: 'timeout' }
  | { type: 'restart'; rounds: T[] }

interface Rules {
  retryOnError: boolean
  pointsPerCorrect: number
  streakBonusEnabled: boolean
  streakBonusThreshold: number
  streakBonusPoints: number
}

function init<T extends ChoiceRound>(rounds: T[]): ChoiceSessionState<T> {
  return {
    rounds,
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
        const isLast = state.index >= state.rounds.length - 1
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
        return init(action.rounds)
    }
  }
}

export interface ChoiceSession<T extends ChoiceRound>
  extends ChoiceSessionState<T> {
  current: T
  total: number
  select: (index: number, speedBonus?: number) => void
  next: () => void
  timeout: () => void
  restart: () => void
}

interface Options<T extends ChoiceRound> {
  build: () => T[]
  retryOnError: boolean
  pointsPerCorrect: number
  streakBonusEnabled: boolean
  streakBonusThreshold: number
  streakBonusPoints: number
}

/**
 * Sesión genérica de rondas con opciones. La comparten Cálculo y Atención;
 * el feedback de error, el puntaje y los bonuses salen de la config del modo.
 */
export function useChoiceSession<T extends ChoiceRound>(
  opts: Options<T>,
): ChoiceSession<T> {
  const reducer = useMemo(
    () =>
      makeReducer<T>({
        retryOnError: opts.retryOnError,
        pointsPerCorrect: opts.pointsPerCorrect,
        streakBonusEnabled: opts.streakBonusEnabled,
        streakBonusThreshold: opts.streakBonusThreshold,
        streakBonusPoints: opts.streakBonusPoints,
      }),
    [
      opts.retryOnError,
      opts.pointsPerCorrect,
      opts.streakBonusEnabled,
      opts.streakBonusThreshold,
      opts.streakBonusPoints,
    ],
  )

  const [state, dispatch] = useReducer(reducer, undefined, () =>
    init(opts.build()),
  )

  return {
    ...state,
    current: state.rounds[state.index],
    total: state.rounds.length,
    select: (index, speedBonus = 0) =>
      dispatch({ type: 'select', index, speedBonus }),
    next: () => dispatch({ type: 'next' }),
    timeout: () => dispatch({ type: 'timeout' }),
    restart: () => dispatch({ type: 'restart', rounds: opts.build() }),
  }
}
