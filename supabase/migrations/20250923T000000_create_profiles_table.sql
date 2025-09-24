-- Create enum type for internal_staff_role
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'internal_role') THEN
    CREATE TYPE internal_role AS ENUM ('super_admin', 'customer_support');
  END IF;
END $$;

-- Create public.profiles table for user profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  has_onboarded boolean NOT NULL DEFAULT false,
  job_title text,
  primary_use_case text,
  internal_staff_role internal_role
);

-- =====================================
-- RLS POLICIES FOR public.profiles
-- =====================================
-- Enable RLS on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- =====================================
-- FUNCTIONS & TRIGGERS FOR public.profiles
-- =====================================
-- Function to auto-create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    has_onboarded,
    job_title,
    primary_use_case,
    internal_staff_role
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    false,
    NEW.raw_user_meta_data->>'job_title',
    NEW.raw_user_meta_data->>'primary_use_case',
    NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger that calls the above function after a new auth.users row is inserted
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile when auth.users is updated
CREATE OR REPLACE FUNCTION public.update_profile_from_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET
    full_name = NEW.raw_user_meta_data->>'full_name',
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    job_title = NEW.raw_user_meta_data->>'job_title',
    primary_use_case = NEW.raw_user_meta_data->>'primary_use_case'
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create new trigger to update profiles when auth.users is updated
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
EXECUTE FUNCTION public.update_profile_from_user();
