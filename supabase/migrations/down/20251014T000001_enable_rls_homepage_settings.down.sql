-- Down migration for enabling RLS on homepage_settings
-- Date: 2025-10-14

DROP POLICY IF EXISTS "Authenticated users can manage homepage settings" ON public.homepage_settings;

ALTER TABLE public.homepage_settings DISABLE ROW LEVEL SECURITY;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.homepage_settings FROM authenticated;

-- End of down migration
