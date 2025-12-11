import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Calendar, Clock, Film, Tv, ChevronDown, Info, Globe, RefreshCw } from 'lucide-react';

/**
 * Get user's country via IP geolocation
 */
const getCountryFromIP = async () => {
    try {
        // Using ipapi.co - free API for country detection
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return {
            code: data.country_code || 'US',
            name: data.country_name || 'United States',
            city: data.city || '',
            timezone: data.timezone || ''
        };
    } catch (error) {
        console.error('Failed to detect country:', error);
        // Fallback to US
        return { code: 'US', name: 'United States', city: '', timezone: '' };
    }
};

/**
 * Format date helper
 */
const formatReleaseDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Premium Content Card with 3D effects
 */
const RegionalCard = React.memo(({ item, type, onDetails }) => {
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

    const isMovie = type === 'movie';

    return (
        <div
            ref={cardRef}
            className="group relative aspect-[2/3] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => onDetails(item, type)}
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
                    style={{
                        background: isMovie
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(236, 72, 153, 0.5))'
                            : 'linear-gradient(135deg, rgba(6, 182, 212, 0.5), rgba(16, 185, 129, 0.5))'
                    }}
                />

                {/* Main Card */}
                <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-900">
                    {/* Type Badge */}
                    <div
                        className="absolute top-3 left-3 z-20"
                        style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0)' }}
                    >
                        <div className={`px-2.5 py-1 rounded-lg backdrop-blur-sm text-xs font-bold text-white shadow-lg border flex items-center gap-1.5 ${isMovie
                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 border-violet-400/30'
                                : 'bg-gradient-to-r from-cyan-600 to-teal-600 border-cyan-400/30'
                            }`}>
                            {isMovie ? <Film size={12} /> : <Tv size={12} />}
                            {isMovie ? 'Movie' : 'TV'}
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
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-white/80 text-xs">
                                    <Calendar size={12} />
                                    {formatReleaseDate(item.release_date || item.first_air_date)}
                                </span>
                            </div>
                            <button className={`w-full py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg ${isMovie
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600'
                                    : 'bg-gradient-to-r from-cyan-600 to-teal-600'
                                }`}>
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
                                {formatReleaseDate(item.release_date || item.first_air_date)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

/**
 * Tabs Component
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
                        ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-500/25'
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
 * Regional Releases Page Component
 */
const RegionalReleasesPage = ({ accessToken, onShowDetails }) => {
    const [country, setCountry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState({ movies: [], tv: [] });
    const [activeTab, setActiveTab] = useState('movies');
    const [detectingLocation, setDetectingLocation] = useState(true);

    const tabs = [
        { id: 'movies', label: 'Movies', icon: Film },
        { id: 'tv', label: 'TV Shows', icon: Tv },
    ];

    // Detect country on mount
    useEffect(() => {
        const detectCountry = async () => {
            setDetectingLocation(true);
            const detected = await getCountryFromIP();
            setCountry(detected);
            setDetectingLocation(false);
        };
        detectCountry();
    }, []);

    // Fetch regional content
    const fetchContent = useCallback(async () => {
        if (!accessToken || !country) return;
        setLoading(true);

        try {
            // Fetch movies now playing in user's region
            const moviesResponse = await fetch(
                `https://api.themoviedb.org/3/movie/now_playing?region=${country.code}&page=1`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const moviesData = await moviesResponse.json();

            // Fetch TV shows airing in user's region
            const tvResponse = await fetch(
                `https://api.themoviedb.org/3/tv/on_the_air?page=1`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const tvData = await tvResponse.json();

            setContent({
                movies: moviesData.results || [],
                tv: tvData.results || []
            });
        } catch (error) {
            console.error('Failed to fetch regional content:', error);
        } finally {
            setLoading(false);
        }
    }, [accessToken, country]);

    useEffect(() => {
        if (country) {
            fetchContent();
        }
    }, [country, fetchContent]);

    // Handle manual refresh
    const handleRefresh = async () => {
        setDetectingLocation(true);
        const detected = await getCountryFromIP();
        setCountry(detected);
        setDetectingLocation(false);
    };

    const currentContent = activeTab === 'movies' ? content.movies : content.tv;

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
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-600">
                            <MapPin className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-white">Regional Releases</h1>
                            <p className="text-neutral-400 text-xs md:text-sm">Content available in your region</p>
                        </div>
                    </div>

                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {/* Country Detection Badge */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600/20 to-teal-600/20 border border-cyan-500/30 backdrop-blur-sm">
                        <Globe size={14} className="text-cyan-400" />
                        {detectingLocation ? (
                            <span className="text-sm text-white/70 flex items-center gap-2">
                                <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                                Detecting location...
                            </span>
                        ) : (
                            <span className="text-sm text-white">
                                <span className="text-cyan-400 font-medium">{country?.name}</span>
                                {country?.city && <span className="text-white/50"> • {country.city}</span>}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all text-sm"
                        disabled={detectingLocation || loading}
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    <span className="text-xs md:text-sm text-neutral-500">
                        {currentContent.length} titles
                    </span>
                </div>
            </div>

            {/* Loading State */}
            {(loading || detectingLocation) && (
                <div className="flex justify-center items-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-neutral-400">
                            {detectingLocation ? 'Detecting your location...' : `Loading ${activeTab === 'movies' ? 'movies' : 'TV shows'} for ${country?.name}...`}
                        </span>
                    </div>
                </div>
            )}

            {/* Content Grid */}
            {!loading && !detectingLocation && (
                <>
                    {currentContent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                <MapPin size={32} className="text-neutral-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No Regional Content</h3>
                            <p className="text-neutral-400 text-sm text-center max-w-md">
                                No {activeTab === 'movies' ? 'movies' : 'TV shows'} currently available in {country?.name}.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                            {currentContent.map((item) => (
                                <RegionalCard
                                    key={item.id}
                                    item={item}
                                    type={activeTab === 'movies' ? 'movie' : 'tv'}
                                    onDetails={(i, type) => onShowDetails(i, type)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default RegionalReleasesPage;
