import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SelectTrigger, SelectValue } from '@/components/ui/select';
import { DynamicFormField } from '@/components/DynamicFormField';
import type { CostItem, CalculationData, CalculationCostsInputProps } from '@/types/calculation';
import { calculationService } from '@/services/calculation.service';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function CalculationCostsInput({
  values,
  onChange,
  initialCalculationData,
}: CalculationCostsInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [calculationData, setCalculationData] = useState<CalculationData | null>(
    initialCalculationData ?? null,
  );
  const [loading, setLoading] = useState(false);

  // Local state for editing
  const [costs, setCosts] = useState({
    advertising_cost: values.advertising_cost || 0,
    packaging_cost: values.packaging_cost || 0,
    shipping_cost: values.shipping_cost || 0,
    personnel_cost: values.personnel_cost || 0,
    rent_cost: values.rent_cost || 0,
    freeship_cost: values.freeship_cost || 0,
  });

  // Track selected index for each category
  const [selectedIndices, setSelectedIndices] = useState({
    advertising: '',
    packaging: '',
    shipping: '',
    personnel: '',
    rent: '',
    freeship: '',
  });

  useEffect(() => {
    setCosts({
      advertising_cost: values.advertising_cost || 0,
      packaging_cost: values.packaging_cost || 0,
      shipping_cost: values.shipping_cost || 0,
      personnel_cost: values.personnel_cost || 0,
      rent_cost: values.rent_cost || 0,
      freeship_cost: values.freeship_cost || 0,
    });
  }, [values]);

  // Load calculation settings when dialog opens
  useEffect(() => {
    // If the caller provided initialCalculationData, use it and skip fetching.
    if (initialCalculationData) return;

    if (isOpen && !calculationData) {
      setLoading(true);
      calculationService
        .getAll()
        .then((res) => {
          if (res?.data?.length) {
            const data = (res.data[0] as unknown as { data?: unknown })?.data as CalculationData;
            setCalculationData(data);
          }
        })
        .catch((err) => {
          console.error('Failed to load calculation settings', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, calculationData, initialCalculationData]);

  const handleSave = () => {
    onChange(costs);
    setIsOpen(false);
  };

  const handleSelectCost = (
    category: keyof CalculationData,
    costKey: keyof typeof costs,
    itemIndex: string,
  ) => {
    if (!calculationData || !calculationData[category]) return;

    const items = calculationData[category];
    if (!items || items.length === 0) return;

    // If the clear sentinel is chosen, clear this category
    if (itemIndex === '__clear') {
      setSelectedIndices((prev) => ({ ...prev, [category]: '' }));
      setCosts((prev) => ({ ...prev, [costKey]: 0 }));
      return;
    }

    const selectedItem = items[Number(itemIndex)];
    if (!selectedItem) return;

    let calculatedCost = 0;
    // prefer amount; if a legacy percent field exists we cannot safely
    // convert it here without a product price, so ignore percent-based
    // entries when amount is missing.
    if (selectedItem.amount) {
      calculatedCost = selectedItem.amount;
    }

    // Update selected index
    setSelectedIndices((prev) => ({ ...prev, [category]: itemIndex }));
    // Update cost value
    setCosts((prev) => ({ ...prev, [costKey]: Math.round(calculatedCost) }));
  };

  const formatCostItemLabel = (item: CostItem) => `${item.label} - ${formatVND(item.amount || 0)}`;

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalCosts =
    costs.advertising_cost +
    costs.packaging_cost +
    costs.shipping_cost +
    costs.personnel_cost +
    costs.rent_cost +
    costs.freeship_cost;

  const hasAnyCosts = totalCosts > 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full justify-between"
      >
        <span className="text-sm">
          {hasAnyCosts ? `Chi phí tính toán: ${formatVND(totalCosts)}` : 'Thêm chi phí tính toán'}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi phí tính toán cho sản phẩm</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Quảng cáo</label>
                  {calculationData?.advertising && calculationData.advertising.length > 0 ? (
                    <DynamicFormField<Record<string, unknown>>
                      type="select"
                      name="advertising"
                      label=""
                      className="w-full"
                      placeholder="Chọn mức chi phí"
                      value={selectedIndices.advertising}
                      onChange={(v) =>
                        handleSelectCost('advertising', 'advertising_cost', String(v))
                      }
                      options={[
                        { value: '__clear', label: 'Bỏ chọn' },
                        ...calculationData.advertising.map((item, idx) => ({
                          value: idx.toString(),
                          label: formatCostItemLabel(item),
                        })),
                      ]}
                    />
                  ) : (
                    <SelectTrigger className="w-full">
                      <SelectValue>Không có dữ liệu</SelectValue>
                    </SelectTrigger>
                  )}
                  {costs.advertising_cost > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Đã chọn: {formatVND(costs.advertising_cost)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Đóng gói</label>
                  {calculationData?.packaging && calculationData.packaging.length > 0 ? (
                    <DynamicFormField<Record<string, unknown>>
                      type="select"
                      name="packaging"
                      label=""
                      className="w-full"
                      placeholder="Chọn mức chi phí"
                      value={selectedIndices.packaging}
                      onChange={(v) => handleSelectCost('packaging', 'packaging_cost', String(v))}
                      options={[
                        { value: '__clear', label: 'Bỏ chọn' },
                        ...calculationData.packaging.map((item, idx) => ({
                          value: idx.toString(),
                          label: formatCostItemLabel(item),
                        })),
                      ]}
                    />
                  ) : (
                    <SelectTrigger className="w-full">
                      <SelectValue>Không có dữ liệu</SelectValue>
                    </SelectTrigger>
                  )}
                  {costs.packaging_cost > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Đã chọn: {formatVND(costs.packaging_cost)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Vận chuyển</label>
                  {calculationData?.shipping && calculationData.shipping.length > 0 ? (
                    <DynamicFormField<Record<string, unknown>>
                      type="select"
                      name="shipping"
                      label=""
                      className="w-full"
                      placeholder="Chọn mức chi phí"
                      value={selectedIndices.shipping}
                      onChange={(v) => handleSelectCost('shipping', 'shipping_cost', String(v))}
                      options={[
                        { value: '__clear', label: 'Bỏ chọn' },
                        ...calculationData.shipping.map((item, idx) => ({
                          value: idx.toString(),
                          label: formatCostItemLabel(item),
                        })),
                      ]}
                    />
                  ) : (
                    <SelectTrigger className="w-full">
                      <SelectValue>Không có dữ liệu</SelectValue>
                    </SelectTrigger>
                  )}
                  {costs.shipping_cost > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Đã chọn: {formatVND(costs.shipping_cost)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Nhân sự</label>
                  {calculationData?.personnel && calculationData.personnel.length > 0 ? (
                    <DynamicFormField<Record<string, unknown>>
                      type="select"
                      name="personnel"
                      label=""
                      className="w-full"
                      placeholder="Chọn mức chi phí"
                      value={selectedIndices.personnel}
                      onChange={(v) => handleSelectCost('personnel', 'personnel_cost', String(v))}
                      options={[
                        { value: '__clear', label: 'Bỏ chọn' },
                        ...calculationData.personnel.map((item, idx) => ({
                          value: idx.toString(),
                          label: formatCostItemLabel(item),
                        })),
                      ]}
                    />
                  ) : (
                    <SelectTrigger className="w-full">
                      <SelectValue>Không có dữ liệu</SelectValue>
                    </SelectTrigger>
                  )}
                  {costs.personnel_cost > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Đã chọn: {formatVND(costs.personnel_cost)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Mặt bằng</label>
                  {calculationData?.rent && calculationData.rent.length > 0 ? (
                    <DynamicFormField<Record<string, unknown>>
                      type="select"
                      name="rent"
                      label=""
                      className="w-full"
                      placeholder="Chọn mức chi phí"
                      value={selectedIndices.rent}
                      onChange={(v) => handleSelectCost('rent', 'rent_cost', String(v))}
                      options={[
                        { value: '__clear', label: 'Bỏ chọn' },
                        ...calculationData.rent.map((item, idx) => ({
                          value: idx.toString(),
                          label: formatCostItemLabel(item),
                        })),
                      ]}
                    />
                  ) : (
                    <SelectTrigger className="w-full">
                      <SelectValue>Không có dữ liệu</SelectValue>
                    </SelectTrigger>
                  )}
                  {costs.rent_cost > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Đã chọn: {formatVND(costs.rent_cost)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Freeship</label>
                  {calculationData?.freeship && calculationData.freeship.length > 0 ? (
                    <DynamicFormField<Record<string, unknown>>
                      type="select"
                      name="freeship"
                      label=""
                      className="w-full"
                      placeholder="Chọn mức chi phí"
                      value={selectedIndices.freeship}
                      onChange={(v) => handleSelectCost('freeship', 'freeship_cost', String(v))}
                      options={[
                        { value: '__clear', label: 'Bỏ chọn' },
                        ...calculationData.freeship.map((item, idx) => ({
                          value: idx.toString(),
                          label: formatCostItemLabel(item),
                        })),
                      ]}
                    />
                  ) : (
                    <SelectTrigger className="w-full">
                      <SelectValue>Không có dữ liệu</SelectValue>
                    </SelectTrigger>
                  )}
                  {costs.freeship_cost > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Đã chọn: {formatVND(costs.freeship_cost)}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Tổng chi phí:</span>
                  <span>{formatVND(totalCosts)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Clear all selections and costs
                    setSelectedIndices({
                      advertising: '',
                      packaging: '',
                      shipping: '',
                      personnel: '',
                      rent: '',
                      freeship: '',
                    });
                    const zeroed = {
                      advertising_cost: 0,
                      packaging_cost: 0,
                      shipping_cost: 0,
                      personnel_cost: 0,
                      rent_cost: 0,
                      freeship_cost: 0,
                    };
                    setCosts(zeroed);
                    // Inform parent of cleared costs immediately
                    onChange(zeroed);
                  }}
                >
                  Bỏ hết
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={handleSave}>
                  Lưu
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
