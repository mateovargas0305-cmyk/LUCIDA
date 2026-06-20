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
  },
  timing: {
    timerAllowed: true,
    secondsPerQuestion: 20,
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
    },
    memory: {
      columns: 4,
      pairs: 8,
      flipBackMs: 800,
    },
    calc: {
      operations: ['suma', 'resta', 'multiplicacion', 'secuencia', 'porcentaje'],
      optionCount: 4,
      maxOperand: 99,
      rounds: 10,
    },
    attention: {
      items: 20,
      columns: 4,
      differBy: 'forma',
      subtle: true,
      rounds: 8,
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
    },
    memory: {
      columns: 3,
      pairs: 6,
      flipBackMs: 900,
    },
    calc: {
      operations: ['suma', 'resta', 'multiplicacion'],
      optionCount: 4,
      maxOperand: 25,
      rounds: 8,
    },
    attention: {
      items: 9,
      columns: 3,
      differBy: 'forma',
      subtle: false,
      rounds: 6,
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
    },
    memory: {
      columns: 2,
      pairs: 2,
      flipBackMs: 1300,
    },
    calc: {
      operations: ['suma', 'resta'],
      optionCount: 3,
      maxOperand: 10,
      rounds: 5,
    },
    attention: {
      items: 4,
      columns: 2,
      differBy: 'color',
      subtle: false,
      rounds: 4,
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
