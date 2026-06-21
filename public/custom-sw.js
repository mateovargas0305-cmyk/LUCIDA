// Lúcida — service worker custom: recordatorios periódicos y click en notificación.
// Importado por el SW generado por Workbox via importScripts().

self.addEventListener('periodicsync', (event) => {
  if (event.tag !== 'lucida-reminder') return

  event.waitUntil(
    (async () => {
      // Si la app está abierta, no duplicar la notificación (el check in-app la muestra).
      const allClients = await self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window',
      })
      if (allClients.length > 0) return

      // Leer el texto guardado por la app en Cache API (tono del modo activo).
      let body = 'Llegó tu momento de practicar.'
      try {
        const cache = await caches.open('lucida-push-config')
        const res = await cache.match('push-body')
        if (res) body = await res.text()
      } catch (_) {}

      await self.registration.showNotification('Lúcida', {
        body,
        icon: 'pwa-192.png',
        badge: 'pwa-192.png',
        tag: 'lucida-daily',
        renotify: false,
      })
    })(),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        if (clients.length > 0) return clients[0].focus()
        return self.clients.openWindow(self.location.origin)
      }),
  )
})
