-- Down migration: drop the unique index on homepage_settings.tab if it exists
DROP INDEX IF EXISTS public.homepage_settings_tab_unique_idx;
