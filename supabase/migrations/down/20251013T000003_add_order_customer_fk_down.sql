-- Down migration: remove customer_id FK and column from order
-- Run: 2025-10-13

-- Drop FK constraint if exists
ALTER TABLE IF EXISTS public."order"
DROP CONSTRAINT IF EXISTS fk_order_customer;

-- Drop index if exists
DROP INDEX IF EXISTS idx_order_customer_id;

-- Drop column if exists
ALTER TABLE IF EXISTS public."order"
DROP COLUMN IF EXISTS customer_id;

-- End down migration
