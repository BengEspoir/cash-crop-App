-- AgriculNet — Notifications

CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type            notification_type NOT NULL,
  title           VARCHAR(200) NOT NULL,
  content         TEXT NOT NULL,
  
  link            VARCHAR(300), -- Internal link to redirect to
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  
  metadata        JSONB NOT NULL DEFAULT '{}',
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
