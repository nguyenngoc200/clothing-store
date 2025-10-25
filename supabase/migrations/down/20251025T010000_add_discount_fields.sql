-- Down migration: remove discount_percent and discount_amount from discount table
-- Run: 2025-10-25

-- Drop constraint if exists
ALTER TABLE IF EXISTS public.discount DROP CONSTRAINT IF EXISTS chk_discount_percent_range;

-- Drop columns if exist
ALTER TABLE IF EXISTS public.discount
  DROP COLUMN IF EXISTS discount_percent,
  DROP COLUMN IF EXISTS discount_amount;

-- End down migration
