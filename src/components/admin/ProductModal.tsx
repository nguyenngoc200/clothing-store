'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from 'react';
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
import { Upload, X, Calculator } from 'lucide-react';
import Image from 'next/image';
import { storageService } from '@/services/storage.service';
import { PRODUCT_SIZES } from '@/constants/product';
import { productCostService } from '@/services/productCost.service';
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
  const [showPriceCalculator, setShowPriceCalculator] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<{
    costs: Array<{ category: string; label: string; value: number; type: string }>;
    totalCost: number;
    suggestedPrice: number;
    profitMargin: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productCostRows, setProductCostRows] = useState<any[]>([]);
  const [selectedCostKey, setSelectedCostKey] = useState<string | null>(null);

  const image = form.watch('image');
  const purchasePrice = form.watch('purchase_price');

  // Extract computation logic so it can be used both for the inline card and the detail dialog
  const computePriceBreakdown = (
    settingsRows: any[],
    chosenKey: string | null,
    purchase: number,
  ) => {
    if (!purchase || purchase <= 0) return null;
    if (!settingsRows?.length) return null;

    const key = chosenKey || settingsRows[0].key;
    const row = settingsRows.find((r: any) => r.key === key) || settingsRows[0];
    const chosenRowAny = row as any;
    const costSettings: any =
      chosenRowAny.data && typeof chosenRowAny.data === 'object'
        ? chosenRowAny.data
        : {
            advertising: chosenRowAny.advertising ?? null,
            packaging: chosenRowAny.packaging ?? null,
            shipping: chosenRowAny.shipping ?? null,
            personnel: chosenRowAny.personnel ?? null,
            rent: chosenRowAny.rent ?? null,
            profitMargin: chosenRowAny.profit_margin ?? chosenRowAny.profitMargin ?? 30,
          };

    const profitMargin = costSettings.profitMargin || 30;

    const categoryLabels: Record<string, string> = {
      advertising: 'Quảng cáo',
      packaging: 'Đóng gói',
      shipping: 'Vận chuyển',
      personnel: 'Nhân sự',
      rent: 'Mặt bằng',
    };

    const costs: Array<{ category: string; label: string; value: number; type: string }> = [];
    let totalAdditionalCost = 0;

    const categories = ['advertising', 'packaging', 'shipping', 'personnel', 'rent'];
    for (const cat of categories) {
      const selected = costSettings[cat];
      if (!selected) continue;
      try {
        let item: any;
        if (typeof selected === 'string') item = JSON.parse(selected);
        else if (typeof selected === 'object') item = selected;
        if (!item) continue;

        let costValue = 0;
        // prefer explicit amount. legacy percent values are ignored here as
        // they cannot be converted without context (product price per item).
        if (item.amount != null && typeof item.amount === 'number') {
          costValue = item.amount;
        }

        if (costValue) {
          costs.push({
            category: categoryLabels[cat] || cat,
            label: item.label || 'Chi phí',
            value: costValue,
            type: 'VND',
          });
          totalAdditionalCost += costValue;
        }
      } catch (e) {
        console.error(`✗ Failed to parse cost item for ${cat}:`, selected, e);
      }
    }

    const totalCost = purchase + totalAdditionalCost;
    const suggestedPrice = totalCost / (1 - profitMargin / 100);

    return {
      costs,
      totalCost,
      suggestedPrice: Math.round(suggestedPrice),
      profitMargin,
    };
  };

  const handleCalculateSuggestedPrice = async () => {
    const purchase = purchasePrice || 0;
    if (!purchase || purchase <= 0) {
      alert('Vui lòng nhập Giá nhập trước khi tính giá đề xuất');
      return;
    }

    try {
      const res = await productCostService.getAll();
      const settings = res?.data || [];
      if (!settings?.length) {
        alert('Chưa có cài đặt chi phí sản phẩm. Vui lòng cài đặt trong phần Settings.');
        return;
      }

      const breakdown = computePriceBreakdown(settings, selectedCostKey, purchase);
      if (!breakdown) {
        alert('Không thể tính giá đề xuất với dữ liệu hiện tại');
        return;
      }

      setPriceBreakdown(breakdown);
      setShowPriceCalculator(true);
    } catch (error) {
      console.error('Failed to calculate suggested price:', error);
      alert('Không thể tính giá đề xuất. Vui lòng thử lại.');
    }
  };

  // Load available product cost rows for select
  // load product cost rows once on mount
  useEffect(() => {
    let mounted = true;
    productCostService
      .getAll()
      .then((res) => {
        if (!mounted) return;
        if (res?.data?.length) {
          setProductCostRows(res.data);
          setSelectedCostKey((prev) => prev ?? res.data[0]?.key ?? null);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
    // run once on mount
  }, []);

  // When productCostRows, selectedCostKey or purchasePrice change, compute inline breakdown
  useEffect(() => {
    if (!productCostRows?.length) {
      setPriceBreakdown(null);
      return;
    }

    const purchase = purchasePrice || 0;
    const breakdown = computePriceBreakdown(productCostRows, selectedCostKey, purchase);
    setPriceBreakdown(breakdown);
  }, [productCostRows, selectedCostKey, purchasePrice]);

  const handleApplySuggestedPrice = () => {
    if (priceBreakdown && priceBreakdown.suggestedPrice > 0) {
      form.setValue('suggested', priceBreakdown.suggestedPrice, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setShowPriceCalculator(false);
      alert(`Đã áp dụng giá đề xuất: ${priceBreakdown.suggestedPrice.toLocaleString('vi-VN')} đ`);
    }
  };

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
                  <label className="block text-sm font-medium mb-1">
                    Giá nhập <span className="text-red-500">*</span>
                  </label>
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
                  {form.formState.errors.purchase_price && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.purchase_price.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="suggested"
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">
                      Giá đề xuất <span className="text-gray-400 text-xs">(Tùy chọn)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCostKey ?? ''}
                        onChange={(e) => setSelectedCostKey(e.target.value)}
                        className="border rounded px-2 py-1 bg-white text-sm"
                      >
                        {productCostRows.length === 0 ? (
                          <option value="">-- Chưa có chi phí --</option>
                        ) : (
                          productCostRows.map((r) => (
                            <option key={r.key} value={r.key}>
                              {r.title ?? r.key}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Inline card showing compact breakdown + actions */}
                  <div className="border rounded p-3 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm text-gray-700">
                        Cấu hình chọn:{' '}
                        <span className="font-medium">
                          {productCostRows.find((r) => r.key === selectedCostKey)?.title ??
                            productCostRows.find((r) => r.key === selectedCostKey)?.key ??
                            '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCalculateSuggestedPrice}
                        >
                          <Calculator className="w-4 h-4" />
                          Chi tiết
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (priceBreakdown && priceBreakdown.suggestedPrice > 0) {
                              form.setValue('suggested', priceBreakdown.suggestedPrice, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              alert(
                                `Đã áp dụng giá đề xuất: ${priceBreakdown.suggestedPrice.toLocaleString('vi-VN')} đ`,
                              );
                            } else {
                              alert(
                                'Không có giá đề xuất để áp dụng. Vui lòng nhập Giá nhập trước.',
                              );
                            }
                          }}
                          disabled={!priceBreakdown || !priceBreakdown.suggestedPrice}
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </div>

                    {priceBreakdown ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Giá nhập:</span>
                          <span className="font-medium text-green-600">
                            {(purchasePrice || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </div>

                        <div className="border-t pt-2">
                          <div className="text-xs text-gray-500 mb-1">Chi phí:</div>
                          {priceBreakdown.costs.slice(0, 3).map((cost, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <div className="text-gray-700">
                                <span className="font-medium">{cost.category}:</span> {cost.label}
                              </div>
                              <div className="text-blue-600">
                                {cost.value.toLocaleString('vi-VN')} đ
                              </div>
                            </div>
                          ))}
                          {priceBreakdown.costs.length > 3 && (
                            <div className="text-xs text-gray-400">
                              ... có {priceBreakdown.costs.length - 3} mục khác
                            </div>
                          )}
                        </div>

                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Tổng chi phí:</span>
                          <span className="text-orange-600">
                            {priceBreakdown.totalCost.toLocaleString('vi-VN')} đ
                          </span>
                        </div>

                        <div className="border-t pt-2 flex justify-between text-lg font-bold">
                          <span>Giá bán đề xuất:</span>
                          <span className="text-primary">
                            {priceBreakdown.suggestedPrice.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Vui lòng nhập Giá nhập và chọn cấu hình để xem dự tính giá.
                      </div>
                    )}
                  </div>

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
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Nhấn &quot;Áp dụng&quot; để lưu giá đề xuất vào trường này
                  </p>
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

      {/* Price Calculator Dialog */}
      <Dialog open={showPriceCalculator} onOpenChange={setShowPriceCalculator}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết giá đề xuất</DialogTitle>
            <DialogDescription>
              Giá được tính theo công thức: (Vốn + Chi phí) / (1 - {priceBreakdown?.profitMargin}%)
              = Giá bán
            </DialogDescription>
          </DialogHeader>

          {priceBreakdown && (
            <div className="space-y-4">
              <div className="border rounded p-4 bg-gray-50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Giá nhập (vốn):</span>
                  <span className="text-green-600 font-semibold">
                    {(purchasePrice || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="border-t pt-2 mt-2">
                  <div className="font-medium text-sm mb-2">Chi phí vận hành:</div>
                  {priceBreakdown.costs.map((cost, idx) => (
                    <div key={idx} className="flex justify-between text-sm pl-4 py-1">
                      <span className="text-gray-700">
                        <span className="font-medium">{cost.category}:</span> {cost.label}{' '}
                        <span className="text-xs text-gray-500">({cost.type})</span>
                      </span>
                      <span className="text-blue-600 font-medium">
                        {cost.value.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  ))}
                  {priceBreakdown.costs.length === 0 && (
                    <div className="text-sm text-gray-400 pl-4 py-1">Không có chi phí nào</div>
                  )}
                </div>

                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                  <span>Tổng chi phí:</span>
                  <span className="text-orange-600">
                    {priceBreakdown.totalCost.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                  <span>Giá bán đề xuất:</span>
                  <span className="text-primary">
                    {priceBreakdown.suggestedPrice.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  * Giá này đảm bảo lợi nhuận {priceBreakdown.profitMargin}%
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPriceCalculator(false)} type="button">
              Đóng
            </Button>
            <Button onClick={handleApplySuggestedPrice} type="button">
              Áp dụng giá này
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
