-- Migration: remove legacy columns from calculation_settings
-- Date: 2025-10-30

-- This migration removes the legacy columns `key`, `site_id` and `order` from
-- calculation_settings now that we store each sub-category as a separate `tab` row.

alter table if exists public.calculation_settings
  drop column if exists "key";

alter table if exists public.calculation_settings
  drop column if exists site_id;

alter table if exists public.calculation_settings
  drop column if exists "order";
-- Notes:
-- - Ensure you've run the split migration (which copies data into per-tab rows) and
--   verified the new rows before running this migration.
-- - If you rely on `site_id` semantics in your app, adapt these migrations to preserve
--   or carry over site-specific values.
