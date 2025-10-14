import type { Category, CategoryPayload, ApiResponse, ApiListResponse } from '@/types/database';

const BASE_URL = '/api/categories';

export const categoryService = {
  // Get all categories
  async getAll(): Promise<ApiListResponse<Category>> {
    const response = await fetch(BASE_URL);
    const payload = await response.json();

    if (payload == null) return { data: [] } as ApiListResponse<Category>;
    if (Array.isArray(payload.data)) return payload as ApiListResponse<Category>;
    if (payload.success && payload.data) {
      const inner = payload.data;
      if (Array.isArray(inner.data))
        return { data: inner.data, count: inner.count } as ApiListResponse<Category>;
      if (Array.isArray(inner)) return { data: inner } as ApiListResponse<Category>;
    }
    return { data: [] } as ApiListResponse<Category>;
  },

  // Get a single category by ID
  async getById(id: string): Promise<ApiResponse<Category>> {
    const response = await fetch(`${BASE_URL}/${id}`);
    return response.json();
  },

  // Create a new category
  async create(payload: CategoryPayload): Promise<ApiResponse<Category>> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Update a category
  async update(id: string, payload: CategoryPayload): Promise<ApiResponse<Category>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Delete a category (soft delete)
  async delete(id: string): Promise<ApiResponse<Category>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
