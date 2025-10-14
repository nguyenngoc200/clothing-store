'use client';

import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { productService } from '@/services/products.service';
import type { Product } from '@/types/database';
import { Label } from '@/components/ui/label';
import { LoadingDots } from '@/components/LoadingDots';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductsSectionProps {
  index: number;
}

export function ProductsSection({ index }: ProductsSectionProps) {
  const { control, setValue } = useFormContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Watch the current selected product IDs
  const watchedData = useWatch({
    control,
    name: `sections.${index}.data`,
    defaultValue: [],
  });

  // Ensure selectedIds is always an array
  const selectedIds: string[] = Array.isArray(watchedData) ? watchedData : [];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAll();
        setProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSelectProduct = (productId: string) => {
    if (productId && !selectedIds.includes(productId)) {
      const newIds = [...selectedIds, productId];
      setValue(`sections.${index}.data`, newIds, { shouldDirty: true });
    }
  };

  const removeProduct = (productId: string) => {
    const newIds = selectedIds.filter((id) => id !== productId);
    setValue(`sections.${index}.data`, newIds, { shouldDirty: true });
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:col-span-2">
      <div className="mb-3">
        <Label className="text-sm font-semibold mb-2 block">Chọn Sản phẩm nổi bật</Label>
        <p className="text-xs text-neutral-500 mb-3">
          Chọn các sản phẩm từ dropdown để thêm vào danh sách nổi bật.
        </p>

        <Select onValueChange={handleSelectProduct} value="">
          <SelectTrigger className="w-full" disabled={products.length === 0}>
            <SelectValue placeholder="-- Chọn sản phẩm để thêm --" />
          </SelectTrigger>
          <SelectContent>
            {products
              .filter((product) => !selectedIds.includes(product.id))
              .map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.title}
                  {product.suggested ? ` - ${product.suggested.toLocaleString('vi-VN')}₫` : ''}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {products.length === 0 && (
        <p className="text-sm text-neutral-500 italic">Không có sản phẩm nào trong database.</p>
      )}

      {/* Selected Products List */}
      {selectedIds.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Đã chọn ({selectedIds.length} sản phẩm)</Label>
          <div className="space-y-2">
            {selectedIds.map((productId) => {
              const product = getProductById(productId);
              if (!product) return null;

              return (
                <div
                  key={productId}
                  className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{product.title}</p>
                    {product.suggested && (
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {product.suggested.toLocaleString('vi-VN')}₫
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProduct(productId)}
                    className="ml-2"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedIds.length === 0 && products.length > 0 && (
        <p className="text-sm text-neutral-400 italic">
          Chưa có sản phẩm nào được chọn. Sử dụng dropdown bên trên để thêm.
        </p>
      )}
    </div>
  );
}
