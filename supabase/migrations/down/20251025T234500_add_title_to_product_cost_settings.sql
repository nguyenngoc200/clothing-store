-- Down migration: remove title column from product_cost_settings

ALTER TABLE public.product_cost_settings
DROP COLUMN IF EXISTS title;
