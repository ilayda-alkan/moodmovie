import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>Ruh Haline Göre Film Önerisi</h1>
        <p>
          Konuş, duygu durumun analiz edilsin ve o anki moduna en uygun
          filmleri keşfet. Akıllı öneri sistemi.
        </p>

        <Link to="/analyze" className="btn-primary hero-button">
          Hemen Dene
        </Link>
      </div>
    </section>
  );
}