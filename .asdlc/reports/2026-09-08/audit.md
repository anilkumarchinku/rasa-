# ASDLC audit — 2026-09-08

Raw scanner results are evidence for review, not proof of a product defect.

| Gate | Status | Findings | New | Baselined | Waived | Note |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| duplication | FAIL | 28 | 28 | 0 | 0 ||
| boundaries | PASS | 0 | 0 | 0 | 0 ||
| patterns | PASS | 0 | 0 | 0 | 0 ||
| registry | PASS | 0 | 0 | 0 | 0 ||
| contracts | PASS | 0 | 0 | 0 | 0 ||

## New findings
- `d08806fc4f35bc47` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 10-line clone shared with apps/web/app/creators/page.tsx
- `82015b5d234df29f` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 8-line clone shared with apps/web/components/verified-review-flow.tsx
- `5b736e0af996edb3` **duplication/clone** apps/web/components/rewards-panel.tsx — 20-line clone shared with apps/web/components/verified-review-flow.tsx
- `63aada4a8a2fa08f` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 8-line clone shared with apps/web/components/rewards-panel.tsx
- `38e7840ab0db5e4a` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 8-line clone shared with apps/web/components/restaurant-claim-flow.tsx
- `15f485cd4b7fe153` **duplication/clone** apps/web/components/restaurant-billing.tsx — 23-line clone shared with apps/web/components/rewards-panel.tsx
- `b1f8cecf6988dd73` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 8-line clone shared with apps/web/components/restaurant-billing.tsx
- `23f4cff1e7133c8c` **duplication/clone** apps/web/components/restaurant-attribution-dashboard.tsx — 18-line clone shared with apps/web/components/verified-review-flow.tsx
- `77ee488a9f1fd4ba` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 10-line clone shared with apps/web/components/restaurant-attribution-dashboard.tsx
- `df4cf18c8d4785e4` **duplication/clone** apps/web/components/phase-zero-qa.tsx — 19-line clone shared with apps/web/components/verified-review-flow.tsx
- `4f7538cddf45c879` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 9-line clone shared with apps/web/components/phase-zero-qa.tsx
- `44c540ea7ed99281` **duplication/clone** apps/web/components/phase-one-qa.tsx — 23-line clone shared with apps/web/components/rewards-panel.tsx
- `f5fb4b206a7c30f6` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 8-line clone shared with apps/web/components/phase-one-qa.tsx
- `b370fd77042d01ca` **duplication/clone** apps/web/components/phase-one-qa.tsx — 13-line clone shared with apps/web/components/phase-zero-qa.tsx
- `e5ed7a9478ef31e4` **duplication/clone** apps/web/components/personal-map.tsx — 18-line clone shared with apps/web/components/universal-save.tsx
- `9c98f219adced51d` **duplication/clone** apps/web/components/pay-per-booking-promotions.tsx — 23-line clone shared with apps/web/components/verified-review-flow.tsx
- `ed79ce59bf1eb993` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 9-line clone shared with apps/web/components/pay-per-booking-promotions.tsx
- `7558e3c692297e03` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 9-line clone shared with apps/web/components/live-fest-board.tsx
- `9ecbc9f4f79dd4d5` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 8-line clone shared with apps/web/components/launch-analytics.tsx
- `98d3da2dc169c47e` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 9-line clone shared with apps/web/components/group-planning.tsx
- `c39147cf26ebb7d9` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 10-line clone shared with apps/web/components/for-you-feed.tsx
- `c6b4cb6fae546063` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 8-line clone shared with apps/web/components/direct-booking-flow.tsx
- `55f17ca49165fd5e` **duplication/clone** apps/web/components/booking-flow.tsx — 16-line clone shared with apps/web/components/verified-review-flow.tsx
- `ba631d6d0abf50f0` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 14-line clone shared with apps/web/components/booking-flow.tsx
- `d12ec369ea9ef170` **duplication/clone** apps/web/components/authenticity-score-dashboard.tsx — 18-line clone shared with apps/web/components/verified-review-flow.tsx
- `52fded162b5ff12c` **duplication/clone** apps/web/app/creator/[handle]/page.tsx — 8-line clone shared with apps/web/components/authenticity-score-dashboard.tsx
- `2ab6552346ae4ce4` **duplication/clone** apps/mobile/app/index.tsx — 6-line clone shared with apps/web/components/onboarding-flow.tsx
- `7ed789e8a2a876d6` **duplication/clone** apps/mobile/app/index.tsx — 18-line clone shared with apps/web/components/onboarding-flow.tsx

## Blind spots (standing)
- Clone detection finds textual similarity, not semantic equivalence.
- Boundary checks prove only what the approved rules express.
- Import-orphan analysis cannot see business orphans (imported but unconsumed).
- Consumer discovery is evidence, not completeness.
## Drift score: B (75/100)

open 28 · baseline 0 · waived 0 · expired waivers 0 · governed concepts 4 · gate coverage 5/5

_The score measures governance activity, not correctness — see docs/DRIFT_SCORE.md._