import type { PushTone } from './types'
import { localDay } from '../db/sessions'

const PREFS_KEY = 'lucida.pushPrefs'
const CACHE_NAME = 'lucida-push-config'
const ICON = 'pwa-192.png'

export const PUSH_BODY: Record<PushTone, string> = {
  motivator: 'Tu cerebro está listo para el desafío de hoy.',
  neutral: 'Un momento para entrenar la mente.',
  care: 'Un momento de pausa para vos.',
}

interface StoredPrefs {
  enabled: boolean
  time: string
  lastShownDay: string
}

function loadStoredPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { enabled: false, time: '09:00', lastShownDay: '' }
    return { enabled: false, time: '09:00', lastShownDay: '', ...JSON.parse(raw) }
  } catch {
    return { enabled: false, time: '09:00', lastShownDay: '' }
  }
}

/** Guarda el texto de notificación en Cache API para que el SW lo lea en background. */
async function savePushBodyToCache(body: string): Promise<void> {
  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.put('push-body', new Response(body))
  } catch {}
}

/** Registra periodic background sync (Chrome/Android PWA). Falla silenciosamente si no hay soporte. */
async function registerPeriodicSync(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready
    if (!('periodicSync' in reg)) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (reg as any).periodicSync.register('lucida-reminder', {
      minInterval: 24 * 60 * 60 * 1000,
    })
  } catch {}
}

async function unregisterPeriodicSync(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.ready
    if (!('periodicSync' in reg)) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (reg as any).periodicSync.unregister('lucida-reminder')
  } catch {}
}

/** Muestra una notificación de prueba inmediatamente (requiere permiso concedido). */
export async function showDemoNotification(tone: PushTone): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const body = PUSH_BODY[tone]
  try {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification('Lúcida', { body, icon: ICON, badge: ICON, tag: 'lucida-demo' })
  } catch {
    new Notification('Lúcida', { body, icon: ICON })
  }
}

/** Llamar al activar notificaciones (guarda config en Cache + registra periodic sync). */
export async function onNotificationsEnabled(tone: PushTone): Promise<void> {
  await savePushBodyToCache(PUSH_BODY[tone])
  await registerPeriodicSync()
}

/** Llamar al desactivar notificaciones. */
export async function onNotificationsDisabled(): Promise<void> {
  await unregisterPeriodicSync()
}

/**
 * Llamar al abrir la app.
 * Si las notificaciones están activas, el horario llegó y aún no se mostró hoy,
 * muestra la notificación y la marca como enviada.
 */
export async function checkAndNotifyIfDue(tone: PushTone): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const prefs = loadStoredPrefs()
  if (!prefs.enabled) return

  const today = localDay()
  if (prefs.lastShownDay === today) return

  const [h, m] = prefs.time.split(':').map(Number)
  const now = new Date()
  if (now.getHours() < h || (now.getHours() === h && now.getMinutes() < m)) return

  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prefs, lastShownDay: today }))
  } catch {}

  await showDemoNotification(tone)
}
