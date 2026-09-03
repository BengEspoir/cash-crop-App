-- Active sellers may participate in marketplace activity before identity verification.
-- Payout eligibility remains enforced by migration 043.
DO $migration$
DECLARE
  function_oid OID;
  definition TEXT;
  updated_definition TEXT;
BEGIN
  function_oid := to_regprocedure('public.transition_marketplace_quote(uuid,uuid,text,text)');
  IF function_oid IS NULL THEN
    RAISE EXCEPTION 'transition_marketplace_quote function is required before migration 044';
  END IF;

  SELECT pg_get_functiondef(function_oid) INTO definition;
  updated_definition := replace(definition,
    $sql$      IF p_target_status = 'accepted'
        AND v_farmer.identity_verification_status <> 'verified'
      THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_SELLER_NOT_ELIGIBLE';
      END IF;
    $sql$,
    ''
  );
  updated_definition := replace(updated_definition,
    $sql$      IF p_target_status = 'accepted'
        AND v_reseller.identity_verification_status <> 'verified'
      THEN
        RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'QUOTE_SELLER_NOT_ELIGIBLE';
      END IF;
    $sql$,
    ''
  );
  EXECUTE updated_definition;
END
$migration$;

DO $migration$
DECLARE
  function_oid OID;
  definition TEXT;
  updated_definition TEXT;
BEGIN
  function_oid := to_regprocedure('public.create_marketplace_order(uuid,uuid,uuid,numeric,text,boolean,numeric,text,text,text,jsonb,uuid)');
  IF function_oid IS NULL THEN
    RAISE EXCEPTION 'create_marketplace_order function is required before migration 044';
  END IF;

  SELECT pg_get_functiondef(function_oid) INTO definition;
  updated_definition := replace(definition,
    $sql$  IF NOT FOUND
    OR v_seller_verification_status <> 'verified'
    OR v_seller_user_status <> 'active'
    OR v_seller_user_role <> v_seller_role
  THEN
    $sql$,
    $sql$  IF NOT FOUND
    OR v_seller_user_status <> 'active'
    OR v_seller_user_role <> v_seller_role
  THEN
    $sql$
  );
  EXECUTE updated_definition;
END
$migration$;

COMMENT ON FUNCTION transition_marketplace_quote(UUID, UUID, TEXT, TEXT)
  IS 'Active sellers may accept quotes before identity verification; account status and ownership remain enforced.';
COMMENT ON FUNCTION create_marketplace_order(
  UUID, UUID, UUID, NUMERIC, TEXT, BOOLEAN, NUMERIC, TEXT, TEXT, TEXT, JSONB, UUID
) IS 'Creates an idempotent order for an active seller; identity verification is required later for protected payout release.';

DO $migration$
DECLARE
  function_name TEXT;
  function_oid OID;
  definition TEXT;
BEGIN
  FOREACH function_name IN ARRAY ARRAY[
    'public.get_or_create_payment_intent(uuid,uuid,uuid,numeric,text,text,jsonb)',
    'public.save_payment_provider_checkout(uuid,text,text,text,jsonb)',
    'public.reconcile_fapshi_payment(uuid,text,text,numeric,text,timestamptz,jsonb)'
  ] LOOP
    function_oid := to_regprocedure(function_name);
    IF function_oid IS NULL THEN
      RAISE EXCEPTION '% function is required before migration 044', function_name;
    END IF;

    SELECT pg_get_functiondef(function_oid) INTO definition;
    EXECUTE replace(definition, $$      AND p.identity_verification_status = 'verified'
$$, '');
  END LOOP;
END
$migration$;

NOTIFY pgrst, 'reload schema';
