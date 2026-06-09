const CACHE_NAME = 'ophelia-v7';
const STATIC = ['/', '/manifest.json', '/favicon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  if (url.includes('/static/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return res;
      })
    ).catch(() => caches.match('/'))
  );
});

// ── Scheduled event reminders ──────────────────────────────────────────────
// App sends { type:'schedule', event, minutesBefore, label } via postMessage
const timers = new Map();

self.addEventListener('message', event => {
  const { type, event: ev, minutesBefore, label, eventId } = event.data || {};

  if (type === 'schedule' && ev && ev.date && ev.time) {
    const eventMs = new Date(`${ev.date}T${ev.time}`).getTime();
    const notifyMs = eventMs - minutesBefore * 60 * 1000;
    const delay = notifyMs - Date.now();
    if (delay <= 0) return; // already passed

    if (timers.has(ev.id)) clearTimeout(timers.get(ev.id));
    const tid = setTimeout(() => {
      self.registration.showNotification(`Ophelia · ${ev.title}`, {
        body: `${label || 'Reminder'} · ${minutesBefore === 0 ? 'Starting now' : `in ${minutesBefore} min`}`,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: `event-${ev.id}`,
        data: { url: '/' },
      });
      timers.delete(ev.id);
    }, delay);
    timers.set(ev.id, tid);
  }

  if (type === 'cancel' && eventId) {
    if (timers.has(eventId)) { clearTimeout(timers.get(eventId)); timers.delete(eventId); }
  }

  if (type === 'notify') {
    // Immediate notification (day recap, partner event)
    self.registration.showNotification(event.data.title || 'Ophelia', {
      body: event.data.body || '',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: event.data.tag || 'ophelia',
      data: { url: '/' },
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
});

self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Ophelia', {
      body: data.body || '',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: data.tag || 'ophelia-push',
      data: { url: '/' },
    })
  );
});
