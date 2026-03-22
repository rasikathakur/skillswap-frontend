self.addEventListener("push", function (event) {
    console.log("[Service Worker] Push Received.");
    if (!event.data) {
        console.warn("[Service Worker] Push event had no data.");
        return;
    }

    let title = "SkillSwap Reminder";
    let body = "Update from SkillSwap";
    let url = "/dashboard";

    try {
        const data = event.data.json();
        console.log("[Service Worker] Push Data (JSON):", data);
        title = data.title || title;
        body = data.body || body;
        url = data.url || url;
    } catch (err) {
        console.log("[Service Worker] Push Data (Text):", event.data.text());
        body = event.data.text() || body;
    }

    const options = {
        body: body,
        icon: "/vite.svg",
        badge: "/vite.svg",
        data: url,
        vibrate: [100, 50, 100],
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
            .then(() => console.log("[Service Worker] Notification shown."))
            .catch(err => console.error("[Service Worker] Error showing notification:", err))
    );
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data));
});
