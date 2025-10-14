-- Down migration: drop order and order_product tables
-- Run: 2025-10-13

DROP TABLE IF EXISTS public.order_product CASCADE;
DROP TABLE IF EXISTS public."order" CASCADE;
DROP TABLE IF EXISTS public.order_product CASCADE;
DROP TABLE IF EXISTS public."order" CASCADE;

-- End down migration
