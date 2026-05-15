"use client";

import {
  directBookingsStorageKey,
  liveFestReservationsStorageKey,
  payPerBookingPromotionsStorageKey,
  phaseOneExitTargets,
  restaurantClaimsStorageKey,
  restaurantSubscriptionsStorageKey,
  verifiedReviewsStorageKey,
  type DirectBookingRecord,
  type LiveFestReservationRecord,
  type PayPerBookingPromotionRecord,
  type RestaurantClaimRecord,
  type RestaurantSubscriptionRecord,
  type VerifiedReviewRecord,
} from "@rasa/shared";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackRasaEvent } from "../lib/analytics";
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

export function PhaseOneQa() {
  const [claims, setClaims] = useState<RestaurantClaimRecord[]>([]);
  const [subscriptions, setSubscriptions] = useState<RestaurantSubscriptionRecord[]>([]);
  const [promotions, setPromotions] = useState<PayPerBookingPromotionRecord[]>([]);
  const [directBookings, setDirectBookings] = useState<DirectBookingRecord[]>([]);
  const [reviews, setReviews] = useState<VerifiedReviewRecord[]>([]);
  const [liveReservations, setLiveReservations] = useState<LiveFestReservationRecord[]>([]);

  useEffect(() => {
    setClaims(readJsonArray<RestaurantClaimRecord>(restaurantClaimsStorageKey));
    setSubscriptions(
      readJsonArray<RestaurantSubscriptionRecord>(restaurantSubscriptionsStorageKey),
    );
    setPromotions(readJsonArray<PayPerBookingPromotionRecord>(payPerBookingPromotionsStorageKey));
    setDirectBookings(readJsonArray<DirectBookingRecord>(directBookingsStorageKey));
    setReviews(readJsonArray<VerifiedReviewRecord>(verifiedReviewsStorageKey));
    setLiveReservations(readJsonArray<LiveFestReservationRecord>(liveFestReservationsStorageKey));
    trackRasaEvent("page_view", { route: "/phase-1-qa" });
  }, []);

  const mrr = subscriptions.reduce((sum, subscription) => sum + subscription.monthlyPrice, 0);
  const promotedBudget = promotions.reduce((sum, promotion) => sum + promotion.budget, 0);
  const readinessItems = useMemo(
    () => [
      { label: "Claim flow tested", value: claims.length, target: 1, ready: claims.length >= 1 },
      {
        label: "Paid SaaS active",
        value: subscriptions.length,
        target: 1,
        ready: subscriptions.length >= 1,
      },
      {
        label: "Pay-per-booking promo",
        value: promotions.length,
        target: 1,
        ready: promotions.length >= 1,
      },
      {
        label: "Direct booking confirmed",
        value: directBookings.length,
        target: 1,
        ready: directBookings.length >= 1,
      },
      {
        label: "Verified review published",
        value: reviews.length,
        target: 1,
        ready: reviews.length >= 1,
      },
      {
        label: "Live Fest reserved",
        value: liveReservations.length,
        target: 1,
        ready: liveReservations.length >= 1,
      },
    ],
    [
      claims.length,
      directBookings.length,
      liveReservations.length,
      promotions.length,
      reviews.length,
      subscriptions.length,
    ],
  );

  const readyCount = readinessItems.filter((item) => item.ready).length;
  const readinessPct = Math.round((readyCount / readinessItems.length) * 100);

  return (
    <main className="phase-one-qa-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/restaurants/dashboard">Dashboard</Link>
          <Link href="/phase-1-qa">Phase 1 QA</Link>
          <Link href="/analytics">Analytics</Link>
        </div>
      </nav>

      <section className="phase-one-qa-hero">
        <div>
          <p className="eyebrow">Phase 1.9</p>
          <h1>Revenue readiness review.</h1>
          <p className="lede">
            A founder checkpoint for B-side monetization: claims, attribution, direct bookings,
            reviews, live commerce, SaaS, and pay-per-booking all in one place.
          </p>
        </div>
        <HeroMedia alt="Phase 1 revenue readiness preview" imageKey="restaurants">
          <div className="readiness-meter">
            <span>Ready score</span>
            <strong>{readinessPct}%</strong>
            <p>
              {readyCount} of {readinessItems.length} Phase 1 gates passing in this browser session.
            </p>
          </div>
        </HeroMedia>
      </section>

      <section className="phase-one-qa-grid">
        <section className="qa-panel">
          <div className="panel-heading">
            <p className="eyebrow">Gates</p>
            <h2>Revenue loop checks</h2>
          </div>
          <div className="qa-checklist">
            {readinessItems.map((item) => (
              <div className={item.ready ? "qa-check ready" : "qa-check"} key={item.label}>
                <span>{item.ready ? "Ready" : "Needs data"}</span>
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
            <p className="eyebrow">Exit targets</p>
            <h2>PRD revenue thresholds</h2>
          </div>
          <div className="summary-list">
            <div>
              <span>MRR target</span>
              <strong>
                ₹{phaseOneExitTargets.monthlyRecurringRevenue.toLocaleString("en-IN")}
              </strong>
            </div>
            <div>
              <span>Live fill target</span>
              <strong>{phaseOneExitTargets.liveFestFillRatePct}%</strong>
            </div>
            <div>
              <span>Paid SaaS attach</span>
              <strong>{phaseOneExitTargets.paidSaasAttachPct}%</strong>
            </div>
            <div>
              <span>Restaurant target</span>
              <strong>{phaseOneExitTargets.restaurantCount}</strong>
            </div>
          </div>
        </section>

        <section className="qa-panel">
          <div className="panel-heading">
            <p className="eyebrow">Current signals</p>
            <h2>Session revenue proof</h2>
          </div>
          <div className="metric-grid">
            <div>
              <span>MRR</span>
              <strong>₹{mrr.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span>Promo budget</span>
              <strong>₹{promotedBudget.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span>Bookings</span>
              <strong>{directBookings.length}</strong>
            </div>
            <div>
              <span>Live slots</span>
              <strong>{liveReservations.length}</strong>
            </div>
          </div>
        </section>

        <section className="qa-panel">
          <div className="panel-heading">
            <p className="eyebrow">Known gaps</p>
            <h2>Before real revenue</h2>
          </div>
          <div className="gap-list">
            <p>Connect Razorpay subscriptions, invoices, and payment webhooks.</p>
            <p>
              Replace local promotion budget with server-side budget burn and booking settlement.
            </p>
            <p>Move claim verification to GST/FSSAI/KYC provider checks.</p>
            <p>Run one end-to-end restaurant pilot with signed agreement and invoice trail.</p>
          </div>
        </section>
      </section>
    </main>
  );
}
