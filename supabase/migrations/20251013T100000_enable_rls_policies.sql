-- =========================
-- Enable RLS and Full Access Policies for All Tables
-- Date: 2025-10-13
-- =========================

-- =========================
-- 1) HELPER FUNCTIONS
--    (authenticated users have full access)
-- =========================

-- Helper function to check if user is authenticated
DROP FUNCTION IF EXISTS public.is_authenticated();
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT auth.uid() IS NOT NULL
$$;

-- =========================
-- 2) GRANT SCHEMA USAGE
-- =========================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- =========================
-- 3) GRANT TABLE PERMISSIONS
-- =========================

-- Category table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.category TO authenticated;

-- Customer table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customer TO authenticated;

-- Discount table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.discount TO authenticated;

-- Product table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.product TO authenticated;

-- Order table (renamed from 'order' to avoid SQL keyword)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."order" TO authenticated;

-- Order Product table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_product TO authenticated;

-- Product Discount table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_discount TO authenticated;

-- Profiles table (if exists)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;

-- =========================
-- 4) ENABLE ROW LEVEL SECURITY
-- =========================

ALTER TABLE public.category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_discount ENABLE ROW LEVEL SECURITY;

-- Enable RLS for profiles if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- =========================
-- 5) CREATE RLS POLICIES
-- =========================

-- ===== CATEGORY POLICIES =====
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.category;
CREATE POLICY "Authenticated users can manage categories"
ON public.category
FOR ALL
TO authenticated
USING ( public.is_authenticated() )
WITH CHECK ( public.is_authenticated() );

-- ===== CUSTOMER POLICIES =====
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customer;
CREATE POLICY "Authenticated users can manage customers"
ON public.customer
FOR ALL
TO authenticated
USING ( public.is_authenticated() )
WITH CHECK ( public.is_authenticated() );

-- ===== DISCOUNT POLICIES =====
DROP POLICY IF EXISTS "Authenticated users can manage discounts" ON public.discount;
CREATE POLICY "Authenticated users can manage discounts"
ON public.discount
FOR ALL
TO authenticated
USING ( public.is_authenticated() )
WITH CHECK ( public.is_authenticated() );

-- ===== PRODUCT POLICIES =====
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.product;
CREATE POLICY "Authenticated users can manage products"
ON public.product
FOR ALL
TO authenticated
USING ( public.is_authenticated() )
WITH CHECK ( public.is_authenticated() );

-- ===== ORDER POLICIES =====
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public."order";
CREATE POLICY "Authenticated users can manage orders"
ON public."order"
FOR ALL
TO authenticated
USING ( public.is_authenticated() )
WITH CHECK ( public.is_authenticated() );

-- ===== ORDER_PRODUCT POLICIES =====
DROP POLICY IF EXISTS "Authenticated users can manage order products" ON public.order_product;
CREATE POLICY "Authenticated users can manage order products"
ON public.order_product
FOR ALL
TO authenticated
USING ( public.is_authenticated() )
WITH CHECK ( public.is_authenticated() );

-- ===== PRODUCT_DISCOUNT POLICIES =====
DROP POLICY IF EXISTS "Authenticated users can manage product discounts" ON public.product_discount;
CREATE POLICY "Authenticated users can manage product discounts"
ON public.product_discount
FOR ALL
TO authenticated
USING ( public.is_authenticated() )
WITH CHECK ( public.is_authenticated() );

-- ===== PROFILES POLICIES (if exists) =====
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP POLICY IF EXISTS "Authenticated users can manage profiles" ON public.profiles;
    CREATE POLICY "Authenticated users can manage profiles"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING ( public.is_authenticated() )
    WITH CHECK ( public.is_authenticated() );
  END IF;
END $$;

-- =========================
-- 6) ENABLE ANON ACCESS (READ ONLY) - OPTIONAL
--    Uncomment if you want anonymous users to read data
-- =========================

-- GRANT SELECT ON TABLE public.category TO anon;
-- GRANT SELECT ON TABLE public.product TO anon;
-- GRANT SELECT ON TABLE public.discount TO anon;

-- DROP POLICY IF EXISTS "Anonymous users can view categories" ON public.category;
-- CREATE POLICY "Anonymous users can view categories"
-- ON public.category
-- FOR SELECT
-- TO anon
-- USING ( true );

-- DROP POLICY IF EXISTS "Anonymous users can view products" ON public.product;
-- CREATE POLICY "Anonymous users can view products"
-- ON public.product
-- FOR SELECT
-- TO anon
-- USING ( true );

-- =========================
-- NOTES:
-- - Authenticated users have full CRUD access to all tables
-- - Service role bypasses RLS automatically
-- - Anonymous users have no access unless explicitly granted
-- - To allow public read access, uncomment the ANON section above
-- =========================
