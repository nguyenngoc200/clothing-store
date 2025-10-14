import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types/database';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid product IDs' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: products, error } = await supabase.from('product').select('*').in('id', ids);

    if (error) {
      console.error('Error fetching products by IDs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return products in the same order as the input IDs
    const orderedProducts = ids
      .map((id: string) => products?.find((product: Product) => product.id === id))
      .filter(Boolean);

    return NextResponse.json(orderedProducts);
  } catch (error) {
    console.error('Error in /api/products/by-ids:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
