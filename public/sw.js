/* Service worker Togo Truck Connect — Notifications Web Push (module 2).
 * Fichier volontairement simple : pas de cache réseau agressif (l'application
 * est servie par Vercel). Son rôle : afficher les notifications push.
 */
const CHANNEL = "togo-truck-connect";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_e) {
    data = { title: "Togo Truck Connect", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Togo Truck Connect";
  const options = {
    body: data.body || "",
    icon: "/logo1.jpeg",
    badge: "/logo1.jpeg",
    data: { url: data.url || "/dashboard", type: data.type || "notification" },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url && client.url.includes(url)) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
