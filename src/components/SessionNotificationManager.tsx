import { useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function SessionNotificationManager() {
    const notifiedSessions = useRef<Set<string>>(new Set());

    const sendNotification = useCallback(async (title: string, body: string) => {
        if (!("Notification" in window)) {
            console.warn('[NotificationManager] Browser does not support notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, {
                    body: body,
                    icon: '/vite.svg',
                });
                console.log('[NotificationManager] Notification triggered via Service Worker:', title);
            } catch (err) {
                console.error('[NotificationManager] Error showing notification via SW:', err);
                // Fallback to basic notification if SW fails
                new Notification(title, { body, icon: '/vite.svg' });
            }
        } else {
            console.warn('[NotificationManager] Permission not granted. Status:', Notification.permission);
        }
    }, []);

    const requestNotificationPermission = useCallback(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('Notification permission granted!!');
                    sendNotification('Hello Developers!!', 'Notifications enabled for your learning sessions.');
                }
            });
        }
    }, [sendNotification]);

    const checkUpcomingSessions = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        const userId = localStorage.getItem('user_id');
        if (!token || !userId) return;

        console.log('[NotificationManager] Checking for upcoming sessions...');
        try {
            const res = await fetch(`${API_BASE_URL}/api/schedule/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.status === 'success' && data.schedules) {
                const now = new Date();
                console.log(`[NotificationManager] Found ${data.schedules.length} schedules.`);

                data.schedules.forEach((session: any) => {
                    const sessionDateTime = new Date(`${session.date}T${session.time}`);
                    const diffInMinutes = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60);

                    console.log(`[NotificationManager] Session "${session.title}" in ${diffInMinutes.toFixed(2)} mins. Notified: ${notifiedSessions.current.has(session.id.toString())}`);

                    // Window: 1 to 3 minutes before start
                    if (diffInMinutes > 1 && diffInMinutes <= 3 && !notifiedSessions.current.has(session.id.toString())) {
                        const personLabel = session.scheduler_id === userId ? session.participant_name : session.scheduler_name;

                        console.log(`[NotificationManager] TRIGGERING notification for "${session.title}"`);
                        sendNotification(
                            'Upcoming Session Reminder',
                            `Your session "${session.title}" with ${personLabel} starts in 2 minutes!`
                        );

                        notifiedSessions.current.add(session.id.toString());
                    }
                });
            }
        } catch (err) {
            console.error('[NotificationManager] Error fetching sessions:', err);
        }
    }, [sendNotification]);

    useEffect(() => {
        requestNotificationPermission();

        // Check immediately on mount
        checkUpcomingSessions();

        // Check every minute
        const interval = setInterval(checkUpcomingSessions, 60000);
        return () => clearInterval(interval);
    }, [requestNotificationPermission, checkUpcomingSessions]);

    return null; // This component doesn't render anything
}
