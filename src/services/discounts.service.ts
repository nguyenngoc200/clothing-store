import type { Discount, DiscountPayload, ApiResponse, ApiListResponse } from '@/types/database';

const BASE_URL = '/api/discounts';

export const discountService = {
  // Get all discounts
  async getAll(): Promise<ApiListResponse<Discount>> {
    const response = await fetch(BASE_URL);
    const payload = await response.json();

    if (payload == null) return { data: [] } as ApiListResponse<Discount>;
    if (Array.isArray(payload.data)) return payload as ApiListResponse<Discount>;
    if (payload.success && payload.data) {
      const inner = payload.data;
      if (Array.isArray(inner.data))
        return { data: inner.data, count: inner.count } as ApiListResponse<Discount>;
      if (Array.isArray(inner)) return { data: inner } as ApiListResponse<Discount>;
    }
    return { data: [] } as ApiListResponse<Discount>;
  },

  // Get a single discount by ID
  async getById(id: string): Promise<ApiResponse<Discount>> {
    const response = await fetch(`${BASE_URL}/${id}`);
    return response.json();
  },

  // Create a new discount
  async create(payload: DiscountPayload): Promise<ApiResponse<Discount>> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Update a discount
  async update(id: string, payload: DiscountPayload): Promise<ApiResponse<Discount>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Delete a discount (soft delete)
  async delete(id: string): Promise<ApiResponse<Discount>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
