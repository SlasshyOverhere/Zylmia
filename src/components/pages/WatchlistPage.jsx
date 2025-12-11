import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pin, PinOff, Star, Calendar, Clock, Tv,
    ChevronRight, ExternalLink, Play, AlertCircle,
    RefreshCw, Trash2
} from 'lucide-react';

/**
 * Countdown Timer Hook
 */
const useCountdown = (targetDate) => {
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0, expired: false });

    useEffect(() => {
        if (!targetDate) {
            setCountdown({ days: 0, hours: 0, mins: 0, secs: 0, expired: true });
            return;
        }

        const timer = setInterval(() => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target - now;

            if (diff <= 0) {
                setCountdown({ days: 0, hours: 0, mins: 0, secs: 0, expired: true });
                clearInterval(timer);
                return;
            }

            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                mins: Math.floor((diff / (1000 * 60)) % 60),
                secs: Math.floor((diff / 1000) % 60),
                expired: false
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return countdown;
};

/**
 * Countdown Display Component
 */
const CountdownTimer = ({ targetDate, episodeName, episodeNumber, seasonNumber }) => {
    const countdown = useCountdown(targetDate);

    if (countdown.expired) {
        return (
            <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-xl p-4">
                <div className="text-center">
                    <span className="text-emerald-400 font-semibold text-sm">Episode Available Now!</span>
                    {episodeName && (
                        <p className="text-neutral-400 text-xs mt-1">
                            S{seasonNumber}E{episodeNumber}: {episodeName}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    const timeUnits = [
        { value: countdown.days, label: 'DAYS' },
        { value: countdown.hours, label: 'HRS' },
        { value: countdown.mins, label: 'MINS' },
        { value: countdown.secs, label: 'SECS' },
    ];

    return (
        <div className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-xl p-4">
            <p className="text-center text-neutral-400 text-xs mb-3 uppercase tracking-wider">Next Episode In</p>

            <div className="flex justify-center gap-2 md:gap-3">
                {timeUnits.map((unit, idx) => (
                    <div key={unit.label} className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-violet-600/30 to-purple-600/30 border border-violet-500/30 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-xl md:text-2xl font-bold text-white tabular-nums">
                                    {String(unit.value).padStart(2, '0')}
                                </span>
                            </div>
                            {idx < timeUnits.length - 1 && (
                                <span className="absolute -right-1.5 md:-right-2 top-1/2 -translate-y-1/2 text-violet-400/50 text-lg">:</span>
                            )}
                        </div>
                        <span className="text-[8px] md:text-[10px] text-neutral-500 mt-1.5 font-medium">{unit.label}</span>
                    </div>
                ))}
            </div>

            {episodeName && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-center text-xs text-neutral-300">
                        <span className="text-violet-400 font-medium">S{seasonNumber}E{episodeNumber}:</span> {episodeName}
                    </p>
                    <p className="text-center text-[10px] text-neutral-500 mt-1">
                        {new Date(targetDate).toLocaleDateString('en-US', {
                            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                        })}
                    </p>
                </div>
            )}
        </div>
    );
};

/**
 * Series Tracking Card Component
 */
const SeriesTrackingCard = ({ series, details, onUnpin, onWatch, onRefresh }) => {
    const [isHovered, setIsHovered] = useState(false);

    const nextEpisode = details?.next_episode_to_air;
    const lastEpisode = details?.last_episode_to_air;
    const status = details?.status;
    const totalEpisodes = details?.number_of_episodes || 0;
    const totalSeasons = details?.number_of_seasons || 0;

    // Status badge colors
    const statusColors = {
        'Returning Series': { bg: 'from-emerald-600/20 to-teal-600/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
        'Ended': { bg: 'from-neutral-600/20 to-neutral-600/20', border: 'border-neutral-500/30', text: 'text-neutral-400' },
        'Canceled': { bg: 'from-red-600/20 to-rose-600/20', border: 'border-red-500/30', text: 'text-red-400' },
        'In Production': { bg: 'from-blue-600/20 to-cyan-600/20', border: 'border-blue-500/30', text: 'text-blue-400' },
    };

    const statusStyle = statusColors[status] || statusColors['Returning Series'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative bg-neutral-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-violet-500/30 transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Gradient overlay on hover */}
            <div
                className={`absolute inset-0 bg-gradient-to-r from-violet-600/5 to-purple-600/5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />

            <div className="relative p-4 md:p-5">
                {/* Header Row */}
                <div className="flex gap-4">
                    {/* Poster */}
                    <div className="relative w-20 md:w-28 flex-shrink-0">
                        <img
                            src={series.poster_path ? `https://image.tmdb.org/t/p/w185${series.poster_path}` : 'https://via.placeholder.com/185x278?text=No+Image'}
                            alt={series.name}
                            className="w-full aspect-[2/3] rounded-lg object-cover shadow-lg"
                        />
                        {details?.vote_average && (
                            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-bold text-amber-400 flex items-center gap-0.5 border border-white/10">
                                <Star size={8} fill="currentColor" />
                                {details.vote_average.toFixed(1)}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-white line-clamp-1">{series.name}</h3>
                                <p className="text-neutral-400 text-xs md:text-sm line-clamp-1 mt-0.5">
                                    {series.first_air_date?.split('-')[0]} • {totalSeasons} Season{totalSeasons !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onRefresh(series.id)}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
                                    title="Refresh"
                                >
                                    <RefreshCw size={14} />
                                </button>
                                <button
                                    onClick={() => onUnpin(series.id)}
                                    className="p-2 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-600/20 transition-all"
                                    title="Unpin"
                                >
                                    <PinOff size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] md:text-xs font-medium bg-gradient-to-r ${statusStyle.bg} ${statusStyle.border} border ${statusStyle.text}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                {status || 'Unknown'}
                            </div>
                            <span className="text-neutral-500 text-[10px] md:text-xs">
                                {totalEpisodes} Episodes Total
                            </span>
                        </div>

                        {/* Last Episode Info */}
                        {lastEpisode && (
                            <div className="mt-3 p-2 rounded-lg bg-white/5 border border-white/5">
                                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Last Episode</p>
                                <p className="text-xs text-neutral-300">
                                    <span className="text-violet-400">S{lastEpisode.season_number}E{lastEpisode.episode_number}:</span> {lastEpisode.name}
                                </p>
                                <p className="text-[10px] text-neutral-500 mt-0.5">
                                    Aired {new Date(lastEpisode.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Countdown Timer */}
                {nextEpisode && (
                    <div className="mt-4">
                        <CountdownTimer
                            targetDate={nextEpisode.air_date}
                            episodeName={nextEpisode.name}
                            episodeNumber={nextEpisode.episode_number}
                            seasonNumber={nextEpisode.season_number}
                        />
                    </div>
                )}

                {/* No Next Episode */}
                {!nextEpisode && status !== 'Ended' && status !== 'Canceled' && (
                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        <AlertCircle size={16} className="mx-auto text-amber-400 mb-2" />
                        <p className="text-neutral-400 text-xs">No upcoming episodes announced yet</p>
                    </div>
                )}

                {/* Ended Series Message */}
                {(status === 'Ended' || status === 'Canceled') && (
                    <div className="mt-4 p-4 rounded-xl bg-neutral-800/50 border border-white/10 text-center">
                        <p className="text-neutral-400 text-xs">This series has {status === 'Canceled' ? 'been canceled' : 'ended'}</p>
                    </div>
                )}

                {/* Watch Button */}
                <button
                    onClick={() => onWatch(series)}
                    className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                >
                    <Play size={16} fill="currentColor" />
                    Watch Now
                </button>
            </div>
        </motion.div>
    );
};

/**
 * Watchlist Page Component
 */
const WatchlistPage = ({ accessToken, onShowDetails }) => {
    const [pinnedSeries, setPinnedSeries] = useState([]);
    const [seriesDetails, setSeriesDetails] = useState({});
    const [loading, setLoading] = useState(true);

    // Load pinned series from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('zylmia_pinned_series');
        if (saved) {
            try {
                setPinnedSeries(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse pinned series:', e);
            }
        }
        setLoading(false);
    }, []);

    // Save to localStorage when changed
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('zylmia_pinned_series', JSON.stringify(pinnedSeries));
        }
    }, [pinnedSeries, loading]);

    // Fetch details for all pinned series
    const fetchSeriesDetails = useCallback(async (seriesId) => {
        if (!accessToken) return;

        try {
            const response = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await response.json();
            setSeriesDetails(prev => ({ ...prev, [seriesId]: data }));
        } catch (error) {
            console.error(`Failed to fetch details for series ${seriesId}:`, error);
        }
    }, [accessToken]);

    // Fetch all series details on mount and when pinned series changes
    useEffect(() => {
        pinnedSeries.forEach(series => {
            if (!seriesDetails[series.id]) {
                fetchSeriesDetails(series.id);
            }
        });
    }, [pinnedSeries, seriesDetails, fetchSeriesDetails]);

    // Unpin a series
    const handleUnpin = (seriesId) => {
        setPinnedSeries(prev => prev.filter(s => s.id !== seriesId));
        setSeriesDetails(prev => {
            const newDetails = { ...prev };
            delete newDetails[seriesId];
            return newDetails;
        });
    };

    // Refresh series details
    const handleRefresh = (seriesId) => {
        fetchSeriesDetails(seriesId);
    };

    // Watch series
    const handleWatch = (series) => {
        const color = '8B5CF6';
        window.open(`https://player.videasy.net/tv/${series.id}/1/1?color=${color}&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true`, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 md:p-6"
        >
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-600 to-rose-600">
                        <Pin className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-white">My Watchlist</h1>
                        <p className="text-neutral-400 text-xs md:text-sm">Track your favorite series with live countdowns</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs md:text-sm text-neutral-500">
                        {pinnedSeries.length} series tracked
                    </span>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-neutral-400">Loading watchlist...</span>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && pinnedSeries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <Pin size={32} className="text-neutral-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Pinned Series</h3>
                    <p className="text-neutral-400 text-sm text-center max-w-md mb-6">
                        Pin your favorite TV series from any category page to track their upcoming episodes with live countdowns.
                    </p>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 text-sm">
                        <Pin size={14} />
                        <span>Click the pin icon on any TV show card to start tracking</span>
                    </div>
                </div>
            )}

            {/* Series Grid */}
            {!loading && pinnedSeries.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    <AnimatePresence>
                        {pinnedSeries.map(series => (
                            <SeriesTrackingCard
                                key={series.id}
                                series={series}
                                details={seriesDetails[series.id]}
                                onUnpin={handleUnpin}
                                onWatch={handleWatch}
                                onRefresh={handleRefresh}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default WatchlistPage;

// Export for use in other components
export { WatchlistPage };

// Export pinned series utility functions
export const getPinnedSeries = () => {
    try {
        const saved = localStorage.getItem('zylmia_pinned_series');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

export const isPinned = (seriesId) => {
    const pinned = getPinnedSeries();
    return pinned.some(s => s.id === seriesId);
};

export const togglePin = (series) => {
    const pinned = getPinnedSeries();
    const isCurrentlyPinned = pinned.some(s => s.id === series.id);

    let newPinned;
    if (isCurrentlyPinned) {
        newPinned = pinned.filter(s => s.id !== series.id);
    } else {
        // Only store essential info
        newPinned = [...pinned, {
            id: series.id,
            name: series.name || series.title,
            poster_path: series.poster_path,
            first_air_date: series.first_air_date,
            vote_average: series.vote_average
        }];
    }

    localStorage.setItem('zylmia_pinned_series', JSON.stringify(newPinned));
    return !isCurrentlyPinned; // Return new pinned state
};
