-- Down migration: remove order_product_id column and related objects from order table
-- Run: 2025-10-24

-- Drop foreign key constraint if exists
ALTER TABLE IF EXISTS public."order" DROP CONSTRAINT IF EXISTS fk_order_order_product;

-- Drop index if exists
DROP INDEX IF EXISTS idx_order_order_product_id;

-- Drop column if exists
ALTER TABLE IF EXISTS public."order" DROP COLUMN IF EXISTS order_product_id;

-- End down migration
