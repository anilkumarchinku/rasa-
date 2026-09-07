delete from public.saved_places as older
using public.saved_places as newer
where older.user_key = newer.user_key
  and older.source_url is not null
  and older.source_url = newer.source_url
  and (
    older.created_at < newer.created_at
    or (older.created_at = newer.created_at and older.id < newer.id)
  );

create unique index if not exists saved_places_user_source_url_uidx
  on public.saved_places (user_key, source_url)
  where source_url is not null;

drop policy if exists "Service role manages saved places" on public.saved_places;

revoke all privileges on table public.saved_places from anon, authenticated;
