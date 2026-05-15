# Phase 2.1 — Group Planning And WhatsApp Invites

## Scope

Phase 2.1 starts the social planning loop for group dining decisions.

## Shipped

- Shared group plan storage key and typed group plan records.
- New group plan analytics event.
- `/plan/group` page with:
  - plan name
  - host name
  - invited friend count
  - two-to-six place picker
  - simulated vote totals
  - winning place calculation
  - WhatsApp invite URL generation
  - latest plan summary

## Founder Test Path

1. Open `/plan/group`.
2. Select at least two places.
3. Set the plan name and invited friend count.
4. Create the WhatsApp plan.
5. Confirm the latest plan summary and invite link appear.
6. Open `/analytics` and confirm the group plan event appears.

## Notes

- MVP vote counts are simulated for deterministic testing.
- Production should add multi-user voting, contact invites, calendar reminders, and direct booking handoff.
