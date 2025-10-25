-- Down migration: remove discount_id column and related objects from order table
-- Run: 2025-10-24

-- Drop foreign key constraint if exists
ALTER TABLE IF EXISTS public."order" DROP CONSTRAINT IF EXISTS fk_order_discount;

-- Drop index if exists
DROP INDEX IF EXISTS idx_order_discount_id;

-- Drop column if exists
ALTER TABLE IF EXISTS public."order" DROP COLUMN IF EXISTS discount_id;

-- End down migration
