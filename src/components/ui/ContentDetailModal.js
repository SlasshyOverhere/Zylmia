import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlayCircle, Star, Calendar, Clock, Users, Building2 } from 'lucide-react';

const buildVideasyUrl = (type, id, season = null, episode = null) => {
    const color = '8B5CF6'; // violet
    if (type === 'movie') {
        return `https://player.videasy.net/movie/${id}?color=${color}&overlay=true`;
    } else {
        return `https://player.videasy.net/tv/${id}/${season || 1}/${episode || 1}?color=${color}&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true`;
    }
};

const openInVideasy = (type, id, season = null, episode = null) => {
    window.open(buildVideasyUrl(type, id, season, episode), '_blank');
};

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

// Reusable Components inside Modal
const Badge = ({ children, className, variant = 'default' }) => {
    const variants = {
        default: 'bg-violet-600/20 text-violet-300 border-violet-500/30',
        secondary: 'bg-white/10 text-white/80 border-white/20'
    };
    return (
        <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm',
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};

const Button = ({ children, onClick, className, variant = 'primary', disabled }) => {
    const variants = {
        primary: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]',
        secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
        ghost: 'text-white/70 hover:text-white hover:bg-white/10'
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50',
                variants[variant],
                className
            )}
        >
            {children}
        </button>
    );
};

export const ContentDetailModal = ({ item, type, isOpen, onClose, accessToken }) => {
    const [details, setDetails] = useState(null);
    const [credits, setCredits] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !item || !accessToken) return;

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const mediaType = type || (item.media_type === 'tv' ? 'tv' : 'movie');

                const [detailsRes, creditsRes] = await Promise.all([
                    fetch(`https://api.themoviedb.org/3/${mediaType}/${item.id}`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    }),
                    fetch(`https://api.themoviedb.org/3/${mediaType}/${item.id}/credits`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    })
                ]);

                const detailsData = await detailsRes.json();
                const creditsData = await creditsRes.json();

                setDetails(detailsData);
                setCredits(creditsData);
            } catch (error) {
                console.error('Failed to fetch details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [isOpen, item, type, accessToken]);

    if (!isOpen) return null;

    const handleWatch = () => {
        const mediaType = type || (item.media_type === 'tv' ? 'tv' : 'movie');
        openInVideasy(mediaType, item.id);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full md:max-w-5xl max-h-[95vh] md:max-h-[90vh] bg-neutral-900/95 backdrop-blur-xl rounded-t-2xl md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-2 rounded-full bg-black/50 text-white/80 hover:text-white active:bg-black/70 transition-all hover:bg-black/70"
                        >
                            <X size={18} className="md:w-5 md:h-5" />
                        </button>

                        <div className="overflow-y-auto max-h-[95vh] md:max-h-[90vh] scrollbar-hide">
                            {/* Backdrop */}
                            <div className="relative h-48 md:h-96">
                                {/* Gradient Overlay Top */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-neutral-900 z-10" />

                                <img
                                    src={item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : 'https://via.placeholder.com/1280x720?text=No+Image'}
                                    alt={item.title || item.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent z-10" />
                            </div>

                            {/* Content */}
                            <div className="relative z-20 -mt-20 md:-mt-32 px-4 md:px-8 pb-6 md:pb-8">
                                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                    {/* Poster */}
                                    <div className="hidden sm:block w-32 md:w-56 flex-shrink-0">
                                        <motion.img
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Image'}
                                            alt={item.title || item.name}
                                            className="w-full rounded-xl shadow-2xl border border-white/20"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <motion.h1
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4 drop-shadow-lg"
                                        >
                                            {item.title || item.name}
                                        </motion.h1>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6"
                                        >
                                            <Badge>
                                                <Star size={12} className="fill-current text-violet-300" />
                                                {item.vote_average?.toFixed(1) || 'N/A'}
                                            </Badge>
                                            {(item.release_date || item.first_air_date) && (
                                                <Badge variant="secondary">
                                                    <Calendar size={12} />
                                                    {(item.release_date || item.first_air_date)?.split('-')[0]}
                                                </Badge>
                                            )}
                                            {details?.runtime && (
                                                <Badge variant="secondary">
                                                    <Clock size={12} />
                                                    {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                                                </Badge>
                                            )}
                                        </motion.div>

                                        {details?.genres && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="flex flex-wrap gap-2 mb-4 md:mb-6"
                                            >
                                                {details.genres.slice(0, 4).map(genre => (
                                                    <span key={genre.id} className="px-3 py-1 rounded-full text-xs bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10 transition-colors">
                                                        {genre.name}
                                                    </span>
                                                ))}
                                            </motion.div>
                                        )}

                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                            className="text-neutral-300 text-sm md:text-base leading-relaxed mb-6 md:mb-8 font-light"
                                        >
                                            {item.overview || 'No overview available.'}
                                        </motion.p>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="flex flex-wrap gap-3 md:gap-4"
                                        >
                                            <Button onClick={handleWatch} className="flex-1 md:flex-none justify-center px-8 shadow-lg shadow-violet-600/20">
                                                <PlayCircle size={20} />
                                                Watch Now
                                            </Button>
                                            <Button variant="secondary" onClick={() => { }} className="flex-1 md:flex-none justify-center">
                                                + Watchlist
                                            </Button>
                                        </motion.div>

                                        {/* Credits */}
                                        {credits?.cast?.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.8 }}
                                                className="mt-8 md:mt-10 pt-8 border-t border-white/10"
                                            >
                                                <h3 className="text-sm md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                                    <Users size={16} className="text-violet-400" /> Top Cast
                                                </h3>
                                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                                    {credits.cast.slice(0, 10).map(person => (
                                                        <div key={person.id} className="flex-shrink-0 w-20 md:w-24 text-center group">
                                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mx-auto mb-2 border-2 border-white/10 group-hover:border-violet-500/50 transition-colors">
                                                                <img
                                                                    src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x278?text=No+Photo'}
                                                                    alt={person.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-white font-medium truncate">{person.name}</p>
                                                            <p className="text-[10px] text-neutral-500 truncate">{person.character}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Production Companies */}
                                        {details?.production_companies?.length > 0 && (
                                            <div className="mt-6 md:mt-8">
                                                <h3 className="text-xs md:text-sm font-semibold text-neutral-400 mb-3 flex items-center gap-2">
                                                    <Building2 size={12} /> Production
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {details.production_companies.slice(0, 3).map(company => (
                                                        <span key={company.id} className="px-2 py-1 rounded text-xs bg-white/5 text-neutral-400 border border-white/5">
                                                            {company.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
