/*
# Expand pets table and add health tracking tables

## Changes

### 1. Expand existing `pets` table
- Add columns: weight (numeric), birthday (date), microchip_id (text),
  neuter_status (text), allergies (text), chronic_conditions (text),
  photo_url (text), health_score (int, default 80)

### 2. New table: `weight_records`
- Tracks pet weight over time for growth curves
- Columns: id, pet_id (FK), weight (numeric), recorded_at (date)

### 3. New table: `vaccinations`
- Pet vaccination records
- Columns: id, pet_id (FK), vaccine_name, date_administered, next_due

### 4. New table: `dewormings`
- Pet deworming records
- Columns: id, pet_id (FK), product_name, date_administered, next_due

### 5. New table: `health_events`
- Health timeline events (visits, symptoms, plans, meds)
- Columns: id, pet_id (FK), event_type, title, description, severity, event_date

### 6. New table: `care_plans`
- Saved AI-generated care plans
- Columns: id, user_id, pet_id, species, symptoms (text[]), plan_text, created_at

### 7. New table: `reminders`
- Scheduled care reminders
- Columns: id, pet_id (FK), reminder_type, title, due_date, completed, completed_at

### 8. New table: `check_ins`
- Daily check-in streak tracking
- Columns: id, user_id, check_in_date, streak_count

### 9. New table: `achievements`
- User achievement badges
- Columns: id, user_id, badge_id, earned_at

### Security
- All tables have RLS enabled
- All tables are owner-scoped via user_id or pet_id -> pets.user_id
- 4 policies per table (SELECT/INSERT/UPDATE/DELETE)
*/

-- 1. Expand pets table
ALTER TABLE pets
  ADD COLUMN IF NOT EXISTS weight numeric,
  ADD COLUMN IF NOT EXISTS birthday date,
  ADD COLUMN IF NOT EXISTS microchip_id text,
  ADD COLUMN IF NOT EXISTS neuter_status text DEFAULT '未知',
  ADD COLUMN IF NOT EXISTS allergies text,
  ADD COLUMN IF NOT EXISTS chronic_conditions text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS health_score int DEFAULT 80;

-- 2. weight_records
CREATE TABLE IF NOT EXISTS weight_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  weight numeric NOT NULL,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_weight_records" ON weight_records;
CREATE POLICY "select_own_weight_records" ON weight_records FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = weight_records.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_weight_records" ON weight_records;
CREATE POLICY "insert_own_weight_records" ON weight_records FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = weight_records.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "update_own_weight_records" ON weight_records;
CREATE POLICY "update_own_weight_records" ON weight_records FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = weight_records.pet_id AND pets.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = weight_records.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_own_weight_records" ON weight_records;
CREATE POLICY "delete_own_weight_records" ON weight_records FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = weight_records.pet_id AND pets.user_id = auth.uid())
  );

-- 3. vaccinations
CREATE TABLE IF NOT EXISTS vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name text NOT NULL,
  date_administered date NOT NULL,
  next_due date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_vaccinations" ON vaccinations;
CREATE POLICY "select_own_vaccinations" ON vaccinations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = vaccinations.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_vaccinations" ON vaccinations;
CREATE POLICY "insert_own_vaccinations" ON vaccinations FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = vaccinations.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "update_own_vaccinations" ON vaccinations;
CREATE POLICY "update_own_vaccinations" ON vaccinations FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = vaccinations.pet_id AND pets.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = vaccinations.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_own_vaccinations" ON vaccinations;
CREATE POLICY "delete_own_vaccinations" ON vaccinations FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = vaccinations.pet_id AND pets.user_id = auth.uid())
  );

-- 4. dewormings
CREATE TABLE IF NOT EXISTS dewormings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  date_administered date NOT NULL,
  next_due date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE dewormings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_dewormings" ON dewormings;
CREATE POLICY "select_own_dewormings" ON dewormings FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = dewormings.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_dewormings" ON dewormings;
CREATE POLICY "insert_own_dewormings" ON dewormings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = dewormings.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "update_own_dewormings" ON dewormings;
CREATE POLICY "update_own_dewormings" ON dewormings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = dewormings.pet_id AND pets.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = dewormings.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_own_dewormings" ON dewormings;
CREATE POLICY "delete_own_dewormings" ON dewormings FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = dewormings.pet_id AND pets.user_id = auth.uid())
  );

-- 5. health_events
CREATE TABLE IF NOT EXISTS health_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT 'symptom',
  title text NOT NULL,
  description text,
  severity text DEFAULT 'normal',
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE health_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_health_events" ON health_events;
CREATE POLICY "select_own_health_events" ON health_events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_events.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_health_events" ON health_events;
CREATE POLICY "insert_own_health_events" ON health_events FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_events.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "update_own_health_events" ON health_events;
CREATE POLICY "update_own_health_events" ON health_events FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_events.pet_id AND pets.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_events.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_own_health_events" ON health_events;
CREATE POLICY "delete_own_health_events" ON health_events FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_events.pet_id AND pets.user_id = auth.uid())
  );

-- 6. care_plans
CREATE TABLE IF NOT EXISTS care_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id uuid REFERENCES pets(id) ON DELETE SET NULL,
  species text,
  symptoms text[],
  plan_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_care_plans" ON care_plans;
CREATE POLICY "select_own_care_plans" ON care_plans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_care_plans" ON care_plans;
CREATE POLICY "insert_own_care_plans" ON care_plans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_care_plans" ON care_plans;
CREATE POLICY "update_own_care_plans" ON care_plans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_care_plans" ON care_plans;
CREATE POLICY "delete_own_care_plans" ON care_plans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 7. reminders
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  reminder_type text NOT NULL DEFAULT 'checkup',
  title text NOT NULL,
  due_date date NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reminders" ON reminders;
CREATE POLICY "select_own_reminders" ON reminders FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = reminders.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_own_reminders" ON reminders;
CREATE POLICY "insert_own_reminders" ON reminders FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = reminders.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "update_own_reminders" ON reminders;
CREATE POLICY "update_own_reminders" ON reminders FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = reminders.pet_id AND pets.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = reminders.pet_id AND pets.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_own_reminders" ON reminders;
CREATE POLICY "delete_own_reminders" ON reminders FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = reminders.pet_id AND pets.user_id = auth.uid())
  );

-- 8. check_ins
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date date NOT NULL,
  streak_count int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, check_in_date)
);
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_check_ins" ON check_ins;
CREATE POLICY "select_own_check_ins" ON check_ins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_check_ins" ON check_ins;
CREATE POLICY "insert_own_check_ins" ON check_ins FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_check_ins" ON check_ins;
CREATE POLICY "update_own_check_ins" ON check_ins FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_check_ins" ON check_ins;
CREATE POLICY "delete_own_check_ins" ON check_ins FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 9. achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_achievements" ON achievements;
CREATE POLICY "select_own_achievements" ON achievements FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_achievements" ON achievements;
CREATE POLICY "insert_own_achievements" ON achievements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_achievements" ON achievements;
CREATE POLICY "delete_own_achievements" ON achievements FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Expand profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS level int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS xp int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS notify_vaccines boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_reminders boolean DEFAULT true;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_weight_records_pet_id ON weight_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_dewormings_pet_id ON dewormings(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_events_pet_id ON health_events(pet_id);
CREATE INDEX IF NOT EXISTS idx_care_plans_user_id ON care_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_pet_id ON reminders(pet_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
