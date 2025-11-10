import PATHS from '@/constants/paths';
import type { ApiListResponse, ApiResponse, Category, CategoryPayload } from '@/types/database';

export const categoryService = {
  // Get all categories
  async getAll(): Promise<ApiListResponse<Category>> {
    try {
      const response = await fetch(PATHS.CATEGORIES);
      const payload = await response.json();

      if (payload == null) return { data: [] } as ApiListResponse<Category>;
      if (Array.isArray(payload.data)) return payload as ApiListResponse<Category>;
      if (payload.success && payload.data) {
        const inner = payload.data;
        const innerAny = inner as unknown as { data?: Category[]; count?: number };
        if (Array.isArray(innerAny.data))
          return { data: innerAny.data, count: innerAny.count } as ApiListResponse<Category>;
        if (Array.isArray(inner)) return { data: inner } as ApiListResponse<Category>;
      }
      return { data: [] } as ApiListResponse<Category>;
    } catch (error) {
      // Log and return an empty list as a safe fallback for callers
      console.error('[categoryService.getAll] failed', error);
      return { data: [] } as ApiListResponse<Category>;
    }
  },

  // Get a single category by ID
  async getById(id: string): Promise<ApiResponse<Category>> {
    try {
      const response = await fetch(PATHS.CATEGORY_BY_ID(id));
      return (await response.json()) as ApiResponse<Category>;
    } catch (error) {
      console.error('[categoryService.getById] failed', error);
      return {
        success: false,
        message: 'Failed to fetch category',
        error,
      } as unknown as ApiResponse<Category>;
    }
  },

  // Create a new category
  async create(payload: CategoryPayload): Promise<ApiResponse<Category>> {
    try {
      const response = await fetch(PATHS.CATEGORIES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return (await response.json()) as ApiResponse<Category>;
    } catch (error) {
      console.error('[categoryService.create] failed', error);
      return {
        success: false,
        message: 'Failed to create category',
        error,
      } as unknown as ApiResponse<Category>;
    }
  },

  // Update a category
  async update(id: string, payload: CategoryPayload): Promise<ApiResponse<Category>> {
    try {
      const response = await fetch(PATHS.CATEGORY_BY_ID(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      return (await response.json()) as ApiResponse<Category>;
    } catch (error) {
      console.error('[categoryService.update] failed', error);
      return {
        success: false,
        message: 'Failed to update category',
        error,
      } as unknown as ApiResponse<Category>;
    }
  },

  // Delete a category (soft delete)
  async delete(id: string): Promise<ApiResponse<Category>> {
    try {
      const response = await fetch(PATHS.CATEGORY_BY_ID(id), {
        method: 'DELETE',
      });
      return (await response.json()) as ApiResponse<Category>;
    } catch (error) {
      console.error('[categoryService.delete] failed', error);
      return {
        success: false,
        message: 'Failed to delete category',
        error,
      } as unknown as ApiResponse<Category>;
    }
  },
};
