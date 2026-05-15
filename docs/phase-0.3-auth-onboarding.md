# Phase 0.3 - Auth And Onboarding

## Goal

Create a testable Phase 0 sign-in and onboarding path before paid OTP, Supabase Auth, and MSG91 are wired.

## What Exists Now

- Phone number entry
- Demo OTP verification with `123456`
- Hyderabad locked as the launch city
- Cuisine preference selection from the shared Phase 0 cuisine list
- Minimum 3 cuisine selections
- Local profile persistence in browser `localStorage`
- Signed-in home summary with reset action
- Mobile screen updated with the same Phase 0.3 onboarding intent
- Mobile flow supports phone, demo OTP, cuisine selection, and reset in local state

## Why This Is Placeholder Auth

The product needs a real user journey before the external auth stack is worth wiring. This lets the founder test the onboarding feel now while keeping the implementation replaceable with Supabase Auth + MSG91 later.

## Acceptance Checklist

- [ ] User can enter a phone number
- [ ] Invalid phone number shows an error
- [ ] User can verify with demo OTP `123456`
- [ ] Wrong OTP shows an error
- [ ] City is fixed to Hyderabad
- [ ] User can choose at least 3 cuisines
- [ ] Onboarding completion persists after refresh
- [ ] User can reset the test profile
- [ ] Web app passes format, typecheck, lint, and build
- [ ] Mobile TypeScript passes

## Founder Test

Open `http://localhost:3000`, complete the flow, refresh the page, and confirm the profile remains.

Only after you say `tested perfect`, tick `0.3 Build auth and onboarding: phone OTP, city, cuisine preferences` and move to Phase 0.4.
