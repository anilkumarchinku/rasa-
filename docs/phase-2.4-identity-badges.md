# Phase 2.4 - User Tiers, Badges, And Rasa Identity Loops

## Shipped

- Added `/you/identity` as the diner identity surface.
- Added tier, verified visit count, weekly streak, and badge display.
- Added badge unlock action that recalculates tier progress.
- Added analytics event tracking for badge unlocks.

## Founder Test Path

1. Open `/you/identity`.
2. Click `Unlock next badge`.
3. Confirm tier, streak, visit count, and badge count update.

## Production Notes

- Move badge rules into a server-side rules engine.
- Require verified visits before tier upgrades.
- Generate share images for Instagram Stories after each badge unlock.
