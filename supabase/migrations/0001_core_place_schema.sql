create extension if not exists postgis;

create table if not exists public.places (
  id text primary key,
  name text not null,
  slug text not null unique,
  city text not null default 'Hyderabad',
  area text not null,
  address text not null,
  geo geography(point, 4326) not null,
  cuisines text[] not null default '{}',
  price_band text not null check (price_band in ('budget', 'mid', 'premium', 'luxury')),
  vibe_tags text[] not null default '{}',
  hero_dish text not null,
  booking_url text,
  phone text,
  source text not null default 'seed',
  claim_status text not null default 'unclaimed' check (claim_status in ('unclaimed', 'pending', 'claimed', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creators (
  id text primary key,
  handle text not null unique,
  display_name text not null,
  city text not null default 'Hyderabad',
  authenticity_score numeric(3, 1) not null default 7.0,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id text primary key,
  creator_id text not null references public.creators(id) on delete cascade,
  place_id text not null references public.places(id) on delete cascade,
  source_url text,
  source_type text not null default 'manual',
  disclosure_type text not null check (disclosure_type in ('organic', 'paid', 'hosted', 'affiliate')),
  caption text,
  ai_confidence_score numeric(4, 3),
  created_at timestamptz not null default now()
);

create index if not exists places_city_area_idx on public.places (city, area);
create index if not exists places_cuisines_idx on public.places using gin (cuisines);
create index if not exists places_vibe_tags_idx on public.places using gin (vibe_tags);
create index if not exists places_geo_idx on public.places using gist (geo);
create index if not exists recommendations_place_idx on public.recommendations (place_id);
create index if not exists recommendations_creator_idx on public.recommendations (creator_id);

alter table public.places enable row level security;
alter table public.creators enable row level security;
alter table public.recommendations enable row level security;

drop policy if exists "Public can read places" on public.places;
create policy "Public can read places"
  on public.places for select
  using (true);

drop policy if exists "Public can read creators" on public.creators;
create policy "Public can read creators"
  on public.creators for select
  using (true);

drop policy if exists "Public can read recommendations" on public.recommendations;
create policy "Public can read recommendations"
  on public.recommendations for select
  using (true);

insert into public.places
  (id, name, slug, city, area, address, geo, cuisines, price_band, vibe_tags, hero_dish, source)
values
  ('hyd-bawarchi-rtc-x-roads', 'Bawarchi', 'bawarchi-rtc-x-roads', 'Hyderabad', 'RTC X Roads', 'RTC Cross Road, Chikkadpally, Hyderabad', st_point(78.4977, 17.4066)::geography, array['Biryani', 'North Indian'], 'mid', array['Iconic', 'Group meal', 'Late lunch'], 'Chicken biryani', 'seed'),
  ('hyd-shah-ghouse-tolichowki', 'Shah Ghouse', 'shah-ghouse-tolichowki', 'Hyderabad', 'Tolichowki', 'Tolichowki Main Road, Hyderabad', st_point(78.4138, 17.3993)::geography, array['Biryani', 'North Indian'], 'mid', array['Iconic', 'Dinner rush', 'Friends'], 'Mutton biryani', 'seed'),
  ('hyd-cafe-bahar-basheerbagh', 'Cafe Bahar', 'cafe-bahar-basheerbagh', 'Hyderabad', 'Basheerbagh', 'Old MLA Quarters Road, Basheerbagh, Hyderabad', st_point(78.4772, 17.4014)::geography, array['Biryani', 'North Indian'], 'mid', array['Old-school', 'Family', 'No-fuss'], 'Special biryani', 'seed'),
  ('hyd-pista-house-charminar', 'Pista House', 'pista-house-charminar', 'Hyderabad', 'Charminar', 'Shalibanda Road, Charminar, Hyderabad', st_point(78.4717, 17.3578)::geography, array['Biryani', 'Desserts'], 'mid', array['Old City', 'Haleem', 'Tour stop'], 'Haleem', 'seed'),
  ('hyd-chutneys-banjara-hills', 'Chutneys', 'chutneys-banjara-hills', 'Hyderabad', 'Banjara Hills', 'Road No. 3, Banjara Hills, Hyderabad', st_point(78.4384, 17.4249)::geography, array['South Indian', 'Telugu'], 'mid', array['Breakfast', 'Family', 'Reliable'], 'Guntur idli', 'seed'),
  ('hyd-tatva-jubilee-hills', 'Tatva', 'tatva-jubilee-hills', 'Hyderabad', 'Jubilee Hills', 'Road No. 36, Jubilee Hills, Hyderabad', st_point(78.4085, 17.4315)::geography, array['North Indian', 'Pan Asian'], 'premium', array['Date night', 'Vegetarian', 'Polished'], 'Paneer tikka platter', 'seed'),
  ('hyd-roastery-coffee-house-banjara-hills', 'Roastery Coffee House', 'roastery-coffee-house-banjara-hills', 'Hyderabad', 'Banjara Hills', 'Road No. 14, Banjara Hills, Hyderabad', st_point(78.4348, 17.4155)::geography, array['Cafe', 'Desserts'], 'premium', array['Coffee', 'Work-friendly', 'Date'], 'Cold brew', 'seed'),
  ('hyd-concu-jubilee-hills', 'Concu', 'concu-jubilee-hills', 'Hyderabad', 'Jubilee Hills', 'Road No. 45, Jubilee Hills, Hyderabad', st_point(78.3996, 17.4339)::geography, array['Cafe', 'Desserts'], 'premium', array['Dessert', 'Date', 'Quiet'], 'Chocolate eclair', 'seed'),
  ('hyd-minerva-coffee-shop-himayatnagar', 'Minerva Coffee Shop', 'minerva-coffee-shop-himayatnagar', 'Hyderabad', 'Himayatnagar', 'Himayatnagar Main Road, Hyderabad', st_point(78.4841, 17.4028)::geography, array['South Indian', 'Telugu'], 'budget', array['Breakfast', 'Classic', 'Family'], 'Filter coffee and dosa', 'seed'),
  ('hyd-ram-ki-bandi-nampally', 'Ram Ki Bandi', 'ram-ki-bandi-nampally', 'Hyderabad', 'Nampally', 'Mozamjahi Market, Nampally, Hyderabad', st_point(78.4744, 17.3843)::geography, array['Street Food', 'South Indian'], 'budget', array['Late night', 'Street', 'Quick bite'], 'Cheese dosa', 'seed'),
  ('hyd-the-hole-in-the-wall-cafe-jubilee-hills', 'The Hole In The Wall Cafe', 'the-hole-in-the-wall-cafe-jubilee-hills', 'Hyderabad', 'Jubilee Hills', 'Jubilee Hills, Hyderabad', st_point(78.4090, 17.4310)::geography, array['Cafe', 'Desserts'], 'mid', array['Brunch', 'Friends', 'Casual'], 'All-day breakfast', 'seed'),
  ('hyd-haiku-banjara-hills', 'Haiku', 'haiku-banjara-hills', 'Hyderabad', 'Banjara Hills', 'Banjara Hills, Hyderabad', st_point(78.4342, 17.4149)::geography, array['Pan Asian'], 'premium', array['Date night', 'Sushi', 'Modern'], 'Sushi platter', 'seed')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  city = excluded.city,
  area = excluded.area,
  address = excluded.address,
  geo = excluded.geo,
  cuisines = excluded.cuisines,
  price_band = excluded.price_band,
  vibe_tags = excluded.vibe_tags,
  hero_dish = excluded.hero_dish,
  source = excluded.source,
  updated_at = now();
