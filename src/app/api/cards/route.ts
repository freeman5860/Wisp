import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createCardSchema = z.object({
  image_url: z.string().url(),
  thumbnail_url: z.string().url(),
  original_url: z.string().url(),
  mood: z.enum([
    'joy', 'melancholy', 'calm', 'anxious', 'nostalgic',
    'excited', 'lonely', 'grateful', 'dreamy', 'rebellious',
  ]),
  filter_id: z.string().nullable().optional(),
  caption: z.string().min(1).max(200),
  is_public: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createCardSchema.parse(body);

    const { data, error } = await supabase
      .from('mood_cards')
      .insert({
        ...parsed,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Create card error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const mood = searchParams.get('mood');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const mine = searchParams.get('mine') === 'true';

    let query = supabase
      .from('mood_cards')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (mine) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });
      query = query.eq('user_id', user.id);
    } else {
      query = query.eq('is_public', true);
    }

    if (mood) {
      query = query.eq('mood', mood);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch cards error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
