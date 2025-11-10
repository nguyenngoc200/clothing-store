import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { SectionCard } from '@/components/admin/sections/SectionCard';
import { SectionRenderer } from '@/components/admin/sections/SectionRenderer';
import StickyActionBar from '@/components/admin/StickyActionBar';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DEFAULT_SECTIONS from '@/constants/homepage';
import HomepageUtils from '@/lib/utils/homepage';
import type { HomepageApiPayload } from '@/types/homepage';
import { formSchema } from '@/schemas/homepage';
import { homepageService } from '@/services/homepage.service';
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
    homepageService
      .getAll()
      .then((res) => {
        if (!mounted) return;

        if (res?.data?.length) {
          const rows = res.data;

          const merged = HomepageUtils.mergeSectionsWithDefaultsFromRows(
            rows,
            DEFAULT_SECTIONS as Section[],
          );

          if (merged) {
            setSavedSections(merged);
            reset({ sections: merged });
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

    // Normalize styling section shape before sending to the server.
    // RHF defaults and field arrays sometimes leave the `data` value as an array (the default)
    // even when individual styled fields exist. Use a helper to keep this component small.
    const allValues = form.getValues() as unknown as { sections?: Array<{ data?: unknown }> };
    const normalized = HomepageUtils.normalizeStylingSections(updatedSections, allValues);

    setSavedSections(normalized);
    try {
      // Batch upsert: send the aggregated sections array in a single request
      // so the server can split/upsert efficiently in one call.
      // Attach a `tab` field to each section object so the API receives the tab id
      // along with the section payload in the batch. Use the Record branch of
      // HomepageApiPayload.data so we can include the extra `tab` property.
      const sectionsWithTab = normalized.map((s) => ({ tab: s.section_id, data: { ...s } }));
      const payload: HomepageApiPayload = {
        data: { sections: sectionsWithTab } as Record<string, unknown>,
      };
      await homepageService.upsert(payload);

      // reset form and clear dirty state using reset with the saved values
      reset({ sections: normalized });
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

        <Tabs defaultValue={fields[0]?.section_id} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1">
            {fields?.map((field) => (
              <TabsTrigger key={field.id} value={field.section_id} className="whitespace-nowrap">
                {field.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {fields?.map((field, index) => (
            <TabsContent key={field.id} value={field.section_id} className="mt-4">
              <SectionCard label={field.label}>
                <SectionRenderer sectionId={field.section_id} index={index} />
              </SectionCard>
            </TabsContent>
          ))}
        </Tabs>

        <StickyActionBar visible={hasChanges} onCancel={onCancel} />
      </form>
    </Form>
  );
}
