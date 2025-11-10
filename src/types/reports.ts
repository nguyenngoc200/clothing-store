export type DateRange = 'week' | 'month' | 'year';

export type ProductReportItem = {
  id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  revenue: number; // total_price (doanh thu)
  cost: number; // purchase_price * quantity (giá vốn)
  discount_amount: number; // tổng giảm giá
  advertising_cost: number;
  packaging_cost: number;
  shipping_cost: number;
  personnel_cost: number;
  rent_cost: number;
  freeship_cost: number;
  gross_profit: number; // revenue - cost
  net_profit: number; // gross_profit - all costs
};

export type ReportSummary = {
  total_revenue: number;
  total_cost: number;
  total_gross_profit: number;
  total_net_profit: number;
  total_advertising: number;
  total_packaging: number;
  total_shipping: number;
  total_personnel: number;
  total_rent: number;
  total_freeship: number;
  total_discount: number;
  products: ProductReportItem[];
};
