/**
 * Lectura por voz con la Web Speech API (offline, sin dependencias).
 * Es opcional y degrada en silencio si el navegador no la soporta.
 */
export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text: string, lang = 'es-ES'): void {
  if (!canSpeak()) return
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.95
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  } catch {
    // Sin voz disponible: seguimos sin interrumpir la experiencia.
  }
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel()
}
