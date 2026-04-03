import type { MoodType } from './mood';

export interface MoodCard {
  id: string;
  user_id: string;
  image_url: string;
  thumbnail_url: string;
  original_url: string;
  mood: MoodType;
  filter_id: string | null;
  caption: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
