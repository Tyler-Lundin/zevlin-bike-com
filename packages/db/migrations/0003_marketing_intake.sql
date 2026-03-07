CREATE TABLE IF NOT EXISTS marketing_newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_encrypted TEXT NOT NULL,
  email_hash TEXT NOT NULL UNIQUE,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketing_newsletter_signups_email_hash_idx
  ON marketing_newsletter_signups(email_hash);
CREATE INDEX IF NOT EXISTS marketing_newsletter_signups_created_at_idx
  ON marketing_newsletter_signups(created_at);

CREATE TABLE IF NOT EXISTS marketing_contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_encrypted TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketing_contact_submissions_email_hash_idx
  ON marketing_contact_submissions(email_hash);
CREATE INDEX IF NOT EXISTS marketing_contact_submissions_status_idx
  ON marketing_contact_submissions(status);
CREATE INDEX IF NOT EXISTS marketing_contact_submissions_created_at_idx
  ON marketing_contact_submissions(created_at);

CREATE TABLE IF NOT EXISTS marketing_return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL,
  request_encrypted TEXT NOT NULL,
  email_hash TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketing_return_requests_order_number_idx
  ON marketing_return_requests(order_number);
CREATE INDEX IF NOT EXISTS marketing_return_requests_email_hash_idx
  ON marketing_return_requests(email_hash);
CREATE INDEX IF NOT EXISTS marketing_return_requests_status_idx
  ON marketing_return_requests(status);
CREATE INDEX IF NOT EXISTS marketing_return_requests_created_at_idx
  ON marketing_return_requests(created_at);

ALTER TABLE marketing_newsletter_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_return_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketing_newsletter_admin_manage ON marketing_newsletter_signups;
CREATE POLICY marketing_newsletter_admin_manage ON marketing_newsletter_signups
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

DROP POLICY IF EXISTS marketing_contact_admin_manage ON marketing_contact_submissions;
CREATE POLICY marketing_contact_admin_manage ON marketing_contact_submissions
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

DROP POLICY IF EXISTS marketing_returns_admin_manage ON marketing_return_requests;
CREATE POLICY marketing_returns_admin_manage ON marketing_return_requests
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
