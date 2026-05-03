import { useEffect, useMemo, useState } from "react";
import {
  deleteFeedbackRequest,
  getFeedbacksRequest,
  sendFeedbackRequest,
} from "../services/api";

export default function FeedbacksPage() {
  const isGuestSession = localStorage.getItem("session_mode") === "guest";
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isGuestSession) {
      setFeedbacks([]);
      setIsLoading(false);
      setError("");
      return undefined;
    }

    let isMounted = true;

    async function loadFeedbacks() {
      try {
        const items = await getFeedbacksRequest();
        if (isMounted) {
          setFeedbacks(items);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.detail || "Feedback listesi yuklenemedi.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeedbacks();

    return () => {
      isMounted = false;
    };
  }, [isGuestSession]);

  const summary = useMemo(() => {
    return feedbacks.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.reaction === "like") acc.like += 1;
        if (item.reaction === "neutral") acc.neutral += 1;
        if (item.reaction === "dislike") acc.dislike += 1;
        return acc;
      },
      { total: 0, like: 0, neutral: 0, dislike: 0 }
    );
  }, [feedbacks]);

  async function handleReactionChange(item, nextReaction) {
    try {
      if (item.reaction === nextReaction) {
        await deleteFeedbackRequest(item.id);
        setFeedbacks((prev) => prev.filter((feedback) => feedback.id !== item.id));
        return;
      }

      const updated = await sendFeedbackRequest({
        movieId: item.movie_id,
        title: item.title,
        reaction: nextReaction,
        emotionContext: item.emotion_context,
        analysisText: item.analysis_text,
      });

      setFeedbacks((prev) =>
        prev.map((feedback) =>
          feedback.id === item.id ? { ...feedback, ...updated } : feedback
        )
      );
    } catch (err) {
      setError(err?.response?.data?.detail || "Feedback guncellenemedi.");
    }
  }

  return (
    <div className="page-section">
      <section className="feedbacks-page">
        <div className="feedbacks-hero">
          <div>
            <h1>Geri Bildirimlerim</h1>
            <p className="feedbacks-subtitle">
              Onerilen filmlere verdigin tepkileri burada takip edebilir, begeni
              durumlarini istedigin zaman degistirebilirsin.
            </p>
          </div>

          <div className="feedbacks-summary-grid">
            <div className="feedbacks-summary-card">
              <span>Toplam</span>
              <strong>{summary.total}</strong>
            </div>
            <div className="feedbacks-summary-card like">
              <span>Begendim</span>
              <strong>{summary.like}</strong>
            </div>
            <div className="feedbacks-summary-card neutral">
              <span>Notr</span>
              <strong>{summary.neutral}</strong>
            </div>
            <div className="feedbacks-summary-card dislike">
              <span>Begenmedim</span>
              <strong>{summary.dislike}</strong>
            </div>
          </div>
        </div>

        {error ? <p className="auth-message auth-error">{error}</p> : null}

        {isGuestSession ? (
          <div className="favorites-container feedbacks-empty">
            <p className="muted">
              Geri bildirim gecmisi sadece giris yapan kullanicilara acik.
            </p>
          </div>
        ) : isLoading ? (
          <div className="favorites-container">
            <p className="muted">Feedback listesi yukleniyor...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="favorites-container feedbacks-empty">
            <p className="muted">
              Henuz film geri bildirimi yok. Onerilen filmlere tepki verdiginde
              burada listelenecek.
            </p>
          </div>
        ) : (
          <div className="feedback-list">
            {feedbacks.map((item) => (
              <article key={item.id} className="feedback-item">
                <div className="feedback-item-head">
                  <div className="feedback-item-title-group">
                    <h3>{item.title}</h3>
                    {item.analysis_text ? (
                      <p className="feedback-analysis-text">
                        <span>Analiz metni</span>
                        "{item.analysis_text}"
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="feedback-reaction-panel">
                  <button
                    type="button"
                    className={`feedback-btn ${item.reaction === "like" ? "active like" : ""}`}
                    onClick={() => handleReactionChange(item, "like")}
                  >
                    <span className="feedback-icon">👍</span>
                    <span>Begendim</span>
                  </button>
                  <button
                    type="button"
                    className={`feedback-btn ${item.reaction === "neutral" ? "active neutral" : ""}`}
                    onClick={() => handleReactionChange(item, "neutral")}
                  >
                    <span className="feedback-icon">😐</span>
                    <span>Notr</span>
                  </button>
                  <button
                    type="button"
                    className={`feedback-btn ${item.reaction === "dislike" ? "active dislike" : ""}`}
                    onClick={() => handleReactionChange(item, "dislike")}
                  >
                    <span className="feedback-icon">👎</span>
                    <span>Begenmedim</span>
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
