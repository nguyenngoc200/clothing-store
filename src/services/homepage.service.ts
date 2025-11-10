import PATHS from '@/constants/paths';
import type { HomepageApiPayload } from '@/types/homepage';
import type { HomepageSettingRow } from '@/types/settings';

export const homepageService = {
  async getAll() {
    try {
      const res = await fetch(PATHS.SETTINGS_HOMEPAGE);

      if (!res.ok) throw new Error('Failed to fetch homepage settings');
      const json = await res.json();
      return json as { success: boolean; data: HomepageSettingRow[] };
    } catch (error) {
      console.error('homepageService.getAll error:', error);
      throw error;
    }
  },

  async upsert(payload: HomepageApiPayload) {
    try {
      const res = await fetch(PATHS.SETTINGS_HOMEPAGE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to upsert homepage setting');
      return res.json();
    } catch (error) {
      console.error('homepageService.upsert error:', error);
      throw error;
    }
  },

  async delete(key: string) {
    try {
      const res = await fetch(PATHS.SETTINGS_HOMEPAGE, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) throw new Error('Failed to delete homepage setting');
      return res.json();
    } catch (error) {
      console.error('homepageService.delete error:', error);
      throw error;
    }
  },
};
