# Phase 0.6 - Personal Map v1

## Goal

Show saved places from Universal Save on a personal Hyderabad map surface with filters and place cards.

## What Exists Now

- `/map` web route
- Local saved places loaded from the same `localStorage` key used by `/save`
- Saved records enriched from the Hyderabad seed place database
- Map-like coordinate canvas using seed latitude/longitude
- Saved pins and seed-place reference pins
- Filters by area, source, and cuisine
- Selected place detail panel
- Saved place cards synced with selected map pin
- Empty state linking back to `/save`

## Why This Is Map-Like First

Mapbox needs a real token and billing setup, so Phase 0.6 uses a deterministic coordinate canvas. The UX and data contract are ready for Mapbox, but the product can be tested without external keys.

## Acceptance Checklist

- [ ] `/map` loads without saved places
- [ ] Empty state points user to `/save`
- [ ] Saves created on `/save` appear on `/map`
- [ ] Saved pins render on the map canvas
- [ ] Seed reference pins render behind saved pins
- [ ] Area filter works
- [ ] Source filter works
- [ ] Cuisine filter works
- [ ] Place cards update with filters
- [ ] Clicking a place card updates selected details
- [ ] Web app passes format, typecheck, lint, and build

## Founder Test

Create at least one saved place at `http://localhost:3000/save`, then open `http://localhost:3000/map`.

Only after you say `tested perfect`, tick `0.6 Build Personal Map v1 with saved places, filters, and place cards` and move to Phase 0.7.
