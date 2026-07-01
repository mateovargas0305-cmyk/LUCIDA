# CLAUDE.md — Reglas de trabajo para "Lúcida"

Este archivo define cómo trabajar en este proyecto SIEMPRE. La especificación de qué construir está en `PROMPT_CLAUDE_CODE.md`. Este archivo manda sobre las convenciones; ante duda, respetá estas reglas.

## Principio rector
La calidad visual y la experiencia calma valen más que la cantidad de features. Si una decisión mejora una a costa de la otra, elegí la experiencia. Ante la duda, hacé menos pero mejor.

## Stack — no cambiar sin avisar
React 18 + Vite + TypeScript + Tailwind + Framer Motion + Dexie (IndexedDB) + vite-plugin-pwa.
Local-first puro: sin backend, sin login, sin API keys, sin dependencias de pago. Debe funcionar offline.
Antes de sumar cualquier dependencia nueva, justificá por qué y preguntá.

## TypeScript
- Tipado estricto. Prohibido `any` (usá `unknown` + narrowing si hace falta).
- Sin warnings de TS ni de ESLint en el código que entregás.
- Nombres descriptivos en español o inglés, pero consistentes dentro de cada archivo.

## Estilos y diseño — reglas firmes
- NUNCA colores hardcodeados. Usá siempre los design tokens definidos en `tailwind.config`.
- Paleta cálida y orgánica (tonos tierra). Prohibido introducir azules fríos, grises corporativos o negro puro como texto.
- Bordes redondeados generosos, sombras suaves, espaciado amplio. Mucho aire.
- Animaciones con Framer Motion: orgánicas y calmas. Nada estridente, nada de confeti agresivo.
- Respetá SIEMPRE `prefers-reduced-motion`: si está activo, desactivá o reducí animaciones.
- Los colores salen siempre del tema activo vía tokens. Los temas son intercambiables; agregar uno nuevo debe ser cambiar un objeto de tokens, sin tocar componentes. Cualquier tema debe mantener contraste AAA en Modo Calmo.

## Configuración por modo — patrón obligatorio
Existe una capa central de configuración por modo (Ágil/Sereno/Calmo) que expone reglas, dificultad, tamaños y flags. TODA actividad consume de ahí.
- Prohibido repetir lógica de "si el modo es X entonces..." dispersa por los componentes. Si necesitás un comportamiento por modo, agregalo a la config central y consumilo.
- Si una actividad necesita un parámetro nuevo dependiente del modo, primero lo agregás a la config, después lo usás.

## Modo Calmo — reglas SAGRADAS (nunca violar)
Estas reglas no se relajan por ningún motivo, ni "temporalmente":
- Texto base ≥ 24px. Botones ≥ 64px de alto. Contraste AAA.
- NUNCA temporizadores. NUNCA puntaje negativo, "perdiste" ni penalización por error.
- Ante error: reorientar con suavidad y refuerzo positivo. Nunca rojo agresivo ni lenguaje de fracaso.
- Una sola acción por pantalla. Sin menús anidados. Navegación lineal con "Siguiente" siempre visible.
- Sin estímulos simultáneos que compitan por atención.
Antes de dar por terminada cualquier pantalla que pueda mostrarse en Modo Calmo, verificá esta lista.

## Accesibilidad — transversal a todo
- Contraste AA mínimo en toda la app; AAA en Modo Calmo.
- Targets táctiles grandes. Navegable por teclado. Roles y labels ARIA correctos.
- Cada pantalla nueva se valida contra estos puntos antes de cerrarla.

## Flujo de trabajo
- Trabajá por etapas según el plan de `PROMPT_CLAUDE_CODE.md`. Confirmá antes de pasar de etapa.
- No entregues archivos masivos de una sola vez sin contexto; preferí incrementos revisables.
- Mantené el README actualizado: cómo correr, cómo agregar preguntas al quiz, cómo agregar una actividad.

## Estructura de código
- Componentes reutilizables y chicos. Una responsabilidad por componente.
- Los datos del quiz viven en `src/data/`. El formato debe permitir agregar preguntas sin tocar lógica.
- Lógica de generación (cálculo, atención, memoria) separada de la UI, así es testeable y reusable.
