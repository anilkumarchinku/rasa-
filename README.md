# Rasa

The trust layer for how India eats out.

## Workspace

- `apps/web` - Next.js web app for diner web, creator pages, and future dashboards.
- `apps/mobile` - Expo app shell for the diner mobile app.
- `packages/shared` - Shared product constants, schemas, and utility types.
- `packages/db` - Database types and future Supabase helpers.
- `packages/config` - Shared TypeScript configuration.
- `docs` - Product, phase, and implementation docs.
- `supabase/migrations` - Database migrations.

## Commands

```bash
npm install
npm run dev:web
npm run typecheck
npm run lint
npm run phase:status
```

Mobile uses Expo SDK 54, which targets React Native 0.81 and React 19.1.

## Gated Build Rule

Each phase tick is tested by the founder before the next tick begins. A tick only moves forward after the founder says:

```text
tested perfect
```
