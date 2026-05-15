# Phase 1.3 — Direct Booking And Partner Availability

## Scope

Phase 1.3 adds the first first-party booking flow for partner restaurants.

## Shipped

- Shared direct booking storage key.
- Shared partner availability seed slots.
- Typed direct booking records.
- New direct booking analytics event.
- `/book/direct` page with:
  - partner availability slot list
  - selected slot details
  - diner name and phone capture
  - party size validation
  - deposit display
  - local direct booking confirmation

## Founder Test Path

1. Open `/book/direct`.
2. Select a partner slot.
3. Enter diner name, phone, and party size.
4. Confirm direct booking.
5. Confirm the success message and confirmed booking count update.
6. Open `/analytics` to see the direct booking event.

## Notes

- Availability is seed data for MVP.
- Production should sync availability with restaurant POS/table inventory and payment status.
