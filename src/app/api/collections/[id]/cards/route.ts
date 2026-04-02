import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const addCardSchema = z.object({
  card_id: z.string().uuid(),
});

const removeCardSchema = z.object({
  card_id: z.string().uuid(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get card IDs in order
    const { data: links, error: linksError } = await supabase
      .from('collection_cards')
      .select('card_id')
      .eq('collection_id', id)
      .order('position', { ascending: true })
      .order('added_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (linksError) throw linksError;
    if (!links || links.length === 0) return NextResponse.json([]);

    const cardIds = links.map((l) => l.card_id);
    const { data: cards, error } = await supabase
      .from('mood_cards')
      .select('*')
      .in('id', cardIds);

    if (error) throw error;

    // Preserve order from collection_cards
    const cardMap = new Map((cards || []).map((c) => [c.id, c]));
    const ordered = cardIds.map((id) => cardMap.get(id)).filter(Boolean);

    return NextResponse.json(ordered);
  } catch (error) {
    console.error('Get collection cards error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const body = await request.json();
    const { card_id } = addCardSchema.parse(body);

    // Get max position
    const { data: maxPos } = await supabase
      .from('collection_cards')
      .select('position')
      .eq('collection_id', id)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = (maxPos?.position ?? -1) + 1;

    const { data, error } = await supabase
      .from('collection_cards')
      .insert({ collection_id: id, card_id, position })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '卡片已在合集中' }, { status: 409 });
      }
      throw error;
    }

    // Update cover if first card
    if (position === 0) {
      const { data: card } = await supabase
        .from('mood_cards')
        .select('thumbnail_url')
        .eq('id', card_id)
        .single();

      if (card) {
        await supabase
          .from('collections')
          .update({ cover_url: card.thumbnail_url })
          .eq('id', id);
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Add card to collection error:', error);
    return NextResponse.json({ error: '添加失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const body = await request.json();
    const { card_id } = removeCardSchema.parse(body);

    const { error } = await supabase
      .from('collection_cards')
      .delete()
      .eq('collection_id', id)
      .eq('card_id', card_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Remove card from collection error:', error);
    return NextResponse.json({ error: '移除失败' }, { status: 500 });
  }
}
