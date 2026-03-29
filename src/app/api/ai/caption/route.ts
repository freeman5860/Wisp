import { NextRequest, NextResponse } from 'next/server';
import { generateCaption } from '@/lib/ai/gemini';
import { buildCaptionPrompt } from '@/lib/ai/prompts';
import type { MoodType } from '@/types/mood';

export async function POST(request: NextRequest) {
  try {
    const { mood, moodType } = (await request.json()) as {
      mood: string;
      moodType: MoodType;
    };

    if (!mood || !moodType) {
      return NextResponse.json({ error: '缺少心情参数' }, { status: 400 });
    }

    const prompt = buildCaptionPrompt(mood, moodType);
    const caption = await generateCaption(prompt);

    return NextResponse.json({ caption });
  } catch (error) {
    console.error('Caption generation error:', error);
    return NextResponse.json({ error: '文案生成失败' }, { status: 500 });
  }
}
