-- Down migration for: split aggregated calculation_settings into per-tab rows
-- Date: 2025-10-30

-- This down migration attempts to re-aggregate per-tab rows into the legacy single
-- calculation row with key = 'calculation_v1' and tab = 'calculation'.
-- IMPORTANT: This script should be run BEFORE reversing the remove-columns migration
-- which drops/creates the legacy columns (key, site_id, "order").

with
  adv as (select data from public.calculation_settings where tab = 'advertising' limit 1),
  pack as (select data from public.calculation_settings where tab = 'packaging' limit 1),
  ship as (select data from public.calculation_settings where tab = 'shipping' limit 1),
  pers as (select data from public.calculation_settings where tab = 'personnel' limit 1),
  rent as (select data from public.calculation_settings where tab = 'rent' limit 1),
  free as (select data from public.calculation_settings where tab = 'freeship' limit 1)

insert into public.calculation_settings (id, "key", tab, data, created_at, updated_at)
values (
  uuid_generate_v4(),
  'calculation_v1',
  'calculation',
  jsonb_build_object(
    'advertising', coalesce((select data from adv), '[]'::jsonb),
    'packaging',   coalesce((select data from pack), '[]'::jsonb),
    'shipping',    coalesce((select data from ship), '[]'::jsonb),
    'personnel',   coalesce((select data from pers), '[]'::jsonb),
    'rent',        coalesce((select data from rent), '[]'::jsonb),
    'freeship',    coalesce((select data from free), '[]'::jsonb)
  ),
  now(),
  now()
)
on conflict ("key") do update set data = excluded.data, updated_at = now();

-- End migration

-- Notes:
-- - After running this down migration you may want to delete the individual per-tab rows
--   (delete from public.calculation_settings where tab in ('advertising', 'packaging', ...))
--   but be careful if you have site-specific rows.
-- - This script assumes that the legacy columns ("key") exist; run the corresponding
--   remove-columns down migration first if needed.
