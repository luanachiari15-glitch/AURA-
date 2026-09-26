// AURA ✦ Service Worker - Web Push & Background Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle real device Web Push events (even when app/tab is closed)
self.addEventListener('push', (event) => {
  let payload = {
    title: 'AURA ✦',
    body: 'Seu AURA está te esperando ✦ Hora de cuidar da sua melhor versão.',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'aura-notification',
    url: '/',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch (e) {
      payload.body = event.data.text() || payload.body;
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon || '/favicon.png',
    badge: payload.badge || '/favicon.png',
    vibrate: [120, 60, 120],
    data: {
      url: payload.url || '/',
      dateOfArrival: Date.now(),
    },
    tag: payload.tag || 'aura-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'AURA ✦', notificationOptions)
  );
});

// When user taps on the push notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new window to the app
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
