// TMDB API Service
// Note: This service uses environment variables loaded at build time.
// IMPORTANT: This approach does NOT completely hide the API key from users.
// The API key will still be accessible to users through browser dev tools
// as it becomes part of the JavaScript bundle served to the browser.

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Check if API key is available
if (!API_KEY) {
  console.warn('TMDB API key not found. Please set REACT_APP_TMDB_API_KEY in your .env file.');
}

// Generic function to make API requests
const makeRequest = async (endpoint) => {
  if (!API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  const url = `${BASE_URL}${endpoint}&api_key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error making API request:', error);
    throw error;
  }
};

// Service functions for various TMDB endpoints
const tmdbApi = {
  // Get popular movies
  getPopularMovies: async () => {
    return makeRequest('/movie/popular?language=en-US&page=1');
  },

  // Discover movies with filters (like in the original app)
  discoverMovies: async (params = {}) => {
    // Build query string from params
    const queryParams = new URLSearchParams({
      language: 'en-US',
      page: '1',
      ...params
    });

    return makeRequest(`/discover/movie?${queryParams.toString()}`);
  },

  // Get movie details by ID
  getMovieDetails: async (movieId) => {
    return makeRequest(`/movie/${movieId}?language=en-US`);
  },

  // Search for movies
  searchMovies: async (query) => {
    return makeRequest(`/search/movie?query=${encodeURIComponent(query)}&language=en-US`);
  },

  // Get movie recommendations
  getMovieRecommendations: async (movieId) => {
    return makeRequest(`/movie/${movieId}/recommendations?language=en-US`);
  },

  // Get upcoming movies
  getUpcomingMovies: async () => {
    return makeRequest('/movie/upcoming?language=en-US&page=1');
  },

  // Get top rated movies
  getTopRatedMovies: async () => {
    return makeRequest('/movie/top_rated?language=en-US&page=1');
  },

  // Get now playing movies
  getNowPlayingMovies: async () => {
    return makeRequest('/movie/now_playing?language=en-US&page=1');
  },

  // Get trending movies
  getTrendingMovies: async (timeWindow = 'week') => {
    return makeRequest(`/trending/movie/${timeWindow}?language=en-US`);
  }
};

export default tmdbApi;