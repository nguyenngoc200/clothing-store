'use client';

import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import Loading from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error-message';
import { DataTable, type Column } from '@/components/ui/table';
import { useState, useMemo } from 'react';
import ProductModal from '@/components/admin/ProductModal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '@/schemas';
import type { Product } from '@/types/database';
import { usePagination } from '@/hooks/use-pagination';
import Image from 'next/image';

export default function ProductsPage() {
  const { products, loading, error } = useProducts();
  const { categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ value: cat.id, label: cat.title })),
    [categories],
  );

  const emptyDefaults: ProductFormData = {
    title: '',
    description: '',
    image: '',
    purchase_price: 0,
    suggested: 0,
    size: '',
    width: 0,
    height: 0,
    color: '',
    category_id: undefined,
    discount_id: undefined,
  };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyDefaults,
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Transform empty strings to undefined for UUID fields
      const payload = {
        ...data,
        category_id: data.category_id || undefined,
        discount_id: data.discount_id || undefined,
      };

      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      title: product.title || '',
      description: product.description || '',
      image: product.image || '',
      purchase_price: product.purchase_price || 0,
      suggested: product.suggested || 0,
      size: product.size || '',
      width: product.width || 0,
      height: product.height || 0,
      color: product.color || '',
      category_id: product.category_id || '',
      discount_id: product.discount_id || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này không?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    form.reset({
      title: '',
      description: '',
      image: '',
      purchase_price: 0,
      suggested: 0,
      size: '',
      width: 0,
      height: 0,
      color: '',
      category_id: undefined,
      discount_id: undefined,
    });
  };

  const pagination = usePagination({
    totalItems: products.length,
    initialPageSize: 10,
  });

  const paginatedProducts = useMemo(() => {
    return products.slice(pagination.startIndex, pagination.endIndex);
  }, [products, pagination.startIndex, pagination.endIndex]);

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'in_stock':
        return 'Còn hàng';
      case 'in_transit':
        return 'Đang vận chuyển';
      case 'sold':
        return 'Đã bán';
      default:
        return '-';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'image',
      label: 'Ảnh',
      render: (product) =>
        product.image ? (
          <div className="relative w-12 h-12 rounded overflow-hidden">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded bg-neutral-200 flex items-center justify-center text-neutral-400 text-xs">
            No img
          </div>
        ),
    },
    {
      key: 'title',
      label: 'Tên sản phẩm',
      render: (product) => <span className="font-medium">{product.title}</span>,
      className: 'whitespace-nowrap',
    },
    {
      key: 'purchase_price',
      label: 'Giá nhập',
      render: (product) => {
        const val = Number(product.purchase_price ?? 0);
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
      },
    },
    {
      key: 'suggested',
      label: 'Giá đề xuất',
      render: (product) => {
        const val = Number(product.suggested ?? 0);
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (product) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}
        >
          {getStatusLabel(product.status)}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'size',
      label: 'Size',
      render: (product) => product.size || '-',
    },
    {
      key: 'dimensions',
      label: 'Kích thước (cm)',
      render: (product) => {
        if (product.width && product.height) {
          return `${product.width} x ${product.height}`;
        }
        return '-';
      },
    },
    {
      key: 'color',
      label: 'Màu',
      render: (product) => product.color || '-',
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={String(error)} />;

  return (
    <div>
      <DataTable
        title="Quản lý Sản phẩm"
        columns={columns}
        data={paginatedProducts}
        keyExtractor={(product) => product.id}
        actions={[
          {
            label: 'Thêm Sản phẩm',
            onClick: () => {
              // Open modal for creating a new product: clear editing state and reset form
              setEditingProduct(null);
              form.reset(emptyDefaults);
              setIsModalOpen(true);
            },
          },
        ]}
        rowActions={(product) => [
          {
            label: 'Sửa',
            onClick: () => handleEdit(product),
            variant: 'link',
          },
          {
            label: 'Xóa',
            onClick: () => handleDelete(product.id),
            variant: 'link',
            disabled: deleteMutation.isPending,
          },
        ]}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          pageSize: pagination.pageSize,
          totalItems: products.length,
          onPageChange: pagination.goToPage,
          onPageSizeChange: pagination.changePageSize,
        }}
        loading={loading}
        emptyMessage="Không tìm thấy sản phẩm"
      />

      <ProductModal
        open={isModalOpen}
        onOpenChange={(open: boolean) => {
          setIsModalOpen(open);
          if (!open) {
            // When modal is closed (click outside or Esc), clear editing state and reset form
            setEditingProduct(null);
            form.reset(emptyDefaults);
          }
        }}
        form={form}
        onSubmit={onSubmit}
        title={editingProduct ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm'}
        categoryOptions={categoryOptions}
        onClose={handleCloseModal}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
