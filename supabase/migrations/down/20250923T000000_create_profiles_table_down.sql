-- Rollback for create_profiles_table
-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_profile_from_user();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop RLS policies
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Disable RLS and drop table
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
DROP TABLE IF EXISTS public.profiles;

-- Drop enum type if exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'internal_role') THEN
    DROP TYPE internal_role;
  END IF;
END $$;
