/** Colores token disponibles para los botones de Secuencias. Solo tokens de tema. */
export const SEQUENCE_COLORS = ['agil', 'sereno', 'calmo', 'positive'] as const
export type SequenceColor = (typeof SEQUENCE_COLORS)[number]

/** Clase Tailwind bg-* para el estado normal (opaco). */
export const COLOR_BG: Record<SequenceColor, string> = {
  agil: 'bg-agil',
  sereno: 'bg-sereno',
  calmo: 'bg-calmo',
  positive: 'bg-positive',
}

/** Clase Tailwind bg-* + ring para el estado iluminado. */
export const COLOR_HIGHLIGHT: Record<SequenceColor, string> = {
  agil: 'bg-agil-strong ring-4 ring-agil',
  sereno: 'bg-sereno-strong ring-4 ring-sereno',
  calmo: 'bg-calmo-strong ring-4 ring-calmo',
  positive: 'bg-positive ring-4 ring-positive-ink',
}

/** Construye una secuencia aleatoria de `length` elementos con `colorCount` colores. */
export function buildSequence(colorCount: number, length: number): SequenceColor[] {
  const colors = SEQUENCE_COLORS.slice(0, colorCount) as SequenceColor[]
  return Array.from({ length }, () => colors[Math.floor(Math.random() * colors.length)])
}
