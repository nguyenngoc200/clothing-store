-- Down migration for extract columns migration on product_cost_settings
-- Date: 2025-10-25

-- Recreate `data` jsonb column and populate it from extracted columns
ALTER TABLE public.product_cost_settings
  ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}'::jsonb;

UPDATE public.product_cost_settings
SET data = jsonb_build_object(
  'advertising', advertising,
  'packaging', packaging,
  'shipping', shipping,
  'personnel', personnel,
  'rent', rent,
  'profitMargin', COALESCE(profit_margin, 30)
)
WHERE TRUE;

-- Drop the extracted columns
ALTER TABLE public.product_cost_settings
  DROP COLUMN IF EXISTS advertising,
  DROP COLUMN IF EXISTS packaging,
  DROP COLUMN IF EXISTS shipping,
  DROP COLUMN IF EXISTS personnel,
  DROP COLUMN IF EXISTS rent,
  DROP COLUMN IF EXISTS profit_margin;

-- End of down migration
