import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('mood_cards')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '找不到卡片' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch card error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { error } = await supabase
      .from('mood_cards')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
