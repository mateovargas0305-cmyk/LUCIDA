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
  /**
 * TANDA 1 — 30 preguntas nuevas para QUIZ_BANK.
 *
 * Cómo integrarlas: pegá estos objetos dentro del array `QUIZ_BANK` en
 * src/data/quiz.ts (antes del cierre `]`). No hace falta importar nada nuevo:
 * las categorías 'historia', 'geografia', 'ciencia', 'arte' y 'musica' ya
 * existen en QuizCategory. Los IDs llevan prefijo y sufijo nuevos para no
 * chocar con los existentes (geo-eiffel, his-1810, etc.).
 *
 * Reparto: 6 por categoría. Niveles mezclados (baja/media/alta) y enfoque
 * equilibrado Argentina/mundo. Las de nivel 'baja' tienden a memoria de largo
 * plazo (útiles para el Modo Calmo).
 */

  // ── Historia ───────────────────────────────────────────────────────────
  {
    id: 'his-indep-arg',
    category: 'historia',
    level: 'baja',
    prompt: '¿Qué se declaró el 9 de Julio de 1816 en Tucumán?',
    options: ['La Constitución', 'La Independencia', 'La Revolución de Mayo', 'El primer gobierno patrio'],
    correctIndex: 1,
  },
  {
    id: 'his-belgrano-bandera',
    category: 'historia',
    level: 'baja',
    prompt: '¿Quién creó la bandera argentina?',
    options: ['José de San Martín', 'Manuel Belgrano', 'Bernardino Rivadavia', 'Mariano Moreno'],
    correctIndex: 1,
  },
  {
    id: 'his-primera-guerra',
    category: 'historia',
    level: 'media',
    prompt: '¿En qué año comenzó la Primera Guerra Mundial?',
    options: ['1914', '1918', '1939', '1905'],
    correctIndex: 0,
  },
  {
    id: 'his-llegada-luna',
    category: 'historia',
    level: 'media',
    prompt: '¿En qué año llegó el ser humano a la Luna por primera vez?',
    options: ['1969', '1957', '1972', '1961'],
    correctIndex: 0,
    explanation: 'La misión Apolo 11 alunizó el 20 de julio de 1969.',
  },
  {
    id: 'his-roma-republica',
    category: 'historia',
    level: 'alta',
    prompt: '¿Qué imperio tuvo como capital a Constantinopla?',
    options: ['El Imperio Romano de Occidente', 'El Imperio Bizantino', 'El Imperio Otomano en su fundación', 'El Imperio Persa'],
    correctIndex: 1,
    explanation: 'Constantinopla fue capital del Imperio Bizantino (Romano de Oriente) hasta 1453.',
  },
  {
    id: 'his-revolucion-francesa',
    category: 'historia',
    level: 'alta',
    prompt: '¿Con qué hecho se asocia el inicio de la Revolución Francesa en 1789?',
    options: ['La coronación de Napoleón', 'La toma de la Bastilla', 'La batalla de Waterloo', 'La firma de la Carta Magna'],
    correctIndex: 1,
  },

  // ── Geografía ──────────────────────────────────────────────────────────
  {
    id: 'geo-aconcagua',
    category: 'geografia',
    level: 'baja',
    prompt: '¿Cuál es la montaña más alta de América, ubicada en Argentina?',
    options: ['El Aconcagua', 'El Chimborazo', 'El Illimani', 'El Tupungato'],
    correctIndex: 0,
  },
  {
    id: 'geo-capital-brasil',
    category: 'geografia',
    level: 'media',
    prompt: '¿Cuál es la capital de Brasil?',
    options: ['Río de Janeiro', 'São Paulo', 'Brasilia', 'Salvador'],
    correctIndex: 2,
    explanation: 'Brasilia es la capital desde 1960; Río fue la capital anterior.',
  },

  {
    id: 'geo-pais-mas-extenso',
    category: 'geografia',
    level: 'media',
    prompt: '¿Cuál es el país más extenso del mundo en superficie?',
    options: ['Canadá', 'China', 'Rusia', 'Estados Unidos'],
    correctIndex: 2,
  },
  {
    id: 'geo-provincia-arg',
    category: 'geografia',
    level: 'alta',
    prompt: '¿Cuál es la provincia más extensa de Argentina?',
    options: ['Buenos Aires', 'Santa Cruz', 'Córdoba', 'Mendoza'],
    correctIndex: 0,
    explanation: 'La provincia de Buenos Aires es la de mayor superficie del país.',
  },
  {
    id: 'geo-everest',
    category: 'geografia',
    level: 'alta',
    prompt: '¿En qué cordillera se encuentra el Monte Everest?',
    options: ['Los Andes', 'Las Rocosas', 'El Himalaya', 'Los Alpes'],
    correctIndex: 2,
  },

  // ── Ciencia y naturaleza ─────────────────────────────────────────────────

  {
    id: 'cie-agua-formula',
    category: 'ciencia',
    level: 'baja',
    prompt: '¿Cuál es la fórmula química del agua?',
    options: ['CO2', 'O2', 'H2O', 'NaCl'],
    correctIndex: 2,
  },
  {
    id: 'cie-corazon-t1',
    category: 'ciencia',
    level: 'media',
    prompt: '¿Qué órgano del cuerpo humano bombea la sangre?',
    options: ['El hígado', 'Los pulmones', 'El corazón', 'Los riñones'],
    correctIndex: 2,
  },

  {
    id: 'cie-fotosintesis',
    category: 'ciencia',
    level: 'alta',
    prompt: '¿Qué gas liberan las plantas durante la fotosíntesis?',
    options: ['Dióxido de carbono', 'Nitrógeno', 'Oxígeno', 'Hidrógeno'],
    correctIndex: 2,
  },
  {
    id: 'cie-tabla-au',
    category: 'ciencia',
    level: 'alta',
    prompt: 'En la tabla periódica, ¿qué elemento representa el símbolo "Au"?',
    options: ['Plata', 'Oro', 'Aluminio', 'Cobre'],
    correctIndex: 1,
    explanation: '"Au" viene del latín aurum, que significa oro.',
  },

  // ── Arte y literatura ────────────────────────────────────────────────────

  {
    id: 'art-quijote',
    category: 'arte',
    level: 'baja',
    prompt: '¿Quién escribió «Don Quijote de la Mancha»?',
    options: ['Miguel de Cervantes', 'Lope de Vega', 'Jorge Luis Borges', 'Federico García Lorca'],
    correctIndex: 0,
  },

  {
    id: 'art-martin-fierro',
    category: 'arte',
    level: 'alta',
    prompt: '¿Quién escribió el poema «Martín Fierro»?',
    options: ['José Hernández', 'Domingo Sarmiento', 'Esteban Echeverría', 'Leopoldo Lugones'],
    correctIndex: 0,
  },
  {
    id: 'art-cien-anios',
    category: 'arte',
    level: 'alta',
    prompt: '¿Qué autor escribió «Cien años de soledad»?',
    options: ['Julio Cortázar', 'Gabriel García Márquez', 'Mario Vargas Llosa', 'Pablo Neruda'],
    correctIndex: 1,
  },


  // ── Música ───────────────────────────────────────────────────────────────

  {
    id: 'mus-tango-gardel',
    category: 'musica',
    level: 'baja',
    prompt: '¿Qué cantante es un ícono histórico del tango argentino?',
    options: ['Carlos Gardel', 'Atahualpa Yupanqui', 'Mercedes Sosa', 'Sandro'],
    correctIndex: 0,
  },

  {
    id: 'mus-mercedes-sosa',
    category: 'musica',
    level: 'media',
    prompt: '¿Qué cantante argentina fue conocida como «La voz de América Latina»?',
    options: ['Mercedes Sosa', 'Violeta Parra', 'Nacha Guevara', 'Soledad Pastorutti'],
    correctIndex: 0,
  },
  {
    id: 'mus-cuatro-estaciones',
    category: 'musica',
    level: 'alta',
    prompt: '¿Quién compuso «Las cuatro estaciones»?',
    options: ['Antonio Vivaldi', 'Johann Strauss', 'Franz Schubert', 'Frédéric Chopin'],
    correctIndex: 0,
  },
  {
    id: 'mus-instrumento-viento',
    category: 'musica',
    level: 'alta',
    prompt: '¿Cuál de estos es un instrumento de viento?',
    options: ['El violonchelo', 'La flauta traversa', 'El arpa', 'El timbal'],
    correctIndex: 1,
  },
  /**
 * TANDA 2 — 30 preguntas nuevas para QUIZ_BANK.
 *
 * Integración idéntica a la tanda 1: pegá estos objetos dentro del array
 * `QUIZ_BANK` en src/data/quiz.ts, antes del cierre `]`. IDs con sufijo -t2
 * para no chocar con tandas previas. 6 por categoría, niveles mezclados,
 * enfoque equilibrado Argentina/mundo. Las 'baja' favorecen memoria de largo
 * plazo (Modo Calmo).
 */

  // ── Historia ───────────────────────────────────────────────────────────
  {
    id: 'his-san-martin-t2',
    category: 'historia',
    level: 'baja',
    prompt: '¿Quién es considerado el Libertador de Argentina, Chile y Perú?',
    options: ['Manuel Belgrano', 'José de San Martín', 'Simón Bolívar', 'Juan Manuel de Rosas'],
    correctIndex: 1,
  },
  {
    id: 'his-segunda-guerra-t2',
    category: 'historia',
    level: 'media',
    prompt: '¿En qué año terminó la Segunda Guerra Mundial?',
    options: ['1945', '1939', '1918', '1950'],
    correctIndex: 0,
  },
  {
    id: 'his-egipto-faraon-t2',
    category: 'historia',
    level: 'media',
    prompt: '¿Cómo se llamaba a los reyes del antiguo Egipto?',
    options: ['Césares', 'Faraones', 'Sultanes', 'Emperadores'],
    correctIndex: 1,
  },
  {
    id: 'his-descubrimiento-t2',
    category: 'historia',
    level: 'baja',
    prompt: '¿Bajo el patrocinio de qué reino viajó Colón en 1492?',
    options: ['Portugal', 'España', 'Inglaterra', 'Francia'],
    correctIndex: 1,
  },
  {
    id: 'his-revolucion-rusa-t2',
    category: 'historia',
    level: 'alta',
    prompt: '¿En qué país ocurrió la revolución de 1917 que llevó al poder a los bolcheviques?',
    options: ['Alemania', 'Rusia', 'China', 'Francia'],
    correctIndex: 1,
  },
  {
    id: 'his-peron-t2',
    category: 'historia',
    level: 'alta',
    prompt: '¿En qué década llegó Juan Domingo Perón por primera vez a la presidencia argentina?',
    options: ['Década de 1930', 'Década de 1940', 'Década de 1950', 'Década de 1960'],
    correctIndex: 1,
    explanation: 'Perón asumió la presidencia en 1946.',
  },

  // ── Geografía ──────────────────────────────────────────────────────────
  {
    id: 'geo-capital-españa-t2',
    category: 'geografia',
    level: 'baja',
    prompt: '¿Cuál es la capital de España?',
    options: ['Barcelona', 'Madrid', 'Sevilla', 'Valencia'],
    correctIndex: 1,
  },
  {
    id: 'geo-tierra-fuego-t2',
    category: 'geografia',
    level: 'media',
    prompt: '¿Cuál es la provincia más austral (al sur) de Argentina?',
    options: ['Santa Cruz', 'Chubut', 'Tierra del Fuego', 'Neuquén'],
    correctIndex: 2,
  },
  {
    id: 'geo-mediterraneo-t2',
    category: 'geografia',
    level: 'media',
    prompt: '¿Qué mar baña las costas de Italia, Grecia y España?',
    options: ['El mar Negro', 'El mar Mediterráneo', 'El mar Báltico', 'El mar Rojo'],
    correctIndex: 1,
  },
  {
    id: 'geo-amazonas-pais-t2',
    category: 'geografia',
    level: 'alta',
    prompt: '¿En qué país se encuentra la mayor parte de la selva amazónica?',
    options: ['Perú', 'Colombia', 'Brasil', 'Venezuela'],
    correctIndex: 2,
  },
  {
    id: 'geo-japon-t2',
    category: 'geografia',
    level: 'baja',
    prompt: '¿Cuál es la capital de Japón?',
    options: ['Pekín', 'Seúl', 'Tokio', 'Bangkok'],
    correctIndex: 2,
  },
  {
    id: 'geo-rio-arg-t2',
    category: 'geografia',
    level: 'alta',
    prompt: '¿Qué río forma gran parte del límite entre Argentina y Uruguay?',
    options: ['El río Paraná', 'El río Uruguay', 'El río Pilcomayo', 'El río Colorado'],
    correctIndex: 1,
  },

  // ── Ciencia y naturaleza ─────────────────────────────────────────────────
  {
    id: 'cie-huesos-t2',
    category: 'ciencia',
    level: 'media',
    prompt: '¿Cuántos huesos tiene aproximadamente el cuerpo humano adulto?',
    options: ['150', '206', '300', '98'],
    correctIndex: 1,
    explanation: 'La cifra estándar más aceptada es 206 huesos en el adulto.',
  },
  {
    id: 'cie-sol-estrella-t2',
    category: 'ciencia',
    level: 'baja',
    prompt: '¿Qué es el Sol?',
    options: ['Un planeta', 'Una estrella', 'Un satélite', 'un cometa'],
    correctIndex: 1,
  },
  {
    id: 'cie-abejas-t2',
    category: 'ciencia',
    level: 'baja',
    prompt: '¿Qué producen las abejas?',
    options: ['Seda', 'Miel', 'Leche', 'Cera de oídos'],
    correctIndex: 1,
  },
  {
    id: 'cie-temperatura-agua-t2',
    category: 'ciencia',
    level: 'media',
    prompt: '¿A qué temperatura hierve el agua a nivel del mar?',
    options: ['50 °C', '100 °C', '37 °C', '212 °C'],
    correctIndex: 1,
  },
  {
    id: 'cie-gravedad-t2',
    category: 'ciencia',
    level: 'alta',
    prompt: '¿Qué científico formuló la ley de la gravitación universal?',
    options: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Nikola Tesla'],
    correctIndex: 1,
  },
  {
    id: 'cie-adn-t2',
    category: 'ciencia',
    level: 'alta',
    prompt: '¿Qué molécula contiene la información genética de los seres vivos?',
    options: ['El ARN mensajero solamente', 'El ADN', 'La glucosa', 'El colágeno'],
    correctIndex: 1,
  },

  // ── Arte y literatura ────────────────────────────────────────────────────
  {
    id: 'art-borges-t2',
    category: 'arte',
    level: 'media',
    prompt: '¿Qué escritor argentino es autor de «El Aleph» y «Ficciones»?',
    options: ['Julio Cortázar', 'Jorge Luis Borges', 'Ernesto Sabato', 'Adolfo Bioy Casares'],
    correctIndex: 1,
  },
  {
    id: 'art-guernica-t2',
    category: 'arte',
    level: 'alta',
    prompt: '¿Quién pintó el «Guernica»?',
    options: ['Joan Miró', 'Salvador Dalí', 'Pablo Picasso', 'Diego Rivera'],
    correctIndex: 2,
  },
  {
    id: 'art-romeo-t2',
    category: 'arte',
    level: 'baja',
    prompt: '¿Quién escribió «Romeo y Julieta»?',
    options: ['William Shakespeare', 'Dante Alighieri', 'Molière', 'Homero'],
    correctIndex: 0,
  },
  {
    id: 'art-rayuela-t2',
    category: 'arte',
    level: 'alta',
    prompt: '¿Quién escribió la novela «Rayuela»?',
    options: ['Gabriel García Márquez', 'Julio Cortázar', 'Juan Rulfo', 'Octavio Paz'],
    correctIndex: 1,
  },
  {
    id: 'art-girasoles-t2',
    category: 'arte',
    level: 'media',
    prompt: 'La serie de cuadros «Los girasoles» es obra de…',
    options: ['Claude Monet', 'Vincent van Gogh', 'Paul Cézanne', 'Édouard Manet'],
    correctIndex: 1,
  },
  {
    id: 'art-principito-t2',
    category: 'arte',
    level: 'baja',
    prompt: '¿Cuál de estas obras es un famoso relato breve protagonizado por un niño de otro planeta?',
    options: ['El principito', 'La Odisea', 'El Quijote', 'Hamlet'],
    correctIndex: 0,
  },

  // ── Música ───────────────────────────────────────────────────────────────
  {
    id: 'mus-piazzolla-t2',
    category: 'musica',
    level: 'media',
    prompt: '¿Qué músico argentino renovó el tango y compuso «Libertango»?',
    options: ['Aníbal Troilo', 'Astor Piazzolla', 'Osvaldo Pugliese', 'Horacio Salgán'],
    correctIndex: 1,
  },
  {
    id: 'mus-mozart-t2',
    category: 'musica',
    level: 'media',
    prompt: '¿Qué compositor austríaco fue un niño prodigio del clasicismo?',
    options: ['Beethoven', 'Mozart', 'Brahms', 'Wagner'],
    correctIndex: 1,
  },
  {
    id: 'mus-piano-teclas-t2',
    category: 'musica',
    level: 'alta',
    prompt: '¿Cuántas teclas tiene un piano estándar moderno?',
    options: ['66', '76', '88', '102'],
    correctIndex: 2,
  },
  {
    id: 'mus-beatles-t2',
    category: 'musica',
    level: 'baja',
    prompt: '¿De qué país era la banda The Beatles?',
    options: ['Estados Unidos', 'Reino Unido', 'Australia', 'Irlanda'],
    correctIndex: 1,
  },
  {
    id: 'mus-folclore-t2',
    category: 'musica',
    level: 'baja',
    prompt: '¿Cuál de estos es un género musical folclórico argentino?',
    options: ['La cumbia', 'La zamba', 'El bolero', 'El flamenco'],
    correctIndex: 1,
  },

  /**
 * TANDA 3 — 56 preguntas nuevas para QUIZ_BANK (8 por categoría × 7 categorías).
 *
 * Integración idéntica a las tandas anteriores: pegá estos objetos dentro del
 * array `QUIZ_BANK` en src/data/quiz.ts, antes del cierre `]`. IDs con sufijo
 * -t3. Usa las 7 categorías de QuizCategory (incluye 'refranes' y 'vida' para
 * cultura popular argentina), todas ya existentes: no hay que tocar tipos.
 *
 * Balance de niveles cargado hacia 'alta' (para alimentar el Modo Ágil difícil),
 * salvo en 'refranes' y parte de 'vida', orientadas a memoria de largo plazo
 * (Modo Calmo). Enfoque equilibrado Argentina/mundo.
 */

  // ── Historia ───────────────────────────────────────────────────────────
  {
    id: 'his-caseros-t3',
    category: 'historia',
    level: 'alta',
    prompt: '¿Qué batalla de 1852 puso fin al gobierno de Juan Manuel de Rosas?',
    options: ['Batalla de Caseros', 'Batalla de Pavón', 'Batalla de Cepeda', 'Batalla de Maipú'],
    correctIndex: 0,
  },
  {
    id: 'his-constitucion-arg-t3',
    category: 'historia',
    level: 'alta',
    prompt: '¿En qué año se sancionó la primera Constitución Nacional Argentina?',
    options: ['1810', '1816', '1853', '1880'],
    correctIndex: 2,
  },
  {
    id: 'his-guerra-fria-t3',
    category: 'historia',
    level: 'media',
    prompt: 'La "Guerra Fría" enfrentó principalmente a Estados Unidos con…',
    options: ['China', 'La Unión Soviética', 'Alemania', 'Japón'],
    correctIndex: 1,
  },
  {
    id: 'his-roma-fundacion-t3',
    category: 'historia',
    level: 'media',
    prompt: '¿De qué imperio fue capital la ciudad de Roma?',
    options: ['El Imperio Persa', 'El Imperio Romano', 'El Imperio Mongol', 'El Imperio Inca'],
    correctIndex: 1,
  },
  {
    id: 'his-malvinas-t3',
    category: 'historia',
    level: 'baja',
    prompt: '¿En qué año ocurrió la Guerra de Malvinas?',
    options: ['1978', '1982', '1990', '1976'],
    correctIndex: 1,
  },
  {
    id: 'his-primer-hombre-espacio-t3',
    category: 'historia',
    level: 'alta',
    prompt: '¿Quién fue el primer ser humano en viajar al espacio?',
    options: ['Neil Armstrong', 'Yuri Gagarin', 'Buzz Aldrin', 'John Glenn'],
    correctIndex: 1,
    explanation: 'Yuri Gagarin orbitó la Tierra en 1961, a bordo de la Vostok 1.',
  },
  {
    id: 'his-grecia-democracia-t3',
    category: 'historia',
    level: 'alta',
    prompt: '¿En qué ciudad de la Antigüedad nació la democracia?',
    options: ['Roma', 'Atenas', 'Esparta', 'Alejandría'],
    correctIndex: 1,
  },
  {
    id: 'his-primer-gobierno-t3',
    category: 'historia',
    level: 'media',
    prompt: 'La Primera Junta de gobierno de 1810 se formó en…',
    options: ['Buenos Aires', 'Tucumán', 'Córdoba', 'Montevideo'],
    correctIndex: 0,
  },

  // ── Geografía ──────────────────────────────────────────────────────────
  {
    id: 'geo-capital-eeuu-t3',
    category: 'geografia',
    level: 'media',
    prompt: '¿Cuál es la capital de Estados Unidos?',
    options: ['Nueva York', 'Washington D. C.', 'Los Ángeles', 'Chicago'],
    correctIndex: 1,
  },
  {
    id: 'geo-lago-arg-t3',
    category: 'geografia',
    level: 'alta',
    prompt: '¿En qué provincia argentina está el glaciar Perito Moreno?',
    options: ['Chubut', 'Río Negro', 'Santa Cruz', 'Neuquén'],
    correctIndex: 2,
  },
  {
    id: 'geo-australia-t3',
    category: 'geografia',
    level: 'media',
    prompt: 'Australia es a la vez un país y…',
    options: ['Una península', 'Un continente', 'Un archipiélago menor', 'Una isla del Pacífico Norte'],
    correctIndex: 1,
  },
  {
    id: 'geo-paises-limitrofes-t3',
    category: 'geografia',
    level: 'alta',
    prompt: '¿Cuál de estos países NO limita con Argentina?',
    options: ['Chile', 'Bolivia', 'Ecuador', 'Paraguay'],
    correctIndex: 2,
  },
  {
    id: 'geo-cordoba-arg-t3',
    category: 'geografia',
    level: 'baja',
    prompt: '¿En qué región de Argentina se encuentra la provincia de Córdoba?',
    options: ['En el centro del país', 'En la Patagonia', 'En el extremo norte', 'En el litoral atlántico'],
    correctIndex: 0,
  },
  {
    id: 'geo-volcan-t3',
    category: 'geografia',
    level: 'alta',
    prompt: '¿Cómo se llama la cadena montañosa más larga del mundo, que recorre Sudamérica?',
    options: ['Los Apalaches', 'La cordillera de los Andes', 'El Himalaya', 'Las Rocosas'],
    correctIndex: 1,
  },
  {
    id: 'geo-egipto-rio-t3',
    category: 'geografia',
    level: 'media',
    prompt: '¿Qué río atraviesa Egipto y fue cuna de su civilización?',
    options: ['El Tigris', 'El Nilo', 'El Éufrates', 'El Congo'],
    correctIndex: 1,
  },
  {
    id: 'geo-hemisferio-t3',
    category: 'geografia',
    level: 'alta',
    prompt: '¿En qué hemisferio se encuentra Argentina?',
    options: ['Hemisferio norte', 'Hemisferio sur', 'Sobre el ecuador', 'Hemisferio oriental únicamente'],
    correctIndex: 1,
  },

  // ── Ciencia y naturaleza ─────────────────────────────────────────────────
  {
    id: 'cie-mamifero-marino-t3',
    category: 'ciencia',
    level: 'media',
    prompt: '¿Cuál es el animal más grande que existe en la actualidad?',
    options: ['El elefante africano', 'La ballena azul', 'El tiburón blanco', 'La jirafa'],
    correctIndex: 1,
  },
  {
    id: 'cie-planeta-rojo-t3',
    category: 'ciencia',
    level: 'baja',
    prompt: '¿Qué planeta es conocido como "el planeta rojo"?',
    options: ['Venus', 'Marte', 'Saturno', 'Mercurio'],
    correctIndex: 1,
  },

  {
    id: 'cie-electricidad-t3',
    category: 'ciencia',
    level: 'alta',
    prompt: '¿Qué unidad mide la intensidad de la corriente eléctrica?',
    options: ['El voltio', 'El amperio', 'El vatio', 'El ohmio'],
    correctIndex: 1,
  },
  {
    id: 'cie-evolucion-t3',
    category: 'ciencia',
    level: 'alta',
    prompt: '¿Qué naturalista propuso la teoría de la evolución por selección natural?',
    options: ['Gregor Mendel', 'Charles Darwin', 'Louis Pasteur', 'Carl Linneo'],
    correctIndex: 1,
  },
  {
    id: 'cie-estados-agua-t3',
    category: 'ciencia',
    level: 'baja',
    prompt: '¿En qué estado se encuentra el agua cuando se congela?',
    options: ['Líquido', 'Sólido', 'Gaseoso', 'Plasma'],
    correctIndex: 1,
  },
  {
    id: 'cie-celula-t3',
    category: 'ciencia',
    level: 'alta',
    prompt: '¿Cuál es la unidad básica de todos los seres vivos?',
    options: ['El átomo', 'La célula', 'El tejido', 'La molécula'],
    correctIndex: 1,
  },
  {
    id: 'cie-velocidad-sonido-t3',
    category: 'ciencia',
    level: 'alta',
    prompt: 'El fenómeno por el que vemos el relámpago antes de oír el trueno se debe a que…',
    options: ['El trueno llega después porque el sonido es más lento que la luz', 'El relámpago es más fuerte', 'El oído reacciona tarde', 'El trueno ocurre después'],
    correctIndex: 0,
  },

  // ── Arte y literatura ────────────────────────────────────────────────────
  {
    id: 'art-capilla-sixtina-t3',
    category: 'arte',
    level: 'alta',
    prompt: '¿Quién pintó el techo de la Capilla Sixtina?',
    options: ['Rafael', 'Miguel Ángel', 'Botticelli', 'Tiziano'],
    correctIndex: 1,
  },
  {
    id: 'art-sabato-t3',
    category: 'arte',
    level: 'alta',
    prompt: '¿Qué escritor argentino es autor de la novela «El túnel»?',
    options: ['Ernesto Sabato', 'Roberto Arlt', 'Leopoldo Marechal', 'Manuel Puig'],
    correctIndex: 0,
  },
  {
    id: 'art-cervantes-idioma-t3',
    category: 'arte',
    level: 'media',
    prompt: 'El español también es llamado "la lengua de…"',
    options: ['Shakespeare', 'Cervantes', 'Dante', 'Goethe'],
    correctIndex: 1,
  },
  {
    id: 'art-pintura-estilo-t3',
    category: 'arte',
    level: 'alta',
    prompt: '¿Con qué movimiento artístico se asocia principalmente a Salvador Dalí?',
    options: ['El impresionismo', 'El surrealismo', 'El cubismo', 'El renacimiento'],
    correctIndex: 1,
  },
  {
    id: 'art-odisea-t3',
    category: 'arte',
    level: 'media',
    prompt: '¿A qué poeta de la Antigua Grecia se atribuyen «La Ilíada» y «La Odisea»?',
    options: ['Sófocles', 'Homero', 'Virgilio', 'Platón'],
    correctIndex: 1,
  },
  {
    id: 'art-monet-t3',
    category: 'arte',
    level: 'alta',
    prompt: 'Claude Monet es una figura central de qué movimiento pictórico?',
    options: ['El impresionismo', 'El barroco', 'El expresionismo', 'El realismo'],
    correctIndex: 0,
  },
  {
    id: 'art-pinocho-t3',
    category: 'arte',
    level: 'baja',
    prompt: '¿Qué personaje de cuento tenía la nariz que crecía al mentir?',
    options: ['Pinocho', 'Peter Pan', 'El gato con botas', 'Pulgarcito'],
    correctIndex: 0,
  },
  {
    id: 'art-teatro-grecia-t3',
    category: 'arte',
    level: 'media',
    prompt: 'La tragedia y la comedia como géneros teatrales nacieron en…',
    options: ['Roma', 'Grecia', 'Egipto', 'Persia'],
    correctIndex: 1,
  },

  // ── Música ───────────────────────────────────────────────────────────────
  {
    id: 'mus-himno-arg-t3',
    category: 'musica',
    level: 'alta',
    prompt: '¿Quién compuso la música del Himno Nacional Argentino?',
    options: ['Juan Pedro Esnaola', 'Blas Parera', 'Vicente López y Planes', 'Alberto Williams'],
    correctIndex: 1,
    explanation: 'La música es de Blas Parera (1813); la letra, de Vicente López y Planes (1812).',
  },
  {
    id: 'mus-nota-musical-t3',
    category: 'musica',
    level: 'media',
    prompt: '¿Cuál de estas es una nota musical?',
    options: ['Sol', 'Sal', 'Tul', 'Sel'],
    correctIndex: 0,
  },
  {
    id: 'mus-cantidad-notas-t3',
    category: 'musica',
    level: 'media',
    prompt: '¿Cuántas notas musicales hay en la escala tradicional (do, re, mi…)?',
    options: ['Cinco', 'Siete', 'Nueve', 'Doce'],
    correctIndex: 1,
  },
  {
    id: 'mus-percusion-t3',
    category: 'musica',
    level: 'alta',
    prompt: '¿Cuál de estos es un instrumento de percusión?',
    options: ['El clarinete', 'El tambor', 'El violín', 'La trompeta'],
    correctIndex: 1,
  },
  {
    id: 'mus-opera-t3',
    category: 'musica',
    level: 'alta',
    prompt: '¿Cómo se llama la obra teatral cantada con orquesta, típica del repertorio clásico?',
    options: ['La sinfonía', 'La ópera', 'El concierto', 'La sonata'],
    correctIndex: 1,
  },
  {
    id: 'mus-yupanqui-t3',
    category: 'musica',
    level: 'alta',
    prompt: '¿Qué célebre músico es referente del folclore argentino, autor de «Los ejes de mi carreta»?',
    options: ['Atahualpa Yupanqui', 'Carlos Gardel', 'Astor Piazzolla', 'Charly García'],
    correctIndex: 0,
  },
  {
    id: 'mus-rock-nacional-t3',
    category: 'musica',
    level: 'media',
    prompt: '¿Cuál de estos es un reconocido músico del rock argentino?',
    options: ['Charly García', 'Plácido Domingo', 'Andrea Bocelli', 'Julio Iglesias'],
    correctIndex: 0,
  },
  {
    id: 'mus-coro-t3',
    category: 'musica',
    level: 'baja',
    prompt: '¿Cómo se llama un grupo de personas que cantan juntas?',
    options: ['Una orquesta', 'Un coro', 'Una banda de vientos', 'Un cuarteto de cuerdas'],
    correctIndex: 1,
  },

  // ── Refranes (completar el dicho) ────────────────────────────────────────


  {
    id: 'ref-diablo-t3',
    category: 'refranes',
    level: 'media',
    prompt: 'Completá el refrán: "Más sabe el diablo por viejo…"',
    options: ['…que por diablo', '…que por sabio', '…que por astuto', '…que por experto'],
    correctIndex: 0,
  },

  {
    id: 'ref-perro-t3',
    category: 'refranes',
    level: 'media',
    prompt: 'Completá el refrán: "Perro que ladra…"',
    options: ['…no muerde', '…asusta de noche', '…guarda la casa', '…no descansa'],
    correctIndex: 0,
  },
  {
    id: 'ref-arbol-t3',
    category: 'refranes',
    level: 'alta',
    prompt: 'Completá el refrán: "Árbol que nace torcido…"',
    options: ['…nunca su tronco endereza', '…da sombra igual', '…crece despacio', '…poco fruto da'],
    correctIndex: 0,
  },
  {
    id: 'ref-agua-t3',
    category: 'refranes',
    level: 'baja',
    prompt: 'Completá el refrán: "Agua que no has de beber…"',
    options: ['…déjala correr', '…no la ensucies', '…guárdala bien', '…dásela a otro'],
    correctIndex: 0,
  },
  {
    id: 'ref-dime-t3',
    category: 'refranes',
    level: 'media',
    prompt: 'Completá el refrán: "Dime con quién andas…"',
    options: ['…y te diré quién eres', '…y sabré tu nombre', '…y verás tu suerte', '…y conocerás tu camino'],
    correctIndex: 0,
  },

  // ── Cultura popular / vida cotidiana (Argentina) ─────────────────────────

  {
    id: 'vida-asado-t3',
    category: 'vida',
    level: 'baja',
    prompt: '¿Cómo se llama la comida tradicional argentina hecha con carne a la parrilla?',
    options: ['El asado', 'El guiso', 'La milanesa', 'El puchero'],
    correctIndex: 0,
  },
  {
    id: 'vida-dulce-leche-t3',
    category: 'vida',
    level: 'baja',
    prompt: '¿Qué dulce típico se usa para rellenar los alfajores argentinos?',
    options: ['El dulce de leche', 'La mermelada de naranja', 'La crema pastelera', 'El dulce de membrillo'],
    correctIndex: 0,
  },
  {
    id: 'vida-colectivo-t3',
    category: 'vida',
    level: 'media',
    prompt: 'En Argentina, ¿cómo se llama popularmente al transporte público urbano de pasajeros sobre ruedas?',
    options: ['El colectivo', 'El subte', 'El tranvía', 'El tren'],
    correctIndex: 0,
  },
  {
    id: 'vida-futbol-mundial-t3',
    category: 'vida',
    level: 'media',
    prompt: '¿En qué deporte ha sido campeona del mundo la selección argentina en varias ocasiones?',
    options: ['Rugby', 'Fútbol', 'Tenis', 'Vóley'],
    correctIndex: 1,
  },
  {
    id: 'vida-estaciones-t3',
    category: 'vida',
    level: 'media',
    prompt: 'En Argentina, ¿en qué meses suele ser el verano?',
    options: ['Diciembre a marzo', 'Junio a septiembre', 'Marzo a junio', 'Septiembre a diciembre'],
    correctIndex: 0,
  },
  {
    id: 'vida-siesta-t3',
    category: 'vida',
    level: 'baja',
    prompt: '¿Cómo se llama el descanso breve que se hace después del almuerzo, común en el interior del país?',
    options: ['La siesta', 'La merienda', 'El recreo', 'La pausa'],
    correctIndex: 0,
  },
  {
    id: 'vida-empanadas-t3',
    category: 'vida',
    level: 'media',
    prompt: 'Las empanadas, plato típico argentino, tradicionalmente se cocinan…',
    options: ['Al horno o fritas', 'Solo hervidas', 'Solo al vapor', 'Crudas'],
    correctIndex: 0,
  },
]
