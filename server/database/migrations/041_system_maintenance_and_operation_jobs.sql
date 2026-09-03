-- Persisted maintenance state and audited backup/restore job metadata.

CREATE TABLE IF NOT EXISTS system_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  maintenance_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  maintenance_message TEXT NOT NULL DEFAULT 'AgriculNet is currently under maintenance. Some functionalities may be temporarily unavailable. Please try again shortly.',
  maintenance_started_at TIMESTAMPTZ,
  maintenance_started_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO system_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS system_operation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation VARCHAR(20) NOT NULL CHECK (operation IN ('backup', 'restore')),
  status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
  requested_by UUID NOT NULL REFERENCES users(id),
  source_backup_id UUID REFERENCES system_operation_jobs(id),
  storage_bucket TEXT,
  storage_path TEXT,
  checksum_sha256 TEXT,
  size_bytes BIGINT,
  error_code VARCHAR(100),
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_operation_jobs_created
  ON system_operation_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_operation_jobs_status
  ON system_operation_jobs(operation, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_operation_jobs_one_active
  ON system_operation_jobs(operation)
  WHERE status IN ('queued', 'running');

DROP TRIGGER IF EXISTS system_settings_updated_at ON system_settings;
CREATE TRIGGER system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS system_operation_jobs_updated_at ON system_operation_jobs;
CREATE TRIGGER system_operation_jobs_updated_at
  BEFORE UPDATE ON system_operation_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE system_operation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_operation_jobs FORCE ROW LEVEL SECURITY;

REVOKE ALL ON system_settings, system_operation_jobs FROM PUBLIC, anon, authenticated;
GRANT ALL ON system_settings, system_operation_jobs TO service_role;

NOTIFY pgrst, 'reload schema';
