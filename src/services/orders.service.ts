import type { Order, OrderPayload, ApiResponse, ApiListResponse } from '@/types/database';
import PATHS from '@/constants/paths';

const BASE_URL = `${PATHS.ORDERS}`;

export const orderService = {
  // Get all orders
  async getAll(customerId?: string): Promise<ApiListResponse<Order>> {
    const url = PATHS.ORDERS_BY_CUSTOMER(customerId);
    const response = await fetch(url);
    const payload = await response.json();

    if (payload == null) return { data: [] } as ApiListResponse<Order>;
    if (Array.isArray(payload.data)) return payload as ApiListResponse<Order>;
    if (payload.success && payload.data) {
      const inner = payload.data;
      if (Array.isArray(inner.data))
        return { data: inner.data, count: inner.count } as ApiListResponse<Order>;
      if (Array.isArray(inner)) return { data: inner } as ApiListResponse<Order>;
    }
    return { data: [] } as ApiListResponse<Order>;
  },

  // Get a single order by ID
  async getById(id: string): Promise<ApiResponse<Order>> {
    const response = await fetch(PATHS.ORDER_BY_ID(id));
    return response.json();
  },

  // Create a new order
  async create(payload: OrderPayload): Promise<ApiResponse<Order>> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Update an order
  async update(id: string, payload: OrderPayload): Promise<ApiResponse<Order>> {
    const response = await fetch(PATHS.ORDER_BY_ID(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  },

  // Delete an order (soft delete)
  async delete(id: string): Promise<ApiResponse<Order>> {
    const response = await fetch(PATHS.ORDER_BY_ID(id), {
      method: 'DELETE',
    });
    return response.json();
  },
};
