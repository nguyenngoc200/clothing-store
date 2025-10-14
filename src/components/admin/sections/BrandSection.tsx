'use client';

import { useFormContext } from 'react-hook-form';
import { DynamicFormField } from '@/components/DynamicFormField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { storageService } from '@/services/storage.service';
import { Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import Image from 'next/image';

interface BrandSectionProps {
  index: number;
}

export function BrandSection({ index }: BrandSectionProps) {
  const { control, setValue, watch } = useFormContext();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = watch(`sections.${index}.data.image`);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await storageService.uploadFile(file, 'brand');

      if (result.success && result.data) {
        // Save signed URL to form (expires in 1 year)
        setValue(`sections.${index}.data.image`, result.data.publicUrl, {
          shouldDirty: true,
        });
      } else {
        alert(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setValue(`sections.${index}.data.image`, '', { shouldDirty: true });
  };

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="space-y-2">
        <Label>Ảnh thương hiệu</Label>

        {imageUrl ? (
          <div className="space-y-2">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-neutral-200">
              <Image src={imageUrl} alt="Brand preview" fill className="object-cover" unoptimized />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-neutral-500 truncate">{imageUrl}</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Đang upload...' : 'Chọn ảnh'}
            </Button>
            <p className="text-xs text-neutral-500 mt-2">PNG, JPG, GIF, WEBP (max 5MB)</p>
          </div>
        )}
      </div>

      <DynamicFormField
        control={control}
        name={`sections.${index}.data.title` as const}
        label="Tiêu đề"
        type="input"
        inputType="text"
        placeholder="Tiêu đề thương hiệu"
      />
      <DynamicFormField
        control={control}
        name={`sections.${index}.data.description` as const}
        label="Mô tả"
        type="textarea"
        rows={3}
        placeholder="Mô tả thương hiệu"
      />
    </div>
  );
}
