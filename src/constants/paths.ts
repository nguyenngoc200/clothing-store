const API = '/api';

// Optional prefix for API hostname (e.g. https://api.example.com)
export const API_PREFIX = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Centralized endpoint paths and small helpers for building URLs.
 * Keep path construction here so services use consistent URLs and encoding.
 */
export const PATHS = {
  // -- Products
  PRODUCTS_BY_IDS_API: `${API_PREFIX}${API}/products/by-ids`,
  PRODUCTS: `${API_PREFIX}${API}/products`,
  PRODUCTS_BY_CATEGORY: (categoryId?: string) =>
    `${API_PREFIX}${API}/products${categoryId ? `?category_id=${encodeURIComponent(categoryId)}` : ''}`,
  PRODUCT_BY_ID: (id: string) => `${API_PREFIX}${API}/products/${id}`,

  // -- Resource-by-id helpers
  CUSTOMER_BY_ID: (id: string) => `${API_PREFIX}${API}/customers/${id}`,
  CATEGORY_BY_ID: (id: string) => `${API_PREFIX}${API}/categories/${id}`,
  DISCOUNT_BY_ID: (id: string) => `${API_PREFIX}${API}/discounts/${id}`,
  ORDER_BY_ID: (id: string) => `${API_PREFIX}${API}/orders/${id}`,

  // -- Orders list helpers
  ORDERS_BY_CUSTOMER: (customerId?: string) =>
    `${API_PREFIX}${API}/orders${customerId ? `?customer_id=${encodeURIComponent(customerId)}` : ''}`,

  // -- Settings
  SETTINGS: `${API_PREFIX}${API}/settings`,
  SETTINGS_WITH_TAB: (tab: string) => `${API_PREFIX}${API}/settings?tab=${encodeURIComponent(tab)}`,
  SETTINGS_HOMEPAGE: `${API_PREFIX}${API}/settings/homepage`,
  SETTINGS_CALCULATION: `${API_PREFIX}${API}/settings/calculation`,
  SETTINGS_PRODUCT_COST: `${API_PREFIX}${API}/settings/product-cost`,

  // -- Storage
  STORAGE_UPLOAD: `${API_PREFIX}${API}/storage/upload`,
  STORAGE_SIGNED_URLS: `${API_PREFIX}${API}/storage/signed-urls`,

  // -- Common resource endpoints (base paths)
  CUSTOMERS: `${API_PREFIX}${API}/customers`,
  CATEGORIES: `${API_PREFIX}${API}/categories`,
  DISCOUNTS: `${API_PREFIX}${API}/discounts`,
  ORDERS: `${API_PREFIX}${API}/orders`,
  REPORTS: `${API_PREFIX}${API}/reports`,
};

export default PATHS;
