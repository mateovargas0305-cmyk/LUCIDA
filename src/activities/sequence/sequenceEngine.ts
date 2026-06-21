/**
 * Colores de la actividad Secuencias.
 * Paleta cálida basada en tokens del tema, con azul-pizarra (game-4) como 4to color
 * en lugar del 'positive' que duplicaba al 'sereno'.
 * Orden: primero los más distintos perceptualmente para Calmo (3 colores).
 */
export const SEQUENCE_COLOR_IDS = ['agil', 'sereno', 'calmo', 'gentle'] as const
export type SequenceColorId = (typeof SEQUENCE_COLOR_IDS)[number]

/** Clase Tailwind bg-* para el estado normal. */
export const COLOR_BG: Record<SequenceColorId, string> = {
  agil: 'bg-agil',
  sereno: 'bg-sereno',
  calmo: 'bg-calmo',
  gentle: 'bg-gentle',
}

/** Clase Tailwind bg-* + ring para el estado iluminado. */
export const COLOR_HIGHLIGHT: Record<SequenceColorId, string> = {
  agil: 'bg-agil-strong ring-4 ring-agil',
  sereno: 'bg-sereno-strong ring-4 ring-sereno',
  calmo: 'bg-calmo-strong ring-4 ring-calmo',
  gentle: 'bg-gentle-strong ring-4 ring-gentle',
}

/** Texto accesible del color (para aria-label). */
export const COLOR_LABEL: Record<SequenceColorId, string> = {
  agil: 'ámbar',
  sereno: 'verde',
  calmo: 'terracota',
  gentle: 'arena',
}

/** Devuelve los `colorCount` primeros colores del set. */
export function getSequenceColors(colorCount: number): SequenceColorId[] {
  return SEQUENCE_COLOR_IDS.slice(0, colorCount) as SequenceColorId[]
}

/** Construye una secuencia aleatoria de `length` elementos con `colorCount` colores. */
export function buildSequence(colorCount: number, length: number): SequenceColorId[] {
  const colors = getSequenceColors(colorCount)
  return Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)])
}
