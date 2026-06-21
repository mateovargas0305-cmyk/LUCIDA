import type { Difficulty, QuizActivityConfig } from '../../modes/types'
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

// ── Tracking cross-sesión de preguntas ya vistas ─────────────────────────────

const SEEN_KEY = 'lucida.quiz.seen'

function getSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set<string>()
  } catch {
    return new Set<string>()
  }
}

function markAsSeen(ids: string[]): void {
  try {
    const seen = getSeenIds()
    ids.forEach((id) => seen.add(id))
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]))
  } catch {}
}

function resetSeen(): void {
  try {
    localStorage.removeItem(SEEN_KEY)
  } catch {}
}

// ── Weighted sampling ─────────────────────────────────────────────────────────

/**
 * Sampling ponderado sin reemplazo. Preguntas con peso 0 se excluyen;
 * preguntas con peso mayor tienen más chances de ser elegidas.
 */
function weightedSample(
  pool: readonly QuizQuestion[],
  weights: Partial<Record<Difficulty, number>>,
  n: number,
): QuizQuestion[] {
  const candidates = pool
    .map((q) => ({ q, w: weights[q.level] ?? 1 }))
    .filter(({ w }) => w > 0)

  if (candidates.length === 0) return sampleN(pool, n)

  const result: QuizQuestion[] = []
  const remaining = [...candidates]

  const count = Math.min(n, remaining.length)
  for (let i = 0; i < count; i++) {
    const total = remaining.reduce((s, { w }) => s + w, 0)
    let r = Math.random() * total
    let idx = remaining.length - 1
    for (let j = 0; j < remaining.length; j++) {
      r -= remaining[j].w
      if (r <= 0) {
        idx = j
        break
      }
    }
    result.push(remaining[idx].q)
    remaining.splice(idx, 1)
  }

  return result
}

// ── Pool elegible (respeta levels y levelWeights) ────────────────────────────

function eligiblePool(cfg: QuizActivityConfig, bank: readonly QuizQuestion[]): QuizQuestion[] {
  const byLevel = bank.filter((q) => cfg.levels.includes(q.level))
  const pool = byLevel.length > 0 ? byLevel : bank
  // Excluir niveles con peso 0 explícito
  const hasWeights = Object.keys(cfg.levelWeights).length > 0
  if (!hasWeights) return pool
  return pool.filter((q) => (cfg.levelWeights[q.level] ?? 1) > 0)
}

// ── Exports ───────────────────────────────────────────────────────────────────

/**
 * Arma una sesión de quiz según la config del modo. Prioriza preguntas no
 * vistas antes; cuando el ciclo se agota reinicia el registro.
 */
export function buildQuizSession(
  cfg: QuizActivityConfig,
  bank: readonly QuizQuestion[] = QUIZ_BANK,
): PreparedQuestion[] {
  const full = eligiblePool(cfg, bank)

  // Priorizar preguntas no vistas
  const seen = getSeenIds()
  const unseen = full.filter((q) => !seen.has(q.id))
  const pool = unseen.length >= cfg.questionsPerSession
    ? unseen
    : (() => { resetSeen(); return full })()

  const hasWeights = Object.keys(cfg.levelWeights).length > 0
  const questions = hasWeights
    ? weightedSample(pool, cfg.levelWeights, cfg.questionsPerSession)
    : sampleN(pool, cfg.questionsPerSession)

  markAsSeen(questions.map((q) => q.id))

  return questions.map((q) => prepareQuestion(q, cfg.optionsToShow))
}

/**
 * Pool grande para modo ráfaga: todas las preguntas elegibles barajadas,
 * sin límite de questionsPerSession. Evita que el pool se agote en sesiones largas.
 */
export function buildQuizPool(
  cfg: QuizActivityConfig,
  bank: readonly QuizQuestion[] = QUIZ_BANK,
): PreparedQuestion[] {
  const pool = eligiblePool(cfg, bank)
  return sampleN(pool, pool.length).map((q) => prepareQuestion(q, cfg.optionsToShow))
}

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const
