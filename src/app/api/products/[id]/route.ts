import { NextRequest } from 'next/server';
import { TABLES } from '@/constants/tables';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';

// GET /api/products/[id] - Get a single product
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(TABLES.PRODUCT)
      .select('*, category:category_id(*), discount:discount_id(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      return ApiResponse.notFound('Product not found');
    }

    return ApiResponse.success(data);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLES.PRODUCT)
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, category:category_id(*), discount:discount_id(*)')
      .single();

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success(data);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}

// DELETE /api/products/[id] - Soft delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLES.PRODUCT)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success({ data, message: 'Product deleted successfully' });
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
