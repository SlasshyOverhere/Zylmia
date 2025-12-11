import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, Trash2, Calendar, Star, Clock, Film, Tv, X, Search, Plus, RefreshCw, Play, Bell } from 'lucide-react';
import { cn } from '../../utils/cn';
import { NotificationSettings, NotificationEnabledBadge } from '../ui/PWAComponents';
import { syncWatchlistWithSW, getNotificationPermission } from '../../utils/notificationService';

// Watchlist storage key
const WATCHLIST_KEY = 'zylmia_watchlist';

// Get watchlist from localStorage
export const getWatchlist = () => {
    try {
        const stored = localStorage.getItem(WATCHLIST_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save watchlist to localStorage
const saveWatchlist = (watchlist) => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    // Sync with service worker for background notifications
    syncWatchlistWithSW();
};

// Check if item is pinned
export const isPinned = (id) => {
    const watchlist = getWatchlist();
    return watchlist.some(item => item.id === id);
};

// Toggle pin status
export const togglePin = (item) => {
    const watchlist = getWatchlist();
    const index = watchlist.findIndex(w => w.id === item.id);

    if (index > -1) {
        watchlist.splice(index, 1);
        saveWatchlist(watchlist);
        return false;
    } else {
        watchlist.push({
            id: item.id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            media_type: item.first_air_date ? 'tv' : 'movie',
            added_at: new Date().toISOString()
        });
        saveWatchlist(watchlist);
        return true;
    }
};

// Add item to watchlist
export const addToWatchlist = (item) => {
    const watchlist = getWatchlist();
    if (!watchlist.some(w => w.id === item.id)) {
        watchlist.push({
            id: item.id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            media_type: item.first_air_date ? 'tv' : (item.media_type || 'movie'),
            added_at: new Date().toISOString()
        });
        saveWatchlist(watchlist);
        return true;
    }
    return false;
};

// Remove item from watchlist
const removeFromWatchlist = (id) => {
    const watchlist = getWatchlist().filter(item => item.id !== id);
    saveWatchlist(watchlist);
};

// Calculate time remaining
const getTimeRemaining = (targetDate) => {
    const now = new Date();
    let target = new Date(targetDate);

    // If the date string doesn't include time (e.g., "2025-12-11"), 
    // set target to end of that day (23:59:59) in local timezone
    // This prevents same-day episodes from showing as "expired" too early
    if (typeof targetDate === 'string' && !targetDate.includes('T')) {
        const [year, month, day] = targetDate.split('-').map(Number);
        target = new Date(year, month - 1, day, 23, 59, 59);
    }

    const diff = target - now;

    if (diff <= 0) {
        return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { expired: false, days, hours, minutes, seconds };
};

// Series Tracking Card - Exact clone of the design
const SeriesTrackingCard = ({ item, seriesDetails, onRemove, onDetails, onRefresh, onWatch, isRefreshing }) => {
    const details = seriesDetails || {};
    const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });

    const year = details.first_air_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A';
    const seasonsCount = details.number_of_seasons || 0;
    const episodesCount = details.number_of_episodes || 0;
    const status = details.status || '';
    const rating = details.vote_average || item.vote_average || 0;

    const lastEpisode = details.last_episode_to_air;
    const nextEpisode = details.next_episode_to_air;

    const isReturning = status === 'Returning Series';

    // Countdown effect
    useEffect(() => {
        if (!nextEpisode?.air_date) return;

        const updateTime = () => {
            setTime(getTimeRemaining(nextEpisode.air_date));
        };

        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, [nextEpisode]);

    // Format date
    const formatAiredDate = (dateStr) => {
        if (!dateStr) return 'TBA';
        const date = new Date(dateStr);
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        return `Aired ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const formatNextDate = (dateStr) => {
        if (!dateStr) return 'TBA';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatEpisodeCode = (ep) => {
        if (!ep) return '';
        return `S${ep.season_number}E${ep.episode_number}`;
    };

    const hasUpcomingEpisode = nextEpisode && nextEpisode.air_date && !time.expired;

    // Check if more episodes are coming (for returning series where TMDB hasn't updated next_episode_to_air yet)
    const currentSeason = details.seasons?.find(s => s.season_number === lastEpisode?.season_number);
    const expectedEpisodeCount = currentSeason?.episode_count || 0;
    const lastEpisodeNumber = lastEpisode?.episode_number || 0;
    const hasMoreEpisodesInSeason = isReturning && lastEpisodeNumber < expectedEpisodeCount;
    const nextExpectedEpisode = hasMoreEpisodesInSeason ? lastEpisodeNumber + 1 : null;

    return (
        <div className="relative rounded-lg overflow-hidden h-full flex flex-col" style={{ backgroundColor: '#1a1625', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            {/* Top Section */}
            <div className="p-5 flex gap-3">
                {/* Poster */}
                <div className="relative flex-shrink-0 w-[120px]">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                        <img
                            src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Rating Badge */}
                        <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f59e0b' }}>
                            <Star size={9} fill="black" stroke="black" />
                            <span className="text-black text-[10px] font-bold">{rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    {/* Title Row with Action Buttons */}
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3
                                className="text-white font-bold text-base leading-tight cursor-pointer hover:text-violet-400 transition-colors line-clamp-1"
                                onClick={() => onDetails(item, 'tv')}
                            >
                                {item.title}
                            </h3>
                            <p className="text-neutral-400 text-xs mt-0.5">
                                {year} • {seasonsCount}S
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => onRefresh(item.id)}
                                disabled={isRefreshing}
                                className={cn(
                                    "p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-all",
                                    isRefreshing && "animate-spin"
                                )}
                                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                            >
                                <RefreshCw size={14} />
                            </button>
                            <button
                                onClick={() => onRemove(item.id)}
                                className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mt-2">
                        {isReturning && (
                            <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                                style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}
                            >
                                • Returning
                            </span>
                        )}
                        <span className="text-neutral-500 text-[11px]">
                            {episodesCount} Eps
                        </span>
                    </div>

                    {/* Last Episode */}
                    {lastEpisode && (
                        <div className="mt-3">
                            <p className="text-neutral-500 text-[10px] uppercase tracking-wider">Last Episode</p>
                            <p className="text-white text-xs mt-0.5 line-clamp-1">
                                <span className="text-violet-400">{formatEpisodeCode(lastEpisode)}</span>: {lastEpisode.name || 'TBA'}
                            </p>
                            <p className="text-neutral-500 text-[11px] mt-0.5">
                                {formatAiredDate(lastEpisode.air_date)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section - Countdown */}
            <div className="px-4 pb-4 pt-2 flex-1 flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                {hasUpcomingEpisode ? (
                    <>
                        {/* Next Episode In */}
                        <p className="text-neutral-500 text-[10px] uppercase tracking-wider text-center mb-3">
                            Next Episode In
                        </p>

                        {/* Countdown Timer */}
                        <div className="flex items-center justify-center gap-1">
                            {/* Days */}
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-10 h-10 flex items-center justify-center rounded-lg"
                                    style={{ backgroundColor: '#2d2640', border: '1px solid rgba(139, 92, 246, 0.2)' }}
                                >
                                    <span className="text-white font-bold text-base tabular-nums">
                                        {String(time.days).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="text-neutral-500 text-[9px] uppercase mt-0.5 tracking-wider">D</span>
                            </div>

                            <span className="text-violet-400/50 text-base font-light mb-3">:</span>

                            {/* Hours */}
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-10 h-10 flex items-center justify-center rounded-lg"
                                    style={{ backgroundColor: '#2d2640', border: '1px solid rgba(139, 92, 246, 0.2)' }}
                                >
                                    <span className="text-white font-bold text-base tabular-nums">
                                        {String(time.hours).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="text-neutral-500 text-[9px] uppercase mt-0.5 tracking-wider">H</span>
                            </div>

                            <span className="text-violet-400/50 text-base font-light mb-3">:</span>

                            {/* Minutes */}
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-10 h-10 flex items-center justify-center rounded-lg"
                                    style={{ backgroundColor: '#2d2640', border: '1px solid rgba(139, 92, 246, 0.2)' }}
                                >
                                    <span className="text-white font-bold text-base tabular-nums">
                                        {String(time.minutes).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="text-neutral-500 text-[9px] uppercase mt-0.5 tracking-wider">M</span>
                            </div>

                            <span className="text-violet-400/50 text-base font-light mb-3">:</span>

                            {/* Seconds */}
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-10 h-10 flex items-center justify-center rounded-lg"
                                    style={{ backgroundColor: '#2d2640', border: '1px solid rgba(139, 92, 246, 0.2)' }}
                                >
                                    <span className="text-white font-bold text-base tabular-nums">
                                        {String(time.seconds).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="text-neutral-500 text-[9px] uppercase mt-0.5 tracking-wider">S</span>
                            </div>
                        </div>

                        {/* Next Episode Info */}
                        <div className="text-center mt-3">
                            <p className="text-violet-400 text-xs font-medium line-clamp-1">
                                {formatEpisodeCode(nextEpisode)}: {nextEpisode.name || 'TBA'}
                            </p>
                            <p className="text-neutral-500 text-[11px] mt-0.5">
                                {formatNextDate(nextEpisode.air_date)}
                            </p>
                        </div>
                    </>
                ) : hasMoreEpisodesInSeason ? (
                    /* More episodes coming but TMDB hasn't updated next_episode_to_air yet */
                    <div className="text-center py-3">
                        <p className="text-orange-400 text-[10px] uppercase tracking-wider mb-2">
                            Coming Soon
                        </p>

                        {/* Clock/waiting icon */}
                        <div className="flex items-center justify-center mb-3">
                            <div
                                className="w-12 h-12 flex items-center justify-center rounded-xl"
                                style={{ backgroundColor: 'rgba(251, 146, 60, 0.15)', border: '1px solid rgba(251, 146, 60, 0.3)' }}
                            >
                                <Clock className="w-6 h-6 text-orange-400" />
                            </div>
                        </div>

                        {/* Expected Episode Info */}
                        <div>
                            <p className="text-orange-400 text-xs font-medium">
                                S{lastEpisode?.season_number}E{nextExpectedEpisode}: TBA
                            </p>
                            <p className="text-neutral-500 text-[11px] mt-0.5">
                                Date TBA
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-3">
                        {/* Latest Episode Released */}
                        <p className="text-green-400 text-[10px] uppercase tracking-wider mb-2">
                            Latest Released
                        </p>

                        {/* Green checkmark badge area - matching countdown height */}
                        <div className="flex items-center justify-center mb-3">
                            <div
                                className="w-12 h-12 flex items-center justify-center rounded-xl"
                                style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
                            >
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Last Episode Info */}
                        {lastEpisode && (
                            <div>
                                <p className="text-green-400 text-xs font-medium line-clamp-1">
                                    {formatEpisodeCode(lastEpisode)}: {lastEpisode.name || 'TBA'}
                                </p>
                                <p className="text-neutral-500 text-[11px] mt-0.5">
                                    Released {new Date(lastEpisode.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Search Result Card
const SearchResultCard = ({ item, onAdd }) => {
    const isTV = item.media_type === 'tv';
    const alreadyAdded = isPinned(item.id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            onClick={() => !alreadyAdded && onAdd(item)}
        >
            <img
                src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : 'https://via.placeholder.com/92x138?text=N/A'}
                alt={item.title || item.name}
                className="w-12 h-18 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate">{item.title || item.name}</h4>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                    {isTV ? <Tv size={10} /> : <Film size={10} />}
                    <span>{(item.release_date || item.first_air_date)?.split('-')[0] || 'TBA'}</span>
                    {item.vote_average > 0 && (
                        <span className="text-amber-400 flex items-center gap-0.5">
                            <Star size={10} fill="currentColor" />
                            {item.vote_average.toFixed(1)}
                        </span>
                    )}
                </div>
            </div>
            {alreadyAdded ? (
                <span className="text-xs text-green-400 px-2 py-1 bg-green-500/20 rounded-lg">Added</span>
            ) : (
                <button className="p-2 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white transition-colors">
                    <Plus size={14} />
                </button>
            )}
        </motion.div>
    );
};

// Main WatchlistPage Component
const WatchlistPage = ({ accessToken, onShowDetails }) => {
    const [watchlist, setWatchlist] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [detailsData, setDetailsData] = useState({});
    const [refreshingIds, setRefreshingIds] = useState(new Set());
    const searchInputRef = useRef(null);

    // Notification settings card visibility
    const [showNotificationCard, setShowNotificationCard] = useState(() => {
        const dismissed = localStorage.getItem('zylmia_notification_card_dismissed');
        const permission = getNotificationPermission();
        // Show card if not dismissed OR if permission is not granted yet
        return !dismissed || permission !== 'granted';
    });

    const handleDismissNotificationCard = () => {
        localStorage.setItem('zylmia_notification_card_dismissed', 'true');
        setShowNotificationCard(false);
    };

    const handleShowNotificationCard = () => {
        localStorage.removeItem('zylmia_notification_card_dismissed');
        setShowNotificationCard(true);
    };

    useEffect(() => {
        setWatchlist(getWatchlist());
    }, []);

    // Fetch detailed data for all watchlist items
    const fetchDetailsForItem = useCallback(async (item) => {
        if (!accessToken) return null;

        try {
            const endpoint = item.media_type === 'tv'
                ? `https://api.themoviedb.org/3/tv/${item.id}`
                : `https://api.themoviedb.org/3/movie/${item.id}`;

            const response = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch details for ${item.id}:`, error);
            return null;
        }
    }, [accessToken]);

    // Fetch details for all items on mount
    useEffect(() => {
        if (!accessToken || watchlist.length === 0) return;

        const fetchAllDetails = async () => {
            const newDetailsData = { ...detailsData };

            for (const item of watchlist) {
                if (!newDetailsData[item.id]) {
                    const details = await fetchDetailsForItem(item);
                    if (details) {
                        newDetailsData[item.id] = details;
                    }
                }
            }

            setDetailsData(newDetailsData);
        };

        fetchAllDetails();
    }, [watchlist, accessToken, fetchDetailsForItem]);

    const handleRefresh = useCallback(async (id) => {
        const item = watchlist.find(w => w.id === id);
        if (!item) return;

        setRefreshingIds(prev => new Set([...prev, id]));

        const details = await fetchDetailsForItem(item);
        if (details) {
            setDetailsData(prev => ({ ...prev, [id]: details }));
        }

        setRefreshingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    }, [watchlist, fetchDetailsForItem]);

    const handleRemove = useCallback((id) => {
        removeFromWatchlist(id);
        setWatchlist(getWatchlist());
        setDetailsData(prev => {
            const newData = { ...prev };
            delete newData[id];
            return newData;
        });
    }, []);

    const handleWatch = useCallback((item) => {
        const color = '8B5CF6';
        const url = `https://player.videasy.net/tv/${item.id}/1/1?color=${color}&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true`;
        window.open(url, '_blank');
    }, []);

    const handleSearch = useCallback(async (query) => {
        if (!query.trim() || !accessToken) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&page=1`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const data = await response.json();
            setSearchResults((data.results || []).slice(0, 10).map(r => ({ ...r, media_type: 'tv' })));
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [accessToken]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    const handleAddFromSearch = useCallback((item) => {
        addToWatchlist({ ...item, media_type: 'tv' });
        setWatchlist(getWatchlist());
        setSearchQuery('');
        setSearchResults([]);
        setShowSearch(false);
    }, []);

    // Filter only TV shows
    const tvShows = watchlist.filter(item => item.media_type === 'tv');

    return (
        <div
            className="min-h-screen p-6"
            style={{ backgroundColor: '#0f0a1a' }}
        >
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-neutral-400 text-sm">
                        {tvShows.length} series tracked
                    </p>

                    {/* Show compact badge when card is dismissed */}
                    {!showNotificationCard && (
                        <NotificationEnabledBadge onClick={handleShowNotificationCard} />
                    )}
                </div>

                {/* Notification Settings - only show when not dismissed */}
                <AnimatePresence>
                    {showNotificationCard && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <NotificationSettings
                                className="mb-4"
                                onDismiss={handleDismissNotificationCard}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Search Modal */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowSearch(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden"
                            style={{ backgroundColor: '#1a1625' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 p-4 border-b border-white/10">
                                <Search size={20} className="text-neutral-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search TV series to track..."
                                    className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none"
                                />
                                <button onClick={() => setShowSearch(false)} className="p-1 text-neutral-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="max-h-80 overflow-y-auto p-2">
                                {isSearching ? (
                                    <div className="flex justify-center py-8">
                                        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((item) => (
                                        <SearchResultCard key={item.id} item={item} onAdd={handleAddFromSearch} />
                                    ))
                                ) : searchQuery ? (
                                    <p className="text-center text-neutral-500 py-8">No results found</p>
                                ) : (
                                    <p className="text-center text-neutral-500 py-8">Start typing to search...</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cards Grid */}
            <div className="max-w-7xl mx-auto">
                {tvShows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <Tv size={32} className="text-neutral-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No Series Tracked</h3>
                        <p className="text-neutral-400 text-sm text-center max-w-md mb-4">
                            Track your favorite TV series to get countdown timers for upcoming episodes.
                        </p>
                        <button
                            onClick={() => { setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium transition-colors"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' }}
                        >
                            <Plus size={18} />
                            Add Series
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {tvShows.map((item) => (
                                <SeriesTrackingCard
                                    key={item.id}
                                    item={item}
                                    seriesDetails={detailsData[item.id]}
                                    onRemove={handleRemove}
                                    onDetails={onShowDetails}
                                    onRefresh={handleRefresh}
                                    onWatch={handleWatch}
                                    isRefreshing={refreshingIds.has(item.id)}
                                />
                            ))}
                        </div>

                        {/* Add More Button */}
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => { setShowSearch(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' }}
                            >
                                <Plus size={18} />
                                Track Another Series
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WatchlistPage;
