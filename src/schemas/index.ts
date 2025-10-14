import { z } from 'zod';

// Category Schema
export const categorySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Customer Schema
export const customerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone_number: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// Discount Schema
export const discountSchema = z.object({
  code: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  discount_percent: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type DiscountFormData = z.infer<typeof discountSchema>;

// Product Schema
export const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  purchase_price: z.number().min(0, 'Purchase price must be positive').optional(),
  suggested: z.number().min(0, 'Suggested price must be positive').optional(),
  size: z.string().optional(),
  width: z.number().min(0, 'Width must be positive').optional(),
  height: z.number().min(0, 'Height must be positive').optional(),
  color: z.string().optional(),
  category_id: z.string().optional(),
  discount_id: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Order Schema
export const orderSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  address: z.string().min(1, 'Address is required'),
  shipping_code: z.string().optional(),
  total_amount: z.number().min(0).optional(),
  order_date: z.string().optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;

// Order Product Schema
export const orderProductSchema = z.object({
  order_id: z.string().min(1, 'Order is required'),
  product_id: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0),
  total_price: z.number().min(0),
});

export type OrderProductFormData = z.infer<typeof orderProductSchema>;

// Product Discount Schema
export const productDiscountSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  discount_id: z.string().min(1, 'Discount is required'),
});

export type ProductDiscountFormData = z.infer<typeof productDiscountSchema>;
