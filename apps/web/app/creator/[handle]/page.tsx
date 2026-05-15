import {
  getCreatorByHandle,
  getRecommendationsByCreator,
  getSeedPlaceById,
  phaseZeroCreators,
} from "@rasa/shared";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorImage, getPlaceImage, VisualImage } from "../../../components/visual-image";

export function generateStaticParams() {
  return phaseZeroCreators.map((creator) => ({
    handle: creator.handle,
  }));
}

export default async function CreatorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const creator = getCreatorByHandle(handle);

  if (!creator) {
    notFound();
  }

  const recommendations = getRecommendationsByCreator(handle);

  return (
    <main className="creator-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/feed">Feed</Link>
          <Link href="/save">Save</Link>
          <Link href="/book">Book</Link>
        </div>
      </nav>

      <section className="creator-hero">
        <div>
          <p className="eyebrow">Creator page</p>
          <h1>@{creator.handle}</h1>
          <p className="lede">
            {creator.name} recommendations, trust score, disclosures, and bookable Hyderabad picks
            in one Phase 0 vanity page.
          </p>
        </div>
        <div className="hero-media-stack">
          <div className="visual-card">
            <VisualImage
              alt={`${creator.name} creator profile preview`}
              className="responsive-visual"
              priority
              src={getCreatorImage(creator.handle)}
            />
          </div>
          <div className="metric-row">
            <div>
              <span>Trust score</span>
              <strong>{creator.authenticityScore.toFixed(1)}</strong>
            </div>
            <div>
              <span>Recommendations</span>
              <strong>{recommendations.length}</strong>
            </div>
            <div>
              <span>City</span>
              <strong>Hyderabad</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="creator-layout">
        <aside className="creator-onboarding-panel">
          <div className="panel-heading">
            <p className="eyebrow">Onboarding</p>
            <h2>Creator basics</h2>
            <p>Phase 0 onboarding is manual: verify identity, link socials, then publish a page.</p>
          </div>
          <div className="summary-list">
            <div>
              <span>Status</span>
              <strong>Seed verified</strong>
            </div>
            <div>
              <span>Disclosure default</span>
              <strong>Required</strong>
            </div>
          </div>
          <Link className="text-link" href="/feed">
            View in feed
          </Link>
        </aside>

        <section className="creator-recommendations">
          {recommendations.map((recommendation) => {
            const place = getSeedPlaceById(recommendation.placeId);

            if (!place) {
              return null;
            }

            return (
              <article className="place-card" key={recommendation.id}>
                <VisualImage
                  alt={`${place.name} creator recommendation preview`}
                  className="card-visual"
                  src={getPlaceImage(place.id)}
                />
                <div>
                  <p className="place-area">{place.area}</p>
                  <h2>{place.name}</h2>
                  <p className="place-address">{recommendation.hook}</p>
                </div>
                <div className="tag-row">
                  <span>{recommendation.disclosure}</span>
                  <span>{recommendation.mood}</span>
                  {recommendation.isLiveTease && <span>Live tease</span>}
                </div>
                <div className="place-meta">
                  <span>{place.heroDish}</span>
                  <span>{recommendation.saves} saves</span>
                </div>
                <div className="feed-actions">
                  <Link href="/save">Save</Link>
                  <Link href="/book">Book</Link>
                </div>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
