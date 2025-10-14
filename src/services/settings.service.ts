export type SettingRow = {
  id: string;
  key: string;
  tab: string;
  data: unknown;
  created_at: string;
  updated_at: string;
};

export async function getSettings(tab: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/settings?tab=${encodeURIComponent(tab)}`,
  );
  if (!res.ok) return null;
  const data: SettingRow[] = await res.json();
  return data;
}

export async function upsertSetting(payload: { key: string; tab: string; data: unknown }) {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to upsert setting');
  return res.json();
}
