export default function MoodInputCard({
  text,
  onTextChange,
  onAnalyze,
  onStartListening,
  emotionResult,
  isLoading,
  error,
  micStatus,
  isListening,
}) {
  const hasEmotion =
    emotionResult?.primaryEmotion || emotionResult?.confidence !== null;

  return (
    <section className="analyze-panel mood-panel">
      <h2 className="panel-title">Duygunu Paylaş</h2>

      <div className="voice-row">
        <button className="voice-btn" type="button" onClick={onStartListening}>
          {isListening ? "Dinlemeyi Durdur" : "Konuş ve Analiz Et"}
        </button>
        <span className="voice-status">{micStatus}</span>
      </div>

      <label className="input-label" htmlFor="mood-text">
        Konuşmanı ya da ruh halini buraya yaz:
      </label>

      <textarea
        id="mood-text"
        className="mood-textarea"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Bugün nasıl hissediyorsun?"
      />

      <button
        className="analyze-btn"
        type="button"
        onClick={onAnalyze}
        disabled={isLoading}
      >
        {isLoading ? "Analiz Ediliyor..." : "Duygumu Analiz Et"}
      </button>

      <div className="detected-box">
        {error ? (
          <>
            <h3>Hata</h3>
            <p>{error}</p>
          </>
        ) : (
          <>
            <h3>Duygu Profili</h3>
            {hasEmotion ? (
              <>
                <p>
                  Tahmin: {emotionResult.primaryEmotion || "-"}
                  {emotionResult.confidence !== null
                    ? ` (%${emotionResult.confidence})`
                    : ""}
                </p>
                <p>
                  Yogunluk: {emotionResult.intensity || "-"}
                </p>
              </>
            ) : (
              <p>Henüz analiz yapılmadı.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
