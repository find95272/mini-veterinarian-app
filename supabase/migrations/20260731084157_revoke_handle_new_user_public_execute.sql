-- Revoke EXECUTE on handle_new_user() from PUBLIC.
-- The previous migration revoked anon and authenticated explicitly, but the
-- PUBLIC pseudo-role grant still covers them. Revoking PUBLIC closes the gap.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
