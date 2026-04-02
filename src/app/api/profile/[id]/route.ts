import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // Get public stats
    const { count: total_cards } = await supabase
      .from('mood_cards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)
      .eq('is_public', true);

    const { data: moodCounts } = await supabase
      .from('mood_cards')
      .select('mood')
      .eq('user_id', id)
      .eq('is_public', true);

    const { data: dateCounts } = await supabase
      .from('mood_cards')
      .select('created_at')
      .eq('user_id', id)
      .eq('is_public', true);

    let top_mood = null;
    if (moodCounts && moodCounts.length > 0) {
      const counts: Record<string, number> = {};
      for (const row of moodCounts) {
        counts[row.mood] = (counts[row.mood] || 0) + 1;
      }
      top_mood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }

    const uniqueDays = new Set(
      (dateCounts || []).map((r) => new Date(r.created_at).toDateString())
    );

    return NextResponse.json({
      ...profile,
      stats: {
        total_cards: total_cards || 0,
        public_cards: total_cards || 0,
        top_mood,
        days_active: uniqueDays.size,
      },
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
