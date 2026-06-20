import type { StroopActivityConfig } from '../../modes/types'
import { shuffled, sampleN } from '../../lib/shuffle'

/** Tokens de acento usados como colores Stroop. Solo tokens de tema. */
export const STROOP_COLOR_IDS = ['agil', 'sereno', 'calmo', 'positive'] as const
export type StroopColorId = (typeof STROOP_COLOR_IDS)[number]

/** Nombre legible del color en español. */
export const COLOR_NAME: Record<StroopColorId, string> = {
  agil: 'ámbar',
  sereno: 'verde',
  calmo: 'terracota',
  positive: 'lima',
}

/** Clase Tailwind de texto (tinta). */
export const COLOR_TEXT_CLASS: Record<StroopColorId, string> = {
  agil: 'text-agil-strong',
  sereno: 'text-sereno-strong',
  calmo: 'text-calmo-strong',
  positive: 'text-positive-ink',
}

/** Clase Tailwind para botón coloreado (Calmo). */
export const COLOR_BUTTON_CLASS: Record<StroopColorId, string> = {
  agil: 'bg-agil-soft text-agil-strong border-agil',
  sereno: 'bg-sereno-soft text-sereno-strong border-sereno',
  calmo: 'bg-calmo-soft text-calmo-strong border-calmo',
  positive: 'bg-positive-soft text-positive-ink border-positive',
}

export interface StroopTrial {
  /** Id del color que dice la palabra escrita. */
  wordId: StroopColorId
  /** Id del color de la tinta. */
  inkId: StroopColorId
  /** Ids de las opciones disponibles. */
  optionIds: StroopColorId[]
  /** Índice correcto en `optionIds` (siempre el inkId). */
  correctIndex: number
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Genera todas las rondas de una sesión Stroop. */
export function buildStroopTrials(cfg: StroopActivityConfig): StroopTrial[] {
  const colors = STROOP_COLOR_IDS.slice(0, cfg.colorCount) as StroopColorId[]

  return Array.from({ length: cfg.rounds }, () => {
    const inkId = pick(colors)
    const isIncongruent = Math.random() < cfg.incongruencyRate
    const wordId = isIncongruent
      ? pick(colors.filter((c) => c !== inkId))
      : inkId

    const wrong = sampleN(
      colors.filter((c) => c !== inkId),
      Math.min(colors.length - 1, 3),
    )
    const optionIds = shuffled([inkId, ...wrong])

    return { wordId, inkId, optionIds, correctIndex: optionIds.indexOf(inkId) }
  })
}
