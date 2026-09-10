# Rasa Architecture

This document records the architecture currently implemented in the repository. It is approved for
the single-feature saved-Reel launch by the founder's setup request on 8 September 2026.

## System Shape

Rasa is an npm workspace monorepo. The Next.js web application owns the current production surface,
the Expo application is the future native client, and reusable contracts live in workspace packages.
Supabase is accessed only by server-side web modules.

## Homes

| Concern                   | Home                     | Rule                                                                              |
| ------------------------- | ------------------------ | --------------------------------------------------------------------------------- |
| Web pages and HTTP routes | `apps/web/app/`          | Routes parse HTTP and delegate business behavior.                                 |
| Web UI                    | `apps/web/components/`   | Components may use browser utilities and shared packages, never server internals. |
| Browser-side helpers      | `apps/web/lib/`          | Local persistence and HTTP synchronization only.                                  |
| Backend business logic    | `apps/web/server/`       | Models, services, repositories, sessions, and provider transports.                |
| Native application        | `apps/mobile/`           | Consumes shared packages and public HTTP contracts, not web internals.            |
| Shared product contracts  | `packages/shared/`       | Framework-neutral types and deterministic helpers used by applications.           |
| Database package          | `packages/db/`           | Shared database schema/types when adopted by multiple backend entry points.       |
| Shared tooling            | `packages/config/`       | TypeScript and lint configuration only.                                           |
| Database evolution        | `supabase/migrations/`   | Forward-only, reviewable SQL migrations.                                          |
| Governed product meaning  | `docs/BUSINESS_RULES.md` | Human-owned definitions that implementations must preserve.                       |

## Enforced Boundaries

- Browser-facing and mobile modules must not import `apps/web/server/`.
- Backend modules must not import rendered components.
- Shared packages must not import application code.
- Mobile code must not import web internals.
- Circular dependencies are forbidden.
- Supabase service-role credentials are server-only and must never use a `NEXT_PUBLIC_` name.

## Saved Reel Request Flow

1. `apps/web/components/universal-save.tsx` validates the user interaction and calls the save API.
2. `apps/web/app/api/saves/route.ts` parses HTTP and establishes a signed browser session.
3. `apps/web/server/saved-reels/service.ts` applies deduplication and retention rules.
4. `apps/web/server/saved-reels/repository.ts` owns saved-Reel queries.
5. `apps/web/server/supabase-rest.ts` is the only Supabase REST transport for this context.
6. The response is cached locally for resilient display in the Rasa Map saved list.

## Change Rule

Changes to homes, dependency boundaries, governed definitions, waivers, baselines, or CI are GOVERN
operations. They require a human approval pointer and must be reviewed alongside the generated ASDLC
audit evidence.
