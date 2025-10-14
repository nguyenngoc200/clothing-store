import type { Product, ProductPayload, ApiResponse, ApiListResponse } from '@/types/database';

const BASE_URL = '/api/products';

export const productService = {
  // Get all products
  async getAll(categoryId?: string): Promise<ApiListResponse<Product>> {
    const url = categoryId ? `${BASE_URL}?category_id=${categoryId}` : BASE_URL;
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
  },

  // Get a single product by ID
  async getById(id: string): Promise<ApiResponse<Product>> {
    const response = await fetch(`${BASE_URL}/${id}`);
    return response.json();
  },

  // Create a new product
  async create(payload: ProductPayload): Promise<ApiResponse<Product>> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Update a product
  async update(id: string, payload: ProductPayload): Promise<ApiResponse<Product>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Delete a product (soft delete)
  async delete(id: string): Promise<ApiResponse<Product>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Get products by array of IDs
  async getByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];

    const response = await fetch(`${BASE_URL}/by-ids`, {
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
  },
};
