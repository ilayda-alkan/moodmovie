// DOM elemanları
const micButton = document.getElementById("micButton");
const micStatus = document.getElementById("micStatus");
const analyzeButton = document.getElementById("analyzeButton");
const moodText = document.getElementById("moodText");
const detectedMoodEl = document.getElementById("detectedMood");
const moviesContainer = document.getElementById("moviesContainer");

const favoritesContainer = document.getElementById("favoritesContainer");
const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");

// ====== FAVORİLER (localStorage) ======
const FAVORITES_KEY = "moodmovie_favorites_v1";

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function isFavorite(movieId) {
  const favs = getFavorites();
  return favs.some((m) => String(m.movieId) === String(movieId));
}

function toggleFavorite(movie) {
  const favs = getFavorites();
  const exists = favs.some((m) => String(m.movieId) === String(movie.movieId));

  let updated;
  if (exists) {
    updated = favs.filter((m) => String(m.movieId) !== String(movie.movieId));
  } else {
    updated = [
      ...favs,
      {
        movieId: movie.movieId,
        title: movie.title,
        genres: movie.genres,
        addedAt: new Date().toISOString(),
      },
    ];
  }

  saveFavorites(updated);
  return !exists; // true => eklendi, false => çıkarıldı
}

// ====== YOUTUBE FRAGMAN ======
function openTrailer(movie) {
  const q = encodeURIComponent(`${movie.title} trailer`);
  window.open(`https://www.youtube.com/results?search_query=${q}`, "_blank");
}

// ------------------------
// 🎙 Web Speech API KISMI
// ------------------------
let recognition = null;
let isListening = false;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "tr-TR";
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening = true;
    micStatus.textContent = "Dinleniyor... Lütfen konuş.";
    micStatus.style.color = "#4ade80";
    micButton.textContent = "🛑 Durdur";
    micButton.classList.add("listening");
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript + " ";
    }
    moodText.value = transcript.trim();
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error: ", event.error);
    micStatus.textContent = "Ses tanıma hatası: " + event.error;
    micStatus.style.color = "#f97373";
  };

  recognition.onend = () => {
    isListening = false;
    micStatus.textContent = "Mikrofon beklemede";
    micStatus.style.color = "#9ca3af";
    micButton.textContent = "🎙 Konuşmaya Başla";
    micButton.classList.remove("listening");
  };
} else {
  micStatus.textContent =
    "Tarayıcın Web Speech API desteklemiyor. Lütfen Chrome ile deneyin.";
  micStatus.style.color = "#f97373";
  micButton.disabled = true;
}

micButton.addEventListener("click", () => {
  if (!recognition) return;

  if (!isListening) {
    try {
      recognition.start();
    } catch (e) {
      console.warn(e);
    }
  } else {
    recognition.stop();
  }
});

// -------------------------------
// 🧠 Duygu analiz butonu kısmı
// -------------------------------
analyzeButton.addEventListener("click", async () => {
  const text = moodText.value.trim();

  if (!text) {
    detectedMoodEl.textContent = "Lütfen önce bir şeyler yaz ya da konuş.";
    detectedMoodEl.style.color = "#f97373";
    moviesContainer.innerHTML = "";
    return;
  }

  detectedMoodEl.textContent = "Analiz ediliyor...";
  detectedMoodEl.style.color = "#9ca3af";
  moviesContainer.innerHTML = "";

  try {
    const response = await fetch("http://localhost:8000/analyze-mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error("API hatası: " + response.status);

    const data = await response.json();
    const percent = (data.confidence * 100).toFixed(1);

    detectedMoodEl.textContent =
      `${data.mood.toUpperCase()} (${data.emotion_label}, ${percent}%)`;
    detectedMoodEl.style.color = "#e5e7eb";

    renderMovies(data.movies);
  } catch (err) {
    console.error(err);
    detectedMoodEl.textContent = "Analiz sırasında bir hata oluştu.";
    detectedMoodEl.style.color = "#f97373";
  }
});

// -------------------------------
// 🎬 Film kartları
// -------------------------------
function renderMovies(movies) {
  moviesContainer.innerHTML = "";

  if (!movies || movies.length === 0) {
    moviesContainer.textContent = "Bu duygu için film bulunamadı.";
    return;
  }

  movies.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";

    const title = document.createElement("div");
    title.className = "movie-title";
    title.textContent = movie.title;

    const genre = document.createElement("div");
    genre.className = "movie-genre";
    genre.textContent = movie.genres;

    const actions = document.createElement("div");
    actions.className = "movie-actions";

    const favBtn = document.createElement("button");
    favBtn.className = "btn-like";
    favBtn.textContent = isFavorite(movie.movieId)
      ? "⭐ Favoriden Çıkar"
      : "⭐ Favoriye Ekle";

    favBtn.addEventListener("click", () => {
      const added = toggleFavorite(movie);
      favBtn.textContent = added ? "⭐ Favoriden Çıkar" : "⭐ Favoriye Ekle";
      renderFavorites();
    });

    const trailerBtn = document.createElement("button");
    trailerBtn.className = "btn-dislike";
    trailerBtn.textContent = "🎬 Fragman İzle";
    trailerBtn.addEventListener("click", () => openTrailer(movie));

    actions.appendChild(favBtn);
    actions.appendChild(trailerBtn);

    card.appendChild(title);
    card.appendChild(genre);
    card.appendChild(actions);

    moviesContainer.appendChild(card);
  });
}

// -------------------------------
// ⭐ Favoriler listesi
// -------------------------------
function renderFavorites() {
  if (!favoritesContainer) return;

  const favs = getFavorites();
  favoritesContainer.innerHTML = "";

  if (!favs || favs.length === 0) {
    favoritesContainer.innerHTML =
      `<p class="muted">Henüz favori yok. Bir filmi ⭐ Favoriye Ekle ile ekleyebilirsin.</p>`;
    return;
  }

  favs.slice().reverse().forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";

    const title = document.createElement("div");
    title.className = "movie-title";
    title.textContent = movie.title;

    const genre = document.createElement("div");
    genre.className = "movie-genre";
    genre.textContent = movie.genres;

    const actions = document.createElement("div");
    actions.className = "movie-actions";

    const trailerBtn = document.createElement("button");
    trailerBtn.className = "btn-dislike";
    trailerBtn.textContent = "🎬 Fragman İzle";
    trailerBtn.addEventListener("click", () => openTrailer(movie));

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-like";
    removeBtn.textContent = "🗑 Favoriden Kaldır";
    removeBtn.addEventListener("click", () => {
      toggleFavorite(movie);
      renderFavorites();
    });

    actions.appendChild(trailerBtn);
    actions.appendChild(removeBtn);

    card.appendChild(title);
    card.appendChild(genre);
    card.appendChild(actions);

    favoritesContainer.appendChild(card);
  });
}

if (clearFavoritesBtn) {
  clearFavoritesBtn.addEventListener("click", () => {
    localStorage.removeItem(FAVORITES_KEY);
    renderFavorites();
  });
}

renderFavorites();
