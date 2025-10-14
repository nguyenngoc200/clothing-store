-- Down migration: drop product, product_discount, discount, category, customer tables
-- Run: 2025-10-13

DROP TABLE IF EXISTS public.product_discount CASCADE;
DROP TABLE IF EXISTS public.product CASCADE;
DROP TABLE IF EXISTS public.discount CASCADE;
DROP TABLE IF EXISTS public.category CASCADE;
DROP TABLE IF EXISTS public.customer CASCADE;

-- End down migration
