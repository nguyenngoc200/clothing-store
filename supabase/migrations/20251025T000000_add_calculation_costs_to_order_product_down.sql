-- Migration down: remove calculation cost columns from order_product
-- Rollback for: 20251025T000000_add_calculation_costs_to_order_product.sql

ALTER TABLE IF EXISTS public.order_product
  DROP COLUMN IF EXISTS advertising_cost,
  DROP COLUMN IF EXISTS packaging_cost,
  DROP COLUMN IF EXISTS shipping_cost,
  DROP COLUMN IF EXISTS personnel_cost,
  DROP COLUMN IF EXISTS rent_cost,
  DROP COLUMN IF EXISTS freeship_cost;

-- End rollback
