-- Down migration for create_product_cost_settings_table
-- Date: 2025-10-25

-- Drop trigger if exists
drop trigger if exists trg_product_cost_settings_updated_at on public.product_cost_settings;

-- Drop table
drop table if exists public.product_cost_settings;

-- Note: we do not drop the shared trigger function `trigger_set_timestamp` because it
-- may be used by other tables (e.g. homepage_settings).

-- End of down migration
