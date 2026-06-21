import type { AttentionActivityConfig, AttentionDiffDimension } from '../../modes/types'

export type ShapeId = 'circle' | 'rounded' | 'square' | 'triangle' | 'diamond'

export interface ElementVisual {
  /** Clase Tailwind bg-* del token de tema. Nunca color hardcodeado. */
  colorClass: string
  shape: ShapeId
  /** Porcentaje del tamaño de celda (20–80). */
  sizePct: number
}

export interface AttentionRound {
  correctIndex: number
  /** Columnas efectivas para esta ronda. */
  columns: number
  elements: ElementVisual[]
}

// --- Pares de colores (solo tokens de tema, sin hex) ---
interface ColorPair {
  base: string
  diff: string
}

const OBVIOUS_PAIRS: ColorPair[] = [
  { base: 'bg-sereno', diff: 'bg-calmo' },
  { base: 'bg-calmo', diff: 'bg-agil' },
  { base: 'bg-agil', diff: 'bg-positive' },
  { base: 'bg-positive', diff: 'bg-sereno' },
]

const SUBTLE_PAIRS: ColorPair[] = [
  { base: 'bg-sereno', diff: 'bg-sereno-soft' },
  { base: 'bg-calmo', diff: 'bg-calmo-soft' },
  { base: 'bg-agil', diff: 'bg-agil-soft' },
]

const SHAPES_BASE: ShapeId[] = ['circle', 'rounded', 'square']
const SHAPES_OBVIOUS: ShapeId[] = ['triangle', 'diamond']

const SHAPE_PAIRS_SUBTLE: Array<[ShapeId, ShapeId]> = [
  ['circle', 'rounded'],
  ['square', 'rounded'],
  ['circle', 'square'],
]

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickDim(dims: AttentionDiffDimension[]): AttentionDiffDimension {
  return dims[Math.floor(Math.random() * dims.length)]
}

/** Tamaño de grilla variable para time-attack: crece con la dificultad. */
function randomGridSize(base: number, cols: number, difficulty: number): number {
  const sizes = [
    Math.max(cols, base - cols * 2),
    base - cols,
    base,
    base + cols,
    base + cols * 2,
  ]
    .filter((n) => n > 0 && n % cols === 0)
    .filter((v, i, a) => a.indexOf(v) === i)

  if (sizes.length === 0) return base

  // A mayor dificultad más items (más difícil escanear la grilla).
  const maxIdx = sizes.length - 1
  const biasedIdx = Math.min(
    maxIdx,
    Math.floor(difficulty * maxIdx * 0.7 + Math.random() * sizes.length * 0.5),
  )
  return sizes[Math.max(0, biasedIdx)]
}

/**
 * Genera una ronda de atención.
 * difficulty: 0 (obvia) → 1 (sutil).
 */
export function buildAttentionRound(
  cfg: AttentionActivityConfig,
  difficulty = 0,
): AttentionRound {
  const isSubtle = difficulty > 0.5

  const gridSize =
    cfg.sessionMode === 'time-attack'
      ? randomGridSize(cfg.items, cfg.columns, difficulty)
      : cfg.items

  const correctIndex = Math.floor(Math.random() * gridSize)

  const dim: AttentionDiffDimension =
    cfg.differDimensions.length > 0 ? pickDim(cfg.differDimensions) : 'color'

  const basePair = isSubtle ? pick(SUBTLE_PAIRS) : pick(OBVIOUS_PAIRS)
  const baseColor = basePair.base
  const baseShape: ShapeId = pick(SHAPES_BASE)
  const baseSizePct = 65

  const elements: ElementVisual[] = Array.from({ length: gridSize }, () => ({
    colorClass: baseColor,
    shape: baseShape,
    sizePct: baseSizePct,
  }))

  switch (dim) {
    case 'color': {
      const pool = isSubtle
        ? SUBTLE_PAIRS
        : OBVIOUS_PAIRS.filter((p) => p.diff !== baseColor)
      const pair = pool.length > 0 ? pick(pool) : pick(OBVIOUS_PAIRS)
      elements[correctIndex] = {
        colorClass: pair.diff,
        shape: baseShape,
        sizePct: baseSizePct,
      }
      break
    }
    case 'forma': {
      if (isSubtle) {
        const [shapeA, shapeB] = pick(SHAPE_PAIRS_SUBTLE)
        for (let i = 0; i < elements.length; i++) {
          elements[i] = { ...elements[i], shape: shapeA }
        }
        elements[correctIndex] = { ...elements[correctIndex], shape: shapeB }
      } else {
        elements[correctIndex] = {
          ...elements[correctIndex],
          shape: pick(SHAPES_OBVIOUS),
        }
      }
      break
    }
    case 'tamaño': {
      const diffSize = isSubtle ? baseSizePct - 15 : baseSizePct - 28
      elements[correctIndex] = {
        ...elements[correctIndex],
        sizePct: Math.max(22, diffSize),
      }
      break
    }
  }

  // Invariant: el elemento en correctIndex debe diferir visualmente de todos los demás.
  if (gridSize > 1) {
    const ref = elements[correctIndex === 0 ? 1 : 0]
    const diff = elements[correctIndex]
    const isDifferent =
      diff.colorClass !== ref.colorClass ||
      diff.shape !== ref.shape ||
      diff.sizePct !== ref.sizePct
    if (!isDifferent) {
      const safe = OBVIOUS_PAIRS.find((p) => p.diff !== ref.colorClass)
      elements[correctIndex] = {
        ...diff,
        colorClass: safe ? safe.diff : 'bg-calmo',
      }
    }
  }

  return { correctIndex, columns: cfg.columns, elements }
}

/** Construye N rondas para modo clásico (Calmo): dificultad fija = 0. */
export function buildAttentionRounds(cfg: AttentionActivityConfig): AttentionRound[] {
  return Array.from({ length: cfg.rounds }, () => buildAttentionRound(cfg, 0))
}

/** Estilos CSS para renderizar cada forma. */
export function shapeStyles(shape: ShapeId): {
  borderRadius: string
  clipPath?: string
} {
  switch (shape) {
    case 'circle':
      return { borderRadius: '50%' }
    case 'rounded':
      return { borderRadius: '30%' }
    case 'square':
      return { borderRadius: '6px' }
    case 'triangle':
      return { borderRadius: '0', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }
    case 'diamond':
      return { borderRadius: '0', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }
  }
}
