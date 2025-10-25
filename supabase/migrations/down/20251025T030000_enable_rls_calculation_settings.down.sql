-- Down migration for enable_rls_calculation_settings
-- Date: 2025-10-25

-- Drop the policy if it exists
DROP POLICY IF EXISTS "Authenticated users can manage calculation settings" ON public.calculation_settings;

-- Disable Row Level Security (reversible)
ALTER TABLE public.calculation_settings DISABLE ROW LEVEL SECURITY;

-- Revoke granted permissions from authenticated role (optional)
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.calculation_settings FROM authenticated;

-- End of down migration
