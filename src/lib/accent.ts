import type { AccentToken } from '../modes/types'

/**
 * Clases Tailwind literales por acento. Se enumeran completas (no se arman con
 * template strings) para que el purgador de Tailwind las conserve.
 */
interface AccentClasses {
  /** Fondo sólido del acento (botón primario). */
  solidBg: string
  /** Texto que va sobre el fondo sólido. */
  onSolid: string
  /** Fondo suave (chips, swatches). */
  softBg: string
  /** Borde suave. */
  softBorder: string
  /** Texto en el tono fuerte del acento (sobre fondo claro). */
  strongText: string
  /** Sombra elevada cálida del acento. */
  shadow: string
}

export const ACCENT: Record<AccentToken, AccentClasses> = {
  agil: {
    solidBg: 'bg-agil',
    onSolid: 'text-agil-ink',
    softBg: 'bg-agil-soft',
    softBorder: 'border-agil-soft',
    strongText: 'text-agil-strong',
    shadow: 'shadow-raised',
  },
  sereno: {
    solidBg: 'bg-sereno',
    onSolid: 'text-sereno-ink',
    softBg: 'bg-sereno-soft',
    softBorder: 'border-sereno-soft',
    strongText: 'text-sereno-strong',
    shadow: 'shadow-card',
  },
  calmo: {
    solidBg: 'bg-calmo',
    onSolid: 'text-calmo-ink',
    softBg: 'bg-calmo-soft',
    softBorder: 'border-calmo-soft',
    strongText: 'text-calmo-strong',
    shadow: 'shadow-card',
  },
}

/** Clave de radio (Tailwind) → clase literal. */
export const RADIUS_CLASS: Record<'xl' | '2xl' | '3xl' | '4xl', string> = {
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  '4xl': 'rounded-4xl',
}
