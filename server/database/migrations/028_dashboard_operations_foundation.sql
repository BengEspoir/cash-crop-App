-- AgriculNet - Persistent dashboard operations foundation
-- Run after 027_reseller_marketplace_foundation.sql.

CREATE TABLE IF NOT EXISTS support_tickets (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number         VARCHAR(40) UNIQUE NOT NULL,
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_admin_id     UUID REFERENCES users(id) ON DELETE SET NULL,

  subject               VARCHAR(200) NOT NULL,
  description           TEXT NOT NULL,
  category              VARCHAR(80) NOT NULL DEFAULT 'general',
  priority              VARCHAR(20) NOT NULL DEFAULT 'normal',
  status                VARCHAR(30) NOT NULL DEFAULT 'open',

  related_entity_type   VARCHAR(80),
  related_entity_id     UUID,
  metadata              JSONB NOT NULL DEFAULT '{}',

  last_message_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at           TIMESTAMPTZ,
  closed_at             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT support_tickets_status_check
    CHECK (status IN ('open', 'in_progress', 'waiting_on_user', 'resolved', 'closed')),
  CONSTRAINT support_tickets_priority_check
    CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id       UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role     user_role NOT NULL,
  body            TEXT NOT NULL,
  internal_note   BOOLEAN NOT NULL DEFAULT FALSE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dashboard_preferences (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role                      user_role NOT NULL,
  preferences               JSONB NOT NULL DEFAULT '{}',
  notification_preferences  JSONB NOT NULL DEFAULT '{}',
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS read_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS entity_type VARCHAR(80),
  ADD COLUMN IF NOT EXISTS entity_id UUID,
  ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_priority_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_priority_check
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS actor_role user_role,
  ADD COLUMN IF NOT EXISTS action VARCHAR(120),
  ADD COLUMN IF NOT EXISTS resource_type VARCHAR(80),
  ADD COLUMN IF NOT EXISTS resource_id UUID,
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'success',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE audit_logs
SET action = COALESCE(action, event)
WHERE action IS NULL;

DROP TRIGGER IF EXISTS support_tickets_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS dashboard_preferences_updated_at ON dashboard_preferences;
CREATE TRIGGER dashboard_preferences_updated_at
  BEFORE UPDATE ON dashboard_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS notifications_updated_at ON notifications;
CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS audit_logs_updated_at ON audit_logs;
CREATE TRIGGER audit_logs_updated_at
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_preferences_user_id ON dashboard_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS support_tickets_service_role ON support_tickets;
CREATE POLICY support_tickets_service_role ON support_tickets
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS support_ticket_messages_service_role ON support_ticket_messages;
CREATE POLICY support_ticket_messages_service_role ON support_ticket_messages
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS dashboard_preferences_service_role ON dashboard_preferences;
CREATE POLICY dashboard_preferences_service_role ON dashboard_preferences
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE support_tickets IS 'Authenticated dashboard support tickets for farmers, buyers, and admins.';
COMMENT ON TABLE support_ticket_messages IS 'Conversation messages attached to support tickets.';
COMMENT ON TABLE dashboard_preferences IS 'Per-user dashboard settings and notification preferences.';
