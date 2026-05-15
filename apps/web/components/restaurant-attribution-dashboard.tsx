"use client";

import {
  bookingIntentStorageKey,
  getCreatorByHandle,
  restaurantClaimsStorageKey,
  savedPlacesStorageKey,
  type BookingIntentRecord,
  type RestaurantClaimRecord,
  type SavedPlaceRecord,
} from "@rasa/shared";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackRasaEvent } from "../lib/analytics";
import { HeroMedia } from "./visual-image";

const estimatedAov = 1200;

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

export function RestaurantAttributionDashboard() {
  const [saves, setSaves] = useState<SavedPlaceRecord[]>([]);
  const [bookings, setBookings] = useState<BookingIntentRecord[]>([]);
  const [claims, setClaims] = useState<RestaurantClaimRecord[]>([]);

  useEffect(() => {
    setSaves(readJsonArray<SavedPlaceRecord>(savedPlacesStorageKey));
    setBookings(readJsonArray<BookingIntentRecord>(bookingIntentStorageKey));
    setClaims(readJsonArray<RestaurantClaimRecord>(restaurantClaimsStorageKey));
    trackRasaEvent("page_view", { route: "/restaurants/dashboard" });
  }, []);

  const rows = useMemo(() => {
    const byCreator = new Map<
      string,
      {
        handle: string;
        saves: number;
        bookings: number;
        places: Set<string>;
        trustScore?: number;
      }
    >();

    function ensureRow(handle?: string) {
      const key = handle || "unattributed";
      const creator = getCreatorByHandle(key);
      const row = byCreator.get(key) ?? {
        handle: key,
        saves: 0,
        bookings: 0,
        places: new Set<string>(),
        trustScore: creator?.authenticityScore,
      };
      byCreator.set(key, row);
      return row;
    }

    saves.forEach((save) => {
      const row = ensureRow(save.creatorHandle);
      row.saves += 1;
      row.places.add(save.placeName);
    });

    bookings.forEach((booking) => {
      const row = ensureRow(booking.creatorHandle);
      row.bookings += 1;
      row.places.add(booking.placeName);
    });

    return Array.from(byCreator.values())
      .map((row) => ({
        ...row,
        conversion: row.saves ? Math.round((row.bookings / row.saves) * 100) : 0,
        revenue: row.bookings * estimatedAov,
        placeCount: row.places.size,
      }))
      .sort((left, right) => right.bookings - left.bookings || right.saves - left.saves);
  }, [bookings, saves]);

  const totalBookings = rows.reduce((sum, row) => sum + row.bookings, 0);
  const totalSaves = rows.reduce((sum, row) => sum + row.saves, 0);
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  const latestClaim = claims[0];

  return (
    <main className="restaurant-dashboard-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/restaurants/claim">Claim</Link>
          <Link href="/restaurants/dashboard">Dashboard</Link>
          <Link href="/analytics">Analytics</Link>
        </div>
      </nav>

      <section className="restaurant-dashboard-hero">
        <div>
          <p className="eyebrow">Phase 1.2</p>
          <h1>Creator attribution restaurants can finally read.</h1>
          <p className="lede">
            Connect saves, booking intent clicks, creator handles, and estimated revenue so a
            restaurant can see who is actually driving outcomes.
          </p>
        </div>
        <HeroMedia alt="Restaurant attribution dashboard preview" imageKey="analytics">
          <div className="metric-row">
            <div>
              <span>Saves</span>
              <strong>{totalSaves}</strong>
            </div>
            <div>
              <span>Bookings</span>
              <strong>{totalBookings}</strong>
            </div>
            <div>
              <span>Est. revenue</span>
              <strong>₹{totalRevenue.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </HeroMedia>
      </section>

      <section className="restaurant-dashboard-grid">
        <section className="attribution-table-panel">
          <div className="panel-heading">
            <p className="eyebrow">Attribution</p>
            <h2>Creator performance</h2>
          </div>

          <div className="restaurant-table">
            <div className="restaurant-table-head">
              <span>Creator</span>
              <span>Saves</span>
              <span>Bookings</span>
              <span>CVR</span>
              <span>Revenue</span>
            </div>
            {rows.map((row) => (
              <div className="restaurant-table-row" key={row.handle}>
                <span>@{row.handle}</span>
                <strong>{row.saves}</strong>
                <strong>{row.bookings}</strong>
                <strong>{row.conversion}%</strong>
                <strong>₹{row.revenue.toLocaleString("en-IN")}</strong>
              </div>
            ))}
            {rows.length === 0 && (
              <div className="restaurant-empty-row">
                Save and book a creator recommendation to populate attribution.
              </div>
            )}
          </div>
        </section>

        <aside className="restaurant-insight-panel">
          <div className="panel-heading">
            <p className="eyebrow">Claim context</p>
            <h2>{latestClaim ? latestClaim.placeName : "No claimed restaurant"}</h2>
            <p>
              {latestClaim
                ? `Claim status: ${latestClaim.status}. Attribution can be reviewed before SaaS billing.`
                : "Submit a restaurant claim first to connect this dashboard to an owner profile."}
            </p>
          </div>

          <div className="summary-list">
            <div>
              <span>Tracked creators</span>
              <strong>{rows.length}</strong>
            </div>
            <div>
              <span>Best creator</span>
              <strong>{rows[0] ? `@${rows[0].handle}` : "Waiting"}</strong>
            </div>
            <div>
              <span>Best trust score</span>
              <strong>{Math.max(0, ...rows.map((row) => row.trustScore ?? 0)).toFixed(1)}</strong>
            </div>
            <div>
              <span>Est. AOV</span>
              <strong>₹{estimatedAov}</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
