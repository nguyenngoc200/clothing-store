import PATHS from '@/constants/paths';
import type { ApiListResponse, ApiResponse, Customer, CustomerPayload } from '@/types/database';

export const customerService = {
  // Get all customers
  async getAll(): Promise<ApiListResponse<Customer>> {
    try {
      const response = await fetch(PATHS.CUSTOMERS);
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
    } catch (error) {
      console.error('customerService.getAll error:', error);
      return { data: [] } as ApiListResponse<Customer>;
    }
  },

  // Get a single customer by ID
  async getById(id: string): Promise<ApiResponse<Customer>> {
    try {
      const response = await fetch(PATHS.CUSTOMER_BY_ID(id));
      return response.json();
    } catch (error) {
      console.error('customerService.getById error:', error);
      throw error;
    }
  },

  // Create a new customer
  async create(payload: CustomerPayload): Promise<ApiResponse<Customer>> {
    try {
      const response = await fetch(PATHS.CUSTOMERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      console.error('customerService.create error:', error);
      throw error;
    }
  },

  // Update a customer
  async update(id: string, payload: CustomerPayload): Promise<ApiResponse<Customer>> {
    try {
      const response = await fetch(PATHS.CUSTOMER_BY_ID(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return response.json();
    } catch (error) {
      console.error('customerService.update error:', error);
      throw error;
    }
  },

  // Delete a customer (soft delete)
  async delete(id: string): Promise<ApiResponse<Customer>> {
    try {
      const response = await fetch(PATHS.CUSTOMER_BY_ID(id), {
        method: 'DELETE',
      });
      return response.json();
    } catch (error) {
      console.error('customerService.delete error:', error);
      throw error;
    }
  },
};
