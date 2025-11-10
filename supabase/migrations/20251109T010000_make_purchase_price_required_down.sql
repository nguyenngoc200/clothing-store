-- Migration rollback: Make purchase_price nullable again in product table
-- Created: 2025-11-09

-- Remove NOT NULL constraint from purchase_price
ALTER TABLE public.product 
ALTER COLUMN purchase_price DROP NOT NULL;

-- Remove comments
COMMENT ON COLUMN public.product.purchase_price IS NULL;
COMMENT ON COLUMN public.product.suggested IS NULL;

-- End migration rollback
