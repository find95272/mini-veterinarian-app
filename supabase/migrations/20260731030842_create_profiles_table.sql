/*
# Create profiles table for user accounts

1. New Tables
- `profiles`
  - `id` (uuid, primary key, references auth.users) — the user's auth id
  - `email` (text, not null) — user email, denormalized for convenience
  - `display_name` (text) — optional display name shown in the UI
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `profiles`.
- Owner-scoped CRUD: each authenticated user can only read/update their own row.
- No anon access — a profile requires an authenticated session.
- INSERT is handled server-side via a trigger (see below) so users do not insert
  their own row; the policy still allows an authenticated owner to insert if needed.
3. Trigger
- `handle_new_user` trigger on auth.users creates a profiles row automatically on signup,
  copying the user's id and email. This keeps profiles in sync with auth.users.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create a profile row when a new auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
