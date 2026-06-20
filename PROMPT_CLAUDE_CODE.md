# Proyecto: "Lúcida" — App de estímulo mental y cultura general

Quiero que construyas una PWA de ejercicios mentales y cultura general, pensada para un rango de usuarios muy amplio: desde un adolescente sano hasta un adulto mayor con demencia. La app debe ser hermosa, calma, accesible y realmente estimulante. Trabajá de forma incremental: primero el andamiaje y un modo funcional de punta a punta, luego el resto.

## Stack (usá exactamente esto)
- React 18 + Vite + TypeScript
- Tailwind CSS para estilos
- Framer Motion para animaciones (suaves, nunca estridentes)
- Dexie (IndexedDB) para persistencia local-first — sin backend
- vite-plugin-pwa para que sea instalable y funcione 100% offline
- Sin dependencias de pago, sin API keys, sin servicios externos

## Arquitectura de usuarios: 3 modos explícitos
La app abre en una pantalla de selección de modo con 3 tarjetas grandes:

1. **Modo Ágil** — dinámico, gamificado, con puntaje, rachas, temporizadores opcionales y dificultad alta. Animaciones más enérgicas.
2. **Modo Sereno** — equilibrado, sin presión de tiempo por defecto, dificultad media, progreso visible pero sin competitividad agresiva.
3. **Modo Calmo** — para adultos mayores y personas con demencia. Reglas DURAS (ver abajo).

El modo elegido se guarda y condiciona dificultad, UI, tamaño de texto, animaciones y reglas de juego en toda la app.

### Reglas obligatorias del Modo Calmo (críticas, no negociar)
- Texto base ≥ 24px, botones grandes (mínimo 64px de alto), alto contraste.
- NUNCA temporizadores. NUNCA puntaje negativo, "perdiste", ni penalización por error.
- Refuerzo positivo siempre: ante error, reorientar con suavidad ("Casi, probá esta"), nunca marcar en rojo agresivo.
- Una sola acción/decisión por pantalla. Sin menús anidados.
- Navegación lineal: botón grande "Siguiente" siempre visible. Botón "Atrás"/"Inicio" claro.
- Sin estímulos simultáneos que compitan por atención. Mucho aire.
- Contenido con sesgo a memoria de largo plazo (refranes, cosas de época, imágenes familiares).
- Feedback sonoro suave y opcional (toggle), nunca obligatorio.

## Actividades del MVP (4)
Cada actividad debe respetar el modo activo (dificultad, UI, reglas).

1. **Quiz de cultura general** — banco de preguntas en JSON local (`src/data/quiz.ts`). Estructura por categoría (Historia, Geografía, Ciencia, Arte, Música, Refranes, Vida cotidiana) y por nivel (fácil/medio/difícil). Generá ~40 preguntas de ejemplo bien variadas para arrancar; el formato debe permitir agregar más fácilmente. Cada pregunta: enunciado, opciones, índice correcto, explicación breve opcional, nivel, categoría.
2. **Cálculo simple** — operaciones generadas por algoritmo según el modo (sumas/restas grandes y simples en Calmo; multiplicación/secuencias/porcentajes en Ágil). Infinitas.
3. **Memoria** — juego de parejas (cartas que se voltean). Tamaño de grilla según modo (Calmo: 2x2 o 2x3 con íconos grandes y claros; Ágil: hasta 4x5). Usá íconos/emojis grandes y reconocibles, no imágenes externas.
4. **Atención / Buscar el diferente** — grilla de elementos donde uno difiere (color, forma, orientación). Dificultad y cantidad de elementos según modo.

## Identidad visual: cálido y orgánico
- Paleta tonos tierra: arcilla/terracota, ocre suave, verde salvia, crema/hueso, marrón cálido como texto. Nada de azules fríos ni grises corporativos.
- Tipografía amable y muy legible (ej. una serif suave o sans humanista; elegí algo de Google Fonts y cargalo). Jerarquía clara.
- Bordes redondeados generosos, sombras suaves, espaciado amplio.
- Animaciones orgánicas y calmas (Framer Motion): transiciones suaves de entrada, micro-feedback al acertar (un brillo cálido, no confeti agresivo).
- Modo claro por defecto, cálido. (Dark mode opcional, no prioritario.)
- Definí design tokens en Tailwind config (colores, escala tipográfica, radios) y reutilizalos en todo.

Sistema de temas: La app debe soportar múltiples temas de color intercambiables, construidos como conjuntos de design tokens (nunca colores hardcodeados). El tema por defecto es "Tierra" (tonos tierra cálidos). Dejá la arquitectura lista para sumar temas "Verde bosque" y "Frío sereno" más adelante cambiando solo un objeto de tokens, sin tocar componentes. El tema es independiente del modo: cada tema define su propia versión de los acentos de Ágil, Sereno y Calmo más los neutros de fondo/texto. Regla innegociable: cualquier tema debe mantener contraste AAA en el Modo Calmo.

## Persistencia (Dexie / IndexedDB)
- Guardar: modo elegido, progreso por actividad, preferencias (sonido on/off, tamaño de texto), historial básico de sesiones.
- Local-first puro: sin login, sin nube. Que ande offline tras la primera carga.

## Accesibilidad (transversal)
- Cumplir contraste AA mínimo (AAA en Modo Calmo).
- Targets táctiles grandes. Navegable por teclado. Roles ARIA correctos.
- Respetar `prefers-reduced-motion`.

## Estructura y calidad de código
- Componentes reutilizables, tipados estrictos, sin `any`.
- Una capa de "configuración por modo" centralizada (un objeto/contexto que expone reglas, tamaños, dificultad y flags según el modo activo) que las actividades consumen, para no repetir lógica.
- README con cómo correr, cómo agregar preguntas al quiz, y cómo agregar una nueva actividad.

## Plan de entrega (hacelo en este orden, andá mostrando avances)
1. Scaffold Vite + TS + Tailwind + Framer Motion + Dexie + PWA. Design tokens y layout base.
2. Pantalla de selección de modo + contexto de configuración por modo + navegación.
3. Quiz completo (con JSON de ejemplo) funcionando en los 3 modos.
4. Cálculo, Memoria y Atención.
5. Persistencia, preferencias, pulido visual y de accesibilidad, manifest PWA + íconos.

Empezá por el paso 1 y confirmame antes de avanzar de etapa. Priorizá siempre la calidad visual y la experiencia calma por sobre la cantidad de features.
