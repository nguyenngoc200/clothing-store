-- Migration: remove columns key, site_id and "order" from homepage_settings
-- Date: 2025-10-30

-- Drop indexes/constraints that depend on these columns if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_homepage_settings_tab_site') THEN
    DROP INDEX IF EXISTS idx_homepage_settings_tab_site;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'ux_homepage_settings_key_tab') THEN
    DROP INDEX IF EXISTS ux_homepage_settings_key_tab;
  END IF;

  -- Drop legacy unique constraint on key if present
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'homepage_settings_key_key') THEN
    ALTER TABLE public.homepage_settings DROP CONSTRAINT homepage_settings_key_key;
  END IF;
END$$;

-- Safely drop the columns if present
ALTER TABLE public.homepage_settings
  DROP COLUMN IF EXISTS key,
  DROP COLUMN IF EXISTS site_id,
  DROP COLUMN IF EXISTS "order";

-- End migration
