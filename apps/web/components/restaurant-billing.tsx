"use client";

import {
  restaurantClaimsStorageKey,
  restaurantSaasPlans,
  restaurantSubscriptionsStorageKey,
  type RestaurantClaimRecord,
  type RestaurantSaasPlan,
  type RestaurantSubscriptionRecord,
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

function createSubscriptionId() {
  return `subscription-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function RestaurantBilling() {
  const [claims, setClaims] = useState<RestaurantClaimRecord[]>([]);
  const [subscriptions, setSubscriptions] = useState<RestaurantSubscriptionRecord[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setClaims(readJsonArray<RestaurantClaimRecord>(restaurantClaimsStorageKey));
    setSubscriptions(
      readJsonArray<RestaurantSubscriptionRecord>(restaurantSubscriptionsStorageKey),
    );
    trackRasaEvent("page_view", { route: "/restaurants/billing" });
  }, []);

  const latestClaim = claims[0];
  const activeSubscription = useMemo(
    () =>
      latestClaim
        ? subscriptions.find((subscription) => subscription.placeId === latestClaim.placeId)
        : undefined,
    [latestClaim, subscriptions],
  );

  function startSubscription(plan: RestaurantSaasPlan) {
    if (!latestClaim) {
      setMessage("Claim a restaurant before starting a SaaS plan.");
      return;
    }

    const nextSubscription: RestaurantSubscriptionRecord = {
      id: createSubscriptionId(),
      placeId: latestClaim.placeId,
      placeName: latestClaim.placeName,
      planId: plan.id,
      planName: plan.name,
      monthlyPrice: plan.monthlyPrice,
      billingStatus: "active",
      invoiceStatus: "draft",
      startedAt: new Date().toISOString(),
    };

    const remainingSubscriptions = subscriptions.filter(
      (subscription) => subscription.placeId !== latestClaim.placeId,
    );
    const nextSubscriptions = [nextSubscription, ...remainingSubscriptions];
    window.localStorage.setItem(
      restaurantSubscriptionsStorageKey,
      JSON.stringify(nextSubscriptions),
    );
    setSubscriptions(nextSubscriptions);
    setMessage(`${plan.name} plan activated for ${latestClaim.placeName}.`);
    trackRasaEvent("restaurant_subscription_started", {
      route: "/restaurants/billing",
      placeId: latestClaim.placeId,
      placeName: latestClaim.placeName,
      metadata: {
        planId: plan.id,
        monthlyPrice: plan.monthlyPrice,
      },
    });
  }

  const monthlyRecurringRevenue = subscriptions.reduce(
    (sum, subscription) => sum + subscription.monthlyPrice,
    0,
  );

  return (
    <main className="billing-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/restaurants/claim">Claim</Link>
          <Link href="/restaurants/dashboard">Dashboard</Link>
          <Link href="/restaurants/billing">Billing</Link>
        </div>
      </nav>

      <section className="billing-hero">
        <div>
          <p className="eyebrow">Phase 1.7</p>
          <h1>Restaurant SaaS plans and billing.</h1>
          <p className="lede">
            Convert claimed restaurants into paid partners with clear tiers, draft invoice status,
            and MRR visibility before payment rails are connected.
          </p>
        </div>
        <HeroMedia alt="Restaurant billing plans preview" imageKey="billing">
          <div className="metric-row">
            <div>
              <span>Plans</span>
              <strong>{restaurantSaasPlans.length}</strong>
            </div>
            <div>
              <span>Active subs</span>
              <strong>{subscriptions.length}</strong>
            </div>
            <div>
              <span>MRR</span>
              <strong>₹{monthlyRecurringRevenue.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </HeroMedia>
      </section>

      {message && <p className="form-message billing-message">{message}</p>}

      <section className="billing-layout">
        <section className="billing-plan-grid">
          {restaurantSaasPlans.map((plan) => (
            <article
              className={
                activeSubscription?.planId === plan.id ? "billing-plan active" : "billing-plan"
              }
              key={plan.id}
            >
              <div>
                <span>{plan.name}</span>
                <h2>₹{plan.monthlyPrice.toLocaleString("en-IN")}/mo</h2>
                <p>{plan.description}</p>
              </div>
              <div className="benefit-list">
                {plan.benefits.map((benefit) => (
                  <strong key={benefit}>{benefit}</strong>
                ))}
              </div>
              <button onClick={() => startSubscription(plan)} type="button">
                {activeSubscription?.planId === plan.id ? "Current plan" : "Activate plan"}
              </button>
            </article>
          ))}
        </section>

        <aside className="billing-summary-panel">
          <div className="panel-heading">
            <p className="eyebrow">Billing account</p>
            <h2>{latestClaim ? latestClaim.placeName : "Claim required"}</h2>
            <p>
              {latestClaim
                ? "MVP billing uses draft invoices until Razorpay subscriptions are connected."
                : "Submit a restaurant claim first, then return here to activate a plan."}
            </p>
          </div>
          <div className="summary-list">
            <div>
              <span>Status</span>
              <strong>{activeSubscription?.billingStatus ?? "Not subscribed"}</strong>
            </div>
            <div>
              <span>Plan</span>
              <strong>{activeSubscription?.planName ?? "None"}</strong>
            </div>
            <div>
              <span>Invoice</span>
              <strong>{activeSubscription?.invoiceStatus ?? "Waiting"}</strong>
            </div>
            <div>
              <span>Monthly price</span>
              <strong>
                {activeSubscription
                  ? `₹${activeSubscription.monthlyPrice.toLocaleString("en-IN")}`
                  : "₹0"}
              </strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
