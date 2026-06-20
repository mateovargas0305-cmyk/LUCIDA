import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import {
  DEFAULT_PREFERENCES,
  PreferencesContext,
  TEXT_SCALE_VALUE,
  type Preferences,
  type PreferencesContextValue,
  type TextScaleId,
} from './preferencesContext'
import { usePersistentState } from '../lib/persistentState'
import { applyTheme } from '../theme/applyTheme'
import { THEMES, type ThemeId } from '../theme/themes'

function isPreferences(value: unknown): value is Preferences {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.theme === 'string' &&
    v.theme in THEMES &&
    typeof v.soundEnabled === 'boolean' &&
    (v.textScale === 'normal' ||
      v.textScale === 'grande' ||
      v.textScale === 'mas-grande')
  )
}

/** Aplica el efecto visual de una preferencia al documento. */
function applyPreferences(prefs: Preferences): void {
  applyTheme(prefs.theme)
  document.documentElement.style.setProperty(
    '--text-scale',
    String(TEXT_SCALE_VALUE[prefs.textScale]),
  )
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = usePersistentState<Preferences>(
    'lucida.prefs',
    DEFAULT_PREFERENCES,
    isPreferences,
  )

  // Reaplica tema y escala cada vez que cambian (y al montar).
  useEffect(() => {
    applyPreferences(prefs)
  }, [prefs])

  const setTheme = useCallback(
    (theme: ThemeId) => setPrefs({ ...prefs, theme }),
    [prefs, setPrefs],
  )
  const setSoundEnabled = useCallback(
    (soundEnabled: boolean) => setPrefs({ ...prefs, soundEnabled }),
    [prefs, setPrefs],
  )
  const setTextScale = useCallback(
    (textScale: TextScaleId) => setPrefs({ ...prefs, textScale }),
    [prefs, setPrefs],
  )

  const value = useMemo<PreferencesContextValue>(
    () => ({ ...prefs, setTheme, setSoundEnabled, setTextScale }),
    [prefs, setTheme, setSoundEnabled, setTextScale],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}
