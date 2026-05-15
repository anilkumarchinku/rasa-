create table if not exists public.saved_places (
  id text primary key,
  user_key text not null,
  place_id text not null,
  place_name text not null,
  area text not null,
  source text not null check (source in ('instagram', 'youtube', 'whatsapp', 'manual', 'unknown')),
  source_url text,
  creator_handle text,
  raw_input text not null,
  confidence numeric(4, 3) not null default 0,
  resolution_status text check (resolution_status in ('matched', 'pending', 'review')),
  resolver_note text,
  resolved_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists saved_places_user_created_idx
  on public.saved_places (user_key, created_at desc);

create index if not exists saved_places_place_idx
  on public.saved_places (place_id);

create index if not exists saved_places_resolution_idx
  on public.saved_places (resolution_status);

alter table public.saved_places enable row level security;

drop policy if exists "Service role manages saved places" on public.saved_places;
create policy "Service role manages saved places"
  on public.saved_places
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
