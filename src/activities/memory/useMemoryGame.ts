import { useCallback, useEffect, useRef, useState } from 'react'
import type { MemoryActivityConfig } from '../../modes/types'
import { buildMemoryDeck, type MemoryCard } from './memoryEngine'

export interface MemoryGame {
  cards: MemoryCard[]
  isUp: (index: number) => boolean
  isMatched: (index: number) => boolean
  flip: (index: number) => void
  /** Cuántas cartas están dadas vuelta y esperando pareja (0, 1 o 2). */
  flipCount: number
  /** Descarta la carta única que esté dada vuelta (usada por Pulso al agotar el tiempo). */
  resetFlip: () => void
  pairsFound: number
  totalPairs: number
  moves: number
  won: boolean
  restart: () => void
  /** Tiempo transcurrido en ms desde la primera carta. 0 si showTimer es false o no inició. */
  elapsedMs: number
}

export function useMemoryGame(cfg: MemoryActivityConfig): MemoryGame {
  const [cards, setCards] = useState<MemoryCard[]>(() => buildMemoryDeck(cfg))
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const won = cards.length > 0 && matched.length === cards.length

  // Tick del cronómetro cada 200ms (suficiente para MM:SS).
  useEffect(() => {
    if (!cfg.showTimer || !startedAt || won) return
    const id = setInterval(() => setElapsedMs(Date.now() - startedAt), 200)
    return () => clearInterval(id)
  }, [cfg.showTimer, startedAt, won])

  // Capturar el ms exacto al ganar.
  const prevWonRef = useRef(false)
  useEffect(() => {
    if (won && !prevWonRef.current && startedAt !== null) {
      setElapsedMs(Date.now() - startedAt)
    }
    prevWonRef.current = won
  }, [won, startedAt])

  // Lógica de coincidencia de parejas.
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
      // Iniciar cronómetro en la primera carta.
      if (cfg.showTimer) {
        setStartedAt((prev) => (prev === null ? Date.now() : prev))
      }
      setFlipped((current) => {
        if (current.length >= 2) return current
        if (current.includes(index)) return current
        if (current.length === 1) setMoves((m) => m + 1)
        return [...current, index]
      })
    },
    [cfg.showTimer],
  )

  const resetFlip = useCallback(() => {
    setFlipped([])
  }, [])

  const restart = useCallback(() => {
    setCards(buildMemoryDeck(cfg))
    setFlipped([])
    setMatched([])
    setMoves(0)
    setStartedAt(null)
    setElapsedMs(0)
    prevWonRef.current = false
  }, [cfg])

  return {
    cards,
    isUp: (i) => flipped.includes(i) || matched.includes(i),
    isMatched: (i) => matched.includes(i),
    flip: (i) => {
      if (matched.includes(i)) return
      flip(i)
    },
    flipCount: flipped.length,
    resetFlip,
    pairsFound: matched.length / 2,
    totalPairs: cfg.pairs,
    moves,
    won,
    restart,
    elapsedMs,
  }
}
