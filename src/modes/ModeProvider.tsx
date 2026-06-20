import { useMemo, type ReactNode } from 'react'
import { ModeContext, type ModeContextValue } from './modeContext'
import { DEFAULT_MODE_ID, getModeConfig, MODE_CONFIGS } from './configs'
import type { ModeId } from './types'
import { usePersistentState } from '../lib/persistentState'

const isModeId = (value: unknown): value is ModeId =>
  typeof value === 'string' && value in MODE_CONFIGS

/** Provee el modo activo (persistido) y su configuración derivada. */
export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = usePersistentState<ModeId>(
    'lucida.mode',
    DEFAULT_MODE_ID,
    isModeId,
  )

  const value = useMemo<ModeContextValue>(
    () => ({ mode, config: getModeConfig(mode), setMode }),
    [mode, setMode],
  )

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}
