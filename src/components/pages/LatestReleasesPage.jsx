import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Film, Tv, Clock, Star, Calendar, ChevronDown, Info } from 'lucide-react';

/**
 * Tabs Component (shadcn-style inline)
 */
const Tabs = ({ tabs, activeTab, onTabChange }) => (
    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
          flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300
          ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }
        `}
            >
                <tab.icon size={16} />
                {tab.label}
            </button>
        ))}
    </div>
);

/**
 * Premium Content Card with 3D effects
 */
const ContentCard = React.memo(({ item, onDetails }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);

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
                    style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(6, 182, 212, 0.5))' }}
                />

                {/* Main Card */}
                <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
                    {/* Release Date Badge */}
                    <div
                        className="absolute top-3 left-3 z-20"
                        style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0)' }}
                    >
                        <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 backdrop-blur-sm text-xs font-bold text-white shadow-lg border border-emerald-400/30 flex items-center gap-1.5">
                            <Calendar size={12} />
                            {(item.release_date || item.first_air_date)?.split('-').slice(1).join('/') || 'TBA'}
                        </div>
                    </div>

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
                        alt={item.title || item.name || 'Poster'}
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
                                {item.title || item.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-white/80 text-xs">
                                <Calendar size={12} />
                                {(item.release_date || item.first_air_date)?.split('-')[0] || 'TBA'}
                            </span>
                            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg">
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
                                {item.title || item.name}
                            </h3>
                            <span className="text-neutral-400 text-xs">
                                {(item.release_date || item.first_air_date)?.split('-')[0] || 'Coming Soon'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

/**
 * Latest Releases Page Component
 */
const LatestReleasesPage = ({ accessToken, onShowDetails }) => {
    const [activeTab, setActiveTab] = useState('movies');
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadMoreRef = useRef(null);
    const isLoadingRef = useRef(false);

    const tabs = [
        { id: 'movies', label: 'Movies', icon: Film },
        { id: 'tv', label: 'TV Shows', icon: Tv },
    ];

    // Fetch content
    const fetchContent = useCallback(async (pageNum, isInitial = false) => {
        if (!accessToken) return;
        if (isLoadingRef.current && !isInitial) return;

        isLoadingRef.current = true;
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        try {
            const endpoint = activeTab === 'movies'
                ? `https://api.themoviedb.org/3/movie/now_playing?page=${pageNum}`
                : `https://api.themoviedb.org/3/tv/on_the_air?page=${pageNum}`;

            const response = await fetch(endpoint, {
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
            console.error('Failed to fetch latest releases:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            isLoadingRef.current = false;
        }
    }, [accessToken, activeTab]);

    // Reset and fetch on tab change
    useEffect(() => {
        setContent([]);
        setPage(1);
        setHasMore(true);
        fetchContent(1, true);
    }, [activeTab, accessToken]);

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
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600">
                            <Clock className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-white">Latest Releases</h1>
                            <p className="text-neutral-400 text-xs md:text-sm">Now playing in theaters & currently airing</p>
                        </div>
                    </div>

                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs md:text-sm text-neutral-500">
                        {content.length} titles loaded
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
                        <span className="text-neutral-400">Loading {activeTab === 'movies' ? 'movies' : 'TV shows'}...</span>
                    </div>
                </div>
            )}

            {/* Content Grid */}
            {!loading && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                        {content.map((item) => (
                            <ContentCard
                                key={item.id}
                                item={item}
                                onDetails={(i) => onShowDetails(i, activeTab === 'movies' ? 'movie' : 'tv')}
                            />
                        ))}
                    </div>

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
                                        ✨ All {content.length} titles loaded
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

export default LatestReleasesPage;
