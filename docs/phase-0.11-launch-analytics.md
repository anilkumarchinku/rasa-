# Phase 0.11 — Launch Analytics

## Scope

Phase 0.11 adds the first founder-facing telemetry loop for the Phase 0 MVP.

## Shipped

- Shared analytics storage key and typed event records.
- Client analytics helper for local event capture.
- Event tracking for:
  - page views on `/save`, `/book`, `/rewards`, and `/analytics`
  - save parsing
  - successful saves
  - affiliate booking intent creation
  - scratch-card unlocks
  - referral invite taps
- `/analytics` dashboard with:
  - save-to-reward funnel
  - creator attribution by saves/bookings/rewards
  - page-view retention counts
  - latest event stream
  - conversion and reward unlock rates

## Founder Test Path

1. Open `/save`, parse a seed Hyderabad place, and save it.
2. Open `/book` and click a booking CTA.
3. Open `/rewards` and unlock a scratch card or add a referral invite.
4. Open `/analytics`.
5. Confirm the funnel, attribution table, route counts, and latest events update.

## Notes

- This is local MVP analytics through browser storage.
- Production analytics can later replace the storage helper with PostHog or server events without changing the event names.
