
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_investment(UUID, NUMERIC, INT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.approve_deposit(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reject_deposit(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.approve_withdrawal(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reject_withdrawal(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
