-- Allow public (anon) SELECT on homepage_settings while keeping RLS for modifications
-- Date: 2025-10-14

-- Grant SELECT to anonymous role
GRANT SELECT ON TABLE public.homepage_settings TO anon;

-- Create a specific RLS policy allowing anon (public) SELECTs
DROP POLICY IF EXISTS "Allow anon select on homepage_settings" ON public.homepage_settings;
CREATE POLICY "Allow anon select on homepage_settings"
ON public.homepage_settings
FOR SELECT
TO anon
USING (true);

-- Keep existing authenticated policy for FOR ALL (created by previous migration)
-- Note: This migration intentionally only opens SELECT to the anon role. INSERT/UPDATE/DELETE remain protected by the authenticated policy.
