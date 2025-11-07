-- Down migration for: remove legacy columns from calculation_settings
-- Date: 2025-10-30

-- This down migration re-creates the legacy columns `key`, `site_id`, and "order".
-- After restoring the columns you may want to re-populate `key` for the aggregated
-- row (for example, set key = 'calculation_v1' for tab = 'calculation').

alter table if exists public.calculation_settings
  add column if not exists "key" text;

alter table if exists public.calculation_settings
  add column if not exists site_id uuid;

alter table if exists public.calculation_settings
  add column if not exists "order" int default 0;

-- Optionally restore key on the aggregated row if it exists
update public.calculation_settings set "key" = 'calculation_v1' where tab = 'calculation' and ("key" is null or "key" = '');
-- Notes:
-- - This re-creates the columns but does not restore constraints (e.g. unique on key).
--   If you need the unique constraint, add it explicitly after restoring values.
