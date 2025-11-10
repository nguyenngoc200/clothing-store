-- Migration Down: Remove cost_price, suggested_price, and selling_price from order_product table
-- Run: 2025-11-09

-- Remove the price fields from order_product
ALTER TABLE public.order_product
DROP COLUMN IF EXISTS cost_price,
DROP COLUMN IF EXISTS suggested_price,
DROP COLUMN IF EXISTS selling_price;

-- End migration
