-- AgriculNet - live user activity and dashboard traffic

CREATE TABLE IF NOT EXISTS activity_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  role          user_role,
  event_type    VARCHAR(100) NOT NULL,
  path          VARCHAR(300),
  entity_type   VARCHAR(80),
  entity_id     UUID,
  metadata      JSONB NOT NULL DEFAULT '{}',
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_user_id ON activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_type ON activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON activity_events(created_at);
