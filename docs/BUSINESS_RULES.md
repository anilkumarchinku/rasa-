# Business Rules Registry

Definitions are grounded in Rasa Master PRD v1.0 and the founder-approved launch scope recorded in
the Codex thread on 8 September 2026.

## Saved Reel Intake

- Id: `saved-reel.intake`
- Bounded context: diner-discovery
- Version: 1.0.0
- Owner: Varun, Founder
- Approval ref: Rasa Master PRD v1.0, Universal Save; founder launch-scope instruction, 8 September 2026
- Definition: A launch save accepts only a valid HTTPS Instagram Reel URL. Rasa normalizes the URL, ignores client-provided ownership and place metadata, and stores it immediately even when restaurant extraction is unavailable.
- Risk tier: blocking
- Contract tests: `apps/web/server/saved-reels/model.test.ts` and `apps/web/server/saves-route.integration.test.ts`; profile: authoritative-server
- Canonical implementation: `apps/web/server/saved-reels/model.ts`
- Consumers: `apps/web/app/api/saves/route.ts` via direct import; confidence high; browser-extension and native share-sheet consumers are not implemented
- Decisions/notes: Restaurant extraction, OCR, AI matching, and geographic pinning are outside this launch contract.
- Last audit sync: 2026-09-08

## Anonymous Save Ownership

- Id: `saved-reel.ownership`
- Bounded context: identity-and-privacy
- Version: 1.0.0
- Owner: Varun, Founder
- Approval ref: Rasa Master PRD v1.0, Privacy by Design; founder launch-scope instruction, 8 September 2026
- Definition: Before account authentication exists, every saved Reel belongs to a cryptographically signed anonymous browser session. A client cannot select another owner identifier, and every list or delete operation must filter by the server-verified owner.
- Risk tier: blocking
- Contract tests: `apps/web/server/anonymous-session.test.ts` and `apps/web/server/saves-route.integration.test.ts`; profile: authoritative-server
- Canonical implementation: `apps/web/server/anonymous-session.ts`
- Consumers: `apps/web/app/api/saves/route.ts` via direct import; confidence high; cross-device identity is intentionally unsupported
- Decisions/notes: Cross-device access requires Supabase Auth and a later authenticated-user migration.
- Last audit sync: 2026-09-08

## Saved Reel Retention

- Id: `saved-reel.retention`
- Bounded context: diner-discovery
- Version: 1.0.0
- Owner: Varun, Founder
- Approval ref: Founder launch-scope instruction, 8 September 2026
- Definition: One anonymous browser session may retain at most 100 Reels and only one copy of each normalized Reel URL. Re-saving an existing URL returns the existing record rather than creating a duplicate.
- Risk tier: reversible
- Contract tests: `apps/web/server/saved-reels/service.test.ts`; profile: authoritative-server
- Canonical implementation: `apps/web/server/saved-reels/service.ts`
- Consumers: `apps/web/app/api/saves/route.ts` via direct import and `apps/web/components/universal-save.tsx` through the HTTP API; confidence high
- Decisions/notes: The database unique index is the concurrency backstop; the service check provides the normal path.
- Last audit sync: 2026-09-08

## Resolver Boundary

- Id: `saved-reel.resolution`
- Bounded context: place-resolution
- Version: 1.0.0
- Owner: Varun, Founder
- Approval ref: Founder single-feature launch decision in the Codex thread
- Definition: The launch product must never invent a restaurant, coordinate, or map pin from an unresolved Reel. Resolver endpoints remain disabled until a verified extraction pipeline exists; unresolved Reels remain visible in the user's Rasa Map saved list.
- Risk tier: blocking
- Contract tests: HTTP 410 behavior is verified by production build route inspection; a dedicated route contract test is still required before enabling resolution.
- Canonical implementation: `apps/web/app/api/instagram/resolve/route.ts` and `apps/web/app/api/resolver/run/route.ts`
- Consumers: save and map screens through route behavior; confidence medium because no external resolver is active
- Decisions/notes: Enabling resolution is a versioned business-rule change requiring verified location evidence.
- Last audit sync: 2026-09-08
