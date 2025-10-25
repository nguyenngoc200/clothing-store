-- Migration: create calculation_settings table
-- Date: 2025-10-25

create table if not exists public.calculation_settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  tab text not null,
  site_id uuid null,
  "order" int default 0,
  data jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_calculation_settings_tab_site on public.calculation_settings (tab, site_id);

-- Trigger to update updated_at on change (reuses existing trigger function if available)
do $$
begin
  if exists (select 1 from pg_proc where proname = 'trigger_set_timestamp') then
    begin
      execute 'create trigger trg_calculation_settings_updated_at before update on public.calculation_settings for each row execute procedure public.trigger_set_timestamp();';
    exception when others then
      -- ignore if trigger already exists or can't be created
      null;
    end;
  end if;
end$$;

-- End of migration
