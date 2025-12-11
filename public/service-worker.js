// Zylmia Service Worker
// Handles caching, offline support, background sync, and push notifications

const CACHE_NAME = 'zylmia-cache-v1';
const RUNTIME_CACHE = 'zylmia-runtime-v1';
const NOTIFICATION_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Files to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png',
    '/favicon.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
            .then(() => {
                // Start background episode checking
                startEpisodeCheckAlarm();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Handle API requests differently
    if (event.request.url.includes('api.themoviedb.org')) {
        event.respondWith(networkFirstStrategy(event.request));
        return;
    }

    // Handle image requests from TMDB
    if (event.request.url.includes('image.tmdb.org')) {
        event.respondWith(cacheFirstStrategy(event.request));
        return;
    }

    // For other requests, try cache first, then network
    event.respondWith(cacheFirstStrategy(event.request));
});

// Cache first strategy
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);
        // Return a fallback response for images
        if (request.destination === 'image') {
            return new Response('', { status: 404, statusText: 'Not Found' });
        }
        throw error;
    }
}

// Network first strategy
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Handle push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch (e) {
        data = {
            title: 'Zylmia Notification',
            body: event.data.text(),
            icon: '/logo.png'
        };
    }

    const options = {
        body: data.body || 'New episode released!',
        icon: data.icon || '/logo.png',
        badge: '/logo.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
            ...data
        },
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        requireInteraction: true,
        tag: data.tag || 'zylmia-notification'
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Zylmia', options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if app is already open
                for (const client of windowClients) {
                    if (client.url.includes(self.registration.scope) && 'focus' in client) {
                        client.focus();
                        client.navigate(urlToOpen);
                        return;
                    }
                }
                // Open a new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CHECK_EPISODES') {
        checkForNewEpisodes();
    }

    if (event.data && event.data.type === 'STORE_TMDB_TOKEN') {
        // Store token in IndexedDB for background checks
        storeToken(event.data.token);
    }
});

// Start periodic episode checking using alarms (if supported) or setInterval
function startEpisodeCheckAlarm() {
    // Use Periodic Background Sync if available
    if ('periodicSync' in self.registration) {
        self.registration.periodicSync.register('check-episodes', {
            minInterval: NOTIFICATION_CHECK_INTERVAL
        }).catch((error) => {
            console.log('[SW] Periodic sync registration failed:', error);
            // Fallback to regular interval
            setInterval(checkForNewEpisodes, NOTIFICATION_CHECK_INTERVAL);
        });
    } else {
        // Fallback for browsers without periodic sync
        setInterval(checkForNewEpisodes, NOTIFICATION_CHECK_INTERVAL);
    }
}

// Handle periodic sync
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-episodes') {
        event.waitUntil(checkForNewEpisodes());
    }
});

// IndexedDB helpers for storing TMDB token
const DB_NAME = 'zylmia-sw-db';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

async function storeToken(token) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(token, 'tmdb_token');
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
        console.log('[SW] Token stored successfully');
    } catch (error) {
        console.error('[SW] Failed to store token:', error);
    }
}

async function getToken() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get('tmdb_token');
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    } catch (error) {
        console.error('[SW] Failed to get token:', error);
        return null;
    }
}

async function getWatchlist() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get('watchlist');
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    } catch (error) {
        console.error('[SW] Failed to get watchlist:', error);
        return [];
    }
}

async function storeWatchlist(watchlist) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(watchlist, 'watchlist');
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    } catch (error) {
        console.error('[SW] Failed to store watchlist:', error);
    }
}

async function getLastCheckedEpisodes() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get('last_checked_episodes');
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result || {});
            request.onerror = () => resolve({});
        });
    } catch (error) {
        return {};
    }
}

async function storeLastCheckedEpisodes(episodes) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(episodes, 'last_checked_episodes');
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    } catch (error) {
        console.error('[SW] Failed to store last checked episodes:', error);
    }
}

// Check for new episodes and send notifications
async function checkForNewEpisodes() {
    console.log('[SW] Checking for new episodes...');

    try {
        const token = await getToken();
        if (!token) {
            console.log('[SW] No TMDB token available');
            return;
        }

        // Get watchlist from main thread via broadcast
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            // Request fresh watchlist data from client
            clients[0].postMessage({ type: 'REQUEST_WATCHLIST' });
        }

        const watchlist = await getWatchlist();
        if (!watchlist || watchlist.length === 0) {
            console.log('[SW] No items in watchlist');
            return;
        }

        const lastChecked = await getLastCheckedEpisodes();
        const newLastChecked = { ...lastChecked };
        const notifications = [];

        for (const item of watchlist) {
            if (item.media_type !== 'tv') continue;

            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/tv/${item.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (!response.ok) continue;

                const details = await response.json();
                const lastEpisode = details.last_episode_to_air;
                const nextEpisode = details.next_episode_to_air;

                // Check if last episode was just released (within 24 hours)
                if (lastEpisode && lastEpisode.air_date) {
                    const episodeKey = `${item.id}_${lastEpisode.season_number}_${lastEpisode.episode_number}`;
                    const airDate = new Date(lastEpisode.air_date);
                    const now = new Date();
                    const daysSinceAir = (now - airDate) / (1000 * 60 * 60 * 24);

                    // If episode aired today and we haven't notified
                    if (daysSinceAir >= 0 && daysSinceAir <= 1 && !lastChecked[episodeKey]) {
                        notifications.push({
                            title: `🎬 ${item.title} - New Episode!`,
                            body: `S${lastEpisode.season_number}E${lastEpisode.episode_number}: ${lastEpisode.name || 'New Episode'} is now available!`,
                            icon: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '/logo.png',
                            tag: `episode-${episodeKey}`,
                            url: '/watchlist'
                        });
                        newLastChecked[episodeKey] = true;
                    }
                }

                // Check if next episode is releasing today
                if (nextEpisode && nextEpisode.air_date) {
                    const episodeKey = `${item.id}_${nextEpisode.season_number}_${nextEpisode.episode_number}_upcoming`;
                    const airDate = new Date(nextEpisode.air_date);
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const episodeDate = new Date(airDate.getFullYear(), airDate.getMonth(), airDate.getDate());

                    // If episode airs today and we haven't notified
                    if (episodeDate.getTime() === today.getTime() && !lastChecked[episodeKey]) {
                        notifications.push({
                            title: `📅 ${item.title} - Episode Today!`,
                            body: `S${nextEpisode.season_number}E${nextEpisode.episode_number}: ${nextEpisode.name || 'New Episode'} releases today!`,
                            icon: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '/logo.png',
                            tag: `upcoming-${episodeKey}`,
                            url: '/watchlist'
                        });
                        newLastChecked[episodeKey] = true;
                    }
                }

                // Rate limiting - wait a bit between API calls
                await new Promise(resolve => setTimeout(resolve, 250));
            } catch (error) {
                console.error(`[SW] Failed to check ${item.title}:`, error);
            }
        }

        // Store updated last checked state
        await storeLastCheckedEpisodes(newLastChecked);

        // Show notifications
        for (const notification of notifications) {
            await self.registration.showNotification(notification.title, {
                body: notification.body,
                icon: notification.icon,
                badge: '/logo.png',
                vibrate: [200, 100, 200],
                data: { url: notification.url },
                tag: notification.tag,
                requireInteraction: true,
                actions: [
                    { action: 'open', title: 'Watch Now' },
                    { action: 'dismiss', title: 'Later' }
                ]
            });
        }

        console.log(`[SW] Episode check complete. ${notifications.length} new notifications.`);
    } catch (error) {
        console.error('[SW] Episode check failed:', error);
    }
}
