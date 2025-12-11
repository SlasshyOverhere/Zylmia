import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Star, Clock, Film, ChevronDown, Info, Globe, Settings, Sparkles, Filter, Search, X } from 'lucide-react';
import { CountdownCompact } from '../ui/CountdownTimer';
import { getRegionInfo, formatLocalDate } from '../../utils/regionUtils';
import {
    getPreferences,
    hasPreferencesSet,
    filterByPreferences,
    PREFERENCE_OPTIONS
} from '../../utils/preferences';
import PreferencesModal from '../ui/PreferencesModal';

/**
 * Format date helper
 */
const formatReleaseDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Premium Upcoming Card with Countdown
 */
const UpcomingCard = React.memo(({ item, onDetails, region }) => {
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
                    style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.5), rgba(245, 158, 11, 0.5))' }}
                />

                {/* Main Card */}
                <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
                    {/* Countdown Badge */}
                    <div
                        className="absolute top-3 left-3 z-20"
                        style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0)' }}
                    >
                        <CountdownCompact targetDate={item.release_date} />
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
    const [popularContent, setPopularContent] = useState([]); // Always shown regardless of preferences
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [region, setRegion] = useState(null);
    const loadMoreRef = useRef(null);
    const isLoadingRef = useRef(false);

    // Preferences state
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [preferences, setPreferences] = useState(getPreferences());
    const [preferencesSet, setPreferencesSet] = useState(hasPreferencesSet());

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Show preferences modal on first visit
    useEffect(() => {
        if (!hasPreferencesSet()) {
            setShowPreferencesModal(true);
        }
    }, []);

    // Handle preferences save
    const handlePreferencesSave = (newPreferences) => {
        setPreferences(newPreferences);
        setPreferencesSet(true);
        setShowPreferencesModal(false);
    };

    // Handle search with debounce
    const handleSearchChange = useCallback((e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // If query is empty, clear search results
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        // Debounce search API call
        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const url = new URL('https://api.themoviedb.org/3/search/movie');
                url.searchParams.set('query', query);
                url.searchParams.set('include_adult', 'false');

                const response = await fetch(url.toString(), {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const data = await response.json();

                // Filter to only show upcoming movies (release date >= today)
                const todayDate = new Date().toISOString().split('T')[0];
                const upcomingResults = (data.results || []).filter(movie =>
                    movie.release_date && movie.release_date >= todayDate
                );

                setSearchResults(upcomingResults);
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 400);
    }, [accessToken]);

    // Clear search
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    }, []);

    // Get current date info - this is the user's current date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Calculate end of current month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const endOfMonthStr = endOfMonth.toISOString().split('T')[0];

    // Calculate end of next month for extended range
    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    const endOfNextMonthStr = endOfNextMonth.toISOString().split('T')[0];

    // Detect user region on mount
    useEffect(() => {
        getRegionInfo().then(setRegion);
    }, []);

    // Fetch content using discover API with date range
    const fetchContent = useCallback(async (pageNum, isInitial = false) => {
        if (!accessToken) return;
        if (isLoadingRef.current && !isInitial) return;

        isLoadingRef.current = true;
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        try {
            // Use discover/movie API with date range for efficient fetching
            // Fetch from today to end of next month for a good batch of content
            const url = new URL('https://api.themoviedb.org/3/discover/movie');
            url.searchParams.set('page', pageNum.toString());
            url.searchParams.set('sort_by', 'primary_release_date.asc');
            url.searchParams.set('primary_release_date.gte', todayStr);
            url.searchParams.set('primary_release_date.lte', endOfNextMonthStr);
            url.searchParams.set('with_release_type', '2|3'); // Theatrical releases
            if (region?.countryCode) {
                url.searchParams.set('region', region.countryCode);
            }

            const response = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const data = await response.json();

            const newResults = (data.results || []).filter(item => {
                // Double-check: only include items releasing from today onwards
                if (!item.release_date) return false;
                return item.release_date >= todayStr;
            });

            const totalPages = Math.min(data.total_pages || 1, 20); // Limit pages to avoid rate limits

            setHasMore(pageNum < totalPages && newResults.length > 0);

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
    }, [accessToken, todayStr, endOfNextMonthStr, region]);

    // Initial fetch
    useEffect(() => {
        fetchContent(1, true);
    }, [accessToken, region]);

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

    // Group content by month - already filtered to today onwards
    const groupedContent = React.useMemo(() => {
        const groups = {};
        content.forEach(item => {
            if (item.release_date) {
                const releaseDate = new Date(item.release_date);
                const monthKey = releaseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                if (!groups[monthKey]) groups[monthKey] = [];
                groups[monthKey].push(item);
            }
        });

        // Sort groups by date
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            const dateA = new Date(groups[a][0].release_date);
            const dateB = new Date(groups[b][0].release_date);
            return dateA - dateB;
        });

        // Sort items within each group by release date
        sortedKeys.forEach(key => {
            groups[key].sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
        });

        return sortedKeys.map(key => ({ month: key, items: groups[key] }));
    }, [content]);

    // Apply preferences filtering to content
    const filteredContent = useMemo(() => {
        if (!preferencesSet) return content;

        // Popular content (high vote average or popularity) is always shown
        const popularItems = content.filter(item =>
            item.vote_average >= 7.0 || item.popularity >= 100
        );

        // Filter remaining content by preferences
        const preferenceFiltered = filterByPreferences(content, preferences);

        // Combine: popular items + preference-filtered items (avoiding duplicates)
        const combinedSet = new Set(popularItems.map(i => i.id));
        const uniquePreferenceFiltered = preferenceFiltered.filter(i => !combinedSet.has(i.id));

        return [...popularItems, ...uniquePreferenceFiltered];
    }, [content, preferences, preferencesSet]);

    // Group FILTERED content by month
    const groupedFilteredContent = useMemo(() => {
        const groups = {};
        filteredContent.forEach(item => {
            if (item.release_date) {
                const releaseDate = new Date(item.release_date);
                const monthKey = releaseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                if (!groups[monthKey]) groups[monthKey] = [];
                groups[monthKey].push(item);
            }
        });

        // Sort groups by date
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            const dateA = new Date(groups[a][0].release_date);
            const dateB = new Date(groups[b][0].release_date);
            return dateA - dateB;
        });

        // Sort items within each group by release date
        sortedKeys.forEach(key => {
            groups[key].sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
        });

        return sortedKeys.map(key => ({ month: key, items: groups[key] }));
    }, [filteredContent]);

    // Count filtered items
    const filteredCount = useMemo(() =>
        groupedFilteredContent.reduce((acc, g) => acc + g.items.length, 0),
        [groupedFilteredContent]
    );

    // Get selected preferences summary for display
    const preferencesSummary = useMemo(() => {
        if (!preferencesSet) return null;

        const originCount = preferences.origins?.length || 0;
        const genreCount = preferences.genres?.length || 0;

        return {
            origins: originCount,
            genres: genreCount
        };
    }, [preferences, preferencesSet]);

    return (
        <>
            {/* Preferences Modal */}
            <PreferencesModal
                isOpen={showPreferencesModal}
                onClose={() => setShowPreferencesModal(false)}
                onSave={handlePreferencesSave}
                isFirstTime={!preferencesSet}
            />

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
                                <p className="text-neutral-400 text-xs md:text-sm">Movies releasing from today onwards</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Preferences Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowPreferencesModal(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 text-white/90 hover:from-violet-600/30 hover:to-purple-600/30 transition-all"
                            >
                                <Settings size={16} className="text-violet-400" />
                                <span className="text-sm font-medium">Preferences</span>
                                {preferencesSet && preferencesSummary && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-violet-500/30 text-[10px] font-semibold text-violet-300">
                                        {preferencesSummary.genres + preferencesSummary.origins}
                                    </span>
                                )}
                            </motion.button>

                            {/* Current Date Badge */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <Clock size={14} className="text-orange-400" />
                                <span className="text-sm text-white/70">
                                    Today: <span className="text-white font-medium">{today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {preferencesSet && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-wrap items-center gap-2 mb-4"
                        >
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                                <Filter size={12} />
                                Active filters:
                            </span>

                            {/* Show selected origins as badges */}
                            {preferences.origins?.slice(0, 3).map(originId => {
                                const origin = PREFERENCE_OPTIONS.origins.find(o => o.id === originId);
                                if (!origin) return null;
                                return (
                                    <span
                                        key={originId}
                                        className="px-2 py-1 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-medium flex items-center gap-1"
                                    >
                                        <span>{origin.flag}</span>
                                        {origin.label}
                                    </span>
                                );
                            })}
                            {preferences.origins?.length > 3 && (
                                <span className="px-2 py-1 rounded-lg bg-white/5 text-neutral-400 text-[10px]">
                                    +{preferences.origins.length - 3} more
                                </span>
                            )}

                            {/* Show selected genres as badges */}
                            {preferences.genres?.slice(0, 3).map(genreId => {
                                const genre = PREFERENCE_OPTIONS.genres.find(g => g.id === genreId);
                                if (!genre) return null;
                                return (
                                    <span
                                        key={genreId}
                                        className="px-2 py-1 rounded-lg bg-orange-600/20 border border-orange-500/30 text-orange-300 text-[10px] font-medium flex items-center gap-1"
                                    >
                                        <span>{genre.icon}</span>
                                        {genre.label}
                                    </span>
                                );
                            })}
                            {preferences.genres?.length > 3 && (
                                <span className="px-2 py-1 rounded-lg bg-white/5 text-neutral-400 text-[10px]">
                                    +{preferences.genres.length - 3} more
                                </span>
                            )}

                            {/* Popular releases note */}
                            <span className="ml-auto px-2 py-1 rounded-lg bg-amber-600/20 border border-amber-500/30 text-amber-300 text-[10px] font-medium flex items-center gap-1">
                                <Sparkles size={10} />
                                Popular always shown
                            </span>
                        </motion.div>
                    )}

                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {isSearching ? (
                                    <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Search size={16} className="text-neutral-500" />
                                )}
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search upcoming movies..."
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Search Results Info */}
                        {searchQuery && !isSearching && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-xs text-neutral-500"
                            >
                                {searchResults.length > 0 ? (
                                    <>Found <span className="text-violet-400 font-medium">{searchResults.length}</span> upcoming movie{searchResults.length !== 1 ? 's' : ''} matching "{searchQuery}"</>
                                ) : (
                                    <>No upcoming movies found for "{searchQuery}"</>
                                )}
                            </motion.p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs md:text-sm text-neutral-500">
                            {searchQuery ? `${searchResults.length} search results` : `${filteredCount} upcoming titles`}
                            {!searchQuery && preferencesSet && content.length !== filteredCount && (
                                <span className="text-violet-400/70 ml-1">
                                    (filtered from {content.length})
                                </span>
                            )}
                        </span>
                        {!searchQuery && hasMore && (
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

                {/* Content Grid - Search Results OR Grouped by Month */}
                {!loading && (
                    <>
                        {/* Search Results Mode */}
                        {searchQuery ? (
                            <>
                                {searchResults.length === 0 && !isSearching ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center max-w-md">
                                            <Search className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                                            <p className="text-sm text-neutral-400 mb-4">
                                                No upcoming movies match "{searchQuery}". Try a different search term.
                                            </p>
                                            <button
                                                onClick={clearSearch}
                                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium text-sm"
                                            >
                                                Clear Search
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                                        {searchResults.map((item) => (
                                            <UpcomingCard
                                                key={item.id}
                                                item={item}
                                                onDetails={(i) => onShowDetails(i, 'movie')}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Normal Mode - Grouped by Month */
                            <>
                                {groupedFilteredContent.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center max-w-md">
                                            <Filter className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-white mb-2">No matching releases</h3>
                                            <p className="text-sm text-neutral-400 mb-4">
                                                Try adjusting your preferences to see more upcoming movies.
                                            </p>
                                            <button
                                                onClick={() => setShowPreferencesModal(true)}
                                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium text-sm"
                                            >
                                                Edit Preferences
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {groupedFilteredContent.map(({ month, items }) => (
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
                                    </>
                                )}

                                {/* Load More - Only show when not searching */}
                                <div ref={loadMoreRef} className="mt-8">
                                    {loadingMore && (
                                        <div className="flex justify-center items-center py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-neutral-400 text-sm">Loading more...</span>
                                            </div>
                                        </div>
                                    )}

                                    {!hasMore && filteredContent.length > 0 && (
                                        <div className="flex justify-center items-center py-8">
                                            <div className="px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                                <span className="text-neutral-500 text-sm">
                                                    ✨ All {filteredCount} matching movies loaded
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </motion.div>
        </>
    );
};

export default UpcomingReleasesPage;

