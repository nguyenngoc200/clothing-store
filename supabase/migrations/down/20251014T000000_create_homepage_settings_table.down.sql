-- Down migration for create_homepage_settings_table
-- Date: 2025-10-14

-- Drop trigger
drop trigger if exists trg_homepage_settings_updated_at on public.homepage_settings;

-- Drop function if not used elsewhere (be careful if other triggers use it)
drop function if exists public.trigger_set_timestamp();

-- Drop table
drop table if exists public.homepage_settings;

-- End of down migration
