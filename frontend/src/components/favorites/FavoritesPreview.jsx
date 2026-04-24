import SectionTitle from "../common/SectionTitle";

export default function FavoritesPreview() {
  return (
    <section className="favorites-section">
      <SectionTitle
        title="⭐ Favorilerim"
        action={<button className="btn-secondary">Tümünü Temizle</button>}
      />

      <div className="favorites-container">
        <p className="muted">
          Henüz favori yok. Bir filmi ⭐ Favoriye Ekle ile ekleyebilirsin.
        </p>
      </div>
    </section>
  );
}