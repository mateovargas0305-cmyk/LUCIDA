import { ChevronLeft } from 'lucide-react'
import { useNav } from '../../navigation/navContext'

interface ScreenHeaderProps {
  title: string
  /** Slot a la derecha (p. ej. chip de puntaje en Ágil). */
  right?: React.ReactNode
}

/** Encabezado de actividad: volver + título centrado + slot opcional. */
export function ScreenHeader({ title, right }: ScreenHeaderProps) {
  const { back, canGoBack } = useNav()
  return (
    <header className="flex items-center justify-between gap-3">
      {canGoBack ? (
        <button
          onClick={back}
          aria-label="Volver"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-ink-muted"
        >
          <ChevronLeft size={24} aria-hidden />
        </button>
      ) : (
        <span className="h-10 w-10 flex-none" />
      )}
      <span className="flex-1 text-center font-serif text-[19px] font-semibold text-ink-strong">
        {title}
      </span>
      <span className="flex h-10 min-w-10 flex-none items-center justify-end">
        {right}
      </span>
    </header>
  )
}
