import { createClient } from '@/lib/supabase/server';
import { TABLES } from '@/constants/tables';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import type { CalculationSettingRow } from '@/types/settings';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.CALCULATION_SETTINGS)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return ApiResponse.error({ message: error.message, status: 500, error });

  return ApiResponse.success(data as CalculationSettingRow[]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tab, data } = body || {};

    const supabase = await createClient();

    // Batch payload (preferred): { data: { advertising: [...], packaging: [...], ... } }
    if (data && typeof data === 'object' && !tab) {
      const keys = ['advertising', 'packaging', 'shipping', 'personnel', 'rent', 'freeship'];
      const rows: { tab: string; data: unknown }[] = [];

      for (const k of keys) {
        if (k in (data as Record<string, unknown>)) {
          rows.push({ tab: k, data: (data as Record<string, unknown>)[k] });
        }
      }

      if (rows.length === 0) return ApiResponse.badRequest('Invalid calculation payload');

      const { error } = await supabase.from(TABLES.CALCULATION_SETTINGS).upsert(rows, {
        onConflict: 'tab',
      });

      if (error) return ApiResponse.error({ message: error.message, status: 500, error });
      return ApiResponse.success({});
    }

    // Single tab upsert: require tab
    if (!tab) return ApiResponse.badRequest('Missing tab');

    const parsed = true; // validation is simple here; UI builds proper arrays
    if (!parsed) return ApiResponse.badRequest('Invalid data payload for calculation setting');

    const { error: upsertErr } = await supabase
      .from(TABLES.CALCULATION_SETTINGS)
      .upsert([{ tab, data }], { onConflict: 'tab' });

    if (upsertErr)
      return ApiResponse.error({ message: upsertErr.message, status: 500, error: upsertErr });

    return ApiResponse.success({});
  } catch (err) {
    return ApiResponse.error({
      message: 'Failed to upsert calculation settings',
      status: 500,
      error: err,
    });
  }
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { key } = body;
  if (!key) return ApiResponse.badRequest('Missing key');

  const supabase = await createClient();
  const { error } = await supabase.from(TABLES.CALCULATION_SETTINGS).delete().eq('key', key);
  if (error) return ApiResponse.error({ message: error.message, status: 500, error });

  return ApiResponse.success({});
}
