import type { Transition } from 'framer-motion'
import type { MotionEnergy } from '../modes/types'

/**
 * Traduce la energía del modo a una transición de Framer Motion.
 * Todas son orgánicas y calmas; nunca estridentes. La diferencia es sutil:
 * Ágil con un poco más de resorte, Calmo casi un desvanecido.
 */
export const TRANSITION_BY_ENERGY: Record<MotionEnergy, Transition> = {
  energico: { type: 'spring', stiffness: 320, damping: 26 },
  sereno: { type: 'spring', stiffness: 210, damping: 28 },
  minimo: { type: 'tween', ease: 'easeOut', duration: 0.35 },
}

/** Entrada suave estándar de pantalla (se desactiva con reduced-motion). */
export const screenEnter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}
