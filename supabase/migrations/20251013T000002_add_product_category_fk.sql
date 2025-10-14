-- Migration: add category_id FK to product
-- Run: 2025-10-13

-- Add nullable category_id column to product
ALTER TABLE IF EXISTS public.product
ADD COLUMN IF NOT EXISTS category_id uuid;

-- Create index on category_id for lookups
CREATE INDEX IF NOT EXISTS idx_product_category_id ON public.product(category_id);

-- Add FK constraint to category(id)
ALTER TABLE IF EXISTS public.product
ADD CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES public.category(id) ON DELETE SET NULL;

-- End migration
