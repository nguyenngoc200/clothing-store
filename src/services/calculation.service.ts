import PATHS from '@/constants/paths';
import type { CalculationSettingRow } from '@/types/settings';

export const calculationService = {
  async getAll() {
    try {
      const res = await fetch(PATHS.SETTINGS_CALCULATION);
      if (!res.ok) throw new Error('Failed to fetch calculation settings');
      const json = await res.json();
      return json as { success: boolean; data: CalculationSettingRow[] };
    } catch (error) {
      console.error('calculationService.getAll error:', error);
      throw error;
    }
  },

  async upsert(payload: { tab?: string; data: unknown } | { data: Record<string, unknown> }) {
    try {
      const res = await fetch(PATHS.SETTINGS_CALCULATION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to upsert calculation setting');
      return res.json();
    } catch (error) {
      console.error('calculationService.upsert error:', error);
      throw error;
    }
  },
};
