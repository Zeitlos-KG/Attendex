-- ========================================
-- Supabase Migration: Core Tables
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query
-- ========================================

-- Note: 'profiles' table already exists from auth setup
-- This migrates subjects, timetable, and attendance to Supabase

-- ==========================================
-- 1. SUBJECTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    subgroup TEXT,
    year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint on code+subgroup (not just code, since different subgroups can have same code)
ALTER TABLE public.subjects ADD CONSTRAINT subjects_code_subgroup_unique UNIQUE (code, subgroup);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Everyone can read subjects (they're shared data)
CREATE POLICY "Anyone can read subjects"
    ON public.subjects FOR SELECT
    USING (true);

-- Only authenticated users can insert/update
CREATE POLICY "Authenticated users can insert subjects"
    ON public.subjects FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ==========================================
-- 2. TIMETABLE TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.timetable (
    id BIGSERIAL PRIMARY KEY,
    subject_id BIGINT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    subgroup TEXT,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Class', 'Tutorial', 'Lab')),
    room TEXT,
    instructor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- Everyone can read timetable
CREATE POLICY "Anyone can read timetable"
    ON public.timetable FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert timetable"
    ON public.timetable FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ==========================================
-- 3. ATTENDANCE TABLE (per-user)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.attendance (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timetable_id BIGINT NOT NULL REFERENCES public.timetable(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Present', 'Absent')),
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, timetable_id, date)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Users can only see their own attendance
CREATE POLICY "Users can read own attendance"
    ON public.attendance FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own attendance
CREATE POLICY "Users can insert own attendance"
    ON public.attendance FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own attendance
CREATE POLICY "Users can update own attendance"
    ON public.attendance FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can only delete their own attendance
CREATE POLICY "Users can delete own attendance"
    ON public.attendance FOR DELETE
    USING (auth.uid() = user_id);

-- ==========================================
-- 4. INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_timetable_day ON public.timetable(day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetable_subgroup ON public.timetable(subgroup);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_subgroup ON public.subjects(subgroup);
CREATE INDEX IF NOT EXISTS idx_attendance_timetable ON public.attendance(timetable_id);

-- ==========================================
-- 5. ADD 'year' COLUMN TO PROFILES (if missing)
-- ==========================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'year'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN year INTEGER;
    END IF;
END $$;

-- ==========================================
-- DONE! Your Supabase database is ready.
-- ==========================================
