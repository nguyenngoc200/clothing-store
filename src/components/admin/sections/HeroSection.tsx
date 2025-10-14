'use client';

import { useFormContext } from 'react-hook-form';
import { DynamicFormField } from '@/components/DynamicFormField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { storageService } from '@/services/storage.service';
import { Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import Image from 'next/image';

interface HeroSectionProps {
  index: number;
}

export function HeroSection({ index }: HeroSectionProps) {
  const { control, setValue, watch } = useFormContext();
  const [uploading, setUploading] = useState<{ boxOne: boolean; boxTwo: boolean }>({
    boxOne: false,
    boxTwo: false,
  });
  const fileInputRefBoxOne = useRef<HTMLInputElement>(null);
  const fileInputRefBoxTwo = useRef<HTMLInputElement>(null);

  const boxOneImages = watch(`sections.${index}.data.boxOne.images`) || [];
  const boxTwoImages = watch(`sections.${index}.data.boxTwo.images`) || [];

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    box: 'boxOne' | 'boxTwo',
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading((prev) => ({ ...prev, [box]: true }));

      const uploadPromises = Array.from(files).map((file) =>
        storageService.uploadFile(file, `hero/${box}`),
      );

      const results = await Promise.all(uploadPromises);
      const successUrls = results.filter((r) => r.success && r.data).map((r) => r.data!.publicUrl);

      if (successUrls.length > 0) {
        const currentImages = watch(`sections.${index}.data.${box}.images`) || [];
        setValue(`sections.${index}.data.${box}.images`, [...currentImages, ...successUrls], {
          shouldDirty: true,
        });
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [box]: false }));
      if (box === 'boxOne' && fileInputRefBoxOne.current) {
        fileInputRefBoxOne.current.value = '';
      }
      if (box === 'boxTwo' && fileInputRefBoxTwo.current) {
        fileInputRefBoxTwo.current.value = '';
      }
    }
  };

  const handleRemoveImage = (box: 'boxOne' | 'boxTwo', imageUrl: string) => {
    const currentImages = watch(`sections.${index}.data.${box}.images`) || [];
    const filtered = currentImages.filter((url: string) => url !== imageUrl);
    setValue(`sections.${index}.data.${box}.images`, filtered, { shouldDirty: true });
  };

  return (
    <div className="space-y-6 md:col-span-2">
      {/* Box One */}
      <div className="space-y-3 border p-4 rounded-lg">
        <h3 className="font-semibold text-lg">Box One (Main Hero)</h3>

        {/* Box One Images */}
        <div className="space-y-2">
          <Label>Ảnh Box One</Label>
          {boxOneImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
              {boxOneImages.map((imageUrl: string, imgIdx: number) => (
                <div
                  key={imgIdx}
                  className="relative aspect-video rounded-lg overflow-hidden border border-neutral-200"
                >
                  <Image
                    src={imageUrl}
                    alt={`Box One ${imgIdx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 z-10 h-6 w-6 p-0"
                    onClick={() => handleRemoveImage('boxOne', imageUrl)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
            <input
              ref={fileInputRefBoxOne}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e, 'boxOne')}
              className="hidden"
              disabled={uploading.boxOne}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRefBoxOne.current?.click()}
              disabled={uploading.boxOne}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading.boxOne ? 'Đang upload...' : 'Chọn ảnh'}
            </Button>
            <p className="text-xs text-neutral-500 mt-2">
              PNG, JPG, GIF, WEBP (max 5MB) - Có thể chọn nhiều ảnh
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DynamicFormField
            control={control}
            name={`sections.${index}.data.boxOne.title` as const}
            label="Tiêu đề"
            type="input"
            inputType="text"
            placeholder="Tiêu đề lớn"
          />
          <DynamicFormField
            control={control}
            name={`sections.${index}.data.boxOne.description` as const}
            label="Mô tả"
            type="textarea"
            rows={3}
            placeholder="Mô tả ngắn"
          />
          <DynamicFormField
            control={control}
            name={`sections.${index}.data.boxOne.buttonText` as const}
            label="Nút - Văn bản"
            type="input"
            inputType="text"
            placeholder="VD: MUA NGAY"
          />
        </div>
      </div>

      {/* Box Two */}
      <div className="space-y-3 border p-4 rounded-lg">
        <h3 className="font-semibold text-lg">Box Two (Side)</h3>

        {/* Box Two Images */}
        <div className="space-y-2">
          <Label>Ảnh Box Two</Label>
          {boxTwoImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
              {boxTwoImages.map((imageUrl: string, imgIdx: number) => (
                <div
                  key={imgIdx}
                  className="relative aspect-video rounded-lg overflow-hidden border border-neutral-200"
                >
                  <Image
                    src={imageUrl}
                    alt={`Box Two ${imgIdx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 z-10 h-6 w-6 p-0"
                    onClick={() => handleRemoveImage('boxTwo', imageUrl)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
            <input
              ref={fileInputRefBoxTwo}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e, 'boxTwo')}
              className="hidden"
              disabled={uploading.boxTwo}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRefBoxTwo.current?.click()}
              disabled={uploading.boxTwo}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading.boxTwo ? 'Đang upload...' : 'Chọn ảnh'}
            </Button>
            <p className="text-xs text-neutral-500 mt-2">
              PNG, JPG, GIF, WEBP (max 5MB) - Có thể chọn nhiều ảnh
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DynamicFormField
            control={control}
            name={`sections.${index}.data.boxTwo.title` as const}
            label="Tiêu đề"
            type="input"
            inputType="text"
            placeholder="Tiêu đề Box 2"
          />
          <DynamicFormField
            control={control}
            name={`sections.${index}.data.boxTwo.description` as const}
            label="Mô tả"
            type="textarea"
            rows={3}
            placeholder="Mô tả Box 2"
          />
        </div>
      </div>
    </div>
  );
}
