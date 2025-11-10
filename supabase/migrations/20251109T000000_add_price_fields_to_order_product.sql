-- Migration: Add cost_price, suggested_price, and selling_price to order_product table
-- Run: 2025-11-09

-- Add new price fields to order_product
ALTER TABLE public.order_product
ADD COLUMN IF NOT EXISTS cost_price numeric(10,2),
ADD COLUMN IF NOT EXISTS suggested_price numeric(10,2),
ADD COLUMN IF NOT EXISTS selling_price numeric(10,2);

-- Add comments for documentation
COMMENT ON COLUMN public.order_product.cost_price IS 'Giá nhập đồ vào (purchase/cost price)';
COMMENT ON COLUMN public.order_product.suggested_price IS 'Giá đề xuất (suggested selling price)';
COMMENT ON COLUMN public.order_product.selling_price IS 'Giá bán thực tế cho khách (actual selling price to customer)';

-- End migration
