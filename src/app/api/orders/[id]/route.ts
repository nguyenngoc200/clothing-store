import { NextRequest } from 'next/server';
import { TABLES } from '@/constants/tables';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';

// GET /api/orders/[id] - Get a single order
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(TABLES.ORDER)
      .select('*, customer:customer_id(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      return ApiResponse.notFound('Order not found');
    }

    return ApiResponse.success(data);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}

// PUT /api/orders/[id] - Update an order
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLES.ORDER)
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, customer:customer_id(*)')
      .single();

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success(data);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}

// DELETE /api/orders/[id] - Soft delete an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLES.ORDER)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success({ data, message: 'Order deleted successfully' });
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
