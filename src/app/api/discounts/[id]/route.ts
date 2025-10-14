import { NextRequest } from 'next/server';
import { TABLES } from '@/constants/tables';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';

// GET /api/discounts/[id] - Get a single discount
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(TABLES.DISCOUNT)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      return ApiResponse.notFound('Discount not found');
    }

    return ApiResponse.success(data);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}

// PUT /api/discounts/[id] - Update a discount
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLES.DISCOUNT)
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success(data);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}

// DELETE /api/discounts/[id] - Soft delete a discount
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from(TABLES.DISCOUNT)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return ApiResponse.badRequest(error.message);
    }

    return ApiResponse.success({ data, message: 'Discount deleted successfully' });
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
