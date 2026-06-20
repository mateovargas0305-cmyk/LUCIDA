/**
 * Capa central de configuración por modo.
 *
 * TODA actividad consume de acá. Prohibido dispersar lógica "si el modo es X…"
 * por los componentes: si una actividad necesita un parámetro nuevo dependiente
 * del modo, se agrega a estos tipos y a `configs.ts`, y recién después se usa.
 */

export type ModeId = 'agil' | 'sereno' | 'calmo'

/** Token de color de acento asociado al modo (ver theme/tokens). */
export type AccentToken = 'agil' | 'sereno' | 'calmo'

export type Difficulty = 'baja' | 'media' | 'alta'

/** Cómo se comunica un error al usuario. */
export type ErrorFeedback =
  | 'gamificado' // marca ✕, resta de racha, energía
  | 'neutral' // se marca la correcta, sin dramatismo
  | 'amable' // reorientación suave, sólo refuerzo positivo (Calmo)

/** Energía de las animaciones (se traduce a transiciones de Framer Motion). */
export type MotionEnergy = 'energico' | 'sereno' | 'minimo'

/** Operaciones habilitadas en la actividad de cálculo. */
export type CalcOperation =
  | 'suma'
  | 'resta'
  | 'multiplicacion'
  | 'secuencia'
  | 'porcentaje'

/** Qué distingue al elemento "diferente" en la actividad de atención. */
export type AttentionDiffBy = 'color' | 'forma'

/** Dimensión en la que puede variar el elemento diferente entre rondas. */
export type AttentionDiffDimension = 'color' | 'forma' | 'tamaño'

/** Escala tipográfica en px. En Calmo, `base` nunca baja de 24 (regla sagrada). */
export interface ModeTypography {
  /** Texto base de cuerpo. */
  baseTextPx: number
  /** Titular principal de pantalla. */
  headingPx: number
  /** Texto dentro de opciones y botones. */
  controlTextPx: number
  /** Texto auxiliar / etiquetas. */
  captionPx: number
}

/** Geometría y tamaño de controles táctiles. */
export interface ModeControls {
  /** Alto mínimo de botones primarios en px. Calmo ≥ 64 (sagrado). */
  primaryButtonMinHeightPx: number
  /** Alto/lado mínimo de cualquier target táctil en px. Calmo ≥ 64. */
  tapTargetMinPx: number
  /** Radio de tarjetas/botones (clave de `borderRadius` en Tailwind). */
  radius: 'xl' | '2xl' | '3xl' | '4xl'
  /** Espaciado vertical entre bloques, en px. */
  blockGapPx: number
}

/** Reglas de puntaje y progreso. */
export interface ModeScoring {
  /** ¿Se muestra y acumula puntaje? Calmo: false. */
  enabled: boolean
  /** ¿Se muestra racha de días/aciertos? */
  showStreak: boolean
  /** ¿Se muestra barra de progreso de sesión? */
  showProgressBar: boolean
  /** ¿Puede el puntaje bajar por error? Calmo: nunca (y por defecto, nadie). */
  allowNegative: boolean
  /** Puntos por respuesta correcta (0 si `enabled` es false). */
  pointsPerCorrect: number
  /** Bonus de racha: puntos extra al acertar N veces seguidas. */
  streakBonusEnabled: boolean
  /** Cuántos aciertos consecutivos activan el bonus de racha. */
  streakBonusThreshold: number
  /** Puntos extra por cada acierto mientras dure la racha. */
  streakBonusPoints: number
  /** Bonus de velocidad: puntos extra al responder dentro del umbral de tiempo. */
  speedBonusEnabled: boolean
  /** Fracción del tiempo total: si el usuario responde antes de este % del timer, gana bonus (0–1). */
  speedBonusThresholdPct: number
  /** Puntos extra por respuesta rápida. */
  speedBonusPoints: number
}

/** Reglas de tiempo. Calmo: jamás temporizadores. */
export interface ModeTiming {
  /** ¿Se permiten temporizadores en este modo? Calmo: false (sagrado). */
  timerAllowed: boolean
  /** Segundos por pregunta cuando hay timer; null = sin límite. */
  secondsPerQuestion: number | null
}

/** Cómo se da feedback de error y de acierto. */
export interface ModeFeedback {
  onError: ErrorFeedback
  /** Mostrar una marca de error explícita (✕). Calmo: false. */
  showErrorMark: boolean
  /** Mensaje de reorientación ante error. */
  errorMessage: string
  /** Mensaje de refuerzo ante acierto. */
  successMessage: string
}

/** Reglas de navegación y densidad de pantalla. */
export interface ModeNavigation {
  /** Una sola acción/decisión por pantalla. Calmo: true. */
  oneActionPerScreen: boolean
  /** Botón "Siguiente" siempre visible. Calmo: true. */
  persistentNext: boolean
  /** Permitir grilla de varias actividades a la vez en el inicio. */
  multiColumnHome: boolean
}

// ── Configuración por actividad ────────────────────────────────────────────

export interface QuizActivityConfig {
  /** Cuántas opciones de respuesta mostrar. */
  optionsToShow: number
  /** Niveles de pregunta admitidos en este modo. */
  levels: Difficulty[]
  /** Mostrar la etiqueta de categoría sobre la pregunta. */
  showCategoryTag: boolean
  /** Preguntas por sesión. */
  questionsPerSession: number
  /** Opciones con letra (A/B/C/D) en vez de botones grandes. */
  letteredOptions: boolean
  /** Botón "Escuchar la pregunta" (lectura por voz). Calmo: true. */
  showVoiceButton: boolean
  /**
   * Ante error, permitir reintentar sin bloquear (refuerzo positivo de Calmo).
   * Si es false, la primera respuesta fija el resultado y revela la correcta.
   */
  retryOnError: boolean
  /**
   * Pesos relativos por nivel al samplear preguntas.
   * Ejemplo Ágil: `{ alta: 3, media: 1, baja: 0 }` prioriza preguntas difíciles.
   * Vacío = todos los niveles con peso igual.
   */
  levelWeights: Partial<Record<Difficulty, number>>
}

export interface MemoryActivityConfig {
  /** Columnas de la grilla. */
  columns: number
  /** Cantidad de parejas a encontrar. */
  pairs: number
  /** Ms que una pareja no coincidente queda visible antes de ocultarse. */
  flipBackMs: number
  /** Mostrar cronómetro de tiempo total. Calmo: false (regla sagrada). */
  showTimer: boolean
}

export interface CalcActivityConfig {
  /** Operaciones habilitadas. */
  operations: CalcOperation[]
  /** Cantidad de opciones de respuesta. */
  optionCount: number
  /** Operando máximo al generar problemas. */
  maxOperand: number
  /** Ejercicios por sesión (el cálculo es infinito; esto define una ronda). */
  rounds: number
  /** Si es true, los últimos ejercicios usan operandos más grandes que los primeros. */
  escalateWithinSession: boolean
}

export interface AttentionActivityConfig {
  /** Cantidad base de elementos en la grilla. */
  items: number
  /** Columnas de la grilla. */
  columns: number
  /** @deprecated Usa differDimensions. Mantenido por compatibilidad con configs. */
  differBy: AttentionDiffBy
  /** @deprecated Usa difficultyStep. */
  subtle: boolean
  /** Rondas por sesión (solo en modo 'rounds'). */
  rounds: number
  /** 'rounds': N rondas clásicas (Calmo). 'time-attack': tiempo total fijo con score. */
  sessionMode: 'rounds' | 'time-attack'
  /** Duración total en segundos para time-attack (null = no aplica). */
  sessionDurationSeconds: number | null
  /** Dimensiones que puede variar el elemento diferente entre rondas. */
  differDimensions: AttentionDiffDimension[]
  /** Incremento de dificultad por acierto (0–1). 0 en Calmo. */
  difficultyStep: number
}

export interface SequenceActivityConfig {
  /** Cuántos colores/botones distintos. */
  colorCount: number
  /** Longitud inicial de la secuencia. */
  startLength: number
  /** Cuántas rondas exitosas antes del resumen. */
  maxRounds: number
  /** Ms que cada elemento permanece resaltado durante la reproducción. */
  playbackSpeedMs: number
  /** Ms de pausa entre elementos durante la reproducción. */
  pauseBetweenMs: number
  /** Ante error, permitir reintentar la misma secuencia (Calmo: true). */
  retryOnError: boolean
}

export interface ChainedCalcActivityConfig {
  /** Cantidad de operaciones en la cadena. */
  chainLength: number
  /** Operaciones disponibles para generar la cadena. */
  operations: CalcOperation[]
  /** Operando máximo. */
  maxOperand: number
  /** Rondas por sesión. */
  rounds: number
  /**
   * Mostrar los resultados intermedios de cada paso.
   * Calmo/Sereno: true (ven el número que va corriendo).
   * Ágil: false (deben calcular mentalmente toda la cadena).
   */
  showIntermediateResults: boolean
  escalateWithinSession: boolean
}

export interface StroopActivityConfig {
  rounds: number
  /**
   * Fracción de ensayos incongruentes (tinta ≠ palabra). 0 = siempre congruente
   * (Calmo, sin interferencia); 1 = siempre incongruente (máxima interferencia).
   */
  incongruencyRate: number
  /** Cuántos colores distintos (2–4). */
  colorCount: number
  /**
   * Mostrar botones de opción con su propio color de fondo para ayudar al
   * reconocimiento. Calmo: true. Ágil/Sereno: false (no dar pistas visuales).
   */
  coloredOptionButtons: boolean
}

export interface SymbolSpeedActivityConfig {
  rounds: number
  /** Cuántos símbolos distintos en la clave de referencia (3–6). */
  symbolCount: number
}

export interface ModeActivities {
  quiz: QuizActivityConfig
  memory: MemoryActivityConfig
  calc: CalcActivityConfig
  attention: AttentionActivityConfig
  sequence: SequenceActivityConfig
  chainedCalc: ChainedCalcActivityConfig
  stroop: StroopActivityConfig
  symbolSpeed: SymbolSpeedActivityConfig
}

/** Identificador de actividad (para iterar el inicio y rutas). */
export type ActivityId = keyof ModeActivities

// ── Configuración completa del modo ─────────────────────────────────────────

export interface ModeConfig {
  id: ModeId
  /** Nombre visible ("Ágil"). */
  label: string
  /** Frase corta bajo el nombre. */
  tagline: string
  /** Etiqueta breve ("Dinámico" / "Equilibrado" / "Accesible"). */
  badge: string
  /** Token de color de acento. */
  accent: AccentToken
  difficulty: Difficulty
  typography: ModeTypography
  controls: ModeControls
  scoring: ModeScoring
  timing: ModeTiming
  feedback: ModeFeedback
  navigation: ModeNavigation
  motion: MotionEnergy
  activities: ModeActivities
}
