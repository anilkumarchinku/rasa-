# Phase 0.2 - Repo, Architecture, Environments, And Base Tooling

## Goal

Create the foundation for the Rasa build so Phase 0 features can be implemented without changing the project shape every tick.

## Architecture Chosen

- Monorepo with npm workspaces
- Next.js web app in `apps/web`
- Expo SDK 54 mobile shell in `apps/mobile`
- Shared constants and types in `packages/shared`
- Database-facing types in `packages/db`
- Shared TypeScript baseline in `packages/config`
- Supabase migrations in `supabase/migrations`

## Why This Shape

- The web app can support marketing, creator pages, place pages, and future dashboards.
- The mobile app can become the main diner experience without blocking web progress.
- Shared packages keep city, cuisine, place, creator, and attribution types consistent.
- Supabase migrations live in-repo from day one so the data model stays reviewable.

## Files Added

- Root workspace config: `package.json`, `tsconfig.base.json`, `.npmrc`, `.gitignore`
- Environment template: `.env.example`
- Docs: `README.md`, `docs/phase-0.2-repo-setup.md`
- Work log sheet: `docs/work-log.csv`
- Web app shell: `apps/web`
- Mobile app shell: `apps/mobile`
- Shared packages: `packages/shared`, `packages/db`, `packages/config`
- Utility script: `scripts/phase-status.mjs`

## Version Baseline

- Node.js `>=20.19.0`
- Expo SDK `^54.0.0`
- Expo Router `~6.0.23`
- React Native `0.81.0`
- React `19.1.0` for mobile
- Next build skips duplicate build-time linting; `npm run lint` is the explicit lint gate.

## Commands To Test

```bash
npm install
npm run typecheck
npm run dev:web
npm run dev:mobile
npm run phase:status
```

## Work Log Rule

Every meaningful change, including small setup fixes and verification steps, is recorded in `docs/work-log.csv`.

## Acceptance Checklist

- [ ] Root workspace has npm workspaces configured
- [ ] Web app shell exists and imports shared Rasa constants
- [ ] Mobile app shell exists and imports shared Rasa constants
- [ ] Shared TypeScript package exists
- [ ] Database package exists
- [ ] Env template exists
- [ ] README explains the workspace and commands
- [ ] Phase status script can read the gated checklist

## Founder Test

Run or review the commands above. Only after you say `tested perfect`, tick `0.2 Set up repo, app architecture, environments, and base tooling` and move to Phase 0.3.
