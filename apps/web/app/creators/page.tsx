import { phaseZeroCreators } from "@rasa/shared";
import Link from "next/link";
import { getCreatorImage, getRouteImage, VisualImage } from "../../components/visual-image";

export default function CreatorsPage() {
  return (
    <main className="creator-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/feed">Feed</Link>
          <Link href="/creators">Creators</Link>
          <Link href="/book">Book</Link>
        </div>
      </nav>

      <section className="creator-hero">
        <div>
          <p className="eyebrow">Phase 0.10</p>
          <h1>Creator vanity pages</h1>
          <p className="lede">
            Seed creator profiles that can become `rasa.in/@handle` pages for public attribution.
          </p>
        </div>
        <div className="hero-media-stack">
          <div className="visual-card">
            <VisualImage
              alt="Creator dashboard preview"
              className="responsive-visual"
              priority
              src={getRouteImage("creator")}
            />
          </div>
          <div className="metric-row">
            <div>
              <span>Creators</span>
              <strong>{phaseZeroCreators.length}</strong>
            </div>
            <div>
              <span>Manual KYC</span>
              <strong>Phase 0</strong>
            </div>
            <div>
              <span>Pages</span>
              <strong>Live</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="places-grid">
        {phaseZeroCreators.map((creator) => (
          <article className="place-card" key={creator.handle}>
            <VisualImage
              alt={`${creator.name} creator preview`}
              className="card-visual"
              src={getCreatorImage(creator.handle)}
            />
            <div>
              <p className="place-area">Trust score {creator.authenticityScore.toFixed(1)}</p>
              <h2>@{creator.handle}</h2>
              <p className="place-address">{creator.name}</p>
            </div>
            <Link className="text-link" href={`/creator/${creator.handle}`}>
              Open page
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
