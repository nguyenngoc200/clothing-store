-- Down migration: move discount_id back from order_product to order
-- Run: 2025-10-24

-- 1) Add discount_id column back to order
ALTER TABLE IF EXISTS public."order"
  ADD COLUMN IF NOT EXISTS discount_id uuid;

-- 2) Populate order.discount_id from one of its order_product.discount_id values (choose earliest created)
UPDATE public."order" o
SET discount_id = sub.discount_id
FROM (
  SELECT op.order_id, op.discount_id
  FROM public.order_product op
  WHERE op.discount_id IS NOT NULL
  ORDER BY op.created_at ASC
) AS sub
WHERE o.id = sub.order_id;

-- 3) Drop FK and index on order_product.discount_id then drop column
ALTER TABLE IF EXISTS public.order_product DROP CONSTRAINT IF EXISTS fk_op_discount;
DROP INDEX IF EXISTS idx_order_product_discount_id;
ALTER TABLE IF EXISTS public.order_product DROP COLUMN IF EXISTS discount_id;

-- End down migration
