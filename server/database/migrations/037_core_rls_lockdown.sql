-- Lock all application tables behind the Express service boundary.
-- The browser uses Supabase only for OAuth; marketplace data is served by the API.

DO $$
DECLARE
  table_name TEXT;
  application_tables CONSTANT TEXT[] := ARRAY[
    'users',
    'farmer_profiles',
    'buyer_profiles',
    'reseller_profiles',
    'tokens',
    'otps',
    'regions',
    'crops',
    'listings',
    'listing_images',
    'inquiries',
    'conversations',
    'messages',
    'orders',
    'payments',
    'inspections',
    'logistics',
    'logistics_position_updates',
    'logistics_rate_zones',
    'trucks',
    'export_documents',
    'disputes',
    'reviews',
    'commissions',
    'notifications',
    'saved_listings',
    'field_agents',
    'audit_logs',
    'activity_events',
    'support_tickets',
    'support_ticket_messages',
    'dashboard_preferences',
    'account_recovery_contacts',
    'account_contact_changes'
  ];
BEGIN
  FOREACH table_name IN ARRAY application_tables LOOP
    IF TO_REGCLASS(FORMAT('public.%I', table_name)) IS NULL THEN
      RAISE EXCEPTION 'Required application table public.% is missing', table_name;
    END IF;

    EXECUTE FORMAT('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE FORMAT('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE FORMAT('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC', table_name);

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
      EXECUTE FORMAT('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM anon', table_name);
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      EXECUTE FORMAT('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM authenticated', table_name);
    END IF;
  END LOOP;
END;
$$;

COMMENT ON SCHEMA public IS
  'AgriculNet application tables are private to the service-role API; browser roles receive no table privileges.';
