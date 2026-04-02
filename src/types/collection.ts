export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  is_public: boolean;
  card_count: number;
  created_at: string;
  updated_at: string;
  has_card?: boolean;
}
