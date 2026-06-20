import type { QuizActivityConfig } from '../../modes/types'
import { QUIZ_BANK, type QuizQuestion } from '../../data/quiz'
import { sampleN, shuffled } from '../../lib/shuffle'

/** Pregunta ya preparada para mostrar: opciones recortadas y barajadas. */
export interface PreparedQuestion {
  id: string
  category: QuizQuestion['category']
  level: QuizQuestion['level']
  prompt: string
  options: string[]
  correctIndex: number
  explanation?: string
}

/**
 * Recorta una pregunta a `optionsToShow` opciones (siempre conserva la
 * correcta), las baraja y recalcula el índice correcto.
 */
function prepareQuestion(q: QuizQuestion, optionsToShow: number): PreparedQuestion {
  const correct = q.options[q.correctIndex]
  const distractors = q.options.filter((_, i) => i !== q.correctIndex)
  const chosen = [correct, ...sampleN(distractors, Math.max(1, optionsToShow - 1))]
  const options = shuffled(chosen)
  return {
    id: q.id,
    category: q.category,
    level: q.level,
    prompt: q.prompt,
    options,
    correctIndex: options.indexOf(correct),
    explanation: q.explanation,
  }
}

/**
 * Arma una sesión de quiz según la config del modo: filtra por niveles
 * permitidos, elige N preguntas y prepara cada una. Lógica pura y testeable.
 */
export function buildQuizSession(
  cfg: QuizActivityConfig,
  bank: readonly QuizQuestion[] = QUIZ_BANK,
): PreparedQuestion[] {
  const eligible = bank.filter((q) => cfg.levels.includes(q.level))
  const pool = eligible.length > 0 ? eligible : bank
  return sampleN(pool, cfg.questionsPerSession).map((q) =>
    prepareQuestion(q, cfg.optionsToShow),
  )
}

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const
