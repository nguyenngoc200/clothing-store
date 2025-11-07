-- Migration: split homepage_settings single 'sections' payload into per-tab rows
-- Date: 2025-10-30

-- 1) Drop unique constraint/index on `key` so we can allow multiple rows per key
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'homepage_settings_key_key') THEN
    ALTER TABLE public.homepage_settings DROP CONSTRAINT homepage_settings_key_key;
  END IF;
END$$;

DROP INDEX IF EXISTS homepage_settings_key_key;

-- 2) Create a compound unique index on (key, tab)
CREATE UNIQUE INDEX IF NOT EXISTS ux_homepage_settings_key_tab ON public.homepage_settings (key, tab);

-- 3) For any existing row that stores the whole homepage as data.sections (legacy),
--    emit one row per section (tab) copying the per-section payload into data.
INSERT INTO public.homepage_settings (key, tab, site_id, "order", data, created_at, updated_at)
SELECT
  h.key,
  COALESCE(sec->> 'section_id', sec->> 'tab', sec->> 'id', sec->> 'label') as tab,
  h.site_id,
  row_number() OVER (PARTITION BY h.id ORDER BY COALESCE(sec->>'label', sec->>'section_id')),
  CASE WHEN (sec ? 'data') THEN sec->'data' ELSE sec END as data,
  now(), now()
FROM public.homepage_settings h,
  jsonb_array_elements(h.data->'sections') sec
WHERE jsonb_typeof(h.data->'sections') = 'array'
  AND NOT EXISTS (
    SELECT 1 FROM public.homepage_settings p
    WHERE p.key = h.key
      AND p.tab = COALESCE(sec->> 'section_id', sec->> 'tab', sec->> 'id', sec->> 'label')
  );

-- 4) Remove the original consolidated rows that contained data.sections
DELETE FROM public.homepage_settings WHERE jsonb_typeof(data->'sections') = 'array';

-- End migration
