# Rasa Backend Architecture

## Launch Scope

The launch backend supports one workflow:

1. A diner pastes a valid Instagram Reel URL.
2. Rasa assigns the browser a signed, HTTP-only anonymous session cookie.
3. The server validates and normalizes the URL.
4. The saved Reel is stored in Supabase under that session.
5. The same browser can list or remove its saved Reels from the Rasa Map.

Restaurant extraction, OCR, AI matching, and geographic pinning are intentionally outside this
release. The disabled resolver endpoints return HTTP 410.

## Module Boundaries

| Module                             | Responsibility                                            |
| ---------------------------------- | --------------------------------------------------------- |
| `app/api/saves/route.ts`           | HTTP parsing, response codes, and session cookie delivery |
| `server/config.ts`                 | Server environment configuration                          |
| `server/anonymous-session.ts`      | Signed anonymous session creation and verification        |
| `server/supabase-rest.ts`          | Authenticated, server-only Supabase Data API transport    |
| `server/saved-reels/model.ts`      | Input validation and database/domain mapping              |
| `server/saved-reels/repository.ts` | Saved-Reel database queries                               |
| `server/saved-reels/service.ts`    | Deduplication, limits, and saved-Reel use cases           |
| `lib/save-sync.ts`                 | Browser cache and API synchronization                     |

The service-role key must never be imported by client components or use a `NEXT_PUBLIC_` name.

## Data Ownership

The anonymous session cookie contains a random owner identifier and an HMAC signature. The browser
cannot choose or alter the owner identifier without invalidating the signature. Every read and
delete query includes that server-verified owner identifier.

This model is private to one browser, not a permanent user account. Cross-device access requires
Supabase Auth and an authenticated `user_id` migration in a later release.

## Storage Rules

- Maximum 100 saved Reels per browser session.
- One saved copy of each normalized Reel URL per browser session.
- Only HTTPS Instagram `/reel/` URLs are accepted.
- Cloud failures fall back to browser storage so the save action is not lost.
- The `saved_places` table has RLS enabled and grants no access to `anon` or `authenticated` roles.
- Only server code holding the Supabase secret key accesses the table.

## Required Production Environment

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RASA_SESSION_SECRET
```

`RASA_SESSION_SECRET` should be a separate, stable random value. Falling back to the service key is
supported for continuity, but rotating that key would invalidate existing browser sessions.

## Verification

Run `npm run test:backend` from the repository root for the saved-Reel backend unit and route integration tests.

Before deployment, run:

```bash
npm run typecheck
npm run lint
npm run build
```

Then verify `GET /api/saves`, one valid `POST /api/saves`, one invalid POST, a duplicate POST, and
`DELETE /api/saves?id=...` against a non-production Supabase project or a local HTTP fixture.
