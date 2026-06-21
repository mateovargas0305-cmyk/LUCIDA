import { motion, useReducedMotion } from 'framer-motion'
import { Logo } from '../components/Logo'
import { MODE_CONFIGS, MODE_ORDER } from '../modes/configs'
import { useMode } from '../modes/modeContext'
import { useNav } from '../navigation/navContext'
import { ACCENT } from '../lib/accent'
import type { ModeId } from '../modes/types'

/** Íconos por modo, recreados con elementos (sin imágenes externas). */
function ModeGlyph({ id }: { id: ModeId }) {
  if (id === 'agil') {
    return (
      <span className="flex items-end gap-1" aria-hidden>
        <span className="h-3 w-[5px] rounded-[3px] bg-agil" />
        <span className="h-5 w-[5px] rounded-[3px] bg-agil" />
        <span className="h-7 w-[5px] rounded-[3px] bg-agil" />
      </span>
    )
  }
  if (id === 'sereno') {
    return (
      <span
        className="h-6 w-6 rounded-full border-[5px] border-sereno"
        aria-hidden
      />
    )
  }
  return (
    <span className="font-serif text-[28px] font-bold leading-none text-calmo" aria-hidden>
      Aa
    </span>
  )
}

export function ModeSelectScreen() {
  const { mode, setMode } = useMode()
  const { navigate } = useNav()
  const reduce = useReducedMotion()

  const choose = (id: ModeId) => {
    setMode(id)
    navigate({ name: 'home' })
  }

  return (
    <main className="flex flex-1 flex-col px-6 pb-10 pt-8">
      <Logo size={28} />

      <h1 className="mt-9 font-serif text-[25px] font-semibold leading-tight text-ink-strong">
        ¿Cómo querés practicar hoy?
      </h1>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
        Elegí un modo. Podés cambiarlo cuando quieras.
      </p>

      <ul className="mt-6 flex flex-col gap-3.5">
        {MODE_ORDER.map((id, i) => {
          const m = MODE_CONFIGS[id]
          const accent = ACCENT[m.accent]
          const isCurrent = id === mode
          return (
            <motion.li
              key={id}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.04 * i, duration: 0.3 }}
            >
              <button
                onClick={() => choose(id)}
                aria-current={isCurrent ? 'true' : undefined}
                className={`flex w-full items-center gap-4 rounded-2xl border bg-surface p-4 text-left shadow-soft transition-colors ${
                  isCurrent ? 'border-border-strong' : 'border-border'
                }`}
              >
                <span
                  className={`flex h-14 w-14 flex-none items-center justify-center rounded-2xl ${accent.softBg}`}
                >
                  <ModeGlyph id={id} />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-serif text-[19px] font-semibold text-ink-strong">
                      {m.label}
                    </span>
                    <span
                      className={`rounded-pill ${accent.softBg} ${accent.strongText} px-2.5 py-0.5 text-[11px] font-bold`}
                    >
                      {m.badge}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-soft">
                    {m.tagline}
                  </span>
                </span>
                <span className="text-[23px] leading-none text-ink-muted" aria-hidden>
                  ›
                </span>
              </button>
            </motion.li>
          )
        })}
      </ul>

      <p className="mt-auto pt-10 text-center text-[12.5px] leading-relaxed text-ink-muted">
        Una identidad, tres ritmos. La calidez no cambia.
      </p>
    </main>
  )
}
