"use client";

import {
  getSeedPlaceById,
  phaseZeroFeedRecommendations,
  savedPlacesStorageKey,
  type FeedRecommendation,
  type SavedPlaceRecord,
} from "@rasa/shared";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPlaceImage, getRouteImage, VisualImage } from "./visual-image";

function readSavedRecords() {
  const stored = window.localStorage.getItem(savedPlacesStorageKey);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as SavedPlaceRecord[];
  } catch {
    window.localStorage.removeItem(savedPlacesStorageKey);
    return [];
  }
}

function FeedCard({
  recommendation,
  savedPlaceIds,
}: {
  recommendation: FeedRecommendation;
  savedPlaceIds: Set<string>;
}) {
  const place = getSeedPlaceById(recommendation.placeId);

  if (!place) {
    return null;
  }

  const alreadySaved = savedPlaceIds.has(place.id);

  return (
    <article className={recommendation.isLiveTease ? "feed-card live-card" : "feed-card"}>
      <div className="feed-media">
        <VisualImage
          alt={`${place.name} creator recommendation`}
          className="card-visual"
          src={getPlaceImage(place.id)}
        />
        <span>{place.heroDish}</span>
      </div>
      <div className="feed-body">
        <div className="feed-card-topline">
          <span>{recommendation.mood}</span>
          <span>{recommendation.disclosure}</span>
        </div>
        <h2>{recommendation.hook}</h2>
        <p>{recommendation.note}</p>
        <div className="creator-row">
          <div>
            <strong>@{recommendation.creator.handle}</strong>
            <span>{recommendation.creator.authenticityScore.toFixed(1)} trust score</span>
          </div>
          <span>{place.area}</span>
        </div>
        <div className="feed-actions">
          <Link href={`/save`}>{alreadySaved ? "Saved" : "Save from feed"}</Link>
          <Link href={`/places`}>View place</Link>
        </div>
      </div>
      <div className="feed-stats">
        <span>{recommendation.saves} saves</span>
        <span>{recommendation.bookingIntent} booking clicks</span>
      </div>
    </article>
  );
}

export function ForYouFeed() {
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);

  useEffect(() => {
    setSaves(readSavedRecords());
  }, []);

  const savedPlaceIds = useMemo(() => new Set(saves.map((save) => save.placeId)), [saves]);
  const savedAreas = useMemo(() => new Set(saves.map((save) => save.area)), [saves]);

  const sortedFeed = useMemo(() => {
    return ([...phaseZeroFeedRecommendations] as FeedRecommendation[]).sort((left, right) => {
      const leftPlace = getSeedPlaceById(left.placeId);
      const rightPlace = getSeedPlaceById(right.placeId);
      const leftBoost = leftPlace && savedAreas.has(leftPlace.area) ? 1 : 0;
      const rightBoost = rightPlace && savedAreas.has(rightPlace.area) ? 1 : 0;

      return rightBoost - leftBoost || right.saves - left.saves;
    });
  }, [savedAreas]);

  return (
    <main className="feed-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/feed">Feed</Link>
          <Link href="/save">Save</Link>
          <Link href="/map">Map</Link>
        </div>
      </nav>

      <section className="feed-hero">
        <div>
          <p className="eyebrow">Phase 0.7</p>
          <h1>For You, but built around trust.</h1>
          <p className="lede">
            A creator-led feed that mixes recommendations, saved-area relevance, and live-fest
            teasers without pretending every post is organic.
          </p>
        </div>
        <div className="hero-media-stack">
          <div className="visual-card">
            <VisualImage
              alt="Creator discovery feed preview"
              className="responsive-visual"
              priority
              src={getRouteImage("creator")}
            />
          </div>
          <div className="metric-row">
            <div>
              <span>Feed items</span>
              <strong>{sortedFeed.length}</strong>
            </div>
            <div>
              <span>Your saves</span>
              <strong>{saves.length}</strong>
            </div>
            <div>
              <span>Live teases</span>
              <strong>{sortedFeed.filter((item) => Boolean(item.isLiveTease)).length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="feed-layout">
        <aside className="feed-context-panel">
          <div className="panel-heading">
            <p className="eyebrow">Personalization</p>
            <h2>{saves.length ? "Using your saved areas" : "Start by saving a place"}</h2>
            <p>
              {saves.length
                ? "Places near your saved areas float up first."
                : "Save a place to make this feed less generic."}
            </p>
          </div>
          <div className="tag-row">
            {Array.from(savedAreas).map((area) => (
              <span key={area}>{area}</span>
            ))}
            {savedAreas.size === 0 && <span>Hyderabad starter feed</span>}
          </div>
          <Link className="text-link" href="/save">
            Add a save
          </Link>
        </aside>

        <section className="feed-list" aria-label="For You recommendations">
          {sortedFeed.map((recommendation) => (
            <FeedCard
              key={recommendation.id}
              recommendation={recommendation}
              savedPlaceIds={savedPlaceIds}
            />
          ))}
        </section>
      </section>
    </main>
  );
}
