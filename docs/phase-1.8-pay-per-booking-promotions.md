# Phase 1.8 — Pay-Per-Booking Promotion System

## Scope

Phase 1.8 adds the outcome-priced ad model from the PRD: restaurants pay only for converted bookings.

## Shipped

- Shared promotion storage key and typed promotion records.
- Promotion mood slots:
  - Date Night
  - Working Lunch
  - Family Sunday
  - Friday Night
  - Empty Restaurant Radar
- New promotion analytics event.
- `/restaurants/promotions` page with:
  - claimed restaurant context
  - mood slot selector
  - ₹100-₹300 bid validation
  - budget cap
  - max booking calculation
  - active promotion queue

## Founder Test Path

1. Submit a restaurant claim from `/restaurants/claim`.
2. Open `/restaurants/promotions`.
3. Choose a mood slot, bid, and budget.
4. Create the promotion.
5. Confirm the active queue, total budget, and max bookings update.
6. Open `/analytics` and confirm the promotion event appears.

## Notes

- MVP records promotion configuration locally.
- Production should connect promotions to booking settlement, budget burn, ranking auctions, and restaurant invoicing.
