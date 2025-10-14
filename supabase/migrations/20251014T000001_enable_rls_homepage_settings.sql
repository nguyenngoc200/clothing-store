-- Enable RLS and Policies for homepage_settings
-- Date: 2025-10-14

-- Ensure helper function exists (from previous RLS migration)
-- public.is_authenticated() should already be present; if not, define it as in earlier migration.

-- Grant usage to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant basic table permissions to authenticated (optional, RLS will restrict further)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.homepage_settings TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: authenticated users may manage homepage_settings
DROP POLICY IF EXISTS "Authenticated users can manage homepage settings" ON public.homepage_settings;
CREATE POLICY "Authenticated users can manage homepage settings"
ON public.homepage_settings
FOR ALL
TO authenticated
USING ( public.is_authenticated() )
WITH CHECK ( public.is_authenticated() );

-- Note: service role and DB owners bypass RLS automatically. If you need a stricter admin-only policy,
-- replace public.is_authenticated() with a check against profiles table or a role claim.

-- End of migration
