-- Migration: split aggregated calculation_settings row into per-tab rows
-- Date: 2025-10-30

-- This migration:
-- 1) For the legacy aggregated calculation row (key = 'calculation_v1'), create separate rows
--    for each sub-tab (advertising, packaging, shipping, personnel, rent, freeship) using the
--    JSON values in the `data` object.
-- 2) Create a UNIQUE index on `tab` to allow ON CONFLICT(tab) upserts from the API.
-- Insert per-tab rows if they don't already exist
insert into public.calculation_settings (id, "key", tab, data, created_at, updated_at)
select uuid_generate_v4(), uuid_generate_v4()::text, 'advertising', (cs.data->'advertising')::jsonb, now(), now()
from public.calculation_settings cs
where cs.key = 'calculation_v1'
  and cs.data->'advertising' is not null
  and not exists (select 1 from public.calculation_settings c2 where c2.tab = 'advertising');

insert into public.calculation_settings (id, "key", tab, data, created_at, updated_at)
select uuid_generate_v4(), uuid_generate_v4()::text, 'packaging', (cs.data->'packaging')::jsonb, now(), now()
from public.calculation_settings cs
where cs.key = 'calculation_v1'
  and cs.data->'packaging' is not null
  and not exists (select 1 from public.calculation_settings c2 where c2.tab = 'packaging');

insert into public.calculation_settings (id, "key", tab, data, created_at, updated_at)
select uuid_generate_v4(), uuid_generate_v4()::text, 'shipping', (cs.data->'shipping')::jsonb, now(), now()
from public.calculation_settings cs
where cs.key = 'calculation_v1'
  and cs.data->'shipping' is not null
  and not exists (select 1 from public.calculation_settings c2 where c2.tab = 'shipping');

insert into public.calculation_settings (id, "key", tab, data, created_at, updated_at)
select uuid_generate_v4(), uuid_generate_v4()::text, 'personnel', (cs.data->'personnel')::jsonb, now(), now()
from public.calculation_settings cs
where cs.key = 'calculation_v1'
  and cs.data->'personnel' is not null
  and not exists (select 1 from public.calculation_settings c2 where c2.tab = 'personnel');

insert into public.calculation_settings (id, "key", tab, data, created_at, updated_at)
select uuid_generate_v4(), uuid_generate_v4()::text, 'rent', (cs.data->'rent')::jsonb, now(), now()
from public.calculation_settings cs
where cs.key = 'calculation_v1'
  and cs.data->'rent' is not null
  and not exists (select 1 from public.calculation_settings c2 where c2.tab = 'rent');

insert into public.calculation_settings (id, "key", tab, data, created_at, updated_at)
select uuid_generate_v4(), uuid_generate_v4()::text, 'freeship', (cs.data->'freeship')::jsonb, now(), now()
from public.calculation_settings cs
where cs.key = 'calculation_v1'
  and cs.data->'freeship' is not null
  and not exists (select 1 from public.calculation_settings c2 where c2.tab = 'freeship');

-- Create a unique index on tab to allow ON CONFLICT(tab) upserts.
create unique index if not exists idx_calculation_settings_tab on public.calculation_settings (tab);

-- End migration

-- Notes:
-- - This migration does not remove the original aggregated row (key = 'calculation_v1').
--   That is handled in the subsequent remove-columns migration so the history is retained
--   until the schema is fully migrated.
-- - If your DB contains multiple site-specific rows, consider adapting the WHERE clause
--   to preserve site_id semantics before dropping that column.
