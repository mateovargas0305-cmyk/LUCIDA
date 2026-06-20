interface LogoProps {
  size?: number
  withWordmark?: boolean
}

/** Marca de Lúcida: disco terracota con luna ocre. */
export function Logo({ size = 28, withWordmark = true }: LogoProps) {
  return (
    <span className="inline-flex items-center gap-[0.4em]">
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        role="img"
        aria-label="Lúcida"
      >
        <circle cx="14" cy="14" r="13" className="fill-calmo" />
        <circle cx="18.5" cy="10" r="4.5" className="fill-agil-soft" />
      </svg>
      {withWordmark && (
        <span
          className="font-serif font-semibold tracking-wide text-ink-strong"
          style={{ fontSize: size * 0.96 }}
        >
          Lúcida
        </span>
      )}
    </span>
  )
}
