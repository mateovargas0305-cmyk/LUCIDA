import { createContext, useContext } from 'react'
import type { ThemeId } from '../theme/themes'

export type TextScaleId = 'normal' | 'grande' | 'mas-grande'

/** Multiplicador aplicado al tamaño del texto de contenido. */
export const TEXT_SCALE_VALUE: Record<TextScaleId, number> = {
  normal: 1,
  grande: 1.12,
  'mas-grande': 1.25,
}

export const TEXT_SCALE_LABEL: Record<TextScaleId, string> = {
  normal: 'Normal',
  grande: 'Grande',
  'mas-grande': 'Más grande',
}

export interface Preferences {
  theme: ThemeId
  /** Lectura por voz (TTS) en actividades que la soporten (ej. Calmo Quiz). */
  soundEnabled: boolean
  /** Efectos de sonido sintetizados (acierto, error, selección, cierre). */
  soundFxEnabled: boolean
  /** Música de fondo en loop. Activada por defecto; el usuario puede desactivarla. */
  musicEnabled: boolean
  textScale: TextScaleId
}

export interface PreferencesContextValue extends Preferences {
  setTheme: (id: ThemeId) => void
  setSoundEnabled: (on: boolean) => void
  setSoundFxEnabled: (on: boolean) => void
  setMusicEnabled: (on: boolean) => void
  setTextScale: (id: TextScaleId) => void
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'tierra',
  soundEnabled: true,
  soundFxEnabled: true,
  musicEnabled: true,    // música activada por defecto
  textScale: 'normal',
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(
  null,
)

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx)
    throw new Error('usePreferences debe usarse dentro de <PreferencesProvider>')
  return ctx
}
