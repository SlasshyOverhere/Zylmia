import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Film, Tv, Sparkles, Heart, Globe2, Star, Info, X,
  ArrowRight, ChevronDown, Flame, Calendar, Users, Clock,
  Building2, Languages, DollarSign, PlayCircle, ExternalLink, TrendingUp
} from 'lucide-react';
import PageIntroAnimation from './components/ui/page-intro-animation';
import DetailIntroAnimation from './components/ui/detail-intro-animation';

/**
 * UTILITY FUNCTIONS
 */
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

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

/**
 * CONTENT CATEGORIES CONFIGURATION
 */
const CONTENT_CATEGORIES = {
  movies: {
    id: 'movies',
    label: 'Movies',
    icon: Film,
    type: 'movie',
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    description: 'Blockbusters, classics, and hidden gems',
    endpoints: {
      trending: '/trending/movie/day',
      discover: '/discover/movie'
    }
  },
  tvshows: {
    id: 'tvshows',
    label: 'TV Shows',
    icon: Tv,
    type: 'tv',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    description: 'Binge-worthy series and limited editions',
    endpoints: {
      trending: '/trending/tv/day',
      discover: '/discover/tv'
    }
  },
  anime: {
    id: 'anime',
    label: 'Anime',
    icon: Sparkles,
    type: 'tv',
    gradient: 'from-pink-600 via-rose-600 to-fuchsia-600',
    description: 'Japanese animation masterpieces',
    params: { with_genres: '16', with_original_language: 'ja' },
    endpoints: {
      trending: '/discover/tv',
      discover: '/discover/tv'
    }
  },
  kdrama: {
    id: 'kdrama',
    label: 'K-Drama',
    icon: Heart,
    type: 'tv',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    description: 'Korean drama sensations',
    params: { with_original_language: 'ko' },
    endpoints: {
      trending: '/discover/tv',
      discover: '/discover/tv'
    }
  },
  jdrama: {
    id: 'jdrama',
    label: 'J-Drama',
    icon: Globe2,
    type: 'tv',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    description: 'Japanese drama excellence',
    params: { with_original_language: 'ja', without_genres: '16' },
    endpoints: {
      trending: '/discover/tv',
      discover: '/discover/tv'
    }
  }
};

/**
 * BASIC UI COMPONENTS
 */
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

/**
 * ANIMATED BACKGROUND - Premium Mesh Gradient
 */
const AnimatedBackground = ({ gradient = 'from-violet-950 via-purple-950 to-indigo-950', intensity = 'normal' }) => {
  const intensityConfig = {
    subtle: { orbOpacity: 0.1, gridOpacity: 0.02 },
    normal: { orbOpacity: 0.2, gridOpacity: 0.03 },
    high: { orbOpacity: 0.3, gridOpacity: 0.05 }
  };
  const config = intensityConfig[intensity] || intensityConfig.normal;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#030305]" />
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
        style={{
          backgroundSize: '400% 400%',
          animation: 'mesh-gradient 20s ease infinite'
        }}
      />

      <motion.div
        className="absolute top-1/4 left-1/5 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)',
          filter: 'blur(80px)',
          opacity: config.orbOpacity
        }}
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
          filter: 'blur(70px)',
          opacity: config.orbOpacity
        }}
        animate={{ x: [0, -40, 30, 0], y: [0, 30, -30, 0], scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <motion.div
        className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
          filter: 'blur(60px)',
          opacity: config.orbOpacity
        }}
        animate={{ x: [0, 25, -35, 0], y: [0, -25, 35, 0], scale: [1, 1.2, 0.85, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)'
        }}
      />
    </div>
  );
};

/**
 * LANDING BANNER - Premium Entrance
 */
const LandingBanner = ({ onEnter }) => {
  const categories = Object.values(CONTENT_CATEGORIES);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
      <AnimatedBackground gradient="from-neutral-950 via-violet-950/30 to-neutral-950" intensity="high" />

      <motion.div
        className="z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-10">
          <motion.div
            className="absolute inset-0 -inset-x-32 -inset-y-16"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 blur-[100px] opacity-40 animate-pulse" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="relative text-7xl md:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-violet-300 tracking-tight drop-shadow-2xl">
              Zylmia
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-neutral-400 mt-6 font-light tracking-widest uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Your <span className="text-violet-400">Ultimate</span> Streaming Universe
          </motion.p>
        </div>

        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.span
                key={cat.id}
                className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium flex items-center gap-2 text-white/70"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + idx * 0.1 }}
              >
                <Icon size={14} />
                {cat.label}
              </motion.span>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-full blur-lg opacity-50 animate-pulse" />
          <button
            onClick={onEnter}
            className="relative group px-14 py-5 rounded-full overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-full"
              style={{ backgroundSize: '200% 200%', animation: 'mesh-gradient 3s ease infinite' }}
            />
            <div className="absolute inset-[2px] bg-neutral-950/80 rounded-full backdrop-blur-sm group-hover:bg-neutral-950/60 transition-colors" />
            <span className="relative z-10 flex items-center gap-3 text-white font-bold text-lg tracking-wide">
              Enter the Universe
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </span>
          </button>
        </motion.div>

        <motion.p
          className="text-neutral-600 text-sm mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          Stream movies, shows, and more — all in one place
        </motion.p>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
          animate={{ borderColor: ['rgba(255,255,255,0.2)', 'rgba(139,92,246,0.4)', 'rgba(255,255,255,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1.5 h-3 bg-violet-400 rounded-full"
            animate={{ y: [0, 12, 0], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

/**
 * NAVIGATION SIDEBAR - Premium Glassmorphism
 */
const NavigationSidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Home', icon: Home, accent: 'violet' },
    { path: '/movies', label: 'Movies', icon: Film, accent: 'violet' },
    { path: '/tvshows', label: 'TV Shows', icon: Tv, accent: 'cyan' },
    { path: '/anime', label: 'Anime', icon: Sparkles, accent: 'pink' },
    { path: '/kdrama', label: 'K-Drama', icon: Heart, accent: 'emerald' },
    { path: '/jdrama', label: 'J-Drama', icon: Globe2, accent: 'amber' },
  ];

  const accentColors = {
    violet: { bg: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', text: 'text-violet-400', glow: 'rgba(139, 92, 246, 0.3)' },
    cyan: { bg: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'rgba(6, 182, 212, 0.3)' },
    pink: { bg: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30', text: 'text-pink-400', glow: 'rgba(236, 72, 153, 0.3)' },
    emerald: { bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.3)' },
    amber: { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.3)' },
  };

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full z-50 flex flex-col"
      animate={{ width: isOpen ? 280 : 80 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => onToggle(true)}
      onMouseLeave={() => onToggle(false)}
    >
      <div className="absolute inset-0 bg-[#0a0a12]/90 backdrop-blur-2xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/10 via-white/5 to-white/10" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-violet-600/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="p-5 border-b border-white/5">
          <Link to="/home" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="text-white w-5 h-5" />
              </div>
            </div>
            <motion.div
              animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -10 }}
              transition={{ duration: 0.2, delay: isOpen ? 0.1 : 0 }}
              className="overflow-hidden"
            >
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-violet-200">
                Zylmia
              </span>
              <p className="text-[10px] text-neutral-500 -mt-0.5">Streaming Universe</p>
            </motion.div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const colors = accentColors[item.accent];

            return (
              <Link key={item.path} to={item.path} className="block relative">
                <motion.div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                    isActive
                      ? `bg-gradient-to-r ${colors.bg} ${colors.border} border`
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                      style={{ background: `linear-gradient(to bottom, ${colors.glow}, transparent)` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? colors.text : "text-neutral-500")} />
                  <motion.span
                    animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -10, width: isOpen ? 'auto' : 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn("font-medium whitespace-nowrap overflow-hidden", isActive ? "text-white" : "")}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Credits Section */}
        <div className="p-3 border-t border-white/5">
          <div className={cn("flex items-center gap-2 px-4 py-3 transition-all", isOpen ? "justify-start" : "justify-center")}>
            <Heart className="w-4 h-4 text-pink-500 flex-shrink-0 animate-pulse" fill="currentColor" />
            <motion.div
              animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -10, width: isOpen ? 'auto' : 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-[11px] text-neutral-500">Created by</p>
              <p className="text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
                Suman Patgiri
              </p>
            </motion.div>
          </div>
          <motion.div animate={{ opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.2 }} className="px-4 pb-2">
            <span className="text-[9px] text-neutral-600">v1.0.0 • Zylmia</span>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
};

/**
 * CONTENT CARD - 3D Premium Card with Click Handler
 */
const ContentCard = ({ item, rank, onDetails }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  }, []);

  const rotateX = isHovered ? (mousePosition.y - 0.5) * -15 : 0;
  const rotateY = isHovered ? (mousePosition.x - 0.5) * 15 : 0;

  return (
    <motion.div
      ref={cardRef}
      className="group relative aspect-[2/3] cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setMousePosition({ x: 0.5, y: 0.5 }); }}
      onMouseMove={handleMouseMove}
      onClick={() => onDetails(item)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-full rounded-xl overflow-hidden"
        animate={{ rotateX, rotateY, scale: isHovered ? 1.02 : 1, y: isHovered ? -8 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className={cn("absolute -inset-[1px] rounded-xl opacity-0 transition-opacity duration-300", isHovered && "opacity-100")}
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(236, 72, 153, 0.4) 50%, rgba(6, 182, 212, 0.6) 100%)',
            backgroundSize: '200% 200%',
            animation: isHovered ? 'mesh-gradient 3s ease infinite' : 'none'
          }}
        />

        <div className="absolute inset-[1px] rounded-xl overflow-hidden bg-neutral-900">
          {isHovered && (
            <div
              className="absolute inset-0 pointer-events-none opacity-60 z-10"
              style={{ background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)` }}
            />
          )}

          <div className="absolute top-2 left-2 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg blur opacity-50" />
              <div className="relative px-2 py-0.5 rounded-lg bg-gradient-to-r from-violet-600/90 to-purple-600/90 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 shadow-lg">
                #{rank}
              </div>
            </div>
          </div>

          <div className="absolute top-2 right-2 z-20">
            <div className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center gap-1 border border-white/10 shadow-lg">
              <Star size={9} fill="currentColor" />
              <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>

          <img
            src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Image'}
            alt={item.title || item.name || 'Poster'}
            className={cn("w-full h-full object-cover transition-all duration-500", isHovered && "scale-110 brightness-75")}
            loading="lazy"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/342x513?text=No+Image'; }}
          />

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-15 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col items-center justify-end p-3"
              >
                <motion.h3
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  className="text-white font-semibold text-center text-xs line-clamp-2 mb-2 drop-shadow-lg"
                >
                  {item.title || item.name}
                </motion.h3>
                <motion.span
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-neutral-400 text-[9px] mb-2"
                >
                  {(item.release_date || item.first_air_date)?.split('-')[0] || 'TBA'}
                </motion.span>
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-[10px] text-white/90 hover:text-white transition-all px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 hover:border-white/20">
                    <Info size={10} /> Details
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isHovered && (
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black via-black/70 to-transparent flex items-end p-2 z-10">
              <h3 className="text-white font-medium text-[10px] line-clamp-2 leading-tight">
                {item.title || item.name}
              </h3>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-4 rounded-full bg-violet-600/40 blur-xl opacity-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

/**
 * CONTENT DETAIL MODAL
 */
const ContentDetailModal = ({ item, type, isOpen, onClose, accessToken }) => {
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-neutral-900/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 transition-all"
            >
              <X size={20} />
            </button>

            <div className="overflow-y-auto max-h-[90vh]">
              {/* Backdrop */}
              <div className="relative h-72 md:h-96">
                <img
                  src={item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : 'https://via.placeholder.com/1280x720?text=No+Image'}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative -mt-32 px-6 pb-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-32 md:w-48 flex-shrink-0">
                    <img
                      src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Image'}
                      alt={item.title || item.name}
                      className="w-full rounded-xl shadow-2xl border border-white/10"
                    />
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {item.title || item.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge>
                        <Star size={12} fill="currentColor" className="text-amber-400" />
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
                    </div>

                    {details?.genres && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {details.genres.map(genre => (
                          <span key={genre.id} className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/80 border border-white/10">
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                      {item.overview || 'No overview available.'}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleWatch}>
                        <PlayCircle size={18} />
                        Watch Now
                      </Button>
                    </div>

                    {/* Credits */}
                    {credits?.cast?.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Users size={18} /> Cast
                        </h3>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {credits.cast.slice(0, 8).map(person => (
                            <div key={person.id} className="flex-shrink-0 w-20 text-center">
                              <img
                                src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x278?text=No+Photo'}
                                alt={person.name}
                                className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-white/10"
                              />
                              <p className="text-xs text-white font-medium truncate">{person.name}</p>
                              <p className="text-[10px] text-neutral-500 truncate">{person.character}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Production Companies */}
                    {details?.production_companies?.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <Building2 size={14} /> Production
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {details.production_companies.slice(0, 5).map(company => (
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

/**
 * HOME PAGE
 */
const HomePage = ({ accessToken, onShowDetails }) => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const fetchData = async () => {
      try {
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

        setTrendingMovies(moviesData.results || []);
        setTrendingTV(tvData.results || []);
      } catch (error) {
        console.error('Failed to fetch trending:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  const categories = Object.values(CONTENT_CATEGORIES);

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">Zylmia</span>
        </h1>
        <p className="text-neutral-400">Discover your next favorite entertainment</p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={`/${cat.id}`}
              className={`group relative p-6 rounded-2xl bg-gradient-to-br ${cat.gradient} overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
            >
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
              <div className="relative z-10">
                <Icon className="w-10 h-10 text-white mb-4" />
                <h3 className="text-white font-bold text-lg">{cat.label}</h3>
                <p className="text-white/70 text-xs mt-1">{cat.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Trending Movies */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Flame className="text-orange-500" /> Trending Movies
          </h2>
          <Link to="/movies" className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {trendingMovies.slice(0, 10).map((movie, idx) => (
            <ContentCard key={movie.id} item={movie} rank={idx + 1} onDetails={onShowDetails} />
          ))}
        </div>
      </section>

      {/* Trending TV */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="text-cyan-500" /> Trending TV Shows
          </h2>
          <Link to="/tvshows" className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {trendingTV.slice(0, 10).map((show, idx) => (
            <ContentCard key={show.id} item={show} rank={idx + 1} onDetails={onShowDetails} />
          ))}
        </div>
      </section>
    </div>
  );
};

/**
 * CATEGORY PAGE
 */
const CategoryPage = ({ category, accessToken, onShowDetails }) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [trendingItems, setTrendingItems] = useState([]);

  const config = CONTENT_CATEGORIES[category];

  useEffect(() => {
    if (!accessToken || !config) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `https://api.themoviedb.org/3${config.endpoints.discover}?sort_by=popularity.desc`;

        if (config.params) {
          Object.entries(config.params).forEach(([key, value]) => {
            url += `&${key}=${value}`;
          });
        }

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await response.json();
        setContent(data.results || []);
        setTrendingItems(data.results?.slice(0, 10) || []);
      } catch (error) {
        console.error('Failed to fetch category content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, accessToken, config]);

  if (!config) return <div className="p-8 text-white">Category not found</div>;

  const Icon = config.icon;

  return (
    <>
      <AnimatePresence>
        {showIntro && trendingItems.length > 0 && (
          <PageIntroAnimation
            categoryLabel={config.label}
            categoryDescription={config.description}
            gradient={config.gradient}
            trendingItems={trendingItems}
            onEnter={() => setShowIntro(false)}
            onCardClick={(item) => {
              setShowIntro(false);
              onShowDetails(item, config.type);
            }}
          />
        )}
      </AnimatePresence>

      {!showIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8"
        >
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient}`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{config.label}</h1>
                <p className="text-neutral-400">{config.description}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {content.map((item, idx) => (
              <ContentCard
                key={item.id}
                item={item}
                rank={idx + 1}
                onDetails={(i) => onShowDetails(i, config.type)}
              />
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
};

/**
 * APP LAYOUT
 */
const AppLayout = ({ children, accessToken }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <NavigationSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      <main
        className="relative z-10 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 280 : 80 }}
      >
        {children}
      </main>
    </div>
  );
};

/**
 * MAIN APP COMPONENT
 */
export default function App() {
  const [accessToken] = useState(() => process.env.REACT_APP_TMDB_ACCESS_TOKEN || '');
  const [showLanding, setShowLanding] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleShowDetails = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setSelectedType(null);
  };

  if (showLanding) {
    return <LandingBanner onEnter={() => setShowLanding(false)} />;
  }

  return (
    <BrowserRouter>
      <AppLayout accessToken={accessToken}>
        <Routes>
          <Route path="/" element={<HomePage accessToken={accessToken} onShowDetails={handleShowDetails} />} />
          <Route path="/home" element={<HomePage accessToken={accessToken} onShowDetails={handleShowDetails} />} />
          <Route path="/movies" element={<CategoryPage category="movies" accessToken={accessToken} onShowDetails={handleShowDetails} />} />
          <Route path="/tvshows" element={<CategoryPage category="tvshows" accessToken={accessToken} onShowDetails={handleShowDetails} />} />
          <Route path="/anime" element={<CategoryPage category="anime" accessToken={accessToken} onShowDetails={handleShowDetails} />} />
          <Route path="/kdrama" element={<CategoryPage category="kdrama" accessToken={accessToken} onShowDetails={handleShowDetails} />} />
          <Route path="/jdrama" element={<CategoryPage category="jdrama" accessToken={accessToken} onShowDetails={handleShowDetails} />} />
        </Routes>

        <ContentDetailModal
          item={selectedItem}
          type={selectedType}
          isOpen={showModal}
          onClose={handleCloseModal}
          accessToken={accessToken}
        />
      </AppLayout>
    </BrowserRouter>
  );
}