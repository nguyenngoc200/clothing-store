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
import { OrderFormData } from '@/schemas';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<OrderFormData>;
  onSubmit: (data: OrderFormData) => Promise<void> | void;
  customers: { id: string; full_name: string }[];
  editingOrder: { id: string } | null;
  loading: boolean;
};

export default function OrderModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  customers,
  editingOrder,
  loading,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingOrder ? 'Sửa Đơn hàng' : 'Thêm Đơn hàng'}</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Khách hàng *</label>
            <select
              {...register('customer_id', { required: 'Vui lòng chọn khách hàng' })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Chọn khách hàng</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name}
                </option>
              ))}
            </select>
            {errors.customer_id && (
              <span className="text-red-500 text-sm">{errors.customer_id.message}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Địa chỉ *</label>
            <input
              type="text"
              {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {errors.address && (
              <span className="text-red-500 text-sm">{errors.address.message}</span>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Mã vận chuyển</label>
            <input
              type="text"
              {...register('shipping_code')}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Tổng tiền</label>
            <input
              type="number"
              step="0.01"
              {...register('total_amount', { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Ngày đặt hàng</label>
            <input
              type="date"
              {...register('order_date')}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                reset();
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
      </DialogContent>
    </Dialog>
  );
}
