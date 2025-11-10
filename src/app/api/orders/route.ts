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
      .select('*, customer:customer_id(*), order_product:order_product_id(*)', { count: 'exact' })
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

    // Extract items from payload so we don't try to insert a non-existent
    // "items" column into the order table. Items will be inserted into
    // the order_product join table after the order is created. Compute total_amount
    // from provided items so the order row reflects the correct sum.
    const { items, ...orderPayload } = body || {};

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

    const { data: orderData, error: orderError } = await supabase
      .from(TABLES.ORDER)
      .insert({
        ...orderPayload,
        total_amount: computedTotal,
        created_at: new Date().toISOString(),
      })
      .select('*, customer:customer_id(*)')
      .single();

    if (orderError) {
      return ApiResponse.badRequest(orderError.message);
    }

    // If there are items, bulk insert them into order_product with the
    // newly-created order id. If item insert fails, attempt to rollback
    // the created order to avoid partial writes.
    if (items && Array.isArray(items) && items.length > 0) {
      // Validate items: product_id must be present and non-empty
      const hasInvalid = items.some(
        (it: { product_id?: string }) => !it.product_id || String(it.product_id).trim() === '',
      );
      if (hasInvalid) {
        // rollback created order
        try {
          await supabase.from(TABLES.ORDER).delete().eq('id', orderData.id);
        } catch (rbErr) {
          console.error('Failed to rollback order after validation failure', rbErr);
        }
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
          // sanitize UUID-like fields: convert empty strings to null to avoid postgres UUID parse errors
          const productId = it.product_id && it.product_id.trim() !== '' ? it.product_id : null;
          const discountId =
            it.discount_id && String(it.discount_id).trim() !== '' ? it.discount_id : null;

          if (!productId) {
            throw new Error('Invalid product_id for one of the items');
          }

          return {
            order_id: orderData.id,
            product_id: productId,
            discount_id: discountId,
            quantity: it.quantity ?? 1,
            unit_price: it.unit_price ?? 0,
            total_price: it.total_price ?? (it.quantity ?? 1) * (it.unit_price ?? 0),
            created_at: new Date().toISOString(),
          };
        },
      );

      // Insert items and return their ids so we can reference the first
      // inserted order_product id on the order record (order_product_id).
      const { data: insertedRows, error: itemsError } = await supabase
        .from(TABLES.ORDER_PRODUCT)
        .insert(rows)
        .select('id');

      if (itemsError) {
        // attempt rollback of the order we just created
        try {
          await supabase.from(TABLES.ORDER).delete().eq('id', orderData.id);
        } catch (rollbackErr) {
          console.error('Failed to rollback order after items insert error', rollbackErr);
        }

        return ApiResponse.badRequest(itemsError.message);
      }

      // If we have at least one inserted order_product, set order_product_id on order
      if (insertedRows && insertedRows.length > 0) {
        const firstId = insertedRows[0].id;
        const { error: updErr } = await supabase
          .from(TABLES.ORDER)
          .update({ order_product_id: firstId })
          .eq('id', orderData.id);

        if (updErr) {
          // rollback order and inserted items
          try {
            const ids = insertedRows.map((r: { id: string }) => r.id);
            await supabase.from(TABLES.ORDER_PRODUCT).delete().in('id', ids);
            await supabase.from(TABLES.ORDER).delete().eq('id', orderData.id);
          } catch (rollbackErr) {
            console.error('Rollback failed after order_product_id update failure', rollbackErr);
          }

          return ApiResponse.badRequest(updErr.message);
        }
        // Also update product.status for all products added to this order
        try {
          const productIds: string[] = Array.from(
            new Set(rows.map((r: { product_id: string }) => r.product_id)),
          );
          if (productIds.length > 0) {
            const orderStatus: 'in_stock' | 'in_transit' | 'sold' =
              (orderPayload as { status?: 'in_stock' | 'in_transit' | 'sold' }).status ??
              orderData.status ??
              'in_transit';
            await supabase
              .from(TABLES.PRODUCT)
              .update({ status: orderStatus })
              .in('id', productIds);
          }
        } catch (statusErr) {
          console.error('Failed to update product statuses after order create', statusErr);
        }
      }
    }

    return ApiResponse.success(orderData, 201);
  } catch (error) {
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
