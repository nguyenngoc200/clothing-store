'use client';

import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
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
  const { control, setValue, getValues } = form;

  // selectedType controls which input is active. We render two checkboxes but only
  // one can be selected at a time (mutually exclusive). When user chooses percent
  // we clear amount, and vice-versa.
  const [selectedType, setSelectedType] = useState<'percent' | 'amount' | null>(null);

  // When modal opens for editing or creation, pick the correct selectedType.
  // Prefer the explicit `editingDiscount` prop (if provided) because the parent
  // may reset the form asynchronously. Fall back to form values otherwise.
  useEffect(() => {
    if (editingDiscount) {
      const ed = editingDiscount as {
        discount_percent?: number | null;
        discount_amount?: number | null;
      };
      // We're editing an existing discount — derive selectedType from the discount
      // record directly so the UI reflects edit-mode immediately.
      if (typeof ed.discount_percent === 'number' && !isNaN(ed.discount_percent)) {
        setSelectedType('percent');
        return;
      }
      if (typeof ed.discount_amount === 'number' && !isNaN(ed.discount_amount)) {
        setSelectedType('amount');
        return;
      }
      setSelectedType(null);
      return;
    }

    // Creation mode or no explicit editingDiscount provided: read current form values.
    const vals = getValues();
    if (typeof vals.discount_percent === 'number' && !isNaN(vals.discount_percent)) {
      setSelectedType('percent');
    } else if (typeof vals.discount_amount === 'number' && !isNaN(vals.discount_amount)) {
      setSelectedType('amount');
    } else {
      setSelectedType(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDiscount, open]);

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

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                {/* Show percent checkbox unless amount is already selected (hide the other type)
                    When neither is selected (creating new), both checkboxes are shown. */}
                {selectedType !== 'amount' && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedType === 'percent'}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedType('percent');
                          // clear amount when selecting percent
                          setValue('discount_amount', undefined);
                        } else {
                          setSelectedType(null);
                          setValue('discount_percent', undefined);
                        }
                      }}
                    />
                    <span>Giảm theo %</span>
                  </label>
                )}

                {selectedType !== 'percent' && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedType === 'amount'}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedType('amount');
                          setValue('discount_percent', undefined);
                        } else {
                          setSelectedType(null);
                          setValue('discount_amount', undefined);
                        }
                      }}
                    />
                    <span>Giảm theo giá (VND)</span>
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DynamicFormField
                  control={control}
                  name="discount_percent"
                  label="Phần trăm (%)"
                  type="input"
                  inputType="number"
                  placeholder="Ví dụ: 10%"
                  disabled={selectedType !== 'percent'}
                />

                <div>
                  <label className="block text-sm font-medium">Số tiền (VND)</label>
                  <Controller
                    control={control}
                    name="discount_amount"
                    render={({ field }) => {
                      const formatter = new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        maximumFractionDigits: 0,
                      });

                      const display =
                        typeof field.value === 'number' && !isNaN(field.value)
                          ? formatter.format(field.value)
                          : '';

                      return (
                        <input
                          type="text"
                          value={display}
                          onChange={(e) => {
                            // extract digits only and store numeric value
                            const digits = e.target.value.replace(/[^0-9]/g, '');
                            const num = digits === '' ? undefined : Number(digits);
                            field.onChange(num);
                          }}
                          disabled={selectedType !== 'amount'}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Ví dụ: 10.000 đ"
                        />
                      );
                    }}
                  />
                </div>
              </div>
            </div>

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
