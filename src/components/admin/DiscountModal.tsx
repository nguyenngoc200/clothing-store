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
import { DiscountFormData } from '@/schemas';
import { DynamicFormField } from '@/components/DynamicFormField';
import { Form } from '@/components/ui/form';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<DiscountFormData>;
  onSubmit: (data: DiscountFormData) => Promise<void> | void;
  editingDiscount: { id: string } | null;
  loading: boolean;
};

export default function DiscountModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  editingDiscount,
  loading,
}: Props) {
  const { control } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingDiscount ? 'Sửa Mã giảm giá' : 'Thêm Mã giảm giá'}</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DynamicFormField
              control={control}
              name="code"
              label="Mã"
              type="input"
              placeholder="Nhập mã giảm giá"
            />

            <DynamicFormField
              control={control}
              name="title"
              label="Tiêu đề"
              type="input"
              placeholder="Nhập tiêu đề"
            />

            <DynamicFormField
              control={control}
              name="description"
              label="Mô tả"
              type="textarea"
              placeholder="Nhập mô tả"
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
