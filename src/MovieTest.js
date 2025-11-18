import React, { useState, useEffect } from 'react';
import tmdbApi from './services/tmdbApi';

const MovieTest = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        const data = await tmdbApi.getPopularMovies();
        setMovies(data.results || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPopularMovies();
  }, []);

  if (loading) return <div>Loading popular movies...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2>Popular Movies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {movies.slice(0, 6).map(movie => (
          <div key={movie.id} className="border rounded p-2">
            <h3>{movie.title}</h3>
            <p>{movie.release_date}</p>
            <p>Rating: {movie.vote_average}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieTest;