-- Migration: Make purchase_price required in product table
-- Created: 2025-11-09

-- First set any NULL values to 0 (if any exist)
UPDATE public.product 
SET purchase_price = 0 
WHERE purchase_price IS NULL;

-- Then make the column NOT NULL
ALTER TABLE public.product 
ALTER COLUMN purchase_price SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.product.purchase_price IS 'Required field: Purchase/cost price of the product';
COMMENT ON COLUMN public.product.suggested IS 'Optional field: Suggested selling price calculated from cost + expenses. Only saved when user clicks Apply button.';

-- End migration
