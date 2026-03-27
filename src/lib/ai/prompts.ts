import type { MoodType } from '@/types/mood';

export function buildCaptionPrompt(mood: string, moodType: MoodType): string {
  return `你是一个情绪共鸣文案师。用户此刻的心情是「${mood}」。

请为这个情绪写一句文案，要求：
- 一句话，15-30个字
- 不要鸡汤，不要说教，不要正能量口号
- 像是自己对自己说的话，或者发在朋友圈不会尴尬的那种
- 要有画面感，有温度，有一点小文艺但不做作
- 可以用比喻、通感，可以口语化
- 中文为主，可以夹杂一两个英文词

只输出文案本身，不要引号，不要解释。`;
}
