-- Down migration: re-aggregate per-tab homepage_settings rows back into a single 'sections' payload
-- Date: 2025-10-30

-- 1) For each key, aggregate per-tab rows into a single sections array and insert a consolidated row
WITH per_key AS (
  SELECT
    key,
    jsonb_agg(jsonb_build_object('section_id', tab, 'data', data) ORDER BY coalesce("order", 0)) AS sections
  FROM public.homepage_settings
  GROUP BY key
)
INSERT INTO public.homepage_settings (key, tab, data, created_at, updated_at)
SELECT
  pk.key,
  'homepage' AS tab,
  jsonb_build_object('sections', pk.sections),
  now(), now()
FROM per_key pk
WHERE NOT EXISTS (
  SELECT 1 FROM public.homepage_settings p WHERE p.key = pk.key AND jsonb_typeof(p.data->'sections') = 'array'
);

-- 2) Remove per-tab rows (keep only the consolidated row per key)
DELETE FROM public.homepage_settings
WHERE tab <> 'homepage'
  AND key IN (SELECT key FROM public.homepage_settings WHERE jsonb_typeof(data->'sections') = 'array');

-- 3) Restore unique constraint on key (remove compound index)
DROP INDEX IF EXISTS ux_homepage_settings_key_tab;

ALTER TABLE public.homepage_settings
  ADD CONSTRAINT homepage_settings_key_key UNIQUE (key);

-- End down migration
