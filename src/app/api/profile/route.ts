import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(30).optional(),
  bio: z.string().max(200).nullable().optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

    // Get or create profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const { data: created } = await supabase
        .from('profiles')
        .insert({ id: user.id, display_name: user.email?.split('@')[0] || '' })
        .select()
        .single();
      profile = created;
    }

    // Get stats
    const { count: total_cards } = await supabase
      .from('mood_cards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const { count: public_cards } = await supabase
      .from('mood_cards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_public', true);

    const { data: moodCounts } = await supabase
      .from('mood_cards')
      .select('mood')
      .eq('user_id', user.id);

    const { data: dateCounts } = await supabase
      .from('mood_cards')
      .select('created_at')
      .eq('user_id', user.id);

    // Calculate top mood
    let top_mood = null;
    if (moodCounts && moodCounts.length > 0) {
      const counts: Record<string, number> = {};
      for (const row of moodCounts) {
        counts[row.mood] = (counts[row.mood] || 0) + 1;
      }
      top_mood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }

    // Calculate days active (unique dates)
    const uniqueDays = new Set(
      (dateCounts || []).map((r) => new Date(r.created_at).toDateString())
    );

    return NextResponse.json({
      ...profile,
      stats: {
        total_cards: total_cards || 0,
        public_cards: public_cards || 0,
        top_mood,
        days_active: uniqueDays.size,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const body = await request.json();
    const parsed = updateProfileSchema.parse(body);

    const { data, error } = await supabase
      .from('profiles')
      .update(parsed)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Update profile error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
