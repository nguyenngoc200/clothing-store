import { useFormContext } from 'react-hook-form';
import { DynamicFormField } from '@/components/DynamicFormField';

interface StylingSectionProps {
  index: number;
}

export function StylingSection({ index }: StylingSectionProps) {
  const { control } = useFormContext();

  return (
    <div className="space-y-3 md:col-span-2">
      <DynamicFormField
        control={control}
        name={`sections.${index}.data.title` as const}
        label="Tiêu đề"
        type="input"
        inputType="text"
        placeholder="Tiêu đề Styling"
      />
      <DynamicFormField
        control={control}
        name={`sections.${index}.data.url` as const}
        label="URL"
        type="input"
        inputType="text"
        placeholder="Link (VD: https://...)"
      />
      <DynamicFormField
        control={control}
        name={`sections.${index}.data.description` as const}
        label="Mô tả"
        type="textarea"
        rows={3}
        placeholder="Mô tả"
      />
      <DynamicFormField
        control={control}
        name={`sections.${index}.data.buttonText` as const}
        label="Nút - Văn bản"
        type="input"
        inputType="text"
        placeholder="Văn bản nút"
      />
    </div>
  );
}
