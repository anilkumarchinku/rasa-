# Phase 2.3 - Bill OCR Cashback And Creator Attribution

## Shipped

- Added `/bill-scan` as the Bill OCR cashback MVP.
- Added bill amount capture, restaurant selection, wallet credit calculation, and scan history.
- Added creator attribution metadata for matched bill scans.
- Added analytics event tracking for scan credits.

## Founder Test Path

1. Open `/bill-scan`.
2. Pick a restaurant and enter a bill amount.
3. Click `Credit cashback`.
4. Confirm wallet total and credit history update.

## Production Notes

- Replace the mock OCR form with Google Cloud Vision extraction.
- Validate bill timestamp, GST/FSSAI, duplicate bill numbers, and image hashes.
- Route unmatched scans into manual review before creator credit settlement.
