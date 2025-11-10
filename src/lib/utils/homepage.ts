import { SECTION_IDS } from '@/constants/homepage';
import type { Section } from '@/types/homepage';

export default class HomepageUtils {
  /**
   * Normalize homepage sections payload before sending to the server.
   *
   * Background: The admin UI uses React Hook Form with `DEFAULT_SECTIONS` as the
   * defaultValues. For the styling section we render named inputs (title, url,
   * description, buttonText) but the default `data` value for that section may
   * still be an empty array. When the user fills the named inputs the form may
   * contain those values but the root `data` value can still be the empty array
   * which leads to persisting `data: []` to the DB.
   *
   * This helper ensures the styling section stores an object (when named fields
   * are present) and otherwise preserves the original value.
   */
  static normalizeStylingSections(
    sections: Section[],
    formValues?: { sections?: Array<{ data?: unknown }> },
  ): Section[] {
    const allValues = formValues ?? { sections: [] };

    return sections.map((s, idx) => {
      if (s.section_id !== SECTION_IDS.STYLING) return s;

      const formData = allValues.sections?.[idx]?.data;

      // If the stored value is an array (legacy/default), but the form contains
      // named fields, build an object from those named fields and persist that.
      if (Array.isArray(formData)) {
        const dataObj = allValues.sections?.[idx]?.data as Record<string, unknown> | undefined;
        const candidate = {
          title: typeof dataObj?.title === 'string' ? (dataObj.title as string) : undefined,
          url: typeof dataObj?.url === 'string' ? (dataObj.url as string) : undefined,
          description:
            typeof dataObj?.description === 'string' ? (dataObj.description as string) : undefined,
          buttonText:
            typeof dataObj?.buttonText === 'string' ? (dataObj.buttonText as string) : undefined,
        } as Record<string, unknown>;

        const hasValue = Object.values(candidate).some(
          (v) => v !== undefined && v !== null && v !== '',
        );

        return { ...s, data: hasValue ? candidate : formData } as Section;
      }

      // If formData is an object already, use it. Otherwise keep the original.
      if (formData && typeof formData === 'object' && !Array.isArray(formData)) {
        return { ...s, data: formData } as Section;
      }

      return s;
    });
  }

  /**
   * Extract and merge persisted sections payload with default sections.
   *
   * Returns the merged Section[] when a valid `sections` array exists in the
   * first row's `data` payload, otherwise returns null.
   */
  static mergeSectionsWithDefaultsFromRows(
    rows: unknown,
    defaultSections: Section[],
  ): Section[] | null {
    // New behavior: rows may contain multiple homepage_settings rows, one per
    // section/tab. Merge them into the default sections by matching row.tab
    // to section.section_id. Also remain compatible with legacy single-row
    // payloads which store data.sections in the first row.
    if (!rows || !Array.isArray(rows)) return null;

    const rowsArr = rows as Array<Record<string, unknown>>;

    // Try legacy payload first (single row with data.sections)
    const first = rowsArr[0];
    if (first && typeof first === 'object') {
      const payload = first['data'] as Record<string, unknown> | undefined;
      if (payload && typeof payload === 'object' && 'sections' in payload) {
        const sectionsVal = payload['sections'];
        if (Array.isArray(sectionsVal)) {
          const merged = defaultSections.map((d) => {
            const found = (sectionsVal as Section[]).find((s) => s.section_id === d.section_id);
            return { ...d, ...(found ?? {}) } as Section;
          });
          return merged;
        }
      }
    }

    // Modern payload: one row per tab. Build a map from tab -> row.data and
    // merge with defaults.
    const map = new Map<string, unknown>();
    for (const r of rowsArr) {
      const tab = String(r['tab'] ?? '');
      const data = r['data'];
      if (tab) map.set(tab, data);
    }

    const merged = defaultSections.map((d) => {
      const rowData = map.get(d.section_id);
      if (!rowData) return d;
      // If the stored rowData itself is a Section-like object, shallow merge.
      if (typeof rowData === 'object' && rowData !== null) {
        return { ...d, ...(rowData as Section) } as Section;
      }
      return d;
    });

    return merged;
  }
}
