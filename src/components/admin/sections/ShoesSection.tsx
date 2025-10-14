'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';

interface ShoesSectionProps {
  index: number;
}

export function ShoesSection({ index }: ShoesSectionProps) {
  const { setValue } = useFormContext();
  const { products, loading } = useProducts();

  const watchedData = useWatch({ name: `sections.${index}.data` });
  const selectedIds: string[] = Array.isArray(watchedData) ? watchedData : [];

  const handleSelectProduct = (productId: string) => {
    if (!selectedIds.includes(productId)) {
      setValue(`sections.${index}.data`, [...selectedIds, productId], { shouldDirty: true });
    }
  };

  const removeProduct = (productId: string) => {
    const filtered = selectedIds.filter((id) => id !== productId);
    setValue(`sections.${index}.data`, filtered, { shouldDirty: true });
  };

  const availableProducts = products.filter((p) => !selectedIds.includes(p.id));
  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

  return (
    <div className="space-y-4 md:col-span-2">
      <div>
        <Label>Chọn sản phẩm Styling</Label>
        <Select onValueChange={handleSelectProduct} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder={loading ? 'Đang tải...' : 'Chọn sản phẩm'} />
          </SelectTrigger>
          <SelectContent>
            {availableProducts.length > 0 ? (
              availableProducts.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.title}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-neutral-500">
                {loading ? 'Đang tải...' : 'Không có sản phẩm'}
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedProducts.length > 0 && (
        <div>
          <Label>Đã chọn ({selectedProducts.length})</Label>
          <div className="space-y-2 mt-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2 bg-neutral-50 rounded border"
              >
                <span className="text-sm">{product.title}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProduct(product.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
