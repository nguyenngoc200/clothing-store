'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getReportData,
  type DateRange,
  type ReportSummary,
  type ProductReportItem,
} from '@/services/reports.service';
import { usePagination } from '@/hooks/use-pagination';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function ReportsDashboard() {
  const [range, setRange] = useState<DateRange>('month');
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await getReportData(range);
        setData(result);
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]);

  const pagination = usePagination({
    totalItems: data?.products?.length || 0,
    initialPageSize: 10,
  });

  const paginatedProducts = useMemo<ProductReportItem[]>(() => {
    if (!data?.products) return [];
    return data.products.slice(pagination.startIndex, pagination.endIndex);
  }, [data?.products, pagination.startIndex, pagination.endIndex]);

  // Prepare pie chart data
  const costBreakdownData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Quảng cáo', value: data.total_advertising },
      { name: 'Đóng gói', value: data.total_packaging },
      { name: 'Vận chuyển', value: data.total_shipping },
      { name: 'Nhân sự', value: data.total_personnel },
      { name: 'Mặt bằng', value: data.total_rent },
      { name: 'Freeship', value: data.total_freeship },
      { name: 'Giảm giá', value: data.total_discount },
    ].filter((item) => item.value > 0);
  }, [data]);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Báo cáo kinh doanh</h2>
        <div className="flex items-center gap-3">
          <Select
            value={range}
            onValueChange={(v: string) => setRange(v as DateRange)}
            disabled={loading}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần</SelectItem>
              <SelectItem value="month">Tháng</SelectItem>
              <SelectItem value="year">Năm</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setRange(range)} size="sm" disabled={loading}>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="products">Chi tiết sản phẩm</TabsTrigger>
          <TabsTrigger value="costs">Phân bổ chi phí</TabsTrigger>
        </TabsList>

        {/* Tab 1: Tổng quan */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow-sm border border-blue-200">
              <div className="text-sm text-gray-500">Doanh thu</div>
              <div className="text-2xl font-semibold text-blue-600">
                {formatVND(data?.total_revenue || 0)}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border border-green-200">
              <div className="text-sm text-gray-500">Lợi nhuận gộp</div>
              <div className="text-2xl font-semibold text-green-600">
                {formatVND(data?.total_gross_profit || 0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">= Doanh thu - Giá vốn</div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border border-purple-200">
              <div className="text-sm text-gray-500">Lợi nhuận ròng</div>
              <div className="text-2xl font-semibold text-purple-600">
                {formatVND(data?.total_net_profit || 0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">= Lợi nhuận gộp - Chi phí</div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm border border-orange-200">
              <div className="text-sm text-gray-500">Tổng chi phí</div>
              <div className="text-2xl font-semibold text-orange-600">
                {formatVND(
                  (data?.total_advertising || 0) +
                    (data?.total_packaging || 0) +
                    (data?.total_shipping || 0) +
                    (data?.total_personnel || 0) +
                    (data?.total_rent || 0) +
                    (data?.total_freeship || 0) +
                    (data?.total_discount || 0),
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <h3 className="text-sm font-medium mb-4">Chi tiết chi phí</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="border rounded p-3">
                <div className="text-xs text-muted-foreground">Quảng cáo</div>
                <div className="text-sm font-semibold">
                  {formatVND(data?.total_advertising || 0)}
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-muted-foreground">Đóng gói</div>
                <div className="text-sm font-semibold">{formatVND(data?.total_packaging || 0)}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-muted-foreground">Vận chuyển</div>
                <div className="text-sm font-semibold">{formatVND(data?.total_shipping || 0)}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-muted-foreground">Nhân sự</div>
                <div className="text-sm font-semibold">{formatVND(data?.total_personnel || 0)}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-muted-foreground">Mặt bằng</div>
                <div className="text-sm font-semibold">{formatVND(data?.total_rent || 0)}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-muted-foreground">Freeship</div>
                <div className="text-sm font-semibold">{formatVND(data?.total_freeship || 0)}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-muted-foreground">Giảm giá</div>
                <div className="text-sm font-semibold">{formatVND(data?.total_discount || 0)}</div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Chi tiết sản phẩm */}
        <TabsContent value="products" className="space-y-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Sản phẩm</th>
                    <th className="text-right p-2">SL</th>
                    <th className="text-right p-2">Doanh thu</th>
                    <th className="text-right p-2">Giá vốn</th>
                    <th className="text-right p-2">LN gộp</th>
                    <th className="text-right p-2">Chi phí</th>
                    <th className="text-right p-2">LN ròng</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => {
                    const totalCosts =
                      product.advertising_cost +
                      product.packaging_cost +
                      product.shipping_cost +
                      product.personnel_cost +
                      product.rent_cost +
                      product.freeship_cost +
                      product.discount_amount;

                    return (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{product.product_title}</td>
                        <td className="text-right p-2">{product.quantity}</td>
                        <td className="text-right p-2">{formatVND(product.revenue)}</td>
                        <td className="text-right p-2">{formatVND(product.cost)}</td>
                        <td className="text-right p-2 text-green-600">
                          {formatVND(product.gross_profit)}
                        </td>
                        <td className="text-right p-2 text-orange-600">{formatVND(totalCosts)}</td>
                        <td className="text-right p-2 text-purple-600 font-semibold">
                          {formatVND(product.net_profit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị {pagination.startIndex + 1} -{' '}
                {Math.min(pagination.endIndex, data?.products?.length || 0)} trong tổng số{' '}
                {data?.products?.length || 0} sản phẩm
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.goToPage(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Trước
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === pagination.currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => pagination.goToPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.goToPage(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Phân bổ chi phí (Pie Chart) */}
        <TabsContent value="costs" className="space-y-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <h3 className="text-sm font-medium mb-4">Biểu đồ phân bổ chi phí</h3>
            {costBreakdownData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatVND(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Không có dữ liệu chi phí
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <h3 className="text-sm font-medium mb-4">Chi tiết chi phí theo loại</h3>
            <div className="space-y-2">
              {costBreakdownData.map((item, index) => {
                const total =
                  (data?.total_advertising || 0) +
                  (data?.total_packaging || 0) +
                  (data?.total_shipping || 0) +
                  (data?.total_personnel || 0) +
                  (data?.total_rent || 0) +
                  (data?.total_freeship || 0) +
                  (data?.total_discount || 0);
                const percent = total > 0 ? (item.value / total) * 100 : 0;

                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatVND(item.value)}</div>
                      <div className="text-xs text-muted-foreground">{percent.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
