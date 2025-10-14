import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AdvertisementSection } from '@/components/admin/sections/AdvertisementSection';
import { BrandSection } from '@/components/admin/sections/BrandSection';
import { CategorySection } from '@/components/admin/sections/CategorySection';
import { HeroSection } from '@/components/admin/sections/HeroSection';
import { IconicSection } from '@/components/admin/sections/IconicSection';
import { ProductSelectionSection } from '@/components/admin/sections/ProductSelectionSection';
import { StylingSection } from '@/components/admin/sections/StylingSection';
import StickyActionBar from '@/components/admin/StickyActionBar';
import { Form } from '@/components/ui/form';
import DEFAULT_SECTIONS, { SECTION_IDS } from '@/constants/homepage';
import SETTINGS from '@/constants/settings';
import { formSchema } from '@/schemas/homepage';
import { getSettings, SettingRow, upsertSetting } from '@/services/settings.service';
import type { Section } from '@/types/homepage';

export default function SectionSettings() {
  const [savedSections, setSavedSections] = useState<Section[]>(DEFAULT_SECTIONS as Section[]);
  const [hasChanges, setHasChanges] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // cast the imported DEFAULT_SECTIONS to the local form schema type
    defaultValues: {
      sections: DEFAULT_SECTIONS as z.infer<typeof formSchema>['sections'],
    },
  });

  const { control, reset, formState } = form;
  const { fields } = useFieldArray({ control, name: 'sections' });

  // Detect form changes
  useEffect(() => {
    setHasChanges(formState.isDirty);
  }, [formState.isDirty]);

  // Fetch persisted settings from API on mount and reset form
  useEffect(() => {
    let mounted = true;
    getSettings(SETTINGS.HOMEPAGE.tab)
      .then((data) => {
        if (!mounted) return;
        if (data?.length) {
          const rows = data as SettingRow[];
          const payload: unknown = rows[0]?.data;
          if (payload && typeof payload === 'object' && 'sections' in payload) {
            const sectionsVal = (payload as Record<string, unknown>)['sections'];
            if (Array.isArray(sectionsVal)) {
              // merge with defaults to keep any missing keys
              const merged = DEFAULT_SECTIONS.map((d) => {
                const found = (sectionsVal as Section[]).find((s) => s.section_id === d.section_id);
                return { ...d, ...(found ?? {}) } as Section;
              });
              setSavedSections(merged);
              reset({ sections: merged });
            }
          }
        }
      })
      .catch(() => {
        // ignore
      });

    return () => {
      mounted = false;
    };
  }, [reset]);

  async function onSubmit() {
    // Use form.getValues() instead of values parameter to get correct nested data
    const currentValues = form.getValues();
    const updatedSections = currentValues.sections as Section[];

    setSavedSections(updatedSections);
    try {
      await upsertSetting({
        key: SETTINGS.HOMEPAGE.key,
        tab: SETTINGS.HOMEPAGE.tab,
        data: { sections: updatedSections },
      });
      // reset form and clear dirty state using reset with the saved values
      reset({ sections: updatedSections });
      console.log('Homepage settings saved successfully!');
    } catch (error) {
      console.error('Failed to save homepage settings', error);
      // Revert savedSections state to previous to be safe
      setSavedSections((prev) => prev);
    }
  }

  function onCancel() {
    form.reset({ sections: savedSections });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-36">
        <p className="text-sm text-neutral-600">
          Quản lý các phần trên trang chủ. Thực hiện thay đổi ở các thẻ dưới đây và bấm Lưu để
          persist.
        </p>

        <div className="space-y-2">
          {fields?.map((field, index) => {
            return (
              <div key={field.id} className="bg-white p-3 rounded shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-semibold">{field.label}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-white rounded shadow-sm p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* section-specific fields */}
                    {field.section_id === SECTION_IDS.ADVERTISEMENT && (
                      <AdvertisementSection index={index} />
                    )}

                    {field.section_id === SECTION_IDS.HERO && <HeroSection index={index} />}

                    {field.section_id === SECTION_IDS.CATEGORIES && (
                      <CategorySection index={index} />
                    )}

                    {field.section_id === SECTION_IDS.PRODUCTS && (
                      <ProductSelectionSection index={index} label="Chọn sản phẩm nổi bật" />
                    )}

                    {field.section_id === SECTION_IDS.BRAND && <BrandSection index={index} />}

                    {field.section_id === SECTION_IDS.WHATSHOT && (
                      <ProductSelectionSection index={index} label="Chọn sản phẩm What's Hot" />
                    )}

                    {field.section_id === SECTION_IDS.ICONIC && <IconicSection index={index} />}

                    {field.section_id === SECTION_IDS.SHOES && (
                      <ProductSelectionSection index={index} label="Chọn sản phẩm Shoes" />
                    )}

                    {field.section_id === SECTION_IDS.STYLING && <StylingSection index={index} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <StickyActionBar visible={hasChanges} onCancel={onCancel} />
      </form>
    </Form>
  );
}
