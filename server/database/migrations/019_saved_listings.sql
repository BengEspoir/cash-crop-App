-- AgriculNet — Saved Listings (Favorites)

CREATE TABLE IF NOT EXISTS saved_listings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_listings_user_id ON saved_listings(user_id);
