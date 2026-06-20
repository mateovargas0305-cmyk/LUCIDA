import type { NatureIconId } from './natureIconIds'

/** Íconos orgánicos reconocibles para Memoria. Sin imágenes externas. */
interface NatureIconProps {
  id: NatureIconId
  size?: number
}

/** Usa `currentColor`, así el color lo decide la clase de texto del contenedor. */
export function NatureIcon({ id, size = 30 }: NatureIconProps) {
  const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  const common = { width: size, height: size, viewBox: '0 0 24 24' }

  switch (id) {
    case 'sun':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <circle cx="12" cy="12" r="4" />
          {[
            [12, 1, 12, 3.5],
            [12, 20.5, 12, 23],
            [3.5, 3.5, 5.2, 5.2],
            [18.8, 18.8, 20.5, 20.5],
            [1, 12, 3.5, 12],
            [20.5, 12, 23, 12],
            [3.5, 20.5, 5.2, 18.8],
            [18.8, 5.2, 20.5, 3.5],
          ].map((l, k) => (
            <line key={k} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />
          ))}
        </svg>
      )
    case 'leaf':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <path d="M12 3C7 7 5 12 12 21C19 12 17 7 12 3Z" />
          <line x1="12" y1="7" x2="12" y2="18" />
        </svg>
      )
    case 'moon':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <path d="M15 3a9 9 0 1 0 0 18 7 7 0 0 1 0-18z" />
        </svg>
      )
    case 'drop':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <path d="M12 3C8 9 6 12 6 15a6 6 0 0 0 12 0c0-3-2-6-6-12z" />
        </svg>
      )
    case 'flower':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <circle cx="12" cy="6" r="3" />
          <circle cx="12" cy="18" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="12" r="3" />
          <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        </svg>
      )
    case 'mountain':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <path d="M3 19L9 8l4 6 3-5 5 10z" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <path d="M12 20C5 14 4 8.5 7.8 6.3 10 5 12 7 12 7s2-2 4.2-.7C20 8.5 19 14 12 20z" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <path d="M12 3l2.6 6 6.4.5-5 4.3 1.6 6.2L12 16.5 6.4 20l1.6-6.2-5-4.3 6.4-.5z" />
        </svg>
      )
    case 'cloud':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <path d="M18 10h-1a5 5 0 0 0-9.9 1H7a4 4 0 0 0 0 8h11a3 3 0 1 0 0-6z" />
        </svg>
      )
    case 'wave':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <path d="M2 10c2.5-3.5 5-3.5 7.5 0s5 3.5 7.5 0 5-3.5 7.5 0" />
          <path d="M2 17c2.5-3.5 5-3.5 7.5 0s5 3.5 7.5 0 5-3.5 7.5 0" />
        </svg>
      )
    case 'bolt':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <path d="M13 2L4 14h8l-1 8 9-12h-8z" />
        </svg>
      )
    case 'pine':
      return (
        <svg {...common} {...stroke} aria-hidden>
          <path d="M12 2L7 9h3l-4 8h5v4h2v-4h5l-4-8h3z" />
        </svg>
      )
  }
}
