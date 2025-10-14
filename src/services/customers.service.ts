import type { Customer, CustomerPayload, ApiResponse, ApiListResponse } from '@/types/database';

const BASE_URL = '/api/customers';

export const customerService = {
  // Get all customers
  async getAll(): Promise<ApiListResponse<Customer>> {
    const response = await fetch(BASE_URL);
    const payload = await response.json();

    // The API responses were migrated to a wrapper shape: { success: true, data: { data: [...], count } }
    // But the service expects ApiListResponse<T> which is { data?: T[], count?: number }
    // Normalize the payload to always return the expected shape.
    if (payload == null) {
      return { data: [] } as ApiListResponse<Customer>;
    }

    // If payload already matches ApiListResponse (data is an array), return it
    if (Array.isArray(payload.data)) {
      return payload as ApiListResponse<Customer>;
    }

    // If response is wrapped as { success, data: { data: [...], count } }
    if (payload.success && payload.data) {
      const inner = payload.data;
      if (Array.isArray(inner.data)) {
        return { data: inner.data, count: inner.count } as ApiListResponse<Customer>;
      }
      // If inner is an array directly
      if (Array.isArray(inner)) {
        return { data: inner } as ApiListResponse<Customer>;
      }
    }

    // Fallback: return empty array
    return { data: [] } as ApiListResponse<Customer>;
  },

  // Get a single customer by ID
  async getById(id: string): Promise<ApiResponse<Customer>> {
    const response = await fetch(`${BASE_URL}/${id}`);
    return response.json();
  },

  // Create a new customer
  async create(payload: CustomerPayload): Promise<ApiResponse<Customer>> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Update a customer
  async update(id: string, payload: CustomerPayload): Promise<ApiResponse<Customer>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Delete a customer (soft delete)
  async delete(id: string): Promise<ApiResponse<Customer>> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
