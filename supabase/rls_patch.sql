-- ============================================================
-- ATTENDEX: Supabase RLS Policy Patch for Backend Seeder
-- ============================================================
-- Run this once in Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste & Run
--
-- This allows the Flask backend (connecting via DATABASE_URL /
-- service role) to INSERT & DELETE subjects and timetable rows
-- during the build-time seed. Attendance rows are user-owned
-- and protected by their own policies — they are never touched
-- by the seeder when using Postgres.
-- ============================================================

-- 1. Allow service_role to manage subjects (seed inserts)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subjects' AND policyname = 'Service role can manage subjects'
  ) THEN
    CREATE POLICY "Service role can manage subjects"
      ON public.subjects FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 2. Allow service_role to manage timetable (seed inserts)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'timetable' AND policyname = 'Service role can manage timetable'
  ) THEN
    CREATE POLICY "Service role can manage timetable"
      ON public.timetable FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- 3. Ensure weight_override column exists on timetable
--    (may be missing if only the basic migration was run)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'timetable'
      AND column_name  = 'weight_override'
  ) THEN
    ALTER TABLE public.timetable ADD COLUMN weight_override DOUBLE PRECISION;
  END IF;
END $$;

-- 4. Ensure room + instructor columns exist on timetable
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'timetable'
      AND column_name  = 'room'
  ) THEN
    ALTER TABLE public.timetable ADD COLUMN room TEXT DEFAULT '';
    ALTER TABLE public.timetable ADD COLUMN instructor TEXT DEFAULT '';
  END IF;
END $$;

-- 5. Add unique constraint on timetable to support ON CONFLICT DO NOTHING
--    (only if it doesn't already exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.timetable'::regclass
      AND conname  = 'timetable_subject_day_start_unique'
  ) THEN
    ALTER TABLE public.timetable
      ADD CONSTRAINT timetable_subject_day_start_unique
      UNIQUE (subject_id, day_of_week, start_time, type);
  END IF;
END $$;

-- ============================================================
-- DONE! You should see: "Success. No rows returned"
-- ============================================================
