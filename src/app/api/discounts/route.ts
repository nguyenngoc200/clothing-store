import { NextRequest } from 'next/server';
import { TABLES } from '@/constants/tables';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';

// GET /api/discounts - Get all discounts
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error, count } = await supabase
      .from(TABLES.DISCOUNT)
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success({ data, count });
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}

// POST /api/discounts - Create a new discount
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase.from(TABLES.DISCOUNT).insert(body).select().single();

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success(data, 201);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
