-- Lock down SECURITY DEFINER functions: revoke broad EXECUTE and grant only where needed.
-- Admin-only money flow (the function still checks has_role internally; remove ambient EXECUTE).
REVOKE ALL ON FUNCTION public.approve_deposit(uuid)    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reject_deposit(uuid)     FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.approve_withdrawal(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reject_withdrawal(uuid)  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_deposit(uuid)    TO service_role;
GRANT EXECUTE ON FUNCTION public.reject_deposit(uuid)     TO service_role;
GRANT EXECUTE ON FUNCTION public.approve_withdrawal(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.reject_withdrawal(uuid)  TO service_role;

-- Trigger-only helpers: should never be callable directly by API roles.
REVOKE ALL ON FUNCTION public.handle_new_user()   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at()  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user()  TO service_role;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO service_role;

-- User-callable RPCs: keep accessible to signed-in users only (no anon).
REVOKE ALL ON FUNCTION public.create_investment(uuid, numeric, integer)
     FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_pending_investment(uuid, numeric, text, text)   FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_investment(uuid, numeric, integer)
      TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_pending_investment(uuid, numeric, text, text) TO authenticated, service_role;

-- has_role is used by RLS policies; keep callable by signed-in users (no anon).
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;