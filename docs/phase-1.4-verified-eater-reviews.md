# Phase 1.4 — Verified-Eater Reviews

## Scope

Phase 1.4 makes reviews dependent on verified dining activity instead of open anonymous posting.

## Shipped

- Shared verified review storage key and typed review record.
- New verified review analytics event.
- `/reviews` page with:
  - eligible confirmed direct booking selector
  - rating input
  - dish callout
  - review content validation
  - Verified Eater badge display
  - published review list

## Founder Test Path

1. Confirm a direct booking at `/book/direct`.
2. Open `/reviews`.
3. Select the eligible booking.
4. Add rating, dish callout, and review text.
5. Publish the review.
6. Confirm the review appears with the Verified Eater badge.

## Notes

- MVP eligibility uses direct booking records.
- Production should also accept completed Rasa bookings and verified bill scans.
