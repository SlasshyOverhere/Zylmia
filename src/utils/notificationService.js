/**
 * Zylmia Notification Service
 * Manages push notifications, service worker registration, and episode checking
 */

const WATCHLIST_KEY = 'zylmia_watchlist';
const NOTIFICATION_PERMISSION_KEY = 'zylmia_notification_permission';
const LAST_CHECK_KEY = 'zylmia_last_episode_check';

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
        }

        // Sync watchlist with service worker
        syncWatchlistWithSW();

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
        }

        // Also store in IndexedDB for background access
        if ('indexedDB' in window) {
            const db = await openDB();
            const tx = db.transaction('keyval', 'readwrite');
            const store = tx.objectStore('keyval');
            store.put(watchlist, 'watchlist');
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
        const request = indexedDB.open('zylmia-sw-db', 1);
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
    if (!('serviceWorker' in navigator) || !('PeriodicSyncManager' in window)) {
        console.log('Periodic sync not supported');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const status = await navigator.permissions.query({
            name: 'periodic-background-sync'
        });

        if (status.state === 'granted') {
            await registration.periodicSync.register('check-episodes', {
                minInterval: 30 * 60 * 1000 // 30 minutes
            });
            console.log('Periodic sync registered');
            return true;
        }
    } catch (error) {
        console.error('Periodic sync registration failed:', error);
    }
    return false;
};

/**
 * Handle service worker messages
 */
export const setupServiceWorkerListener = (onWatchlistRequest) => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'REQUEST_WATCHLIST') {
            // Service worker is requesting updated watchlist
            if (onWatchlistRequest) {
                onWatchlistRequest();
            } else {
                syncWatchlistWithSW();
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

export default {
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
    setupServiceWorkerListener,
    createEpisodeNotification,
    initInstallPrompt,
    promptPWAInstall,
    isPWAInstallAvailable
};
