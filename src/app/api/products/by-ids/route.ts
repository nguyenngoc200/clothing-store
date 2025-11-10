import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types/database';
import { ApiResponse } from '@/lib/utils/ApiResponse';

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return ApiResponse.badRequest('Invalid product IDs');
    }

    const supabase = await createClient();

    // Select product fields and join category title as `category` object
    const { data: products, error } = await supabase
      .from('product')
      .select('*, category:category_id(title)')
      .in('id', ids);

    if (error) {
      console.error('Error fetching products by IDs:', error);
      return ApiResponse.error({ message: error.message, error });
    }

    // Return products in the same order as the input IDs
    const orderedProducts = ids
      .map((id: string) => products?.find((product: Product) => product.id === id))
      .filter(Boolean);

    return ApiResponse.success(orderedProducts as Product[]);
  } catch (error) {
    console.error('Error in /api/products/by-ids:', error);
    return ApiResponse.error({ message: 'Internal server error', error });
  }
}
