'use client';

import {
  useDiscounts,
  useCreateDiscount,
  useUpdateDiscount,
  useDeleteDiscount,
} from '@/hooks/use-discounts';
import Loading from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error-message';
import DiscountModal from '@/components/admin/DiscountModal';
import { DataTable, type Column } from '@/components/ui/table';
import { usePagination } from '@/hooks/use-pagination';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { discountSchema, type DiscountFormData } from '@/schemas';
import type { Discount } from '@/types/database';

export default function DiscountsPage() {
  const { discounts, loading, error } = useDiscounts();
  const createMutation = useCreateDiscount();
  const updateMutation = useUpdateDiscount();
  const deleteMutation = useDeleteDiscount();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: '',
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data: DiscountFormData) => {
    try {
      if (editingDiscount) {
        await updateMutation.mutateAsync({
          id: editingDiscount.id,
          payload: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save discount:', err);
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    form.reset({
      code: discount.code || '',
      title: discount.title || '',
      description: discount.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this discount?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete discount:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
    form.reset({ code: '', title: '', description: '' });
  };

  const pagination = usePagination({
    totalItems: discounts.length,
    initialPageSize: 10,
  });

  const paginatedDiscounts = useMemo(() => {
    return discounts.slice(pagination.startIndex, pagination.endIndex);
  }, [discounts, pagination.startIndex, pagination.endIndex]);

  const columns: Column<Discount>[] = [
    {
      key: 'code',
      label: 'Mã',
      render: (discount) => <span className="font-medium">{discount.code}</span>,
      className: 'whitespace-nowrap',
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      render: (discount) => discount.title,
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (discount) => discount.description,
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      render: (discount) => new Date(discount.created_at).toLocaleDateString(),
      className: 'whitespace-nowrap',
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={String(error)} />;

  return (
    <div>
      <DataTable
        title="Quản lý Mã giảm giá"
        columns={columns}
        data={paginatedDiscounts}
        keyExtractor={(discount) => discount.id}
        actions={[
          {
            label: 'Thêm Mã giảm giá',
            onClick: () => setIsModalOpen(true),
          },
        ]}
        rowActions={(discount) => [
          {
            label: 'Sửa',
            onClick: () => handleEdit(discount),
            variant: 'link',
          },
          {
            label: 'Xóa',
            onClick: () => handleDelete(discount.id),
            variant: 'link',
            disabled: deleteMutation.isPending,
          },
        ]}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          pageSize: pagination.pageSize,
          totalItems: discounts.length,
          onPageChange: pagination.goToPage,
          onPageSizeChange: pagination.changePageSize,
        }}
        loading={loading}
        emptyMessage="Không có mã giảm giá nào"
      />

      <DiscountModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        form={form}
        onSubmit={onSubmit}
        editingDiscount={editingDiscount}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
