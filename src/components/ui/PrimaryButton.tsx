import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useModeConfig } from '../../modes/modeContext'
import { ACCENT, RADIUS_CLASS } from '../../lib/accent'
import { tpx } from '../../lib/typography'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

/**
 * Botón primario. Toma tamaño (alto mínimo, radio, tipografía) y color de
 * acento del modo activo, vía la config central. Cumple los mínimos táctiles
 * de cada modo sin que el componente sepa "qué modo es".
 */
export function PrimaryButton({
  children,
  className = '',
  ...rest
}: PrimaryButtonProps) {
  const config = useModeConfig()
  const accent = ACCENT[config.accent]

  return (
    <button
      {...rest}
      className={`w-full font-sans font-bold ${accent.solidBg} ${accent.onSolid} ${accent.shadow} ${RADIUS_CLASS[config.controls.radius]} flex items-center justify-center gap-2 border-none transition-transform duration-150 active:scale-[0.985] disabled:opacity-60 ${className}`}
      style={{
        minHeight: config.controls.primaryButtonMinHeightPx,
        fontSize: tpx(config.typography.controlTextPx),
      }}
    >
      {children}
    </button>
  )
}
