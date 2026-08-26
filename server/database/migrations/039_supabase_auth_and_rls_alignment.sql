-- Align AgriculNet identities with Supabase Auth and restore least-privilege RLS.
-- Apply after 038. Existing public.users ids remain stable; auth_user_id is the
-- external identity link used by JWT claims and policies.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_user_id
  ON public.users(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.current_public_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() ->> 'public_user_id', '')::UUID,
    (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() ->> 'user_role', ''),
    (SELECT role::TEXT FROM public.users WHERE auth_user_id = auth.uid()),
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT public.current_user_role() IN ('admin', 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  app_user public.users%ROWTYPE;
  claims JSONB;
BEGIN
  SELECT * INTO app_user
  FROM public.users
  WHERE auth_user_id = (event ->> 'user_id')::UUID;

  IF NOT FOUND THEN
    RETURN event;
  END IF;

  claims := COALESCE(event -> 'claims', '{}'::JSONB);
  claims := JSONB_SET(claims, '{user_role}', TO_JSONB(app_user.role::TEXT), TRUE);
  claims := JSONB_SET(claims, '{account_status}', TO_JSONB(app_user.status::TEXT), TRUE);
  claims := JSONB_SET(claims, '{public_user_id}', TO_JSONB(app_user.id::TEXT), TRUE);
  RETURN JSONB_SET(event, '{claims}', claims, TRUE);
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  requested_role TEXT := COALESCE(NEW.raw_user_meta_data ->> 'requested_role', 'local_buyer');
  existing_public_user_id UUID := NULLIF(NEW.raw_user_meta_data ->> 'existing_public_user_id', '')::UUID;
  app_role public.user_role;
  app_user_id UUID;
BEGIN
  IF existing_public_user_id IS NOT NULL THEN
    UPDATE public.users
    SET auth_user_id = NEW.id,
        email = COALESCE(email, NULLIF(NEW.email, '')),
        phone = COALESCE(phone, NULLIF(NEW.phone, '')),
        email_verified = email_verified OR NEW.email_confirmed_at IS NOT NULL,
        phone_verified = phone_verified OR NEW.phone_confirmed_at IS NOT NULL,
        updated_at = NOW()
    WHERE id = existing_public_user_id;

    IF FOUND THEN
      RETURN NEW;
    END IF;
  END IF;

  IF requested_role NOT IN ('farmer', 'reseller', 'local_buyer', 'international_buyer') THEN
    requested_role := 'local_buyer';
  END IF;
  app_role := requested_role::public.user_role;

  INSERT INTO public.users (
    id, auth_user_id, role, status, first_name, last_name, phone, email,
    phone_verified, email_verified, country
  )
  VALUES (
    NEW.id,
    NEW.id,
    app_role,
    'pending_verification'::public.user_status,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'first_name', ''), 'AgriculNet'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'last_name', ''), 'User'),
    COALESCE(NULLIF(NEW.phone, ''), NULLIF(NEW.raw_user_meta_data ->> 'phone', '')),
    NULLIF(NEW.email, ''),
    NEW.phone_confirmed_at IS NOT NULL,
    NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'country', ''), 'Cameroon')
  )
  ON CONFLICT (id) DO UPDATE
    SET auth_user_id = EXCLUDED.auth_user_id,
        email = COALESCE(public.users.email, EXCLUDED.email),
        phone = COALESCE(public.users.phone, EXCLUDED.phone)
  RETURNING id INTO app_user_id;

  IF app_role = 'farmer'::public.user_role THEN
    INSERT INTO public.farmer_profiles(user_id) VALUES (app_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF app_role = 'reseller'::public.user_role THEN
    INSERT INTO public.reseller_profiles(user_id) VALUES (app_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    INSERT INTO public.buyer_profiles(user_id, buyer_type)
    VALUES (
      app_user_id,
      CASE WHEN app_role = 'international_buyer'::public.user_role
        THEN 'international'::public.buyer_type
        ELSE 'local'::public.buyer_type
      END
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  UPDATE public.users
  SET email = COALESCE(NULLIF(NEW.email, ''), email),
      phone = COALESCE(NULLIF(NEW.phone, ''), phone),
      email_verified = NEW.email_confirmed_at IS NOT NULL,
      phone_verified = phone_verified OR NEW.phone_confirmed_at IS NOT NULL,
      status = CASE
        WHEN status = 'pending_verification'::public.user_status
          AND NEW.email_confirmed_at IS NOT NULL
          AND (phone_verified OR NEW.phone_confirmed_at IS NOT NULL)
          AND role IN ('local_buyer'::public.user_role, 'international_buyer'::public.user_role)
          THEN 'active'::public.user_status
        WHEN status = 'pending_verification'::public.user_status
          AND NEW.email_confirmed_at IS NOT NULL
          AND (phone_verified OR NEW.phone_confirmed_at IS NOT NULL)
          AND role IN ('farmer'::public.user_role, 'reseller'::public.user_role)
          THEN 'pending_identity_verification'::public.user_status
        ELSE status
      END,
      updated_at = NOW()
  WHERE auth_user_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email, phone, email_confirmed_at, phone_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_updated();

REVOKE ALL ON FUNCTION public.custom_access_token_hook(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(JSONB) TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON TABLE public.users TO supabase_auth_admin;

REVOKE ALL ON FUNCTION public.current_public_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_public_user_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO anon, authenticated, service_role;

-- Table privileges are necessary before RLS can evaluate policies. Atomic
-- commerce tables intentionally receive read-only authenticated privileges.
GRANT SELECT ON public.regions, public.crops, public.listings, public.listing_images,
  public.farmer_profiles, public.reseller_profiles TO anon;

REVOKE INSERT, UPDATE, DELETE ON public.users, public.farmer_profiles,
  public.buyer_profiles, public.reseller_profiles, public.listings,
  public.listing_images, public.inquiries, public.conversations, public.messages,
  public.notifications, public.saved_listings, public.support_tickets,
  public.support_ticket_messages, public.dashboard_preferences,
  public.account_recovery_contacts, public.account_contact_changes FROM authenticated;

GRANT SELECT ON public.users, public.farmer_profiles, public.buyer_profiles,
  public.reseller_profiles, public.listings, public.listing_images,
  public.inquiries, public.conversations, public.messages, public.notifications,
  public.saved_listings, public.support_tickets, public.support_ticket_messages,
  public.dashboard_preferences, public.account_recovery_contacts,
  public.account_contact_changes TO authenticated;

GRANT SELECT ON public.regions, public.crops, public.orders, public.payments,
  public.logistics, public.logistics_position_updates, public.logistics_rate_zones,
  public.trucks, public.inspections, public.export_documents, public.disputes,
  public.reviews, public.commissions, public.activity_events, public.audit_logs
  TO authenticated;

-- Replace any previous alignment policies idempotently.
DO $$
DECLARE
  policy_row RECORD;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND policyname LIKE 'agriculnet_%'
  LOOP
    EXECUTE FORMAT('DROP POLICY %I ON %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  END LOOP;
END $$;

CREATE POLICY agriculnet_users_self_or_admin ON public.users
  FOR SELECT TO authenticated
  USING (id = public.current_public_user_id() OR public.current_user_is_admin());
CREATE POLICY agriculnet_users_update_self_or_admin ON public.users
  FOR UPDATE TO authenticated
  USING (id = public.current_public_user_id() OR public.current_user_is_admin())
  WITH CHECK (id = public.current_public_user_id() OR public.current_user_is_admin());

CREATE POLICY agriculnet_farmer_profiles_public ON public.farmer_profiles
  FOR SELECT TO anon, authenticated
  USING (identity_verification_status = 'verified' OR user_id = public.current_public_user_id() OR public.current_user_is_admin());
CREATE POLICY agriculnet_farmer_profiles_owner_write ON public.farmer_profiles
  FOR ALL TO authenticated
  USING (user_id = public.current_public_user_id() OR public.current_user_is_admin())
  WITH CHECK (user_id = public.current_public_user_id() OR public.current_user_is_admin());

CREATE POLICY agriculnet_reseller_profiles_public ON public.reseller_profiles
  FOR SELECT TO anon, authenticated
  USING (identity_verification_status = 'verified' OR user_id = public.current_public_user_id() OR public.current_user_is_admin());
CREATE POLICY agriculnet_reseller_profiles_owner_write ON public.reseller_profiles
  FOR ALL TO authenticated
  USING (user_id = public.current_public_user_id() OR public.current_user_is_admin())
  WITH CHECK (user_id = public.current_public_user_id() OR public.current_user_is_admin());

CREATE POLICY agriculnet_buyer_profiles_owner ON public.buyer_profiles
  FOR ALL TO authenticated
  USING (user_id = public.current_public_user_id() OR public.current_user_is_admin())
  WITH CHECK (user_id = public.current_public_user_id() OR public.current_user_is_admin());

CREATE POLICY agriculnet_listings_public_read ON public.listings
  FOR SELECT TO anon, authenticated
  USING (
    status = 'active'::public.listing_status
    OR public.current_user_is_admin()
    OR farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = public.current_public_user_id())
    OR reseller_id IN (SELECT id FROM public.reseller_profiles WHERE user_id = public.current_public_user_id())
  );
CREATE POLICY agriculnet_listings_seller_write ON public.listings
  FOR ALL TO authenticated
  USING (
    public.current_user_is_admin()
    OR farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = public.current_public_user_id())
    OR reseller_id IN (SELECT id FROM public.reseller_profiles WHERE user_id = public.current_public_user_id())
  )
  WITH CHECK (
    public.current_user_is_admin()
    OR farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = public.current_public_user_id())
    OR reseller_id IN (SELECT id FROM public.reseller_profiles WHERE user_id = public.current_public_user_id())
  );

CREATE POLICY agriculnet_listing_images_visible ON public.listing_images
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id));
CREATE POLICY agriculnet_listing_images_owner_write ON public.listing_images
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_id AND (
      public.current_user_is_admin()
      OR l.farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = public.current_public_user_id())
      OR l.reseller_id IN (SELECT id FROM public.reseller_profiles WHERE user_id = public.current_public_user_id())
    )
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_id AND (
      public.current_user_is_admin()
      OR l.farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = public.current_public_user_id())
      OR l.reseller_id IN (SELECT id FROM public.reseller_profiles WHERE user_id = public.current_public_user_id())
    )
  ));

CREATE POLICY agriculnet_inquiries_participant ON public.inquiries
  FOR ALL TO authenticated
  USING (
    public.current_user_is_admin()
    OR buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = public.current_public_user_id())
    OR farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = public.current_public_user_id())
    OR reseller_id IN (SELECT id FROM public.reseller_profiles WHERE user_id = public.current_public_user_id())
  )
  WITH CHECK (
    public.current_user_is_admin()
    OR buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = public.current_public_user_id())
    OR farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = public.current_public_user_id())
    OR reseller_id IN (SELECT id FROM public.reseller_profiles WHERE user_id = public.current_public_user_id())
  );

CREATE POLICY agriculnet_conversations_participant ON public.conversations
  FOR ALL TO authenticated
  USING (participant_1 = public.current_public_user_id() OR participant_2 = public.current_public_user_id() OR public.current_user_is_admin())
  WITH CHECK (participant_1 = public.current_public_user_id() OR participant_2 = public.current_public_user_id() OR public.current_user_is_admin());
CREATE POLICY agriculnet_messages_participant ON public.messages
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id = conversation_id
      AND (c.participant_1 = public.current_public_user_id() OR c.participant_2 = public.current_public_user_id() OR public.current_user_is_admin())
  ))
  WITH CHECK (sender_id = public.current_public_user_id() OR public.current_user_is_admin());

CREATE POLICY agriculnet_orders_participant_read ON public.orders
  FOR SELECT TO authenticated
  USING (
    public.current_user_is_admin()
    OR buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = public.current_public_user_id())
    OR farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = public.current_public_user_id())
    OR reseller_id IN (SELECT id FROM public.reseller_profiles WHERE user_id = public.current_public_user_id())
  );
CREATE POLICY agriculnet_payments_participant_read ON public.payments
  FOR SELECT TO authenticated
  USING (payer_id = public.current_public_user_id() OR payee_id = public.current_public_user_id() OR public.current_user_is_admin());
CREATE POLICY agriculnet_logistics_participant_read ON public.logistics
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (
    public.current_user_is_admin()
    OR o.buyer_id IN (SELECT id FROM public.buyer_profiles WHERE user_id = public.current_public_user_id())
    OR o.farmer_id IN (SELECT id FROM public.farmer_profiles WHERE user_id = public.current_public_user_id())
    OR o.reseller_id IN (SELECT id FROM public.reseller_profiles WHERE user_id = public.current_public_user_id())
  )));
CREATE POLICY agriculnet_logistics_positions_participant_read ON public.logistics_position_updates
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.logistics l WHERE l.id = logistics_id));

CREATE POLICY agriculnet_notifications_owner ON public.notifications
  FOR ALL TO authenticated
  USING (user_id = public.current_public_user_id() OR public.current_user_is_admin())
  WITH CHECK (user_id = public.current_public_user_id() OR public.current_user_is_admin());
CREATE POLICY agriculnet_saved_listings_owner ON public.saved_listings
  FOR ALL TO authenticated
  USING (user_id = public.current_public_user_id() OR public.current_user_is_admin())
  WITH CHECK (user_id = public.current_public_user_id() OR public.current_user_is_admin());
CREATE POLICY agriculnet_dashboard_preferences_owner ON public.dashboard_preferences
  FOR ALL TO authenticated
  USING (user_id = public.current_public_user_id() OR public.current_user_is_admin())
  WITH CHECK (user_id = public.current_public_user_id() OR public.current_user_is_admin());
CREATE POLICY agriculnet_recovery_contacts_owner ON public.account_recovery_contacts
  FOR ALL TO authenticated
  USING (user_id = public.current_public_user_id() OR public.current_user_is_admin())
  WITH CHECK (user_id = public.current_public_user_id() OR public.current_user_is_admin());
CREATE POLICY agriculnet_contact_changes_owner ON public.account_contact_changes
  FOR ALL TO authenticated
  USING (user_id = public.current_public_user_id() OR public.current_user_is_admin())
  WITH CHECK (user_id = public.current_public_user_id() OR public.current_user_is_admin());

CREATE POLICY agriculnet_support_tickets_owner ON public.support_tickets
  FOR ALL TO authenticated
  USING (user_id = public.current_public_user_id() OR assigned_admin_id = public.current_public_user_id() OR public.current_user_is_admin())
  WITH CHECK (user_id = public.current_public_user_id() OR public.current_user_is_admin());
CREATE POLICY agriculnet_support_messages_owner ON public.support_ticket_messages
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND (t.user_id = public.current_public_user_id() OR public.current_user_is_admin())))
  WITH CHECK (sender_id = public.current_public_user_id() OR public.current_user_is_admin());

-- Admin-only read surfaces.
CREATE POLICY agriculnet_admin_inspections ON public.inspections FOR SELECT TO authenticated USING (public.current_user_is_admin());
CREATE POLICY agriculnet_admin_documents ON public.export_documents FOR SELECT TO authenticated USING (public.current_user_is_admin());
CREATE POLICY agriculnet_admin_disputes ON public.disputes FOR SELECT TO authenticated USING (public.current_user_is_admin());
CREATE POLICY agriculnet_admin_reviews ON public.reviews FOR SELECT TO authenticated USING (public.current_user_is_admin());
CREATE POLICY agriculnet_admin_commissions ON public.commissions FOR SELECT TO authenticated USING (public.current_user_is_admin());
CREATE POLICY agriculnet_admin_activity ON public.activity_events FOR SELECT TO authenticated USING (public.current_user_is_admin());
CREATE POLICY agriculnet_admin_audit ON public.audit_logs FOR SELECT TO authenticated USING (public.current_user_is_admin());
CREATE POLICY agriculnet_rate_zones_read ON public.logistics_rate_zones FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY agriculnet_trucks_admin_read ON public.trucks FOR SELECT TO authenticated USING (public.current_user_is_admin());

COMMENT ON COLUMN public.users.auth_user_id IS
  'Supabase Auth identity. public.users.id remains the stable AgriculNet domain identifier.';
COMMENT ON FUNCTION public.custom_access_token_hook(JSONB) IS
  'Adds immutable AgriculNet role, status, and public user id claims to Supabase access tokens.';
