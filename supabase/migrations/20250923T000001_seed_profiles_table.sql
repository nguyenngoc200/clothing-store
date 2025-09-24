-- ================================================
-- SEED USERS AND PROFILES
-- Description: Seeds the auth.users and public.profiles tables with a default user
-- ================================================

-- 1. Create a user in auth.users
INSERT INTO auth.users (id, email, encrypted_password, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'default.user@example.com', 'password', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Create a profile for the user in public.profiles
INSERT INTO public.profiles (id, full_name, internal_staff_role)
VALUES ('00000000-0000-0000-0000-000000000000', 'Default User', 'super_admin')
ON CONFLICT (id) DO NOTHING;
