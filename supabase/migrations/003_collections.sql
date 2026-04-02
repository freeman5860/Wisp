-- Collections table
CREATE TABLE collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL CHECK (char_length(name) <= 50),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 200),
  cover_url   TEXT,
  is_public   BOOLEAN DEFAULT true,
  card_count  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Junction table
CREATE TABLE collection_cards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  card_id       UUID NOT NULL REFERENCES mood_cards(id) ON DELETE CASCADE,
  position      INTEGER DEFAULT 0,
  added_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(collection_id, card_id)
);

-- Indexes
CREATE INDEX idx_collections_user ON collections(user_id, created_at DESC);
CREATE INDEX idx_collections_public ON collections(created_at DESC) WHERE is_public = true;
CREATE INDEX idx_collection_cards_collection ON collection_cards(collection_id, position);
CREATE INDEX idx_collection_cards_card ON collection_cards(card_id);

-- Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read public collections" ON collections
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can read own collections" ON collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);

-- collection_cards follows parent collection ownership
CREATE POLICY "Anyone can read cards in public collections" ON collection_cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND (is_public = true OR user_id = auth.uid()))
  );

CREATE POLICY "Collection owners can manage cards" ON collection_cards
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND user_id = auth.uid())
  );

CREATE POLICY "Collection owners can remove cards" ON collection_cards
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM collections WHERE id = collection_id AND user_id = auth.uid())
  );

-- Trigger: auto-update card_count
CREATE OR REPLACE FUNCTION update_collection_card_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collections SET card_count = card_count + 1 WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collections SET card_count = card_count - 1 WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collection_cards_count
  AFTER INSERT OR DELETE ON collection_cards
  FOR EACH ROW EXECUTE FUNCTION update_collection_card_count();

-- Reuse updated_at trigger
CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
