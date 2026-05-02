import { useEffect, useRef, useState } from "react";
import MoodInputCard from "../components/mood/MoodInputCard";
import MovieGrid from "../components/movies/MovieGrid";
import {
  addFavoriteRequest,
  analyzeMoodRequest,
  getFeedbacksRequest,
  getFavoritesRequest,
  normalizeMovie,
  sendFeedbackRequest,
} from "../services/api";

export default function AnalyzePage() {
  const [text, setText] = useState("");
  const [emotionResult, setEmotionResult] = useState({
    emotion: "",
    mood: "",
    primaryEmotion: "",
    intensity: "",
    confidence: null,
  });
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);
  const [error, setError] = useState("");
  const [micStatus, setMicStatus] = useState("Mikrofon beklemede");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  async function runAnalysis(inputText) {
    const analysisText = inputText.trim();

    if (!analysisText) {
      setError("Lütfen analiz için bir metin giriniz.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await analyzeMoodRequest(analysisText);

      setEmotionResult({
        emotion: data.emotion_label ?? "",
        mood: data.mood ?? "",
        primaryEmotion: data.primary_emotion ?? "",
        intensity: data.intensity ?? "",
        confidence:
          typeof data.confidence === "number"
            ? Number((data.confidence * 100).toFixed(2))
            : null,
      });

      const normalizedMovies = Array.isArray(data.movies)
        ? data.movies.map((movie, index) => normalizeMovie(movie, index))
        : [];

      setMovies(normalizedMovies);
    } catch (err) {
      setError(err.message || "Bir hata oluştu.");
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      try {
        const favoriteMovies = await getFavoritesRequest();
        const feedbacks = await getFeedbacksRequest();
        if (isMounted) {
          setFavorites(favoriteMovies);
          setFeedbackMap(
            feedbacks.reduce((acc, item) => {
              if (item.movie_id) {
                acc[item.movie_id] = item.reaction;
              }
              return acc;
            }, {})
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.detail || "Favoriler yüklenemedi.");
        }
      } finally {
        if (isMounted) {
          setIsFavoritesLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAddFavorite(movie) {
    const alreadyExists = favorites.some((fav) => fav.id === movie.id);
    if (alreadyExists) {
      return;
    }

    try {
      const savedMovie = await addFavoriteRequest(movie);
      setFavorites((prev) => [...prev, savedMovie]);
    } catch (err) {
      setError(err?.response?.data?.detail || "Favori eklenemedi.");
    }
  }

  async function handleFeedback(movie, reaction) {
    try {
      await sendFeedbackRequest({
        movieId: movie.id,
        title: movie.title,
        reaction,
        emotionContext: emotionResult.primaryEmotion || null,
        analysisText: text.trim() || null,
      });

      setFeedbackMap((prev) => ({
        ...prev,
        [movie.id]: reaction,
      }));
    } catch (err) {
      setError(err?.response?.data?.detail || "Feedback kaydedilemedi.");
    }
  }

  async function handleAnalyze() {
    await runAnalysis(text);
  }

  function handleStartListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicStatus("Tarayıcı ses tanımayı desteklemiyor");
      setError("Bu tarayıcıda sesli komut desteklenmiyor.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    setError("");

    const recognition = new SpeechRecognition();
    recognition.lang = "tr-TR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setMicStatus("Dinleniyor...");
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();

      if (transcript) {
        setText(transcript);
        void runAnalysis(transcript);
      }

      setMicStatus("Konuşma tamamlandı");
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        setMicStatus("Mikrofon izni verilmedi");
        setError("Mikrofon izni verilmedi. Tarayıcıdan izin vermelisin.");
      } else if (event.error === "no-speech") {
        setMicStatus("Ses algılanmadı");
        setError("Herhangi bir konuşma algılanmadı.");
      } else {
        setMicStatus("Mikrofon hatası");
        setError(`Sesli komut hatası: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setMicStatus((prev) =>
        prev === "Dinleniyor..." ? "Mikrofon beklemede" : prev
      );
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  return (
    <div className="analyze-layout">
      <MoodInputCard
        text={text}
        onTextChange={setText}
        onAnalyze={handleAnalyze}
        onStartListening={handleStartListening}
        emotionResult={emotionResult}
        isLoading={isLoading}
        error={error}
        micStatus={micStatus}
        isListening={isListening}
      />

      <MovieGrid
        movies={movies}
        onAddFavorite={handleAddFavorite}
        favorites={favorites}
        isFavoritesLoading={isFavoritesLoading}
        feedbackMap={feedbackMap}
        onFeedback={handleFeedback}
      />
    </div>
  );
}
