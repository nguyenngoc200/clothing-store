import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types/database';

/**
 * Server-side product service functions
 * These functions use Supabase server client and can only be used in Server Components
 */
export const productServerService = {
  /**
   * Get products by array of IDs
   * @param ids - Array of product IDs
   * @returns Array of products in the same order as input IDs
   */
  async getByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];

    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('product').select('*').in('id', ids);

      if (error) {
        console.error('Error fetching products by IDs:', error);
        return [];
      }

      if (!data) return [];

      // Order products according to input IDs array
      return ids
        .map((id) => data.find((product) => product.id === id))
        .filter((product): product is Product => product !== undefined);
    } catch (error) {
      console.error('Error fetching products by IDs:', error);
      return [];
    }
  },

  /**
   * Get a single product by ID
   * @param id - Product ID
   * @returns Product or null
   */
  async getById(id: string): Promise<Product | null> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('product').select('*').eq('id', id).single();

      if (error) {
        console.error('Error fetching product by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  },

  /**
   * Get all products with optional category filter
   * @param categoryId - Optional category ID to filter by
   * @returns Array of products
   */
  async getAll(categoryId?: string): Promise<Product[]> {
    try {
      const supabase = await createClient();
      let query = supabase.from('product').select('*');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },
};
