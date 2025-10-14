-- Migration: add customer_id FK to order
-- Run: 2025-10-13

-- Add nullable customer_id column to order
ALTER TABLE IF EXISTS public."order"
ADD COLUMN IF NOT EXISTS customer_id uuid;

-- Create index on customer_id for lookups
CREATE INDEX IF NOT EXISTS idx_order_customer_id ON public."order"(customer_id);

-- Add FK constraint to customer(id)
ALTER TABLE IF EXISTS public."order"
ADD CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON DELETE SET NULL;

-- End migration
