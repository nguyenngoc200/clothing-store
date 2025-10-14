-- =========================
-- Rollback: Disable RLS and Remove Policies
-- Date: 2025-10-13
-- =========================

-- =========================
-- 1) DROP POLICIES
-- =========================

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.category;
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customer;
DROP POLICY IF EXISTS "Authenticated users can manage discounts" ON public.discount;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.product;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON public."order";
DROP POLICY IF EXISTS "Authenticated users can manage order products" ON public.order_product;
DROP POLICY IF EXISTS "Authenticated users can manage product discounts" ON public.product_discount;

-- Drop profiles policy if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP POLICY IF EXISTS "Authenticated users can manage profiles" ON public.profiles;
  END IF;
END $$;

-- Drop anon policies if they exist
DROP POLICY IF EXISTS "Anonymous users can view categories" ON public.category;
DROP POLICY IF EXISTS "Anonymous users can view products" ON public.product;

-- =========================
-- 2) DISABLE ROW LEVEL SECURITY
-- =========================

ALTER TABLE public.category DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."order" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_product DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_discount DISABLE ROW LEVEL SECURITY;

-- Disable RLS for profiles if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- =========================
-- 3) REVOKE PERMISSIONS
-- =========================

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.category FROM authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.customer FROM authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.discount FROM authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.product FROM authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public."order" FROM authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_product FROM authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_discount FROM authenticated;

-- Revoke from profiles if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles FROM authenticated;
  END IF;
END $$;

-- =========================
-- 4) DROP HELPER FUNCTIONS
-- =========================

DROP FUNCTION IF EXISTS public.is_authenticated();

-- =========================
-- NOTES:
-- - This rollback disables RLS and removes all policies
-- - Tables will be accessible based on Supabase's default permissions
-- - Service role will still have full access
-- =========================
