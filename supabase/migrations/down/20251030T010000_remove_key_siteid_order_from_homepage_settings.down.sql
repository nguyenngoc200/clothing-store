-- Down migration: re-add key, site_id and "order" columns to homepage_settings
-- Date: 2025-10-30

-- 1) Add columns back (nullable to allow safe migration)
ALTER TABLE public.homepage_settings
  ADD COLUMN IF NOT EXISTS key text,
  ADD COLUMN IF NOT EXISTS site_id uuid,
  ADD COLUMN IF NOT EXISTS "order" int DEFAULT 0;

-- 2) Populate a sensible default for the key column for existing rows so we can
--    make it NOT NULL and unique. Use a conservative default that matches the
--    previous application default (if any). We use 'homepage_v1' here.
UPDATE public.homepage_settings SET key = 'homepage_v1' WHERE key IS NULL;

-- 3) Make key NOT NULL
ALTER TABLE public.homepage_settings ALTER COLUMN key SET NOT NULL;

-- 4) Restore unique constraint on key (legacy single-row behaviour)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'homepage_settings_key_key') THEN
    ALTER TABLE public.homepage_settings ADD CONSTRAINT homepage_settings_key_key UNIQUE (key);
  END IF;
END$$;

-- 5) Recreate index on (tab, site_id) for performance
CREATE INDEX IF NOT EXISTS idx_homepage_settings_tab_site ON public.homepage_settings (tab, site_id);

-- Note: This down migration intentionally sets a conservative default key value
-- for existing rows. If your application relied on different key values per-row
-- you should update them before or after running this down migration.

-- End down migration
