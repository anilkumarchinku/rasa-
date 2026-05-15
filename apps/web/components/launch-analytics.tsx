"use client";

import {
  bookingIntentStorageKey,
  getCreatorByHandle,
  referralStorageKey,
  rewardsStorageKey,
  savedPlacesStorageKey,
  type AnalyticsEventRecord,
  type BookingIntentRecord,
  type ReferralRecord,
  type RewardRecord,
  type SavedPlaceRecord,
} from "@rasa/shared";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readAnalyticsEvents, trackRasaEvent } from "../lib/analytics";
import { HeroMedia } from "./visual-image";

function readJson<T>(key: string, fallback: T) {
  const stored = window.localStorage.getItem(key);

  if (!stored) {
    return fallback;
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export function LaunchAnalytics() {
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);
  const [bookings, setBookings] = useState<BookingIntentRecord[]>([]);
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [referral, setReferral] = useState<ReferralRecord | null>(null);
  const [events, setEvents] = useState<AnalyticsEventRecord[]>([]);

  useEffect(() => {
    setSaves(readJson<SavedPlaceRecord[]>(savedPlacesStorageKey, []));
    setBookings(readJson<BookingIntentRecord[]>(bookingIntentStorageKey, []));
    setRewards(readJson<RewardRecord[]>(rewardsStorageKey, []));
    setReferral(readJson<ReferralRecord | null>(referralStorageKey, null));
    setEvents(readAnalyticsEvents());
    trackRasaEvent("page_view", { route: "/analytics" });
    setEvents(readAnalyticsEvents());

    function refreshEvents() {
      setEvents(readAnalyticsEvents());
    }

    window.addEventListener("rasa:analytics-event", refreshEvents);
    return () => window.removeEventListener("rasa:analytics-event", refreshEvents);
  }, []);

  const funnel = [
    { label: "Saves", value: saves.length, route: "/save" },
    { label: "Bookings", value: bookings.length, route: "/book" },
    { label: "Rewards", value: rewards.length, route: "/rewards" },
    { label: "Invites", value: referral?.inviteCount ?? 0, route: "/rewards" },
  ];

  const creatorAttribution = useMemo(() => {
    const creatorMap = new Map<
      string,
      { handle: string; saves: number; bookings: number; rewards: number; score?: number }
    >();

    function ensureCreator(handle?: string) {
      const key = handle || "unknown";
      const creator = getCreatorByHandle(key);
      const current = creatorMap.get(key) ?? {
        handle: key,
        saves: 0,
        bookings: 0,
        rewards: 0,
        score: creator?.authenticityScore,
      };
      creatorMap.set(key, current);
      return current;
    }

    saves.forEach((save) => {
      ensureCreator(save.creatorHandle).saves += 1;
    });

    bookings.forEach((booking) => {
      ensureCreator(booking.creatorHandle).bookings += 1;
    });

    events
      .filter((event) => event.eventName === "reward_unlocked")
      .forEach((event) => {
        ensureCreator(event.creatorHandle).rewards += 1;
      });

    return Array.from(creatorMap.values()).sort(
      (left, right) => right.bookings + right.saves - (left.bookings + left.saves),
    );
  }, [bookings, events, saves]);

  const routeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    events
      .filter((event) => event.eventName === "page_view")
      .forEach((event) => counts.set(event.route, (counts.get(event.route) ?? 0) + 1));
    return Array.from(counts.entries()).sort((left, right) => right[1] - left[1]);
  }, [events]);

  const bookingConversion = saves.length ? Math.round((bookings.length / saves.length) * 100) : 0;
  const rewardUnlockRate = bookings.length
    ? Math.round((rewards.length / bookings.length) * 100)
    : 0;

  return (
    <main className="analytics-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/save">Save</Link>
          <Link href="/book">Book</Link>
          <Link href="/analytics">Analytics</Link>
        </div>
      </nav>

      <section className="analytics-hero">
        <div>
          <p className="eyebrow">Phase 0.11</p>
          <h1>Launch analytics for the first proof loop.</h1>
          <p className="lede">
            Founder-facing telemetry for saves, bookings, creator attribution, rewards, referrals,
            and page retention events from the local MVP storage layer.
          </p>
        </div>
        <HeroMedia alt="Launch analytics dashboard preview" imageKey="analytics">
          <div className="metric-row">
            <div>
              <span>Events</span>
              <strong>{events.length}</strong>
            </div>
            <div>
              <span>Booking CVR</span>
              <strong>{bookingConversion}%</strong>
            </div>
            <div>
              <span>Reward unlock</span>
              <strong>{rewardUnlockRate}%</strong>
            </div>
          </div>
        </HeroMedia>
      </section>

      <section className="analytics-grid">
        <section className="analytics-panel funnel-panel">
          <div className="panel-heading">
            <p className="eyebrow">Funnel</p>
            <h2>Save to reward loop</h2>
          </div>
          <div className="funnel-stack">
            {funnel.map((step, index) => (
              <Link className="funnel-row" href={step.route} key={step.label}>
                <span>{index + 1}</span>
                <strong>{step.label}</strong>
                <em>{step.value}</em>
              </Link>
            ))}
          </div>
        </section>

        <section className="analytics-panel">
          <div className="panel-heading">
            <p className="eyebrow">Attribution</p>
            <h2>Creator contribution</h2>
          </div>
          <div className="analytics-table">
            {creatorAttribution.map((creator) => (
              <div className="analytics-row" key={creator.handle}>
                <span>@{creator.handle}</span>
                <strong>{creator.bookings} bookings</strong>
                <em>{creator.saves} saves</em>
                <em>{creator.score ? `${creator.score} trust` : "Unattributed"}</em>
              </div>
            ))}
            {creatorAttribution.length === 0 && (
              <div className="analytics-row empty-row">
                <span>No creator attribution yet</span>
                <strong>Save from `/save`</strong>
              </div>
            )}
          </div>
        </section>

        <section className="analytics-panel">
          <div className="panel-heading">
            <p className="eyebrow">Retention</p>
            <h2>Page views</h2>
          </div>
          <div className="analytics-table compact-table">
            {routeCounts.map(([route, count]) => (
              <div className="analytics-row" key={route}>
                <span>{route}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-panel">
          <div className="panel-heading">
            <p className="eyebrow">Stream</p>
            <h2>Latest events</h2>
          </div>
          <div className="event-stream">
            {events.slice(0, 8).map((event) => (
              <article key={event.id}>
                <span>{formatTime(event.createdAt)}</span>
                <strong>{event.eventName.replaceAll("_", " ")}</strong>
                <p>{event.placeName ?? event.route}</p>
              </article>
            ))}
            {events.length === 0 && (
              <article>
                <span>Waiting</span>
                <strong>No events yet</strong>
                <p>Visit `/save`, `/book`, or `/rewards` to create events.</p>
              </article>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
