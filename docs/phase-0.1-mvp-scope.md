# Phase 0.1 - MVP Scope Lock

## Goal

Lock the smallest useful Rasa wedge: a diner can save a restaurant from a creator link, see it in their saved map/list, and take a booking action that preserves creator attribution.

## Phase 0 Product Promise

Rasa should answer one painful user question:

> "Where are all the places I saved from creators, and how do I actually go there?"

## MVP User

Primary launch user:

- Hyderabad diner
- Saves restaurants from Instagram, YouTube, WhatsApp, or manual links
- Wants a personal place list/map and fast booking action
- Trusts creator context more than generic ratings

## MVP Creator

Primary launch creator:

- Hyderabad food creator with 10k-100k followers
- Wants a public recommendation page
- Wants proof of saves and booking intent
- Does not need fully automated payouts in Phase 0

## MVP Restaurant

Primary launch restaurant:

- Hyderabad restaurant that can receive booking intent through affiliate/deeplink/manual contact
- Does not need a self-serve dashboard in Phase 0
- Needs enough attribution data for the founder to show early value manually

## In Scope For Phase 0

### Diner App/Web

- Phone/email placeholder auth if OTP is not wired yet
- City fixed to Hyderabad
- Onboarding with cuisine preferences
- Add/save place by pasting a URL or entering place details manually
- Saved places list
- Saved places map or map-ready layout
- Place detail page with creator attribution
- Booking CTA through affiliate/deeplink/manual booking URL
- Basic profile with saved count and booking count

### Creator Surfaces

- Creator profile route/page
- Creator recommendation list
- Save attribution per recommendation
- Booking click attribution per recommendation
- Manual creator onboarding data model

### Restaurant/Place Data

- Hyderabad seed list
- Place name, area, address, cuisine, price band, coordinates when available
- Booking URL or contact fallback
- Creator recommendation linkage

### Analytics

- Save created
- Booking CTA clicked
- Recommendation viewed
- Creator attribution captured
- User activated when they save first place

## Out Of Scope Until Later

- Direct POS integrations
- Live streaming
- Real payment deposits
- Scratch card wallet settlement
- Full Authenticity Score automation
- Bill OCR
- Restaurant self-serve claim flow
- Group planning
- Family Mode
- Advanced AI extraction from video/image
- Multi-city support

## Manual Operations Allowed

These are acceptable in Phase 0 because speed matters more than automation:

- Founder manually verifies creators
- Founder manually adds or corrects restaurants
- Founder manually maps malformed links to places
- Founder manually exports attribution reports for restaurants
- Founder manually settles creator pilot rewards

## Phase 0.1 Acceptance Checklist

- [ ] MVP promise is clear and limited to save, discover, and book intent
- [ ] Diner, creator, and restaurant Phase 0 users are defined
- [ ] In-scope features are small enough for a solo 8-week build
- [ ] Out-of-scope features are explicitly deferred
- [ ] Manual operations are listed so we do not overbuild
- [ ] Phase 0 success metrics are measurable

## Phase 0 Success Metrics

- 500 beta users
- 50 creators onboarded
- 60% of beta users save 5+ places in first week
- 30% weekly returning users
- 15% of saved places produce a booking CTA click
- 80% of creator recommendations have valid place attribution

## Founder Test

Review this file and confirm whether the MVP scope feels tight enough to build first.

Only after you say `tested perfect`, tick `0.1 Lock MVP scope for save-and-book wedge` and move to Phase 0.2.
