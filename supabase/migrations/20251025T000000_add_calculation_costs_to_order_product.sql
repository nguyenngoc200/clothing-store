-- Migration: add calculation cost columns to order_product
-- Run: 2025-10-25
-- Allows tracking individual cost breakdown per product in an order

-- Add columns for calculation costs (all numeric to store VND amounts)
ALTER TABLE IF EXISTS public.order_product
  ADD COLUMN IF NOT EXISTS advertising_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS packaging_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS personnel_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rent_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS freeship_cost numeric(10,2) DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.order_product.advertising_cost IS 'Chi phí quảng cáo cho sản phẩm này';
COMMENT ON COLUMN public.order_product.packaging_cost IS 'Chi phí đóng gói cho sản phẩm này';
COMMENT ON COLUMN public.order_product.shipping_cost IS 'Chi phí vận chuyển cho sản phẩm này';
COMMENT ON COLUMN public.order_product.personnel_cost IS 'Chi phí nhân sự cho sản phẩm này';
COMMENT ON COLUMN public.order_product.rent_cost IS 'Chi phí mặt bằng cho sản phẩm này';
COMMENT ON COLUMN public.order_product.freeship_cost IS 'Chi phí freeship cho sản phẩm này';

-- End migration
