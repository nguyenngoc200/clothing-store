'use client';

import { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder } from '@/hooks/use-orders';
import Loading from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error-message';
import { DataTable, type Column } from '@/components/ui/table';
import OrderModal from '@/components/admin/OrderModal';
import InvoiceModal from '@/components/admin/InvoiceModal';
import { useCustomers } from '@/hooks/use-customers';
import { useProducts } from '@/hooks/use-products';
import { useDiscounts } from '@/hooks/use-discounts';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema, type OrderFormData } from '@/schemas';
import type { Order } from '@/types/database';
import { usePagination } from '@/hooks/use-pagination';

export default function OrdersPage() {
  const { orders, loading, error } = useOrders();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { discounts } = useDiscounts();
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();
  const deleteMutation = useDeleteOrder();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any | null>(null);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      address: '',
      shipping_code: '',
      total_amount: 0,
      customer_id: '',
      order_date: new Date().toISOString().split('T')[0],
      status: 'in_transit',
      items: [],
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    try {
      if (editingOrder) {
        const res = await updateMutation.mutateAsync({ id: editingOrder.id, payload: data });
        if (res?.error) {
          // show user-friendly message
          alert(res.error || res.message || 'Không thể cập nhật đơn hàng');
          return;
        }
      } else {
        const res = await createMutation.mutateAsync(data);
        if (res?.error) {
          alert(res.error || res.message || 'Không thể tạo đơn hàng');
          return;
        }
        // If creation succeeded, try to open invoice modal with created order
        try {
          const created = (res?.data as any) ?? res;
          const id = created?.id ?? created?.order_id ?? created;
          if (id) {
            const r = await fetch(`/api/orders/${id}`);
            const payload = await r.json();
            const orderFull = payload?.data ?? payload;
            // build invoice data
            const items = (orderFull?.order_product || []).map((op: any) => ({
              product_title: products.find((p) => p.id === op.product_id)?.title || op.product_id,
              quantity: op.quantity ?? 1,
              unit_price: op.unit_price ?? 0,
              total_price: op.total_price ?? (op.quantity ?? 1) * (op.unit_price ?? 0),
            }));
            setInvoiceData({
              id: orderFull.id,
              customer_name:
                customers.find((c) => c.id === orderFull.customer_id)?.full_name ??
                orderFull.customer_id,
              address: orderFull.address,
              shipping_code: orderFull.shipping_code,
              order_date: orderFull.order_date,
              items,
              total_amount: orderFull.total_amount,
            });
            setIsInvoiceOpen(true);
          }
        } catch (err) {
          // ignore invoice open errors
        }
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save order:', err);
      alert('Có lỗi xảy ra khi lưu đơn hàng. Xem console để biết thêm chi tiết.');
    }
  };

  const handleEdit = async (order: Order) => {
    try {
      // fetch full order detail (includes order_product rows)
      const res = await fetch(`/api/orders/${order.id}`);
      const payload = await res.json();
      const orderFull = payload?.data ?? payload; // support both wrapper and raw

      // map order_product rows into form items
      const items = (orderFull?.order_product || []).map(
        (op: {
          product_id: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          discount_id?: string | null;
          advertising_cost?: number;
          packaging_cost?: number;
          shipping_cost?: number;
          personnel_cost?: number;
          rent_cost?: number;
          freeship_cost?: number;
        }) => ({
          product_id: op.product_id,
          quantity: op.quantity ?? 1,
          unit_price: op.unit_price ?? 0,
          total_price: op.total_price ?? (op.quantity ?? 1) * (op.unit_price ?? 0),
          discount_id: op.discount_id ?? null,
          advertising_cost: op.advertising_cost ?? 0,
          packaging_cost: op.packaging_cost ?? 0,
          shipping_cost: op.shipping_cost ?? 0,
          personnel_cost: op.personnel_cost ?? 0,
          rent_cost: op.rent_cost ?? 0,
          freeship_cost: op.freeship_cost ?? 0,
        }),
      );

      setEditingOrder(orderFull);
      form.reset({
        address: orderFull.address || '',
        shipping_code: orderFull.shipping_code || '',
        total_amount: orderFull.total_amount || 0,
        customer_id: orderFull.customer_id || '',
        order_date: orderFull.order_date || new Date().toISOString().split('T')[0],
        status: orderFull.status ?? 'in_transit',
        items,
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to load order details', err);
      // fallback to minimal edit behavior
      setEditingOrder(order);
      form.reset({
        address: order.address || '',
        shipping_code: order.shipping_code || '',
        total_amount: order.total_amount || 0,
        customer_id: order.customer_id || '',
        order_date: order.order_date || new Date().toISOString().split('T')[0],
        status: (order as Order).status ?? 'in_transit',
        items: [],
      });
      setIsModalOpen(true);
    }
  };

  const handleExport = async (order: Order) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      const payload = await res.json();
      const orderFull = payload?.data ?? payload;
      const items = (orderFull?.order_product || []).map((op: any) => ({
        product_title: products.find((p) => p.id === op.product_id)?.title || op.product_id,
        quantity: op.quantity ?? 1,
        unit_price: op.unit_price ?? 0,
        total_price: op.total_price ?? (op.quantity ?? 1) * (op.unit_price ?? 0),
      }));
      setInvoiceData({
        id: orderFull.id,
        customer_name:
          customers.find((c) => c.id === orderFull.customer_id)?.full_name ?? orderFull.customer_id,
        address: orderFull.address,
        shipping_code: orderFull.shipping_code,
        order_date: orderFull.order_date,
        items,
        total_amount: orderFull.total_amount,
      });
      setIsInvoiceOpen(true);
    } catch (err) {
      console.error('Failed to load order for invoice', err);
      alert('Không thể tải dữ liệu đơn hàng để xuất bill');
    }
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
      status: 'in_transit',
      items: [],
    });
  };

  const pagination = usePagination({
    totalItems: orders.length,
    initialPageSize: 10,
  });

  const paginatedOrders = useMemo(() => {
    return orders.slice(pagination.startIndex, pagination.endIndex);
  }, [orders, pagination.startIndex, pagination.endIndex]);

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'in_stock':
        return 'Đang lưu kho';
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
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'sold':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
      key: 'product',
      label: 'Sản phẩm',
      render: (order) => {
        // The API returns a nested order_product (referenced by order_product_id)
        // with a product_id. Try to resolve the product title from the products
        // list for a friendly display.
        const op = (
          order as unknown as {
            order_product?: { product_id?: string; quantity?: number; unit_price?: number };
          }
        ).order_product;
        if (!op) return '-';
        const prod = products.find((p) => p.id === op.product_id);
        const title = prod ? prod.title : op.product_id;
        const qty = op.quantity ?? 1;
        const unit = op.unit_price ?? 0;
        const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        return `${title} x${qty} — ${fmt.format(unit)}`;
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (order) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
        >
          {getStatusLabel(order.status)}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'total_amount',
      label: 'Tổng tiền',
      render: (order) => {
        const fmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        return fmt.format(Number(order.total_amount) || 0);
      },
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
            onClick: () => {
              // Clear editing state and reset form to defaults so modal opens in "create" mode
              setEditingOrder(null);
              form.reset({
                address: '',
                shipping_code: '',
                total_amount: 0,
                customer_id: '',
                order_date: new Date().toISOString().split('T')[0],
                status: 'in_transit',
                items: [],
              });
              setIsModalOpen(true);
            },
          },
        ]}
        rowActions={(order) => [
          {
            label: 'Sửa',
            onClick: () => handleEdit(order),
            variant: 'link',
          },
          {
            label: 'Lấy hóa đơn',
            onClick: () => handleExport(order),
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

      <InvoiceModal open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen} initial={invoiceData} />

      <OrderModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        form={form}
        onSubmit={onSubmit}
        customers={customers}
        products={products}
        discounts={discounts}
        editingOrder={editingOrder}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
