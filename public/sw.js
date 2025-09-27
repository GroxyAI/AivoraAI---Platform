// Service Worker for push notifications
const CACHE_NAME = "aivora-ai-v2"
const urlsToCache = [
  "/",
  "/landing",
  "/home",
  "/chat",
  "/characters",
  "/settings",
  "/account",
  "/terms",
  "/guidelines",
  "/icon-192.png",
  "/icon-512.png",
  "/manifest.json",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("Failed to cache resources:", error)
      })
    }),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) {
    // Network-first for API routes
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: "Network unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      }),
    )
  } else {
    // Cache-first for static resources
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request).then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
      }),
    )
  }
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const data = event.notification.data
  let url = "/"

  if (data && data.type === "message" && data.characterName) {
    // Navigate to character chat when notification is clicked
    url = `/chat/${data.characterId || "1"}`
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }),
  )
})

self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      data: data.data || {},
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})
