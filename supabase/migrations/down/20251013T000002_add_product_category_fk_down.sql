-- Down migration: remove category_id FK and column from product
-- Run: 2025-10-13

-- Drop FK constraint if exists
ALTER TABLE IF EXISTS public.product
DROP CONSTRAINT IF EXISTS fk_product_category;

-- Drop index if exists
DROP INDEX IF EXISTS idx_product_category_id;

-- Drop column if exists
ALTER TABLE IF EXISTS public.product
DROP COLUMN IF EXISTS category_id;

-- End down migration
