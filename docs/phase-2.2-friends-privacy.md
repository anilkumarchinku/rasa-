# Phase 2.2 - Friends' Saves And Privacy Controls

## Shipped

- Added `/friends` as the opt-in friends' saves surface.
- Added local privacy controls for `private`, `friends_only`, and `public` share modes.
- Added social proof toggle for "friends saved this" listing context.
- Added analytics event tracking for privacy updates.

## Founder Test Path

1. Open `/friends`.
2. Change the share mode and opted-in friend count.
3. Toggle social proof.
4. Click `Save privacy` and confirm the saved message appears.

## Production Notes

- Replace localStorage with account-backed privacy preferences.
- Add contact graph consent review before showing any friend activity.
- Hide friend signals until both users have opted into sharing.
