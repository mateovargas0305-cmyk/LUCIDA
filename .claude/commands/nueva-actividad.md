---
description: Genera el esqueleto de una nueva actividad respetando la config-por-modo, los design tokens y las reglas del Modo Acompañado.
---

Vas a crear una nueva actividad para la app. El nombre/idea de la actividad es: $ARGUMENTS

Seguí estos pasos:

1. Leé `CLAUDE.md` y la sección de actividades de `PROMPT_CLAUDE_CODE.md` para refrescar convenciones.

2. Revisá la capa central de configuración por modo y cómo la consumen las actividades existentes (mirá al menos una actividad ya hecha como referencia de patrón).

3. Definí qué parámetros de esta actividad dependen del modo (Joven / Adulto / Acompañado): dificultad, cantidad de elementos, tamaños, si hay temporizador, etc. Agregá esos parámetros a la config central PRIMERO. No metas lógica `if modo === X` dispersa en el componente.

4. Separá la lógica del juego (generación, validación) de la UI. La lógica va en su propio módulo, testeable y sin JSX.

5. Construí la UI consumiendo design tokens (nunca colores hardcodeados), con animaciones calmas de Framer Motion y respeto a `prefers-reduced-motion`.

6. Verificá explícitamente las reglas SAGRADAS del Modo Acompañado para esta actividad: sin temporizador, sin penalización por error, refuerzo positivo, una acción por pantalla, texto ≥24px, botones ≥64px, contraste AAA. Si alguna regla no se puede cumplir con el diseño propuesto, paralo y proponé una alternativa antes de seguir.

7. Validá accesibilidad: contraste, targets táctiles, navegación por teclado, ARIA.

8. Registrá la actividad en el menú/navegación correspondiente y actualizá el README con una línea sobre cómo funciona.

9. Tomá una captura del resultado en al menos Modo Acompañado y Modo Joven, revisá vos mismo que se ve bien y reportame el avance antes de dar por cerrado.
