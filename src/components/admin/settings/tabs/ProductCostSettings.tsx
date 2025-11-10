/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { DataTable, Column } from '@/components/ui/table';
import ProductCostModal from '../../ProductCostModal';
// import SETTINGS from '@/constants/settings';
import { productCostService } from '@/services/productCost.service';

export type ProductCostForm = {
  title?: string;
  advertising?: string;
  packaging?: string;
  shipping?: string;
  personnel?: string;
  rent?: string;
  profitMargin?: number;
};

export default function ProductCostSettings() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);

  // load rows
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productCostService
      .getAll()
      .then((res) => {
        if (!mounted) return;
        setRows(res?.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const updated = await productCostService.getAll();
      setRows(updated?.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = window.confirm(
      `Xóa cấu hình "${item.title ?? item.key}" ? Đây là hành động không thể hoàn tác.`,
    );
    if (!ok) return;
    try {
      await productCostService.delete(item.id ?? item.key);
      await refresh();
    } catch (err) {
      console.error('Failed to delete product cost', err);
      alert('Xóa thất bại');
    }
  };

  const columns: Column<any>[] = [
    { key: 'title', label: 'Tiêu đề', render: (r) => r.title ?? (r.data && r.data.title) ?? '-' },
    { key: 'id', label: 'ID' },
    { key: 'created_at', label: 'Tạo lúc', render: (r) => new Date(r.created_at).toLocaleString() },
  ];

  return (
    <div className="space-y-6 mt-4">
      <DataTable
        title="Chi phí sản phẩm"
        description="Danh sách cấu hình chi phí để dùng khi tính giá đề xuất"
        columns={columns}
        data={rows}
        loading={loading}
        keyExtractor={(r) => r.id || r.key}
        actions={[
          {
            label: 'Tạo chi phí mới',
            onClick: () => {
              setEditingRow(null);
              setModalOpen(true);
            },
            variant: 'default',
          },
        ]}
        rowActions={
          rows.length
            ? (item) => [
                {
                  label: 'Sửa',
                  onClick: () => {
                    setEditingRow(item);
                    setModalOpen(true);
                  },
                  variant: 'outline',
                },
                {
                  label: 'Xóa',
                  onClick: () => {
                    void handleDelete(item);
                  },
                  variant: 'outline',
                },
              ]
            : undefined
        }
        emptyMessage="Chưa có cấu hình chi phí nào"
      />

      <ProductCostModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={
          editingRow
            ? {
                key: editingRow.key,
                title: editingRow.title ?? editingRow.data?.title,
                advertising: editingRow.advertising ?? editingRow.data?.advertising,
                packaging: editingRow.packaging ?? editingRow.data?.packaging,
                shipping: editingRow.shipping ?? editingRow.data?.shipping,
                personnel: editingRow.personnel ?? editingRow.data?.personnel,
                rent: editingRow.rent ?? editingRow.data?.rent,
                profitMargin: editingRow.profit_margin ?? editingRow.data?.profitMargin,
              }
            : undefined
        }
        onSaved={refresh}
      />
    </div>
  );
}
