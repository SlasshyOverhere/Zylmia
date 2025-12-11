import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pin, Star, Calendar, PlayCircle, Users, Clock } from 'lucide-react';
import { isPinned, togglePin } from '../pages/WatchlistPage';
import { cn } from '../../utils/cn';


export const ContentCard = React.memo(({ item, rank, onDetails, showPinButton = true }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [pinned, setPinned] = useState(() => isPinned(item.id));
    const cardRef = useRef(null);

    // Motion values for tilt could be used here, but CSS transform is also fine for simple stuff.
    // Let's use Framer Motion for smoother feel.

    const isTvShow = !!item.first_air_date;

    const handleClick = useCallback(() => {
        onDetails(item);
    }, [item, onDetails]);

    const handlePinToggle = useCallback((e) => {
        e.stopPropagation();
        const newPinnedState = togglePin(item);
        setPinned(newPinnedState);
    }, [item]);

    return (
        <motion.div
            ref={cardRef}
            className="group relative aspect-[2/3] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, z: 50 }}
            transition={{ duration: 0.3 }}
        >
            {/* Neon Glow Background */}
            <div
                className={cn(
                    "absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500",
                    pinned && "opacity-50"
                )}
            />

            <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-900 border border-white/10">

                {/* Poster Image */}
                <img
                    src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Content - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">

                    {/* Title */}
                    <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-2 group-hover:text-violet-300 transition-colors">
                        {item.title || item.name}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                        <span className="flex items-center gap-1">
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            {item.vote_average?.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{(item.release_date || item.first_air_date)?.split('-')[0]}</span>
                        {isTvShow && (
                            <>
                                <span>•</span>
                                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white">TV</span>
                            </>
                        )}
                    </div>

                    {/* Action Hints */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        <span className="text-xs font-medium text-violet-400 flex items-center gap-1">
                            <PlayCircle size={14} /> Watch Now
                        </span>
                    </div>
                </div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {rank && (
                        <div className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
                            #{rank}
                        </div>
                    )}
                </div>

                {/* Pin Button */}
                {showPinButton && (
                    <button
                        onClick={handlePinToggle}
                        className={cn(
                            "absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300",
                            pinned
                                ? "bg-pink-500/20 text-pink-500 border border-pink-500/50"
                                : "bg-black/40 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <Pin size={14} className={cn(pinned && "fill-current")} />
                    </button>
                )}
            </div>
        </motion.div>
    );
});
