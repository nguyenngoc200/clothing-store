import { createClient } from '@/lib/supabase/server';
import SETTINGS from '@/constants/settings';
import { TABLES } from '@/constants/tables';
import { ApiResponse } from '@/lib/utils/ApiResponse';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tab = url.searchParams.get('tab') || undefined;

  const supabase = await createClient();

  // Map tabs to their respective DB tables. Homepage remains in homepage_settings.
  const tableForTab: Record<string, string> = {
    [SETTINGS.HOMEPAGE.tab]: TABLES.HOMEPAGE_SETTINGS,
    [SETTINGS.CALCULATION.tab]: TABLES.CALCULATION_SETTINGS,
    [SETTINGS.PRODUCT_COST.tab]: TABLES.PRODUCT_COST_SETTINGS,
  };

  const table = tableForTab[tab || ''] || TABLES.HOMEPAGE_SETTINGS;

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('tab', tab)
    .order('created_at', { ascending: false });

  if (error) {
    return ApiResponse.error({ message: error.message, status: 500, error });
  }

  return ApiResponse.success(data as unknown[]);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { key, tab, data } = body;

  if (!key || !tab) {
    return ApiResponse.badRequest('Missing key or tab');
  }

  const supabase = await createClient();

  // Select destination table by tab
  const tableForTab: Record<string, string> = {
    [SETTINGS.HOMEPAGE.tab]: TABLES.HOMEPAGE_SETTINGS,
    [SETTINGS.CALCULATION.tab]: TABLES.CALCULATION_SETTINGS,
    [SETTINGS.PRODUCT_COST.tab]: TABLES.PRODUCT_COST_SETTINGS,
  };

  const table = tableForTab[tab] || TABLES.HOMEPAGE_SETTINGS;

  // Upsert a single row identified by key
  let upsertPayload: Record<string, unknown> = { key, tab };

  if (table === TABLES.PRODUCT_COST_SETTINGS) {
    // Expect `data` to be an object possibly containing advertising, packaging, shipping,
    // personnel, rent, profitMargin. Map them to dedicated columns.
    const payloadData = typeof data === 'object' && data ? data : {};
    upsertPayload = {
      ...upsertPayload,
      // support a human-friendly title field
      title: payloadData.title ?? null,
      advertising: payloadData.advertising ?? null,
      packaging: payloadData.packaging ?? null,
      shipping: payloadData.shipping ?? null,
      personnel: payloadData.personnel ?? null,
      rent: payloadData.rent ?? null,
      profit_margin: payloadData.profitMargin ?? payloadData.profit_margin ?? 30,
    };
  } else {
    upsertPayload = { ...upsertPayload, data };
  }

  const { error } = await supabase.from(table).upsert([upsertPayload], { onConflict: 'key' });

  if (error) {
    return ApiResponse.error({ message: error.message, status: 500, error });
  }

  return ApiResponse.success({});
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { key, tab } = body;

  if (!key || !tab) {
    return ApiResponse.badRequest('Missing key or tab');
  }

  const supabase = await createClient();

  const tableForTab: Record<string, string> = {
    [SETTINGS.HOMEPAGE.tab]: TABLES.HOMEPAGE_SETTINGS,
    [SETTINGS.CALCULATION.tab]: TABLES.CALCULATION_SETTINGS,
    [SETTINGS.PRODUCT_COST.tab]: TABLES.PRODUCT_COST_SETTINGS,
  };

  const table = tableForTab[tab] || TABLES.HOMEPAGE_SETTINGS;

  const { error } = await supabase.from(table).delete().eq('key', key);

  if (error) {
    return ApiResponse.error({ message: error.message, status: 500, error });
  }

  return ApiResponse.success({});
}
