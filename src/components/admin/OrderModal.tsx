'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DynamicFormField } from '@/components/DynamicFormField';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { OrderFormData } from '@/schemas';
import type { SearchableSelectOption } from '@/components/ui/searchable-select';
import { Trash2, Plus } from 'lucide-react';
import { CalculationCostsInput } from '@/components/admin/CalculationCostsInput';
import { calculationService } from '@/services/calculation.service';
import CalculationUtils from '@/lib/utils/calculation';
import type { Customer, Product, Discount } from '@/types/database';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<OrderFormData>;
  onSubmit: (data: OrderFormData) => Promise<void> | void;
  customers: Customer[];
  products: Product[];
  discounts?: Discount[];
  editingOrder: { id: string } | null;
  loading: boolean;
};

export default function OrderModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  customers,
  products,
  discounts,
  editingOrder,
  loading,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  // remove debug logs

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  // Helper function to calculate total_price for an item
  // total_price = cost_price + all calculation costs
  const calculateItemTotalPrice = (item: OrderFormData['items'][number]) => {
    // Use selling_price (price to customer), fallback to cost_price if not set
    const sellingPrice = Number(item?.selling_price) || Number(item?.cost_price) || 0;
    const advertisingCost = Number(item?.advertising_cost) || 0;
    const packagingCost = Number(item?.packaging_cost) || 0;
    const shippingCost = Number(item?.shipping_cost) || 0;
    const personnelCost = Number(item?.personnel_cost) || 0;
    const rentCost = Number(item?.rent_cost) || 0;
    const freeshipCost = Number(item?.freeship_cost) || 0;

    return (
      sellingPrice +
      advertisingCost +
      packagingCost +
      shippingCost +
      personnelCost +
      rentCost +
      freeshipCost
    );
  };

  // Keep form.total_amount in sync (numeric) whenever items change
  useEffect(() => {
    const total = (watchItems || []).reduce((sum, item) => sum + calculateItemTotalPrice(item), 0);
    setValue('total_amount', total);
  }, [watchItems, setValue]);

  // Derived total for immediate display (calculated from watchItems). Using a local derived
  // value ensures the UI updates immediately when quantity/unit changes without waiting on
  // other RHF subscriptions.
  const computedTotal = (watchItems || []).reduce(
    (sum, item) => sum + calculateItemTotalPrice(item),
    0,
  );

  const formatVND = (value: number | undefined | null) => {
    const v = Number(value) || 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(v);
  };

  const statusLabel = (s: string | undefined | null) => {
    switch (s) {
      case 'in_stock':
        return 'Tồn';
      case 'in_transit':
        return 'Đang vận chuyển';
      case 'sold':
        return 'Đã bán';
      default:
        return '';
    }
  };

  // Prepare customer options for searchable select
  const customerOptions: SearchableSelectOption[] = useMemo(
    () =>
      customers.map((customer) => ({
        value: customer.id,
        label: `${customer.full_name || 'N/A'} ${customer.phone_number ? `- ${customer.phone_number}` : ''}`,
        searchTerms: `${customer.full_name || ''} ${customer.phone_number || ''}`,
      })),
    [customers],
  );

  // Prepare product options for searchable select
  const productOptions: SearchableSelectOption[] = useMemo(
    () =>
      products.map((product) => ({
        value: product.id,
        label: `${product.title} - ${product.id.substring(0, 8)}${product.status ? ` (${statusLabel(product.status)})` : ''}`,
        searchTerms: `${product.title} ${product.id} ${product.description || ''}`,
      })),
    [products],
  );

  // Prepare discount options (for per-item discount selection)
  const discountOptions: SearchableSelectOption[] = useMemo(
    () =>
      (discounts || []).map((d) => {
        const pct =
          typeof d.discount_percent === 'number' && !isNaN(d.discount_percent)
            ? `${d.discount_percent}%`
            : null;
        const amt =
          typeof d.discount_amount === 'number' && !isNaN(d.discount_amount)
            ? formatVND(d.discount_amount)
            : null;
        const suffix = (pct ?? amt) ? ` (${pct ?? amt})` : '';
        return {
          value: d.id,
          label: `${d.code}${d.title ? ` - ${d.title}` : ''}${suffix}`,
          searchTerms: `${d.code} ${d.title || ''}`,
        };
      }),
    [discounts],
  );

  const handleAddProduct = () => {
    append({
      product_id: '',
      discount_id: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      cost_price: 0,
      suggested_price: 0,
      selling_price: 0,
      advertising_cost: 0,
      packaging_cost: 0,
      shipping_cost: 0,
      personnel_cost: 0,
      rent_cost: 0,
      freeship_cost: 0,
    });
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      // Prevent selecting products that are not available in stock
      if (product.status && product.status !== 'in_stock') {
        // Inform user and do not select
        alert(
          `Sản phẩm "${product.title}" hiện không ở trạng thái 'Còn hàng' (hiện: ${statusLabel(
            product.status,
          )}). Vui lòng cập nhật trạng thái sản phẩm trước khi thêm vào đơn.`,
        );
        return;
      }
      setValue(`items.${index}.product_id`, productId);

      // Set price fields from product
      const costPrice = product.purchase_price || 0;
      const suggestedPrice = product.suggested || 0;

      // Set cost_price and suggested_price from product
      setValue(`items.${index}.cost_price`, costPrice);
      setValue(`items.${index}.suggested_price`, suggestedPrice);
      // Initialize selling_price with suggested_price (can be edited by user)
      setValue(`items.${index}.selling_price`, suggestedPrice);

      // Keep unit_price as the product's suggested price
      setValue(`items.${index}.unit_price`, suggestedPrice);

      // Calculate total_price = cost_price + all calculation costs
      const currentItem = watchItems?.[index];
      const totalPrice = calculateItemTotalPrice({
        ...currentItem,
        cost_price: costPrice,
      });
      setValue(`items.${index}.total_price`, Math.round(totalPrice));
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const qty = Number(quantity) || 0;
    const productId = watchItems?.[index]?.product_id;
    const product = products.find((p) => p.id === productId);

    // If product exists but doesn't have stock tracking (no stock count field),
    // enforce qty <= 1 to avoid selecting more than available for single-item products.
    if (product) {
      // If product is not in_stock, prevent changing quantity
      if (product.status && product.status !== 'in_stock') {
        alert(
          `Sản phẩm "${product.title}" không có sẵn (trạng thái: ${statusLabel(
            product.status,
          )}). Vui lòng chọn sản phẩm khác hoặc cập nhật trạng thái.`,
        );
        // reset to 1
        setValue(`items.${index}.quantity`, 1, { shouldValidate: true, shouldDirty: true });
        return;
      }

      // If product has no explicit stock count field, prevent qty > 1 to avoid overselling
      // (Repository currently doesn't track stock counts per product). If you track stock
      // with a `stock` field in the future, replace this check with stock-based validation.
      // For now, enforce max 1 per product to keep data consistent.
      // If user really needs multiples, they should create multiple product records or add stock field.
      // Only enforce when qty > 1
      // (You can relax this if your product model has stock counts.)
      const hasStockCount = typeof (product as unknown as { stock?: number }).stock === 'number';
      if (!hasStockCount && qty > 1) {
        alert(
          `Sản phẩm "${product.title}" hiện không có thông tin số lượng trong kho, nên không thể đặt số lượng > 1. Vui lòng cập nhật kho hàng hoặc thêm nhiều bản ghi sản phẩm.`,
        );
        setValue(`items.${index}.quantity`, 1, { shouldValidate: true, shouldDirty: true });
        // also recalc totals with qty = 1
        handleQuantityChange(index, 1);
        return;
      }
    }

    setValue(`items.${index}.quantity`, qty, { shouldValidate: true, shouldDirty: true });

    // Recalculate total_price based on cost_price + calculation costs
    // (quantity doesn't affect total_price in new logic)
    const currentItem = watchItems?.[index];
    const totalPrice = calculateItemTotalPrice(currentItem);
    setValue(`items.${index}.total_price`, Math.round(totalPrice), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // When a discount is selected for an item, save it (for reference only)
  // Discount no longer affects total_price calculation
  const handleDiscountChange = (index: number, discountId: string) => {
    setValue(`items.${index}.discount_id`, discountId);

    // Recalculate total_price based on cost_price + calculation costs
    const currentItem = watchItems?.[index];
    const totalPrice = calculateItemTotalPrice(currentItem);
    setValue(`items.${index}.total_price`, Math.round(totalPrice), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Load calculation settings once so CalculationCostsInput can use them
  const [calculationData, setCalculationData] = React.useState<Record<string, unknown> | null>(
    null,
  );
  useEffect(() => {
    let mounted = true;
    calculationService
      .getAll()
      .then((res) => {
        if (!mounted) return;
        const rows = (res?.data as Record<string, unknown>[]) || [];
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
        setCalculationData(normalized);
      })
      .catch(() => {})
      .finally(() => {
        // no-op
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Handler to update total_price before submitting
  const handleFormSubmit = (data: OrderFormData) => {
    // Update each item's total_price before submission
    const updatedData = {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        total_price: Math.round(calculateItemTotalPrice(item)),
      })),
    };
    return onSubmit(updatedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* wider modal: responsive widths (90vw small, 900px md, 1100px lg) */}
      <DialogContent className="max-h-[90vh] w-[90vw] md:w-[900px] lg:w-[1100px] max-w-none">
        <DialogHeader className="px-3">
          <DialogTitle>{editingOrder ? 'Sửa Đơn hàng' : 'Thêm Đơn hàng'}</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Scroll the form body internally to keep footer visible */}
            <div className="h-[70vh]">
              <ScrollArea className="h-full">
                <div className="px-3">
                  <div>
                    <DynamicFormField
                      control={control}
                      name="customer_id"
                      label="Khách hàng *"
                      type="select"
                      widget="searchable"
                      options={customerOptions}
                      className="w-full"
                      placeholder="Tìm theo tên hoặc SĐT khách hàng..."
                      searchPlaceholder="Tìm kiếm khách hàng..."
                      emptyMessage="Không tìm thấy khách hàng"
                    />
                    {errors.customer_id && (
                      <span className="text-red-500 text-sm">{errors.customer_id.message}</span>
                    )}
                  </div>

                  <div className="mt-5">
                    <DynamicFormField
                      control={control}
                      name="address"
                      label="Địa chỉ *"
                      type="input"
                      placeholder=""
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="mt-5">
                    <DynamicFormField
                      control={control}
                      name="shipping_code"
                      label="Mã vận chuyển"
                      type="input"
                      placeholder=""
                      className="w-full"
                    />
                  </div>

                  {/* Per-item discounts are selected on each product row */}

                  <div className="mt-5">
                    <label className="block text-sm font-medium mb-2">Trạng thái</label>
                    {editingOrder ? (
                      <DynamicFormField
                        control={control}
                        name="status"
                        label=""
                        type="select"
                        options={[
                          { value: 'in_stock', label: 'Tồn' },
                          { value: 'in_transit', label: 'Đang vận chuyển' },
                          { value: 'sold', label: 'Đã bán' },
                        ]}
                        className="w-full"
                      />
                    ) : (
                      <DynamicFormField
                        control={control}
                        name="status"
                        label=""
                        type="select"
                        options={[
                          { value: 'in_stock', label: 'Tồn' },
                          { value: 'in_transit', label: 'Đang vận chuyển' },
                          { value: 'sold', label: 'Đã bán' },
                        ]}
                        className="w-full"
                        disabled
                      />
                    )}
                  </div>

                  <div className="mt-5">
                    <DynamicFormField
                      control={control}
                      name="order_date"
                      label="Ngày đặt hàng"
                      type="input"
                      inputType="date"
                      className="w-full"
                    />
                  </div>

                  {/* Order Items Section */}
                  <div className="space-y-2 mt-5">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium">Sản phẩm *</label>
                      <Button type="button" onClick={handleAddProduct} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Thêm sản phẩm
                      </Button>
                    </div>

                    {errors.items && (
                      <span className="text-red-500 text-sm">{errors.items.message}</span>
                    )}

                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-3 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="md:col-span-2">
                                <DynamicFormField
                                  control={control}
                                  name={`items.${index}.product_id`}
                                  label="Sản phẩm"
                                  type="select"
                                  widget="searchable"
                                  options={productOptions}
                                  className="w-full"
                                  searchPlaceholder="Tìm kiếm sản phẩm..."
                                  emptyMessage="Không tìm thấy sản phẩm"
                                  onValueChange={(v) => handleProductChange(index, String(v))}
                                />
                              </div>

                              <div>
                                <DynamicFormField
                                  control={control}
                                  name={`items.${index}.discount_id`}
                                  label="Mã giảm giá"
                                  type="select"
                                  widget="searchable"
                                  options={discountOptions}
                                  className="w-full"
                                  searchPlaceholder="Tìm kiếm mã giảm giá..."
                                  emptyMessage="Không tìm thấy mã giảm giá"
                                  onValueChange={(v) => handleDiscountChange(index, String(v))}
                                />
                                {/** show the selected discount's percent or amount next to the select */}
                                {watchItems?.[index]?.discount_id
                                  ? (() => {
                                      const sel = discounts?.find(
                                        (d) => d.id === watchItems?.[index]?.discount_id,
                                      );
                                      if (!sel) return null;
                                      if (
                                        typeof sel.discount_percent === 'number' &&
                                        !isNaN(sel.discount_percent)
                                      ) {
                                        return (
                                          <div className="text-sm text-muted-foreground mt-1">
                                            Giảm: {sel.discount_percent}%
                                          </div>
                                        );
                                      }
                                      if (
                                        typeof sel.discount_amount === 'number' &&
                                        !isNaN(sel.discount_amount)
                                      ) {
                                        return (
                                          <div className="text-sm text-muted-foreground mt-1">
                                            Giảm: {formatVND(sel.discount_amount)}
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()
                                  : null}
                              </div>

                              {/* Price fields - use nested grid to keep columns even */}
                              <div className="md:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <DynamicFormField
                                      control={control}
                                      name={`items.${index}.cost_price`}
                                      label="Đơn giá"
                                      type="input"
                                      inputType="text"
                                      className="w-full"
                                      disabled
                                      displayFormatter={(v) => formatVND(Number(v))}
                                    />
                                  </div>

                                  <div>
                                    <DynamicFormField
                                      control={control}
                                      name={`items.${index}.suggested_price`}
                                      label="Giá đề xuất"
                                      type="input"
                                      inputType="text"
                                      className="w-full"
                                      disabled
                                      displayFormatter={(v) => formatVND(Number(v))}
                                    />
                                  </div>

                                  <div>
                                    <DynamicFormField
                                      control={control}
                                      name={`items.${index}.selling_price`}
                                      label="Giá bán khách"
                                      type="input"
                                      inputType="number"
                                      className="w-full"
                                      numericFormat
                                      numericFormatOptions={{
                                        thousandSeparator: '.',
                                        decimalSeparator: ',',
                                        allowNegative: false,
                                        suffix: ' ₫',
                                      }}
                                      onValueChange={(v) => {
                                        const price = Number(v) || 0;
                                        // Update dependent fields same as previous handler
                                        setValue(`items.${index}.unit_price`, price);
                                        const currentItem = watchItems?.[index];
                                        const totalPrice = calculateItemTotalPrice({
                                          ...currentItem,
                                          selling_price: price,
                                        });
                                        setValue(
                                          `items.${index}.total_price`,
                                          Math.round(totalPrice),
                                        );
                                      }}
                                    />
                                  </div>

                                  <div>
                                    <DynamicFormField
                                      control={control}
                                      name={`items.${index}.quantity`}
                                      label="Số lượng"
                                      type="input"
                                      inputType="number"
                                      className="w-full"
                                      onValueChange={(v) => {
                                        const qty = Number(v) || 0;
                                        handleQuantityChange(index, qty);
                                      }}
                                    />
                                  </div>

                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">
                                      Thành tiền
                                    </label>
                                    {/* numeric total for submission */}
                                    <input
                                      type="hidden"
                                      {...register(`items.${index}.total_price`, {
                                        valueAsNumber: true,
                                      })}
                                    />
                                    <DynamicFormField
                                      control={control}
                                      name={`items.${index}.total_price`}
                                      label=""
                                      type="input"
                                      inputType="text"
                                      className="w-full"
                                      disabled
                                      // prefer an explicit displayValue so the UI always shows the freshly
                                      // computed total based on selling_price + costs (no lag)
                                      displayValue={formatVND(
                                        calculateItemTotalPrice(watchItems?.[index] || {}),
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Hidden fields for calculation costs */}
                              <input
                                type="hidden"
                                {...register(`items.${index}.advertising_cost`, {
                                  valueAsNumber: true,
                                })}
                              />
                              <input
                                type="hidden"
                                {...register(`items.${index}.packaging_cost`, {
                                  valueAsNumber: true,
                                })}
                              />
                              <input
                                type="hidden"
                                {...register(`items.${index}.shipping_cost`, {
                                  valueAsNumber: true,
                                })}
                              />
                              <input
                                type="hidden"
                                {...register(`items.${index}.personnel_cost`, {
                                  valueAsNumber: true,
                                })}
                              />
                              <input
                                type="hidden"
                                {...register(`items.${index}.rent_cost`, { valueAsNumber: true })}
                              />
                              <input
                                type="hidden"
                                {...register(`items.${index}.freeship_cost`, {
                                  valueAsNumber: true,
                                })}
                              />

                              {/* Calculation costs input */}
                              <div className="md:col-span-2">
                                <CalculationCostsInput
                                  values={{
                                    advertising_cost: watchItems?.[index]?.advertising_cost || 0,
                                    packaging_cost: watchItems?.[index]?.packaging_cost || 0,
                                    shipping_cost: watchItems?.[index]?.shipping_cost || 0,
                                    personnel_cost: watchItems?.[index]?.personnel_cost || 0,
                                    rent_cost: watchItems?.[index]?.rent_cost || 0,
                                    freeship_cost: watchItems?.[index]?.freeship_cost || 0,
                                  }}
                                  onChange={(costs) => {
                                    setValue(
                                      `items.${index}.advertising_cost`,
                                      costs.advertising_cost,
                                    );
                                    setValue(`items.${index}.packaging_cost`, costs.packaging_cost);
                                    setValue(`items.${index}.shipping_cost`, costs.shipping_cost);
                                    setValue(`items.${index}.personnel_cost`, costs.personnel_cost);
                                    setValue(`items.${index}.rent_cost`, costs.rent_cost);
                                    setValue(`items.${index}.freeship_cost`, costs.freeship_cost);

                                    // Recalculate total_price = cost_price + all calculation costs
                                    const currentItem = watchItems?.[index];
                                    const totalPrice = calculateItemTotalPrice({
                                      ...currentItem,
                                      ...costs,
                                    });
                                    setValue(`items.${index}.total_price`, Math.round(totalPrice));
                                  }}
                                  productPrice={
                                    (watchItems?.[index]?.unit_price || 0) *
                                    (watchItems?.[index]?.quantity || 1)
                                  }
                                  initialCalculationData={calculationData}
                                />
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                remove(index);
                              }}
                              className="ml-2 text-red-500 hover:text-red-700 self-start mt-1"
                              aria-label={`Xóa sản phẩm ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="block text-sm font-medium mb-2">Tổng tiền</label>
                    {/* keep numeric total registered as hidden input for submission */}
                    <input type="hidden" {...register('total_amount', { valueAsNumber: true })} />
                    <DynamicFormField
                      control={control}
                      name="total_amount"
                      label=""
                      type="input"
                      inputType="text"
                      className="w-full"
                      disabled
                      // displayValue ensures the UI shows the freshly computed total (no lag)
                      displayValue={formatVND(computedTotal)}
                    />
                  </div>
                </div>
              </ScrollArea>
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
