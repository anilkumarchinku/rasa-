# Phase 1.7 — Restaurant SaaS Plans And Billing

## Scope

Phase 1.7 converts claimed restaurants into paid SaaS partners with clear monthly tiers.

## Shipped

- Shared restaurant SaaS plan definitions:
  - Starter — ₹999/month
  - Growth — ₹2,499/month
  - Pro — ₹4,999/month
- Shared restaurant subscription storage and typed subscription records.
- New restaurant subscription analytics event.
- `/restaurants/billing` page with:
  - plan cards
  - active subscription state
  - draft invoice state
  - claimed restaurant account context
  - MRR summary

## Founder Test Path

1. Submit a claim from `/restaurants/claim`.
2. Open `/restaurants/billing`.
3. Activate a plan.
4. Confirm the active plan, invoice status, and MRR update.
5. Open `/analytics` and confirm the subscription event appears.

## Notes

- Billing status is local MVP state.
- Production should connect this to Razorpay subscriptions, GST invoices, and payment webhooks.
