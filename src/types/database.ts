// Database types for all tables

export type InternalRole = 'super_admin' | 'customer_support';

export interface ProfilePayload {
  full_name?: string;
  avatar_url?: string;
  has_onboarded?: boolean;
  job_title?: string;
  primary_use_case?: string;
  internal_staff_role?: InternalRole;
}

// Customer types
export interface Customer {
  id: string;
  phone_number: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CustomerPayload {
  phone_number?: string;
  full_name?: string;
}

// Category types
export interface Category {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CategoryPayload {
  title: string;
  description?: string;
}

// Discount types
export interface Discount {
  id: string;
  code: string | null;
  title: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DiscountPayload {
  code?: string;
  title?: string;
  description?: string;
}

// Product types
export interface Product {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  purchase_price: number | null;
  suggested: number | null;
  size: string | null;
  width: number | null;
  height: number | null;
  color: string | null;
  category_id: string | null;
  discount_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductPayload {
  title: string;
  description?: string;
  image?: string;
  purchase_price?: number;
  suggested?: number;
  size?: string;
  width?: number;
  height?: number;
  color?: string;
  category_id?: string;
  discount_id?: string;
}

// Product Discount types
export interface ProductDiscount {
  product_id: string;
  discount_id: string;
  created_at: string;
  deleted_at: string | null;
}

export interface ProductDiscountPayload {
  product_id: string;
  discount_id: string;
}

// Order types
export interface Order {
  id: string;
  address: string | null;
  shipping_code: string | null;
  total_amount: number | null;
  customer_id: string | null;
  order_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OrderPayload {
  address?: string;
  shipping_code?: string;
  total_amount?: number;
  customer_id?: string;
  order_date?: string;
}

// Order Product types
export interface OrderProduct {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OrderProductPayload {
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiListResponse<T> {
  data?: T[];
  error?: string;
  message?: string;
  count?: number;
}
