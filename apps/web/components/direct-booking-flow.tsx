"use client";

import {
  directBookingsStorageKey,
  getSeedPlaceById,
  phaseOneAvailabilitySlots,
  type DirectBookingRecord,
  type PartnerAvailabilitySlot,
} from "@rasa/shared";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { trackRasaEvent } from "../lib/analytics";
import { getPlaceImage, HeroMedia, VisualImage } from "./visual-image";

function readDirectBookings() {
  const stored = window.localStorage.getItem(directBookingsStorageKey);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as DirectBookingRecord[];
  } catch {
    window.localStorage.removeItem(directBookingsStorageKey);
    return [];
  }
}

function createDirectBookingId() {
  return `direct-booking-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatSlot(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DirectBookingFlow() {
  const [bookings, setBookings] = useState<DirectBookingRecord[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState(phaseOneAvailabilitySlots[0]?.id ?? "");
  const [partySize, setPartySize] = useState(2);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setBookings(readDirectBookings());
    trackRasaEvent("page_view", { route: "/book/direct" });
  }, []);

  const enrichedSlots = useMemo(
    () =>
      phaseOneAvailabilitySlots
        .map((slot) => ({ slot, place: getSeedPlaceById(slot.placeId) }))
        .filter(
          (
            entry,
          ): entry is { slot: PartnerAvailabilitySlot; place: NonNullable<typeof entry.place> } =>
            Boolean(entry.place),
        ),
    [],
  );

  const selectedEntry = enrichedSlots.find((entry) => entry.slot.id === selectedSlotId);

  function confirmBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEntry) {
      setMessage("Pick a partner slot before confirming.");
      return;
    }

    const cleanedPhone = customerPhone.trim().replace(/\D/g, "");

    if (!customerName.trim() || cleanedPhone.length < 10) {
      setMessage("Add diner name and a valid 10 digit phone number.");
      return;
    }

    if (partySize < 1 || partySize > selectedEntry.slot.seatsAvailable) {
      setMessage("Party size must fit the selected availability.");
      return;
    }

    const nextBooking: DirectBookingRecord = {
      id: createDirectBookingId(),
      placeId: selectedEntry.place.id,
      placeName: selectedEntry.place.name,
      slotId: selectedEntry.slot.id,
      startsAt: selectedEntry.slot.startsAt,
      partySize,
      customerName: customerName.trim(),
      customerPhone: cleanedPhone,
      depositAmount: selectedEntry.slot.depositAmount,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    const nextBookings = [nextBooking, ...bookings];
    window.localStorage.setItem(directBookingsStorageKey, JSON.stringify(nextBookings));
    setBookings(nextBookings);
    setMessage("Direct booking confirmed.");
    trackRasaEvent("direct_booking_created", {
      route: "/book/direct",
      placeId: nextBooking.placeId,
      placeName: nextBooking.placeName,
      metadata: {
        partySize: nextBooking.partySize,
        depositAmount: nextBooking.depositAmount,
        slotId: nextBooking.slotId,
      },
    });
  }

  return (
    <main className="direct-booking-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/book">Affiliate</Link>
          <Link href="/book/direct">Direct</Link>
          <Link href="/restaurants/dashboard">Dashboard</Link>
        </div>
      </nav>

      <section className="direct-booking-hero">
        <div>
          <p className="eyebrow">Phase 1.3</p>
          <h1>Direct booking with partner availability.</h1>
          <p className="lede">
            A first-party reservation path for partner restaurants: choose a live slot, collect
            diner details, apply deposit rules, and confirm without leaving Rasa.
          </p>
        </div>
        <HeroMedia alt="Direct restaurant booking preview" imageKey="booking">
          <div className="metric-row">
            <div>
              <span>Partner slots</span>
              <strong>{enrichedSlots.length}</strong>
            </div>
            <div>
              <span>Confirmed</span>
              <strong>{bookings.length}</strong>
            </div>
            <div>
              <span>Seats live</span>
              <strong>
                {enrichedSlots.reduce((sum, entry) => sum + entry.slot.seatsAvailable, 0)}
              </strong>
            </div>
          </div>
        </HeroMedia>
      </section>

      <section className="direct-booking-layout">
        <section className="slot-list">
          {enrichedSlots.map(({ slot, place }) => (
            <button
              className={slot.id === selectedSlotId ? "slot-card active" : "slot-card"}
              key={slot.id}
              onClick={() => setSelectedSlotId(slot.id)}
              type="button"
            >
              <VisualImage
                alt={`${place.name} availability slot preview`}
                className="card-visual"
                src={getPlaceImage(place.id)}
              />
              <span>{place.area}</span>
              <strong>{place.name}</strong>
              <em>{formatSlot(slot.startsAt)}</em>
              <small>
                {slot.seatsAvailable} seats · ₹{slot.depositAmount} deposit
              </small>
            </button>
          ))}
        </section>

        <form className="direct-booking-form" onSubmit={confirmBooking}>
          <div className="panel-heading">
            <p className="eyebrow">Confirm</p>
            <h2>{selectedEntry?.place.name ?? "Pick a slot"}</h2>
            <p>
              {selectedEntry
                ? `${formatSlot(selectedEntry.slot.startsAt)} · ${selectedEntry.slot.seatsAvailable} seats open`
                : "Choose availability to continue."}
            </p>
          </div>

          <label>
            Diner name
            <input
              placeholder="Sneha Rao"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />
          </label>

          <label>
            Diner phone
            <input
              inputMode="tel"
              placeholder="9876543210"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
            />
          </label>

          <label>
            Party size
            <input
              inputMode="numeric"
              max={selectedEntry?.slot.seatsAvailable ?? 20}
              min={1}
              type="number"
              value={partySize}
              onChange={(event) => setPartySize(Number(event.target.value))}
            />
          </label>

          {message && <p className="form-message">{message}</p>}

          <button type="submit">Confirm direct booking</button>
        </form>
      </section>
    </main>
  );
}
