# Instagram Metadata/OCR/AI Resolver Checklist

## Goal

Turn a plain Instagram Reel URL into a trustworthy Rasa saved spot without inventing restaurant data.

## Current Implementation Status

- [x] Save plain Instagram URLs without blocking the user.
- [x] Show unresolved links in the personal map/list as auto-resolving.
- [x] Direct text match against known Rasa seed places.
- [x] Demo shortcode fixtures for local testing.
- [x] Optional Meta oEmbed metadata path using `META_INSTAGRAM_OEMBED_TOKEN` or `META_ACCESS_TOKEN`.
- [x] Optional AI extraction path using `OPENAI_API_KEY`.
- [x] Resolver result states: `resolved`, `pending`, `review`.
- [x] Confidence handling prevents low-confidence matches from becoming map pins.
- [x] Saved-card UI distinguishes matched restaurants from links needing detection or verification.

## Production Setup Checklist

- [ ] Create Meta developer app and enable Instagram oEmbed access.
- [ ] Add `META_INSTAGRAM_OEMBED_TOKEN` to Vercel environment variables.
- [ ] Add `OPENAI_API_KEY` to Vercel environment variables.
- [ ] Optional: set `OPENAI_RESOLVER_MODEL` to the chosen low-cost model.
- [ ] Add a worker queue for retries and background processing.
- [ ] Capture thumbnail or video frame where platform terms allow it.
- [ ] Send OCR text/image to the resolver only when metadata is insufficient.
- [ ] Match AI extraction against the Rasa restaurant database.
- [ ] Route unknown extracted restaurant names to manual/place verification.
- [ ] Add an ops screen for review items.

## Confidence Rules

- `>= 0.78` and known place match: auto-resolve to map pin.
- `0.50 - 0.77`: keep in review with extracted candidate name.
- `< 0.50`: keep pending and retry/manual review.

## Cost Guardrails

- Metadata first: near zero marginal API cost.
- AI/OCR only when metadata cannot identify the place.
- Estimated MVP budget: about ₹0.40-₹1.00 per difficult Reel.
- Store resolver results so the same Reel is not charged twice.
