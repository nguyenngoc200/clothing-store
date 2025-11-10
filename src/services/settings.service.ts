import PATHS from '@/constants/paths';
import type { SettingRow } from '@/types/settings';

export async function getSettings(tab: string) {
  try {
    const res = await fetch(PATHS.SETTINGS_WITH_TAB(tab));
    if (!res.ok) return null;
    const data: SettingRow[] = await res.json();
    return data;
  } catch (error) {
    console.error('getSettings error:', error);
    throw error;
  }
}

export async function upsertSetting(payload: { key: string; tab: string; data: unknown }) {
  try {
    const res = await fetch(PATHS.SETTINGS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to upsert setting');
    return res.json();
  } catch (error) {
    console.error('upsertSetting error:', error);
    throw error;
  }
}

export async function deleteSetting(payload: { key: string; tab: string }) {
  try {
    const res = await fetch(PATHS.SETTINGS, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to delete setting');
    return res.json();
  } catch (error) {
    console.error('deleteSetting error:', error);
    throw error;
  }
}
