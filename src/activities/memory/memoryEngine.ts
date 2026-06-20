import type { MemoryActivityConfig } from '../../modes/types'
import { NATURE_ICON_IDS, type NatureIconId } from '../../components/icons/natureIconIds'
import { shuffled } from '../../lib/shuffle'

export interface MemoryCard {
  /** Posición estable en la grilla (clave de React y de estado). */
  key: number
  icon: NatureIconId
}

/** Arma un mazo barajado con `pairs` parejas de íconos. */
export function buildMemoryDeck(cfg: MemoryActivityConfig): MemoryCard[] {
  const icons = NATURE_ICON_IDS.slice(0, cfg.pairs)
  const doubled = [...icons, ...icons]
  return shuffled(doubled).map((icon, key) => ({ key, icon }))
}
