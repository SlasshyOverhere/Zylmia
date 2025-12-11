import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Tv, Film, Calendar } from 'lucide-react';

/**
 * Calculate time remaining until target date
 */
const getTimeRemaining = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
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

/**
 * Single time unit display
 */
const TimeUnit = ({ value, label, color = 'violet' }) => (
    <div className="flex flex-col items-center">
        <motion.div
            key={value}
            initial={{ scale: 1.1, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
                min-w-[2.5rem] h-10 flex items-center justify-center rounded-lg
                bg-gradient-to-b from-${color}-600/30 to-${color}-900/30
                border border-${color}-500/30 backdrop-blur-sm
                text-white font-bold text-lg tabular-nums
            `}
        >
            {String(value).padStart(2, '0')}
        </motion.div>
        <span className="text-[10px] text-neutral-500 uppercase mt-1 font-medium">{label}</span>
    </div>
);

/**
 * Compact countdown for cards - shows only days remaining
 */
export const CountdownCompact = ({ targetDate, className = '' }) => {
    const [time, setTime] = useState(() => getTimeRemaining(targetDate));

    useEffect(() => {
        // Update once per hour since we only show days
        const timer = setInterval(() => {
            setTime(getTimeRemaining(targetDate));
        }, 60000); // Update every minute instead of every second

        return () => clearInterval(timer);
    }, [targetDate]);

    if (time.expired) {
        return (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-600/40 border border-green-500/40 backdrop-blur-sm shadow-lg ${className}`}>
                <span className="text-green-400 text-xs font-bold">Out Now</span>
            </div>
        );
    }

    // Calculate total days (round up if there's any remaining time in the day)
    const totalDays = time.days + (time.hours > 0 || time.minutes > 0 || time.seconds > 0 ? 1 : 0);

    // Use different colors based on how soon the release is
    let bgClass, borderClass, textClass;
    if (totalDays <= 1) {
        // Releasing today or tomorrow - pink/urgent
        bgClass = 'bg-pink-600/40';
        borderClass = 'border-pink-500/40';
        textClass = 'text-pink-300';
    } else if (totalDays <= 7) {
        // Within a week - violet/soon
        bgClass = 'bg-violet-600/40';
        borderClass = 'border-violet-500/40';
        textClass = 'text-violet-300';
    } else {
        // More than a week - orange
        bgClass = 'bg-orange-600/40';
        borderClass = 'border-orange-500/40';
        textClass = 'text-orange-300';
    }

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${bgClass} border ${borderClass} backdrop-blur-sm shadow-lg ${className}`}>
            <Clock size={12} className={textClass} />
            <span className={`${textClass} text-xs font-bold`}>
                {totalDays} {totalDays === 1 ? 'day' : 'days'}
            </span>
        </div>
    );
};

/**
 * Full countdown display for featured items
 */
export const CountdownFull = ({ targetDate, title, subtitle, type = 'movie', className = '' }) => {
    const [time, setTime] = useState(() => getTimeRemaining(targetDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(getTimeRemaining(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (time.expired) {
        return (
            <div className={`p-4 rounded-xl bg-green-600/20 border border-green-500/30 backdrop-blur-sm ${className}`}>
                <div className="flex items-center gap-2 text-green-400">
                    {type === 'tv' ? <Tv size={18} /> : <Film size={18} />}
                    <span className="font-bold">Now Available!</span>
                </div>
                {title && <p className="text-white font-medium mt-1">{title}</p>}
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-xl bg-gradient-to-br from-violet-900/40 to-pink-900/40 border border-violet-500/30 backdrop-blur-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {type === 'tv' ? <Tv size={16} className="text-cyan-400" /> : <Film size={16} className="text-violet-400" />}
                    <span className="text-xs text-neutral-400 uppercase font-medium">Coming Soon</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Calendar size={12} />
                    {new Date(targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Title */}
            {title && (
                <div className="mb-3">
                    <h4 className="text-white font-bold text-sm line-clamp-1">{title}</h4>
                    {subtitle && <p className="text-neutral-400 text-xs">{subtitle}</p>}
                </div>
            )}

            {/* Countdown */}
            <div className="flex items-center justify-center gap-2">
                <TimeUnit value={time.days} label="Days" color="violet" />
                <span className="text-neutral-600 text-xl font-bold mb-4">:</span>
                <TimeUnit value={time.hours} label="Hrs" color="violet" />
                <span className="text-neutral-600 text-xl font-bold mb-4">:</span>
                <TimeUnit value={time.minutes} label="Min" color="violet" />
                <span className="text-neutral-600 text-xl font-bold mb-4">:</span>
                <TimeUnit value={time.seconds} label="Sec" color="pink" />
            </div>
        </div>
    );
};

/**
 * Episode countdown for TV shows in watchlist
 */
export const EpisodeCountdown = ({ nextEpisode, showName, className = '' }) => {
    const [time, setTime] = useState(() =>
        nextEpisode?.air_date ? getTimeRemaining(nextEpisode.air_date) : { expired: true }
    );

    useEffect(() => {
        if (!nextEpisode?.air_date) return;

        const timer = setInterval(() => {
            setTime(getTimeRemaining(nextEpisode.air_date));
        }, 1000);

        return () => clearInterval(timer);
    }, [nextEpisode]);

    if (!nextEpisode || time.expired) {
        return null;
    }

    return (
        <div className={`p-3 rounded-xl bg-gradient-to-br from-cyan-900/40 to-teal-900/40 border border-cyan-500/30 backdrop-blur-sm ${className}`}>
            <div className="flex items-center gap-2 mb-2">
                <Tv size={14} className="text-cyan-400" />
                <span className="text-xs text-cyan-400 font-medium">Next Episode</span>
            </div>

            <div className="mb-2">
                <p className="text-white text-sm font-medium line-clamp-1">
                    S{nextEpisode.season_number}E{nextEpisode.episode_number}: {nextEpisode.name || 'TBA'}
                </p>
                <p className="text-neutral-500 text-xs">{showName}</p>
            </div>

            <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-cyan-400" />
                <span className="text-white text-xs font-mono font-bold">
                    {time.days > 0 && `${time.days}d `}
                    {String(time.hours).padStart(2, '0')}:
                    {String(time.minutes).padStart(2, '0')}:
                    {String(time.seconds).padStart(2, '0')}
                </span>
                <span className="text-neutral-500 text-xs ml-1">
                    ({new Date(nextEpisode.air_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                </span>
            </div>
        </div>
    );
};

export default CountdownCompact;
