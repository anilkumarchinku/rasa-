"use client";

import {
  payPerBookingPromotionsStorageKey,
  promotionMoodSlots,
  restaurantClaimsStorageKey,
  type PayPerBookingPromotionRecord,
  type RestaurantClaimRecord,
} from "@rasa/shared";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
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

function createPromotionId() {
  return `promotion-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function PayPerBookingPromotions() {
  const [claims, setClaims] = useState<RestaurantClaimRecord[]>([]);
  const [promotions, setPromotions] = useState<PayPerBookingPromotionRecord[]>([]);
  const [mood, setMood] = useState<string>(promotionMoodSlots[0]);
  const [bidPerBooking, setBidPerBooking] = useState(150);
  const [budget, setBudget] = useState(6000);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setClaims(readJsonArray<RestaurantClaimRecord>(restaurantClaimsStorageKey));
    setPromotions(readJsonArray<PayPerBookingPromotionRecord>(payPerBookingPromotionsStorageKey));
    trackRasaEvent("page_view", { route: "/restaurants/promotions" });
  }, []);

  const latestClaim = claims[0];
  const totalBudget = promotions.reduce((sum, promotion) => sum + promotion.budget, 0);
  const totalMaxBookings = promotions.reduce((sum, promotion) => sum + promotion.maxBookings, 0);

  const activeForClaim = useMemo(
    () =>
      latestClaim
        ? promotions.filter((promotion) => promotion.placeId === latestClaim.placeId)
        : promotions,
    [latestClaim, promotions],
  );

  function createPromotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!latestClaim) {
      setMessage("Claim a restaurant before creating a promotion.");
      return;
    }

    if (bidPerBooking < 100 || bidPerBooking > 300) {
      setMessage("Bid per booking must stay between ₹100 and ₹300.");
      return;
    }

    if (budget < bidPerBooking) {
      setMessage("Budget must cover at least one converted booking.");
      return;
    }

    const nextPromotion: PayPerBookingPromotionRecord = {
      id: createPromotionId(),
      placeId: latestClaim.placeId,
      placeName: latestClaim.placeName,
      mood,
      bidPerBooking,
      budget,
      maxBookings: Math.floor(budget / bidPerBooking),
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const nextPromotions = [nextPromotion, ...promotions];
    window.localStorage.setItem(payPerBookingPromotionsStorageKey, JSON.stringify(nextPromotions));
    setPromotions(nextPromotions);
    setMessage(`${mood} promotion is active for ${latestClaim.placeName}.`);
    trackRasaEvent("pay_per_booking_promotion_created", {
      route: "/restaurants/promotions",
      placeId: latestClaim.placeId,
      placeName: latestClaim.placeName,
      metadata: {
        mood,
        bidPerBooking,
        budget,
        maxBookings: nextPromotion.maxBookings,
      },
    });
  }

  return (
    <main className="promotions-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/restaurants/dashboard">Dashboard</Link>
          <Link href="/restaurants/billing">Billing</Link>
          <Link href="/restaurants/promotions">Promote</Link>
        </div>
      </nav>

      <section className="promotions-hero">
        <div>
          <p className="eyebrow">Phase 1.8</p>
          <h1>Pay only when a booking converts.</h1>
          <p className="lede">
            Restaurants choose a mood slot, bid ₹100-₹300 per converted booking, and cap budget
            before the campaign goes live.
          </p>
        </div>
        <HeroMedia alt="Pay per booking promotion preview" imageKey="restaurants">
          <div className="metric-row">
            <div>
              <span>Active promos</span>
              <strong>{promotions.length}</strong>
            </div>
            <div>
              <span>Budget</span>
              <strong>₹{totalBudget.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span>Max bookings</span>
              <strong>{totalMaxBookings}</strong>
            </div>
          </div>
        </HeroMedia>
      </section>

      {message && <p className="form-message promotions-message">{message}</p>}

      <section className="promotions-layout">
        <form className="promotion-form" onSubmit={createPromotion}>
          <div className="panel-heading">
            <p className="eyebrow">Campaign</p>
            <h2>{latestClaim ? latestClaim.placeName : "Claim required"}</h2>
            <p>Promotion cost is charged only when Rasa records a converted booking.</p>
          </div>

          <label>
            Mood slot
            <select value={mood} onChange={(event) => setMood(event.target.value)}>
              {promotionMoodSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>

          <label>
            Bid per booking
            <input
              inputMode="numeric"
              max={300}
              min={100}
              type="number"
              value={bidPerBooking}
              onChange={(event) => setBidPerBooking(Number(event.target.value))}
            />
          </label>

          <label>
            Budget cap
            <input
              inputMode="numeric"
              min={bidPerBooking}
              step={100}
              type="number"
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value))}
            />
          </label>

          <button type="submit">Create promotion</button>
        </form>

        <aside className="promotion-list-panel">
          <div className="panel-heading">
            <p className="eyebrow">Active queue</p>
            <h2>{activeForClaim.length} promotions</h2>
          </div>
          <div className="promotion-list">
            {activeForClaim.map((promotion) => (
              <article key={promotion.id}>
                <span>{promotion.status}</span>
                <strong>{promotion.mood}</strong>
                <p>{promotion.placeName}</p>
                <em>
                  ₹{promotion.bidPerBooking}/booking · {promotion.maxBookings} max bookings
                </em>
              </article>
            ))}
            {activeForClaim.length === 0 && (
              <article>
                <span>Waiting</span>
                <strong>No active promotions</strong>
                <p>Create the first pay-per-booking campaign.</p>
              </article>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
