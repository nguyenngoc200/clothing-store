import { NextRequest } from 'next/server';

import { TABLES } from '@/constants/tables';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');

    let query = supabase
      .from(TABLES.PRODUCT)
      .select('*, category:category_id(*), discount:discount_id(*)', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
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

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from(TABLES.PRODUCT)
      .insert(body)
      .select('*, category:category_id(*), discount:discount_id(*)')
      .single();

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success(data, 201);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
