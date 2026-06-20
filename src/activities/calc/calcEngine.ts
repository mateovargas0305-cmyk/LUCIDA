import type { CalcActivityConfig, CalcOperation } from '../../modes/types'
import { shuffled } from '../../lib/shuffle'

export interface CalcProblem {
  /** Texto a mostrar, p. ej. "14 × 6" o "20% de 80". */
  prompt: string
  answer: number
  options: number[]
  correctIndex: number
}

const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

const pick = <T,>(list: readonly T[]): T =>
  list[Math.floor(Math.random() * list.length)]

/** Genera enunciado + respuesta para una operación concreta. */
function generateExpression(
  op: CalcOperation,
  max: number,
): { prompt: string; answer: number } {
  switch (op) {
    case 'suma': {
      const a = randInt(1, max)
      const b = randInt(1, max)
      return { prompt: `${a} + ${b}`, answer: a + b }
    }
    case 'resta': {
      const a = randInt(1, max)
      const b = randInt(0, a) // nunca resultado negativo
      return { prompt: `${a} − ${b}`, answer: a - b }
    }
    case 'multiplicacion': {
      // Operandos acotados para que el cálculo mental siga siendo razonable.
      const a = randInt(2, Math.min(max, 20))
      const b = randInt(2, 9)
      return { prompt: `${a} × ${b}`, answer: a * b }
    }
    case 'secuencia': {
      const step = randInt(2, 9)
      const start = randInt(1, max)
      const terms = [0, 1, 2, 3].map((k) => start + k * step)
      return {
        prompt: `${terms.join(', ')}, …`,
        answer: start + 4 * step,
      }
    }
    case 'porcentaje': {
      const pct = pick([10, 20, 25, 50])
      const base = randInt(1, Math.max(2, Math.floor(max / 5))) * 20
      return { prompt: `${pct}% de ${base}`, answer: (base * pct) / 100 }
    }
  }
}

/** Construye `count` opciones únicas, no negativas, que incluyen la respuesta. */
function buildOptions(answer: number, count: number): number[] {
  const options = new Set<number>([answer])
  let spread = 1
  while (options.size < count) {
    const delta = randInt(1, Math.max(2, Math.ceil(answer * 0.2) + spread))
    const sign = Math.random() < 0.5 ? -1 : 1
    const candidate = answer + sign * delta
    if (candidate >= 0) options.add(candidate)
    spread += 1
  }
  return shuffled([...options])
}

/** Genera un problema completo según la config del modo. */
export function generateCalcProblem(cfg: CalcActivityConfig): CalcProblem {
  const op = pick(cfg.operations)
  const { prompt, answer } = generateExpression(op, cfg.maxOperand)
  const options = buildOptions(answer, cfg.optionCount)
  return { prompt, answer, options, correctIndex: options.indexOf(answer) }
}

/**
 * Genera todos los problemas de una sesión.
 * Si `escalateWithinSession` está activo, las primeras rondas usan operandos
 * menores y las últimas llegan al máximo configurado, aumentando la dificultad
 * de forma progresiva sin cambiar el modo ni la UI.
 */
export function generateCalcProblems(cfg: CalcActivityConfig): CalcProblem[] {
  return Array.from({ length: cfg.rounds }, (_, i) => {
    let maxOp = cfg.maxOperand
    if (cfg.escalateWithinSession && cfg.rounds > 1) {
      // Escala de 0.5× al comienzo hasta 1.3× al final.
      const progress = i / (cfg.rounds - 1) // 0..1
      const multiplier = 0.5 + progress * 0.8 // 0.5..1.3
      maxOp = Math.max(5, Math.round(cfg.maxOperand * multiplier))
    }
    return generateCalcProblem({ ...cfg, maxOperand: maxOp })
  })
}
