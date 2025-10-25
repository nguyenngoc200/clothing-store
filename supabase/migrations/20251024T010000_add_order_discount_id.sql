-- Migration: add discount_id column to order table
-- Run: 2025-10-24

-- Add nullable discount_id column (uuid) to order table
ALTER TABLE IF EXISTS public."order"
  ADD COLUMN IF NOT EXISTS discount_id uuid;

-- Add foreign key constraint to discount table if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_order_discount'
  ) THEN
    ALTER TABLE public."order"
      ADD CONSTRAINT fk_order_discount FOREIGN KEY (discount_id) REFERENCES public.discount(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Add index to speed up lookups by discount_id
CREATE INDEX IF NOT EXISTS idx_order_discount_id ON public."order" (discount_id);

-- End migration
