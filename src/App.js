import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Film, Tv, Sparkles, Heart, Globe2, Star, Info, X,
  ArrowRight, ChevronDown, Flame, Calendar, Users, Clock,
  Building2, Languages, DollarSign, PlayCircle, ExternalLink, TrendingUp,
  Menu, Pin, Bookmark, MapPin
} from 'lucide-react';
import PageIntroAnimation from './components/ui/page-intro-animation';
import DetailIntroAnimation from './components/ui/detail-intro-animation';
import LatestReleasesPage from './components/pages/LatestReleasesPage';
import UpcomingReleasesPage from './components/pages/UpcomingReleasesPage';
import WatchlistPage, { isPinned, togglePin, getWatchlist } from './components/pages/WatchlistPage';
import RegionalReleasesPage from './components/pages/RegionalReleasesPage';
import LandingPage from './components/pages/LandingPage';
import { FloatingDock } from './components/ui/FloatingDock';
import { HeroSection } from './components/ui/HeroSection';
import { BentoGrid, BentoGridItem } from './components/ui/BentoGrid';
import { ContentCard } from './components/ui/ContentCard';
import { ContentDetailModal } from './components/ui/ContentDetailModal';
import { PWAInstallBanner } from './components/ui/PWAComponents';
import { syncWatchlistWithSW, setupServiceWorkerListener, checkForNewEpisodes } from './utils/notificationService';
import { cn } from './utils/cn';

/**
 * UTILITY FUNCTIONS
 */


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




/**
 * CONTENT CARD - Premium 3D Design
 * Features: 3D tilt effect, glassmorphism, smooth animations, larger readable text
 */




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
    <div className="pb-20">
      <HeroSection />

      <div className="p-4 md:p-8 relative z-10 -mt-20">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 px-4">Explore the Universe</h2>

        {/* Bento Grid Categories */}
        <BentoGrid className="mb-12">
          {categories.slice(0, 3).map((cat, i) => (
            <BentoGridItem
              key={cat.id}
              title={cat.label}
              description={cat.description}
              href={`/${cat.id}`}
              icon={<cat.icon className="h-4 w-4 text-neutral-500" />}
              className={i === 0 || i === 3 ? "md:col-span-2" : ""}
              header={
                <div className={`flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br ${cat.gradient} opacity-50`} />
              }
            />
          ))}
          {categories.slice(3).map((cat, i) => (
            <BentoGridItem
              key={cat.id}
              title={cat.label}
              description={cat.description}
              href={`/${cat.id}`}
              icon={<cat.icon className="h-4 w-4 text-neutral-500" />}
              className={i === 0 ? "md:col-span-2" : ""}
              header={
                <div className={`flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br ${cat.gradient} opacity-50`} />
              }
            />
          ))}
        </BentoGrid>

        {/* Trending Movies */}
        <section className="mb-8 md:mb-12 px-4">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
              <Flame className="text-orange-500 w-5 h-5 md:w-6 md:h-6" /> Trending Movies
            </h2>
            <Link to="/movies" className="text-violet-400 hover:text-violet-300 text-xs md:text-sm flex items-center gap-1">
              View All <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {trendingMovies.slice(0, 10).map((movie, idx) => (
              <ContentCard key={movie.id} item={movie} rank={idx + 1} onDetails={onShowDetails} />
            ))}
          </div>
        </section>

        {/* Trending TV */}
        <section className="mb-8 md:mb-12 px-4">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
              <TrendingUp className="text-cyan-500 w-5 h-5 md:w-6 md:h-6" /> Trending TV Shows
            </h2>
            <Link to="/tvshows" className="text-violet-400 hover:text-violet-300 text-xs md:text-sm flex items-center gap-1">
              View All <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {trendingTV.slice(0, 10).map((show, idx) => (
              <ContentCard key={show.id} item={show} rank={idx + 1} onDetails={onShowDetails} />
            ))}
          </div>
        </section>
      </div>
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
  // Check if intro was already seen for this category in this session
  const [showIntro, setShowIntro] = useState(() => {
    const seenIntros = sessionStorage.getItem('seenCategoryIntros');
    if (seenIntros) {
      const seen = JSON.parse(seenIntros);
      return !seen.includes(category);
    }
    return true;
  });
  const [trendingItems, setTrendingItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);
  const isLoadingRef = useRef(false);

  const config = CONTENT_CATEGORIES[category];

  // Mark intro as seen when it's dismissed
  const handleEnterCategory = useCallback(() => {
    // Save to sessionStorage that this category's intro has been seen
    const seenIntros = sessionStorage.getItem('seenCategoryIntros');
    const seen = seenIntros ? JSON.parse(seenIntros) : [];
    if (!seen.includes(category)) {
      seen.push(category);
      sessionStorage.setItem('seenCategoryIntros', JSON.stringify(seen));
    }
    setShowIntro(false);
  }, [category]);

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
            onEnter={handleEnterCategory}
            onCardClick={(item) => {
              handleEnterCategory();
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
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
  const dockItems = [
    { title: 'Home', icon: <img src="/logo.png" alt="Zylmia" className="h-full w-full rounded-full object-cover" />, href: '/home' },
    { title: 'Latest', icon: <Clock className="h-full w-full text-neutral-300" />, href: '/latest' },
    { title: 'Upcoming', icon: <Calendar className="h-full w-full text-neutral-300" />, href: '/upcoming' },
    { title: 'Watchlist', icon: <Pin className="h-full w-full text-neutral-300" />, href: '/watchlist' },
    { title: 'Movies', icon: <Film className="h-full w-full text-neutral-300" />, href: '/movies' },
    { title: 'TV Shows', icon: <Tv className="h-full w-full text-neutral-300" />, href: '/tvshows' },
    { title: 'Anime', icon: <Sparkles className="h-full w-full text-neutral-300" />, href: '/anime' },
    { title: 'K-Drama', icon: <Heart className="h-full w-full text-neutral-300" />, href: '/kdrama' },
  ];

  return (
    <div className="min-h-screen relative pb-24 md:pb-0">
      <AnimatedBackground />

      <main className="relative z-10">
        {children}
      </main>

      <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-center">
        <div className="pointer-events-auto">
          <FloatingDock items={dockItems} />
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN APP COMPONENT
 */
export default function App() {
  const [accessToken] = useState(() => process.env.REACT_APP_TMDB_ACCESS_TOKEN || '');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Setup service worker communication for notifications
  useEffect(() => {
    // Sync watchlist with service worker on app load
    syncWatchlistWithSW();

    // Setup listener for service worker requests
    setupServiceWorkerListener(() => {
      syncWatchlistWithSW();
    });

    // Check for new episodes periodically when app is open
    const watchlist = getWatchlist();
    if (accessToken && watchlist.length > 0) {
      checkForNewEpisodes(accessToken, watchlist);
    }

    // Sync watchlist whenever localStorage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'zylmia_watchlist') {
        syncWatchlistWithSW();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [accessToken]);

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


  // Wrapper component for pages that need AppLayout
  const AppPage = ({ children }) => (
    <AppLayout accessToken={accessToken}>
      {children}
      <ContentDetailModal
        item={selectedItem}
        type={selectedType}
        isOpen={showModal}
        onClose={handleCloseModal}
        accessToken={accessToken}
      />
    </AppLayout>
  );

  return (
    <BrowserRouter>
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      <Routes>
        {/* Landing Page - Standalone without layout */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />

        {/* App Routes - With layout and floating dock */}
        <Route path="/latest" element={<AppPage><LatestReleasesPage accessToken={accessToken} onShowDetails={handleShowDetails} /></AppPage>} />
        <Route path="/upcoming" element={<AppPage><UpcomingReleasesPage accessToken={accessToken} onShowDetails={handleShowDetails} /></AppPage>} />
        <Route path="/regional" element={<AppPage><RegionalReleasesPage accessToken={accessToken} onShowDetails={handleShowDetails} /></AppPage>} />
        <Route path="/watchlist" element={<AppPage><WatchlistPage accessToken={accessToken} onShowDetails={handleShowDetails} /></AppPage>} />
        <Route path="/movies" element={<AppPage><CategoryPage category="movies" accessToken={accessToken} onShowDetails={handleShowDetails} /></AppPage>} />
        <Route path="/tvshows" element={<AppPage><CategoryPage category="tvshows" accessToken={accessToken} onShowDetails={handleShowDetails} /></AppPage>} />
        <Route path="/anime" element={<AppPage><CategoryPage category="anime" accessToken={accessToken} onShowDetails={handleShowDetails} /></AppPage>} />
        <Route path="/kdrama" element={<AppPage><CategoryPage category="kdrama" accessToken={accessToken} onShowDetails={handleShowDetails} /></AppPage>} />
        <Route path="/jdrama" element={<AppPage><CategoryPage category="jdrama" accessToken={accessToken} onShowDetails={handleShowDetails} /></AppPage>} />
      </Routes>
    </BrowserRouter>
  );
}