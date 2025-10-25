-- Migration: move discount_id from order to order_product
-- Run: 2025-10-24

-- 1) Add discount_id column to order_product
ALTER TABLE IF EXISTS public.order_product
  ADD COLUMN IF NOT EXISTS discount_id uuid;

-- 2) Copy existing order.discount_id into order_product.discount_id for rows belonging to the order
UPDATE public.order_product op
SET discount_id = o.discount_id
FROM public."order" o
WHERE op.order_id = o.id AND o.discount_id IS NOT NULL;

-- 3) Add FK constraint to discount table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_op_discount'
  ) THEN
    ALTER TABLE public.order_product
      ADD CONSTRAINT fk_op_discount FOREIGN KEY (discount_id) REFERENCES public.discount(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- 4) Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_order_product_discount_id ON public.order_product (discount_id);

-- 5) Remove discount_id from order table
ALTER TABLE IF EXISTS public."order" DROP COLUMN IF EXISTS discount_id;

-- End migration
