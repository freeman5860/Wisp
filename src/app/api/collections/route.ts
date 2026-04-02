import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createCollectionSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).nullable().optional(),
  is_public: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get('mine') === 'true';
    const cardId = searchParams.get('card_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (mine) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('is_public', true);
    }

    const { data: collections, error } = await query;
    if (error) throw error;

    // If card_id provided, check which collections contain it
    if (cardId && collections && collections.length > 0) {
      const { data: links } = await supabase
        .from('collection_cards')
        .select('collection_id')
        .eq('card_id', cardId)
        .in('collection_id', collections.map((c) => c.id));

      const linkedSet = new Set((links || []).map((l) => l.collection_id));
      const enriched = collections.map((c) => ({
        ...c,
        has_card: linkedSet.has(c.id),
      }));
      return NextResponse.json(enriched);
    }

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Get collections error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const body = await request.json();
    const parsed = createCollectionSchema.parse(body);

    const { data, error } = await supabase
      .from('collections')
      .insert({ ...parsed, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Create collection error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
