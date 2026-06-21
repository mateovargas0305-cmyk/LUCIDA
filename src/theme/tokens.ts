/**
 * Contrato de tokens de color de un tema.
 *
 * Cada valor es un triplete RGB ("69 56 43") porque así se inyecta como CSS
 * custom property y Tailwind puede aplicarle opacidad (`bg-surface/80`).
 *
 * Agregar un tema = crear un objeto que cumpla `ThemeColors` en `themes.ts`.
 * Ningún componente referencia colores: todos usan las clases de Tailwind que
 * apuntan a estas variables.
 */
export interface ThemeColors {
  // Neutros / superficies
  canvas: string
  surface: string
  surfaceRaised: string
  border: string
  borderStrong: string

  // Tinta (texto)
  ink: string
  inkStrong: string
  inkSoft: string
  inkMuted: string

  // Acento Ágil
  agil: string
  agilStrong: string
  agilSoft: string
  agilInk: string

  // Acento Sereno
  sereno: string
  serenoStrong: string
  serenoSoft: string
  serenoInk: string

  // Acento Calmo
  calmo: string
  calmoStrong: string
  calmoSoft: string
  calmoInk: string

  // Estados semánticos
  positive: string
  positiveSoft: string
  positiveInk: string
  gentle: string
  gentleStrong: string
  gentleSoft: string
  gentleInk: string
}

/** Mapea cada token a su CSS custom property (`--c-…`). */
export const CSS_VAR_BY_TOKEN: Record<keyof ThemeColors, string> = {
  canvas: '--c-canvas',
  surface: '--c-surface',
  surfaceRaised: '--c-surface-raised',
  border: '--c-border',
  borderStrong: '--c-border-strong',
  ink: '--c-ink',
  inkStrong: '--c-ink-strong',
  inkSoft: '--c-ink-soft',
  inkMuted: '--c-ink-muted',
  agil: '--c-agil',
  agilStrong: '--c-agil-strong',
  agilSoft: '--c-agil-soft',
  agilInk: '--c-agil-ink',
  sereno: '--c-sereno',
  serenoStrong: '--c-sereno-strong',
  serenoSoft: '--c-sereno-soft',
  serenoInk: '--c-sereno-ink',
  calmo: '--c-calmo',
  calmoStrong: '--c-calmo-strong',
  calmoSoft: '--c-calmo-soft',
  calmoInk: '--c-calmo-ink',
  positive: '--c-positive',
  positiveSoft: '--c-positive-soft',
  positiveInk: '--c-positive-ink',
  gentle: '--c-gentle',
  gentleStrong: '--c-gentle-strong',
  gentleSoft: '--c-gentle-soft',
  gentleInk: '--c-gentle-ink',
}
