"use client";

import {
  bookingIntentStorageKey,
  referralStorageKey,
  rewardsStorageKey,
  type BookingIntentRecord,
  type ReferralRecord,
  type RewardRecord,
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

function readReferral() {
  const stored = window.localStorage.getItem(referralStorageKey);

  if (!stored) {
    const nextReferral: ReferralRecord = {
      code: `RASA${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      inviteCount: 0,
      pendingValue: 100,
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem(referralStorageKey, JSON.stringify(nextReferral));
    return nextReferral;
  }

  try {
    return JSON.parse(stored) as ReferralRecord;
  } catch {
    window.localStorage.removeItem(referralStorageKey);
    return readReferral();
  }
}

function rewardAmountFor(intentId: string) {
  const total = Array.from(intentId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const rewards = [10, 20, 30, 50, 75, 100, 150, 250, 500];
  return rewards[total % rewards.length];
}

export function RewardsPanel() {
  const [bookingIntents, setBookingIntents] = useState<BookingIntentRecord[]>([]);
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [referral, setReferral] = useState<ReferralRecord | null>(null);

  useEffect(() => {
    setBookingIntents(readJsonArray<BookingIntentRecord>(bookingIntentStorageKey));
    setRewards(readJsonArray<RewardRecord>(rewardsStorageKey));
    setReferral(readReferral());
    trackRasaEvent("page_view", { route: "/rewards" });
  }, []);

  const unlockedBookingIds = useMemo(
    () => new Set(rewards.map((reward) => reward.bookingIntentId)),
    [rewards],
  );

  const eligibleIntents = bookingIntents.filter((intent) => !unlockedBookingIds.has(intent.id));
  const walletBalance = rewards.reduce((sum, reward) => sum + reward.amount, 0);

  function unlockReward(intent: BookingIntentRecord) {
    const nextReward: RewardRecord = {
      id: `reward-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      bookingIntentId: intent.id,
      placeName: intent.placeName,
      amount: rewardAmountFor(intent.id),
      status: "unlocked",
      createdAt: new Date().toISOString(),
    };
    const nextRewards = [nextReward, ...rewards];
    window.localStorage.setItem(rewardsStorageKey, JSON.stringify(nextRewards));
    setRewards(nextRewards);
    trackRasaEvent("reward_unlocked", {
      route: "/rewards",
      placeName: intent.placeName,
      creatorHandle: intent.creatorHandle,
      metadata: {
        amount: nextReward.amount,
        bookingIntentId: intent.id,
      },
    });
  }

  function addReferralInvite() {
    if (!referral) {
      return;
    }

    const nextReferral: ReferralRecord = {
      ...referral,
      inviteCount: referral.inviteCount + 1,
    };
    window.localStorage.setItem(referralStorageKey, JSON.stringify(nextReferral));
    setReferral(nextReferral);
    trackRasaEvent("referral_invite_added", {
      route: "/rewards",
      metadata: {
        inviteCount: nextReferral.inviteCount,
        pendingValue: nextReferral.pendingValue,
      },
    });
  }

  return (
    <main className="rewards-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/book">Book</Link>
          <Link href="/rewards">Rewards</Link>
          <Link href="/feed">Feed</Link>
        </div>
      </nav>

      <section className="rewards-hero">
        <div>
          <p className="eyebrow">Phase 0.9</p>
          <h1>Rewards that make the loop feel alive.</h1>
          <p className="lede">
            Scratch cards unlock after booking intent. Referrals give a clear Phase 0 viral hook
            without needing payment rails yet.
          </p>
        </div>
        <HeroMedia alt="Rasa rewards and referral preview" imageKey="rewards">
          <div className="metric-row">
            <div>
              <span>Wallet</span>
              <strong>₹{walletBalance}</strong>
            </div>
            <div>
              <span>Scratch cards</span>
              <strong>{eligibleIntents.length}</strong>
            </div>
            <div>
              <span>Invites</span>
              <strong>{referral?.inviteCount ?? 0}</strong>
            </div>
          </div>
        </HeroMedia>
      </section>

      <section className="rewards-layout">
        <section className="scratch-card-panel">
          <div className="panel-heading">
            <p className="eyebrow">Scratch</p>
            <h2>{eligibleIntents.length ? "Rewards waiting" : "No scratch cards yet"}</h2>
            <p>Click a booking CTA on `/book` to generate an eligible scratch card.</p>
          </div>
          <div className="scratch-grid">
            {eligibleIntents.map((intent) => (
              <button
                className="scratch-card"
                key={intent.id}
                onClick={() => unlockReward(intent)}
                type="button"
              >
                <span>{intent.placeName}</span>
                <strong>Scratch</strong>
              </button>
            ))}
            {eligibleIntents.length === 0 && (
              <article className="scratch-card empty-scratch">
                <span>Waiting</span>
                <strong>Book first</strong>
              </article>
            )}
          </div>
        </section>

        <aside className="referral-panel">
          <div className="panel-heading">
            <p className="eyebrow">Referral</p>
            <h2>{referral?.code ?? "RASA"}</h2>
            <p>Both friends get ₹100 after the invited diner completes their first booking.</p>
          </div>
          <div className="summary-list">
            <div>
              <span>Pending value</span>
              <strong>₹{referral?.pendingValue ?? 100}</strong>
            </div>
            <div>
              <span>Invite count</span>
              <strong>{referral?.inviteCount ?? 0}</strong>
            </div>
          </div>
          <button type="button" onClick={addReferralInvite}>
            Simulate invite
          </button>
        </aside>
      </section>

      <section className="saved-list">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Wallet</p>
            <h2>Unlocked rewards</h2>
          </div>
          <p className="hint">{rewards.length} rewards</p>
        </div>
        <div className="places-grid">
          {rewards.map((reward) => (
            <article className="place-card" key={reward.id}>
              <div>
                <p className="place-area">Rasa Cash</p>
                <h2>₹{reward.amount}</h2>
                <p className="place-address">{reward.placeName}</p>
              </div>
              <p className="coordinates">{new Date(reward.createdAt).toLocaleString("en-IN")}</p>
            </article>
          ))}
          {rewards.length === 0 && (
            <article className="place-card">
              <div>
                <p className="place-area">Empty</p>
                <h2>No rewards yet</h2>
                <p className="place-address">Book a place, then scratch your first card.</p>
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
