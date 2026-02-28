-- ===============================================
-- ATTENDEX PRODUCTION SCHEMA (SUPABASE POSTGRES)
-- Fully idempotent — safe to run on every startup
-- ===============================================

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    subgroup TEXT,
    year INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    subgroup TEXT,
    year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(code, subgroup)
);

-- 3. Timetable
CREATE TABLE IF NOT EXISTS public.timetable (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    subgroup TEXT,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Class', 'Tutorial', 'Lab')),
    weight_override DOUBLE PRECISION,
    room TEXT,
    instructor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    timetable_id INTEGER NOT NULL REFERENCES public.timetable(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(timetable_id, date, user_id)
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_timetable_subgroup ON public.timetable(subgroup);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- 6. RLS policies — wrapped in DO blocks so they never fail if already exist
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage their own attendance"
    ON public.attendance FOR ALL
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Postgres user can manage attendance"
    ON public.attendance FOR ALL
    TO postgres
    USING (true)
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Note: subjects and timetable have RLS disabled (set via Supabase dashboard)
-- so no policies needed for them — the Flask backend can read/write freely.
