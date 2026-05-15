# Phase 1.5 — Creator Authenticity Score v1

## Scope

Phase 1.5 makes creator trust visible through the five-component Authenticity Score from the PRD.

## Shipped

- Shared score weights:
  - pre-recommendation visits: 35%
  - disclosure compliance: 20%
  - follow-through: 15%
  - outcome match: 20%
  - negative honesty: 10%
- `/creators/trust` page with:
  - creator score cards
  - score component bars
  - recommendation, save, booking, and review signals
  - median score summary

## Founder Test Path

1. Open `/creators/trust`.
2. Confirm each creator has a score and five visible components.
3. Create saves, bookings, and verified reviews.
4. Return to `/creators/trust` and confirm creator signals update.

## Notes

- v1 uses MVP local signals plus clear seeded baselines where production verification data is not available yet.
- Production should compute this server-side on a scheduled weekly job.
