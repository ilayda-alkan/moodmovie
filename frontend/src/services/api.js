import api from "../api/axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8001";

export function normalizeMovie(movie, index = 0) {
  const title = movie.title ?? movie.name ?? "Isimsiz Film";
  const contentId =
    movie.movie_id ??
    movie.movieId ??
    movie.id ??
    `${title.replace(/\s+/g, "-")}-${index}`;

  const fallbackTrailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${title} official trailer`
  )}`;

  return {
    id: String(contentId),
    dbId: movie.id ? String(movie.id) : null,
    title,
    genres: Array.isArray(movie.genres)
      ? movie.genres
      : typeof movie.genres === "string"
      ? movie.genres.split("|").map((item) => item.trim()).filter(Boolean)
      : [],
    trailerUrl: movie.trailerUrl ?? movie.trailer_url ?? fallbackTrailerUrl,
    raw: movie,
  };
}

export async function analyzeMoodRequest(text) {
  const response = await fetch(`${API_BASE_URL}/analyze-mood`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Duygu analizi istegi basarisiz oldu.");
  }

  return response.json();
}

export async function getFavoritesRequest() {
  const response = await api.get("/favorites");
  return Array.isArray(response.data)
    ? response.data.map((movie, index) => normalizeMovie(movie, index))
    : [];
}

export async function addFavoriteRequest(movie) {
  const payload = {
    movie_id: String(movie.id),
    title: movie.title,
    genres: Array.isArray(movie.genres) ? movie.genres : [],
    trailer_url: movie.trailerUrl ?? null,
  };

  const response = await api.post("/favorites", payload);
  return normalizeMovie(response.data);
}

export async function removeFavoriteRequest(movieId) {
  await api.delete(`/favorites/${encodeURIComponent(String(movieId))}`);
}

export async function clearFavoritesRequest() {
  await api.delete("/favorites");
}

export async function getFeedbacksRequest() {
  const response = await api.get("/feedbacks");
  return Array.isArray(response.data) ? response.data : [];
}

export async function sendFeedbackRequest({
  movieId,
  title,
  reaction,
  emotionContext,
  analysisText,
}) {
  const response = await api.post("/feedbacks", {
    movie_id: String(movieId),
    title,
    reaction,
    emotion_context: emotionContext ?? null,
    analysis_text: analysisText ?? null,
  });

  return response.data;
}

export async function getFeedbackStatsRequest() {
  const response = await api.get("/feedbacks/stats");
  return Array.isArray(response.data) ? response.data : [];
}

export async function deleteFeedbackRequest(feedbackId) {
  await api.delete(`/feedbacks/${feedbackId}`);
}
