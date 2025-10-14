-- Migration: create product, category, discount, product_discount, customer tables
-- Run: 2025-10-13

-- Create customer table
CREATE TABLE IF NOT EXISTS public.customer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create category table
CREATE TABLE IF NOT EXISTS public.category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create discount table
CREATE TABLE IF NOT EXISTS public.discount (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(20) UNIQUE,
  title text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Create product table
CREATE TABLE IF NOT EXISTS public.product (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  purchase_price numeric(10,2),
  discount_id uuid,
  suggested numeric(10,2),
  size text,
  color text,
  CONSTRAINT fk_discount FOREIGN KEY(discount_id) REFERENCES public.discount(id) ON DELETE SET NULL
);

-- Create product_discount join table
CREATE TABLE IF NOT EXISTS public.product_discount (
  product_id uuid NOT NULL,
  discount_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  PRIMARY KEY (product_id, discount_id),
  CONSTRAINT fk_pd_product FOREIGN KEY(product_id) REFERENCES public.product(id) ON DELETE CASCADE,
  CONSTRAINT fk_pd_discount FOREIGN KEY(discount_id) REFERENCES public.discount(id) ON DELETE CASCADE
);

-- Optional: index on product title
CREATE INDEX IF NOT EXISTS idx_product_title ON public.product USING gin (to_tsvector('simple', coalesce(title, '')));

-- End migration
