import { hyderabadSeedPlaces, seedPlaceAreas, seedPlaceCount } from "@rasa/shared";
import { getPlaceImage, getRouteImage, VisualImage } from "../../components/visual-image";

const priceBandLabels = {
  budget: "Budget",
  mid: "Mid",
  premium: "Premium",
  luxury: "Luxury",
};

export default function PlacesPage() {
  return (
    <main className="places-shell">
      <section className="places-hero">
        <div>
          <p className="eyebrow">Phase 0.4</p>
          <h1>Hyderabad seed places</h1>
          <p className="lede">
            The first place database is intentionally small, typed, and founder-editable. These
            records power early saves, map pins, creator recommendations, and booking fallbacks.
          </p>
        </div>
        <div className="hero-media-stack">
          <div className="visual-card">
            <VisualImage
              alt="Hyderabad restaurant table preview"
              className="responsive-visual"
              priority
              src={getRouteImage("discovery")}
            />
          </div>
          <div className="metric-row">
            <div>
              <span>Places</span>
              <strong>{seedPlaceCount}</strong>
            </div>
            <div>
              <span>Areas</span>
              <strong>{seedPlaceAreas.length}</strong>
            </div>
            <div>
              <span>City</span>
              <strong>Hyderabad</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="places-grid" aria-label="Seed places">
        {hyderabadSeedPlaces.map((place) => (
          <article className="place-card" key={place.id}>
            <VisualImage
              alt={`${place.name} dining preview`}
              className="card-visual"
              src={getPlaceImage(place.id)}
            />
            <div>
              <p className="place-area">{place.area}</p>
              <h2>{place.name}</h2>
              <p className="place-address">{place.address}</p>
            </div>
            <div className="place-meta">
              <span>{priceBandLabels[place.priceBand]}</span>
              <span>{place.heroDish}</span>
            </div>
            <div className="tag-row">
              {place.cuisines.map((cuisine) => (
                <span key={cuisine}>{cuisine}</span>
              ))}
            </div>
            <div className="tag-row muted-tags">
              {place.vibeTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p className="coordinates">
              {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
