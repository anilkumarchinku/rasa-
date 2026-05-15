"use client";

import {
  directBookingsStorageKey,
  verifiedReviewsStorageKey,
  type DirectBookingRecord,
  type VerifiedReviewRecord,
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

function createReviewId() {
  return `review-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function VerifiedReviewFlow() {
  const [bookings, setBookings] = useState<DirectBookingRecord[]>([]);
  const [reviews, setReviews] = useState<VerifiedReviewRecord[]>([]);
  const [bookingId, setBookingId] = useState("");
  const [rating, setRating] = useState(4);
  const [content, setContent] = useState("");
  const [dishCallout, setDishCallout] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedBookings = readJsonArray<DirectBookingRecord>(directBookingsStorageKey);
    setBookings(storedBookings);
    setReviews(readJsonArray<VerifiedReviewRecord>(verifiedReviewsStorageKey));
    setBookingId(storedBookings[0]?.id ?? "");
    trackRasaEvent("page_view", { route: "/reviews" });
  }, []);

  const reviewedBookingIds = useMemo(
    () => new Set(reviews.map((review) => review.bookingId)),
    [reviews],
  );
  const eligibleBookings = bookings.filter((booking) => !reviewedBookingIds.has(booking.id));
  const selectedBooking = eligibleBookings.find((booking) => booking.id === bookingId);

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBooking) {
      setMessage("No eligible verified booking selected.");
      return;
    }

    if (content.trim().length < 20) {
      setMessage("Write at least 20 characters so the review is useful.");
      return;
    }

    const nextReview: VerifiedReviewRecord = {
      id: createReviewId(),
      bookingId: selectedBooking.id,
      placeId: selectedBooking.placeId,
      placeName: selectedBooking.placeName,
      rating,
      content: content.trim(),
      dishCallout: dishCallout.trim() || "Overall meal",
      verifiedEater: true,
      visitDate: selectedBooking.startsAt,
      createdAt: new Date().toISOString(),
    };

    const nextReviews = [nextReview, ...reviews];
    window.localStorage.setItem(verifiedReviewsStorageKey, JSON.stringify(nextReviews));
    setReviews(nextReviews);
    setMessage("Verified Eater review published.");
    setContent("");
    setDishCallout("");
    setBookingId(eligibleBookings.find((booking) => booking.id !== selectedBooking.id)?.id ?? "");
    trackRasaEvent("verified_review_created", {
      route: "/reviews",
      placeId: nextReview.placeId,
      placeName: nextReview.placeName,
      metadata: {
        rating: nextReview.rating,
        bookingId: nextReview.bookingId,
      },
    });
  }

  return (
    <main className="reviews-shell">
      <nav className="topbar" aria-label="Rasa navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">R</span>
          <span>Rasa</span>
        </Link>
        <div className="nav-links">
          <Link href="/book/direct">Book</Link>
          <Link href="/reviews">Reviews</Link>
          <Link href="/analytics">Analytics</Link>
        </div>
      </nav>

      <section className="reviews-hero">
        <div>
          <p className="eyebrow">Phase 1.4</p>
          <h1>Reviews only verified eaters can publish.</h1>
          <p className="lede">
            The review box unlocks from confirmed direct bookings, not anonymous opinion. Every
            published review carries visit context and a Verified Eater badge.
          </p>
        </div>
        <HeroMedia alt="Verified eater review preview" imageKey="reviews">
          <div className="metric-row">
            <div>
              <span>Eligible</span>
              <strong>{eligibleBookings.length}</strong>
            </div>
            <div>
              <span>Reviews</span>
              <strong>{reviews.length}</strong>
            </div>
            <div>
              <span>Badge</span>
              <strong>Verified</strong>
            </div>
          </div>
        </HeroMedia>
      </section>

      <section className="reviews-layout">
        <form className="review-form" onSubmit={submitReview}>
          <div className="panel-heading">
            <p className="eyebrow">Publish</p>
            <h2>{selectedBooking ? selectedBooking.placeName : "No eligible booking"}</h2>
            <p>Only confirmed direct bookings appear in this selector.</p>
          </div>

          <label>
            Verified booking
            <select value={bookingId} onChange={(event) => setBookingId(event.target.value)}>
              {eligibleBookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.placeName} - party of {booking.partySize}
                </option>
              ))}
            </select>
          </label>

          <label>
            Rating
            <input
              max={5}
              min={1}
              type="number"
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
            />
          </label>

          <label>
            Dish callout
            <input
              placeholder="Filter coffee, biryani, dessert..."
              value={dishCallout}
              onChange={(event) => setDishCallout(event.target.value)}
            />
          </label>

          <label>
            Review
            <textarea
              placeholder="What worked, what did not, and who should still go?"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>

          {message && <p className="form-message">{message}</p>}

          <button disabled={!selectedBooking} type="submit">
            Publish verified review
          </button>
        </form>

        <aside className="review-list-panel">
          <div className="panel-heading">
            <p className="eyebrow">Verified Eater</p>
            <h2>Published reviews</h2>
          </div>
          <div className="review-list">
            {reviews.map((review) => (
              <article key={review.id}>
                <span>Verified Eater · {review.rating}/5</span>
                <strong>{review.placeName}</strong>
                <p>{review.content}</p>
                <em>{review.dishCallout}</em>
              </article>
            ))}
            {reviews.length === 0 && (
              <article>
                <span>Waiting</span>
                <strong>No verified reviews yet</strong>
                <p>Confirm a direct booking, then write the first review.</p>
              </article>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
