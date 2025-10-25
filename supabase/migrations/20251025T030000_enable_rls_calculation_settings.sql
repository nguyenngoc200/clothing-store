-- Enable RLS and Policies for calculation_settings
-- Date: 2025-10-25

-- Grant usage to authenticated role (idempotent)
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant basic table permissions to authenticated (RLS will restrict further)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.calculation_settings TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.calculation_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: authenticated users may manage calculation_settings
DROP POLICY IF EXISTS "Authenticated users can manage calculation settings" ON public.calculation_settings;
CREATE POLICY "Authenticated users can manage calculation settings"
ON public.calculation_settings
FOR ALL
TO authenticated
USING ( public.is_authenticated() )
WITH CHECK ( public.is_authenticated() );

-- End of migration
