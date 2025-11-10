import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/lib/utils/ApiResponse';

type Range = 'week' | 'month' | 'year';

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  // Make weeks start on Monday
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatLabel(date: Date, range: Range) {
  if (range === 'week') {
    const weekStart = startOfWeek(date);
    return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(
      weekStart.getDate(),
    ).padStart(2, '0')}`;
  }

  if (range === 'month') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  return `${date.getFullYear()}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || 'month') as Range;
    const span = Number(searchParams.get('span') || '6'); // number of units back

    const now = new Date();
    let start = new Date(now);

    if (range === 'week') {
      start.setDate(start.getDate() - span * 7);
    } else if (range === 'month') {
      start.setMonth(start.getMonth() - span);
    } else {
      start.setFullYear(start.getFullYear() - span);
    }

    // Normalize start to beginning of unit
    if (range === 'week') start = startOfWeek(start);
    else if (range === 'month') start.setDate(1);
    else start.setMonth(0, 1);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('order')
      .select('order_date, total_amount')
      .gte('order_date', start.toISOString())
      .is('deleted_at', null);

    if (error) return ApiResponse.badRequest(error.message);

    const rows: { order_date: string; total_amount: number | null }[] = data || [];

    // Build labels array from start to now
    const labels: string[] = [];
    const map = new Map<string, number>();

    const cur = new Date(start);
    while (cur <= now) {
      const label = formatLabel(cur, range);
      labels.push(label);
      map.set(label, 0);

      if (range === 'week') cur.setDate(cur.getDate() + 7);
      else if (range === 'month') cur.setMonth(cur.getMonth() + 1);
      else cur.setFullYear(cur.getFullYear() + 1);
    }

    for (const row of rows) {
      const d = new Date(row.order_date);
      const label = formatLabel(d, range);
      if (!map.has(label)) continue;
      const prev = map.get(label) || 0;
      map.set(label, prev + (row.total_amount || 0));
    }

    const series = labels.map((label) => ({ label, value: map.get(label) || 0 }));

    const total = series.reduce((s, it) => s + it.value, 0);

    return ApiResponse.success({ series, total });
  } catch (err) {
    return ApiResponse.error({ message: 'Internal server error', error: err });
  }
}
