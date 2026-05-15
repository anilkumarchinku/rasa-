"use client";

import {
  authenticityScoreWeights,
  bookingIntentStorageKey,
  getRecommendationsByCreator,
  phaseZeroCreators,
  savedPlacesStorageKey,
  verifiedReviewsStorageKey,
  type BookingIntentRecord,
  type SavedPlaceRecord,
  type VerifiedReviewRecord,
} from "@rasa/shared";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackRasaEvent } from "../lib/analytics";
import { getCreatorImage, HeroMedia, VisualImage } from "./visual-image";

function readJsonArray<T>(key: string) {
  const stored = window.localStorage.getItem(key);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as T[];
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
}

function scoreComponent(value: number, weight: number) {
  return (value * weight) / 100;
}

export function AuthenticityScoreDashboard() {
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);
  const [bookings, setBookings] = useState<BookingIntentRecord[]>([]);
  const [reviews, setReviews] = useState<VerifiedReviewRecord[]>([]);

  useEffect(() => {
    setSaves(readJsonArray<SavedPlaceRecord>(savedPlacesStorageKey));
    setBookings(readJsonArray<BookingIntentRecord>(bookingIntentStorageKey));
    setReviews(readJsonArray<VerifiedReviewRecord>(verifiedReviewsStorageKey));
    trackRasaEvent("page_view", { route: "/creators/trust" });
  }, []);

  const rows = useMemo(() => {
    return phaseZeroCreators.map((creator, index) => {
      const recommendations = getRecommendationsByCreator(creator.handle);
      const creatorSaves = saves.filter((save) => save.creatorHandle === creator.handle);
      const creatorBookings = bookings.filter(
        (booking) => booking.creatorHandle === creator.handle,
      );
      const creatorPlaceIds = new Set(
        recommendations.map((recommendation) => recommendation.placeId),
      );
      const creatorReviews = reviews.filter((review) => creatorPlaceIds.has(review.placeId));
      const avgRating =
        creatorReviews.reduce((sum, review) => sum + review.rating, 0) /
        Math.max(1, creatorReviews.length);

      const preRecommendationVisits = Math.min(1, 0.76 + index * 0.04);
      const disclosureCompliance = recommendations.every(
        (recommendation) => recommendation.disclosure,
      )
        ? 1
        : 0.7;
      const followThrough = creatorSaves.length
        ? Math.min(1, creatorBookings.length / creatorSaves.length + 0.35)
        : 0.62;
      const outcomeMatch = creatorReviews.length ? Math.max(0, (avgRating - 3) / 2) : 0.72;
      const negativeHonesty = creator.handle === "oldcitybites" ? 0.86 : 0.58 + index * 0.05;

      const computedScore =
        (scoreComponent(preRecommendationVisits, authenticityScoreWeights.preRecommendationVisits) +
          scoreComponent(disclosureCompliance, authenticityScoreWeights.disclosureCompliance) +
          scoreComponent(followThrough, authenticityScoreWeights.followThrough) +
          scoreComponent(outcomeMatch, authenticityScoreWeights.outcomeMatch) +
          scoreComponent(negativeHonesty, authenticityScoreWeights.negativeHonesty)) *
        10;

      return {
        creator,
        recommendations: recommendations.length,
        saves: creatorSaves.length,
        bookings: creatorBookings.length,
        reviews: creatorReviews.length,
        computedScore: Math.min(10, computedScore),
        components: {
          preRecommendationVisits,
          disclosureCompliance,
          followThrough,
          outcomeMatch,
          negativeHonesty,
        },
      };
    });
  }, [bookings, reviews, saves]);

  const medianScore = rows.length
    ? [...rows].sort((left, right) => left.computedScore - right.computedScore)[
        Math.floor(rows.length / 2)
      ].computedScore
    : 0;

  return (
    <main className="trust-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/creators">Creators</Link>
          <Link href="/creators/trust">Trust</Link>
          <Link href="/reviews">Reviews</Link>
        </div>
      </nav>

      <section className="trust-hero">
        <div>
          <p className="eyebrow">Phase 1.5</p>
          <h1>Authenticity Score v1.</h1>
          <p className="lede">
            A transparent scorecard for creator trust: pre-visits, disclosure, follow-through, diner
            outcome match, and negative honesty.
          </p>
        </div>
        <HeroMedia alt="Creator trust scoring preview" imageKey="trust">
          <div className="metric-row">
            <div>
              <span>Creators</span>
              <strong>{rows.length}</strong>
            </div>
            <div>
              <span>Median score</span>
              <strong>{medianScore.toFixed(1)}</strong>
            </div>
            <div>
              <span>Weights</span>
              <strong>5</strong>
            </div>
          </div>
        </HeroMedia>
      </section>

      <section className="trust-grid">
        {rows.map((row) => (
          <article className="trust-card" key={row.creator.handle}>
            <div className="trust-card-header">
              <VisualImage
                alt={`${row.creator.name} trust card preview`}
                className="creator-avatar-visual"
                src={getCreatorImage(row.creator.handle)}
              />
              <div>
                <span>@{row.creator.handle}</span>
                <h2>{row.creator.name}</h2>
              </div>
              <strong>{row.computedScore.toFixed(1)}</strong>
            </div>
            <div className="score-bars">
              {Object.entries(row.components).map(([key, value]) => (
                <div key={key}>
                  <span>{key.replace(/([A-Z])/g, " $1")}</span>
                  <div>
                    <i style={{ width: `${Math.round(value * 100)}%` }} />
                  </div>
                  <em>{Math.round(value * 100)}%</em>
                </div>
              ))}
            </div>
            <div className="place-meta">
              <span>{row.recommendations} recs</span>
              <span>{row.saves} saves</span>
              <span>{row.bookings} bookings</span>
              <span>{row.reviews} reviews</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
