import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { DynamicFormField } from '@/components/DynamicFormField';
import { Button } from '@/components/ui/button';

interface CategorySectionProps {
  index: number;
}

export function CategorySection({ index }: CategorySectionProps) {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${index}.data` as const,
  });

  const addCategory = () => {
    append({ label: '' });
  };

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="block sm:flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Danh sách Category Tabs</h4>
        <Button
          type="button"
          onClick={addCategory}
          size="sm"
          variant="outline"
          className="mt-3 sm:mt-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-1" />
          Thêm Tab
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-neutral-500 italic">
          Chưa có category nào. Nhấn &quot;Thêm Tab&quot; để tạo mới.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, catIndex) => (
          <div
            key={field.id}
            className="flex gap-3 items-start p-3 bg-neutral-50 rounded border border-neutral-200"
          >
            <div className="flex-1">
              <DynamicFormField
                control={control}
                name={`sections.${index}.data.${catIndex}.label` as const}
                label="Tên category"
                type="input"
                inputType="text"
                placeholder="VD: Áo, Quần, Giày..."
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => remove(catIndex)}
              className="mt-6"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
