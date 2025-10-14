'use client';

import { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder } from '@/hooks/use-orders';
import Loading from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error-message';
import { DataTable, type Column } from '@/components/ui/table';
import OrderModal from '@/components/admin/OrderModal';
import { useCustomers } from '@/hooks/use-customers';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema, type OrderFormData } from '@/schemas';
import type { Order } from '@/types/database';
import { usePagination } from '@/hooks/use-pagination';

export default function OrdersPage() {
  const { orders, loading, error } = useOrders();
  const { customers } = useCustomers();
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();
  const deleteMutation = useDeleteOrder();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      address: '',
      shipping_code: '',
      total_amount: 0,
      customer_id: '',
      order_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    try {
      if (editingOrder) {
        await updateMutation.mutateAsync({
          id: editingOrder.id,
          payload: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save order:', err);
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    form.reset({
      address: order.address || '',
      shipping_code: order.shipping_code || '',
      total_amount: order.total_amount || 0,
      customer_id: order.customer_id || '',
      order_date: order.order_date || new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa đơn hàng này không?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete order:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    form.reset({
      address: '',
      shipping_code: '',
      total_amount: 0,
      customer_id: '',
      order_date: new Date().toISOString().split('T')[0],
    });
  };

  const pagination = usePagination({
    totalItems: orders.length,
    initialPageSize: 10,
  });

  const paginatedOrders = useMemo(() => {
    return orders.slice(pagination.startIndex, pagination.endIndex);
  }, [orders, pagination.startIndex, pagination.endIndex]);

  const columns: Column<Order>[] = [
    {
      key: 'order_date',
      label: 'Ngày đặt',
      render: (order) => new Date(order.order_date).toLocaleDateString(),
      className: 'whitespace-nowrap',
    },
    {
      key: 'customer_id',
      label: 'Khách hàng',
      render: (order) => {
        const customer = customers.find((c) => c.id === order.customer_id);
        return customer?.full_name ?? order.customer_id;
      },
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      render: (order) => order.address,
    },
    {
      key: 'total_amount',
      label: 'Tổng tiền',
      render: (order) => `₫${order.total_amount}`,
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={String(error)} />;

  return (
    <div>
      <DataTable
        title="Quản lý Đơn hàng"
        columns={columns}
        data={paginatedOrders}
        keyExtractor={(order) => order.id}
        actions={[
          {
            label: 'Thêm Đơn hàng',
            onClick: () => setIsModalOpen(true),
          },
        ]}
        rowActions={(order) => [
          {
            label: 'Sửa',
            onClick: () => handleEdit(order),
            variant: 'link',
          },
          {
            label: 'Xóa',
            onClick: () => handleDelete(order.id),
            variant: 'link',
            disabled: deleteMutation.isPending,
          },
        ]}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          pageSize: pagination.pageSize,
          totalItems: orders.length,
          onPageChange: pagination.goToPage,
          onPageSizeChange: pagination.changePageSize,
        }}
        loading={loading}
        emptyMessage="Không tìm thấy đơn hàng"
      />

      <OrderModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        form={form}
        onSubmit={onSubmit}
        customers={customers.map((c) => ({ id: c.id, full_name: c.full_name ?? '' }))}
        editingOrder={editingOrder}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
