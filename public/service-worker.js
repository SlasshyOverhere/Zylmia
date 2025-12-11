// Zylmia Service Worker
// Handles caching, offline support, background sync, and push notifications

const CACHE_NAME = 'zylmia-cache-v2';
const RUNTIME_CACHE = 'zylmia-runtime-v2';
const NOTIFICATION_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
const BACKGROUND_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour for background checks

// Files to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png',
    '/favicon.png'
];

// Keep track of the check timer
let episodeCheckTimer = null;
let lastCheckTime = 0;

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches and start background checks
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
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
                initializeBackgroundChecks();
                // Run an initial check
                scheduleNextCheck(5000); // Check 5 seconds after activation
            })
    );
});

// Initialize background checking mechanisms
function initializeBackgroundChecks() {
    console.log('[SW] Initializing background checks...');

    // Register for periodic background sync (Chrome/Edge)
    if ('periodicSync' in self.registration) {
        self.registration.periodicSync.register('check-episodes', {
            minInterval: BACKGROUND_CHECK_INTERVAL
        }).then(() => {
            console.log('[SW] Periodic sync registered successfully');
        }).catch((error) => {
            console.log('[SW] Periodic sync registration failed:', error);
            // Fall back to timer-based approach
            startTimerBasedChecks();
        });
    } else {
        // Fallback for browsers without periodic sync
        startTimerBasedChecks();
    }
}

// Timer-based checking fallback
function startTimerBasedChecks() {
    console.log('[SW] Starting timer-based background checks');
    // Clear any existing timer
    if (episodeCheckTimer) {
        clearInterval(episodeCheckTimer);
    }
    // Set up recurring check
    episodeCheckTimer = setInterval(() => {
        checkForNewEpisodes();
    }, NOTIFICATION_CHECK_INTERVAL);
}

// Schedule the next check with a delay
function scheduleNextCheck(delay) {
    setTimeout(() => {
        const now = Date.now();
        // Only check if enough time has passed since last check
        if (now - lastCheckTime >= NOTIFICATION_CHECK_INTERVAL - 60000) {
            checkForNewEpisodes();
        }
    }, delay);
}

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

// Handle push notifications (for future push server integration)
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');

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
        vibrate: [100, 50, 100, 50, 100],
        data: {
            url: data.url || '/watchlist',
            ...data
        },
        actions: [
            { action: 'open', title: '▶️ Watch Now' },
            { action: 'dismiss', title: 'Later' }
        ],
        requireInteraction: true,
        tag: data.tag || 'zylmia-notification',
        renotify: true,
        silent: false
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Zylmia', options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);
    event.notification.close();

    if (event.action === 'dismiss') return;

    const urlToOpen = event.notification.data?.url || '/watchlist';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Check if app is already open
                for (const client of windowClients) {
                    if (client.url.includes(self.registration.scope) && 'focus' in client) {
                        client.focus();
                        if (client.navigate) {
                            client.navigate(urlToOpen);
                        }
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
    console.log('[SW] Message received:', event.data?.type);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CHECK_EPISODES') {
        event.waitUntil(checkForNewEpisodes());
    }

    if (event.data && event.data.type === 'STORE_TMDB_TOKEN') {
        event.waitUntil(storeToken(event.data.token));
    }

    if (event.data && event.data.type === 'SYNC_WATCHLIST') {
        event.waitUntil(storeWatchlist(event.data.watchlist));
    }

    if (event.data && event.data.type === 'START_BACKGROUND_CHECKS') {
        initializeBackgroundChecks();
    }
});

// Handle periodic sync events
self.addEventListener('periodicsync', (event) => {
    console.log('[SW] Periodic sync event:', event.tag);
    if (event.tag === 'check-episodes') {
        event.waitUntil(checkForNewEpisodes());
    }
});

// Handle background sync (for when coming online after being offline)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync event:', event.tag);
    if (event.tag === 'check-episodes') {
        event.waitUntil(checkForNewEpisodes());
    }
    if (event.tag === 'sync-watchlist') {
        event.waitUntil(syncWatchlistFromClients());
    }
});

// Sync watchlist from connected clients
async function syncWatchlistFromClients() {
    const allClients = await self.clients.matchAll();
    if (allClients.length > 0) {
        allClients[0].postMessage({ type: 'REQUEST_WATCHLIST' });
    }
}

// IndexedDB helpers for storing TMDB token
const DB_NAME = 'zylmia-sw-db';
const DB_VERSION = 2;
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
        store.put(Date.now(), 'watchlist_updated');
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
        console.log('[SW] Watchlist stored:', watchlist.length, 'items');
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
        store.put(Date.now(), 'last_check_time');
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    } catch (error) {
        console.error('[SW] Failed to store last checked episodes:', error);
    }
}

async function getLastCheckTime() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get('last_check_time');
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result || 0);
            request.onerror = () => resolve(0);
        });
    } catch (error) {
        return 0;
    }
}

// Main function to check for new episodes and send notifications
async function checkForNewEpisodes() {
    const now = Date.now();
    const lastCheck = await getLastCheckTime();

    // Prevent checking too frequently (minimum 5 minutes between checks)
    if (now - lastCheck < 5 * 60 * 1000) {
        console.log('[SW] Skipping check - too recent. Last check:', new Date(lastCheck).toLocaleString());
        return;
    }

    console.log('[SW] Checking for new episodes at', new Date().toLocaleString());
    lastCheckTime = now;

    try {
        const token = await getToken();
        if (!token) {
            console.log('[SW] No TMDB token available - requesting from client');
            // Try to get token from active clients
            const allClients = await self.clients.matchAll();
            if (allClients.length > 0) {
                allClients.forEach(client => {
                    client.postMessage({ type: 'REQUEST_TOKEN' });
                });
            }
            return;
        }

        const watchlist = await getWatchlist();
        if (!watchlist || watchlist.length === 0) {
            console.log('[SW] No items in watchlist');
            // Schedule next check
            scheduleNextCheck(NOTIFICATION_CHECK_INTERVAL);
            return;
        }

        console.log('[SW] Checking', watchlist.length, 'items in watchlist');

        const lastChecked = await getLastCheckedEpisodes();
        const newLastChecked = { ...lastChecked };
        const notifications = [];

        // Filter to only TV shows
        const tvShows = watchlist.filter(item => item.media_type === 'tv');

        for (const item of tvShows) {
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/tv/${item.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (!response.ok) {
                    console.log('[SW] Failed to fetch details for', item.title, response.status);
                    continue;
                }

                const details = await response.json();
                const lastEpisode = details.last_episode_to_air;
                const nextEpisode = details.next_episode_to_air;

                // Check if last episode was just released (within 24 hours)
                if (lastEpisode && lastEpisode.air_date) {
                    const episodeKey = `${item.id}_${lastEpisode.season_number}_${lastEpisode.episode_number}`;
                    const airDate = new Date(lastEpisode.air_date + 'T00:00:00');
                    const nowDate = new Date();
                    const daysSinceAir = (nowDate - airDate) / (1000 * 60 * 60 * 24);

                    // If episode aired within last 24 hours and we haven't notified
                    if (daysSinceAir >= 0 && daysSinceAir <= 1 && !lastChecked[episodeKey]) {
                        console.log('[SW] New episode found:', item.title, episodeKey);
                        notifications.push({
                            title: `🎬 ${item.title} - New Episode!`,
                            body: `S${lastEpisode.season_number}E${lastEpisode.episode_number}: ${lastEpisode.name || 'New Episode'} is now available!`,
                            icon: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '/logo.png',
                            tag: `episode-${episodeKey}`,
                            url: '/watchlist'
                        });
                        newLastChecked[episodeKey] = Date.now();
                    }
                }

                // Check if next episode is releasing today
                if (nextEpisode && nextEpisode.air_date) {
                    const episodeKey = `${item.id}_${nextEpisode.season_number}_${nextEpisode.episode_number}_upcoming`;
                    const airDate = new Date(nextEpisode.air_date + 'T00:00:00');
                    const nowDate = new Date();
                    const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
                    const episodeDate = new Date(airDate.getFullYear(), airDate.getMonth(), airDate.getDate());

                    // If episode airs today and we haven't notified
                    if (episodeDate.getTime() === today.getTime() && !lastChecked[episodeKey]) {
                        console.log('[SW] Episode releasing today:', item.title, episodeKey);
                        notifications.push({
                            title: `📅 ${item.title} - Episode Today!`,
                            body: `S${nextEpisode.season_number}E${nextEpisode.episode_number}: ${nextEpisode.name || 'New Episode'} releases today!`,
                            icon: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '/logo.png',
                            tag: `upcoming-${episodeKey}`,
                            url: '/watchlist'
                        });
                        newLastChecked[episodeKey] = Date.now();
                    }
                }

                // Rate limiting - wait between API calls
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
                console.error(`[SW] Failed to check ${item.title}:`, error);
            }
        }

        // Store updated last checked state
        await storeLastCheckedEpisodes(newLastChecked);

        // Show notifications
        console.log('[SW] Showing', notifications.length, 'notifications');
        for (const notification of notifications) {
            try {
                await self.registration.showNotification(notification.title, {
                    body: notification.body,
                    icon: notification.icon,
                    badge: '/logo.png',
                    vibrate: [200, 100, 200, 100, 200],
                    data: { url: notification.url },
                    tag: notification.tag,
                    requireInteraction: true,
                    renotify: true,
                    silent: false,
                    actions: [
                        { action: 'open', title: '▶️ Watch Now' },
                        { action: 'dismiss', title: 'Later' }
                    ]
                });
            } catch (notifError) {
                console.error('[SW] Failed to show notification:', notifError);
            }
        }

        console.log(`[SW] Episode check complete. ${notifications.length} new notifications.`);

        // Schedule next check
        scheduleNextCheck(NOTIFICATION_CHECK_INTERVAL);

    } catch (error) {
        console.error('[SW] Episode check failed:', error);
        // Schedule retry
        scheduleNextCheck(5 * 60 * 1000); // Retry in 5 minutes
    }
}

// Self-wake mechanism - keeps the service worker alive in background
self.addEventListener('fetch', (event) => {
    // This helps keep the service worker active
    if (event.request.url.includes('/sw-keepalive')) {
        event.respondWith(new Response('OK', { status: 200 }));
    }
});

console.log('[SW] Service worker loaded');

