# TMDB API Service Documentation

## Setup

1. Create or update your `.env` file in the root directory with your TMDB API key:

```
REACT_APP_TMDB_API_KEY=your_actual_api_key_here
```

2. Restart your development server after adding the environment variable.

## Available Methods

The TMDB API service provides the following methods:

### `getPopularMovies()`
Fetches currently popular movies from TMDB.

```javascript
import tmdbApi from './services/tmdbApi';

const popularMovies = await tmdbApi.getPopularMovies();
```

### `discoverMovies(params)`
Fetches movies based on specified filters (used for genre-specific searches).

```javascript
const actionMovies = await tmdbApi.discoverMovies({
  with_genres: '28',
  sort_by: 'vote_average.desc'
});
```

### `getMovieDetails(movieId)`
Fetches detailed information about a specific movie by ID.

```javascript
const movieDetails = await tmdbApi.getMovieDetails(123);
```

### `searchMovies(query)`
Searches for movies by title or keyword.

```javascript
const searchResults = await tmdbApi.searchMovies('Inception');
```

### `getMovieRecommendations(movieId)`
Fetches recommendations based on a specific movie.

```javascript
const recommendations = await tmdbApi.getMovieRecommendations(123);
```

### `getUpcomingMovies()`
Fetches upcoming movies.

### `getTopRatedMovies()`
Fetches top-rated movies.

### `getNowPlayingMovies()`
Fetches currently playing movies.

### `getTrendingMovies(timeWindow)`
Fetches trending movies with optional time window ('day' or 'week').

## Error Handling

All methods include error handling and will throw errors if the API request fails:

```javascript
try {
  const movies = await tmdbApi.getPopularMovies();
  // Process movies
} catch (error) {
  console.error('Failed to fetch movies:', error.message);
}
```

## Environment Variables

The service relies on the `REACT_APP_TMDB_API_KEY` environment variable. If this variable is not set, the service will throw an error when methods are called.

## Security Considerations

Please read `API_KEY_SECURITY.md` for important information about API key security in frontend applications.