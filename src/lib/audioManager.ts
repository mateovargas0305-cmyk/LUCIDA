/**
 * Audio Manager de Lúcida — efectos sintetizados y música de fondo.
 *
 * Singleton que centraliza todo el audio. Se inicializa tras la primera
 * interacción del usuario (requisito del Web Audio API en móvil).
 * Si el archivo de música no está presente, la app sigue sin interrupciones.
 */
import * as Tone from 'tone'

// ── Estado interno ─────────────────────────────────────────────────────────

let _initialized = false
let _fxEnabled = true
let _musicEnabled = false
let _fxVolume = -8
let _musicVolume = -24
let _duckingEnabled = false
let _isDucked = false
let _bgLoaded = false

// El archivo debe estar en public/audio/ambient.mp3
const MUSIC_URL = `${import.meta.env.BASE_URL}audio/ambient.mp3`

// Nodos de audio (se crean post-init)
let _fxGain: Tone.Volume | null = null
let _bgGain: Tone.Volume | null = null
let _bgPlayer: Tone.Player | null = null
let _tapSynth: Tone.Synth | null = null
let _correctPoly: Tone.PolySynth<Tone.Synth> | null = null
let _errorSynth: Tone.Synth | null = null
let _completePoly: Tone.PolySynth<Tone.Synth> | null = null

// ── Inicialización ─────────────────────────────────────────────────────────

function _handleVisibilityChange(): void {
  if (!_bgPlayer || !_bgLoaded || !_musicEnabled) return
  if (document.hidden) {
    if (_bgPlayer.state === 'started') _bgPlayer.stop()
  } else {
    if (Tone.getContext().state === 'suspended') void Tone.start()
    if (_bgPlayer.state !== 'started') _bgPlayer.start()
  }
}

export async function initAudio(): Promise<void> {
  if (_initialized) return
  try {
    await Tone.start()
    _initialized = true
    _buildSynths()
    _loadMusic()
    document.addEventListener('visibilitychange', _handleVisibilityChange)
  } catch (err) {
    console.warn('[Lúcida Audio] Error al inicializar:', err)
  }
}

function _buildSynths(): void {
  _fxGain = new Tone.Volume(_fxVolume).toDestination()

  // Tap: onda triangular, muy corto y suave
  _tapSynth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.04 },
  }).connect(_fxGain)

  // Correct: dos notas ascendentes cálidas (E5 → G5)
  _correctPoly = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.05, release: 0.25 },
  }).connect(_fxGain)

  // Error: nota grave y suave — reorientación, no punición
  _errorSynth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.03, decay: 0.35, sustain: 0.05, release: 0.4 },
  }).connect(_fxGain)

  // Complete: arpegio breve ascendente (C5 → E5 → G5)
  _completePoly = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.22, sustain: 0.08, release: 0.3 },
  }).connect(_fxGain)
}

function _loadMusic(): void {
  try {
    _bgGain = new Tone.Volume(_musicVolume).toDestination()
    _bgPlayer = new Tone.Player({
      url: MUSIC_URL,
      loop: true,
      autostart: false,
      onload: () => {
        _bgLoaded = true
        console.info('[Lúcida Audio] Música de fondo cargada.')
        if (_musicEnabled) _bgPlayer?.start()
      },
      onerror: () => {
        console.info('[Lúcida Audio] Archivo de música no encontrado. Continuando sin música.')
        _bgLoaded = false
        _bgPlayer = null
        _bgGain?.dispose()
        _bgGain = null
      },
    }).connect(_bgGain)
  } catch (err) {
    console.warn('[Lúcida Audio] Error al preparar reproductor:', err)
  }
}

// ── Configuración (llamado desde useAudioSync al cambiar prefs/modo) ────────

export interface AudioConfig {
  fxEnabled: boolean
  musicEnabled: boolean
  fxVolume: number
  musicVolume: number
  duckingEnabled: boolean
}

export function configure(opts: AudioConfig): void {
  const wasEnabled = _musicEnabled

  _fxEnabled = opts.fxEnabled
  _duckingEnabled = opts.duckingEnabled

  if (opts.fxVolume !== _fxVolume) {
    _fxVolume = opts.fxVolume
    if (_fxGain) _fxGain.volume.value = _fxVolume
  }

  const musicChanged = opts.musicVolume !== _musicVolume || opts.musicEnabled !== _musicEnabled
  if (musicChanged) {
    _musicVolume = opts.musicVolume
    _musicEnabled = opts.musicEnabled

    if (!_isDucked && _bgGain) {
      _bgGain.volume.rampTo(_musicVolume, 0.2)
    }

    if (_initialized && _bgLoaded && _bgPlayer) {
      if (_musicEnabled && !wasEnabled) {
        _bgPlayer.start()
      } else if (!_musicEnabled && wasEnabled && _bgPlayer.state === 'started') {
        _bgPlayer.stop()
      }
    }
  }
}

// ── Efectos de sonido ──────────────────────────────────────────────────────

export function playTap(): void {
  if (!_initialized || !_fxEnabled || !_tapSynth) return
  try {
    _tapSynth.triggerAttackRelease('A4', '32n')
  } catch { /* noop */ }
}

// Notas por color de Secuencias: C major add6 (C–E–G–A)
const SEQUENCE_NOTES: Record<string, string> = {
  agil: 'A4',   // ámbar — el más brillante
  sereno: 'E4', // verde — melodioso
  calmo: 'C4',  // terracota — cálido, grave
  gentle: 'G4', // arena — neutro
}

export function playSequenceTap(colorId: string): void {
  if (!_initialized || !_fxEnabled || !_tapSynth) return
  try {
    _tapSynth.triggerAttackRelease(SEQUENCE_NOTES[colorId] ?? 'A4', '16n')
  } catch { /* noop */ }
}

export function playCorrect(): void {
  if (!_initialized || !_fxEnabled || !_correctPoly) return
  try {
    const t = Tone.now()
    _correctPoly.triggerAttackRelease('E5', '8n', t)
    _correctPoly.triggerAttackRelease('G5', '8n', t + 0.1)
  } catch { /* noop */ }
}

export function playError(): void {
  if (!_initialized || !_fxEnabled || !_errorSynth) return
  try {
    _errorSynth.triggerAttackRelease('A3', '4n')
  } catch { /* noop */ }
}

export function playComplete(): void {
  if (!_initialized || !_fxEnabled || !_completePoly) return
  try {
    const t = Tone.now()
    _completePoly.triggerAttackRelease('C5', '8n', t)
    _completePoly.triggerAttackRelease('E5', '8n', t + 0.11)
    _completePoly.triggerAttackRelease('G5', '8n', t + 0.22)
  } catch { /* noop */ }
}

// ── Ducking TTS (Calmo: la voz tiene prioridad sobre la música) ────────────

export function duckMusic(): void {
  if (!_duckingEnabled || !_bgGain || !_musicEnabled) return
  _isDucked = true
  _bgGain.volume.rampTo(-60, 0.3)
}

export function unduckMusic(): void {
  if (!_isDucked || !_bgGain) return
  _isDucked = false
  _bgGain.volume.rampTo(_musicVolume, 0.6)
}
