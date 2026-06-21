import type { CalcOperation, ChainedCalcActivityConfig } from '../../modes/types'
import { shuffled } from '../../lib/shuffle'

export interface ChainStep {
  operator: CalcOperation
  operand: number
  /** Resultado de aplicar esta operación al valor anterior. */
  result: number
  /** Expresión de este paso, ej. "+  5" o "×  3". */
  expr: string
}

export interface ChainedCalcProblem {
  startValue: number
  steps: ChainStep[]
  /** Resultado final (respuesta correcta). */
  answer: number
  options: number[]
  correctIndex: number
  /** Opciones por cada sub-paso (incluyendo el final). stepOptions[i] cubre steps[i]. */
  stepOptions: { options: number[]; correctIndex: number }[]
}

const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

function applyOp(value: number, op: CalcOperation, operand: number): number {
  switch (op) {
    case 'suma':
      return value + operand
    case 'resta':
      return value - operand
    case 'multiplicacion':
      return value * operand
    default:
      return value + operand
  }
}

function operatorSymbol(op: CalcOperation): string {
  switch (op) {
    case 'suma':
      return '+'
    case 'resta':
      return '−'
    case 'multiplicacion':
      return '×'
    default:
      return '+'
  }
}

/** Genera un operando válido que mantenga el resultado en un rango razonable. */
function generateOperand(
  op: CalcOperation,
  currentValue: number,
  maxOperand: number,
): number {
  switch (op) {
    case 'suma':
      return randInt(1, Math.min(maxOperand, 20))
    case 'resta':
      // No negativos y al menos 1 de resultado
      return randInt(1, Math.max(1, Math.min(currentValue - 1, maxOperand, 15)))
    case 'multiplicacion':
      // Factor pequeño para que el resultado no se dispare
      return randInt(2, Math.min(maxOperand, 9))
    default:
      return randInt(1, maxOperand)
  }
}

function buildOptions(answer: number, count = 4): number[] {
  const options = new Set<number>([answer])
  let spread = 1
  while (options.size < count) {
    const delta = randInt(1, Math.max(2, Math.ceil(Math.abs(answer) * 0.25) + spread))
    const sign = Math.random() < 0.5 ? -1 : 1
    const candidate = answer + sign * delta
    if (candidate >= 0 && candidate !== answer) options.add(candidate)
    spread += 1
  }
  return shuffled([...options])
}

/** Genera un problema de cálculo encadenado según la config del modo. */
export function buildChainedCalcProblem(
  cfg: ChainedCalcActivityConfig,
  maxOperandOverride?: number,
): ChainedCalcProblem {
  const maxOp = maxOperandOverride ?? cfg.maxOperand
  const ops: CalcOperation[] = cfg.operations.filter(
    (o) => o === 'suma' || o === 'resta' || o === 'multiplicacion',
  )

  let value = randInt(2, Math.min(maxOp, 15))
  const startValue = value
  const steps: ChainStep[] = []

  for (let i = 0; i < cfg.chainLength; i++) {
    const op = pick(ops)
    const operand = generateOperand(op, value, maxOp)
    const result = applyOp(value, op, operand)
    steps.push({
      operator: op,
      operand,
      result,
      expr: `${operatorSymbol(op)} ${operand}`,
    })
    value = result
  }

  const answer = value
  const options = buildOptions(answer, 4)

  const stepOptions = steps.map((step) => {
    const opts = buildOptions(step.result, 4)
    return { options: opts, correctIndex: opts.indexOf(step.result) }
  })

  return {
    startValue,
    steps,
    answer,
    options,
    correctIndex: options.indexOf(answer),
    stepOptions,
  }
}

/** Genera todos los problemas de una sesión, con escalado opcional. */
export function buildChainedCalcProblems(cfg: ChainedCalcActivityConfig): ChainedCalcProblem[] {
  return Array.from({ length: cfg.rounds }, (_, i) => {
    let maxOp = cfg.maxOperand
    if (cfg.escalateWithinSession && cfg.rounds > 1) {
      const progress = i / (cfg.rounds - 1)
      const multiplier = 0.6 + progress * 0.7
      maxOp = Math.max(5, Math.round(cfg.maxOperand * multiplier))
    }
    return buildChainedCalcProblem(cfg, maxOp)
  })
}
