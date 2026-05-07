-- AgriculNet — Field Agent Assignments

CREATE TABLE IF NOT EXISTS field_agents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  assigned_region VARCHAR(100),
  specialization  TEXT[], -- e.g. ["Cocoa", "Coffee"]
  
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

DROP TRIGGER IF EXISTS field_agents_updated_at ON field_agents;
CREATE TRIGGER field_agents_updated_at
  BEFORE UPDATE ON field_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
