"use client";

import {
  hyderabadSeedPlaces,
  restaurantClaimsStorageKey,
  type RestaurantClaimRecord,
} from "@rasa/shared";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { trackRasaEvent } from "../lib/analytics";
import { HeroMedia } from "./visual-image";

function readClaims() {
  const stored = window.localStorage.getItem(restaurantClaimsStorageKey);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as RestaurantClaimRecord[];
  } catch {
    window.localStorage.removeItem(restaurantClaimsStorageKey);
    return [];
  }
}

function cleanUppercase(value: string) {
  return value.trim().toUpperCase().replace(/\s/g, "");
}

function createClaimId() {
  return `claim-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function RestaurantClaimFlow() {
  const [placeId, setPlaceId] = useState<string>(hyderabadSeedPlaces[0]?.id ?? "");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [fssaiNumber, setFssaiNumber] = useState("");
  const [claims, setClaims] = useState<RestaurantClaimRecord[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setClaims(readClaims());
    trackRasaEvent("page_view", { route: "/restaurants/claim" });
  }, []);

  const selectedPlace = useMemo(
    () => hyderabadSeedPlaces.find((place) => place.id === placeId) ?? hyderabadSeedPlaces[0],
    [placeId],
  );

  const latestClaim = claims[0];
  const verifiedReadyClaims = claims.filter((claim) => claim.status === "submitted").length;

  function submitClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPlace) {
      setMessage("Pick a restaurant before submitting.");
      return;
    }

    const cleanedGst = cleanUppercase(gstNumber);
    const cleanedFssai = fssaiNumber.trim().replace(/\D/g, "");
    const cleanedPhone = ownerPhone.trim().replace(/\D/g, "");

    if (!ownerName.trim() || cleanedPhone.length < 10) {
      setMessage("Add owner name and a valid 10 digit phone number.");
      return;
    }

    if (cleanedGst.length !== 15) {
      setMessage("GST number should be 15 characters.");
      return;
    }

    if (cleanedFssai.length !== 14) {
      setMessage("FSSAI number should be 14 digits.");
      return;
    }

    const nextClaim: RestaurantClaimRecord = {
      id: createClaimId(),
      placeId: selectedPlace.id,
      placeName: selectedPlace.name,
      ownerName: ownerName.trim(),
      ownerPhone: cleanedPhone,
      gstNumber: cleanedGst,
      fssaiNumber: cleanedFssai,
      status: "submitted",
      submittedAt: new Date().toISOString(),
    };

    const nextClaims = [nextClaim, ...claims];
    window.localStorage.setItem(restaurantClaimsStorageKey, JSON.stringify(nextClaims));
    setClaims(nextClaims);
    setMessage("Claim submitted for ops review.");
    trackRasaEvent("restaurant_claim_submitted", {
      route: "/restaurants/claim",
      placeId: nextClaim.placeId,
      placeName: nextClaim.placeName,
      metadata: {
        status: nextClaim.status,
        hasGst: Boolean(nextClaim.gstNumber),
        hasFssai: Boolean(nextClaim.fssaiNumber),
      },
    });
  }

  return (
    <main className="claim-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/analytics">Analytics</Link>
          <Link href="/restaurants/claim">Claim</Link>
          <Link href="/qa">QA</Link>
        </div>
      </nav>

      <section className="claim-hero">
        <div>
          <p className="eyebrow">Phase 1.1</p>
          <h1>Claim a restaurant with GST and FSSAI proof.</h1>
          <p className="lede">
            Phase 1 starts the B-side loop: restaurant owners can claim a seed listing, submit
            compliance identifiers, and enter ops review before attribution goes live.
          </p>
        </div>
        <HeroMedia alt="Restaurant claim verification preview" imageKey="restaurants">
          <div className="metric-row">
            <div>
              <span>Claims</span>
              <strong>{claims.length}</strong>
            </div>
            <div>
              <span>Ops queue</span>
              <strong>{verifiedReadyClaims}</strong>
            </div>
            <div>
              <span>Inventory</span>
              <strong>{hyderabadSeedPlaces.length}</strong>
            </div>
          </div>
        </HeroMedia>
      </section>

      <section className="claim-layout">
        <form className="claim-form" onSubmit={submitClaim}>
          <div className="panel-heading">
            <p className="eyebrow">Owner details</p>
            <h2>Submit claim</h2>
            <p>
              Use test identifiers for now. Production will verify these against GST/FSSAI APIs.
            </p>
          </div>

          <label>
            Restaurant listing
            <select value={placeId} onChange={(event) => setPlaceId(event.target.value)}>
              {hyderabadSeedPlaces.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name} - {place.area}
                </option>
              ))}
            </select>
          </label>

          <label>
            Owner name
            <input
              placeholder="Restaurant owner or manager"
              value={ownerName}
              onChange={(event) => setOwnerName(event.target.value)}
            />
          </label>

          <label>
            Owner phone
            <input
              inputMode="tel"
              placeholder="9876543210"
              value={ownerPhone}
              onChange={(event) => setOwnerPhone(event.target.value)}
            />
          </label>

          <div className="claim-two-col">
            <label>
              GST number
              <input
                placeholder="36ABCDE1234F1Z5"
                value={gstNumber}
                onChange={(event) => setGstNumber(event.target.value)}
              />
            </label>

            <label>
              FSSAI number
              <input
                inputMode="numeric"
                placeholder="13622011001234"
                value={fssaiNumber}
                onChange={(event) => setFssaiNumber(event.target.value)}
              />
            </label>
          </div>

          {message && <p className="form-message">{message}</p>}

          <button type="submit">Submit claim</button>
        </form>

        <aside className="claim-review-panel">
          <div className="panel-heading">
            <p className="eyebrow">Review</p>
            <h2>{latestClaim ? "Latest claim" : "No claims yet"}</h2>
            <p>Claims stay pending until ops verifies GST, FSSAI, and owner phone.</p>
          </div>
          {latestClaim ? (
            <div className="summary-list">
              <div>
                <span>Restaurant</span>
                <strong>{latestClaim.placeName}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{latestClaim.status}</strong>
              </div>
              <div>
                <span>GST</span>
                <strong>{latestClaim.gstNumber}</strong>
              </div>
              <div>
                <span>FSSAI</span>
                <strong>{latestClaim.fssaiNumber}</strong>
              </div>
            </div>
          ) : (
            <div className="claim-empty">
              <strong>{selectedPlace?.name}</strong>
              <p>{selectedPlace?.address}</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
