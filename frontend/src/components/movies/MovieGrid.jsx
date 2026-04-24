import MovieCard from "./MovieCard.jsx";

export default function MovieGrid({
  movies,
  onAddFavorite,
  favorites = [],
  isFavoritesLoading = false,
  feedbackMap = {},
  onFeedback,
}) {
  return (
    <section className="analyze-panel movies-panel">
      <h2 className="panel-title">Önerilen Filmler</h2>
      <p className="panel-subtitle">
        Duygu analizi yapıldıktan sonra sana özel film önerileri burada
        listelenecek.
      </p>

      {movies.length === 0 ? (
        <div className="detected-box">
          <p>Henüz film önerisi yok. Önce analiz yap.</p>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => {
            const isFavorite = favorites.some((fav) => fav.id === movie.id);

            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                onAddFavorite={onAddFavorite}
                isFavorite={isFavorite}
                isFavoritesLoading={isFavoritesLoading}
                feedbackReaction={feedbackMap[movie.id] || ""}
                onFeedback={onFeedback}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
