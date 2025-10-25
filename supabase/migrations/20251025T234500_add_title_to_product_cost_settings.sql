-- Add title column to product_cost_settings

ALTER TABLE public.product_cost_settings
ADD COLUMN IF NOT EXISTS title text;

-- Set a default title for existing rows if desired (optional)
-- UPDATE public.product_cost_settings SET title = key WHERE title IS NULL;
