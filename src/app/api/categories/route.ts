import { NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { TABLES } from '@/constants/tables';
import { ApiResponse } from '@/lib/utils/ApiResponse';

// GET /api/categories - Get all categories
export async function GET() {
  try {
    // Use admin client (service role) for server-side create operations so
    // RLS policies that restrict INSERT to specific roles won't block us.
    const supabase = await createClient();

    const { data, error, count } = await supabase
      .from(TABLES.CATEGORY)
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

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    const { data, error } = await supabase.from(TABLES.CATEGORY).insert(body);

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success(data, 201);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
