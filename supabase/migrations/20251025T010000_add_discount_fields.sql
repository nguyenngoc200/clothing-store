-- Migration: add discount_percent and discount_amount columns to discount table
-- Run: 2025-10-25

-- Add numeric columns for percent and fixed amount
ALTER TABLE IF EXISTS public.discount
  ADD COLUMN IF NOT EXISTS discount_percent numeric(5,2),
  ADD COLUMN IF NOT EXISTS discount_amount numeric(12,2);

-- Ensure discount_percent, if present, is within 0..100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_discount_percent_range'
  ) THEN
    ALTER TABLE public.discount
      ADD CONSTRAINT chk_discount_percent_range CHECK (discount_percent IS NULL OR (discount_percent >= 0 AND discount_percent <= 100));
  END IF;
END
$$;

-- End migration
