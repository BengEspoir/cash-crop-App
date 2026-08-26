-- Bind authentication proofs to one operation and contact, and consume them atomically.
-- Existing unbound verification/reset credentials intentionally become invalid after this migration.

ALTER TABLE tokens
  ADD COLUMN IF NOT EXISTS operation VARCHAR(64),
  ADD COLUMN IF NOT EXISTS target_hash VARCHAR(64);

ALTER TABLE otps
  ADD COLUMN IF NOT EXISTS operation VARCHAR(64),
  ADD COLUMN IF NOT EXISTS target_hash VARCHAR(64);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tokens_bound_proof_pair_check'
  ) THEN
    ALTER TABLE tokens
      ADD CONSTRAINT tokens_bound_proof_pair_check
      CHECK ((operation IS NULL) = (target_hash IS NULL));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'otps_bound_proof_pair_check'
  ) THEN
    ALTER TABLE otps
      ADD CONSTRAINT otps_bound_proof_pair_check
      CHECK ((operation IS NULL) = (target_hash IS NULL));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tokens_bound_proof
  ON tokens(token_hash, type, operation, target_hash)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_otps_bound_proof
  ON otps(user_id, purpose, operation, target_hash, created_at DESC)
  WHERE verified_at IS NULL;

CREATE OR REPLACE FUNCTION consume_auth_token(
  p_token_hash TEXT,
  p_type token_type,
  p_operation TEXT,
  p_target_hash TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  operation VARCHAR,
  target_hash VARCHAR,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  UPDATE tokens AS token
  SET used_at = NOW()
  WHERE token.token_hash = p_token_hash
    AND token.type = p_type
    AND token.operation = p_operation
    AND token.target_hash IS NOT NULL
    AND (p_target_hash IS NULL OR token.target_hash = p_target_hash)
    AND (p_user_id IS NULL OR token.user_id = p_user_id)
    AND token.used_at IS NULL
    AND token.expires_at > NOW()
  RETURNING
    token.id,
    token.user_id,
    token.operation,
    token.target_hash,
    token.expires_at,
    token.created_at;
END;
$$;

CREATE OR REPLACE FUNCTION claim_auth_otp_attempt(
  p_user_id UUID,
  p_purpose otp_purpose,
  p_operation TEXT,
  p_target_hash TEXT,
  p_max_attempts INTEGER
)
RETURNS TABLE (
  claim_status TEXT,
  otp_id UUID,
  otp_user_id UUID,
  otp_hash VARCHAR,
  attempts INTEGER,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  proof otps%ROWTYPE;
BEGIN
  SELECT candidate.*
  INTO proof
  FROM otps AS candidate
  WHERE candidate.user_id = p_user_id
    AND candidate.purpose = p_purpose
    AND candidate.operation = p_operation
    AND candidate.target_hash = p_target_hash
    AND candidate.verified_at IS NULL
  ORDER BY candidate.created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT
      'not_found'::TEXT, NULL::UUID, NULL::UUID, NULL::VARCHAR,
      NULL::INTEGER, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  IF proof.expires_at <= NOW() THEN
    RETURN QUERY SELECT
      'expired'::TEXT, proof.id, proof.user_id, NULL::VARCHAR,
      proof.attempts, proof.expires_at;
    RETURN;
  END IF;

  IF proof.attempts >= GREATEST(1, p_max_attempts) THEN
    RETURN QUERY SELECT
      'max_attempts'::TEXT, proof.id, proof.user_id, NULL::VARCHAR,
      proof.attempts, proof.expires_at;
    RETURN;
  END IF;

  UPDATE otps
  SET attempts = otps.attempts + 1
  WHERE otps.id = proof.id
  RETURNING otps.* INTO proof;

  RETURN QUERY SELECT
    'claimed'::TEXT, proof.id, proof.user_id, proof.otp_hash,
    proof.attempts, proof.expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION consume_auth_otp(p_otp_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH consumed AS (
    UPDATE otps
    SET verified_at = NOW()
    WHERE id = p_otp_id
      AND verified_at IS NULL
      AND expires_at > NOW()
    RETURNING id
  )
  SELECT EXISTS (SELECT 1 FROM consumed);
$$;

REVOKE ALL ON FUNCTION consume_auth_token(TEXT, token_type, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION claim_auth_otp_attempt(UUID, otp_purpose, TEXT, TEXT, INTEGER)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION consume_auth_otp(UUID)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION consume_auth_token(TEXT, token_type, TEXT, TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION claim_auth_otp_attempt(UUID, otp_purpose, TEXT, TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION consume_auth_otp(UUID) TO service_role;

COMMENT ON FUNCTION consume_auth_token(TEXT, token_type, TEXT, TEXT, UUID)
  IS 'Atomically consumes one unexpired token bound to an authentication operation and target.';
COMMENT ON FUNCTION claim_auth_otp_attempt(UUID, otp_purpose, TEXT, TEXT, INTEGER)
  IS 'Atomically enforces an OTP attempt limit and claims one attempt for an exact operation and target.';
COMMENT ON FUNCTION consume_auth_otp(UUID)
  IS 'Atomically marks a successfully verified OTP as consumed.';
