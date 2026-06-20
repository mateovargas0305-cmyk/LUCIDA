import { useCallback, useEffect, useState } from 'react'

/**
 * Estado persistido en localStorage. Es un puente liviano hasta la Etapa 5,
 * donde la persistencia pasa a Dexie/IndexedDB. La API se mantiene chica a
 * propósito para que migrar sea transparente para los consumidores.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  isValid: (value: unknown) => value is T,
): readonly [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return initial
      const parsed: unknown = JSON.parse(raw)
      return isValid(parsed) ? parsed : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Almacenamiento no disponible (modo privado, etc.): seguimos en memoria.
    }
  }, [key, value])

  const set = useCallback((next: T) => setValue(next), [])

  return [value, set] as const
}
