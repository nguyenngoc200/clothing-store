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
import { CustomerFormData } from '@/schemas';
import { DynamicFormField } from '@/components/DynamicFormField';
import { Form } from '@/components/ui/form';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void> | void;
  editingCustomer: { id: string } | null;
  loading: boolean;
};

export default function CustomerModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  editingCustomer,
  loading,
}: Props) {
  const { control } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCustomer ? 'Sửa Khách hàng' : 'Thêm Khách hàng'}</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DynamicFormField
              control={control}
              name="full_name"
              label="Họ và tên"
              type="input"
              required
              placeholder="Nhập họ và tên"
            />

            <DynamicFormField
              control={control}
              name="phone_number"
              label="Số điện thoại"
              type="input"
              inputType="tel"
              placeholder="Nhập số điện thoại"
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
