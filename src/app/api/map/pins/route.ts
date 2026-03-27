import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const north = parseFloat(searchParams.get('north') || '90');
    const south = parseFloat(searchParams.get('south') || '-90');
    const east = parseFloat(searchParams.get('east') || '180');
    const west = parseFloat(searchParams.get('west') || '-180');

    const { data, error } = await supabase
      .from('mood_cards')
      .select('id, latitude, longitude, mood, thumbnail_url')
      .eq('is_public', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .gte('latitude', south)
      .lte('latitude', north)
      .gte('longitude', west)
      .lte('longitude', east)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Map pins error:', error);
    return NextResponse.json({ error: '获取标记失败' }, { status: 500 });
  }
}
