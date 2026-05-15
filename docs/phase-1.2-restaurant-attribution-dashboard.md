# Phase 1.2 — Restaurant Attribution Dashboard

## Scope

Phase 1.2 gives restaurants a first view of creator-driven outcomes.

## Shipped

- `/restaurants/dashboard` page with:
  - total saves
  - total booking intents
  - estimated attributed revenue
  - creator performance table
  - conversion rate by creator
  - claimed listing context
  - best creator and trust score summary

## Founder Test Path

1. Save a creator-attributed place from `/save`.
2. Book that saved place from `/book`.
3. Submit a claim from `/restaurants/claim`.
4. Open `/restaurants/dashboard`.
5. Confirm creator saves, bookings, conversion, and estimated revenue populate.

## Notes

- Revenue uses a temporary ₹1,200 estimated AOV.
- Production should replace local storage with booking settlement and restaurant invoice data.
