-- Migration: remove legacy columns from product_cost_settings
-- Date: 2025-10-30

-- Drop legacy columns: key, site_id, "order". Ensure data preserved in dedicated columns before running.

ALTER TABLE IF EXISTS public.product_cost_settings
  DROP COLUMN IF EXISTS "key";

ALTER TABLE IF EXISTS public.product_cost_settings
  DROP COLUMN IF EXISTS site_id;

ALTER TABLE IF EXISTS public.product_cost_settings
  DROP COLUMN IF EXISTS "order";

-- End migration
