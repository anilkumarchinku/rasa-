# Phase 1.6 — Rasa Live Fest v1

## Scope

Phase 1.6 adds the first live commerce dining surface.

## Shipped

- Shared live fest seed records.
- Shared live fest reservation storage.
- New live fest reservation analytics event.
- `/live` page with:
  - scheduled/live/replay fest cards
  - creator and restaurant context
  - live discount and replay discount display
  - slot cap and filled counter
  - reserve-slot action

## Founder Test Path

1. Open `/live`.
2. Review scheduled, live, and replay cards.
3. Reserve a Live Fest slot.
4. Confirm the message, reserved count, and button state update.
5. Open `/analytics` and confirm the live reservation event appears.

## Notes

- Video streaming is represented by the live surface and reservation logic in this MVP tick.
- Production should connect this to Mux ingest, Supabase Realtime counters, and direct booking settlement.
