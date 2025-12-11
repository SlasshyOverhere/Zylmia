import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, Clock, Film, ChevronDown, Info } from 'lucide-react';

/**
 * Format date helper
 */
const formatReleaseDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Days until release
 */
const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const now = new Date();
    const release = new Date(dateStr);
    const diff = Math.ceil((release - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
};

/**
 * Premium Upcoming Card with 3D effects
 */
const UpcomingCard = React.memo(({ item, onDetails }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);
    const daysUntil = getDaysUntil(item.release_date);

    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setTilt({
            x: (y - 0.5) * 12,
            y: (x - 0.5) * -12
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        setTilt({ x: 0, y: 0 });
    }, []);

    return (
        <div
            ref={cardRef}
            className="group relative aspect-[2/3] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => onDetails(item)}
            style={{ perspective: '1000px' }}
        >
            <div
                className="relative w-full h-full transition-all duration-300 ease-out"
                style={{
                    transform: isHovered
                        ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.05)`
                        : 'rotateX(0) rotateY(0) scale(1)',
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Glow Effect */}
                <div
                    className={`absolute -inset-3 rounded-2xl blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-50' : 'opacity-0'}`}
                    style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.5), rgba(245, 158, 11, 0.5))' }}
                />

                {/* Main Card */}
                <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
                    {/* Days Until Release Badge */}
                    {daysUntil && (
                        <div
                            className="absolute top-3 left-3 z-20"
                            style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0)' }}
                        >
                            <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 backdrop-blur-sm text-xs font-bold text-white shadow-lg border border-orange-400/30 flex items-center gap-1.5">
                                <Clock size={12} />
                                {daysUntil} days
                            </div>
                        </div>
                    )}

                    {/* Rating Badge */}
                    <div
                        className="absolute top-3 right-3 z-20"
                        style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0)' }}
                    >
                        <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-bold text-amber-400 flex items-center gap-1 border border-amber-500/30 shadow-lg">
                            <Star size={12} fill="currentColor" />
                            <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Image */}
                    <img
                        src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'}
                        alt={item.title || 'Poster'}
                        className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110 brightness-75' : ''}`}
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Image'; }}
                    />

                    {/* Hover Overlay */}
                    <div
                        className={`absolute inset-0 z-15 flex flex-col justify-end transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)' }}
                    >
                        <div
                            className="p-4 space-y-3"
                            style={{ transform: isHovered ? 'translateZ(40px) translateY(0)' : 'translateZ(0) translateY(20px)' }}
                        >
                            <h3 className="text-white font-bold text-lg md:text-xl leading-tight line-clamp-2">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-600/30 text-orange-300 text-xs font-medium">
                                    <Calendar size={12} />
                                    {formatReleaseDate(item.release_date)}
                                </span>
                            </div>
                            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg">
                                <Info size={16} />
                                View Details
                            </button>
                        </div>
                    </div>

                    {/* Default Overlay */}
                    <div
                        className={`absolute bottom-0 inset-x-0 z-10 transition-all duration-300 ${isHovered ? 'opacity-0 translate-y-4' : 'opacity-100'}`}
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)' }}
                    >
                        <div className="p-3 pb-4">
                            <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 mb-1">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-orange-400">
                                <Calendar size={12} />
                                {formatReleaseDate(item.release_date)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

/**
 * Month Group Header
 */
const MonthGroup = ({ month, children }) => (
    <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <h2 className="text-sm md:text-base font-semibold text-white/80 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Calendar size={14} className="text-violet-400" />
                {month}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {children}
        </div>
    </div>
);

/**
 * Upcoming Releases Page Component
 */
const UpcomingReleasesPage = ({ accessToken, onShowDetails }) => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadMoreRef = useRef(null);
    const isLoadingRef = useRef(false);

    // Fetch content
    const fetchContent = useCallback(async (pageNum, isInitial = false) => {
        if (!accessToken) return;
        if (isLoadingRef.current && !isInitial) return;

        isLoadingRef.current = true;
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/upcoming?page=${pageNum}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await response.json();

            const newResults = data.results || [];
            const totalPages = Math.min(data.total_pages || 1, 500);

            setHasMore(pageNum < totalPages);

            if (isInitial) {
                setContent(newResults);
                setPage(pageNum);
            } else {
                setContent(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const uniqueNew = newResults.filter(item => !existingIds.has(item.id));
                    return [...prev, ...uniqueNew];
                });
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Failed to fetch upcoming releases:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            isLoadingRef.current = false;
        }
    }, [accessToken]);

    // Initial fetch
    useEffect(() => {
        fetchContent(1, true);
    }, [accessToken]);

    // Infinite scroll observer
    useEffect(() => {
        if (loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
                    fetchContent(page + 1, false);
                }
            },
            { rootMargin: '400px', threshold: 0 }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [loading, hasMore, page, fetchContent]);

    // Get current date info
    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Group content by month - ONLY current month and future
    const groupedContent = React.useMemo(() => {
        const groups = {};
        content.forEach(item => {
            if (item.release_date) {
                const releaseDate = new Date(item.release_date);
                // Only include releases from current month onward
                if (releaseDate >= currentMonthStart) {
                    const monthKey = releaseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    if (!groups[monthKey]) groups[monthKey] = [];
                    groups[monthKey].push(item);
                }
            }
        });

        // Sort groups by date
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            const dateA = new Date(groups[a][0].release_date);
            const dateB = new Date(groups[b][0].release_date);
            return dateA - dateB;
        });

        return sortedKeys.map(key => ({ month: key, items: groups[key] }));
    }, [content, currentMonthStart]);

    // Count filtered items
    const filteredCount = React.useMemo(() =>
        groupedContent.reduce((acc, g) => acc + g.items.length, 0),
        [groupedContent]
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 md:p-6"
        >
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600">
                            <Calendar className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-white">Upcoming Releases</h1>
                            <p className="text-neutral-400 text-xs md:text-sm">Movies releasing from {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} onward</p>
                        </div>
                    </div>

                    {/* Current Date Badge */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <Clock size={14} className="text-orange-400" />
                        <span className="text-sm text-white/70">
                            Today: <span className="text-white font-medium">{currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs md:text-sm text-neutral-500">
                        {filteredCount} upcoming titles
                    </span>
                    {hasMore && (
                        <span className="text-[10px] md:text-xs text-violet-400/70 flex items-center gap-1">
                            <ChevronDown size={10} className="animate-bounce" />
                            More available
                        </span>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-neutral-400">Loading upcoming movies...</span>
                    </div>
                </div>
            )}

            {/* Content Grid - Grouped by Month */}
            {!loading && (
                <>
                    {groupedContent.map(({ month, items }) => (
                        <MonthGroup key={month} month={month}>
                            {items.map((item) => (
                                <UpcomingCard
                                    key={item.id}
                                    item={item}
                                    onDetails={(i) => onShowDetails(i, 'movie')}
                                />
                            ))}
                        </MonthGroup>
                    ))}

                    {/* Load More */}
                    <div ref={loadMoreRef} className="mt-8">
                        {loadingMore && (
                            <div className="flex justify-center items-center py-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-neutral-400 text-sm">Loading more...</span>
                                </div>
                            </div>
                        )}

                        {!hasMore && content.length > 0 && (
                            <div className="flex justify-center items-center py-8">
                                <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <span className="text-neutral-500 text-sm">
                                        ✨ All {content.length} upcoming movies loaded
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default UpcomingReleasesPage;
