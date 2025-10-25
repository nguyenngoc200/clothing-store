-- Down migration: remove product.status column and product_status enum
-- Run: 2025-10-25

-- Drop status column if exists
ALTER TABLE IF EXISTS public.product DROP COLUMN IF EXISTS status;

-- Drop enum type if exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    DROP TYPE product_status;
  END IF;
END
$$;

-- End down migration
