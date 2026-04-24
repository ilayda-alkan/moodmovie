const steps = [
  {
    id: 1,
    title: "Konuş",
    text: "Mikrofonla ya da metin yazarak o anki ruh halini paylaş.",
  },
  {
    id: 2,
    title: "Duygu Analizi",
    text: "Sistem duygunu analiz eder ve baskın duygunu belirler.",
  },
  {
    id: 3,
    title: "Film Önerisi",
    text: "Moduna uygun filmler sana özel olarak listelenir.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="how-it-works-section">
      <h2>Nasıl Çalışır?</h2>

      <div className="how-grid">
        {steps.map((step) => (
          <article key={step.id} className="how-card">
            <div className="how-badge">{step.id}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}