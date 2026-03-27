-- Wisp initial schema
-- Run this in Supabase SQL Editor

-- Mood type enum
CREATE TYPE mood_type AS ENUM (
  'joy', 'melancholy', 'calm', 'anxious', 'nostalgic',
  'excited', 'lonely', 'grateful', 'dreamy', 'rebellious'
);

-- Mood cards table
CREATE TABLE mood_cards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  original_url  TEXT NOT NULL,
  mood          mood_type NOT NULL,
  filter_id     TEXT,
  caption       TEXT NOT NULL,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  location_name TEXT,
  is_public     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_cards_user ON mood_cards(user_id, created_at DESC);
CREATE INDEX idx_cards_geo ON mood_cards(latitude, longitude) WHERE is_public = true;
CREATE INDEX idx_cards_public ON mood_cards(created_at DESC) WHERE is_public = true;

-- Row Level Security
ALTER TABLE mood_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public cards" ON mood_cards
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can read own cards" ON mood_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON mood_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON mood_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON mood_cards
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mood_cards_updated_at
  BEFORE UPDATE ON mood_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('mood-images', 'mood-images', true);

-- Storage policies
CREATE POLICY "Anyone can read mood images" ON storage.objects
  FOR SELECT USING (bucket_id = 'mood-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'mood-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'mood-images' AND auth.uid()::text = (storage.foldername(name))[1]);
