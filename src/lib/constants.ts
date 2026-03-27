import type { MoodConfig, MoodType } from '@/types/mood';

export const APP_NAME = 'Wisp';
export const APP_DESCRIPTION = '不教你怎么生活，只在你想记录的那一刻，轻轻托住你的情绪';

export const MOODS: MoodConfig[] = [
  { type: 'joy', label: '开心', emoji: '😊', color: '#FFD166', description: '阳光洒进来的瞬间' },
  { type: 'melancholy', label: '忧郁', emoji: '🌧️', color: '#7B8CDE', description: '有些情绪需要淋一场雨' },
  { type: 'calm', label: '平静', emoji: '🍃', color: '#88C9A1', description: '风刚好，心刚好' },
  { type: 'anxious', label: '焦虑', emoji: '😮‍💨', color: '#E07A5F', description: '说不清的不安' },
  { type: 'nostalgic', label: '怀旧', emoji: '📷', color: '#D4A574', description: '突然想起那年的味道' },
  { type: 'excited', label: '兴奋', emoji: '✨', color: '#FF6B9D', description: '心跳快了半拍' },
  { type: 'lonely', label: '孤独', emoji: '🌙', color: '#9B8EC2', description: '一个人也不是不好' },
  { type: 'grateful', label: '感恩', emoji: '🤲', color: '#F2CC8F', description: '谢谢这一刻的存在' },
  { type: 'dreamy', label: '梦幻', emoji: '💭', color: '#C8B6FF', description: '半梦半醒之间' },
  { type: 'rebellious', label: '叛逆', emoji: '🔥', color: '#EF4444', description: '管他呢' },
];

export function getMoodConfig(type: MoodType): MoodConfig {
  return MOODS.find((m) => m.type === type)!;
}
