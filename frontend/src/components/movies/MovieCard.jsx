export default function MovieCard({
  movie,
  onAddFavorite,
  isFavorite = false,
  isFavoritesLoading = false,
  feedbackReaction = "",
  onFeedback,
  canUseMovieActions = true,
}) {
  const favoriteTooltip = "Favorilere eklemek için login olman gerekiyor.";
  const trailerTooltip = "Fragman izlemek için login olman gerekiyor.";

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
          : "Tür bilgisi yok"}
      </p>

      <div className="movie-actions">
        <div
          className={`movie-action-wrap tooltip-align-left ${
            !canUseMovieActions ? "has-tooltip" : ""
          }`}
          data-tooltip={!canUseMovieActions ? favoriteTooltip : ""}
        >
          <button
            className="fav-btn"
            type="button"
            onClick={() => onAddFavorite(movie)}
            disabled={!canUseMovieActions || isFavorite || isFavoritesLoading}
          >
            {isFavoritesLoading
              ? "Yukleniyor..."
              : isFavorite
              ? "Favorilerde"
              : "Favoriye Ekle"}
          </button>
        </div>

        <div
          className={`movie-action-wrap tooltip-align-right ${
            !canUseMovieActions ? "has-tooltip" : ""
          }`}
          data-tooltip={!canUseMovieActions ? trailerTooltip : ""}
        >
          <button
            className="trailer-btn"
            type="button"
            onClick={handleTrailerOpen}
            disabled={!canUseMovieActions}
          >
            Fragman Izle
          </button>
        </div>
      </div>

      <div className="movie-feedback-row">
        <button
          type="button"
          className={`feedback-btn ${feedbackReaction === "like" ? "active like" : ""}`}
          onClick={() => onFeedback?.(movie, "like")}
          aria-label="Beğendim"
        >
          👍
        </button>
        <button
          type="button"
          className={`feedback-btn ${feedbackReaction === "neutral" ? "active neutral" : ""}`}
          onClick={() => onFeedback?.(movie, "neutral")}
          aria-label="Nötr"
        >
          😐
        </button>
        <button
          type="button"
          className={`feedback-btn ${feedbackReaction === "dislike" ? "active dislike" : ""}`}
          onClick={() => onFeedback?.(movie, "dislike")}
          aria-label="Beğenmedim"
        >
          👎
        </button>
      </div>
    </article>
  );
}
