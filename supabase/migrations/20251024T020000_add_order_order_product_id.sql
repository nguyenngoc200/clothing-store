-- Migration: add order_product_id column to order table
-- Run: 2025-10-24

-- Add nullable order_product_id column (uuid) to order table
ALTER TABLE IF EXISTS public."order"
  ADD COLUMN IF NOT EXISTS order_product_id uuid;

-- Add foreign key constraint to order_product table if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_order_product'
  ) THEN
    ALTER TABLE public."order"
      ADD CONSTRAINT fk_order_order_product FOREIGN KEY (order_product_id) REFERENCES public.order_product(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Add index to speed up lookups by order_product_id
CREATE INDEX IF NOT EXISTS idx_order_order_product_id ON public."order" (order_product_id);

-- End migration
