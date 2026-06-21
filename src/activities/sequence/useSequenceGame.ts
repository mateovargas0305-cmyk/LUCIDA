import { useCallback, useEffect, useReducer } from 'react'
import type { SequenceActivityConfig } from '../../modes/types'
import { buildSequence, type SequenceColorId } from './sequenceEngine'
import { playSequenceTap, playCorrect, playError } from '../../lib/audioManager'

export type SequencePhase =
  | 'intro'    // esperando que el usuario empiece
  | 'playing'  // reproduciendo la secuencia
  | 'input'    // esperando la entrada del usuario
  | 'success'  // acierto, breve pausa antes de la siguiente ronda
  | 'error'    // error (Calmo: reintento; otros: fin de sesión)
  | 'done'     // sesión terminada

interface State {
  phase: SequencePhase
  sequence: SequenceColorId[]
  userInput: SequenceColorId[]
  /** Índice del botón iluminado durante la reproducción. null = ninguno. */
  highlightIndex: number | null
  length: number
  roundsWon: number
  score: number
}

type Action =
  | { type: 'start_playback' }
  | { type: 'set_highlight'; index: number | null }
  | { type: 'begin_input' }
  | { type: 'tap'; color: SequenceColorId; pointsPerCorrect: number }
  | { type: 'next_round'; cfg: SequenceActivityConfig }
  | { type: 'error' }
  | { type: 'retry' }
  | { type: 'done' }
  | { type: 'restart'; cfg: SequenceActivityConfig }

function makeInitial(cfg: SequenceActivityConfig): State {
  return {
    phase: 'intro',
    sequence: buildSequence(cfg.colorCount, cfg.startLength),
    userInput: [],
    highlightIndex: null,
    length: cfg.startLength,
    roundsWon: 0,
    score: 0,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'start_playback':
      return { ...state, phase: 'playing', userInput: [], highlightIndex: null }
    case 'set_highlight':
      return { ...state, highlightIndex: action.index }
    case 'begin_input':
      return { ...state, phase: 'input', highlightIndex: null }
    case 'tap': {
      if (state.phase !== 'input') return state
      const expected = state.sequence[state.userInput.length]
      if (action.color !== expected) return state // handled in component
      const newInput = [...state.userInput, action.color]
      const complete = newInput.length === state.sequence.length
      if (!complete) return { ...state, userInput: newInput }
      // Round complete
      return {
        ...state,
        userInput: newInput,
        phase: 'success',
        roundsWon: state.roundsWon + 1,
        score: state.score + state.length * action.pointsPerCorrect,
      }
    }
    case 'next_round': {
      const newLength = state.length + 1
      return {
        ...state,
        phase: 'playing',
        length: newLength,
        sequence: buildSequence(action.cfg.colorCount, newLength),
        userInput: [],
        highlightIndex: null,
      }
    }
    case 'error':
      return { ...state, phase: 'error', highlightIndex: null }
    case 'retry':
      return { ...state, phase: 'playing', userInput: [], highlightIndex: null }
    case 'done':
      return { ...state, phase: 'done' }
    case 'restart':
      return makeInitial(action.cfg)
  }
}

export interface SequenceGame {
  phase: SequencePhase
  sequence: SequenceColorId[]
  userInput: SequenceColorId[]
  highlightIndex: number | null
  length: number
  roundsWon: number
  score: number
  /** Cuántos botones de la secuencia actual ya se ingresaron correctamente. */
  inputProgress: number
  start: () => void
  tap: (color: SequenceColorId) => void
  restart: () => void
}

export function useSequenceGame(
  cfg: SequenceActivityConfig,
  pointsPerCorrect: number,
): SequenceGame {
  const [state, dispatch] = useReducer(reducer, cfg, makeInitial)

  // Reproducir la secuencia cuando la fase es 'playing'.
  useEffect(() => {
    if (state.phase !== 'playing') return
    let cancelled = false

    function showStep(i: number) {
      if (cancelled) return
      if (i >= state.sequence.length) {
        dispatch({ type: 'begin_input' })
        return
      }
      dispatch({ type: 'set_highlight', index: i })
      playSequenceTap(state.sequence[i])
      setTimeout(() => {
        if (cancelled) return
        dispatch({ type: 'set_highlight', index: null })
        setTimeout(() => showStep(i + 1), cfg.pauseBetweenMs)
      }, cfg.playbackSpeedMs)
    }

    const t = setTimeout(() => showStep(0), 600)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [state.phase, state.sequence, cfg.playbackSpeedMs, cfg.pauseBetweenMs])

  // Auto-avance tras acierto: pausa breve y arranca siguiente ronda o termina.
  useEffect(() => {
    if (state.phase !== 'success') return
    const t = setTimeout(() => {
      if (state.roundsWon >= cfg.maxRounds) {
        dispatch({ type: 'done' })
      } else {
        dispatch({ type: 'next_round', cfg })
      }
    }, 900)
    return () => clearTimeout(t)
  }, [state.phase, state.roundsWon, cfg])

  const start = useCallback(() => {
    dispatch({ type: 'start_playback' })
  }, [])

  const tap = useCallback(
    (color: SequenceColorId) => {
      if (state.phase !== 'input') return
      const expected = state.sequence[state.userInput.length]
      if (color !== expected) {
        playError()
        if (cfg.retryOnError) {
          dispatch({ type: 'error' })
          setTimeout(() => dispatch({ type: 'retry' }), 1500)
        } else {
          dispatch({ type: 'error' })
          setTimeout(() => dispatch({ type: 'done' }), 1500)
        }
        return
      }
      const isLast = state.userInput.length + 1 === state.sequence.length
      if (isLast) playCorrect()
      else playSequenceTap(color)
      dispatch({ type: 'tap', color, pointsPerCorrect })
    },
    [state.phase, state.sequence, state.userInput, cfg.retryOnError, pointsPerCorrect],
  )

  const restart = useCallback(() => {
    dispatch({ type: 'restart', cfg })
  }, [cfg])

  return {
    phase: state.phase,
    sequence: state.sequence,
    userInput: state.userInput,
    highlightIndex: state.highlightIndex,
    length: state.length,
    roundsWon: state.roundsWon,
    score: state.score,
    inputProgress: state.userInput.length,
    start,
    tap,
    restart,
  }
}
