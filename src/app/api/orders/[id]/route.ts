import { NextRequest } from 'next/server';

import { TABLES } from '@/constants/tables';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';

// GET /api/orders/[id] - Get a single order
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    // First fetch the order row
    const { data: orderData, error: orderErr } = await supabase
      .from(TABLES.ORDER)
      .select('*, customer:customer_id(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (orderErr || !orderData) {
      return ApiResponse.notFound('Order not found');
    }

    // Then fetch all order_product rows for this order and attach them
    const { data: items, error: itemsErr } = await supabase
      .from(TABLES.ORDER_PRODUCT)
      .select('id, order_id, product_id, quantity, unit_price, total_price, discount_id')
      .eq('order_id', id)
      .is('deleted_at', null);

    if (itemsErr) {
      // return order without items if items query fails
      console.error('Failed to load order items', itemsErr);
      return ApiResponse.success({ ...orderData, order_product: [] });
    }

    return ApiResponse.success({ ...orderData, order_product: items });
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}

// PUT /api/orders/[id] - Update an order
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { items, ...orderPayload } = body || {};

    // compute total similar to POST
    const computedTotal =
      items && Array.isArray(items) && items.length > 0
        ? items.reduce(
            (sum: number, it: { quantity?: number; unit_price?: number; total_price?: number }) => {
              const q = it.quantity ?? 1;
              const unit = it.unit_price ?? 0;
              const t = typeof it.total_price === 'number' ? it.total_price : q * unit;
              return sum + (t ?? 0);
            },
            0,
          )
        : Number(orderPayload.total_amount ?? 0);

    // Update the order row
    const { data, error } = await supabase
      .from(TABLES.ORDER)
      .update({
        ...orderPayload,
        total_amount: computedTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, customer:customer_id(*)')
      .single();

    if (error || !data) {
      return ApiResponse.badRequest(error?.message ?? 'Failed to update order');
    }

    // If items provided, replace existing items
    if (items && Array.isArray(items)) {
      // Fetch existing product ids for this order so we can reset statuses
      const { data: existingRows } = await supabase
        .from(TABLES.ORDER_PRODUCT)
        .select('product_id')
        .eq('order_id', id)
        .is('deleted_at', null);
      const existingIds: string[] = (existingRows || []).map(
        (r: { product_id: string }) => r.product_id,
      );

      // Remove existing order_product entries for this order
      const { error: delErr } = await supabase
        .from(TABLES.ORDER_PRODUCT)
        .delete()
        .eq('order_id', id);

      if (delErr) {
        return ApiResponse.badRequest(delErr.message);
      }

      // Validate items early to provide a clear error when product_id is missing
      const hasInvalid = items.some(
        (it: { product_id?: string }) => !it.product_id || String(it.product_id).trim() === '',
      );
      if (hasInvalid) {
        return ApiResponse.badRequest('One or more items are missing product_id');
      }

      const rows = items.map(
        (it: {
          product_id: string;
          discount_id?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        }) => {
          const productId = it.product_id && it.product_id.trim() !== '' ? it.product_id : null;
          const discountId =
            it.discount_id && String(it.discount_id).trim() !== '' ? it.discount_id : null;

          if (!productId) {
            throw new Error('Invalid product_id for one of the items');
          }

          return {
            order_id: id,
            product_id: productId,
            discount_id: discountId,
            quantity: it.quantity ?? 1,
            unit_price: it.unit_price ?? 0,
            total_price: it.total_price ?? (it.quantity ?? 1) * (it.unit_price ?? 0),
            created_at: new Date().toISOString(),
          };
        },
      );

      // Insert rows and return inserted ids so we can set order_product_id
      const { data: insertedRows, error: insertErr } = await supabase
        .from(TABLES.ORDER_PRODUCT)
        .insert(rows)
        .select('id, product_id');

      if (insertErr) {
        return ApiResponse.badRequest(insertErr.message);
      }

      const newIds: string[] = Array.from(
        new Set((rows || []).map((r: { product_id: string }) => r.product_id)),
      );

      // Update order_product_id on order
      if (insertedRows && insertedRows.length > 0) {
        const firstId = insertedRows[0].id;
        const { error: updErr } = await supabase
          .from(TABLES.ORDER)
          .update({ order_product_id: firstId })
          .eq('id', id);
        if (updErr) {
          return ApiResponse.badRequest(updErr.message);
        }
      }

      // Compute differences to update product.status accordingly
      try {
        const removed = existingIds.filter((x) => !newIds.includes(x));
        const added = newIds.filter((x) => !existingIds.includes(x));
        const targetStatus: 'in_stock' | 'in_transit' | 'sold' =
          (orderPayload as { status?: 'in_stock' | 'in_transit' | 'sold' }).status ??
          data.status ??
          'in_transit';

        if (added.length > 0) {
          await supabase.from(TABLES.PRODUCT).update({ status: targetStatus }).in('id', added);
        }
        if (removed.length > 0) {
          await supabase.from(TABLES.PRODUCT).update({ status: 'in_stock' }).in('id', removed);
        }
      } catch (statusErr) {
        console.error('Failed to update product statuses after order update', statusErr);
      }
    } else {
      // No items provided — if status changed, update all linked products to new status
      if ((orderPayload as { status?: string }).status) {
        try {
          const { data: linkedRows } = await supabase
            .from(TABLES.ORDER_PRODUCT)
            .select('product_id')
            .eq('order_id', id)
            .is('deleted_at', null);
          const linkedIds: string[] = (linkedRows || []).map(
            (r: { product_id: string }) => r.product_id,
          );
          if (linkedIds.length > 0) {
            const newStatus: 'in_stock' | 'in_transit' | 'sold' =
              (orderPayload as { status?: 'in_stock' | 'in_transit' | 'sold' }).status ??
              'in_transit';
            await supabase.from(TABLES.PRODUCT).update({ status: newStatus }).in('id', linkedIds);
          }
        } catch (errStatus) {
          console.error(
            'Failed to update product statuses for status-only order update',
            errStatus,
          );
        }
      }

      // Ensure product statuses are synchronized with order status in all cases.
      // This handles scenarios where items were provided (and potentially replaced)
      // and also when items weren't provided but status changed. It is idempotent.
      try {
        const desiredStatus = (orderPayload as { status?: 'in_stock' | 'in_transit' | 'sold' })
          .status;
        if (desiredStatus) {
          const { data: currentRows, error: curErr } = await supabase
            .from(TABLES.ORDER_PRODUCT)
            .select('product_id')
            .eq('order_id', id)
            .is('deleted_at', null);

          if (!curErr && currentRows && currentRows.length > 0) {
            const productIds: string[] = currentRows.map(
              (r: { product_id: string }) => r.product_id,
            );
            await supabase
              .from(TABLES.PRODUCT)
              .update({ status: desiredStatus })
              .in('id', productIds);
          }
        }
      } catch (syncErr) {
        console.error('Failed to synchronize product statuses after order update', syncErr);
      }
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

    // Find linked products for this order so we can reset their statuses
    try {
      const { data: linkedRows, error: linkedErr } = await supabase
        .from(TABLES.ORDER_PRODUCT)
        .select('product_id')
        .eq('order_id', id)
        .is('deleted_at', null);

      if (linkedErr) {
        console.error('Failed to fetch linked order_product rows before delete', linkedErr);
      } else {
        const productIds: string[] = (linkedRows || []).map(
          (r: { product_id: string }) => r.product_id,
        );
        if (productIds.length > 0) {
          try {
            await supabase.from(TABLES.PRODUCT).update({ status: 'in_stock' }).in('id', productIds);
          } catch (statusErr) {
            console.error('Failed to reset product statuses during order delete', statusErr);
          }
        }

        // Remove order_product links
        try {
          await supabase.from(TABLES.ORDER_PRODUCT).delete().eq('order_id', id);
        } catch (delLinksErr) {
          console.error('Failed to delete order_product links during order delete', delLinksErr);
        }
      }
    } catch (err) {
      console.error('Unexpected error while preparing order delete cleanup', err);
    }

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
