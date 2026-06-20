import type { StroopActivityConfig } from '../../modes/types'
import { shuffled, sampleN } from '../../lib/shuffle'

/**
 * Colores de juego para Stroop: ordenados de más a menos distintos perceptualmente.
 * slice(0, colorCount) da el subconjunto activo.
 * Orden: rojo, verde, azul, ciruela, ocre, marrón.
 */
export const STROOP_COLOR_SLOTS = [1, 3, 4, 5, 2, 6] as const
export type StroopColorSlot = (typeof STROOP_COLOR_SLOTS)[number]

/** Nombre legible en español. */
export const COLOR_NAME: Record<StroopColorSlot, string> = {
  1: 'rojo',
  2: 'ocre',
  3: 'verde',
  4: 'azul',
  5: 'lila',
  6: 'marrón',
}

/** Clase Tailwind de texto (tinta del color). */
export const COLOR_TEXT_CLASS: Record<StroopColorSlot, string> = {
  1: 'text-game-1-strong',
  2: 'text-game-2-strong',
  3: 'text-game-3-strong',
  4: 'text-game-4-strong',
  5: 'text-game-5-strong',
  6: 'text-game-6-strong',
}

/** Clase Tailwind para botón coloreado (Calmo). */
export const COLOR_BUTTON_CLASS: Record<StroopColorSlot, string> = {
  1: 'bg-game-1 text-game-1-ink border-game-1-strong',
  2: 'bg-game-2 text-game-2-ink border-game-2-strong',
  3: 'bg-game-3 text-game-3-ink border-game-3-strong',
  4: 'bg-game-4 text-game-4-ink border-game-4-strong',
  5: 'bg-game-5 text-game-5-ink border-game-5-strong',
  6: 'bg-game-6 text-game-6-ink border-game-6-strong',
}

export interface StroopTrial {
  /** Slot del color que dice la palabra escrita. */
  wordSlot: StroopColorSlot
  /** Slot del color de la tinta. */
  inkSlot: StroopColorSlot
  /** Slots de las opciones disponibles. */
  optionSlots: StroopColorSlot[]
  /** Índice correcto en `optionSlots` (siempre el inkSlot). */
  correctIndex: number
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Genera todas las rondas de una sesión Stroop. */
export function buildStroopTrials(cfg: StroopActivityConfig): StroopTrial[] {
  const slots = STROOP_COLOR_SLOTS.slice(0, cfg.colorCount) as StroopColorSlot[]

  return Array.from({ length: cfg.rounds }, () => {
    const inkSlot = pick(slots)
    const isIncongruent = Math.random() < cfg.incongruencyRate
    const wordSlot = isIncongruent
      ? pick(slots.filter((s) => s !== inkSlot))
      : inkSlot

    const wrong = sampleN(
      slots.filter((s) => s !== inkSlot),
      Math.min(slots.length - 1, 3),
    )
    const optionSlots = shuffled([inkSlot, ...wrong])

    return { wordSlot, inkSlot, optionSlots, correctIndex: optionSlots.indexOf(inkSlot) }
  })
}
