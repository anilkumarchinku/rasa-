"use client";

import {
  getCreatorByHandle,
  getSeedPlaceById,
  liveFestReservationsStorageKey,
  phaseOneLiveFests,
  type LiveFestReservationRecord,
} from "@rasa/shared";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackRasaEvent } from "../lib/analytics";
import { getPlaceImage, getRouteImage, VisualImage } from "./visual-image";

function readReservations() {
  const stored = window.localStorage.getItem(liveFestReservationsStorageKey);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as LiveFestReservationRecord[];
  } catch {
    window.localStorage.removeItem(liveFestReservationsStorageKey);
    return [];
  }
}

function createReservationId() {
  return `live-reservation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatLiveTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function LiveFestBoard() {
  const [reservations, setReservations] = useState<LiveFestReservationRecord[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setReservations(readReservations());
    trackRasaEvent("page_view", { route: "/live" });
  }, []);

  const reservedIds = useMemo(
    () => new Set(reservations.map((reservation) => reservation.liveFestId)),
    [reservations],
  );

  const liveFests = phaseOneLiveFests.map((fest) => {
    const place = getSeedPlaceById(fest.placeId);
    const creator = getCreatorByHandle(fest.creatorHandle);
    const reservationsForFest = reservations.filter(
      (reservation) => reservation.liveFestId === fest.id,
    );
    return {
      fest,
      place,
      creator,
      slotsFilled: reservationsForFest.length,
      activeDiscount: fest.status === "replay" ? fest.replayDiscountPct : fest.discountPct,
    };
  });

  function reserveSlot(festId: string) {
    const entry = liveFests.find((item) => item.fest.id === festId);

    if (!entry?.place) {
      setMessage("Live Fest place is missing.");
      return;
    }

    if (reservedIds.has(festId)) {
      setMessage("You already reserved this Live Fest.");
      return;
    }

    if (entry.slotsFilled >= entry.fest.slotCap) {
      setMessage("This Live Fest is full.");
      return;
    }

    const nextReservation: LiveFestReservationRecord = {
      id: createReservationId(),
      liveFestId: entry.fest.id,
      placeId: entry.place.id,
      placeName: entry.place.name,
      creatorHandle: entry.fest.creatorHandle,
      discountPct: entry.activeDiscount,
      status: "reserved",
      createdAt: new Date().toISOString(),
    };

    const nextReservations = [nextReservation, ...reservations];
    window.localStorage.setItem(liveFestReservationsStorageKey, JSON.stringify(nextReservations));
    setReservations(nextReservations);
    setMessage("Live Fest slot reserved.");
    trackRasaEvent("live_fest_slot_reserved", {
      route: "/live",
      placeId: nextReservation.placeId,
      placeName: nextReservation.placeName,
      creatorHandle: nextReservation.creatorHandle,
      metadata: {
        discountPct: nextReservation.discountPct,
        liveFestId: nextReservation.liveFestId,
      },
    });
  }

  return (
    <main className="live-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/feed">Feed</Link>
          <Link href="/live">Live</Link>
          <Link href="/book/direct">Book</Link>
        </div>
      </nav>

      <section className="live-hero">
        <div>
          <p className="eyebrow">Phase 1.6</p>
          <h1>Rasa Live Fests with real slot counters.</h1>
          <p className="lede">
            Creator-led dining drops with live discounts, replay discounts, slot caps, and
            reservation counters that make demand visible.
          </p>
        </div>
        <div className="hero-media-stack">
          <div className="visual-card dark">
            <VisualImage
              alt="Live dining event preview"
              className="responsive-visual"
              priority
              src={getRouteImage("live")}
            />
          </div>
          <div className="metric-row">
            <div>
              <span>Fests</span>
              <strong>{liveFests.length}</strong>
            </div>
            <div>
              <span>Reserved</span>
              <strong>{reservations.length}</strong>
            </div>
            <div>
              <span>Max deal</span>
              <strong>35%</strong>
            </div>
          </div>
        </div>
      </section>

      {message && <p className="live-message">{message}</p>}

      <section className="live-grid">
        {liveFests.map(({ fest, place, creator, slotsFilled, activeDiscount }) => (
          <article className="live-card" key={fest.id}>
            {place && (
              <VisualImage
                alt={`${place.name} live fest preview`}
                className="card-visual"
                src={getPlaceImage(place.id)}
              />
            )}
            <div>
              <span className={`live-status ${fest.status}`}>{fest.status}</span>
              <h2>{fest.title}</h2>
              <p>{place ? `${place.name}, ${place.area}` : "Place pending"}</p>
            </div>
            <div className="live-meta">
              <span>@{creator?.handle ?? fest.creatorHandle}</span>
              <span>{formatLiveTime(fest.scheduledStart)}</span>
              <span>{fest.durationMinutes} min</span>
            </div>
            <div className="slot-counter">
              <div>
                <i style={{ width: `${Math.round((slotsFilled / fest.slotCap) * 100)}%` }} />
              </div>
              <strong>
                {slotsFilled} of {fest.slotCap} slots filled
              </strong>
            </div>
            <button
              disabled={reservedIds.has(fest.id)}
              onClick={() => reserveSlot(fest.id)}
              type="button"
            >
              {reservedIds.has(fest.id) ? "Reserved" : `Reserve ${activeDiscount}% off`}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
