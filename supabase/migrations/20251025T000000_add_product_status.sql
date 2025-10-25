-- Migration: add product_status enum and product.status column
-- Run: 2025-10-25

-- Create product_status enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('in_stock', 'in_transit', 'sold');
  END IF;
END
$$;

-- Add status column to product table
ALTER TABLE IF EXISTS public.product
  ADD COLUMN IF NOT EXISTS status product_status DEFAULT 'in_stock';

-- End migration
