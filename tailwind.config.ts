import type { Config } from 'tailwindcss'

/**
 * Lúcida — design tokens.
 *
 * Los colores NO viven acá: viven como CSS custom properties que define el
 * tema activo (ver src/theme/). Tailwind sólo referencia esas variables, así
 * agregar un tema nuevo es agregar un objeto de tokens en src/theme/themes.ts,
 * sin tocar este archivo ni los componentes.
 *
 * Cada variable es un triplete RGB separado por espacios ("69 56 43") para que
 * el modificador de opacidad de Tailwind (`text-ink/60`) siga funcionando.
 */
const withVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutros / superficies
        canvas: withVar('--c-canvas'),
        surface: withVar('--c-surface'),
        'surface-raised': withVar('--c-surface-raised'),
        border: withVar('--c-border'),
        'border-strong': withVar('--c-border-strong'),

        // Tinta (texto)
        ink: withVar('--c-ink'),
        'ink-strong': withVar('--c-ink-strong'),
        'ink-soft': withVar('--c-ink-soft'),
        'ink-muted': withVar('--c-ink-muted'),

        // Acentos por modo
        agil: {
          DEFAULT: withVar('--c-agil'),
          strong: withVar('--c-agil-strong'),
          soft: withVar('--c-agil-soft'),
          ink: withVar('--c-agil-ink'),
        },
        sereno: {
          DEFAULT: withVar('--c-sereno'),
          strong: withVar('--c-sereno-strong'),
          soft: withVar('--c-sereno-soft'),
          ink: withVar('--c-sereno-ink'),
        },
        calmo: {
          DEFAULT: withVar('--c-calmo'),
          strong: withVar('--c-calmo-strong'),
          soft: withVar('--c-calmo-soft'),
          ink: withVar('--c-calmo-ink'),
        },

        // Estados (semánticos, salen del tema)
        positive: {
          DEFAULT: withVar('--c-positive'),
          soft: withVar('--c-positive-soft'),
          ink: withVar('--c-positive-ink'),
        },
        gentle: {
          DEFAULT: withVar('--c-gentle'),
          strong: withVar('--c-gentle-strong'),
          soft: withVar('--c-gentle-soft'),
          ink: withVar('--c-gentle-ink'),
        },
        // Game colors — perceptualmente distintos para juegos (Secuencias, Stroop, etc.)
        game: {
          '1': { DEFAULT: withVar('--gx-1'), ink: withVar('--gx-1-ink'), strong: withVar('--gx-1-strong') },
          '2': { DEFAULT: withVar('--gx-2'), ink: withVar('--gx-2-ink'), strong: withVar('--gx-2-strong') },
          '3': { DEFAULT: withVar('--gx-3'), ink: withVar('--gx-3-ink'), strong: withVar('--gx-3-strong') },
          '4': { DEFAULT: withVar('--gx-4'), ink: withVar('--gx-4-ink'), strong: withVar('--gx-4-strong') },
          '5': { DEFAULT: withVar('--gx-5'), ink: withVar('--gx-5-ink'), strong: withVar('--gx-5-strong') },
          '6': { DEFAULT: withVar('--gx-6'), ink: withVar('--gx-6-ink'), strong: withVar('--gx-6-strong') },
        },
      },
      fontFamily: {
        serif: ['Spectral', 'Georgia', 'serif'],
        sans: ['"Atkinson Hyperlegible"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        pill: '99px',
      },
      boxShadow: {
        soft: '0 2px 10px rgba(60,45,30,.05)',
        card: '0 3px 12px rgba(60,45,30,.07)',
        raised: '0 7px 18px rgba(150,110,40,.22)',
        frame: '0 20px 54px rgba(60,45,30,.16), 0 3px 10px rgba(60,45,30,.07)',
      },
      backgroundImage: {
        grain:
          'radial-gradient(rgb(120 90 55 / .06) 1px, transparent 1.5px)',
      },
    },
  },
  plugins: [],
} satisfies Config
