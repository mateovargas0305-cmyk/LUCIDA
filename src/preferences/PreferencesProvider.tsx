import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_PREFERENCES,
  PreferencesContext,
  TEXT_SCALE_VALUE,
  type Preferences,
  type PreferencesContextValue,
  type TextScaleId,
} from './preferencesContext'
import { applyTheme } from '../theme/applyTheme'
import { THEMES, type ThemeId } from '../theme/themes'

const STORAGE_KEY = 'lucida.prefs'

/**
 * Carga y normaliza preferencias desde localStorage.
 * Rellena con defaults cualquier campo que falte (migración hacia adelante).
 */
function loadPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    const v = JSON.parse(raw) as Record<string, unknown>
    if (typeof v !== 'object' || !v) return DEFAULT_PREFERENCES

    return {
      theme:
        typeof v.theme === 'string' && v.theme in THEMES
          ? (v.theme as ThemeId)
          : DEFAULT_PREFERENCES.theme,
      soundEnabled:
        typeof v.soundEnabled === 'boolean'
          ? v.soundEnabled
          : DEFAULT_PREFERENCES.soundEnabled,
      soundFxEnabled:
        typeof v.soundFxEnabled === 'boolean'
          ? v.soundFxEnabled
          : DEFAULT_PREFERENCES.soundFxEnabled,
      musicEnabled:
        typeof v.musicEnabled === 'boolean'
          ? v.musicEnabled
          : DEFAULT_PREFERENCES.musicEnabled,
      textScale:
        v.textScale === 'normal' || v.textScale === 'grande' || v.textScale === 'mas-grande'
          ? v.textScale
          : DEFAULT_PREFERENCES.textScale,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function savePreferences(prefs: Preferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Modo privado u otro error: seguimos en memoria.
  }
}

/** Aplica los efectos visuales de las preferencias al documento. */
function applyPreferences(prefs: Preferences): void {
  applyTheme(prefs.theme)
  document.documentElement.style.setProperty(
    '--text-scale',
    String(TEXT_SCALE_VALUE[prefs.textScale]),
  )
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Preferences>(loadPreferences)

  const setPrefs = useCallback((next: Preferences) => {
    setPrefsState(next)
    savePreferences(next)
  }, [])

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
  const setSoundFxEnabled = useCallback(
    (soundFxEnabled: boolean) => setPrefs({ ...prefs, soundFxEnabled }),
    [prefs, setPrefs],
  )
  const setMusicEnabled = useCallback(
    (musicEnabled: boolean) => setPrefs({ ...prefs, musicEnabled }),
    [prefs, setPrefs],
  )
  const setTextScale = useCallback(
    (textScale: TextScaleId) => setPrefs({ ...prefs, textScale }),
    [prefs, setPrefs],
  )

  const value = useMemo<PreferencesContextValue>(
    () => ({
      ...prefs,
      setTheme,
      setSoundEnabled,
      setSoundFxEnabled,
      setMusicEnabled,
      setTextScale,
    }),
    [prefs, setTheme, setSoundEnabled, setSoundFxEnabled, setMusicEnabled, setTextScale],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}
