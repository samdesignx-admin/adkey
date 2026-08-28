create extension if not exists "pgcrypto";

create type public.ad_status as enum ('draft','scheduled','active','paused','expired','archived');
create type public.ad_key_status as enum ('active','paused','expired');
create type public.event_type as enum ('QR_SCAN','CODE_ENTRY','AD_VIEW','CTA_CLICK','OFFER_VIEW','OFFER_CLAIM','SAVE_AD','LEAD_SUBMIT');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.advertisers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  description text,
  website text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_locations (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references public.advertisers(id) on delete cascade,
  address text, city text, state text, zip text, country text,
  latitude numeric, longitude numeric, hours jsonb,
  created_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references public.advertisers(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'draft',
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ads (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references public.advertisers(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  title text not null,
  headline text,
  description text,
  cta_label text,
  destination_url text,
  phone text,
  status public.ad_status not null default 'draft',
  start_at timestamptz,
  end_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ad_media (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  media_type text not null check (media_type in ('image','video')),
  storage_path text not null,
  thumbnail_path text,
  sort_order integer not null default 0,
  alt_text text,
  created_at timestamptz not null default now()
);

create table public.ad_keys (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  code text not null unique check (char_length(code) between 6 and 8),
  status public.ad_key_status not null default 'active',
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  expires_at timestamptz
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  title text not null,
  description text,
  offer_code text,
  redemption_limit integer,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ad_events (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads(id) on delete cascade,
  ad_key_id uuid references public.ad_keys(id) on delete set null,
  advertiser_id uuid not null references public.advertisers(id) on delete cascade,
  event_type public.event_type not null,
  session_id text,
  referrer text,
  user_agent text,
  device_type text,
  browser text,
  os text,
  country text,
  region text,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null unique references public.advertisers(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free',
  status text not null default 'active',
  active_adkey_limit integer not null default 1,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.advertisers enable row level security;
alter table public.campaigns enable row level security;
alter table public.ads enable row level security;
alter table public.ad_keys enable row level security;
alter table public.ad_events enable row level security;

create policy "users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "owners manage advertisers" on public.advertisers for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "owners manage campaigns" on public.campaigns for all using (exists (select 1 from public.advertisers a where a.id = campaigns.advertiser_id and a.owner_user_id = auth.uid())) with check (exists (select 1 from public.advertisers a where a.id = campaigns.advertiser_id and a.owner_user_id = auth.uid()));
create policy "owners manage ads" on public.ads for all using (exists (select 1 from public.advertisers a where a.id = ads.advertiser_id and a.owner_user_id = auth.uid())) with check (exists (select 1 from public.advertisers a where a.id = ads.advertiser_id and a.owner_user_id = auth.uid()));

create policy "public reads active ads" on public.ads for select using (status = 'active' and (start_at is null or start_at <= now()) and (end_at is null or end_at >= now()));
create policy "public reads active adkeys" on public.ad_keys for select using (status = 'active' and (expires_at is null or expires_at > now()));