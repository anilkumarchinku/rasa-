# Phase 0.4 - Core Place Database And Hyderabad Seed Data

## Goal

Create the first reliable Hyderabad place dataset and database schema that future save, map, creator recommendation, and booking flows can build on.

## What Exists Now

- 12 typed Hyderabad seed places in `packages/shared`
- Place fields for name, area, address, geo coordinates, cuisines, price band, vibe tags, hero dish, and booking/contact fallback fields
- Derived seed area list and seed count
- Supabase SQL migration for `places`, `creators`, and `recommendations`
- PostGIS-enabled `places.geo` column and indexes for city/area, cuisines, vibes, and geo queries
- Public read RLS policies for Phase 0 discovery data
- Web test page at `/places`

## Why This Shape

The first database needs to support three near-term loops:

- Save a place from a creator recommendation
- Render saved places on a map
- Preserve creator and booking attribution

The SQL schema includes creator and recommendation tables now because place data without attribution would force a migration rewrite in Phase 0.5.

## Acceptance Checklist

- [ ] Seed data contains at least 10 Hyderabad places
- [ ] Each seed place has coordinates
- [ ] Each seed place has cuisine, price band, vibe tags, and hero dish
- [ ] SQL migration creates core place, creator, and recommendation tables
- [ ] SQL migration has useful indexes
- [ ] SQL migration enables RLS with public read policies
- [ ] `/places` renders the seed dataset
- [ ] Web app passes format, typecheck, lint, and build

## Founder Test

Open `http://localhost:3000/places` and confirm the Hyderabad place dataset looks right enough for Phase 0.

Only after you say `tested perfect`, tick `0.4 Build core place database and Hyderabad seed data` and move to Phase 0.5.
