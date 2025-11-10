import PATHS from '@/constants/paths';
import { serverFetch } from '@/lib/serverFetch';
import type { Product } from '@/types/database';
import type { GetAllOptions, GetByIdOptions, GetByIdsOptions } from '@/types/serviceOptions';

export const productServerService = {
  async getByIds(options?: GetByIdsOptions): Promise<Product[]> {
    const ids = options?.ids || [];

    if (!ids || ids.length === 0) return [];

    try {
      const sf = await serverFetch(options?.cookieHeader);

      const res = await fetch(PATHS.PRODUCTS_BY_IDS_API, {
        method: 'POST',
        headers: sf?.headers || {},
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        console.error('Error fetching products by IDs from API:', res.statusText);
        return [];
      }

      const resData = await res.json();

      if (!Array.isArray(resData)) return [];

      return resData as Product[];
    } catch (error) {
      console.error('Error fetching products by IDs:', error);
      return [];
    }
  },

  async getById(options?: GetByIdOptions): Promise<Product | null> {
    try {
      const baseUrl = PATHS.PRODUCT_BY_ID(options?.id || '');
      const sf = await serverFetch(options?.cookieHeader);

      const res = await fetch(baseUrl, { method: 'GET', headers: sf?.headers || {} });

      if (!res.ok) {
        console.error('Error fetching product by ID from API:', res.statusText);
        return null;
      }

      const json = await res.json();

      if (json?.data) return json.data as Product;
      return json as Product;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  },

  async getAll(options?: GetAllOptions): Promise<Product[]> {
    const { categoryId, cookieHeader } = options || {};

    try {
      const url = PATHS.PRODUCTS_BY_CATEGORY(categoryId);

      const sf = await serverFetch(cookieHeader);
      const res = await fetch(url, { method: 'GET', headers: sf?.headers || {} });

      if (!res.ok) {
        console.error('Error fetching products from API:', res.statusText);
        return [];
      }

      const json = await res.json();

      if (json?.data) return json.data as Product[];
      return json as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },
};
