import { useEffect, useState } from "react";
import {
  clearFavoritesRequest,
  getFavoritesRequest,
  removeFavoriteRequest,
} from "../services/api";

export default function FavoritesPage() {
  const isGuestSession = localStorage.getItem("session_mode") === "guest";
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isGuestSession) {
      setFavorites([]);
      setIsLoading(false);
      setError("");
      return undefined;
    }

    let isMounted = true;

    async function loadFavorites() {
      try {
        const favoriteMovies = await getFavoritesRequest();
        if (isMounted) {
          setFavorites(favoriteMovies);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.detail || "Favoriler yuklenemedi.");
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
  }, [isGuestSession]);

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
      setError(err?.response?.data?.detail || "Favori kaldirilamadi.");
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
            disabled={isGuestSession || favorites.length === 0 || isLoading}
          >
            Tumunu Temizle
          </button>
        </div>

        {error ? <p className="auth-message auth-error">{error}</p> : null}

        {isGuestSession ? (
          <div className="favorites-container">
            <p className="muted">
              Misafir oturumunda favoriler kapali. Favori kaydetmek ve fragman
              izlemek icin giris yapmalisin.
            </p>
          </div>
        ) : isLoading ? (
          <div className="favorites-container">
            <p className="muted">Favoriler yukleniyor...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="favorites-container">
            <p className="muted">
              Henuz favori yok. Bir filmi favoriye eklediginde burada gorunecek.
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
                    Favoriden Cikar
                  </button>

                  <button
                    className="trailer-btn"
                    type="button"
                    onClick={() => handleOpenTrailer(movie)}
                  >
                    Fragman Izle
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
