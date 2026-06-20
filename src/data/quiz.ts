import type { Difficulty } from '../modes/types'

/**
 * Banco de preguntas del quiz de cultura general.
 *
 * Cómo agregar preguntas: sumá objetos a `QUIZ_BANK` respetando `QuizQuestion`.
 *  - `level`: 'baja' (fácil), 'media' (medio), 'alta' (difícil).
 *  - `options`: 4 opciones; `correctIndex` apunta a la correcta (0–3).
 *  - El motor recorta/baraja las opciones según el modo, así que no hace falta
 *    pre-ordenarlas. No toques lógica para agregar preguntas: sólo datos.
 */

export type QuizCategory =
  | 'historia'
  | 'geografia'
  | 'ciencia'
  | 'arte'
  | 'musica'
  | 'refranes'
  | 'vida'

export const CATEGORY_LABEL: Record<QuizCategory, string> = {
  historia: 'Historia',
  geografia: 'Geografía',
  ciencia: 'Ciencia',
  arte: 'Arte',
  musica: 'Música',
  refranes: 'Refranes',
  vida: 'Vida cotidiana',
}

export interface QuizQuestion {
  id: string
  category: QuizCategory
  level: Difficulty
  prompt: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  explanation?: string
}

export const QUIZ_BANK: readonly QuizQuestion[] = [
  // ── Geografía ──────────────────────────────────────────────────────────
  {
    id: 'geo-eiffel',
    category: 'geografia',
    level: 'baja',
    prompt: '¿En qué país se encuentra la Torre Eiffel?',
    options: ['Francia', 'Italia', 'España', 'Bélgica'],
    correctIndex: 0,
  },
  {
    id: 'geo-capital-arg',
    category: 'geografia',
    level: 'baja',
    prompt: '¿Cuál es la capital de Argentina?',
    options: ['Córdoba', 'Buenos Aires', 'Rosario', 'Mendoza'],
    correctIndex: 1,
  },
  {
    id: 'geo-oceano',
    category: 'geografia',
    level: 'media',
    prompt: '¿Cuál es el océano más grande del mundo?',
    options: ['Atlántico', 'Índico', 'Pacífico', 'Ártico'],
    correctIndex: 2,
    explanation: 'El Pacífico cubre cerca de un tercio de la superficie terrestre.',
  },
  {
    id: 'geo-rio-largo',
    category: 'geografia',
    level: 'alta',
    prompt: '¿Cuál de estos ríos es el más largo?',
    options: ['Amazonas', 'Paraná', 'Danubio', 'Ebro'],
    correctIndex: 0,
  },
  {
    id: 'geo-cataratas',
    category: 'geografia',
    level: 'media',
    prompt: '¿Entre qué dos países se comparten las Cataratas del Iguazú?',
    options: ['Argentina y Chile', 'Argentina y Brasil', 'Brasil y Bolivia', 'Argentina y Uruguay'],
    correctIndex: 1,
  },
  {
    id: 'geo-desierto',
    category: 'geografia',
    level: 'alta',
    prompt: '¿En qué continente está el desierto del Sahara?',
    options: ['Asia', 'Oceanía', 'África', 'América'],
    correctIndex: 2,
  },

  // ── Historia ───────────────────────────────────────────────────────────
  {
    id: 'his-1810',
    category: 'historia',
    level: 'baja',
    prompt: '¿Qué se conmemora el 25 de Mayo en Argentina?',
    options: ['La independencia', 'La Revolución de Mayo', 'La batalla de San Lorenzo', 'La fundación de Buenos Aires'],
    correctIndex: 1,
  },
  {
    id: 'his-america',
    category: 'historia',
    level: 'baja',
    prompt: '¿En qué año llegó Cristóbal Colón a América?',
    options: ['1492', '1510', '1453', '1607'],
    correctIndex: 0,
  },
  {
    id: 'his-piramides',
    category: 'historia',
    level: 'media',
    prompt: '¿Qué civilización construyó las grandes pirámides de Guiza?',
    options: ['Los romanos', 'Los griegos', 'Los egipcios', 'Los mayas'],
    correctIndex: 2,
  },
  {
    id: 'his-muro',
    category: 'historia',
    level: 'media',
    prompt: '¿En qué ciudad cayó el muro que la dividía en 1989?',
    options: ['Praga', 'Berlín', 'Viena', 'Varsovia'],
    correctIndex: 1,
  },
  {
    id: 'his-sanmartin',
    category: 'historia',
    level: 'alta',
    prompt: '¿Qué cordillera cruzó San Martín para liberar Chile?',
    options: ['Los Pirineos', 'Los Alpes', 'Los Andes', 'Sierra Nevada'],
    correctIndex: 2,
  },
  {
    id: 'his-imprenta',
    category: 'historia',
    level: 'alta',
    prompt: '¿A quién se atribuye la imprenta moderna de tipos móviles?',
    options: ['Gutenberg', 'Da Vinci', 'Galileo', 'Edison'],
    correctIndex: 0,
  },

  // ── Ciencia ────────────────────────────────────────────────────────────
  {
    id: 'cie-sol',
    category: 'ciencia',
    level: 'baja',
    prompt: '¿Qué astro está en el centro de nuestro sistema solar?',
    options: ['La Luna', 'El Sol', 'La Tierra', 'Marte'],
    correctIndex: 1,
  },
  {
    id: 'cie-agua',
    category: 'ciencia',
    level: 'baja',
    prompt: '¿Cuántas patas tiene una araña?',
    options: ['Seis', 'Ocho', 'Diez', 'Cuatro'],
    correctIndex: 1,
  },
  {
    id: 'cie-planeta',
    category: 'ciencia',
    level: 'media',
    prompt: '¿Cuál es el planeta más grande del sistema solar?',
    options: ['Saturno', 'Júpiter', 'Neptuno', 'La Tierra'],
    correctIndex: 1,
  },
  {
    id: 'cie-h2o',
    category: 'ciencia',
    level: 'media',
    prompt: '¿Qué gas respiramos del aire para vivir?',
    options: ['Hidrógeno', 'Nitrógeno', 'Oxígeno', 'Helio'],
    correctIndex: 2,
  },
  {
    id: 'cie-velocidad',
    category: 'ciencia',
    level: 'alta',
    prompt: '¿Qué viaja más rápido?',
    options: ['El sonido', 'La luz', 'El viento', 'Un avión'],
    correctIndex: 1,
  },
  {
    id: 'cie-huesos',
    category: 'ciencia',
    level: 'alta',
    prompt: '¿Cuál es el hueso más largo del cuerpo humano?',
    options: ['El fémur', 'La tibia', 'El húmero', 'La columna'],
    correctIndex: 0,
  },

  // ── Arte ───────────────────────────────────────────────────────────────
  {
    id: 'art-noche',
    category: 'arte',
    level: 'media',
    prompt: '¿Quién pintó «La noche estrellada»?',
    options: ['Vincent van Gogh', 'Claude Monet', 'Pablo Picasso', 'Salvador Dalí'],
    correctIndex: 0,
  },
  {
    id: 'art-gioconda',
    category: 'arte',
    level: 'baja',
    prompt: '¿Quién pintó «La Gioconda» (la Mona Lisa)?',
    options: ['Rafael', 'Miguel Ángel', 'Leonardo da Vinci', 'Tiziano'],
    correctIndex: 2,
  },
  {
    id: 'art-escultura',
    category: 'arte',
    level: 'alta',
    prompt: '¿Quién esculpió el «David» de mármol en Florencia?',
    options: ['Donatello', 'Miguel Ángel', 'Bernini', 'Rodin'],
    correctIndex: 1,
  },
  {
    id: 'art-color',
    category: 'arte',
    level: 'media',
    prompt: '¿Qué colores se mezclan para obtener el verde?',
    options: ['Rojo y azul', 'Azul y amarillo', 'Rojo y amarillo', 'Blanco y negro'],
    correctIndex: 1,
  },

  // ── Música ─────────────────────────────────────────────────────────────
  {
    id: 'mus-tango',
    category: 'musica',
    level: 'media',
    prompt: '¿Qué instrumento es típico del tango rioplatense?',
    options: ['El acordeón', 'El bandoneón', 'El violonchelo', 'La trompeta'],
    correctIndex: 1,
  },
  {
    id: 'mus-cuerdas',
    category: 'musica',
    level: 'baja',
    prompt: '¿Cuántas cuerdas tiene una guitarra clásica?',
    options: ['Cuatro', 'Seis', 'Ocho', 'Doce'],
    correctIndex: 1,
  },
  {
    id: 'mus-beethoven',
    category: 'musica',
    level: 'alta',
    prompt: '¿Qué compositor siguió creando música ya sordo?',
    options: ['Mozart', 'Beethoven', 'Bach', 'Chopin'],
    correctIndex: 1,
  },
  {
    id: 'mus-orquesta',
    category: 'musica',
    level: 'media',
    prompt: '¿Quién dirige una orquesta?',
    options: ['El solista', 'El director', 'El concertino', 'El compositor'],
    correctIndex: 1,
  },

  // ── Refranes ───────────────────────────────────────────────────────────
  {
    id: 'ref-pajaro',
    category: 'refranes',
    level: 'baja',
    prompt: 'Completá: «Más vale pájaro en mano…»',
    options: ['…que perro ladrando', '…que cien volando', '…que tarde que nunca', '…que mal acompañado'],
    correctIndex: 1,
  },
  {
    id: 'ref-madruga',
    category: 'refranes',
    level: 'baja',
    prompt: 'Completá: «Al que madruga…»',
    options: ['…Dios lo ayuda', '…le duele la cabeza', '…se le hace tarde', '…nadie lo espera'],
    correctIndex: 0,
  },
  {
    id: 'ref-sancho',
    category: 'refranes',
    level: 'media',
    prompt: '«No por mucho madrugar amanece más temprano» aconseja…',
    options: ['Apurarse siempre', 'Que apurarse no adelanta todo', 'Dormir de día', 'Llegar tarde'],
    correctIndex: 1,
  },
  {
    id: 'ref-rio',
    category: 'refranes',
    level: 'media',
    prompt: '«A río revuelto, ganancia de…»',
    options: ['Pescadores', 'Marineros', 'Vecinos', 'Pocos'],
    correctIndex: 0,
  },
  {
    id: 'ref-camaron',
    category: 'refranes',
    level: 'alta',
    prompt: '«Camarón que se duerme…»',
    options: ['…no come nada', '…se lo lleva la corriente', '…sueña con el mar', '…despierta cansado'],
    correctIndex: 1,
  },

  // ── Vida cotidiana ─────────────────────────────────────────────────────
  {
    id: 'vid-mate',
    category: 'vida',
    level: 'baja',
    prompt: '¿Con qué planta se prepara el mate?',
    options: ['Yerba mate', 'Manzanilla', 'Té negro', 'Menta'],
    correctIndex: 0,
  },
  {
    id: 'vid-semana',
    category: 'vida',
    level: 'baja',
    prompt: '¿Cuántos días tiene una semana?',
    options: ['Cinco', 'Seis', 'Siete', 'Ocho'],
    correctIndex: 2,
  },
  {
    id: 'vid-estaciones',
    category: 'vida',
    level: 'baja',
    prompt: '¿En qué estación caen las hojas de los árboles?',
    options: ['Verano', 'Otoño', 'Primavera', 'Invierno'],
    correctIndex: 1,
  },
  {
    id: 'vid-pan',
    category: 'vida',
    level: 'media',
    prompt: '¿Qué ingrediente hace que el pan leve y crezca?',
    options: ['La sal', 'La levadura', 'El azúcar', 'El agua'],
    correctIndex: 1,
  },
  {
    id: 'vid-brujula',
    category: 'vida',
    level: 'media',
    prompt: '¿Hacia qué punto cardinal señala siempre una brújula?',
    options: ['Norte', 'Sur', 'Este', 'Oeste'],
    correctIndex: 0,
  },
  {
    id: 'vid-reloj',
    category: 'vida',
    level: 'baja',
    prompt: '¿Cuántos minutos tiene una hora?',
    options: ['Treinta', 'Cuarenta y cinco', 'Sesenta', 'Cien'],
    correctIndex: 2,
  },
  {
    id: 'vid-arcoiris',
    category: 'vida',
    level: 'media',
    prompt: '¿Qué fenómeno aparece cuando llueve y sale el sol?',
    options: ['La niebla', 'El arcoíris', 'La helada', 'El relámpago'],
    correctIndex: 1,
  },

  // ── Extra para variedad ───────────────────────────────────────────────
  {
    id: 'geo-continentes',
    category: 'geografia',
    level: 'media',
    prompt: '¿Cuántos continentes hay en la Tierra?',
    options: ['Cinco', 'Seis', 'Siete', 'Cuatro'],
    correctIndex: 2,
  },
  {
    id: 'cie-abeja',
    category: 'ciencia',
    level: 'media',
    prompt: '¿Qué producen las abejas además de cera?',
    options: ['Seda', 'Miel', 'Leche', 'Aceite'],
    correctIndex: 1,
  },
  {
    id: 'his-rueda',
    category: 'historia',
    level: 'baja',
    prompt: '¿Qué invento facilitó el transporte desde la antigüedad?',
    options: ['La rueda', 'El motor', 'El avión', 'La bicicleta'],
    correctIndex: 0,
  },
  {
    id: 'art-instrumento-pintura',
    category: 'arte',
    level: 'baja',
    prompt: '¿Con qué se aplica la pintura sobre un lienzo?',
    options: ['Un cincel', 'Un pincel', 'Una lima', 'Una aguja'],
    correctIndex: 1,
  },
]
