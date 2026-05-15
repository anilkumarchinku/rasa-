"use client";

import {
  bookingIntentStorageKey,
  getSeedPlaceById,
  hyderabadSeedPlaces,
  savedPlacesStorageKey,
  type BookingIntentRecord,
  type SavedPlaceRecord,
} from "@rasa/shared";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackRasaEvent } from "../lib/analytics";
import { getPlaceImage, getRouteImage, VisualImage } from "./visual-image";

function createIntentId() {
  return `booking-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

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

function getProvider(url?: string): BookingIntentRecord["provider"] {
  if (!url) return "manual";
  if (url.includes("eazydiner")) return "eazydiner";
  if (url.includes("zomato")) return "zomato";
  return "manual";
}

export function BookingFlow() {
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);
  const [intents, setIntents] = useState<BookingIntentRecord[]>([]);

  useEffect(() => {
    setSaves(readJsonArray<SavedPlaceRecord>(savedPlacesStorageKey));
    setIntents(readJsonArray<BookingIntentRecord>(bookingIntentStorageKey));
    trackRasaEvent("page_view", { route: "/book" });
  }, []);

  const savedPlaceIds = useMemo(() => new Set(saves.map((save) => save.placeId)), [saves]);

  const bookablePlaces = useMemo(() => {
    return hyderabadSeedPlaces.map((place) => {
      const save = saves.find((record) => record.placeId === place.id);
      return { place, save };
    });
  }, [saves]);

  function recordBookingIntent(placeId: string, savedRecord?: SavedPlaceRecord) {
    const place = getSeedPlaceById(placeId);

    if (!place) {
      return;
    }

    const affiliateUrl =
      place.bookingUrl ??
      `https://www.google.com/search?q=${encodeURIComponent(`${place.name} ${place.area} Hyderabad booking`)}`;

    const nextIntent: BookingIntentRecord = {
      id: createIntentId(),
      placeId: place.id,
      placeName: place.name,
      affiliateUrl,
      source: "affiliate",
      provider: getProvider(affiliateUrl),
      creatorHandle: savedRecord?.creatorHandle,
      savedRecordId: savedRecord?.id,
      createdAt: new Date().toISOString(),
    };

    const nextIntents = [nextIntent, ...intents];
    window.localStorage.setItem(bookingIntentStorageKey, JSON.stringify(nextIntents));
    setIntents(nextIntents);
    trackRasaEvent("booking_intent_created", {
      route: "/book",
      placeId: nextIntent.placeId,
      placeName: nextIntent.placeName,
      creatorHandle: nextIntent.creatorHandle,
      metadata: {
        provider: nextIntent.provider,
        source: nextIntent.source,
        hasSavedRecord: Boolean(nextIntent.savedRecordId),
      },
    });
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="booking-shell">
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

      <section className="booking-hero">
        <div>
          <p className="eyebrow">Phase 0.8</p>
          <h1>Book from the save, keep the attribution.</h1>
          <p className="lede">
            Phase 0 booking is affiliate-first: Rasa records intent, preserves creator context, and
            then sends the diner to a booking destination.
          </p>
        </div>
        <div className="hero-media-stack">
          <div className="visual-card">
            <VisualImage
              alt="Restaurant booking table preview"
              className="responsive-visual"
              priority
              src={getRouteImage("booking")}
            />
          </div>
          <div className="metric-row">
            <div>
              <span>Bookable</span>
              <strong>{bookablePlaces.length}</strong>
            </div>
            <div>
              <span>Saved</span>
              <strong>{savedPlaceIds.size}</strong>
            </div>
            <div>
              <span>Intent clicks</span>
              <strong>{intents.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="booking-layout">
        <aside className="booking-context-panel">
          <div className="panel-heading">
            <p className="eyebrow">Attribution</p>
            <h2>{intents.length ? "Intent log active" : "No booking clicks yet"}</h2>
            <p>Each booking click is saved locally with provider, place, creator, and timestamp.</p>
          </div>
          <div className="summary-list">
            {intents.slice(0, 3).map((intent) => (
              <div key={intent.id}>
                <span>{intent.provider}</span>
                <strong>{intent.placeName}</strong>
              </div>
            ))}
            {intents.length === 0 && (
              <div>
                <span>Next step</span>
                <strong>Click a booking CTA</strong>
              </div>
            )}
          </div>
        </aside>

        <section className="booking-list" aria-label="Bookable places">
          {bookablePlaces.map(({ place, save }) => (
            <article
              className={save ? "booking-card saved-booking-card" : "booking-card"}
              key={place.id}
            >
              <VisualImage
                alt={`${place.name} booking preview`}
                className="card-visual"
                src={getPlaceImage(place.id)}
              />
              <div>
                <p className="place-area">{place.area}</p>
                <h2>{place.name}</h2>
                <p className="place-address">{place.address}</p>
              </div>
              <div className="tag-row">
                {place.cuisines.map((cuisine) => (
                  <span key={cuisine}>{cuisine}</span>
                ))}
                {save?.creatorHandle && <span>@{save.creatorHandle}</span>}
              </div>
              <div className="place-meta">
                <span>{place.heroDish}</span>
                <span>{save ? "Saved attribution" : "Seed listing"}</span>
              </div>
              <button type="button" onClick={() => recordBookingIntent(place.id, save)}>
                Book via {getProvider(place.bookingUrl)}
              </button>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
