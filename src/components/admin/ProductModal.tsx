'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { DynamicFormField } from '@/components/DynamicFormField';
import { Controller } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { storageService } from '@/services/storage.service';
import { PRODUCT_SIZES } from '@/constants/product';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormData } from '@/schemas';

type Option = { value: string; label: string };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void> | void;
  title?: string;
  categoryOptions: Option[];
  onClose: () => void;
  loading?: boolean;
}

export default function ProductModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  title = 'Product',
  categoryOptions,
  onClose,
  loading = false,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const image = form.watch('image');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await storageService.uploadFile(file, 'products');

      if (result.success && result.data) {
        form.setValue('image', result.data.publicUrl, { shouldDirty: true });
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

  const handleRemoveImage = () => {
    form.setValue('image', '', { shouldDirty: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DynamicFormField
              control={form.control}
              name="title"
              label="Tên sản phẩm"
              type="input"
              required
              placeholder="Nhập tên sản phẩm"
            />

            <DynamicFormField
              control={form.control}
              name="description"
              label="Mô tả"
              type="textarea"
              placeholder="Nhập mô tả sản phẩm"
              rows={3}
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Ảnh sản phẩm</Label>
              {image ? (
                <div className="relative w-full aspect-square max-w-xs rounded-lg overflow-hidden border border-neutral-200">
                  <Image src={image} alt="Product" fill className="object-cover" unoptimized />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 z-10 h-8 w-8 p-0"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
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
                    size="sm"
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

            <Controller
              control={form.control}
              name="purchase_price"
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">Giá nhập</label>
                  <NumericFormat
                    value={field.value ?? ''}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(values: { floatValue?: number | undefined }) =>
                      field.onChange(values.floatValue ?? undefined)
                    }
                    onBlur={field.onBlur}
                    customInput={Input}
                    placeholder="0"
                    suffix={' ₫'}
                  />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="suggested"
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-1">Giá đề xuất</label>
                  <NumericFormat
                    value={field.value ?? ''}
                    thousandSeparator="."
                    decimalSeparator=","
                    allowNegative={false}
                    onValueChange={(values: { floatValue?: number | undefined }) =>
                      field.onChange(values.floatValue ?? undefined)
                    }
                    onBlur={field.onBlur}
                    customInput={Input}
                    placeholder="0"
                    suffix={' ₫'}
                  />
                </div>
              )}
            />

            <DynamicFormField
              control={form.control}
              name="size"
              label="Size"
              type="select"
              options={PRODUCT_SIZES}
              placeholder="Chọn size"
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={form.control}
                name="width"
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">Chiều ngang (cm)</label>
                    <NumericFormat
                      value={field.value ?? ''}
                      thousandSeparator="."
                      decimalSeparator=","
                      allowNegative={false}
                      onValueChange={(values: { floatValue?: number | undefined }) =>
                        field.onChange(values.floatValue ?? undefined)
                      }
                      onBlur={field.onBlur}
                      customInput={Input}
                      placeholder="0"
                      suffix=" cm"
                    />
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="height"
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">Chiều cao (cm)</label>
                    <NumericFormat
                      value={field.value ?? ''}
                      thousandSeparator="."
                      decimalSeparator=","
                      allowNegative={false}
                      onValueChange={(values: { floatValue?: number | undefined }) =>
                        field.onChange(values.floatValue ?? undefined)
                      }
                      onBlur={field.onBlur}
                      customInput={Input}
                      placeholder="0"
                      suffix=" cm"
                    />
                  </div>
                )}
              />
            </div>

            <DynamicFormField
              control={form.control}
              name="color"
              label="Màu"
              type="input"
              placeholder="Nhập màu"
            />

            <DynamicFormField
              control={form.control}
              name="category_id"
              label="Danh mục"
              type="select"
              options={categoryOptions}
              placeholder="Chọn danh mục"
            />

            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                Hủy
              </Button>
              <Button type="submit" disabled={loading} textLoading="Đang lưu" loadingDots={loading}>
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
