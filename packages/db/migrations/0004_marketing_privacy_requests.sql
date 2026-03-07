CREATE TABLE IF NOT EXISTS marketing_privacy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type TEXT NOT NULL,
  request_encrypted TEXT NOT NULL,
  email_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS marketing_privacy_requests_request_type_idx
  ON marketing_privacy_requests(request_type);
CREATE INDEX IF NOT EXISTS marketing_privacy_requests_email_hash_idx
  ON marketing_privacy_requests(email_hash);
CREATE INDEX IF NOT EXISTS marketing_privacy_requests_status_idx
  ON marketing_privacy_requests(status);
CREATE INDEX IF NOT EXISTS marketing_privacy_requests_created_at_idx
  ON marketing_privacy_requests(created_at);

ALTER TABLE marketing_privacy_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketing_privacy_admin_manage ON marketing_privacy_requests;
CREATE POLICY marketing_privacy_admin_manage ON marketing_privacy_requests
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
