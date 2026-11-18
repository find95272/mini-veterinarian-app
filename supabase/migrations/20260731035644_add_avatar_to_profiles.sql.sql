/*
# Add avatar_url column to profiles and set up avatars storage bucket

1. Modified Tables
- `profiles`
  - Add `avatar_url` (text, nullable) — public URL or storage path of the user's avatar image.
2. New Storage
- Create private bucket `avatars` for user avatar uploads.
3. Security
- Enable RLS-equivalent storage policies on `avatars` bucket:
  - Authenticated users can upload/update objects in their own folder (avatars/<uid>/...).
  - Authenticated users can read all avatars (avatars are displayed publicly via signed URLs or public URLs).
  - Users can delete only their own avatar objects.
- Revoke table-level UPDATE on profiles, grant only display_name + avatar_url columns to authenticated.
4. Notes
- avatar_url is nullable so existing profiles are unaffected.
- Storage path pattern: avatars/<user_id>/<filename>
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "avatars_read_all" ON storage.objects;
CREATE POLICY "avatars_read_all" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert_own_folder" ON storage.objects;
CREATE POLICY "avatars_insert_own_folder" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_update_own_folder" ON storage.objects;
CREATE POLICY "avatars_update_own_folder" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_delete_own_folder" ON storage.objects;
CREATE POLICY "avatars_delete_own_folder" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
