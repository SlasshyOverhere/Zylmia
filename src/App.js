import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Film, Tv, Sparkles, Heart, Globe2, Star, Info, X,
  ArrowRight, ChevronDown, Flame, Calendar, Users, Clock,
  Building2, Languages, DollarSign, PlayCircle, ExternalLink, TrendingUp,
  Menu
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
 * LANDING BANNER - Premium Entrance (Mobile Optimized)
 */
const LandingBanner = ({ onEnter }) => {
  const categories = Object.values(CONTENT_CATEGORIES);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-4">
      <AnimatedBackground gradient="from-neutral-950 via-violet-950/30 to-neutral-950" intensity="high" />

      <motion.div
        className="z-10 flex flex-col items-center justify-center text-center px-4 md:px-6 max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-6 md:mb-10">
          <motion.div
            className="absolute inset-0 -inset-x-16 md:-inset-x-32 -inset-y-8 md:-inset-y-16"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 blur-[60px] md:blur-[100px] opacity-40 animate-pulse" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="relative text-5xl sm:text-7xl md:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-violet-300 tracking-tight drop-shadow-2xl">
              Zylmia
            </h1>
          </motion.div>

          <motion.p
            className="text-sm sm:text-xl md:text-2xl text-neutral-400 mt-3 md:mt-6 font-light tracking-wide md:tracking-widest uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Your <span className="text-violet-400">Ultimate</span> Streaming Universe
          </motion.p>
        </div>

        <motion.div
          className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.span
                key={cat.id}
                className="px-3 md:px-5 py-1.5 md:py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs md:text-sm font-medium flex items-center gap-1.5 md:gap-2 text-white/70"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + idx * 0.1 }}
              >
                <Icon size={12} className="md:w-3.5 md:h-3.5" />
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
            className="relative group px-8 md:px-14 py-4 md:py-5 rounded-full overflow-hidden active:scale-95 transition-transform"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-full"
              style={{ backgroundSize: '200% 200%', animation: 'mesh-gradient 3s ease infinite' }}
            />
            <div className="absolute inset-[2px] bg-neutral-950/80 rounded-full backdrop-blur-sm group-hover:bg-neutral-950/60 transition-colors" />
            <span className="relative z-10 flex items-center gap-2 md:gap-3 text-white font-bold text-base md:text-lg tracking-wide">
              Enter the Universe
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </motion.span>
            </span>
          </button>
        </motion.div>

        <motion.p
          className="text-neutral-600 text-xs md:text-sm mt-6 md:mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          Stream movies, shows, and more — all in one place
        </motion.p>
      </motion.div>

      {/* Hide scroll indicator on mobile */}
      <motion.div
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 hidden md:flex"
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
 * NAVIGATION SIDEBAR - Premium Glassmorphism with Mobile Support
 */
const NavigationSidebar = ({ isOpen, onToggle, isMobile }) => {
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

  const handleNavClick = () => {
    if (isMobile) {
      onToggle(false);
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => onToggle(false)}
        />
      )}

      <motion.aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 flex flex-col",
          isMobile && !isOpen && "-translate-x-full"
        )}
        animate={{
          width: isMobile ? 280 : (isOpen ? 280 : 80),
          x: isMobile ? (isOpen ? 0 : -280) : 0
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => !isMobile && onToggle(true)}
        onMouseLeave={() => !isMobile && onToggle(false)}
      >
        <div className="absolute inset-0 bg-[#0a0a12]/95 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/10 via-white/5 to-white/10" />
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-violet-600/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="p-4 md:p-5 border-b border-white/5">
            <Link to="/home" className="flex items-center gap-3 group" onClick={handleNavClick}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white w-5 h-5" />
                </div>
              </div>
              <motion.div
                animate={{ opacity: (isMobile || isOpen) ? 1 : 0, x: (isMobile || isOpen) ? 0 : -10 }}
                transition={{ duration: 0.2, delay: isOpen ? 0.1 : 0 }}
                className="overflow-hidden"
              >
                <span className="font-bold text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-violet-200">
                  Zylmia
                </span>
                <p className="text-[10px] text-neutral-500 -mt-0.5">Streaming Universe</p>
              </motion.div>
            </Link>
          </div>

          <nav className="flex-1 px-2 md:px-3 py-3 md:py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const colors = accentColors[item.accent];

              return (
                <Link key={item.path} to={item.path} className="block relative" onClick={handleNavClick}>
                  <motion.div
                    className={cn(
                      "flex items-center gap-3 px-3 md:px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? `bg-gradient-to-r ${colors.bg} ${colors.border} border`
                        : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent active:bg-white/10"
                    )}
                    whileHover={!isMobile ? { x: 4 } : {}}
                    whileTap={{ scale: 0.98 }}
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
                      animate={{ opacity: (isMobile || isOpen) ? 1 : 0, x: (isMobile || isOpen) ? 0 : -10, width: (isMobile || isOpen) ? 'auto' : 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn("font-medium whitespace-nowrap overflow-hidden text-sm md:text-base", isActive ? "text-white" : "")}
                    >
                      {item.label}
                    </motion.span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Credits Section */}
          <div className="p-2 md:p-3 border-t border-white/5">
            <div className={cn("flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 transition-all", (isMobile || isOpen) ? "justify-start" : "justify-center")}>
              <Heart className="w-4 h-4 text-pink-500 flex-shrink-0 animate-pulse" fill="currentColor" />
              <motion.div
                animate={{ opacity: (isMobile || isOpen) ? 1 : 0, x: (isMobile || isOpen) ? 0 : -10, width: (isMobile || isOpen) ? 'auto' : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-[10px] md:text-[11px] text-neutral-500">Created by</p>
                <p className="text-xs font-medium bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
                  Suman Patgiri
                </p>
              </motion.div>
            </div>
            <motion.div animate={{ opacity: (isMobile || isOpen) ? 1 : 0 }} transition={{ duration: 0.2 }} className="px-3 md:px-4 pb-2">
              <span className="text-[9px] text-neutral-600">v1.0.0 • Zylmia</span>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

/**
 * CONTENT CARD - Optimized for Performance
 * Uses CSS transitions instead of Framer Motion for smooth scrolling
 */
const ContentCard = React.memo(({ item, rank, onDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onDetails(item);
  }, [item, onDetails]);

  return (
    <div
      className="group relative aspect-[2/3] cursor-pointer content-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div
        className={cn(
          "relative w-full h-full rounded-lg overflow-hidden transition-transform duration-200 ease-out",
          isHovered && "scale-[1.03] -translate-y-1"
        )}
      >
        {/* Gradient Border on Hover */}
        <div
          className={cn(
            "absolute -inset-[1px] rounded-lg transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(236, 72, 153, 0.4) 50%, rgba(6, 182, 212, 0.6) 100%)'
          }}
        />

        <div className="absolute inset-[1px] rounded-lg overflow-hidden bg-neutral-900">
          {/* Rank Badge */}
          <div className="absolute top-1.5 left-1.5 z-20">
            <div className="px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-600/90 to-purple-600/90 backdrop-blur-sm text-[9px] font-bold text-white border border-white/20">
              #{rank}
            </div>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-1.5 right-1.5 z-20">
            <div className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-bold text-amber-400 flex items-center gap-0.5 border border-white/10">
              <Star size={8} fill="currentColor" />
              <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>

          {/* Image */}
          <img
            src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Image'}
            alt={item.title || item.name || 'Poster'}
            className={cn(
              "w-full h-full object-cover transition-transform duration-300",
              isHovered && "scale-110"
            )}
            loading="lazy"
            decoding="async"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/342x513?text=No+Image'; }}
          />

          {/* Hover Overlay */}
          <div
            className={cn(
              "absolute inset-0 z-15 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col items-center justify-end p-2 transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <h3 className="text-white font-semibold text-center text-[10px] line-clamp-2 mb-1 drop-shadow-lg">
              {item.title || item.name}
            </h3>
            <span className="text-neutral-400 text-[8px] mb-1">
              {(item.release_date || item.first_air_date)?.split('-')[0] || 'TBA'}
            </span>
            <button className="flex items-center gap-1 text-[9px] text-white/90 hover:text-white transition-colors px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10">
              <Info size={9} /> Details
            </button>
          </div>

          {/* Default Title Overlay */}
          {!isHovered && (
            <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black via-black/70 to-transparent flex items-end p-1.5 z-10">
              <h3 className="text-white font-medium text-[9px] line-clamp-2 leading-tight">
                {item.title || item.name}
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if item.id changes
  return prevProps.item.id === nextProps.item.id && prevProps.rank === nextProps.rank;
});

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
              className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-2 rounded-full bg-black/50 text-white/80 hover:text-white active:bg-black/70 transition-all"
            >
              <X size={18} className="md:w-5 md:h-5" />
            </button>

            <div className="overflow-y-auto max-h-[95vh] md:max-h-[90vh]">
              {/* Backdrop */}
              <div className="relative h-48 md:h-96">
                <img
                  src={item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : 'https://via.placeholder.com/1280x720?text=No+Image'}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative -mt-20 md:-mt-32 px-4 md:px-6 pb-6 md:pb-8">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {/* Poster - Hidden on small mobile, shown on larger screens */}
                  <div className="hidden sm:block w-24 md:w-48 flex-shrink-0">
                    <img
                      src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Image'}
                      alt={item.title || item.name}
                      className="w-full rounded-lg md:rounded-xl shadow-2xl border border-white/10"
                    />
                  </div>

                  <div className="flex-1">
                    <h1 className="text-xl md:text-4xl font-bold text-white mb-2">
                      {item.title || item.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <Badge>
                        <Star size={10} className="md:w-3 md:h-3" fill="currentColor" />
                        {item.vote_average?.toFixed(1) || 'N/A'}
                      </Badge>
                      {(item.release_date || item.first_air_date) && (
                        <Badge variant="secondary">
                          <Calendar size={10} className="md:w-3 md:h-3" />
                          {(item.release_date || item.first_air_date)?.split('-')[0]}
                        </Badge>
                      )}
                      {details?.runtime && (
                        <Badge variant="secondary">
                          <Clock size={10} className="md:w-3 md:h-3" />
                          {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                        </Badge>
                      )}
                    </div>

                    {details?.genres && (
                      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
                        {details.genres.slice(0, 4).map(genre => (
                          <span key={genre.id} className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs bg-white/10 text-white/80 border border-white/10">
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-neutral-300 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-4 md:line-clamp-none">
                      {item.overview || 'No overview available.'}
                    </p>

                    <div className="flex flex-wrap gap-2 md:gap-3">
                      <Button onClick={handleWatch} className="flex-1 md:flex-none justify-center py-3 md:py-3">
                        <PlayCircle size={16} className="md:w-[18px] md:h-[18px]" />
                        Watch Now
                      </Button>
                    </div>

                    {/* Credits */}
                    {credits?.cast?.length > 0 && (
                      <div className="mt-5 md:mt-8">
                        <h3 className="text-sm md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
                          <Users size={14} className="md:w-[18px] md:h-[18px]" /> Cast
                        </h3>
                        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                          {credits.cast.slice(0, 6).map(person => (
                            <div key={person.id} className="flex-shrink-0 w-16 md:w-20 text-center">
                              <img
                                src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://via.placeholder.com/185x278?text=No+Photo'}
                                alt={person.name}
                                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover mx-auto mb-1.5 md:mb-2 border-2 border-white/10"
                              />
                              <p className="text-[10px] md:text-xs text-white font-medium truncate">{person.name}</p>
                              <p className="text-[8px] md:text-[10px] text-neutral-500 truncate">{person.character}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Production Companies */}
                    {details?.production_companies?.length > 0 && (
                      <div className="mt-4 md:mt-6">
                        <h3 className="text-xs md:text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <Building2 size={12} className="md:w-3.5 md:h-3.5" /> Production
                        </h3>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {details.production_companies.slice(0, 3).map(company => (
                            <span key={company.id} className="px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs bg-white/5 text-neutral-400 border border-white/5">
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
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">
          Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">Zylmia</span>
        </h1>
        <p className="text-neutral-400 text-sm md:text-base">Discover your next favorite entertainment</p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8 md:mb-12">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={`/${cat.id}`}
              className={`group relative p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br ${cat.gradient} overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl`}
            >
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
              <div className="relative z-10">
                <Icon className="w-7 h-7 md:w-10 md:h-10 text-white mb-2 md:mb-4" />
                <h3 className="text-white font-bold text-sm md:text-lg">{cat.label}</h3>
                <p className="text-white/70 text-[10px] md:text-xs mt-0.5 md:mt-1 line-clamp-2">{cat.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Trending Movies */}
      <section className="mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
            <Flame className="text-orange-500 w-5 h-5 md:w-6 md:h-6" /> Trending Movies
          </h2>
          <Link to="/movies" className="text-violet-400 hover:text-violet-300 text-xs md:text-sm flex items-center gap-1">
            View All <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3">
          {trendingMovies.slice(0, 10).map((movie, idx) => (
            <ContentCard key={movie.id} item={movie} rank={idx + 1} onDetails={onShowDetails} />
          ))}
        </div>
      </section>

      {/* Trending TV */}
      <section className="mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
            <TrendingUp className="text-cyan-500 w-5 h-5 md:w-6 md:h-6" /> Trending TV Shows
          </h2>
          <Link to="/tvshows" className="text-violet-400 hover:text-violet-300 text-xs md:text-sm flex items-center gap-1">
            View All <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3">
          {trendingTV.slice(0, 10).map((show, idx) => (
            <ContentCard key={show.id} item={show} rank={idx + 1} onDetails={onShowDetails} />
          ))}
        </div>
      </section>
    </div>
  );
};

/**
 * CATEGORY PAGE with Infinite Scroll
 */
const CategoryPage = ({ category, accessToken, onShowDetails }) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [trendingItems, setTrendingItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);
  const isLoadingRef = useRef(false);

  const config = CONTENT_CATEGORIES[category];

  // Fetch content for a specific page
  const fetchContent = useCallback(async (pageNum, isInitial = false) => {
    if (!accessToken || !config) return;
    if (isLoadingRef.current && !isInitial) return;

    isLoadingRef.current = true;

    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let url = `https://api.themoviedb.org/3${config.endpoints.discover}?sort_by=popularity.desc&page=${pageNum}`;

      if (config.params) {
        Object.entries(config.params).forEach(([key, value]) => {
          url += `&${key}=${value}`;
        });
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await response.json();

      const newResults = data.results || [];
      const totalPagesFromApi = data.total_pages || 1;

      // TMDB limits to 500 pages max
      const effectiveTotalPages = Math.min(totalPagesFromApi, 500);

      setHasMore(pageNum < effectiveTotalPages);

      if (isInitial) {
        setContent(newResults);
        setTrendingItems(newResults.slice(0, 10));
        setPage(pageNum);
      } else {
        // Append new content, avoiding duplicates
        setContent(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const uniqueNew = newResults.filter(item => !existingIds.has(item.id));
          return [...prev, ...uniqueNew];
        });
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch category content:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [accessToken, config]);

  // Initial fetch - load first 3 pages for better initial content
  useEffect(() => {
    const loadInitialContent = async () => {
      if (!accessToken || !config) return;

      setContent([]);
      setPage(1);
      setHasMore(true);
      setLoading(true);
      isLoadingRef.current = true;

      try {
        // Fetch first 3 pages in parallel for faster initial load
        const pagesToFetch = [1, 2, 3];
        const responses = await Promise.all(
          pagesToFetch.map(p => {
            let url = `https://api.themoviedb.org/3${config.endpoints.discover}?sort_by=popularity.desc&page=${p}`;
            if (config.params) {
              Object.entries(config.params).forEach(([key, value]) => {
                url += `&${key}=${value}`;
              });
            }
            return fetch(url, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
          })
        );

        const dataArray = await Promise.all(responses.map(r => r.json()));

        // Combine all results
        const allResults = [];
        const seenIds = new Set();

        dataArray.forEach(data => {
          (data.results || []).forEach(item => {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id);
              allResults.push(item);
            }
          });
        });

        const totalPagesFromApi = dataArray[0]?.total_pages || 1;
        const effectiveTotalPages = Math.min(totalPagesFromApi, 500);

        setContent(allResults);
        setTrendingItems(allResults.slice(0, 10));
        setPage(3);
        setHasMore(3 < effectiveTotalPages);
      } catch (error) {
        console.error('Failed to fetch initial content:', error);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadInitialContent();
  }, [category, accessToken, config]);

  // Intersection Observer for infinite scroll with debounce
  useEffect(() => {
    if (showIntro || loading) return;

    let debounceTimer = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
          // Debounce to prevent rapid firing
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (!isLoadingRef.current && hasMore) {
              const nextPage = page + 1;
              fetchContent(nextPage, false);
            }
          }, 100);
        }
      },
      {
        root: null,
        rootMargin: '400px', // Load earlier for smoother experience
        threshold: 0
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [showIntro, loading, hasMore, page, fetchContent]);

  // Manual load more handler
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !isLoadingRef.current) {
      const nextPage = page + 1;
      fetchContent(nextPage, false);
    }
  };

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
          className="p-3 md:p-6"
        >
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4 mb-2">
              <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${config.gradient}`}>
                <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-white">{config.label}</h1>
                <p className="text-neutral-400 text-xs md:text-sm">{config.description}</p>
              </div>
            </div>
            <div className="mt-2 md:mt-3 flex items-center gap-3 md:gap-4">
              <span className="text-xs md:text-sm text-neutral-500">
                {content.length} titles loaded
              </span>
              {hasMore && (
                <span className="text-[10px] md:text-xs text-violet-400/70 flex items-center gap-1">
                  <ChevronDown size={10} className="animate-bounce md:w-3 md:h-3" />
                  More available
                </span>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-16 md:py-20">
              <div className="flex flex-col items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-neutral-400 text-sm md:text-base">Loading content...</span>
              </div>
            </div>
          )}

          {/* Content Grid */}
          {!loading && (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
                {content.map((item, idx) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    rank={idx + 1}
                    onDetails={(i) => onShowDetails(i, config.type)}
                  />
                ))}
              </div>

              {/* Load More Section */}
              <div ref={loadMoreRef} className="mt-8">
                {loadingMore && (
                  <div className="flex justify-center items-center py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-neutral-400 text-sm">Loading more...</span>
                    </div>
                  </div>
                )}

                {/* Load More Button - always visible when there's more content */}
                {!loadingMore && hasMore && (
                  <div className="flex justify-center py-8">
                    <button
                      onClick={handleLoadMore}
                      className="group relative px-8 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-[1px] bg-neutral-900/90 rounded-xl group-hover:bg-neutral-900/70 transition-colors" />
                      <span className="relative z-10 flex items-center gap-2 text-white font-medium">
                        <ChevronDown size={18} />
                        Load More Titles
                      </span>
                    </button>
                  </div>
                )}

                {/* End of content */}
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
      )}
    </>
  );
};

/**
 * APP LAYOUT - Mobile Responsive
 */
const AppLayout = ({ children, accessToken }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Mobile Header with Menu Toggle */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a12]/90 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 active:bg-white/10"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-violet-200">
                Zylmia
              </span>
            </div>
            <div className="w-9" /> {/* Spacer for center alignment */}
          </div>
        </div>
      )}

      <NavigationSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} isMobile={isMobile} />
      <main
        className={cn(
          "relative z-10 transition-all duration-300",
          isMobile ? "pt-14" : "" // Add padding for mobile header
        )}
        style={{ marginLeft: isMobile ? 0 : (sidebarOpen ? 280 : 80) }}
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