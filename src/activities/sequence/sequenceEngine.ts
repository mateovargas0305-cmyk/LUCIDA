/**
 * Índices de colores de juego para Secuencias (1-based, referencia a token game-N).
 * Orden: primero los más distintos perceptualmente (rojo, verde, azul, ciruela, ocre, marrón).
 */
export const GAME_COLOR_INDICES = [1, 3, 4, 5, 2, 6] as const
export type GameColorIndex = (typeof GAME_COLOR_INDICES)[number]

/** Clase Tailwind bg-* para el estado normal. */
export const COLOR_BG: Record<GameColorIndex, string> = {
  1: 'bg-game-1',
  2: 'bg-game-2',
  3: 'bg-game-3',
  4: 'bg-game-4',
  5: 'bg-game-5',
  6: 'bg-game-6',
}

/** Clase Tailwind bg-* + ring para el estado iluminado. */
export const COLOR_HIGHLIGHT: Record<GameColorIndex, string> = {
  1: 'bg-game-1-strong ring-4 ring-game-1',
  2: 'bg-game-2-strong ring-4 ring-game-2',
  3: 'bg-game-3-strong ring-4 ring-game-3',
  4: 'bg-game-4-strong ring-4 ring-game-4',
  5: 'bg-game-5-strong ring-4 ring-game-5',
  6: 'bg-game-6-strong ring-4 ring-game-6',
}

/** Texto accesible del color (para aria-label). */
export const COLOR_LABEL: Record<GameColorIndex, string> = {
  1: 'rojo',
  2: 'ocre',
  3: 'verde',
  4: 'azul',
  5: 'lila',
  6: 'marrón',
}

/**
 * Devuelve los `colorCount` primeros índices de GAME_COLOR_INDICES,
 * ordenados de más a menos distintos perceptualmente.
 */
export function getSequenceColors(colorCount: number): GameColorIndex[] {
  return GAME_COLOR_INDICES.slice(0, colorCount) as GameColorIndex[]
}

/** Construye una secuencia aleatoria de `length` elementos con `colorCount` colores. */
export function buildSequence(colorCount: number, length: number): GameColorIndex[] {
  const colors = getSequenceColors(colorCount)
  return Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)])
}
