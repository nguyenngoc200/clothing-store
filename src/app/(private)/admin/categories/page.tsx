'use client';

import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/use-categories';
import Loading from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error-message';
import CategoryModal from '@/components/admin/CategoryModal';
import { DataTable, type Column } from '@/components/ui/table';
import { usePagination } from '@/hooks/use-pagination';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, type CategoryFormData } from '@/schemas';
import type { Category } from '@/types/database';

export default function CategoriesPage() {
  const { categories, loading, error } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const emptyDefaults: CategoryFormData = { title: '', description: '' };

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyDefaults,
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          payload: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      title: category.title,
      description: category.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete category:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.reset({ title: '', description: '' });
  };

  const pagination = usePagination({
    totalItems: categories?.length || 0,
    initialPageSize: 10,
  });

  const paginatedCategories = useMemo(() => {
    return (categories || []).slice(pagination.startIndex, pagination.endIndex);
  }, [categories, pagination.startIndex, pagination.endIndex]);

  const columns: Column<Category>[] = [
    {
      key: 'title',
      label: 'Tên',
      render: (category) => <span className="font-medium">{category.title}</span>,
      className: 'whitespace-nowrap',
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (category) => category.description,
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      render: (category) => new Date(category.created_at).toLocaleDateString(),
      className: 'whitespace-nowrap',
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={String(error)} />;

  return (
    <div>
      <DataTable
        title="Quản lý Danh mục"
        columns={columns}
        data={paginatedCategories}
        keyExtractor={(category) => category.id}
        actions={[
          {
            label: 'Thêm Danh mục',
            onClick: () => {
              // Prepare modal for creating a new category
              setEditingCategory(null);
              form.reset(emptyDefaults);
              setIsModalOpen(true);
            },
          },
        ]}
        rowActions={(category) => [
          {
            label: 'Sửa',
            onClick: () => handleEdit(category),
            variant: 'link',
          },
          {
            label: 'Xóa',
            onClick: () => handleDelete(category.id),
            variant: 'link',
            disabled: deleteMutation.isPending,
          },
        ]}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          pageSize: pagination.pageSize,
          totalItems: categories?.length || 0,
          onPageChange: pagination.goToPage,
          onPageSizeChange: pagination.changePageSize,
        }}
        loading={loading}
        emptyMessage="Không có danh mục nào"
      />

      <CategoryModal
        open={isModalOpen}
        onOpenChange={(open: boolean) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingCategory(null);
            form.reset(emptyDefaults);
          }
        }}
        form={form}
        onSubmit={onSubmit}
        editingCategory={editingCategory}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
