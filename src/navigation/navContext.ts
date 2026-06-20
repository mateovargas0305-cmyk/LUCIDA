import { createContext, useContext } from 'react'
import type { ActivityId } from '../modes/types'

/** Pantallas de la app. Se amplía a medida que se suman flujos. */
export type Screen =
  | { name: 'mode-select' }
  | { name: 'home' }
  | { name: 'activity'; activity: ActivityId }
  | { name: 'settings' }

export interface NavContextValue {
  screen: Screen
  /** Navega a una pantalla, apilando la actual para poder volver. */
  navigate: (screen: Screen) => void
  /** Vuelve a la pantalla anterior (o a `home` si no hay historial). */
  back: () => void
  canGoBack: boolean
}

export const NavContext = createContext<NavContextValue | null>(null)

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav debe usarse dentro de <NavProvider>')
  return ctx
}

export const ACTIVITY_LABELS: Record<ActivityId, string> = {
  quiz: 'Cultura general',
  calc: 'Cálculo',
  memory: 'Memoria',
  attention: 'Atención',
  sequence: 'Secuencias',
  chainedCalc: 'Cálculo encadenado',
  stroop: 'Stroop',
  symbolSpeed: 'Velocidad de símbolos',
}
