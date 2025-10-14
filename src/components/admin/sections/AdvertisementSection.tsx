import { useFormContext } from 'react-hook-form';

import { DynamicFormField } from '@/components/DynamicFormField';

interface AdvertisementSectionProps {
  index: number;
}

export function AdvertisementSection({ index }: AdvertisementSectionProps) {
  const { control } = useFormContext();

  return (
    <div className="md:col-span-2">
      <DynamicFormField
        control={control}
        name={`sections.${index}.data.title` as const}
        label="Tiêu đề"
        type="textarea"
        placeholder="Tiêu đề quảng cáo"
      />
    </div>
  );
}
