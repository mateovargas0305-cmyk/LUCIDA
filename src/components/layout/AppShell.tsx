import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
  /** Textura de grano decorativa; se puede desactivar por preferencia. */
  grain?: boolean
}

/**
 * Contenedor raíz de la app. En móvil ocupa toda la pantalla; en escritorio
 * centra el contenido en una columna acotada y cálida, sin marcos artificiales.
 */
export function AppShell({ children, grain = true }: AppShellProps) {
  return (
    <div className="min-h-full w-full bg-canvas">
      <div className="relative mx-auto flex min-h-full w-full max-w-[480px] flex-col">
        {grain && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grain opacity-60"
          />
        )}
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          {children}
        </div>
      </div>
    </div>
  )
}
