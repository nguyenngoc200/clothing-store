'use client';

import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '@/hooks/use-customers';
import Loading from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error-message';
import CustomerModal from '@/components/admin/CustomerModal';
import { DataTable, type Column } from '@/components/ui/table';
import { usePagination } from '@/hooks/use-pagination';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerFormData } from '@/schemas';
import type { Customer } from '@/types/database';

export default function CustomersPage() {
  const { customers, loading, error } = useCustomers();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      full_name: '',
      phone_number: '',
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (editingCustomer) {
        await updateMutation.mutateAsync({
          id: editingCustomer.id,
          payload: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save customer:', err);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
      full_name: customer.full_name || '',
      phone_number: customer.phone_number || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này không?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete customer:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    form.reset({
      full_name: '',
      phone_number: '',
    });
  };

  const pagination = usePagination({
    totalItems: customers.length,
    initialPageSize: 10,
  });

  const paginatedCustomers = useMemo(() => {
    return customers.slice(pagination.startIndex, pagination.endIndex);
  }, [customers, pagination.startIndex, pagination.endIndex]);

  const columns: Column<Customer>[] = [
    {
      key: 'full_name',
      label: 'Họ và tên',
      render: (customer) => <span className="font-medium">{customer.full_name}</span>,
      className: 'whitespace-nowrap',
    },
    {
      key: 'phone_number',
      label: 'Số điện thoại',
      render: (customer) => customer.phone_number,
    },
    {
      key: 'created_at',
      label: 'Ngày tạo',
      render: (customer) => new Date(customer.created_at).toLocaleDateString(),
      className: 'whitespace-nowrap',
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={String(error)} />;

  return (
    <div>
      <DataTable
        title="Quản lý Khách hàng"
        columns={columns}
        data={paginatedCustomers}
        keyExtractor={(customer) => customer.id}
        actions={[
          {
            label: 'Thêm Khách hàng',
            onClick: () => setIsModalOpen(true),
          },
        ]}
        rowActions={(customer) => [
          {
            label: 'Sửa',
            onClick: () => handleEdit(customer),
            variant: 'link',
          },
          {
            label: 'Xóa',
            onClick: () => handleDelete(customer.id),
            variant: 'link',
            disabled: deleteMutation.isPending,
          },
        ]}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          pageSize: pagination.pageSize,
          totalItems: customers.length,
          onPageChange: pagination.goToPage,
          onPageSizeChange: pagination.changePageSize,
        }}
        loading={loading}
        emptyMessage="Không có khách hàng nào"
      />

      <CustomerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        form={form}
        onSubmit={onSubmit}
        editingCustomer={editingCustomer}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
