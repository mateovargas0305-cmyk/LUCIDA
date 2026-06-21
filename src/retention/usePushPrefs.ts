import { useCallback, useState } from 'react'

export interface PushPrefs {
  enabled: boolean
  /** Horario elegido en formato HH:MM. */
  time: string
  /** YYYY-MM-DD del último día que se mostró la notificación (evita duplicados). */
  lastShownDay: string
}

const KEY = 'lucida.pushPrefs'
const DEFAULTS: PushPrefs = { enabled: false, time: '09:00', lastShownDay: '' }

function load(): PushPrefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function usePushPrefs() {
  const [prefs, setPrefs] = useState<PushPrefs>(load)

  const update = useCallback((patch: Partial<PushPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  return { prefs, update }
}
