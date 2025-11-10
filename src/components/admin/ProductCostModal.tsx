'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { productCostService } from '@/services/productCost.service';
import { calculationService } from '@/services/calculation.service';
import CalculationUtils from '@/lib/utils/calculation';
import SETTINGS from '@/constants/settings';
import type { ProductCostForm } from './settings/tabs/ProductCostSettings';

type CostItem = {
  label: string;
  amount?: number;
};

type CalculationData = {
  advertising?: CostItem[];
  packaging?: CostItem[];
  shipping?: CostItem[];
  personnel?: CostItem[];
  rent?: CostItem[];
  freeship?: CostItem[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // include possible legacy/DB fields present on the editing row
  initial?:
    | (Partial<ProductCostForm> & { key?: string; id?: string })
    | (Record<string, unknown> & {
        key?: string;
        id?: string;
        data?: Record<string, unknown>;
        profit_margin?: number;
      });
  onSaved?: () => void;
}

export default function ProductCostModal({ open, onOpenChange, initial, onSaved }: Props) {
  const form = useForm<ProductCostForm>({
    defaultValues: {
      title: '',
      advertising: '',
      packaging: '',
      shipping: '',
      personnel: '',
      rent: '',
      profitMargin: 30,
    },
  });

  const { register, reset, handleSubmit } = form;

  const [calculationData, setCalculationData] = React.useState<CalculationData | null>(null);

  useEffect(() => {
    if (initial) {
      const row = initial as unknown as Record<string, unknown>;
      const normalized: ProductCostForm = {
        title:
          typeof row['title'] === 'string'
            ? (row['title'] as string)
            : ((row['title'] as string) ?? ''),
        advertising:
          typeof row['advertising'] === 'string'
            ? (row['advertising'] as string)
            : JSON.stringify(row['advertising'] ?? ''),
        packaging:
          typeof row['packaging'] === 'string'
            ? (row['packaging'] as string)
            : JSON.stringify(row['packaging'] ?? ''),
        shipping:
          typeof row['shipping'] === 'string'
            ? (row['shipping'] as string)
            : JSON.stringify(row['shipping'] ?? ''),
        personnel:
          typeof row['personnel'] === 'string'
            ? (row['personnel'] as string)
            : JSON.stringify(row['personnel'] ?? ''),
        rent:
          typeof row['rent'] === 'string'
            ? (row['rent'] as string)
            : JSON.stringify(row['rent'] ?? ''),
        profitMargin: (row['profitMargin'] as number) ?? (row['profit_margin'] as number) ?? 30,
      };
      reset(normalized);
    } else {
      reset({
        title: '',
        advertising: '',
        packaging: '',
        shipping: '',
        personnel: '',
        rent: '',
        profitMargin: 30,
      });
    }
  }, [initial, reset]);

  // When calculationData is loaded, try to map initial values to the exact option JSON
  // strings used in <option value={JSON.stringify(it)}>. This ensures the select shows
  // the saved choice when editing.
  useEffect(() => {
    if (!calculationData || !initial) return;

    const pickStringFor = (cat: keyof CalculationData, input?: unknown) => {
      if (!input) return '';
      // if already a string, try to parse
      let parsed: unknown = null;
      if (typeof input === 'string') {
        try {
          parsed = JSON.parse(input);
        } catch {
          // it's a raw string (empty or invalid), return as-is
          return input as string;
        }
      } else parsed = input;

      if (!parsed || typeof parsed !== 'object') return '';

      const list = calculationData[cat] || [];
      const p = parsed as Record<string, unknown>;
      const match = list.find((it) => {
        if (!it) return false;
        if ((it.label ?? '') !== ((p['label'] as string) ?? '')) return false;
        const a = it.amount ?? null;
        const b = (p['amount'] as number) ?? null;
        return a === b;
      });

      if (match) return JSON.stringify(match);
      return JSON.stringify(p);
    };

    const row = initial as unknown as Record<string, unknown>;
    const normalized: ProductCostForm = {
      title:
        typeof row['title'] === 'string'
          ? (row['title'] as string)
          : ((row['title'] as string) ?? ''),
      advertising: pickStringFor(
        'advertising',
        row['advertising'] ??
          (row['data'] && (row['data'] as Record<string, unknown>)['advertising']),
      ),
      packaging: pickStringFor(
        'packaging',
        row['packaging'] ?? (row['data'] && (row['data'] as Record<string, unknown>)['packaging']),
      ),
      shipping: pickStringFor(
        'shipping',
        row['shipping'] ?? (row['data'] && (row['data'] as Record<string, unknown>)['shipping']),
      ),
      personnel: pickStringFor(
        'personnel',
        row['personnel'] ?? (row['data'] && (row['data'] as Record<string, unknown>)['personnel']),
      ),
      rent: pickStringFor(
        'rent',
        row['rent'] ?? (row['data'] && (row['data'] as Record<string, unknown>)['rent']),
      ),
      profitMargin: (row['profitMargin'] as number) ?? (row['profit_margin'] as number) ?? 30,
    };

    reset(normalized);
  }, [calculationData, initial, reset]);

  // Load calculation settings to populate selects
  useEffect(() => {
    let mounted = true;

    calculationService
      .getAll()
      .then((res) => {
        if (!mounted) return;
        const rows = (res?.data as Record<string, unknown>[]) || [];
        // Build mapping tab -> data (tolerant to data column or per-column storage)
        const payloadObj: Record<string, unknown> = {};
        rows.forEach((r) => {
          if (!r) return;
          const tab = r.tab as string | undefined;
          if (!tab) return;
          let value: unknown = r.data ?? null;
          if (value == null) {
            const maybe = r[tab];
            if (maybe !== undefined) value = maybe;
          }
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch {
              // leave as string
            }
          }
          payloadObj[tab] = value;
        });

        const normalized = CalculationUtils.normalizePayload(payloadObj);
        setCalculationData(normalized as CalculationData);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(values: ProductCostForm) {
    try {
      const id = initial?.id;

      // send values as payload to product-cost API; include id when editing
      const payload: Record<string, unknown> = { tab: SETTINGS.PRODUCT_COST.tab, ...values };
      if (id) payload.id = id;

      await productCostService.upsert(payload);
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to save product cost', err);
      alert('Lưu thất bại');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.key ? 'Chỉnh sửa chi phí' : 'Tạo chi phí mới'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <input {...register('title')} className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quảng cáo</label>
              <select {...register('advertising')} className="w-full border rounded px-3 py-2">
                <option value="">-- Chọn --</option>
                {calculationData?.advertising?.map((it, i) => (
                  <option key={i} value={JSON.stringify(it)}>
                    {it.label}{' '}
                    {it.amount
                      ? `- ${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(it.amount)}₫`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Đóng gói</label>
              <select {...register('packaging')} className="w-full border rounded px-3 py-2">
                <option value="">-- Chọn --</option>
                {calculationData?.packaging?.map((it, i) => (
                  <option key={i} value={JSON.stringify(it)}>
                    {it.label}{' '}
                    {it.amount
                      ? `- ${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(it.amount)}₫`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Vận chuyển</label>
              <select {...register('shipping')} className="w-full border rounded px-3 py-2">
                <option value="">-- Chọn --</option>
                {calculationData?.shipping?.map((it, i) => (
                  <option key={i} value={JSON.stringify(it)}>
                    {it.label}{' '}
                    {it.amount
                      ? `- ${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(it.amount)}₫`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nhân sự</label>
              <select {...register('personnel')} className="w-full border rounded px-3 py-2">
                <option value="">-- Chọn --</option>
                {calculationData?.personnel?.map((it, i) => (
                  <option key={i} value={JSON.stringify(it)}>
                    {it.label}{' '}
                    {it.amount
                      ? `- ${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(it.amount)}₫`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mặt bằng</label>
              <select {...register('rent')} className="w-full border rounded px-3 py-2">
                <option value="">-- Chọn --</option>
                {calculationData?.rent?.map((it, i) => (
                  <option key={i} value={JSON.stringify(it)}>
                    {it.label}{' '}
                    {it.amount
                      ? `- ${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(it.amount)}₫`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tỷ lệ lợi nhuận (%)</label>
              <input
                type="number"
                {...register('profitMargin', { valueAsNumber: true })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
