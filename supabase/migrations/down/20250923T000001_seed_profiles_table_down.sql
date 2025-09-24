-- Rollback for seed_profiles_table
-- Remove seeded profile and user
DELETE FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000000';
DELETE FROM auth.users WHERE id = '00000000-0000-0000-000000000000';
