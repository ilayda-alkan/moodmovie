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

const MOOD_TEXT_MAX_LENGTH = 200;
const EMOTION_WORDS = [
  "agladim",
  "aglamak",
  "ask",
  "biktim",
  "bunaldim",
  "canim",
  "cok",
  "duygu",
  "dusun",
  "endise",
  "gergin",
  "heyecan",
  "hisset",
  "huzun",
  "iyi",
  "keder",
  "kork",
  "kotu",
  "mutlu",
  "mutsuz",
  "neseli",
  "ofke",
  "ozle",
  "rahat",
  "sakin",
  "sevin",
  "sinir",
  "stres",
  "uzgun",
  "yalniz",
  "yorgun",
];

function normalizeForValidation(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function getMoodTextValidationError(value) {
  const normalized = normalizeForValidation(value);
  const letters = normalized.match(/[a-z]/g) ?? [];
  const words = normalized.match(/[a-z]{2,}/g) ?? [];
  const uniqueLetters = new Set(letters);
  const hasEmotionWord = EMOTION_WORDS.some((word) => normalized.includes(word));
  const repeatedCharacters = /(.)\1{4,}/.test(normalized);

  if (letters.length < 8 || words.length < 2) {
    return "Lütfen duygunu anlatan en az bir iki kelimelik anlamlı bir metin yaz.";
  }

  if (uniqueLetters.size < 4 || repeatedCharacters) {
    return "Bu metin anlamlı görünmüyor. Lütfen o anki ruh halini kısaca anlat.";
  }

  if (!hasEmotionWord && words.length < 4) {
    return "Duygu analizi için nasıl hissettiğini anlatan bir cümle yazmalısın.";
  }

  return "";
}

export default function AnalyzePage() {
  const isGuestSession = localStorage.getItem("session_mode") === "guest";
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

    const validationError = getMoodTextValidationError(analysisText);
    if (validationError) {
      setError(validationError);
      setMovies([]);
      setEmotionResult({
        emotion: "",
        mood: "",
        primaryEmotion: "",
        intensity: "",
        confidence: null,
      });
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
        const feedbacks = await getFeedbacksRequest();
        const favoriteMovies = isGuestSession ? [] : await getFavoritesRequest();
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
  }, [isGuestSession]);

  async function handleAddFavorite(movie) {
    if (isGuestSession) {
      return;
    }

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

  function handleTextChange(value) {
    setText(value.slice(0, MOOD_TEXT_MAX_LENGTH));
  }

  function handleGuestFeedbackSubmit() {
    window.location.reload();
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
        const limitedTranscript = transcript.slice(0, MOOD_TEXT_MAX_LENGTH);
        setText(limitedTranscript);
        void runAnalysis(limitedTranscript);
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
        onTextChange={handleTextChange}
        maxLength={MOOD_TEXT_MAX_LENGTH}
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
        canUseMovieActions={!isGuestSession}
        showGuestSubmit={isGuestSession && movies.length > 0}
        onGuestSubmit={handleGuestFeedbackSubmit}
      />
    </div>
  );
}
