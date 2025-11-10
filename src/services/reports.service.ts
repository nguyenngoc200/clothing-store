import { createClient } from '@/lib/supabase/client';
import type { DateRange, ProductReportItem, ReportSummary } from '@/types/reports';

// Re-export report types for consumers that import them from the service module
export type { DateRange, ProductReportItem, ReportSummary } from '@/types/reports';

/**
 * Lấy tất cả orders và products trong khoảng thời gian
 */
export async function getReportData(
  range: DateRange,
  startDate?: string,
  endDate?: string,
): Promise<ReportSummary> {
  const supabase = createClient();

  // Calculate date range if not provided
  let start = startDate;
  let end = endDate;

  if (!start || !end) {
    const now = new Date();
    end = now.toISOString();

    switch (range) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'year':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
        break;
    }
  }

  // Fetch all orders in range with order_products
  const { data: orders, error } = await supabase
    .from('order')
    .select(
      `
      id,
      order_date,
      total_amount,
      order_product (
        id,
        product_id,
        quantity,
        unit_price,
        total_price,
        discount_id,
        advertising_cost,
        packaging_cost,
        shipping_cost,
        personnel_cost,
        rent_cost,
        freeship_cost,
        product (
          id,
          title,
          purchase_price
        ),
        discount (
          id,
          discount_percent,
          discount_amount
        )
      )
    `,
    )
    .gte('order_date', start)
    .lte('order_date', end)
    .is('deleted_at', null);

  if (error) {
    console.error('Failed to fetch report data:', error);
    throw error;
  }

  // Process data into product report items
  const productMap = new Map<string, ProductReportItem>();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  (orders || []).forEach((order: any) => {
    (order.order_product || []).forEach((op: any) => {
      const productId = op.product_id;
      const productTitle = op.product?.title || 'Unknown';
      const quantity = op.quantity || 0;
      const revenue = op.total_price || 0;
      const purchasePrice = op.product?.purchase_price || 0;
      const cost = purchasePrice * quantity;

      // Calculate discount amount
      let discountAmount = 0;
      if (op.discount) {
        const basePrice = op.unit_price * quantity;
        if (op.discount.discount_percent) {
          discountAmount = (basePrice * op.discount.discount_percent) / 100;
        } else if (op.discount.discount_amount) {
          discountAmount = op.discount.discount_amount;
        }
      }

      const advertisingCost = op.advertising_cost || 0;
      const packagingCost = op.packaging_cost || 0;
      const shippingCost = op.shipping_cost || 0;
      const personnelCost = op.personnel_cost || 0;
      const rentCost = op.rent_cost || 0;
      const freeshipCost = op.freeship_cost || 0;

      const grossProfit = revenue - cost;
      const totalCosts =
        advertisingCost +
        packagingCost +
        shippingCost +
        personnelCost +
        rentCost +
        freeshipCost +
        discountAmount;
      const netProfit = grossProfit - totalCosts;

      if (productMap.has(productId)) {
        const existing = productMap.get(productId)!;
        existing.quantity += quantity;
        existing.revenue += revenue;
        existing.cost += cost;
        existing.discount_amount += discountAmount;
        existing.advertising_cost += advertisingCost;
        existing.packaging_cost += packagingCost;
        existing.shipping_cost += shippingCost;
        existing.personnel_cost += personnelCost;
        existing.rent_cost += rentCost;
        existing.freeship_cost += freeshipCost;
        existing.gross_profit += grossProfit;
        existing.net_profit += netProfit;
      } else {
        productMap.set(productId, {
          id: op.id,
          product_id: productId,
          product_title: productTitle,
          quantity,
          revenue,
          cost,
          discount_amount: discountAmount,
          advertising_cost: advertisingCost,
          packaging_cost: packagingCost,
          shipping_cost: shippingCost,
          personnel_cost: personnelCost,
          rent_cost: rentCost,
          freeship_cost: freeshipCost,
          gross_profit: grossProfit,
          net_profit: netProfit,
        });
      }
    });
  });

  const products = Array.from(productMap.values());

  // Calculate totals
  const summary: ReportSummary = {
    total_revenue: products.reduce((sum, p) => sum + p.revenue, 0),
    total_cost: products.reduce((sum, p) => sum + p.cost, 0),
    total_gross_profit: products.reduce((sum, p) => sum + p.gross_profit, 0),
    total_net_profit: products.reduce((sum, p) => sum + p.net_profit, 0),
    total_advertising: products.reduce((sum, p) => sum + p.advertising_cost, 0),
    total_packaging: products.reduce((sum, p) => sum + p.packaging_cost, 0),
    total_shipping: products.reduce((sum, p) => sum + p.shipping_cost, 0),
    total_personnel: products.reduce((sum, p) => sum + p.personnel_cost, 0),
    total_rent: products.reduce((sum, p) => sum + p.rent_cost, 0),
    total_freeship: products.reduce((sum, p) => sum + p.freeship_cost, 0),
    total_discount: products.reduce((sum, p) => sum + p.discount_amount, 0),
    products,
  };

  return summary;
}
