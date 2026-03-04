-- ========================================
-- ATTENDEX DATABASE SETUP FOR SUPABASE
-- ========================================
-- This file creates all necessary tables and security rules
-- Just copy ALL of this and paste in Supabase SQL Editor!

-- Step 1: Create the profiles table
-- This stores user information (name, email, subgroup)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  subgroup text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Step 2: Enable Row Level Security (RLS)
-- This ensures users can only see their own data
alter table public.profiles enable row level security;

-- Step 3: Create security policies
-- These rules control who can read/write data

-- Policy 1: Users can view their own profile
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy 2: Users can update their own profile
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policy 3: Users can create their own profile
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Step 4: Create automatic profile creation function
-- This function runs every time a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public, '';

-- Step 5: Create trigger to run the function
-- This automatically creates a profile when someone signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========================================
-- DONE! 
-- You should see: "Success. No rows returned"
-- If you see an error, copy it and ask for help!
-- ========================================
