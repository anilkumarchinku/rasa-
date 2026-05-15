# Phase 0.7 - For You Feed v1

## Goal

Create the first creator-led recommendation feed using Hyderabad seed places, creator trust signals, disclosure labels, and saved-area personalization.

## What Exists Now

- `/feed` web route
- Seed creator profiles with authenticity scores
- Seed feed recommendations linked to seed places
- Disclosure labels: organic, hosted, affiliate
- Live-fest teaser item
- Feed sorting that boosts recommendations from areas the user has saved
- Feed context panel showing saved-area personalization
- Recommendation cards with creator, trust score, place area, saves, booking-intent counts, and actions

## Acceptance Checklist

- [ ] `/feed` loads without saved places
- [ ] Feed renders creator recommendations
- [ ] Feed shows disclosure labels
- [ ] Feed shows creator trust scores
- [ ] Feed includes a live-fest teaser
- [ ] Saving a place affects saved-area context
- [ ] Feed cards link to save and places
- [ ] Web app passes format, typecheck, lint, and build

## Founder Test

Open `http://localhost:3000/feed`. Save at least one place from `http://localhost:3000/save`, then refresh the feed to see saved-area personalization.
