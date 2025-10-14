import { NextRequest } from 'next/server';
import { TABLES } from '@/constants/tables';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';

// GET /api/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');

    let query = supabase
      .from(TABLES.ORDER)
      .select('*, customer:customer_id(*)', { count: 'exact' })
      .is('deleted_at', null)
      .order('order_date', { ascending: false });

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error, count } = await query;

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success({ data, count });
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from(TABLES.ORDER)
      .insert(body)
      .select('*, customer:customer_id(*)')
      .single();

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success(data, 201);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
