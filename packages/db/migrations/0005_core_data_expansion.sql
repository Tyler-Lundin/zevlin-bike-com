DO $$ BEGIN
  CREATE TYPE sales_channel AS ENUM ('store','b2b','admin','customer','landing','team');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE organization_type AS ENUM ('retailer','distributor','cycling_team','sponsor','club','event_partner','internal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE organization_membership_role AS ENUM ('owner','admin','buyer','finance','rider','coach','member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE organization_membership_status AS ENUM ('pending','active','inactive','revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE team_membership_status AS ENUM ('applied','pending_review','active','paused','retired','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE team_application_status AS ENUM ('submitted','under_review','approved','rejected','withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE team_registration_status AS ENUM ('pending','confirmed','waitlisted','cancelled','checked_in');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE benefit_type AS ENUM ('discount_code','price_list_access','event_access','product_credit','content_access');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE consent_type AS ENUM ('newsletter_email','product_updates_email','b2b_email','team_email','sms');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lead_submission_kind AS ENUM ('newsletter','contact','b2b_application','team_application','team_event','return_request');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lead_submission_status AS ENUM ('new','reviewed','qualified','archived','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_checkout_status AS ENUM ('draft','checkout_created','checkout_expired','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_provider AS ENUM ('stripe','manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE shipping_provider AS ENUM ('shippo','manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE b2b_business_type AS ENUM ('bike_shop','retailer','distributor','team_or_club','event_or_community','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE b2b_inquiry_type AS ENUM ('wholesale','retail_placement','community_partnership','event_support','team_support','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('draft','active','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE price_list_status AS ENUM ('draft','active','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE inventory_location_kind AS ENUM ('warehouse','retail','third_party','event');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE inventory_movement_reason AS ENUM ('purchase','sale','adjustment','return','damage','transfer','reservation','release');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE return_request_status AS ENUM ('requested','approved','rejected','received','refunded','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sync_status AS ENUM ('pending','synced','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE discount_code_status AS ENUM ('draft','active','expired','disabled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE order_fulfillment_status ADD VALUE IF NOT EXISTS 'partially_fulfilled';
ALTER TYPE order_shipping_status ADD VALUE IF NOT EXISTS 'label_purchased';
ALTER TYPE shipment_status ADD VALUE IF NOT EXISTS 'rate_selected';
ALTER TYPE shipment_status ADD VALUE IF NOT EXISTS 'in_transit';
ALTER TYPE shipment_status ADD VALUE IF NOT EXISTS 'returned';
ALTER TYPE b2b_application_status ADD VALUE IF NOT EXISTS 'under_review';

CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'default',
  recipient_name TEXT NOT NULL,
  phone_encrypted TEXT,
  phone_hash TEXT,
  address_encrypted TEXT NOT NULL,
  address_hash TEXT NOT NULL,
  is_default_shipping BOOLEAN NOT NULL DEFAULT false,
  is_default_billing BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS customer_addresses_customer_idx ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS customer_addresses_address_hash_idx ON customer_addresses(address_hash);

CREATE TABLE IF NOT EXISTS customer_preferences (
  customer_id UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  marketing_email_opt_in BOOLEAN NOT NULL DEFAULT false,
  marketing_sms_opt_in BOOLEAN NOT NULL DEFAULT false,
  preferred_currency TEXT NOT NULL DEFAULT 'USD',
  preferred_locale TEXT NOT NULL DEFAULT 'en-US',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type organization_type NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  primary_email TEXT,
  phone_encrypted TEXT,
  phone_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS organizations_type_idx ON organizations(type);

CREATE TABLE IF NOT EXISTS organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  role organization_membership_role NOT NULL,
  status organization_membership_status NOT NULL DEFAULT 'active',
  title TEXT,
  invited_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS organization_memberships_org_customer_role_uq
  ON organization_memberships(organization_id, customer_id, role);
CREATE INDEX IF NOT EXISTS organization_memberships_customer_idx
  ON organization_memberships(customer_id);

CREATE TABLE IF NOT EXISTS organization_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'shipping',
  name TEXT,
  email TEXT,
  phone_encrypted TEXT,
  phone_hash TEXT,
  address_encrypted TEXT NOT NULL,
  address_hash TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS organization_locations_org_idx ON organization_locations(organization_id);
CREATE INDEX IF NOT EXISTS organization_locations_address_hash_idx ON organization_locations(address_hash);

CREATE TABLE IF NOT EXISTS file_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'general',
  content_type TEXT,
  byte_size INTEGER,
  checksum TEXT,
  provider TEXT NOT NULL DEFAULT 'minio',
  metadata JSONB,
  created_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS file_objects_created_by_idx ON file_objects(created_by_customer_id);

CREATE TABLE IF NOT EXISTS external_record_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_table TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  record_type TEXT NOT NULL,
  external_id TEXT NOT NULL,
  url TEXT,
  metadata JSONB,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS external_record_links_provider_record_uq
  ON external_record_links(provider, record_type, external_id);
CREATE UNIQUE INDEX IF NOT EXISTS external_record_links_owner_provider_type_uq
  ON external_record_links(owner_table, owner_id, provider, record_type);
CREATE INDEX IF NOT EXISTS external_record_links_owner_idx
  ON external_record_links(owner_table, owner_id);

CREATE TABLE IF NOT EXISTS integration_sync_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_table TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  sync_type TEXT NOT NULL DEFAULT 'upsert',
  status sync_status NOT NULL DEFAULT 'pending',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS integration_sync_state_owner_provider_sync_uq
  ON integration_sync_state(owner_table, owner_id, provider, sync_type);
CREATE INDEX IF NOT EXISTS integration_sync_state_status_idx
  ON integration_sync_state(status);

CREATE TABLE IF NOT EXISTS lead_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind lead_submission_kind NOT NULL,
  status lead_submission_status NOT NULL DEFAULT 'new',
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  source_table TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
  email_hash TEXT,
  payload_encrypted TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS lead_submissions_source_uq
  ON lead_submissions(source_table, source_record_id);
CREATE INDEX IF NOT EXISTS lead_submissions_kind_idx ON lead_submissions(kind);
CREATE INDEX IF NOT EXISTS lead_submissions_customer_idx ON lead_submissions(customer_id);

CREATE TABLE IF NOT EXISTS marketing_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  lead_submission_id UUID REFERENCES lead_submissions(id) ON DELETE SET NULL,
  email_hash TEXT NOT NULL,
  consent_type consent_type NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  source TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS marketing_consents_email_type_uq
  ON marketing_consents(email_hash, consent_type);
CREATE INDEX IF NOT EXISTS marketing_consents_lead_submission_idx
  ON marketing_consents(lead_submission_id);

ALTER TABLE products ADD COLUMN IF NOT EXISTS status product_status NOT NULL DEFAULT 'active';
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'physical';
ALTER TABLE products ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE products ADD COLUMN IF NOT EXISTS requires_shipping BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_team_only BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS directus_item_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata JSONB;
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);

ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS status product_status NOT NULL DEFAULT 'active';
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS compare_at_price_cents INTEGER;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS attributes JSONB;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS product_variants_product_idx ON product_variants(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS product_variants_sku_uq ON product_variants(sku);

CREATE TABLE IF NOT EXISTS product_media_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  file_object_id UUID REFERENCES file_objects(id) ON DELETE SET NULL,
  directus_asset_id TEXT,
  url TEXT,
  alt_text TEXT NOT NULL,
  label TEXT,
  purpose TEXT NOT NULL DEFAULT 'gallery',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_media_refs_product_idx ON product_media_refs(product_id);
CREATE INDEX IF NOT EXISTS product_media_refs_variant_idx ON product_media_refs(variant_id);
CREATE INDEX IF NOT EXISTS product_media_refs_file_idx ON product_media_refs(file_object_id);

CREATE TABLE IF NOT EXISTS product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES product_collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS product_collection_items_collection_product_uq
  ON product_collection_items(collection_id, product_id);
CREATE INDEX IF NOT EXISTS product_collection_items_collection_idx
  ON product_collection_items(collection_id);

CREATE TABLE IF NOT EXISTS inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind inventory_location_kind NOT NULL DEFAULT 'warehouse',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
  on_hand_quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  safety_stock_quantity INTEGER NOT NULL DEFAULT 0,
  reorder_point_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS inventory_levels_variant_location_uq
  ON inventory_levels(variant_id, location_id);
CREATE INDEX IF NOT EXISTS inventory_levels_location_idx
  ON inventory_levels(location_id);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
  reason inventory_movement_reason NOT NULL,
  quantity_delta INTEGER NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  note TEXT,
  metadata JSONB,
  created_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inventory_movements_variant_idx ON inventory_movements(variant_id);
CREATE INDEX IF NOT EXISTS inventory_movements_location_idx ON inventory_movements(location_id);
CREATE INDEX IF NOT EXISTS inventory_movements_reason_idx ON inventory_movements(reason);

CREATE TABLE IF NOT EXISTS price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status price_list_status NOT NULL DEFAULT 'active',
  currency TEXT NOT NULL DEFAULT 'USD',
  channel sales_channel,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS price_lists_org_idx ON price_lists(organization_id);

CREATE TABLE IF NOT EXISTS price_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  currency TEXT NOT NULL DEFAULT 'USD',
  unit_price_cents INTEGER NOT NULL,
  compare_at_price_cents INTEGER,
  min_quantity INTEGER NOT NULL DEFAULT 1,
  max_quantity INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS price_list_items_price_variant_qty_uq
  ON price_list_items(price_list_id, variant_id, min_quantity);
CREATE INDEX IF NOT EXISTS price_list_items_price_list_idx
  ON price_list_items(price_list_id);

CREATE TABLE IF NOT EXISTS price_list_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  reason TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS price_list_assignments_price_list_idx ON price_list_assignments(price_list_id);
CREATE INDEX IF NOT EXISTS price_list_assignments_customer_idx ON price_list_assignments(customer_id);
CREATE INDEX IF NOT EXISTS price_list_assignments_org_idx ON price_list_assignments(organization_id);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel sales_channel NOT NULL DEFAULT 'store';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_status order_checkout_status NOT NULL DEFAULT 'draft';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_encrypted TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_hash TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address_snapshot JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_snapshot JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source_metadata JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS placed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS orders_buyer_organization_idx ON orders(buyer_organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_uq ON orders(order_number);

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_slug TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_name TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS weight_grams INTEGER;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

CREATE TABLE IF NOT EXISTS order_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_adjustments_order_idx ON order_adjustments(order_id);

CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  external_checkout_session_id TEXT,
  external_payment_intent_id TEXT,
  metadata JSONB,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  captured_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payment_attempts_order_idx ON payment_attempts(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS payment_attempts_checkout_session_uq
  ON payment_attempts(external_checkout_session_id);

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_attempt_id UUID REFERENCES payment_attempts(id) ON DELETE SET NULL,
  provider payment_provider NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  external_refund_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS refunds_order_idx ON refunds(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS refunds_external_refund_uq ON refunds(external_refund_id);

CREATE TABLE IF NOT EXISTS shipment_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider shipping_provider NOT NULL DEFAULT 'shippo',
  provider_rate_id TEXT NOT NULL,
  carrier TEXT NOT NULL,
  service TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  estimated_days INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shipment_rates_order_idx ON shipment_rates(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS shipment_rates_order_provider_rate_uq
  ON shipment_rates(order_id, provider_rate_id);

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS shipment_rate_id UUID REFERENCES shipment_rates(id) ON DELETE SET NULL;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS provider shipping_provider NOT NULL DEFAULT 'shippo';
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS external_shipment_id TEXT;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS file_object_id UUID REFERENCES file_objects(id) ON DELETE SET NULL;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMPTZ;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;
ALTER TABLE shipments ALTER COLUMN weight_grams SET DEFAULT 0;
ALTER TABLE shipments ALTER COLUMN length_cm SET DEFAULT 0;
ALTER TABLE shipments ALTER COLUMN width_cm SET DEFAULT 0;
ALTER TABLE shipments ALTER COLUMN height_cm SET DEFAULT 0;
CREATE INDEX IF NOT EXISTS shipments_rate_idx ON shipments(shipment_rate_id);

CREATE TABLE IF NOT EXISTS shipment_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  event_code TEXT,
  external_event_id TEXT,
  description TEXT,
  location TEXT,
  raw JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shipment_tracking_events_shipment_idx
  ON shipment_tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS shipment_tracking_events_occurred_at_idx
  ON shipment_tracking_events(occurred_at);
CREATE UNIQUE INDEX IF NOT EXISTS shipment_tracking_events_external_event_uq
  ON shipment_tracking_events(external_event_id);

CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
  status return_request_status NOT NULL DEFAULT 'requested',
  reason TEXT NOT NULL,
  request_encrypted TEXT NOT NULL,
  email_hash TEXT,
  metadata JSONB,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS return_requests_order_idx ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS return_requests_customer_idx ON return_requests(customer_id);

CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_request_id UUID NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  condition TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS return_items_return_request_idx ON return_items(return_request_id);

ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS resource_type TEXT;
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE webhook_events ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_provider_event_uq ON webhook_events(provider_event_id);

ALTER TABLE b2b_accounts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS b2b_accounts_organization_uq ON b2b_accounts(organization_id);
CREATE INDEX IF NOT EXISTS b2b_accounts_contact_hash_idx ON b2b_accounts(contact_hash);

ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS lead_submission_id UUID REFERENCES lead_submissions(id) ON DELETE SET NULL;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS business_type b2b_business_type;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS inquiry_type b2b_inquiry_type;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS tax_id TEXT;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE b2b_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS b2b_applications_status_idx ON b2b_applications(status);
CREATE INDEX IF NOT EXISTS b2b_applications_org_idx ON b2b_applications(organization_id);
CREATE INDEX IF NOT EXISTS b2b_applications_lead_submission_idx ON b2b_applications(lead_submission_id);

ALTER TABLE b2b_quotes ALTER COLUMN account_id DROP NOT NULL;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS quote_number TEXT;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS requested_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS source_application_id UUID REFERENCES b2b_applications(id) ON DELETE SET NULL;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE b2b_quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS b2b_quotes_org_idx ON b2b_quotes(organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS b2b_quotes_quote_number_uq ON b2b_quotes(quote_number);

CREATE TABLE IF NOT EXISTS b2b_quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES b2b_quotes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID,
  quantity INTEGER NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  line_total_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS b2b_quote_items_quote_idx ON b2b_quote_items(quote_id);

CREATE TABLE IF NOT EXISTS b2b_quote_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES b2b_quotes(id) ON DELETE CASCADE,
  status b2b_quote_status NOT NULL,
  note TEXT,
  changed_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS b2b_quote_status_events_quote_idx ON b2b_quote_status_events(quote_id);

CREATE TABLE IF NOT EXISTS b2b_quote_order_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES b2b_quotes(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  converted_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS b2b_quote_order_conversions_quote_uq
  ON b2b_quote_order_conversions(quote_id);
CREATE UNIQUE INDEX IF NOT EXISTS b2b_quote_order_conversions_order_uq
  ON b2b_quote_order_conversions(order_id);

CREATE TABLE IF NOT EXISTS team_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  price_list_id UUID REFERENCES price_lists(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE team_updates ADD COLUMN IF NOT EXISTS team_program_id UUID REFERENCES team_programs(id) ON DELETE SET NULL;
ALTER TABLE team_updates ADD COLUMN IF NOT EXISTS directus_item_id TEXT;

ALTER TABLE team_events ADD COLUMN IF NOT EXISTS team_program_id UUID REFERENCES team_programs(id) ON DELETE SET NULL;
ALTER TABLE team_events ADD COLUMN IF NOT EXISTS directus_item_id TEXT;
ALTER TABLE team_events ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE team_events ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS team_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_program_id UUID REFERENCES team_programs(id) ON DELETE SET NULL,
  submitted_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  lead_submission_id UUID REFERENCES lead_submissions(id) ON DELETE SET NULL,
  status team_application_status NOT NULL DEFAULT 'submitted',
  full_name TEXT,
  email_hash TEXT,
  message TEXT,
  application_encrypted TEXT NOT NULL,
  reviewed_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS team_applications_team_program_idx ON team_applications(team_program_id);
CREATE INDEX IF NOT EXISTS team_applications_status_idx ON team_applications(status);

CREATE TABLE IF NOT EXISTS team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_program_id UUID NOT NULL REFERENCES team_programs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status team_membership_status NOT NULL DEFAULT 'pending_review',
  approved_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  price_list_id UUID REFERENCES price_lists(id) ON DELETE SET NULL,
  notes JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS team_memberships_program_customer_uq
  ON team_memberships(team_program_id, customer_id);
CREATE INDEX IF NOT EXISTS team_memberships_customer_idx ON team_memberships(customer_id);

CREATE TABLE IF NOT EXISTS team_event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES team_events(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  team_membership_id UUID REFERENCES team_memberships(id) ON DELETE SET NULL,
  status team_registration_status NOT NULL DEFAULT 'pending',
  registration_encrypted TEXT NOT NULL,
  registration_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS team_event_registrations_event_idx ON team_event_registrations(event_id);
CREATE INDEX IF NOT EXISTS team_event_registrations_customer_idx ON team_event_registrations(customer_id);

CREATE TABLE IF NOT EXISTS community_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  home_region TEXT,
  avatar_file_id UUID REFERENCES file_objects(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'public',
  social_links JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS benefit_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  benefit_type benefit_type NOT NULL,
  description TEXT,
  team_program_id UUID REFERENCES team_programs(id) ON DELETE SET NULL,
  price_list_id UUID REFERENCES price_lists(id) ON DELETE SET NULL,
  metadata JSONB,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS benefit_programs_team_program_idx ON benefit_programs(team_program_id);

CREATE TABLE IF NOT EXISTS benefit_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benefit_program_id UUID NOT NULL REFERENCES benefit_programs(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  team_membership_id UUID REFERENCES team_memberships(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  granted_by_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS benefit_entitlements_program_idx ON benefit_entitlements(benefit_program_id);
CREATE INDEX IF NOT EXISTS benefit_entitlements_customer_idx ON benefit_entitlements(customer_id);
CREATE INDEX IF NOT EXISTS benefit_entitlements_membership_idx ON benefit_entitlements(team_membership_id);

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benefit_program_id UUID REFERENCES benefit_programs(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  status discount_code_status NOT NULL DEFAULT 'active',
  percent_off INTEGER,
  amount_off_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  max_redemptions INTEGER,
  redemption_count INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS discount_codes_program_idx ON discount_codes(benefit_program_id);
CREATE INDEX IF NOT EXISTS discount_codes_customer_idx ON discount_codes(customer_id);

INSERT INTO organizations (id, name, slug, type, status, created_at, updated_at)
SELECT
  b.id,
  b.company_name,
  trim(both '-' from regexp_replace(lower(b.company_name), '[^a-z0-9]+', '-', 'g')) || '-' || substr(b.id::text, 1, 8),
  'retailer'::organization_type,
  'active',
  b.created_at,
  b.updated_at
FROM b2b_accounts b
ON CONFLICT (id) DO NOTHING;

UPDATE b2b_accounts
SET organization_id = id
WHERE organization_id IS NULL;

UPDATE b2b_applications
SET organization_id = account_id
WHERE organization_id IS NULL AND account_id IS NOT NULL;

UPDATE b2b_quotes
SET organization_id = account_id
WHERE organization_id IS NULL AND account_id IS NOT NULL;

INSERT INTO inventory_locations (code, name, kind, is_primary)
SELECT 'primary-warehouse', 'Primary Warehouse', 'warehouse', true
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_locations WHERE code = 'primary-warehouse'
);

INSERT INTO price_lists (name, slug, status, currency, channel, is_default)
SELECT 'Retail USD', 'retail-usd', 'active', 'USD', 'store', true
WHERE NOT EXISTS (
  SELECT 1 FROM price_lists WHERE slug = 'retail-usd'
);

INSERT INTO price_list_items (price_list_id, product_id, currency, unit_price_cents)
SELECT pl.id, p.id, COALESCE(p.currency, 'USD'), p.price_cents
FROM price_lists pl
JOIN products p ON TRUE
WHERE pl.slug = 'retail-usd'
  AND NOT EXISTS (
    SELECT 1
    FROM price_list_items pli
    WHERE pli.price_list_id = pl.id
      AND pli.product_id = p.id
      AND pli.variant_id IS NULL
  );

INSERT INTO lead_submissions (id, kind, status, source_table, source_record_id, email_hash, payload_encrypted, created_at, updated_at)
SELECT
  id,
  'newsletter',
  'new',
  'marketing_newsletter_signups',
  id::text,
  email_hash,
  email_encrypted,
  created_at,
  created_at
FROM marketing_newsletter_signups
ON CONFLICT (id) DO NOTHING;

INSERT INTO lead_submissions (id, kind, status, source_table, source_record_id, email_hash, payload_encrypted, created_at, updated_at)
SELECT
  id,
  'contact',
  'new',
  'marketing_contact_submissions',
  id::text,
  email_hash,
  submission_encrypted,
  created_at,
  updated_at
FROM marketing_contact_submissions
ON CONFLICT (id) DO NOTHING;

INSERT INTO lead_submissions (id, kind, status, source_table, source_record_id, email_hash, payload_encrypted, created_at, updated_at)
SELECT
  id,
  'return_request',
  'new',
  'marketing_return_requests',
  id::text,
  email_hash,
  request_encrypted,
  created_at,
  updated_at
FROM marketing_return_requests
ON CONFLICT (id) DO NOTHING;

INSERT INTO lead_submissions (id, kind, status, source_table, source_record_id, email_hash, payload_encrypted, created_at, updated_at)
SELECT
  id,
  'b2b_application',
  'new',
  'b2b_applications',
  id::text,
  application_hash,
  application_encrypted,
  created_at,
  updated_at
FROM b2b_applications
ON CONFLICT (id) DO NOTHING;

UPDATE b2b_applications
SET lead_submission_id = id
WHERE lead_submission_id IS NULL;

INSERT INTO team_event_registrations (id, event_id, status, registration_encrypted, registration_hash, created_at, updated_at)
SELECT
  id,
  event_id,
  'pending',
  signup_encrypted,
  signup_hash,
  created_at,
  created_at
FROM team_event_signups
ON CONFLICT (id) DO NOTHING;

INSERT INTO lead_submissions (id, kind, status, source_table, source_record_id, email_hash, payload_encrypted, created_at, updated_at)
SELECT
  id,
  'team_event',
  'new',
  'team_event_signups',
  id::text,
  signup_hash,
  signup_encrypted,
  created_at,
  created_at
FROM team_event_signups
ON CONFLICT (id) DO NOTHING;

INSERT INTO marketing_consents (lead_submission_id, email_hash, consent_type, granted, source, captured_at, created_at, updated_at)
SELECT
  id,
  email_hash,
  'newsletter_email',
  true,
  COALESCE(source, 'legacy-newsletter'),
  created_at,
  created_at,
  created_at
FROM marketing_newsletter_signups
ON CONFLICT (email_hash, consent_type) DO NOTHING;

INSERT INTO marketing_consents (lead_submission_id, email_hash, consent_type, granted, source, captured_at, created_at, updated_at)
SELECT
  id,
  application_hash,
  'b2b_email',
  true,
  'legacy-b2b',
  created_at,
  created_at,
  updated_at
FROM b2b_applications
ON CONFLICT (email_hash, consent_type) DO NOTHING;

INSERT INTO marketing_consents (lead_submission_id, email_hash, consent_type, granted, source, captured_at, created_at, updated_at)
SELECT
  id,
  signup_hash,
  'team_email',
  true,
  'legacy-team-event',
  created_at,
  created_at,
  created_at
FROM team_event_signups
ON CONFLICT (email_hash, consent_type) DO NOTHING;

INSERT INTO return_requests (id, status, reason, request_encrypted, email_hash, metadata, requested_at, created_at, updated_at)
SELECT
  id,
  'requested',
  'legacy_return_request',
  request_encrypted,
  email_hash,
  jsonb_build_object('orderNumber', order_number),
  created_at,
  created_at,
  updated_at
FROM marketing_return_requests
ON CONFLICT (id) DO NOTHING;

INSERT INTO shipment_tracking_events (shipment_id, event_code, description, raw, occurred_at)
SELECT shipment_id, event_code, description, raw, occurred_at
FROM shipment_events
WHERE NOT EXISTS (
  SELECT 1
  FROM shipment_tracking_events ste
  WHERE ste.shipment_id = shipment_events.shipment_id
    AND ste.event_code IS NOT DISTINCT FROM shipment_events.event_code
    AND ste.occurred_at = shipment_events.occurred_at
);

UPDATE orders
SET checkout_status = CASE
  WHEN payment_status = 'paid' THEN 'completed'
  WHEN stripe_checkout_session_id IS NOT NULL THEN 'checkout_created'
  ELSE checkout_status
END
WHERE checkout_status = 'draft';

ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_record_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_list_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_quote_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_quote_order_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_addresses_self_access ON customer_addresses;
CREATE POLICY customer_addresses_self_access ON customer_addresses
FOR ALL TO PUBLIC
USING (
  customer_id = get_customer_id_for_auth_user()
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  customer_id = get_customer_id_for_auth_user()
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS customer_preferences_self_access ON customer_preferences;
CREATE POLICY customer_preferences_self_access ON customer_preferences
FOR ALL TO PUBLIC
USING (
  customer_id = get_customer_id_for_auth_user()
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  customer_id = get_customer_id_for_auth_user()
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS organizations_member_read ON organizations;
CREATE POLICY organizations_member_read ON organizations
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1
    FROM organization_memberships om
    WHERE om.organization_id = organizations.id
      AND om.customer_id = get_customer_id_for_auth_user()
      AND om.status = 'active'
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS organizations_admin_manage ON organizations;
CREATE POLICY organizations_admin_manage ON organizations
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

DROP POLICY IF EXISTS organization_memberships_self_read ON organization_memberships;
CREATE POLICY organization_memberships_self_read ON organization_memberships
FOR SELECT TO PUBLIC
USING (
  customer_id = get_customer_id_for_auth_user()
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS organization_memberships_admin_manage ON organization_memberships;
CREATE POLICY organization_memberships_admin_manage ON organization_memberships
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

DROP POLICY IF EXISTS organization_locations_member_read ON organization_locations;
CREATE POLICY organization_locations_member_read ON organization_locations
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1
    FROM organization_memberships om
    WHERE om.organization_id = organization_locations.organization_id
      AND om.customer_id = get_customer_id_for_auth_user()
      AND om.status = 'active'
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS organization_locations_admin_manage ON organization_locations;
CREATE POLICY organization_locations_admin_manage ON organization_locations
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

DROP POLICY IF EXISTS file_objects_admin_manage ON file_objects;
CREATE POLICY file_objects_admin_manage ON file_objects
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

DROP POLICY IF EXISTS external_record_links_admin_manage ON external_record_links;
CREATE POLICY external_record_links_admin_manage ON external_record_links
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

DROP POLICY IF EXISTS integration_sync_state_admin_manage ON integration_sync_state;
CREATE POLICY integration_sync_state_admin_manage ON integration_sync_state
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

DROP POLICY IF EXISTS lead_submissions_admin_manage ON lead_submissions;
CREATE POLICY lead_submissions_admin_manage ON lead_submissions
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

DROP POLICY IF EXISTS marketing_consents_admin_manage ON marketing_consents;
CREATE POLICY marketing_consents_admin_manage ON marketing_consents
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

DROP POLICY IF EXISTS product_media_refs_public_read ON product_media_refs;
CREATE POLICY product_media_refs_public_read ON product_media_refs
FOR SELECT TO PUBLIC
USING (true);

DROP POLICY IF EXISTS product_media_refs_admin_manage ON product_media_refs;
CREATE POLICY product_media_refs_admin_manage ON product_media_refs
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

DROP POLICY IF EXISTS product_collections_public_read ON product_collections;
CREATE POLICY product_collections_public_read ON product_collections
FOR SELECT TO PUBLIC
USING (true);

DROP POLICY IF EXISTS product_collections_admin_manage ON product_collections;
CREATE POLICY product_collections_admin_manage ON product_collections
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

DROP POLICY IF EXISTS product_collection_items_public_read ON product_collection_items;
CREATE POLICY product_collection_items_public_read ON product_collection_items
FOR SELECT TO PUBLIC
USING (true);

DROP POLICY IF EXISTS product_collection_items_admin_manage ON product_collection_items;
CREATE POLICY product_collection_items_admin_manage ON product_collection_items
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

DROP POLICY IF EXISTS inventory_admin_manage ON inventory_locations;
CREATE POLICY inventory_admin_manage ON inventory_locations
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

DROP POLICY IF EXISTS inventory_levels_admin_manage ON inventory_levels;
CREATE POLICY inventory_levels_admin_manage ON inventory_levels
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

DROP POLICY IF EXISTS inventory_movements_admin_manage ON inventory_movements;
CREATE POLICY inventory_movements_admin_manage ON inventory_movements
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

DROP POLICY IF EXISTS price_lists_public_read ON price_lists;
CREATE POLICY price_lists_public_read ON price_lists
FOR SELECT TO PUBLIC
USING (status = 'active');

DROP POLICY IF EXISTS price_lists_admin_manage ON price_lists;
CREATE POLICY price_lists_admin_manage ON price_lists
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

DROP POLICY IF EXISTS price_list_items_public_read ON price_list_items;
CREATE POLICY price_list_items_public_read ON price_list_items
FOR SELECT TO PUBLIC
USING (true);

DROP POLICY IF EXISTS price_list_items_admin_manage ON price_list_items;
CREATE POLICY price_list_items_admin_manage ON price_list_items
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

DROP POLICY IF EXISTS price_list_assignments_self_read ON price_list_assignments;
CREATE POLICY price_list_assignments_self_read ON price_list_assignments
FOR SELECT TO PUBLIC
USING (
  customer_id = get_customer_id_for_auth_user()
  OR EXISTS (
    SELECT 1
    FROM organization_memberships om
    WHERE om.organization_id = price_list_assignments.organization_id
      AND om.customer_id = get_customer_id_for_auth_user()
      AND om.status = 'active'
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS price_list_assignments_admin_manage ON price_list_assignments;
CREATE POLICY price_list_assignments_admin_manage ON price_list_assignments
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

DROP POLICY IF EXISTS order_adjustments_owner_access ON order_adjustments;
CREATE POLICY order_adjustments_owner_access ON order_adjustments
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_adjustments.order_id
      AND orders.customer_id = get_customer_id_for_auth_user()
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS order_adjustments_admin_manage ON order_adjustments;
CREATE POLICY order_adjustments_admin_manage ON order_adjustments
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

DROP POLICY IF EXISTS payment_attempts_owner_access ON payment_attempts;
CREATE POLICY payment_attempts_owner_access ON payment_attempts
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payment_attempts.order_id
      AND orders.customer_id = get_customer_id_for_auth_user()
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS payment_attempts_admin_manage ON payment_attempts;
CREATE POLICY payment_attempts_admin_manage ON payment_attempts
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

DROP POLICY IF EXISTS refunds_owner_access ON refunds;
CREATE POLICY refunds_owner_access ON refunds
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = refunds.order_id
      AND orders.customer_id = get_customer_id_for_auth_user()
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS refunds_admin_manage ON refunds;
CREATE POLICY refunds_admin_manage ON refunds
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

DROP POLICY IF EXISTS shipment_rates_owner_access ON shipment_rates;
CREATE POLICY shipment_rates_owner_access ON shipment_rates
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = shipment_rates.order_id
      AND orders.customer_id = get_customer_id_for_auth_user()
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS shipment_rates_admin_manage ON shipment_rates;
CREATE POLICY shipment_rates_admin_manage ON shipment_rates
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

DROP POLICY IF EXISTS shipment_tracking_events_owner_read ON shipment_tracking_events;
CREATE POLICY shipment_tracking_events_owner_read ON shipment_tracking_events
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1
    FROM shipments s
    JOIN orders o ON o.id = s.order_id
    WHERE s.id = shipment_tracking_events.shipment_id
      AND o.customer_id = get_customer_id_for_auth_user()
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS shipment_tracking_events_admin_manage ON shipment_tracking_events;
CREATE POLICY shipment_tracking_events_admin_manage ON shipment_tracking_events
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

DROP POLICY IF EXISTS return_requests_owner_access ON return_requests;
CREATE POLICY return_requests_owner_access ON return_requests
FOR SELECT TO PUBLIC
USING (
  customer_id = get_customer_id_for_auth_user()
  OR EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = return_requests.order_id
      AND orders.customer_id = get_customer_id_for_auth_user()
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS return_requests_admin_manage ON return_requests;
CREATE POLICY return_requests_admin_manage ON return_requests
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

DROP POLICY IF EXISTS return_items_owner_access ON return_items;
CREATE POLICY return_items_owner_access ON return_items
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1
    FROM return_requests rr
    LEFT JOIN orders o ON o.id = rr.order_id
    WHERE rr.id = return_items.return_request_id
      AND (rr.customer_id = get_customer_id_for_auth_user() OR o.customer_id = get_customer_id_for_auth_user())
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS return_items_admin_manage ON return_items;
CREATE POLICY return_items_admin_manage ON return_items
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

DROP POLICY IF EXISTS b2b_quote_items_org_read ON b2b_quote_items;
CREATE POLICY b2b_quote_items_org_read ON b2b_quote_items
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1
    FROM b2b_quotes q
    JOIN organization_memberships om ON om.organization_id = q.organization_id
    WHERE q.id = b2b_quote_items.quote_id
      AND om.customer_id = get_customer_id_for_auth_user()
      AND om.status = 'active'
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS b2b_quote_items_admin_manage ON b2b_quote_items;
CREATE POLICY b2b_quote_items_admin_manage ON b2b_quote_items
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

DROP POLICY IF EXISTS b2b_quote_status_events_org_read ON b2b_quote_status_events;
CREATE POLICY b2b_quote_status_events_org_read ON b2b_quote_status_events
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1
    FROM b2b_quotes q
    JOIN organization_memberships om ON om.organization_id = q.organization_id
    WHERE q.id = b2b_quote_status_events.quote_id
      AND om.customer_id = get_customer_id_for_auth_user()
      AND om.status = 'active'
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS b2b_quote_status_events_admin_manage ON b2b_quote_status_events;
CREATE POLICY b2b_quote_status_events_admin_manage ON b2b_quote_status_events
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

DROP POLICY IF EXISTS b2b_quote_order_conversions_org_read ON b2b_quote_order_conversions;
CREATE POLICY b2b_quote_order_conversions_org_read ON b2b_quote_order_conversions
FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1
    FROM b2b_quotes q
    JOIN organization_memberships om ON om.organization_id = q.organization_id
    WHERE q.id = b2b_quote_order_conversions.quote_id
      AND om.customer_id = get_customer_id_for_auth_user()
      AND om.status = 'active'
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS b2b_quote_order_conversions_admin_manage ON b2b_quote_order_conversions;
CREATE POLICY b2b_quote_order_conversions_admin_manage ON b2b_quote_order_conversions
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

DROP POLICY IF EXISTS team_programs_public_read ON team_programs;
CREATE POLICY team_programs_public_read ON team_programs
FOR SELECT TO PUBLIC
USING (status = 'active');

DROP POLICY IF EXISTS team_programs_editor_manage ON team_programs;
CREATE POLICY team_programs_editor_manage ON team_programs
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS team_applications_self_read ON team_applications;
CREATE POLICY team_applications_self_read ON team_applications
FOR SELECT TO PUBLIC
USING (
  submitted_by_customer_id = get_customer_id_for_auth_user()
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS team_applications_editor_manage ON team_applications;
CREATE POLICY team_applications_editor_manage ON team_applications
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS team_memberships_self_read ON team_memberships;
CREATE POLICY team_memberships_self_read ON team_memberships
FOR SELECT TO PUBLIC
USING (
  customer_id = get_customer_id_for_auth_user()
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS team_memberships_editor_manage ON team_memberships;
CREATE POLICY team_memberships_editor_manage ON team_memberships
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS team_event_registrations_self_read ON team_event_registrations;
CREATE POLICY team_event_registrations_self_read ON team_event_registrations
FOR SELECT TO PUBLIC
USING (
  customer_id = get_customer_id_for_auth_user()
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS team_event_registrations_editor_manage ON team_event_registrations;
CREATE POLICY team_event_registrations_editor_manage ON team_event_registrations
FOR ALL TO PUBLIC
USING (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS community_profiles_public_read ON community_profiles;
CREATE POLICY community_profiles_public_read ON community_profiles
FOR SELECT TO PUBLIC
USING (
  visibility = 'public'
  OR customer_id = get_customer_id_for_auth_user()
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS community_profiles_self_manage ON community_profiles;
CREATE POLICY community_profiles_self_manage ON community_profiles
FOR ALL TO PUBLIC
USING (
  customer_id = get_customer_id_for_auth_user()
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
)
WITH CHECK (
  customer_id = get_customer_id_for_auth_user()
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'team_editor' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS benefit_programs_public_read ON benefit_programs;
CREATE POLICY benefit_programs_public_read ON benefit_programs
FOR SELECT TO PUBLIC
USING (is_active = true);

DROP POLICY IF EXISTS benefit_programs_admin_manage ON benefit_programs;
CREATE POLICY benefit_programs_admin_manage ON benefit_programs
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

DROP POLICY IF EXISTS benefit_entitlements_self_read ON benefit_entitlements;
CREATE POLICY benefit_entitlements_self_read ON benefit_entitlements
FOR SELECT TO PUBLIC
USING (
  customer_id = get_customer_id_for_auth_user()
  OR EXISTS (
    SELECT 1
    FROM team_memberships tm
    WHERE tm.id = benefit_entitlements.team_membership_id
      AND tm.customer_id = get_customer_id_for_auth_user()
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS benefit_entitlements_admin_manage ON benefit_entitlements;
CREATE POLICY benefit_entitlements_admin_manage ON benefit_entitlements
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

DROP POLICY IF EXISTS discount_codes_self_read ON discount_codes;
CREATE POLICY discount_codes_self_read ON discount_codes
FOR SELECT TO PUBLIC
USING (
  customer_id = get_customer_id_for_auth_user()
  OR EXISTS (
    SELECT 1
    FROM organization_memberships om
    WHERE om.organization_id = discount_codes.organization_id
      AND om.customer_id = get_customer_id_for_auth_user()
      AND om.status = 'active'
  )
  OR is_system_context()
  OR 'admin' = ANY(get_roles_for_auth_user())
  OR 'ops' = ANY(get_roles_for_auth_user())
);

DROP POLICY IF EXISTS discount_codes_admin_manage ON discount_codes;
CREATE POLICY discount_codes_admin_manage ON discount_codes
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
