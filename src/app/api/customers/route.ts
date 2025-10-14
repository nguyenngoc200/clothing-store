import { TABLES } from '@/constants/tables';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';

// GET /api/customers - Get all customers
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error, count } = await supabase
      .from(TABLES.CUSTOMER)
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

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase.from(TABLES.CUSTOMER).insert(body).select().single();

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success(data, 201);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
