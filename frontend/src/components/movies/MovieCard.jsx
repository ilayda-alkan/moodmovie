export default function MovieCard({
  movie,
  onAddFavorite,
  isFavorite = false,
  isFavoritesLoading = false,
  feedbackReaction = "",
  onFeedback,
}) {
  function handleTrailerOpen() {
    if (!movie.trailerUrl) return;
    window.open(movie.trailerUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <article className={`movie-card ${isFavorite ? "movie-card-favorite" : ""}`}>
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
          onClick={() => onAddFavorite(movie)}
          disabled={isFavorite || isFavoritesLoading}
        >
          {isFavoritesLoading
            ? "Yukleniyor..."
            : isFavorite
            ? "Favorilerde"
            : "Favoriye Ekle"}
        </button>

        <button
          className="trailer-btn"
          type="button"
          onClick={handleTrailerOpen}
        >
          Fragman Izle
        </button>
      </div>

      <div className="movie-feedback-row">
        <button
          type="button"
          className={`feedback-btn ${feedbackReaction === "like" ? "active like" : ""}`}
          onClick={() => onFeedback?.(movie, "like")}
          aria-label="Begendim"
        >
          👍
        </button>
        <button
          type="button"
          className={`feedback-btn ${feedbackReaction === "neutral" ? "active neutral" : ""}`}
          onClick={() => onFeedback?.(movie, "neutral")}
          aria-label="Notr"
        >
          😐
        </button>
        <button
          type="button"
          className={`feedback-btn ${feedbackReaction === "dislike" ? "active dislike" : ""}`}
          onClick={() => onFeedback?.(movie, "dislike")}
          aria-label="Begenmedim"
        >
          👎
        </button>
      </div>
    </article>
  );
}
