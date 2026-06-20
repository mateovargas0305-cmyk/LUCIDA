import type { ModeConfig, ModeId } from './types'

/**
 * Definición concreta de los tres modos.
 *
 * Calmo cumple las reglas SAGRADAS (no se relajan jamás):
 *  - texto base ≥ 24px, botones ≥ 64px de alto
 *  - sin temporizadores, sin puntaje, sin penalización
 *  - feedback de error amable, una acción por pantalla, "Siguiente" siempre visible
 */

const agil: ModeConfig = {
  id: 'agil',
  label: 'Ágil',
  tagline: 'Retos rápidos, puntaje y rachas.',
  badge: 'Dinámico',
  accent: 'agil',
  difficulty: 'alta',
  typography: {
    baseTextPx: 16,
    headingPx: 24,
    controlTextPx: 17,
    captionPx: 13,
  },
  controls: {
    primaryButtonMinHeightPx: 54,
    tapTargetMinPx: 44,
    radius: 'xl',
    blockGapPx: 12,
  },
  scoring: {
    enabled: true,
    showStreak: true,
    showProgressBar: true,
    allowNegative: false,
    pointsPerCorrect: 40,
    // Racha: ≥3 aciertos seguidos suman bonus.
    streakBonusEnabled: true,
    streakBonusThreshold: 3,
    streakBonusPoints: 20,
    // Velocidad: responder en los primeros 45% del tiempo da puntos extra.
    speedBonusEnabled: true,
    speedBonusThresholdPct: 0.45,
    speedBonusPoints: 15,
  },
  timing: {
    timerAllowed: true,
    secondsPerQuestion: 15, // más agresivo que los 20 anteriores
  },
  feedback: {
    onError: 'gamificado',
    showErrorMark: true,
    errorMessage: 'Casi. La respuesta correcta queda marcada.',
    successMessage: '¡Correcto!',
  },
  navigation: {
    oneActionPerScreen: false,
    persistentNext: false,
    multiColumnHome: true,
  },
  motion: 'energico',
  activities: {
    quiz: {
      optionsToShow: 4,
      levels: ['baja', 'media', 'alta'],
      showCategoryTag: true,
      questionsPerSession: 10,
      letteredOptions: true,
      showVoiceButton: false,
      retryOnError: false,
      // Prioriza preguntas difíciles (alta 3×, media 1×, baja excluida).
      levelWeights: { alta: 3, media: 1, baja: 0 },
    },
    memory: {
      // Grilla más grande: 4×6 = 24 cartas (12 parejas).
      columns: 4,
      pairs: 12,
      flipBackMs: 700,
      showTimer: true,
    },
    calc: {
      operations: ['suma', 'resta', 'multiplicacion', 'secuencia', 'porcentaje'],
      optionCount: 4,
      maxOperand: 150, // números más grandes
      rounds: 12,
      escalateWithinSession: true, // las últimas rondas son más exigentes
    },
    attention: {
      items: 16,
      columns: 4,
      differBy: 'forma',
      subtle: false,
      rounds: 0,
      sessionMode: 'time-attack',
      sessionDurationSeconds: 15,
      differDimensions: ['color', 'forma', 'tamaño'],
      difficultyStep: 0.12,
    },
  },
}

const sereno: ModeConfig = {
  id: 'sereno',
  label: 'Sereno',
  tagline: 'Ritmo claro, sin presión ni tiempo.',
  badge: 'Equilibrado',
  accent: 'sereno',
  difficulty: 'media',
  typography: {
    baseTextPx: 18,
    headingPx: 26,
    controlTextPx: 19,
    captionPx: 14,
  },
  controls: {
    primaryButtonMinHeightPx: 58,
    tapTargetMinPx: 48,
    radius: '2xl',
    blockGapPx: 16,
  },
  scoring: {
    enabled: true,
    showStreak: false,
    showProgressBar: true,
    allowNegative: false,
    pointsPerCorrect: 20,
    streakBonusEnabled: false,
    streakBonusThreshold: 0,
    streakBonusPoints: 0,
    speedBonusEnabled: false,
    speedBonusThresholdPct: 0,
    speedBonusPoints: 0,
  },
  timing: {
    timerAllowed: false,
    secondsPerQuestion: null,
  },
  feedback: {
    onError: 'neutral',
    showErrorMark: false,
    errorMessage: 'Casi. Mirá cuál era la correcta.',
    successMessage: '¡Bien hecho!',
  },
  navigation: {
    oneActionPerScreen: false,
    persistentNext: true,
    multiColumnHome: true,
  },
  motion: 'sereno',
  activities: {
    quiz: {
      optionsToShow: 4,
      levels: ['baja', 'media'],
      showCategoryTag: true,
      questionsPerSession: 8,
      letteredOptions: true,
      showVoiceButton: false,
      retryOnError: false,
      levelWeights: {},
    },
    memory: {
      columns: 3,
      pairs: 6,
      flipBackMs: 900,
      showTimer: true,
    },
    calc: {
      operations: ['suma', 'resta', 'multiplicacion'],
      optionCount: 4,
      maxOperand: 25,
      rounds: 8,
      escalateWithinSession: false,
    },
    attention: {
      items: 9,
      columns: 3,
      differBy: 'forma',
      subtle: false,
      rounds: 0,
      sessionMode: 'time-attack',
      sessionDurationSeconds: 25,
      differDimensions: ['color', 'forma'],
      difficultyStep: 0.08,
    },
  },
}

const calmo: ModeConfig = {
  id: 'calmo',
  label: 'Calmo',
  tagline: 'Letra grande, paso a paso, con calma.',
  badge: 'Accesible',
  accent: 'calmo',
  difficulty: 'baja',
  typography: {
    // Regla sagrada: base ≥ 24px.
    baseTextPx: 24,
    headingPx: 32,
    controlTextPx: 28,
    captionPx: 18,
  },
  controls: {
    // Regla sagrada: botones ≥ 64px de alto.
    primaryButtonMinHeightPx: 74,
    tapTargetMinPx: 64,
    radius: '3xl',
    blockGapPx: 22,
  },
  scoring: {
    // Regla sagrada: sin puntaje ni penalización.
    enabled: false,
    showStreak: false,
    showProgressBar: false,
    allowNegative: false,
    pointsPerCorrect: 0,
    // Regla sagrada: nunca bonus ni presión en Calmo.
    streakBonusEnabled: false,
    streakBonusThreshold: 0,
    streakBonusPoints: 0,
    speedBonusEnabled: false,
    speedBonusThresholdPct: 0,
    speedBonusPoints: 0,
  },
  timing: {
    // Regla sagrada: nunca temporizadores.
    timerAllowed: false,
    secondsPerQuestion: null,
  },
  feedback: {
    // Regla sagrada: reorientar con suavidad, sólo refuerzo positivo.
    onError: 'amable',
    showErrorMark: false,
    errorMessage: 'Mirá de nuevo, con calma.',
    successMessage: '¡Muy bien!',
  },
  navigation: {
    // Regla sagrada: una acción por pantalla, "Siguiente" siempre visible.
    oneActionPerScreen: true,
    persistentNext: true,
    multiColumnHome: false,
  },
  motion: 'minimo',
  activities: {
    quiz: {
      optionsToShow: 3,
      levels: ['baja'],
      showCategoryTag: false,
      questionsPerSession: 5,
      letteredOptions: false,
      showVoiceButton: true,
      retryOnError: true,
      levelWeights: {},
    },
    memory: {
      columns: 2,
      pairs: 2,
      flipBackMs: 1300,
      showTimer: false, // regla sagrada: sin cronómetro en Calmo
    },
    calc: {
      operations: ['suma', 'resta'],
      optionCount: 3,
      maxOperand: 10,
      rounds: 5,
      escalateWithinSession: false,
    },
    attention: {
      items: 4,
      columns: 2,
      differBy: 'color',
      subtle: false,
      rounds: 4,
      sessionMode: 'rounds', // regla sagrada: sin tiempo en Calmo
      sessionDurationSeconds: null,
      differDimensions: ['color'],
      difficultyStep: 0,
    },
  },
}

export const MODE_CONFIGS: Record<ModeId, ModeConfig> = { agil, sereno, calmo }

/** Orden de presentación en la pantalla de selección. */
export const MODE_ORDER: readonly ModeId[] = ['agil', 'sereno', 'calmo']

export const DEFAULT_MODE_ID: ModeId = 'sereno'

export function getModeConfig(id: ModeId): ModeConfig {
  return MODE_CONFIGS[id]
}
