# Phase 0.9 - Scratch Cards And Referral Basics

## Goal

Add a simple reward loop after booking intent and a referral hook for Phase 0 growth testing.

## What Exists Now

- `/rewards` web route
- Scratch cards generated from local booking-intent records
- Deterministic reward values from ₹10 to ₹500
- Local Rasa Cash wallet balance
- Reward history
- Referral code generation
- Simulated invite counter
- Pending referral value display

## Acceptance Checklist

- [ ] `/rewards` loads
- [ ] Booking intents create scratch-card eligibility
- [ ] Scratching creates a reward
- [ ] Wallet balance updates
- [ ] Reward history renders
- [ ] Referral code is generated
- [ ] Simulated invite increments invite count
- [ ] Web app passes format, typecheck, lint, and build

## Founder Test

Click a booking CTA at `http://localhost:3000/book`, then open `http://localhost:3000/rewards` and scratch the card.
