const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    let accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // Double check for expired token message even if not 401
        try {
            const clone = response.clone();
            const data = await clone.json();
            const msg = (data.message || data.detail || "").toString().toLowerCase();
            if (msg.includes("expired") && response.status !== 401) {
                localStorage.clear();
                window.location.href = '/signin';
            }
        } catch (e) { /* ignore parse errors */ }
    }

    if (response.status === 401) {
        // Attempt to refresh token
        if (refreshToken) {
            try {
                const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    accessToken = data.access_token;
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);

                    // Retry the original request with new token
                    response = await fetch(`${API_BASE_URL}${endpoint}`, {
                        ...options,
                        headers: {
                            ...headers,
                            'Authorization': `Bearer ${accessToken}`,
                        },
                    });
                } else {
                    // Refresh failed, clear everything and redirect to signin
                    localStorage.clear();
                    window.location.href = '/signin';
                }
            } catch (err) {
                console.error('Token refresh error:', err);
                localStorage.clear();
                window.location.href = '/signin';
            }
        } else {
            localStorage.clear();
            window.location.href = '/signin';
        }
    }

    return response;
}
