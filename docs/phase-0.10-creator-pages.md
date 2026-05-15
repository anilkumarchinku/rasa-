# Phase 0.10 - Creator Vanity Pages And Onboarding Basics

## Goal

Create public creator surfaces and a basic manual onboarding model for Phase 0 creator attribution.

## What Exists Now

- `/creators` index route
- `/creator/[handle]` creator vanity routes
- Static params for seed creators
- Creator trust score display
- Creator recommendation cards
- Disclosure and live-tease labels
- Manual onboarding panel
- Save and book actions from creator recommendations

## Acceptance Checklist

- [ ] `/creators` loads
- [ ] Each seed creator links to a vanity page
- [ ] `/creator/hyderabadfoodie` loads
- [ ] Creator trust score renders
- [ ] Creator recommendations render
- [ ] Recommendation cards show disclosures
- [ ] Recommendation cards link to save and book
- [ ] Web app passes format, typecheck, lint, and build

## Founder Test

Open `http://localhost:3000/creators`, then open one creator page.

Note: true `rasa.in/@handle` URLs need a later rewrite because Next App Router reserves `@` folders for parallel routes.
