"use client";

import {
  bookingIntentStorageKey,
  hyderabadSeedPlaces,
  phaseZeroCreators,
  phaseZeroExitTargets,
  rewardsStorageKey,
  savedPlacesStorageKey,
  type BookingIntentRecord,
  type RewardRecord,
  type SavedPlaceRecord,
} from "@rasa/shared";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readAnalyticsEvents, trackRasaEvent } from "../lib/analytics";
import { HeroMedia } from "./visual-image";

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

function statusFor(isReady: boolean) {
  return isReady ? "Ready" : "Needs data";
}

export function PhaseZeroQa() {
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);
  const [bookings, setBookings] = useState<BookingIntentRecord[]>([]);
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    setSaves(readJsonArray<SavedPlaceRecord>(savedPlacesStorageKey));
    setBookings(readJsonArray<BookingIntentRecord>(bookingIntentStorageKey));
    setRewards(readJsonArray<RewardRecord>(rewardsStorageKey));
    trackRasaEvent("page_view", { route: "/qa" });
    setEventCount(readAnalyticsEvents().length);
  }, []);

  const readinessItems = useMemo(
    () => [
      {
        label: "Hyderabad place seed",
        value: hyderabadSeedPlaces.length,
        target: phaseZeroExitTargets.seedPlaces,
        ready: hyderabadSeedPlaces.length >= phaseZeroExitTargets.seedPlaces,
      },
      {
        label: "Creator seed pages",
        value: phaseZeroCreators.length,
        target: 4,
        ready: phaseZeroCreators.length >= 4,
      },
      {
        label: "Universal saves tested",
        value: saves.length,
        target: phaseZeroExitTargets.weeklySavesPerUser,
        ready: saves.length >= phaseZeroExitTargets.weeklySavesPerUser,
      },
      {
        label: "Booking intents tested",
        value: bookings.length,
        target: 1,
        ready: bookings.length >= 1,
      },
      {
        label: "Reward unlocks tested",
        value: rewards.length,
        target: 1,
        ready: rewards.length >= 1,
      },
      {
        label: "Analytics events captured",
        value: eventCount,
        target: 5,
        ready: eventCount >= 5,
      },
    ],
    [bookings.length, eventCount, rewards.length, saves.length],
  );

  const readyCount = readinessItems.filter((item) => item.ready).length;
  const readinessPct = Math.round((readyCount / readinessItems.length) * 100);
  const uniqueCreators = new Set(
    saves.map((save) => save.creatorHandle).filter((handle): handle is string => Boolean(handle)),
  ).size;

  return (
    <main className="qa-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/analytics">Analytics</Link>
          <Link href="/save">Save</Link>
          <Link href="/qa">QA</Link>
        </div>
      </nav>

      <section className="qa-hero">
        <div>
          <p className="eyebrow">Phase 0.12</p>
          <h1>Beta readiness checkpoint.</h1>
          <p className="lede">
            One place to review the Phase 0 wedge before inviting beta users: data coverage, loop
            testing, exit criteria, and known launch gaps.
          </p>
        </div>
        <HeroMedia alt="Phase 0 beta readiness preview" imageKey="analytics">
          <div className="readiness-meter">
            <span>Ready score</span>
            <strong>{readinessPct}%</strong>
            <p>
              {readyCount} of {readinessItems.length} checks passing in this browser session.
            </p>
          </div>
        </HeroMedia>
      </section>

      <section className="qa-grid">
        <section className="qa-panel">
          <div className="panel-heading">
            <p className="eyebrow">Checklist</p>
            <h2>Founder test gates</h2>
          </div>
          <div className="qa-checklist">
            {readinessItems.map((item) => (
              <div className={item.ready ? "qa-check ready" : "qa-check"} key={item.label}>
                <span>{statusFor(item.ready)}</span>
                <strong>{item.label}</strong>
                <em>
                  {item.value} / {item.target}
                </em>
              </div>
            ))}
          </div>
        </section>

        <section className="qa-panel">
          <div className="panel-heading">
            <p className="eyebrow">Exit metrics</p>
            <h2>Phase 0 PRD targets</h2>
          </div>
          <div className="summary-list">
            <div>
              <span>Beta users target</span>
              <strong>{phaseZeroExitTargets.betaUsers}</strong>
            </div>
            <div>
              <span>Creators signed target</span>
              <strong>{phaseZeroExitTargets.creatorsSigned}</strong>
            </div>
            <div>
              <span>Save depth target</span>
              <strong>{phaseZeroExitTargets.weeklySavesPerUser}+ saves/week</strong>
            </div>
            <div>
              <span>Weekly return target</span>
              <strong>{phaseZeroExitTargets.weeklyReturnRatePct}%</strong>
            </div>
          </div>
        </section>

        <section className="qa-panel">
          <div className="panel-heading">
            <p className="eyebrow">Session proof</p>
            <h2>Current MVP signals</h2>
          </div>
          <div className="metric-grid">
            <div>
              <span>Saves</span>
              <strong>{saves.length}</strong>
            </div>
            <div>
              <span>Bookings</span>
              <strong>{bookings.length}</strong>
            </div>
            <div>
              <span>Creators touched</span>
              <strong>{uniqueCreators}</strong>
            </div>
            <div>
              <span>Rewards</span>
              <strong>{rewards.length}</strong>
            </div>
          </div>
        </section>

        <section className="qa-panel">
          <div className="panel-heading">
            <p className="eyebrow">Known gaps</p>
            <h2>Before real beta</h2>
          </div>
          <div className="gap-list">
            <p>Replace browser storage with Supabase-backed events.</p>
            <p>Run one manual creator onboarding and restaurant booking dry run.</p>
            <p>
              Confirm legal copy for DPDP consent, creator attribution, and affiliate redirects.
            </p>
            <p>Test on one Android device and one iPhone viewport before inviting 500 users.</p>
          </div>
        </section>
      </section>
    </main>
  );
}
