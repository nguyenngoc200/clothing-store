-- Migration: create order and order_product tables with constraints
-- Run: 2025-10-13

-- Create order table
CREATE TABLE IF NOT EXISTS public."order" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text,
  shipping_code text,
  total_amount numeric(10,2),
  order_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create order_product table (join between order and product)
CREATE TABLE IF NOT EXISTS public.order_product (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT fk_op_order FOREIGN KEY(order_id) REFERENCES public."order"(id) ON DELETE CASCADE,
  CONSTRAINT fk_op_product FOREIGN KEY(product_id) REFERENCES public.product(id) ON DELETE RESTRICT
);

-- End migration
