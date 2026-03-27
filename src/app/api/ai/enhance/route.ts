import { NextRequest, NextResponse } from 'next/server';
import { enhanceImage } from '@/lib/ai/replicate';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { imageUrl, mood, style } = await request.json();

    if (!imageUrl || !mood) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }

    const enhancedUrl = await enhanceImage({ imageUrl, mood, style });

    return NextResponse.json({ enhancedUrl });
  } catch (error) {
    console.error('Enhance error:', error);
    return NextResponse.json({ error: 'AI 增强失败' }, { status: 500 });
  }
}
