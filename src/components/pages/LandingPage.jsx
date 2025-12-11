import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Play, Film, Tv, Sparkles, ArrowRight, Star,
    Calendar, Clock, Zap, Globe2, Heart, Bookmark
} from 'lucide-react';
import { ContainerScroll } from '../ui/ContainerScrollAnimation';
import { ServiceCard } from '../ui/service-card';
import DisplayCards from '../ui/display-cards';
import { Bell, PlayCircle } from 'lucide-react';

/**
 * Animated Gradient Text
 */
const GradientText = ({ children, className = "" }) => (
    <span className={`bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent ${className}`}>
        {children}
    </span>
);

/**
 * Floating Feature Card
 */
const FloatingFeatureCard = ({ icon: Icon, title, description, delay = 0, gradient }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className="relative group"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
        <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-neutral-400">{description}</p>
        </div>
    </motion.div>
);

/**
 * App Preview Content - Shows real trending titles inside the scroll container
 */
const AppPreviewContent = () => {
    const [trendingContent, setTrendingContent] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    // Get access token from environment
    const accessToken = process.env.REACT_APP_TMDB_ACCESS_TOKEN;

    useEffect(() => {
        const fetchTrending = async () => {
            if (!accessToken) {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch trending movies and TV shows
                const [moviesRes, tvRes] = await Promise.all([
                    fetch('https://api.themoviedb.org/3/trending/movie/day', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    }),
                    fetch('https://api.themoviedb.org/3/trending/tv/day', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    })
                ]);

                const moviesData = await moviesRes.json();
                const tvData = await tvRes.json();

                // Combine and shuffle for variety
                const movies = (moviesData.results || []).slice(0, 8).map(m => ({ ...m, media_type: 'movie' }));
                const tvShows = (tvData.results || []).slice(0, 8).map(t => ({ ...t, media_type: 'tv' }));

                // Interleave movies and TV shows
                const combined = [];
                const maxLen = Math.max(movies.length, tvShows.length);
                for (let i = 0; i < maxLen; i++) {
                    if (movies[i]) combined.push(movies[i]);
                    if (tvShows[i]) combined.push(tvShows[i]);
                }

                setTrendingContent(combined.slice(0, 12));
            } catch (error) {
                console.error('Failed to fetch trending:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrending();
    }, [accessToken]);

    const filteredContent = activeTab === 'all'
        ? trendingContent
        : trendingContent.filter(item => item.media_type === activeTab);

    return (
        <div className="h-full w-full p-4 md:p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="Zylmia"
                        className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover"
                    />
                    <span className="text-lg md:text-xl font-bold text-white">Zylmia</span>
                    <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600/30 to-purple-600/30 text-[10px] text-violet-300 font-medium border border-violet-500/30">
                        Today's Trending
                    </span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'movie', label: 'Movies' },
                        { id: 'tv', label: 'TV Shows' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-xs font-medium transition-all ${activeTab === tab.id
                                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                                : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
                {isLoading ? (
                    // Loading skeletons
                    [...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-white/5 animate-pulse"
                        />
                    ))
                ) : filteredContent.length > 0 ? (
                    // Real trending content
                    filteredContent.slice(0, 12).map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 * i, duration: 0.3 }}
                            className="aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden relative group cursor-pointer"
                        >
                            {/* Poster Image */}
                            {item.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                    alt={item.title || item.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-violet-600/50 to-purple-600/50 flex items-center justify-center">
                                    <Film className="w-8 h-8 text-white/50" />
                                </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                            {/* Rating Badge */}
                            <div className="absolute top-1 right-1 md:top-2 md:right-2">
                                <div className="px-1 md:px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[8px] md:text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                    <Star className="w-2 h-2 md:w-2.5 md:h-2.5 fill-amber-400" />
                                    {item.vote_average?.toFixed(1) || 'N/A'}
                                </div>
                            </div>

                            {/* Media Type Badge */}
                            <div className="absolute top-1 left-1 md:top-2 md:left-2">
                                <div className={`px-1 md:px-1.5 py-0.5 rounded text-[7px] md:text-[9px] font-semibold ${item.media_type === 'movie'
                                    ? 'bg-violet-600/80 text-violet-100'
                                    : 'bg-cyan-600/80 text-cyan-100'
                                    }`}>
                                    {item.media_type === 'movie' ? 'MOVIE' : 'TV'}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-2">
                                <h3 className="text-[9px] md:text-xs font-semibold text-white line-clamp-2 leading-tight">
                                    {item.title || item.name}
                                </h3>
                                <p className="text-[7px] md:text-[9px] text-neutral-400 mt-0.5">
                                    {new Date(item.release_date || item.first_air_date).getFullYear() || ''}
                                </p>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    // Fallback placeholders
                    [...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className={`aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-gradient-to-br ${['from-violet-600/50 to-purple-600/50', 'from-pink-600/50 to-rose-600/50', 'from-cyan-600/50 to-blue-600/50', 'from-amber-600/50 to-orange-600/50'][i % 4]
                                }`}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

/**
 * Landing Page Component
 */
const LandingPage = () => {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Clear the seen category intros when landing page is visited
    // This resets the animation state so intros will show again
    useEffect(() => {
        sessionStorage.removeItem('seenCategoryIntros');
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleEnterApp = () => {
        navigate('/movies');
    };

    const services = [
        {
            icon: Film,
            title: 'Movies',
            description: 'Discover blockbusters, classics, and hidden gems from around the world.',
            variant: 'violet',
            href: '/movies'
        },
        {
            icon: Tv,
            title: 'TV Shows',
            description: 'Binge-worthy series and limited editions, all in one place.',
            variant: 'blue',
            href: '/tvshows'
        },
        {
            icon: Sparkles,
            title: 'Anime',
            description: 'Japanese animation masterpieces and trending anime series.',
            variant: 'pink',
            href: '/anime'
        },
        {
            icon: Heart,
            title: 'K-Drama',
            description: 'Korean drama sensations that captivate audiences worldwide.',
            variant: 'emerald',
            href: '/kdrama'
        },
        {
            icon: Calendar,
            title: 'Upcoming Releases',
            description: 'Stay ahead with personalized upcoming movie recommendations.',
            variant: 'orange',
            href: '/upcoming'
        },
        {
            icon: Bookmark,
            title: 'Watchlist',
            description: 'Track your favorite shows with smart episode countdown.',
            variant: 'indigo',
            href: '/watchlist'
        },
    ];

    return (
        <div className="min-h-screen bg-[#030305] overflow-x-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-purple-950/20 to-black" />

                {/* Floating Orbs */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        x: mousePosition.x,
                        y: mousePosition.y,
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        x: -mousePosition.x,
                        y: -mousePosition.y,
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            {/* Hero Section with Scroll Animation */}
            <div className="relative z-10">
                <ContainerScroll
                    titleComponent={
                        <div className="mb-8">
                            {/* Logo */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="flex items-center justify-center gap-3 mb-8"
                            >
                                <img
                                    src="/logo.png"
                                    alt="Zylmia"
                                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-lg shadow-violet-500/30 object-cover"
                                />
                            </motion.div>

                            {/* Main Title */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
                            >
                                Welcome to <GradientText>Zylmia</GradientText>
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-8"
                            >
                                Your premium streaming companion. Discover movies, TV shows, anime, and more
                                with personalized recommendations and smart tracking.
                            </motion.p>

                            {/* CTA Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleEnterApp}
                                className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 flex items-center gap-3 mx-auto"
                            >
                                <Play className="w-5 h-5" fill="currentColor" />
                                Enter the Universe
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="flex items-center justify-center gap-8 mt-8"
                            >
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">1M+</div>
                                    <div className="text-xs text-neutral-500">Movies</div>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">500K+</div>
                                    <div className="text-xs text-neutral-500">TV Shows</div>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">∞</div>
                                    <div className="text-xs text-neutral-500">Entertainment</div>
                                </div>
                            </motion.div>
                        </div>
                    }
                >
                    <AppPreviewContent />
                </ContainerScroll>
            </div>

            {/* Features Section */}
            <div className="relative z-10 px-4 md:px-8 py-20 -mt-40">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Everything You Need, <GradientText>One Place</GradientText>
                    </h2>
                    <p className="text-neutral-400 max-w-xl mx-auto">
                        From blockbusters to hidden gems, Zylmia brings you the ultimate entertainment experience.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                        >
                            <ServiceCard
                                title={service.title}
                                description={service.description}
                                href={service.href}
                                icon={service.icon}
                                variant={service.variant}
                                onClick={() => navigate(service.href)}
                                className="min-h-[180px] backdrop-blur-xl"
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Display Cards Feature Showcase */}
            <div className="relative z-10 px-4 md:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        What You Can <GradientText>Do</GradientText>
                    </h2>
                    <p className="text-neutral-400 max-w-xl mx-auto">
                        Experience the full power of Zylmia's tracking and discovery features
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex justify-center items-center"
                >
                    <DisplayCards
                        cards={[
                            {
                                icon: <Calendar className="w-4 h-4 text-violet-300" />,
                                title: "Release Tracking",
                                description: "Never miss upcoming releases",
                                date: "Track your favorites",
                                iconClassName: "bg-violet-800",
                                titleClassName: "text-violet-400",
                                className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
                            },
                            {
                                icon: <Bell className="w-4 h-4 text-pink-300" />,
                                title: "Episode Alerts",
                                description: "New episodes, instantly notified",
                                date: "Smart countdown timers",
                                iconClassName: "bg-pink-800",
                                titleClassName: "text-pink-400",
                                className: "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
                            },
                            {
                                icon: <PlayCircle className="w-4 h-4 text-cyan-300" />,
                                title: "Latest Releases",
                                description: "Stream the newest content",
                                date: "Updated daily",
                                iconClassName: "bg-cyan-800",
                                titleClassName: "text-cyan-400",
                                className: "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
                            },
                        ]}
                    />
                </motion.div>
            </div>

            {/* Bottom CTA */}
            <div className="relative z-10 px-4 md:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-pink-600/20 border border-white/10 backdrop-blur-xl"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Explore?
                    </h2>
                    <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
                        Dive into a universe of entertainment. Start discovering your next favorite movie or show today.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEnterApp}
                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 flex items-center gap-3 mx-auto"
                    >
                        <Zap className="w-5 h-5" />
                        Start Exploring
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="relative z-10 px-4 py-8 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <img
                            src="/logo.png"
                            alt="Zylmia"
                            className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span className="text-white font-semibold">Zylmia</span>
                    </div>
                    <p className="text-sm text-neutral-500">
                        © 2024 Zylmia. Your premium streaming companion.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
