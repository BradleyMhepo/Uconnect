-- ============================================================
-- Uconnect Database Schema
-- Run this once in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/cgxrmxcvesiwcwszhjhs/sql
-- ============================================================

-- ── Packs (the products sold on the site) ────────────────────
create table if not exists packs (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  category     text not null,
  city         text not null,
  state        text not null default '',
  region       text not null,
  mode         text not null default 'no-website',
  lead_count   integer not null default 0,
  price        numeric(8,2) not null default 29.00,
  available    boolean not null default true,
  tagline      text not null default '',
  created_at   timestamptz default now()
);

-- ── Leads (individual business records inside each pack) ─────
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  pack_id       uuid references packs(id) on delete cascade,
  name          text not null,
  city          text not null default '',
  state         text not null default '',
  address       text not null default '',
  zip           text not null default '',
  phone         text not null default '',
  website       text not null default '',
  rating        text not null default '',
  reviews       text not null default '',
  mobile_score  text not null default '',
  problem_found text not null default '',
  pitch_angle   text not null default '',
  source        text not null default '',
  created_at    timestamptz default now()
);

-- ── Orders (purchases) ────────────────────────────────────────
create table if not exists orders (
  id                 uuid primary key default gen_random_uuid(),
  pack_id            uuid references packs(id),
  buyer_email        text not null,
  amount_cents       integer not null,
  payment_intent_id  text,
  download_token     text unique default gen_random_uuid()::text,
  downloaded_at      timestamptz,
  created_at         timestamptz default now()
);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists idx_leads_pack_id   on leads(pack_id);
create index if not exists idx_packs_category  on packs(category);
create index if not exists idx_packs_city      on packs(city);
create index if not exists idx_orders_token    on orders(download_token);

-- ── RLS: enable but allow public reads on packs ──────────────
alter table packs  enable row level security;
alter table leads  enable row level security;
alter table orders enable row level security;

-- Anyone can read pack metadata (for the storefront)
create policy "packs_public_read"  on packs  for select using (true);

-- Leads visible only via valid download token (join orders)
create policy "leads_via_token" on leads for select
  using (
    exists (
      select 1 from orders
      where orders.pack_id = leads.pack_id
        and orders.download_token = current_setting('request.jwt.claims', true)::json->>'download_token'
    )
  );

-- Orders: buyer can read their own row by token
create policy "orders_by_token" on orders for select
  using (download_token = current_setting('request.jwt.claims', true)::json->>'download_token');
