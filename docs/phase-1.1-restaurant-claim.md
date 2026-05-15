# Phase 1.1 — Restaurant Claim And Verification Flow

## Scope

Phase 1.1 starts the restaurant-side product loop with a self-serve claim flow for seed listings.

## Shipped

- Shared restaurant claim storage key and typed claim record.
- New analytics event for submitted restaurant claims.
- `/restaurants/claim` page with:
  - seed listing selector
  - owner name and phone fields
  - GST number validation
  - FSSAI number validation
  - local claim persistence
  - latest claim review panel
  - ops queue count

## Founder Test Path

1. Open `/restaurants/claim`.
2. Pick a Hyderabad seed restaurant.
3. Enter owner name, 10 digit phone, 15 character GST, and 14 digit FSSAI.
4. Submit the claim.
5. Confirm the latest claim panel and claim count update.
6. Open `/analytics` and confirm the claim event appears in the event stream.

## Notes

- Validation is format-only for MVP.
- Production verification should call GST/FSSAI APIs or a KYC provider before enabling dashboards.
