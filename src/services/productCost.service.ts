import type { ProductCostSettingRow } from '@/types/settings';
import PATHS from '@/constants/paths';

export const productCostService = {
  async getAll() {
    try {
      const res = await fetch(PATHS.SETTINGS_PRODUCT_COST);
      if (!res.ok) throw new Error('Failed to fetch product cost settings');
      const json = await res.json();
      return json as { success: boolean; data: ProductCostSettingRow[] };
    } catch (error) {
      console.error('productCostService.getAll error:', error);
      throw error;
    }
  },

  async upsert(payload: Record<string, unknown>) {
    try {
      const res = await fetch(PATHS.SETTINGS_PRODUCT_COST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to upsert product cost setting');
      return res.json();
    } catch (error) {
      console.error('productCostService.upsert error:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const res = await fetch(PATHS.SETTINGS_PRODUCT_COST, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete product cost setting');
      return res.json();
    } catch (error) {
      console.error('productCostService.delete error:', error);
      throw error;
    }
  },
};
