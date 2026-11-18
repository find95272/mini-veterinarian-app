/*
# Create pets table for user's pets

1. New Tables
- `pets`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users) — owner
  - `name` (text, not null) — pet name
  - `species` (text, not null) — species/type e.g. 猫/狗/兔子
  - `gender` (text) — 性别: 公/母/未知
  - `age` (text) — 年龄 (free text, e.g. "2岁" or "6个月")
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `pets`.
- Owner-scoped CRUD: each authenticated user can only access their own pets.
- No anon access.
3. Notes
- `user_id` defaults to `auth.uid()` so frontend inserts omitting user_id succeed.
- age is free-text to accommodate months/years flexibly.
*/

CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL,
  gender text,
  age text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_pets" ON pets;
CREATE POLICY "select_own_pets" ON pets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_pets" ON pets;
CREATE POLICY "insert_own_pets" ON pets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_pets" ON pets;
CREATE POLICY "update_own_pets" ON pets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_pets" ON pets;
CREATE POLICY "delete_own_pets" ON pets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
