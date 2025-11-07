-- Down migration for: remove legacy columns from product_cost_settings
-- Date: 2025-10-30

-- Re-create the legacy columns `key`, `site_id` and "order". This does not
-- restore previous `key` values; if you need the original keys, populate them
-- from backups or set programmatically.

ALTER TABLE IF EXISTS public.product_cost_settings
  ADD COLUMN IF NOT EXISTS "key" text;

ALTER TABLE IF EXISTS public.product_cost_settings
  ADD COLUMN IF NOT EXISTS site_id uuid;

ALTER TABLE IF EXISTS public.product_cost_settings
  ADD COLUMN IF NOT EXISTS "order" int DEFAULT 0;

-- Optionally set key for existing rows based on id
UPDATE public.product_cost_settings SET "key" = ('product_cost_' || id::text) WHERE "key" IS NULL;

-- End migration
