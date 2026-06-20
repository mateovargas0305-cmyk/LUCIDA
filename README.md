# Lúcida

App de estímulo mental y cultura general, **cálida, calma y accesible**, pensada
para un rango amplísimo de personas: desde un adolescente hasta un adulto mayor
con demencia. Es una **PWA local-first**: funciona offline, sin backend, sin
login, sin servicios externos. Todo vive en el dispositivo.

## Stack

React 18 · Vite · TypeScript (estricto) · Tailwind CSS · Framer Motion ·
Dexie (IndexedDB) · vite-plugin-pwa.

## Cómo correr

```bash
npm install
npm run dev        # desarrollo
npm run build      # build de producción (genera el service worker PWA)
npm run preview    # sirve el build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint, 0 warnings permitidos
```

Abre la URL que imprime Vite. Para instalarla como app, usá "Instalar" del
navegador; tras la primera carga anda sin conexión.

> Atajo de desarrollo (sólo `npm run dev`): `?mode=calmo&start=quiz` siembra el
> modo y la pantalla inicial. Valores de `mode`: `agil` · `sereno` · `calmo`.
> Valores de `start`: `home` · `settings` · `quiz` · `calc` · `memory` · `attention`.

## Los tres modos

La app abre eligiendo un **modo**, que condiciona dificultad, tamaños, reglas,
animaciones y UI en **toda** la app:

- **Ágil** — dinámico, gamificado, con puntaje y rachas. Dificultad alta.
- **Sereno** — equilibrado, sin presión de tiempo, dificultad media.
- **Calmo** — accesible. Reglas **sagradas**: texto ≥ 24px, botones ≥ 64px,
  contraste AAA, **sin** temporizadores, **sin** puntaje ni penalización,
  feedback de error amable, una sola acción por pantalla.

### Configuración por modo (capa central)

Toda la diferencia entre modos sale de **`src/modes/configs.ts`** (tipos en
`src/modes/types.ts`). Cada modo expone tipografía, controles, puntaje, tiempo,
feedback, navegación, energía de animación y parámetros por actividad.

> Regla de oro: **ningún componente** decide "si el modo es X". Si una actividad
> necesita un comportamiento por modo, se agrega un campo a la config y se
> consume desde ahí. Los componentes leen `useModeConfig()`.

## Temas de color

Los colores **nunca** están hardcodeados: son CSS custom properties que define el
tema activo. Tailwind referencia esas variables (`bg-surface`, `text-ink`,
`bg-calmo`…). El tema por defecto es **Tierra**; vienen también **Verde bosque**
y **Frío sereno**, intercambiables desde Ajustes.

### Agregar un tema

1. En `src/theme/themes.ts`, agregá un objeto que cumpla `ThemeColors`
   (tripletes RGB), siguiendo el patrón de `tierra`.
2. Sumá su `id` al tipo `ThemeId` y al record `THEMES`.

No hay que tocar ningún componente. **Cualquier tema debe mantener contraste AAA
en Modo Calmo.**

## Actividades

Cuatro, todas consumiendo la config del modo:

1. **Quiz de cultura general** — banco en JSON local.
2. **Cálculo** — operaciones generadas por algoritmo (infinitas).
3. **Memoria** — juego de parejas con íconos orgánicos (SVG, sin imágenes externas).
4. **Atención** — encontrá el elemento diferente (color o forma).

### Agregar preguntas al quiz

Editá **`src/data/quiz.ts`** y sumá objetos al array `QUIZ_BANK`. **Sólo datos,
nada de lógica.** Formato:

```ts
{
  id: 'geo-eiffel',          // único
  category: 'geografia',     // historia | geografia | ciencia | arte | musica | refranes | vida
  level: 'baja',             // baja (fácil) | media | alta (difícil)
  prompt: '¿En qué país se encuentra la Torre Eiffel?',
  options: ['Francia', 'Italia', 'España', 'Bélgica'],
  correctIndex: 0,           // 0–3
  explanation: '…',          // opcional
}
```

El motor (`src/activities/quiz/quizEngine.ts`) filtra por los niveles del modo,
elige cuántas preguntas y cuántas opciones mostrar, y baraja todo. No hace falta
pre-ordenar opciones ni preocuparse por el modo.

### Agregar una actividad nueva

1. **Config**: agregá su sub-config a `ModeActivities` en `src/modes/types.ts`
   y completala para los tres modos en `src/modes/configs.ts`.
2. **Lógica** (testeable, sin UI): un `engine.ts` que genere el contenido a
   partir de la config. Para actividades de "elegí una opción", reusá
   `src/activities/shared/useChoiceSession.ts`.
3. **UI**: una pantalla que lea `useModeConfig()`, use los componentes
   compartidos (`ScreenHeader`, `PrimaryButton`, `FeedbackBanner`,
   `SessionSummary`) y los tokens de Tailwind. Verificá la checklist de Modo
   Calmo antes de cerrarla.
4. **Registro**: sumá el `ActivityId` y enchufá la pantalla en
   `ActivityScreen` (`src/App.tsx`). El inicio la lista automáticamente.

> También existe el skill `nueva-actividad` para generar el esqueleto.

## Persistencia

- **Preferencias** (tema, escala de texto, sonido) y **modo elegido**: en
  `localStorage`, para aplicarse antes del primer render (sin parpadeo).
- **Historial de sesiones** (actividad, modo, aciertos, puntaje, fecha): en
  **IndexedDB vía Dexie** (`src/db/`). De ahí salen la racha y las estadísticas
  de Ajustes. Todo se puede borrar desde "Borrar historial".

## Accesibilidad

- Contraste AA en toda la app; **AAA en Modo Calmo**.
- Targets táctiles grandes, navegación por teclado, roles/labels ARIA.
- Respeta `prefers-reduced-motion` (desactiva animaciones).
- Escala de texto global (Normal / Grande / Más grande) y lectura por voz
  opcional (Web Speech API, offline) en el quiz del Modo Calmo.

## Estructura

```
src/
  modes/         config por modo (types, configs, provider, hooks)
  theme/         tokens y temas de color (CSS vars)
  preferences/   tema, sonido, escala de texto (persistidas)
  navigation/    navegación lineal por pantallas
  activities/    quiz · calc · memory · attention (engine + screen + hooks)
  components/    UI reusable (ui/, icons/, layout/), SessionSummary, Logo
  data/          banco del quiz
  db/            Dexie (historial de sesiones)
  lib/           utilidades (shuffle, speech, motion, accent, typography)
  screens/       mode-select, home, settings
```
