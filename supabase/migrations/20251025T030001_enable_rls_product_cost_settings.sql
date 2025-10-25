-- Enable RLS and Policies for product_cost_settings
-- Date: 2025-10-25

-- Grant usage to authenticated role (idempotent)
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant basic table permissions to authenticated (RLS will restrict further)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.product_cost_settings TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.product_cost_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: authenticated users may manage product_cost_settings
DROP POLICY IF EXISTS "Authenticated users can manage product cost settings" ON public.product_cost_settings;
CREATE POLICY "Authenticated users can manage product cost settings"
ON public.product_cost_settings
FOR ALL
TO authenticated
USING ( public.is_authenticated() )
WITH CHECK ( public.is_authenticated() );

-- End of migration
