CREATE OR REPLACE FUNCTION get_claim_subject()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('zevlin.subject', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_claim_customer_id()
RETURNS UUID AS $$
DECLARE
  raw_value TEXT;
BEGIN
  raw_value := NULLIF(current_setting('zevlin.customer_id', true), '');
  IF raw_value IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN raw_value::UUID;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_claim_roles()
RETURNS role[] AS $$
  SELECT COALESCE(array_agg(item::role), ARRAY[]::role[])
  FROM (
    SELECT trim(value) AS item
    FROM unnest(
      string_to_array(COALESCE(NULLIF(current_setting('zevlin.roles', true), ''), ''), ',')
    ) AS value
  ) normalized
  WHERE item <> ''
    AND item = ANY(enum_range(NULL::role)::TEXT[]);
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_system_context()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(NULLIF(current_setting('zevlin.system', true), ''), 'false')::BOOLEAN;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_customer_id_for_auth_user()
RETURNS UUID AS $$
DECLARE
  v_customer_id UUID;
  v_subject TEXT;
BEGIN
  v_customer_id := get_claim_customer_id();
  IF v_customer_id IS NOT NULL THEN
    RETURN v_customer_id;
  END IF;

  v_subject := get_claim_subject();
  IF v_subject IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE auth_user_id = v_subject
  LIMIT 1;

  RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_roles_for_auth_user()
RETURNS role[] AS $$
DECLARE
  v_customer_id UUID;
  v_claim_roles role[];
  v_db_roles role[];
BEGIN
  v_claim_roles := get_claim_roles();
  v_customer_id := get_customer_id_for_auth_user();

  IF v_customer_id IS NULL THEN
    RETURN v_claim_roles;
  END IF;

  SELECT COALESCE(array_agg(role), ARRAY[]::role[]) INTO v_db_roles
  FROM public.user_roles
  WHERE customer_id = v_customer_id;

  RETURN (
    SELECT COALESCE(array_agg(DISTINCT role_item), ARRAY[]::role[])
    FROM unnest(v_claim_roles || v_db_roles) AS role_item
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_token_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_event_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_self_access ON customers;
CREATE POLICY customer_self_access ON customers
FOR SELECT TO PUBLIC
USING (id = get_customer_id_for_auth_user());

DROP POLICY IF EXISTS admin_customer_access ON customers;
CREATE POLICY admin_customer_access ON customers
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS user_roles_self_read ON user_roles;
CREATE POLICY user_roles_self_read ON user_roles
FOR SELECT TO PUBLIC
USING (customer_id = get_customer_id_for_auth_user());

DROP POLICY IF EXISTS user_roles_admin_manage ON user_roles;
CREATE POLICY user_roles_admin_manage ON user_roles
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS identity_links_self_read ON identity_links;
CREATE POLICY identity_links_self_read ON identity_links
FOR SELECT TO PUBLIC
USING (customer_id = get_customer_id_for_auth_user());

DROP POLICY IF EXISTS identity_links_admin_manage ON identity_links;
CREATE POLICY identity_links_admin_manage ON identity_links
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS refresh_sessions_self_access ON refresh_token_sessions;
CREATE POLICY refresh_sessions_self_access ON refresh_token_sessions
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1
    FROM identity_links
    WHERE identity_links.id = refresh_token_sessions.identity_link_id
      AND (
        identity_links.customer_id = get_customer_id_for_auth_user()
        OR identity_links.subject = get_claim_subject()
      )
  )
);

DROP POLICY IF EXISTS refresh_sessions_system_manage ON refresh_token_sessions;
CREATE POLICY refresh_sessions_system_manage ON refresh_token_sessions
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS orders_owner_access ON orders;
CREATE POLICY orders_owner_access ON orders
FOR SELECT TO PUBLIC
USING (customer_id = get_customer_id_for_auth_user());

DROP POLICY IF EXISTS orders_customer_insert ON orders;
CREATE POLICY orders_customer_insert ON orders
FOR INSERT TO PUBLIC
WITH CHECK (
  is_system_context()
  OR customer_id IS NULL
  OR customer_id = get_customer_id_for_auth_user()
);

DROP POLICY IF EXISTS orders_admin_access ON orders;
CREATE POLICY orders_admin_access ON orders
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS order_items_owner_access ON order_items;
CREATE POLICY order_items_owner_access ON order_items
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = order_items.order_id
      AND orders.customer_id = get_customer_id_for_auth_user()
  )
);

DROP POLICY IF EXISTS order_items_admin_access ON order_items;
CREATE POLICY order_items_admin_access ON order_items
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products
FOR SELECT TO PUBLIC
USING (true);

DROP POLICY IF EXISTS products_ops_manage ON products;
CREATE POLICY products_ops_manage ON products
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS shipments_owner_access ON shipments;
CREATE POLICY shipments_owner_access ON shipments
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = shipments.order_id
      AND orders.customer_id = get_customer_id_for_auth_user()
  )
);

DROP POLICY IF EXISTS shipments_admin_access ON shipments;
CREATE POLICY shipments_admin_access ON shipments
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS shipment_events_admin_read ON shipment_events;
CREATE POLICY shipment_events_admin_read ON shipment_events
FOR SELECT TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS shipping_packages_public_read ON shipping_packages;
CREATE POLICY shipping_packages_public_read ON shipping_packages
FOR SELECT TO PUBLIC
USING (true);

DROP POLICY IF EXISTS shipping_packages_admin_access ON shipping_packages;
CREATE POLICY shipping_packages_admin_access ON shipping_packages
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS webhook_events_system_write ON webhook_events;
CREATE POLICY webhook_events_system_write ON webhook_events
FOR INSERT TO PUBLIC
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS webhook_events_admin_read ON webhook_events;
CREATE POLICY webhook_events_admin_read ON webhook_events
FOR SELECT TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS idempotency_keys_system_manage ON idempotency_keys;
CREATE POLICY idempotency_keys_system_manage ON idempotency_keys
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS b2b_ops_admin_access ON b2b_accounts;
CREATE POLICY b2b_ops_admin_access ON b2b_accounts
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS b2b_applications_customer_submit ON b2b_applications;
CREATE POLICY b2b_applications_customer_submit ON b2b_applications
FOR INSERT TO PUBLIC
WITH CHECK (
  is_system_context()
  OR submitted_by_customer_id IS NULL
  OR submitted_by_customer_id = get_customer_id_for_auth_user()
);

DROP POLICY IF EXISTS b2b_applications_ops_admin_manage ON b2b_applications;
CREATE POLICY b2b_applications_ops_admin_manage ON b2b_applications
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS b2b_quotes_ops_admin_access ON b2b_quotes;
CREATE POLICY b2b_quotes_ops_admin_access ON b2b_quotes
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS team_public_read ON team_updates;
CREATE POLICY team_public_read ON team_updates
FOR SELECT TO PUBLIC
USING (true);

DROP POLICY IF EXISTS team_editor_write ON team_updates;
CREATE POLICY team_editor_write ON team_updates
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'team_editor' = ANY(get_roles_for_auth_user())
  OR 'admin' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'team_editor' = ANY(get_roles_for_auth_user())
  OR 'admin' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS team_events_public_read ON team_events;
CREATE POLICY team_events_public_read ON team_events
FOR SELECT TO PUBLIC
USING (true);

DROP POLICY IF EXISTS team_events_editor_write ON team_events;
CREATE POLICY team_events_editor_write ON team_events
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'team_editor' = ANY(get_roles_for_auth_user())
  OR 'admin' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'team_editor' = ANY(get_roles_for_auth_user())
  OR 'admin' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS team_signup_public_insert ON team_event_signups;
CREATE POLICY team_signup_public_insert ON team_event_signups
FOR INSERT TO PUBLIC
WITH CHECK (true);

DROP POLICY IF EXISTS team_signup_admin_read ON team_event_signups;
CREATE POLICY team_signup_admin_read ON team_event_signups
FOR SELECT TO PUBLIC
USING (
  is_system_context()
  OR 'team_editor' = ANY(get_roles_for_auth_user())
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS audit_system_write ON audit_events;
CREATE POLICY audit_system_write ON audit_events
FOR INSERT TO PUBLIC
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS audit_admin_read ON audit_events;
CREATE POLICY audit_admin_read ON audit_events
FOR SELECT TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);
