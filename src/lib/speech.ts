/**
 * Lectura por voz con la Web Speech API (offline, sin dependencias).
 * Es opcional y degrada en silencio si el navegador no la soporta.
 *
 * En Calmo: atenúa la música de fondo mientras habla (ducking) y la restaura al terminar.
 * DIAGNÓSTICO: loguea en consola para detectar problemas en dispositivos móviles.
 */
import { duckMusic, unduckMusic } from './audioManager'
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let _voicesReady = false

function getVoices(cb: (voices: SpeechSynthesisVoice[]) => void): void {
  if (!canSpeak()) {
    cb([])
    return
  }
  const synth = window.speechSynthesis
  const voices = synth.getVoices()
  if (voices.length > 0) {
    _voicesReady = true
    cb(voices)
    return
  }
  // En Chrome/Android las voces no están disponibles hasta que dispara voiceschanged.
  const handler = () => {
    const loaded = synth.getVoices()
    _voicesReady = true
    console.info(`[Lúcida TTS] voiceschanged: ${loaded.length} voces cargadas`)
    synth.removeEventListener('voiceschanged', handler)
    cb(loaded)
  }
  synth.addEventListener('voiceschanged', handler)
}

// Precarga voces al arrancar para que el primer speak() no tenga latencia.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getVoices(() => {})
}

export function speak(text: string): void {
  if (!canSpeak()) {
    console.warn('[Lúcida TTS] speechSynthesis no disponible en este navegador.')
    return
  }

  getVoices((voices) => {
    console.info(`[Lúcida TTS] Voces disponibles: ${voices.length} | ¿Ya listas? ${_voicesReady}`)
    if (voices.length > 0) {
      console.info(
        '[Lúcida TTS] Idiomas:',
        voices
          .map((v) => `${v.name} (${v.lang})`)
          .join(', '),
      )
    }

    // Preferir es-AR > es-ES > cualquier es-* > default del navegador.
    const voice =
      voices.find((v) => v.lang === 'es-AR') ??
      voices.find((v) => v.lang === 'es-ES') ??
      voices.find((v) => v.lang.startsWith('es')) ??
      null

    console.info(
      `[Lúcida TTS] Voz elegida: ${voice ? `${voice.name} (${voice.lang})` : 'default del navegador'}`,
    )

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = voice?.lang ?? 'es-AR'
      utterance.rate = 0.95
      utterance.pitch = 1
      if (voice) utterance.voice = voice

      utterance.onstart = () => {
        console.info('[Lúcida TTS] onstart ✓')
        duckMusic()
      }
      utterance.onend = () => {
        console.info('[Lúcida TTS] onend ✓')
        unduckMusic()
      }
      utterance.onerror = (e) => {
        console.error('[Lúcida TTS] onerror:', e.error)
        unduckMusic()
      }

      window.speechSynthesis.speak(utterance)
      console.info('[Lúcida TTS] speak() llamado.')
    } catch (err) {
      console.error('[Lúcida TTS] Excepción al hablar:', err)
    }
  })
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel()
}
