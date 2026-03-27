export type MoodType =
  | 'joy'
  | 'melancholy'
  | 'calm'
  | 'anxious'
  | 'nostalgic'
  | 'excited'
  | 'lonely'
  | 'grateful'
  | 'dreamy'
  | 'rebellious';

export interface MoodConfig {
  type: MoodType;
  label: string;
  emoji: string;
  color: string;
  description: string;
}
