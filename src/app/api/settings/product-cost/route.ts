import { createClient } from '@/lib/supabase/server';
import { TABLES } from '@/constants/tables';
import { ApiResponse } from '@/lib/utils/ApiResponse';
import type { ProductCostSettingRow } from '@/types/settings';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.PRODUCT_COST_SETTINGS)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return ApiResponse.error({ message: error.message, status: 500, error });

  return ApiResponse.success(data as ProductCostSettingRow[]);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id } = body;

  const supabase = await createClient();
  // If id provided, perform upsert by id (update). Otherwise insert a new row.
  if (id) {
    // sanitize incoming payload: map camelCase -> snake_case and parse JSON strings
    const {
      title,
      advertising,
      packaging,
      shipping,
      personnel,
      rent,
      profitMargin,
      profit_margin,
    } = body as Record<string, unknown>;

    const parseMaybeJSON = (v: unknown) => {
      if (v == null) return null;
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return v;
        }
      }
      return v;
    };

    const payload = {
      id,
      title: title ?? null,
      advertising: parseMaybeJSON(advertising),
      packaging: parseMaybeJSON(packaging),
      shipping: parseMaybeJSON(shipping),
      personnel: parseMaybeJSON(personnel),
      rent: parseMaybeJSON(rent),
      profit_margin: profitMargin ?? profit_margin ?? 30,
    } as Record<string, unknown>;

    const { error } = await supabase
      .from(TABLES.PRODUCT_COST_SETTINGS)
      .upsert([payload], { onConflict: 'id' });
    if (error) return ApiResponse.error({ message: error.message, status: 500, error });
    return ApiResponse.success({});
  }

  // insert new
  // sanitize payload for insert as well
  const { title, advertising, packaging, shipping, personnel, rent, profitMargin, profit_margin } =
    body as Record<string, unknown>;

  const parseMaybeJSON = (v: unknown) => {
    if (v == null) return null;
    if (typeof v === 'string') {
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    }
    return v;
  };

  const insertPayload = {
    title: title ?? null,
    advertising: parseMaybeJSON(advertising),
    packaging: parseMaybeJSON(packaging),
    shipping: parseMaybeJSON(shipping),
    personnel: parseMaybeJSON(personnel),
    rent: parseMaybeJSON(rent),
    profit_margin: profitMargin ?? profit_margin ?? 30,
    tab: body.tab ?? null,
  } as Record<string, unknown>;

  const { error } = await supabase.from(TABLES.PRODUCT_COST_SETTINGS).insert([insertPayload]);
  if (error) return ApiResponse.error({ message: error.message, status: 500, error });

  return ApiResponse.success({});
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { id } = body;
  if (!id) return ApiResponse.badRequest('Missing id');

  const supabase = await createClient();
  const { error } = await supabase.from(TABLES.PRODUCT_COST_SETTINGS).delete().eq('id', id);
  if (error) return ApiResponse.error({ message: error.message, status: 500, error });

  return ApiResponse.success({});
}
