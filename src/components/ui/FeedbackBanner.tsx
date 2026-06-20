import { motion, useReducedMotion } from 'framer-motion'
import { tpx } from '../../lib/typography'

type Variant = 'success' | 'gentle' | 'info'

interface FeedbackBannerProps {
  variant: Variant
  message: string
  /** Tamaño del texto en px (sale de la tipografía del modo). */
  fontSize?: number
  /** Mostrar el disco con ✓ (refuerzo positivo). */
  withCheck?: boolean
}

const STYLES: Record<Variant, string> = {
  success: 'bg-positive-soft border-positive text-positive-ink',
  gentle: 'bg-gentle-soft border-gentle text-gentle-ink',
  info: 'bg-surface border-border text-ink-soft',
}

/** Mensaje de acierto / reorientación. Nunca rojo agresivo. */
export function FeedbackBanner({
  variant,
  message,
  fontSize = 16,
  withCheck = false,
}: FeedbackBannerProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      role="status"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-center gap-4 rounded-2xl border-2 px-5 py-4 ${STYLES[variant]}`}
    >
      {withCheck && (
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-positive text-[24px] text-surface">
          ✓
        </span>
      )}
      <span className="font-serif font-semibold" style={{ fontSize: tpx(fontSize) }}>
        {message}
      </span>
    </motion.div>
  )
}
