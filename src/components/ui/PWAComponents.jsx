import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Bell, BellOff, Smartphone, Monitor, CheckCircle2 } from 'lucide-react';
import {
    isPWA,
    isPWAInstallAvailable,
    promptPWAInstall,
    requestNotificationPermission,
    getNotificationPermission,
    isNotificationSupported
} from '../../utils/notificationService';

/**
 * PWA Install Banner Component
 * Shows a banner prompting users to install the app
 */
export const PWAInstallBanner = ({ onDismiss }) => {
    const [showBanner, setShowBanner] = useState(false);
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        // Don't show if already installed as PWA
        if (isPWA()) return;

        // Check if user dismissed the banner before
        const dismissed = localStorage.getItem('pwa_install_dismissed');
        if (dismissed) {
            const dismissedDate = new Date(dismissed);
            const daysSinceDismiss = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
            // Show again after 7 days
            if (daysSinceDismiss < 7) return;
        }

        // Listen for install prompt availability
        const handleInstallAvailable = () => {
            setShowBanner(true);
        };

        window.addEventListener('pwa-install-available', handleInstallAvailable);

        // Check if already available
        if (isPWAInstallAvailable()) {
            setShowBanner(true);
        }

        return () => {
            window.removeEventListener('pwa-install-available', handleInstallAvailable);
        };
    }, []);

    const handleInstall = async () => {
        setInstalling(true);
        const installed = await promptPWAInstall();
        setInstalling(false);

        if (installed) {
            setShowBanner(false);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem('pwa_install_dismissed', new Date().toISOString());
        setShowBanner(false);
        if (onDismiss) onDismiss();
    };

    if (!showBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
            >
                <div
                    className="rounded-2xl p-4 shadow-2xl border border-violet-500/20 backdrop-blur-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(30, 20, 50, 0.95) 100%)' }}
                >
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-start gap-4">
                        <div
                            className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' }}
                        >
                            <Download className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-lg mb-1">Install Zylmia</h3>
                            <p className="text-neutral-300 text-sm mb-3">
                                Get the full app experience with notifications when your episodes release!
                            </p>

                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                    <Smartphone size={14} />
                                    <span>Android</span>
                                </div>
                                <span className="text-neutral-600">•</span>
                                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                    <Monitor size={14} />
                                    <span>Windows</span>
                                </div>
                            </div>

                            <button
                                onClick={handleInstall}
                                disabled={installing}
                                className="w-full py-2.5 px-4 rounded-xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' }}
                            >
                                {installing ? 'Installing...' : 'Install App'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

/**
 * Notification Settings Card Component
 * Allows users to enable/disable notifications
 */
export const NotificationSettings = ({ className = '', onDismiss = null }) => {
    const [permission, setPermission] = useState('default');
    const [requesting, setRequesting] = useState(false);
    const [supported, setSupported] = useState(true);
    const [testSending, setTestSending] = useState(false);
    const [testSent, setTestSent] = useState(false);

    useEffect(() => {
        setSupported(isNotificationSupported());
        setPermission(getNotificationPermission());
    }, []);

    const handleRequestPermission = async () => {
        setRequesting(true);
        const result = await requestNotificationPermission();
        setPermission(result);
        setRequesting(false);
    };

    const handleTestNotification = async () => {
        if (permission !== 'granted') return;

        setTestSending(true);
        try {
            // Send a test notification
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification('🎬 Test Notification', {
                    body: 'Zylmia notifications are working! You will be notified when your tracked episodes release.',
                    icon: '/logo.png',
                    badge: '/logo.png',
                    vibrate: [100, 50, 100],
                    tag: 'test-notification',
                    requireInteraction: false,
                    data: { url: '/watchlist' }
                });
                setTestSent(true);
                setTimeout(() => setTestSent(false), 3000);
            }
        } catch (error) {
            console.error('Failed to send test notification:', error);
        } finally {
            setTestSending(false);
        }
    };

    if (!supported) {
        return (
            <div className={`p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/50 ${className}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-neutral-700/50">
                        <BellOff className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium">Notifications Unavailable</h4>
                        <p className="text-neutral-400 text-sm">
                            Your browser doesn't support push notifications.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (permission === 'granted') {
        return (
            <div className={`relative p-4 rounded-xl bg-green-900/20 border border-green-500/30 ${className}`}>
                {/* X Button to dismiss */}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="absolute top-3 right-3 p-1.5 rounded-lg text-green-400/60 hover:text-green-300 hover:bg-green-500/20 transition-all"
                        title="Dismiss"
                    >
                        <X size={16} />
                    </button>
                )}

                <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-green-500/20 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1 pr-6">
                        <h4 className="text-white font-medium">Notifications Enabled ✓</h4>
                        <p className="text-green-300/80 text-sm mb-3">
                            You'll be notified when new episodes release.
                        </p>

                        {/* Test Notification Button */}
                        <button
                            onClick={handleTestNotification}
                            disabled={testSending}
                            className="py-2 px-4 rounded-lg font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                        >
                            {testSending ? 'Sending...' : testSent ? '✓ Test Sent!' : '🔔 Test Notification'}
                        </button>

                        {/* Important Instructions */}
                        <div className="mt-4 p-3 rounded-lg bg-amber-900/20 border border-amber-500/30">
                            <p className="text-amber-300 text-xs font-medium mb-1">⚠️ Important for Uninterrupted Notifications:</p>
                            <ul className="text-amber-200/80 text-xs space-y-1 list-disc list-inside">
                                <li><strong>Windows:</strong> Go to Settings → System → Notifications → Zylmia → Set to "Always Allow"</li>
                                <li><strong>Android:</strong> Long press app → App Info → Notifications → Enable "Allow notifications"</li>
                                <li><strong>Chrome:</strong> Click lock icon in URL → Site settings → Enable "Notifications forever"</li>
                                <li>Keep the app installed as PWA for background notifications</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    if (permission === 'denied') {
        return (
            <div className={`p-4 rounded-xl bg-red-900/20 border border-red-500/30 ${className}`}>
                <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-red-500/20 flex-shrink-0">
                        <BellOff className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium">Notifications Blocked</h4>
                        <p className="text-red-300/80 text-sm mb-2">
                            Notifications are blocked. Please enable them in your browser/system settings:
                        </p>
                        <div className="p-3 rounded-lg bg-red-900/30 border border-red-500/20">
                            <ul className="text-red-200/80 text-xs space-y-1 list-disc list-inside">
                                <li><strong>Chrome:</strong> Click lock icon in URL → Site settings → Notifications → Allow</li>
                                <li><strong>Edge:</strong> Click lock icon → Permissions for this site → Notifications → Allow</li>
                                <li><strong>Windows:</strong> Settings → System → Notifications → Enable for Zylmia</li>
                                <li><strong>Android:</strong> Settings → Apps → Zylmia/Browser → Notifications → Allow</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-xl bg-violet-900/20 border border-violet-500/30 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-violet-500/20 flex-shrink-0">
                    <Bell className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-medium">Enable Notifications</h4>
                    <p className="text-violet-300/80 text-sm mb-3">
                        Get notified when your tracked shows release new episodes. Never miss an episode again!
                    </p>

                    <button
                        onClick={handleRequestPermission}
                        disabled={requesting}
                        className="py-2.5 px-5 rounded-lg font-medium text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' }}
                    >
                        {requesting ? 'Requesting...' : '🔔 Enable Notifications'}
                    </button>

                    {/* Tips for best experience */}
                    <div className="mt-4 p-3 rounded-lg bg-violet-900/30 border border-violet-500/20">
                        <p className="text-violet-300 text-xs font-medium mb-1">💡 For the best experience:</p>
                        <ul className="text-violet-200/70 text-xs space-y-1 list-disc list-inside">
                            <li>Install Zylmia as an app (PWA) for background notifications</li>
                            <li>Select "Allow" or "Always Allow" when prompted</li>
                            <li>Keep notifications enabled in your system settings</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};


/**
 * Compact Notification Toggle Button
 * For use in headers/navbars
 */
export const NotificationToggle = ({ className = '' }) => {
    const [permission, setPermission] = useState('default');
    const [supported, setSupported] = useState(true);

    useEffect(() => {
        setSupported(isNotificationSupported());
        setPermission(getNotificationPermission());
    }, []);

    const handleClick = async () => {
        if (permission === 'granted') return;
        const result = await requestNotificationPermission();
        setPermission(result);
    };

    if (!supported || permission === 'denied') return null;

    return (
        <button
            onClick={handleClick}
            className={`p-2 rounded-lg transition-all ${className} ${permission === 'granted'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                }`}
            title={permission === 'granted' ? 'Notifications enabled' : 'Enable notifications'}
        >
            {permission === 'granted' ? (
                <Bell className="w-5 h-5" />
            ) : (
                <BellOff className="w-5 h-5" />
            )}
        </button>
    );
};

/**
 * PWA Status Indicator
 * Shows if app is installed as PWA
 */
export const PWAStatusIndicator = () => {
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        setIsInstalled(isPWA());

        window.addEventListener('pwa-installed', () => {
            setIsInstalled(true);
        });
    }, []);

    if (!isInstalled) return null;

    return (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
            <CheckCircle2 size={12} />
            <span>PWA</span>
        </div>
    );
};

/**
 * Notification Enabled Badge
 * Compact indicator showing notifications are enabled
 * Used when user dismisses the full notification settings card
 */
export const NotificationEnabledBadge = ({ onClick, className = '' }) => {
    const [permission, setPermission] = useState('default');
    const [supported, setSupported] = useState(true);

    useEffect(() => {
        setSupported(isNotificationSupported());
        setPermission(getNotificationPermission());
    }, []);

    // Don't show if not supported or not granted
    if (!supported || permission !== 'granted') return null;

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium transition-all hover:bg-green-500/30 hover:scale-105 ${className}`}
            title="Click to expand notification settings"
        >
            <Bell size={14} className="fill-green-400" />
            <span>Notifications On</span>
            <CheckCircle2 size={12} />
        </motion.button>
    );
};

export default {
    PWAInstallBanner,
    NotificationSettings,
    NotificationToggle,
    PWAStatusIndicator,
    NotificationEnabledBadge
};

