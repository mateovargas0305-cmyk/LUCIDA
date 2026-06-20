import { motion, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { SessionSummary } from '../../components/SessionSummary'
import { NatureIcon } from '../../components/icons/NatureIcon'
import { useModeConfig } from '../../modes/modeContext'
import { useNav } from '../../navigation/navContext'
import { tpx } from '../../lib/typography'
import { useMemoryGame } from './useMemoryGame'

export function MemoryScreen() {
  const config = useModeConfig()
  const { back } = useNav()
  const reduce = useReducedMotion()
  const memCfg = config.activities.memory
  const game = useMemoryGame(memCfg)

  if (game.won) {
    return (
      <SessionSummary
        headline="¡Tablero completo!"
        subline={
          <>
            {game.totalPairs} parejas en{' '}
            <strong>{game.moves} movimientos</strong>.
          </>
        }
        stats={[
          { label: 'Parejas', value: game.totalPairs, accent: 'sereno' },
          { label: 'Movimientos', value: game.moves, accent: 'agil' },
        ]}
        record={{
          activity: 'memory',
          mode: config.id,
          correct: game.totalPairs,
          total: game.totalPairs,
          score: game.pairsFound * config.scoring.pointsPerCorrect,
        }}
        onAgain={game.restart}
        onHome={back}
        againLabel="Jugar de nuevo"
      />
    )
  }

  const big = !config.scoring.enabled // Calmo: cartas grandes, sin contadores
  const iconSize = big ? 60 : 30

  return (
    <main
      className="flex flex-1 flex-col px-6 pb-9 pt-12"
      style={{ rowGap: config.controls.blockGapPx }}
    >
      {big ? (
        <div>
          <h1
            className="font-serif font-semibold leading-snug text-ink-strong"
            style={{ fontSize: tpx(config.typography.headingPx) }}
          >
            Buscá las dos parejas iguales
          </h1>
          <p
            className="mt-2 leading-relaxed text-ink-soft"
            style={{ fontSize: tpx(config.typography.baseTextPx) }}
          >
            Tocá una carta para darla vuelta.
          </p>
        </div>
      ) : (
        <>
          <ScreenHeader title="Memoria" />
          <div className="flex gap-3">
            <span className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sereno-soft py-2.5 text-[13px] font-bold text-sereno-strong">
              Parejas
              <strong className="font-serif text-[17px]">
                {game.pairsFound}/{game.totalPairs}
              </strong>
            </span>
            <span className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-agil-soft py-2.5 text-[13px] font-bold text-agil-strong">
              Movimientos
              <strong className="font-serif text-[17px]">{game.moves}</strong>
            </span>
          </div>
        </>
      )}

      <ul
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${memCfg.columns}, minmax(0, 1fr))`,
          gap: big ? 16 : 9,
        }}
      >
        {game.cards.map((card, i) => {
          const up = game.isUp(i)
          const matched = game.isMatched(i)
          return (
            <li key={card.key}>
              <motion.button
                onClick={() => game.flip(i)}
                disabled={up}
                whileTap={reduce || up ? undefined : { scale: 0.96 }}
                aria-label={up ? card.icon : 'Carta tapada'}
                className={`flex aspect-square w-full items-center justify-center border-2 transition-colors ${
                  big ? 'rounded-3xl' : 'rounded-2xl'
                } ${
                  matched
                    ? 'border-positive bg-positive-soft text-positive'
                    : up
                      ? 'border-border-strong bg-surface text-calmo-strong'
                      : 'border-calmo-strong bg-calmo text-calmo'
                }`}
              >
                {up ? (
                  <NatureIcon id={card.icon} size={iconSize} />
                ) : (
                  <span
                    className="rounded-full bg-surface/60"
                    style={{ width: big ? 30 : 13, height: big ? 30 : 13 }}
                    aria-hidden
                  />
                )}
              </motion.button>
            </li>
          )
        })}
      </ul>

      {big ? (
        <div className="mt-auto flex items-center justify-center gap-3 rounded-2xl bg-surface py-4">
          <span
            className="font-sans font-bold text-ink-soft"
            style={{ fontSize: tpx(config.typography.baseTextPx - 2) }}
          >
            Parejas encontradas:
          </span>
          <span className="font-serif text-[22px] font-bold text-sereno-strong">
            {game.pairsFound}
          </span>
        </div>
      ) : (
        <p className="mt-auto pt-2 text-center text-[13px] leading-snug text-ink-muted">
          Encontrá las {game.totalPairs} parejas. Tocá dos cartas por turno.
        </p>
      )}
    </main>
  )
}
