'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { CategoryFormData } from '@/schemas';
import { DynamicFormField } from '@/components/DynamicFormField';
import { Form } from '@/components/ui/form';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => Promise<void> | void;
  editingCategory: { id: string } | null;
  loading: boolean;
};

export default function CategoryModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  editingCategory,
  loading,
}: Props) {
  const { control } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCategory ? 'Sửa Danh mục' : 'Thêm Danh mục'}</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DynamicFormField
              control={control}
              name="title"
              label="Tiêu đề"
              type="input"
              required
              placeholder="Nhập tiêu đề danh mục"
            />

            <DynamicFormField
              control={control}
              name="description"
              label="Mô tả"
              type="textarea"
              placeholder="Nhập mô tả danh mục"
              rows={3}
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                type="button"
              >
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
