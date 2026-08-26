-- Repair UUID resolution in already-installed SECURITY DEFINER RPCs.
-- Supabase commonly installs uuid-ossp in its managed `extensions` schema,
-- while migrations 031, 035, and 036 restricted their search_path to public.
-- Fresh installs use pg_catalog.gen_random_uuid() directly; this migration
-- safely repairs the functions that are already installed.

DO $$
DECLARE
  uuid_extension_schema TEXT;
BEGIN
  SELECT namespace.nspname
  INTO uuid_extension_schema
  FROM pg_extension e
  JOIN pg_depend d
    ON d.refclassid = 'pg_extension'::regclass
   AND d.refobjid = e.oid
   AND d.classid = 'pg_proc'::regclass
   AND d.deptype = 'e'
  JOIN pg_proc p
    ON p.oid = d.objid
  JOIN pg_namespace namespace
    ON namespace.oid = p.pronamespace
  WHERE e.extname = 'uuid-ossp'
    AND p.proname = 'uuid_generate_v4'
    AND p.pronargs = 0
  LIMIT 1;

  IF uuid_extension_schema IS NULL THEN
    RAISE EXCEPTION USING
      ERRCODE = 'P0001',
      MESSAGE = 'MIGRATION_038_UUID_GENERATOR_NOT_FOUND';
  END IF;

  IF to_regprocedure(
    'public.reconcile_fapshi_payment(uuid,text,text,numeric,text,timestamptz,jsonb)'
  ) IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'MIGRATION_031_RPC_REQUIRED';
  END IF;

  IF to_regprocedure(
    'public.create_marketplace_order(uuid,uuid,uuid,numeric,text,boolean,numeric,text,text,text,jsonb,uuid)'
  ) IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'MIGRATION_035_RPC_REQUIRED';
  END IF;

  IF to_regprocedure(
    'public.transition_logistics_shipment(uuid,text,text,text,uuid,text,text,timestamptz,jsonb,jsonb,timestamptz)'
  ) IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'MIGRATION_036_RPC_REQUIRED';
  END IF;

  EXECUTE FORMAT(
    'ALTER FUNCTION public.reconcile_fapshi_payment(uuid,text,text,numeric,text,timestamptz,jsonb) SET search_path TO pg_catalog, %I, public, pg_temp',
    uuid_extension_schema
  );

  EXECUTE FORMAT(
    'ALTER FUNCTION public.create_marketplace_order(uuid,uuid,uuid,numeric,text,boolean,numeric,text,text,text,jsonb,uuid) SET search_path TO pg_catalog, %I, public, pg_temp',
    uuid_extension_schema
  );

  EXECUTE FORMAT(
    'ALTER FUNCTION public.transition_logistics_shipment(uuid,text,text,text,uuid,text,text,timestamptz,jsonb,jsonb,timestamptz) SET search_path TO pg_catalog, %I, public, pg_temp',
    uuid_extension_schema
  );
END;
$$;

NOTIFY pgrst, 'reload schema';
