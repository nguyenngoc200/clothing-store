-- Migration: create homepage_settings table
-- Date: 2025-10-14

create extension if not exists "uuid-ossp";

create table if not exists public.homepage_settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  tab text not null,
  site_id uuid null,
  "order" int default 0,
  data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: index on tab and site_id for quick lookup
create index if not exists idx_homepage_settings_tab_site on public.homepage_settings (tab, site_id);

-- Trigger to update updated_at on change
create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_homepage_settings_updated_at
before update on public.homepage_settings
for each row
execute procedure public.trigger_set_timestamp();

-- Note: You may want to add Row Level Security policies depending on your auth model.
-- Example (Supabase): enable RLS and add policies for authenticated service role, admin users, etc.


-- End of migration
