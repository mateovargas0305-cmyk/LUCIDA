import { createContext, useContext } from 'react'
import type { ModeConfig, ModeId } from './types'

export interface ModeContextValue {
  mode: ModeId
  config: ModeConfig
  setMode: (id: ModeId) => void
}

export const ModeContext = createContext<ModeContextValue | null>(null)

/** Acceso al modo activo y a su setter. */
export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode debe usarse dentro de <ModeProvider>')
  return ctx
}

/** Atajo a la configuración completa del modo activo. */
export function useModeConfig(): ModeConfig {
  return useMode().config
}
