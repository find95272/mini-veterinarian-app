-- 1. Remove broad SELECT policy on public avatars bucket.
--    Public buckets serve objects by URL directly; listing is not needed and exposes data.
DROP POLICY IF EXISTS "avatars_read_all" ON storage.objects;

-- 2. Revoke EXECUTE on handle_new_user() from anon and authenticated.
--    This is a trigger function; only the trigger itself (running as the table owner) should call it.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- 3. app_config has RLS enabled but no policies, which blocks all access including service role
--    (service role bypasses RLS, so no policy is needed for it).
--    Add explicit deny policies to satisfy the "no policy" finding without opening access.
--    The service role bypasses RLS entirely and can still read/write as intended.
DROP POLICY IF EXISTS "app_config_no_select" ON app_config;
CREATE POLICY "app_config_no_select" ON app_config FOR SELECT
  TO authenticated, anon USING (false);

DROP POLICY IF EXISTS "app_config_no_insert" ON app_config;
CREATE POLICY "app_config_no_insert" ON app_config FOR INSERT
  TO authenticated, anon WITH CHECK (false);

DROP POLICY IF EXISTS "app_config_no_update" ON app_config;
CREATE POLICY "app_config_no_update" ON app_config FOR UPDATE
  TO authenticated, anon USING (false);

DROP POLICY IF EXISTS "app_config_no_delete" ON app_config;
CREATE POLICY "app_config_no_delete" ON app_config FOR DELETE
  TO authenticated, anon USING (false);
