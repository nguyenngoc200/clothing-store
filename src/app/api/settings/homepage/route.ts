import { TABLES } from '@/constants/tables';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import { homepageRowDataSchema } from '@/schemas/homepage';
import type { HomepageApiPayload } from '@/types/homepage';
import type { HomepageSettingRow } from '@/types/settings';

/**
 * GET /api/settings/homepage?tab=...  -> returns rows (optionally filtered by tab)
 */
export async function GET(request: Request) {
  const supabase = await createClient();

  try {
    const url = new URL(request.url);
    const tab = url.searchParams.get('tab');

    let query = supabase.from(TABLES.HOMEPAGE_SETTINGS).select('*');
    if (tab) query = query.eq('tab', tab);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return ApiResponse.error({ message: error.message, status: 500, error });

    return ApiResponse.success(data as HomepageSettingRow[]);
  } catch (err) {
    return ApiResponse.error({
      message: 'Failed to fetch homepage settings',
      status: 500,
      error: err,
    });
  }
}

/**
 * POST body: { tab: string, data: unknown }
 * - Requires `tab` for single-row upserts.
 * - For legacy aggregated payloads, accept { data: { sections: [...] } } and split into per-tab rows.
 */
export async function POST(request: Request) {
  try {
    const body: HomepageApiPayload = await request.json();

    const supabase = await createClient();

    // Single tab upsert (preferred): use a single upsert call so DB will insert or update.
    const parsed = homepageRowDataSchema.safeParse(body?.data?.sections);

    if (!parsed.success)
      return ApiResponse.badRequest('Invalid data payload for homepage setting (tab)');

    const { error: upsertErr } = await supabase
      .from(TABLES.HOMEPAGE_SETTINGS)
      .upsert(body?.data?.sections ?? [], { onConflict: 'tab' });

    if (upsertErr)
      return ApiResponse.error({ message: upsertErr.message, status: 500, error: upsertErr });

    return ApiResponse.success({});
  } catch (err) {
    return ApiResponse.error({
      message: 'Failed to upsert homepage settings',
      status: 500,
      error: err,
    });
  }
}
