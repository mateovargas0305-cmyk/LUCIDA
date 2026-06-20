import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ScreenHeader } from '../../components/ui/ScreenHeader'
import { SessionSummary } from '../../components/SessionSummary'
import { NatureIcon } from '../../components/icons/NatureIcon'
import { useModeConfig } from '../../modes/modeContext'
import { useNav } from '../../navigation/navContext'
import { tpx } from '../../lib/typography'
import { useMemoryGame } from './useMemoryGame'
import { getBestMemoryTime } from '../../db/sessions'

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function MemoryScreen() {
  const config = useModeConfig()
  const { back } = useNav()
  const reduce = useReducedMotion()
  const memCfg = config.activities.memory
  const game = useMemoryGame(memCfg)
  const [bestMs, setBestMs] = useState<number | null>(null)

  useEffect(() => {
    if (!memCfg.showTimer) return
    void getBestMemoryTime(config.id, memCfg.pairs).then(setBestMs)
  }, [memCfg.showTimer, config.id, memCfg.pairs])

  if (game.won) {
    const isNewRecord =
      memCfg.showTimer &&
      game.elapsedMs > 0 &&
      (bestMs === null || game.elapsedMs < bestMs)

    return (
      <SessionSummary
        headline={isNewRecord ? '¡Nuevo récord!' : '¡Tablero completo!'}
        subline={
          memCfg.showTimer ? (
            <>
              {game.totalPairs} parejas en{' '}
              <strong>{formatTime(game.elapsedMs)}</strong>
              {bestMs !== null && !isNewRecord && (
                <> · récord: {formatTime(bestMs)}</>
              )}
            </>
          ) : (
            <>
              {game.totalPairs} parejas en{' '}
              <strong>{game.moves} movimientos</strong>.
            </>
          )
        }
        stats={
          memCfg.showTimer
            ? [
                { label: 'Tiempo', value: formatTime(game.elapsedMs), accent: 'agil' as const },
                {
                  label: isNewRecord ? '¡Récord!' : 'Récord anterior',
                  value: bestMs !== null && !isNewRecord ? formatTime(bestMs) : '—',
                  accent: 'sereno' as const,
                },
              ]
            : [
                { label: 'Parejas', value: game.totalPairs, accent: 'sereno' as const },
                { label: 'Movimientos', value: game.moves, accent: 'agil' as const },
              ]
        }
        record={{
          activity: 'memory',
          mode: config.id,
          correct: game.totalPairs,
          total: game.totalPairs,
          score: game.pairsFound * config.scoring.pointsPerCorrect,
          durationMs: memCfg.showTimer ? game.elapsedMs : undefined,
        }}
        onAgain={game.restart}
        onHome={back}
        againLabel="Jugar de nuevo"
      />
    )
  }

  const big = !config.scoring.enabled
  const iconSize = big ? 60 : 30
  const showLiveTimer = memCfg.showTimer && game.elapsedMs > 0

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
            Buscá las parejas iguales
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
            {showLiveTimer ? (
              <span className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-agil-soft py-2.5 text-[13px] font-bold text-agil-strong">
                Tiempo
                <strong className="font-serif text-[17px]">
                  {formatTime(game.elapsedMs)}
                </strong>
              </span>
            ) : (
              <span className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-agil-soft py-2.5 text-[13px] font-bold text-agil-strong">
                Movimientos
                <strong className="font-serif text-[17px]">{game.moves}</strong>
              </span>
            )}
          </div>
          {bestMs !== null && (
            <p className="text-center text-[12px] font-bold text-ink-muted">
              Récord: {formatTime(bestMs)}
            </p>
          )}
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
