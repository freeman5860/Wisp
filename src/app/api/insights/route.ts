import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const baseDate = new Date(dateStr);

    // Calculate date range
    let startDate: Date;
    let endDate: Date;

    if (period === 'week') {
      const day = baseDate.getDay();
      startDate = new Date(baseDate);
      startDate.setDate(baseDate.getDate() - (day === 0 ? 6 : day - 1)); // Monday
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
    } else if (period === 'year') {
      startDate = new Date(baseDate.getFullYear(), 0, 1);
      endDate = new Date(baseDate.getFullYear() + 1, 0, 1);
    } else {
      startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Fetch all cards in range
    const { data: cards } = await supabase
      .from('mood_cards')
      .select('mood, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    const allCards = cards || [];

    // Summary
    const moodCounts: Record<string, number> = {};
    const daySet = new Set<string>();
    for (const c of allCards) {
      moodCounts[c.mood] = (moodCounts[c.mood] || 0) + 1;
      daySet.add(new Date(c.created_at).toISOString().split('T')[0]);
    }

    const topEntry = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

    // Streak: consecutive days with cards (ending today or recent)
    let streak = 0;
    if (daySet.size > 0) {
      const allUserCards = await supabase
        .from('mood_cards')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(365);

      const allDays = new Set(
        (allUserCards.data || []).map((c) =>
          new Date(c.created_at).toISOString().split('T')[0]
        )
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const check = new Date(today);

      // Allow starting from today or yesterday
      const todayStr = check.toISOString().split('T')[0];
      if (!allDays.has(todayStr)) {
        check.setDate(check.getDate() - 1);
      }

      while (allDays.has(check.toISOString().split('T')[0])) {
        streak++;
        check.setDate(check.getDate() - 1);
      }
    }

    // Distribution
    const distribution = Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);

    // Calendar: group by date, pick dominant mood per day
    const dayMoods: Record<string, Record<string, number>> = {};
    for (const c of allCards) {
      const day = new Date(c.created_at).toISOString().split('T')[0];
      if (!dayMoods[day]) dayMoods[day] = {};
      dayMoods[day][c.mood] = (dayMoods[day][c.mood] || 0) + 1;
    }

    const calendar = Object.entries(dayMoods).map(([date, moods]) => {
      const top = Object.entries(moods).sort((a, b) => b[1] - a[1])[0];
      const totalCount = Object.values(moods).reduce((s, n) => s + n, 0);
      return { date, mood: top[0], count: totalCount };
    });

    // Trend: group by date bucket
    const trendMap: Record<string, Record<string, number>> = {};
    for (const c of allCards) {
      let bucket: string;
      if (period === 'year') {
        const d = new Date(c.created_at);
        bucket = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        bucket = new Date(c.created_at).toISOString().split('T')[0];
      }
      if (!trendMap[bucket]) trendMap[bucket] = {};
      trendMap[bucket][c.mood] = (trendMap[bucket][c.mood] || 0) + 1;
    }

    const trend = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, moods]) => ({ date, ...moods }));

    return NextResponse.json({
      summary: {
        total_cards: allCards.length,
        streak_days: streak,
        top_mood: topEntry?.[0] || null,
      },
      distribution,
      calendar,
      trend,
    });
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
