-- Migration: extract fields from data jsonb into dedicated columns on product_cost_settings
-- Date: 2025-10-25

-- Add new columns to hold individual cost selections
ALTER TABLE public.product_cost_settings
  ADD COLUMN IF NOT EXISTS advertising jsonb,
  ADD COLUMN IF NOT EXISTS packaging jsonb,
  ADD COLUMN IF NOT EXISTS shipping jsonb,
  ADD COLUMN IF NOT EXISTS personnel jsonb,
  ADD COLUMN IF NOT EXISTS rent jsonb,
  ADD COLUMN IF NOT EXISTS profit_margin numeric DEFAULT 30;

-- Migrate existing data from `data` jsonb into the new columns
UPDATE public.product_cost_settings
SET
  advertising = (data -> 'advertising'),
  packaging = (data -> 'packaging'),
  shipping = (data -> 'shipping'),
  personnel = (data -> 'personnel'),
  rent = (data -> 'rent'),
  profit_margin = COALESCE((data ->> 'profitMargin')::numeric, 30)
WHERE data IS NOT NULL;

-- Optionally drop the old `data` column now that fields have been extracted
ALTER TABLE public.product_cost_settings DROP COLUMN IF EXISTS data;

-- End of migration
