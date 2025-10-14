import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tab = url.searchParams.get('tab') || undefined;

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('homepage_settings')
    .select('*')
    .eq('tab', tab)
    .order('created_at', { ascending: false });

  console.log('data: ', data);
  console.log('error: ', error);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { key, tab, data } = body;

  if (!key || !tab) {
    return NextResponse.json({ error: 'Missing key or tab' }, { status: 400 });
  }

  const supabase = await createServerClient();

  // Upsert a single row identified by key
  const { error } = await supabase.from('homepage_settings').upsert(
    [
      {
        key,
        tab,
        data,
      },
    ],
    { onConflict: 'key' },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
