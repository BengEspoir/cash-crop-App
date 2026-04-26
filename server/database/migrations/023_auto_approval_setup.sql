-- AgriculNet — Auto Approval System Migration
-- Adds reviewed_at column and indexes for automatic account approval job

-- Add reviewed_at timestamp to track when accounts were approved
ALTER TABLE users ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Add index for efficient job queries
CREATE INDEX IF NOT EXISTS idx_users_status_created_at 
  ON users(status, created_at) 
  WHERE status = 'pending_review';

-- Add index for reviewed_at lookups
CREATE INDEX IF NOT EXISTS idx_users_reviewed_at 
  ON users(reviewed_at) 
  WHERE reviewed_at IS NOT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN users.reviewed_at IS 'Timestamp when account was automatically or manually approved';
