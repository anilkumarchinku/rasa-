# Phase 0.8 - Affiliate Booking Deeplink Flow

## Goal

Create a Phase 0 booking-intent flow that preserves creator attribution before sending the user to an affiliate or fallback booking destination.

## What Exists Now

- `/book` web route
- Booking URLs on Hyderabad seed places
- Local booking-intent records
- Provider detection for Zomato, EazyDiner, and manual fallback
- Creator attribution preserved when the booking starts from a saved place
- Booking intent log in local storage
- Bookable place cards with saved-attribution state

## Acceptance Checklist

- [ ] `/book` loads
- [ ] Bookable places render
- [ ] Saved places show saved attribution
- [ ] Booking click creates local intent record
- [ ] Intent record stores place, provider, creator, and timestamp
- [ ] Booking click opens affiliate/fallback URL
- [ ] Web app passes format, typecheck, lint, and build

## Founder Test

Open `http://localhost:3000/book`, click a booking CTA, and confirm the intent count increases.
