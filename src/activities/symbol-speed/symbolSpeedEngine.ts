import type { SymbolSpeedActivityConfig } from '../../modes/types'
import { shuffled, sampleN } from '../../lib/shuffle'

/** Símbolos geométricos Unicode claramente distinguibles entre sí. */
export const ALL_SYMBOLS = ['★', '●', '▲', '■', '♥', '✦'] as const
export type SymbolChar = (typeof ALL_SYMBOLS)[number]

export interface SymbolKey {
  symbol: SymbolChar
  /** Código numérico asignado (1-based). */
  code: number
}

/** Asociación símbolo → código que se mantiene durante toda la sesión. */
export function buildSymbolTable(symbolCount: number): SymbolKey[] {
  const selected = shuffled([...ALL_SYMBOLS]).slice(0, symbolCount) as SymbolChar[]
  return selected.map((symbol, i) => ({ symbol, code: i + 1 }))
}

export interface SymbolSpeedRound {
  targetSymbol: SymbolChar
  correctCode: number
  options: number[]
  correctIndex: number
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Genera una ronda eligiendo un símbolo al azar de la tabla. */
export function buildSymbolRound(table: SymbolKey[]): SymbolSpeedRound {
  const entry = pick(table)
  const codes = table.map((e) => e.code)
  const wrong = sampleN(
    codes.filter((c) => c !== entry.code),
    Math.min(codes.length - 1, 3),
  )
  const options = shuffled([entry.code, ...wrong])
  return {
    targetSymbol: entry.symbol,
    correctCode: entry.code,
    options,
    correctIndex: options.indexOf(entry.code),
  }
}

/** Genera todas las rondas de la sesión con la misma tabla de referencia. */
export function buildSymbolRounds(
  cfg: SymbolSpeedActivityConfig,
  table: SymbolKey[],
): SymbolSpeedRound[] {
  return Array.from({ length: cfg.rounds }, () => buildSymbolRound(table))
}
