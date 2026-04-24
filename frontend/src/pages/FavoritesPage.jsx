import { useEffect, useState } from "react";
import {
  clearFavoritesRequest,
  getFavoritesRequest,
  removeFavoriteRequest,
} from "../services/api";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      try {
        const favoriteMovies = await getFavoritesRequest();
        if (isMounted) {
          setFavorites(favoriteMovies);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.detail || "Favoriler yüklenemedi.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleClearFavorites() {
    try {
      await clearFavoritesRequest();
      setFavorites([]);
    } catch (err) {
      setError(err?.response?.data?.detail || "Favoriler temizlenemedi.");
    }
  }

  async function handleRemoveFavorite(id) {
    try {
      await removeFavoriteRequest(id);
      setFavorites((prev) => prev.filter((movie) => movie.id !== id));
    } catch (err) {
      setError(err?.response?.data?.detail || "Favori kaldırılamadı.");
    }
  }

  function handleOpenTrailer(movie) {
    const fallbackTrailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${movie.title} official trailer`
    )}`;

    const trailerUrl = movie.trailerUrl || fallbackTrailerUrl;
    window.open(trailerUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="page-section">
      <section className="favorites-section">
        <div className="section-title">
          <h2>Favorilerim</h2>
          <button
            className="btn-secondary"
            type="button"
            onClick={handleClearFavorites}
            disabled={favorites.length === 0 || isLoading}
          >
            Tümünü Temizle
          </button>
        </div>

        {error ? <p className="auth-message auth-error">{error}</p> : null}

        {isLoading ? (
          <div className="favorites-container">
            <p className="muted">Favoriler yükleniyor...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="favorites-container">
            <p className="muted">
              Henüz favori yok. Bir filmi favoriye eklediğinde burada
              görünecek.
            </p>
          </div>
        ) : (
          <div className="movies-grid">
            {favorites.map((movie) => (
              <article key={movie.id} className="movie-card">
                <h3 className="movie-title">{movie.title}</h3>

                <p className="movie-genre">
                  {Array.isArray(movie.genres) && movie.genres.length > 0
                    ? movie.genres.join("|")
                    : "Tur bilgisi yok"}
                </p>

                <div className="movie-actions">
                  <button
                    className="fav-btn"
                    type="button"
                    onClick={() => handleRemoveFavorite(movie.id)}
                  >
                    Favoriden Çıkar
                  </button>

                  <button
                    className="trailer-btn"
                    type="button"
                    onClick={() => handleOpenTrailer(movie)}
                  >
                    Fragman İzle
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
