export async function enablePush(userId: string) {
    console.log("Attempting to enable push for user:", userId);
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        const msg = "Push notifications are not supported in your browser.";
        console.warn(msg);
        alert(msg);
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered/found with scope:", registration.scope);

        await navigator.serviceWorker.ready;
        console.log("Service Worker is ready");

        const permission = await Notification.requestPermission();
        console.log("Notification permission status:", permission);
        if (permission !== "granted") {
            const msg = "Notification permission denied. Please allow notifications in your browser settings.";
            console.warn(msg);
            alert(msg);
            return;
        }

        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        console.log("VAPID Public Key found:", !!publicVapidKey);
        if (!publicVapidKey) {
            const msg = "VITE_VAPID_PUBLIC_KEY is not defined in .env";
            console.error(msg);
            alert(msg);
            return;
        }

        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();
        console.log("Existing subscription:", subscription);

        if (!subscription) {
            console.log("No existing subscription. Subscribing now...");
            try {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
                });
                console.log("New subscription obtained:", subscription);
            } catch (subscribeError) {
                const msg = `Failed to subscribe: ${subscribeError instanceof Error ? subscribeError.message : String(subscribeError)}`;
                console.error(msg);
                alert(msg);
                return;
            }
        }

        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/push/save-subscription`;
        console.log("Saving subscription to:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, subscription }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to save subscription on server");
        }

        const result = await response.json();
        console.log("Subscription result:", result);
        alert(result.message || "Push notifications enabled successfully! A test notification has been sent.");
        return subscription;
    } catch (error) {
        console.error("Error enabling push notifications:", error);
        alert(`Integration Error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
