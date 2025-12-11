/**
 * Zylmia Notification Service
 * Manages push notifications, service worker registration, and episode checking
 */

const WATCHLIST_KEY = 'zylmia_watchlist';
const NOTIFICATION_PERMISSION_KEY = 'zylmia_notification_permission';
const LAST_CHECK_KEY = 'zylmia_last_episode_check';

// Keep-alive interval for background operation
let keepAliveInterval = null;

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = () => {
    return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Check if the app is running as a PWA
 */
export const isPWA = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
    if (!isNotificationSupported()) {
        console.log('Notifications not supported');
        return 'unsupported';
    }

    try {
        const permission = await Notification.requestPermission();
        localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);

        if (permission === 'granted') {
            // Initialize service worker communication
            await initializeServiceWorker();
            // Start keepalive for background checks
            startKeepAlive();
        }

        return permission;
    } catch (error) {
        console.error('Failed to request notification permission:', error);
        return 'denied';
    }
};

/**
 * Get current notification permission
 */
export const getNotificationPermission = () => {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission;
};

/**
 * Initialize service worker for notifications
 */
export const initializeServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return null;

    try {
        const registration = await navigator.serviceWorker.ready;

        // Send TMDB token to service worker
        const token = process.env.REACT_APP_TMDB_ACCESS_TOKEN;
        if (token && registration.active) {
            registration.active.postMessage({
                type: 'STORE_TMDB_TOKEN',
                token: token
            });
            console.log('Token sent to service worker');
        }

        // Sync watchlist with service worker
        syncWatchlistWithSW();

        // Start background checks in service worker
        if (registration.active) {
            registration.active.postMessage({
                type: 'START_BACKGROUND_CHECKS'
            });
        }

        return registration;
    } catch (error) {
        console.error('Failed to initialize service worker:', error);
        return null;
    }
};

/**
 * Sync watchlist with service worker IndexedDB
 */
export const syncWatchlistWithSW = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
        const watchlist = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
        const registration = await navigator.serviceWorker.ready;

        // Send watchlist to service worker
        if (registration.active) {
            registration.active.postMessage({
                type: 'SYNC_WATCHLIST',
                watchlist: watchlist
            });
            console.log('Watchlist synced with service worker:', watchlist.length, 'items');
        }

        // Also store in IndexedDB for background access
        if ('indexedDB' in window) {
            try {
                const db = await openDB();
                const tx = db.transaction('keyval', 'readwrite');
                const store = tx.objectStore('keyval');
                store.put(watchlist, 'watchlist');
            } catch (e) {
                console.log('IndexedDB sync failed, SW will handle it');
            }
        }
    } catch (error) {
        console.error('Failed to sync watchlist with SW:', error);
    }
};

/**
 * Open IndexedDB for service worker storage
 */
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('zylmia-sw-db', 2);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('keyval')) {
                db.createObjectStore('keyval');
            }
        };
    });
};

/**
 * Show a local notification (for immediate alerts)
 */
export const showNotification = async (title, options = {}) => {
    if (!isNotificationSupported()) return;
    if (Notification.permission !== 'granted') return;

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
            icon: '/logo.png',
            badge: '/logo.png',
            vibrate: [100, 50, 100],
            ...options
        });
    } catch (error) {
        console.error('Failed to show notification:', error);
    }
};

/**
 * Check for new episodes and trigger notifications
 * This runs in the main thread and can be called when the app is open
 */
export const checkForNewEpisodes = async (accessToken, watchlist) => {
    if (!accessToken || !watchlist || watchlist.length === 0) return;

    const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
    const now = Date.now();

    // Only check every 30 minutes
    if (lastCheck && now - parseInt(lastCheck) < 30 * 60 * 1000) {
        return;
    }

    localStorage.setItem(LAST_CHECK_KEY, now.toString());

    // Trigger service worker check
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
            registration.active.postMessage({ type: 'CHECK_EPISODES' });
        }
    }
};

/**
 * Register for background sync (for checking episodes when offline then coming online)
 */
export const registerBackgroundSync = async () => {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return;

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('check-episodes');
        console.log('Background sync registered');
    } catch (error) {
        console.error('Background sync registration failed:', error);
    }
};

/**
 * Request periodic background sync for regular episode checking
 */
export const registerPeriodicSync = async () => {
    if (!('serviceWorker' in navigator)) {
        console.log('Service worker not supported');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        // Try periodic sync first (Chrome 80+)
        if ('periodicSync' in registration) {
            try {
                const status = await navigator.permissions.query({
                    name: 'periodic-background-sync'
                });

                if (status.state === 'granted') {
                    await registration.periodicSync.register('check-episodes', {
                        minInterval: 60 * 60 * 1000 // 1 hour (minimum allowed)
                    });
                    console.log('Periodic background sync registered');
                    return true;
                } else {
                    console.log('Periodic sync permission not granted:', status.state);
                }
            } catch (e) {
                console.log('Periodic sync not available:', e.message);
            }
        }

        // Fallback: Start keepalive for background operation
        startKeepAlive();
        return false;
    } catch (error) {
        console.error('Periodic sync registration failed:', error);
        return false;
    }
};

/**
 * Start keepalive ping to keep service worker active
 * This helps ensure background checks continue running
 */
export const startKeepAlive = () => {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }

    // Ping the service worker every 5 minutes to keep it alive
    keepAliveInterval = setInterval(async () => {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                if (registration.active) {
                    // Send a keepalive ping
                    registration.active.postMessage({ type: 'KEEPALIVE' });

                    // Also sync watchlist periodically
                    syncWatchlistWithSW();
                }
            }
        } catch (error) {
            console.log('Keepalive ping failed:', error);
        }
    }, 5 * 60 * 1000); // Every 5 minutes

    console.log('Keepalive started for background operation');
};

/**
 * Stop keepalive
 */
export const stopKeepAlive = () => {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
    }
};

/**
 * Handle service worker messages
 */
export const setupServiceWorkerListener = (onWatchlistRequest) => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from SW:', event.data?.type);

        if (event.data && event.data.type === 'REQUEST_WATCHLIST') {
            // Service worker is requesting updated watchlist
            if (onWatchlistRequest) {
                onWatchlistRequest();
            } else {
                syncWatchlistWithSW();
            }
        }

        if (event.data && event.data.type === 'REQUEST_TOKEN') {
            // Service worker is requesting the TMDB token
            const token = process.env.REACT_APP_TMDB_ACCESS_TOKEN;
            if (token && event.source) {
                navigator.serviceWorker.ready.then(registration => {
                    if (registration.active) {
                        registration.active.postMessage({
                            type: 'STORE_TMDB_TOKEN',
                            token: token
                        });
                    }
                });
            }
        }
    });
};

/**
 * Create a notification for episode release
 */
export const createEpisodeNotification = (series, episode, isUpcoming = false) => {
    const episodeCode = `S${episode.season_number}E${episode.episode_number}`;
    const title = isUpcoming
        ? `📅 ${series.title || series.name} - Episode Today!`
        : `🎬 ${series.title || series.name} - New Episode!`;
    const body = isUpcoming
        ? `${episodeCode}: ${episode.name || 'New Episode'} releases today!`
        : `${episodeCode}: ${episode.name || 'New Episode'} is now available!`;

    return {
        title,
        body,
        icon: series.poster_path
            ? `https://image.tmdb.org/t/p/w200${series.poster_path}`
            : '/logo.png',
        tag: `episode-${series.id}-${episode.season_number}-${episode.episode_number}`,
        data: {
            url: '/watchlist',
            seriesId: series.id,
            episodeCode
        }
    };
};

/**
 * Check if PWA is installed (for prompting installation)
 */
let deferredPrompt = null;

export const initInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('PWA install prompt available');
        // Dispatch custom event for UI to show install button
        window.dispatchEvent(new CustomEvent('pwa-install-available'));
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        console.log('PWA was installed');
        window.dispatchEvent(new CustomEvent('pwa-installed'));

        // Initialize background features after install
        initializeServiceWorker();
        startKeepAlive();
    });
};

/**
 * Trigger PWA installation prompt
 */
export const promptPWAInstall = async () => {
    if (!deferredPrompt) {
        console.log('No install prompt available');
        return false;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    deferredPrompt = null;

    return outcome === 'accepted';
};

/**
 * Check if PWA install is available
 */
export const isPWAInstallAvailable = () => {
    return deferredPrompt !== null;
};

// Export all functions
const notificationService = {
    isNotificationSupported,
    isPWA,
    requestNotificationPermission,
    getNotificationPermission,
    initializeServiceWorker,
    syncWatchlistWithSW,
    showNotification,
    checkForNewEpisodes,
    registerBackgroundSync,
    registerPeriodicSync,
    startKeepAlive,
    stopKeepAlive,
    setupServiceWorkerListener,
    createEpisodeNotification,
    initInstallPrompt,
    promptPWAInstall,
    isPWAInstallAvailable
};

export default notificationService;

