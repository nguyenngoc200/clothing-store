'use client';

import { useFormContext } from 'react-hook-form';
import { DynamicFormField } from '@/components/DynamicFormField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { storageService } from '@/services/storage.service';
import { Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import Image from 'next/image';
import type { IconicImageItem } from '@/types/homepage';

interface IconicSectionProps {
  index: number;
}

export function IconicSection({ index }: IconicSectionProps) {
  const { control, setValue, watch } = useFormContext();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images: IconicImageItem[] = watch(`sections.${index}.data.images`) || [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding new files would exceed 4 images
    if (images.length + files.length > 4) {
      alert('Chỉ được upload tối đa 4 ảnh');
      return;
    }

    try {
      setUploading(true);

      const uploadPromises = Array.from(files).map((file) =>
        storageService.uploadFile(file, 'iconic'),
      );

      const results = await Promise.all(uploadPromises);
      const successUrls = results.filter((r) => r.success && r.data).map((r) => r.data!.publicUrl);

      if (successUrls.length > 0) {
        const currentImages: IconicImageItem[] = watch(`sections.${index}.data.images`) || [];
        const newImages: IconicImageItem[] = successUrls.map((url) => ({ url, title: '' }));
        setValue(`sections.${index}.data.images`, [...currentImages, ...newImages], {
          shouldDirty: true,
        });
      } else {
        alert('Upload failed');
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

  const handleRemoveImage = (imgIdx: number) => {
    const currentImages: IconicImageItem[] = watch(`sections.${index}.data.images`) || [];
    const filtered = currentImages.filter((_, idx) => idx !== imgIdx);
    setValue(`sections.${index}.data.images`, filtered, { shouldDirty: true });
  };

  const handleTitleChange = (imgIdx: number, title: string) => {
    const currentImages: IconicImageItem[] = watch(`sections.${index}.data.images`) || [];
    const updated = [...currentImages];
    updated[imgIdx] = { ...updated[imgIdx], title };
    setValue(`sections.${index}.data.images`, updated, { shouldDirty: true });
  };

  return (
    <div className="space-y-4 md:col-span-2">
      {/* Image Upload Section */}
      <div className="space-y-2">
        <Label>Ảnh Iconic Collections (Tối đa 4 ảnh)</Label>
        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            {images.map((imageItem: IconicImageItem, imgIdx: number) => (
              <div key={imgIdx} className="space-y-2">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-neutral-200">
                  <Image
                    src={imageItem.url}
                    alt={imageItem.title || `Iconic ${imgIdx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 z-10 h-6 w-6 p-0"
                    onClick={() => handleRemoveImage(imgIdx)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div>
                  <Label htmlFor={`image-title-${imgIdx}`} className="text-xs">
                    Tiêu đề ảnh {imgIdx + 1}
                  </Label>
                  <Input
                    id={`image-title-${imgIdx}`}
                    type="text"
                    value={imageItem.title || ''}
                    onChange={(e) => handleTitleChange(imgIdx, e.target.value)}
                    placeholder="Nhập tiêu đề cho ảnh này"
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length < 4 && (
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Đang upload...' : 'Chọn ảnh'}
            </Button>
            <p className="text-xs text-neutral-500 mt-2">
              PNG, JPG, GIF, WEBP (max 5MB) - Còn {4 - images.length} ảnh
            </p>
          </div>
        )}
      </div>

      {/* Title */}
      <DynamicFormField
        control={control}
        name={`sections.${index}.data.title` as const}
        label="Tiêu đề"
        type="input"
        inputType="text"
        placeholder="Tiêu đề Iconic"
      />

      {/* Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DynamicFormField
          control={control}
          name={`sections.${index}.data.boxFooter.title` as const}
          label="Footer - Tiêu đề"
          type="input"
          inputType="text"
          placeholder="Tiêu đề footer"
        />
        <DynamicFormField
          control={control}
          name={`sections.${index}.data.boxFooter.buttonText` as const}
          label="Footer - Nút"
          type="input"
          inputType="text"
          placeholder="Văn bản nút"
        />
      </div>
    </div>
  );
}
