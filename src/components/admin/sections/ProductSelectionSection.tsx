'use client';

import { Plus, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/use-categories';
import { useProducts } from '@/hooks/use-products';
import type { Product } from '@/types/database';

interface ProductSelectionSectionProps {
  index: number;
  label?: string;
}

export function ProductSelectionSection({
  index,
  label = 'Sản phẩm',
}: ProductSelectionSectionProps) {
  const { setValue, watch } = useFormContext();
  const { products, loading: productsLoading } = useProducts();
  const { categories } = useCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const watchedData = watch(`sections.${index}.data`);
  const selectedIds: string[] = useMemo(() => {
    const data = watchedData as string[];
    return Array.isArray(data) ? data : [];
  }, [watchedData]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by category
      if (selectedCategoryId !== 'all' && product.category_id !== selectedCategoryId) {
        return false;
      }

      // Filter by search query (name or description)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = product.title?.toLowerCase().includes(query);
        const matchDesc = product.description?.toLowerCase().includes(query);
        return matchName || matchDesc;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategoryId]);

  // Get available products (not yet selected)
  const availableProducts = useMemo(() => {
    return filteredProducts.filter((p) => !selectedIds.includes(p.id));
  }, [filteredProducts, selectedIds]);

  // Get selected products with full data
  const selectedProducts = useMemo(() => {
    return selectedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);
  }, [selectedIds, products]);

  const handleAddProduct = () => {
    if (!selectedProductId || selectedIds.includes(selectedProductId)) return;

    const newIds = [...selectedIds, selectedProductId];
    setValue(`sections.${index}.data`, newIds, { shouldDirty: true });
    setSelectedProductId('');
  };

  const handleRemoveProduct = (productId: string) => {
    const newIds = selectedIds.filter((id) => id !== productId);
    setValue(`sections.${index}.data`, newIds, { shouldDirty: true });
  };

  const handleMoveUp = (productIndex: number) => {
    if (productIndex === 0) return;
    const newIds = [...selectedIds];
    [newIds[productIndex - 1], newIds[productIndex]] = [
      newIds[productIndex],
      newIds[productIndex - 1],
    ];
    setValue(`sections.${index}.data`, newIds, { shouldDirty: true });
  };

  const handleMoveDown = (productIndex: number) => {
    if (productIndex === selectedIds.length - 1) return;
    const newIds = [...selectedIds];
    [newIds[productIndex], newIds[productIndex + 1]] = [
      newIds[productIndex + 1],
      newIds[productIndex],
    ];
    setValue(`sections.${index}.data`, newIds, { shouldDirty: true });
  };

  return (
    <div className="space-y-4 md:col-span-2">
      <Label className="text-base font-semibold">{label}</Label>

      {/* Filter and Search Section */}
      <div className="space-y-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Category Filter */}
          <div>
            <Label className="text-sm mb-2 block">Lọc theo danh mục</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div>
            <Label className="text-sm mb-2 block">Tìm kiếm sản phẩm</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Tìm theo tên hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="block sm:flex gap-2">
          <Select
            value={selectedProductId}
            onValueChange={setSelectedProductId}
            disabled={productsLoading}
          >
            <SelectTrigger className="flex-1 w-full sm:w-auto">
              <SelectValue placeholder={productsLoading ? 'Đang tải...' : 'Chọn sản phẩm...'} />
            </SelectTrigger>
            <SelectContent>
              {productsLoading ? (
                <div className="px-2 py-6 text-center text-sm text-neutral-500">
                  Đang tải sản phẩm...
                </div>
              ) : availableProducts.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-neutral-500">
                  {searchQuery || selectedCategoryId !== 'all'
                    ? 'Không tìm thấy sản phẩm phù hợp'
                    : 'Đã chọn hết sản phẩm'}
                </div>
              ) : (
                availableProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.title}</span>
                      {product.size && (
                        <span className="text-xs text-neutral-500">({product.size})</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={handleAddProduct}
            disabled={!selectedProductId}
            size="sm"
            className="mt-3 sm:mt-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm
          </Button>
        </div>

        <div className="text-xs text-neutral-500">
          Đã chọn: {selectedProducts.length} sản phẩm
          {searchQuery || selectedCategoryId !== 'all'
            ? ` • Hiển thị: ${availableProducts.length} sản phẩm khả dụng`
            : ''}
        </div>
      </div>

      {/* Selected Products List */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sản phẩm đã chọn</Label>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {selectedProducts.map((product, idx) => (
              <div
                key={product.id}
                className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
              >
                {/* Mobile: Delete button at top right */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveProduct(product.id)}
                  className="absolute top-2 right-2 sm:hidden h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Xóa"
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Product Image & Info Container */}
                <div className="flex items-start gap-3 flex-1 w-full sm:w-auto pr-8 sm:pr-0">
                  {/* Product Image */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden flex-shrink-0 bg-neutral-100">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate pr-2">{product.title}</div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-xs text-neutral-600">
                      {product.purchase_price && (
                        <span className="font-semibold text-primary-600">
                          ₫{product.purchase_price.toLocaleString('vi-VN')}
                        </span>
                      )}
                      {product.size && (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-neutral-100 rounded text-[10px] sm:text-xs">
                          Size: {product.size}
                        </span>
                      )}
                      {product.color && (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-neutral-100 rounded text-[10px] sm:text-xs">
                          {product.color}
                        </span>
                      )}
                      {product.width && product.height && (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-neutral-100 rounded text-[10px] sm:text-xs">
                          {product.width} × {product.height} cm
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <div className="text-xs text-neutral-500 mt-1 truncate">
                        {product.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-1 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                  {/* Mobile: Horizontal layout with labels */}
                  <div className="flex sm:hidden items-center gap-2 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="flex-1 h-8 text-xs"
                      title="Di chuyển lên"
                    >
                      ↑ Lên
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === selectedProducts.length - 1}
                      className="flex-1 h-8 text-xs"
                      title="Di chuyển xuống"
                    >
                      ↓ Xuống
                    </Button>
                  </div>

                  {/* Desktop: Icon only buttons */}
                  <div className="hidden sm:flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="h-8 w-8 p-0"
                      title="Di chuyển lên"
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === selectedProducts.length - 1}
                      className="h-8 w-8 p-0"
                      title="Di chuyển xuống"
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(product.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Xóa"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedProducts.length === 0 && (
        <div className="text-center py-8 text-sm text-neutral-500 border-2 border-dashed border-neutral-200 rounded-lg">
          Chưa có sản phẩm nào được chọn
        </div>
      )}
    </div>
  );
}
