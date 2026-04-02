import type { MoodType } from './mood';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface ProfileStats {
  total_cards: number;
  top_mood: MoodType | null;
  days_active: number;
  public_cards: number;
}

export interface ProfileWithStats extends Profile {
  stats: ProfileStats;
}
