/** Devuelve una copia barajada (Fisher–Yates). No muta el original. */
export function shuffled<T>(input: readonly T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Toma hasta `n` elementos al azar de la lista. */
export function sampleN<T>(input: readonly T[], n: number): T[] {
  return shuffled(input).slice(0, Math.max(0, n))
}
