import { useEffect } from 'react'
import { useModeConfig } from '../modes/modeContext'
import { usePreferences } from '../preferences/preferencesContext'
import { configure, initAudio } from '../lib/audioManager'

/**
 * Sincroniza las preferencias y la config del modo al audioManager.
 * Debe llamarse desde dentro de ModeProvider + PreferencesProvider.
 *
 * El audio se inicializa en el primer pointerdown del usuario (requisito
 * del Web Audio API en dispositivos móviles).
 */
export function useAudioSync(): void {
  // Inicializar en la primera interacción del usuario.
  useEffect(() => {
    const init = () => {
      void initAudio()
    }
    document.addEventListener('pointerdown', init, { once: true, capture: true })
    return () => document.removeEventListener('pointerdown', init, true)
  }, [])

  const prefs = usePreferences()
  const config = useModeConfig()

  useEffect(() => {
    configure({
      fxEnabled: prefs.soundFxEnabled,
      musicEnabled: prefs.musicEnabled,
      fxVolume: config.audio.fxVolume,
      musicVolume: config.audio.musicVolume,
      duckingEnabled: config.audio.duckDuringTTS,
    })
  }, [
    prefs.soundFxEnabled,
    prefs.musicEnabled,
    config.audio.fxVolume,
    config.audio.musicVolume,
    config.audio.duckDuringTTS,
  ])
}
