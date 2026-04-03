import { NextRequest, NextResponse } from 'next/server';
import { enhanceImage } from '@/lib/ai/gemini';
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

    const { imageBase64, mimeType, mood, style } = await request.json();

    if (!imageBase64 || !mood) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }

    const enhancedBuffer = await enhanceImage({
      imageBase64,
      mimeType: mimeType || 'image/jpeg',
      mood,
      style,
    });

    // Return as data URL so the frontend can use it directly
    const enhancedBase64 = enhancedBuffer.toString('base64');
    const enhancedUrl = `data:image/png;base64,${enhancedBase64}`;

    return NextResponse.json({ enhancedUrl });
  } catch (error) {
    console.error('Enhance error:', error);
    return NextResponse.json({ error: 'AI 增强失败' }, { status: 500 });
  }
}
