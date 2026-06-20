import type { AttentionActivityConfig, AttentionDiffBy } from '../../modes/types'

export interface AttentionRound {
  /** Cantidad de elementos en la grilla. */
  size: number
  /** Índice del elemento diferente (respuesta correcta). */
  correctIndex: number
  /** Qué distingue al diferente. */
  differBy: AttentionDiffBy
  /** Diferencia sutil vs. clara. */
  subtle: boolean
}

/** Crea una tanda de rondas con un elemento diferente en posición azarosa. */
export function buildAttentionRounds(
  cfg: AttentionActivityConfig,
): AttentionRound[] {
  return Array.from({ length: cfg.rounds }, () => ({
    size: cfg.items,
    correctIndex: Math.floor(Math.random() * cfg.items),
    differBy: cfg.differBy,
    subtle: cfg.subtle,
  }))
}
