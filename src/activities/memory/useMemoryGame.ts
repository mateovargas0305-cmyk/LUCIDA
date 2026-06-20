import { useCallback, useEffect, useState } from 'react'
import type { MemoryActivityConfig } from '../../modes/types'
import { buildMemoryDeck, type MemoryCard } from './memoryEngine'

export interface MemoryGame {
  cards: MemoryCard[]
  isUp: (index: number) => boolean
  isMatched: (index: number) => boolean
  flip: (index: number) => void
  pairsFound: number
  totalPairs: number
  moves: number
  won: boolean
  restart: () => void
}

/** Juego de parejas: voltear, comparar y, si no coinciden, ocultar tras una pausa. */
export function useMemoryGame(cfg: MemoryActivityConfig): MemoryGame {
  const [cards, setCards] = useState<MemoryCard[]>(() => buildMemoryDeck(cfg))
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)

  // Al completar un par de cartas, decidir coincidencia (con pausa si fallan).
  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    if (cards[a].icon === cards[b].icon) {
      setMatched((m) => [...m, a, b])
      setFlipped([])
      return
    }
    const t = setTimeout(() => setFlipped([]), cfg.flipBackMs)
    return () => clearTimeout(t)
  }, [flipped, cards, cfg.flipBackMs])

  const flip = useCallback(
    (index: number) => {
      setFlipped((current) => {
        if (current.length >= 2) return current
        if (current.includes(index)) return current
        if (current.length === 1) setMoves((m) => m + 1)
        return [...current, index]
      })
    },
    [],
  )

  const restart = useCallback(() => {
    setCards(buildMemoryDeck(cfg))
    setFlipped([])
    setMatched([])
    setMoves(0)
  }, [cfg])

  return {
    cards,
    isUp: (i) => flipped.includes(i) || matched.includes(i),
    isMatched: (i) => matched.includes(i),
    flip: (i) => {
      if (matched.includes(i)) return
      flip(i)
    },
    pairsFound: matched.length / 2,
    totalPairs: cfg.pairs,
    moves,
    won: cards.length > 0 && matched.length === cards.length,
    restart,
  }
}
