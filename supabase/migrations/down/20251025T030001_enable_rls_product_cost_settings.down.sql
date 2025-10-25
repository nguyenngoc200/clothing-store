-- Down migration for enable_rls_product_cost_settings
-- Date: 2025-10-25

-- Drop the policy if it exists
DROP POLICY IF EXISTS "Authenticated users can manage product cost settings" ON public.product_cost_settings;

-- Disable Row Level Security (reversible)
ALTER TABLE public.product_cost_settings DISABLE ROW LEVEL SECURITY;

-- Revoke granted permissions from authenticated role (optional)
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_cost_settings FROM authenticated;

-- End of down migration
