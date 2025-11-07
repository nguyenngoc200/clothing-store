-- Create a unique index on homepage_settings.tab to support UPSERT ON CONFLICT (tab)
-- This migration is idempotent: it uses IF NOT EXISTS so it can be re-run safely.
CREATE UNIQUE INDEX IF NOT EXISTS homepage_settings_tab_unique_idx
  ON public.homepage_settings (tab);
