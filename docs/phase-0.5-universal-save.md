# Phase 0.5 - Universal Save v1

## Goal

Let a Phase 0 tester paste a creator recommendation, identify the matching Hyderabad seed place, capture creator attribution, and save the place locally.

## What Exists Now

- `/save` web route
- Manual paste input for Instagram, YouTube, WhatsApp, and free-text notes
- Source detection for Instagram, YouTube, WhatsApp, manual, and unknown
- Creator handle extraction from `@handle` text and basic Instagram profile URLs
- Seed place matching against name, area, address, cuisine, vibe tags, and hero dish
- Confidence score: `92%` for a matched seed place, `20%` fallback for unmatched input
- Local save persistence in browser `localStorage`
- Saved list showing place, area, raw input, source, creator, and timestamp
- Parser utilities in `packages/shared` for future mobile and browser extension reuse

## Known Limits

- This does not scrape Instagram or YouTube.
- This does not parse video frames, captions, or comments yet.
- This does not create server-side saves yet.
- Matching is deterministic seed-data matching, not AI extraction.

## Acceptance Checklist

- [ ] User can paste a manual place note
- [ ] User can paste an Instagram-looking recommendation
- [ ] User can paste a YouTube-looking recommendation
- [ ] User can paste a WhatsApp-style recommendation
- [ ] Parser detects source
- [ ] Parser detects creator handle where present
- [ ] Parser matches known Hyderabad seed places
- [ ] User can save a matched place
- [ ] Saved places persist after refresh
- [ ] User can clear local saves
- [ ] Web app passes format, typecheck, lint, and build

## Founder Test

Open `http://localhost:3000/save`, use the sample buttons, and confirm saves persist after refresh.

Only after you say `tested perfect`, tick `0.5 Build Universal Save v1: manual paste, Instagram/YouTube link parser, creator attribution` and move to Phase 0.6.
