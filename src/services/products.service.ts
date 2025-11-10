import type { Product, ProductPayload, ApiResponse, ApiListResponse } from '@/types/database';
import PATHS from '@/constants/paths';

const BASE_URL = `${PATHS.PRODUCTS}`;

export const productService = {
  // Get all products
  async getAll(categoryId?: string): Promise<ApiListResponse<Product>> {
    try {
      const url = PATHS.PRODUCTS_BY_CATEGORY(categoryId);
      const response = await fetch(url);
      const payload = await response.json();

      if (payload == null) return { data: [] } as ApiListResponse<Product>;
      if (Array.isArray(payload.data)) return payload as ApiListResponse<Product>;
      if (payload.success && payload.data) {
        const inner = payload.data;
        if (Array.isArray(inner.data))
          return { data: inner.data, count: inner.count } as ApiListResponse<Product>;
        if (Array.isArray(inner)) return { data: inner } as ApiListResponse<Product>;
      }
      return { data: [] } as ApiListResponse<Product>;
    } catch (error) {
      console.error('productService.getAll error:', error);
      return { data: [] } as ApiListResponse<Product>;
    }
  },

  // Get a single product by ID
  async getById(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(PATHS.PRODUCT_BY_ID(id));
      return response.json();
    } catch (error) {
      console.error('productService.getById error:', error);
      throw error;
    }
  },

  // Create a new product
  async create(payload: ProductPayload): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      console.error('productService.create error:', error);
      throw error;
    }
  },

  // Update a product
  async update(id: string, payload: ProductPayload): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(PATHS.PRODUCT_BY_ID(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      console.error('productService.update error:', error);
      throw error;
    }
  },

  // Delete a product (soft delete)
  async delete(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(PATHS.PRODUCT_BY_ID(id), {
        method: 'DELETE',
      });
      return response.json();
    } catch (error) {
      console.error('productService.delete error:', error);
      throw error;
    }
  },

  // Get products by array of IDs
  async getByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];

    try {
      const response = await fetch(PATHS.PRODUCTS_BY_IDS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        console.error('Error fetching products by IDs:', response.statusText);
        return [];
      }

      return response.json();
    } catch (error) {
      console.error('productService.getByIds error:', error);
      return [];
    }
  },
};
