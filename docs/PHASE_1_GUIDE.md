# Phase 1 Implementation Guide: Supabase Authentication

## 🎯 What We're Building
Replacing the current localStorage-based authentication with production-ready Supabase authentication.

---

## 📋 Step-by-Step Implementation

### ✅ STEP 1: Create Supabase Account & Project (15 minutes)

1. **Go to Supabase**
   - Visit: https://supabase.com
   - Click "Start your project"
   - Sign in with GitHub (recommended)

2. **Create New Project**
   ```
   Organization: Create new or select existing
   Project Name: attendex-production
   Database Password: [Generate strong password - SAVE IT!]
   Region: ap-south-1 (Asia Pacific - Mumbai) [Closest to Indian users]
   Plan: Free
   ```
   - Click "Create new project"
   - **⏱ Wait 2-3 minutes** for provisioning

3. **Get Your API Keys**
   - Once ready, go to: **Settings** → **API**
   - Copy and save these:
     ```
     Project URL: https://xxxxxxxxxxxxx.supabase.co
     anon/public key: eyJhbGc...
     service_role key: eyJhbGc... (KEEP SECRET!)
     ```

---

### ✅ STEP 2: Install Dependencies (2 minutes)

Open terminal in your project folder and run:

```bash
cd "c:\Users\Krishiv Gupta\Desktop\Attendex - Scaling it\attendance-tracking-app"

npm install @supabase/supabase-js @supabase/ssr
```

**What these packages do:**
- `@supabase/supabase-js`: Core Supabase client
- `@supabase/ssr`: Server-side rendering helpers for Next.js

---

### ✅ STEP 3: Configure Environment Variables (3 minutes)

1. **Open `.env.local` file**
2. **Add your Supabase credentials:**

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. **Replace the placeholder values** with your actual keys from Step 1

⚠️ **IMPORTANT**: 
- Never commit `.env.local` to git
- The file should already be in `.gitignore`

---

### ✅ STEP 4: Setup Database Schema (10 minutes)

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Click "New query"**
3. **Copy and paste this SQL:**

```sql
-- Create profiles table to store user data
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  subgroup text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for secure access
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create function to handle new user creation
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
$$ language plpgsql security definer;

-- Create trigger to automatically create profile for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

4. **Click "Run"** or press `Ctrl+Enter`
5. **Verify**: You should see "Success. No rows returned"

**What this does:**
- Creates `profiles` table for user data
- Enables Row Level Security (RLS) for data protection
- Auto-creates profile when user signs up
- Only allows users to see/edit their own data

---

### ✅ STEP 5: Configure Email Authentication (5 minutes)

1. **Go to Supabase Dashboard** → **Authentication** → **Providers**

2. **Configure Email settings:**
   - Email provider should be **enabled** by default
   - Click on **Email** to configure

3. **For Development (Quick Testing):**
   - ✅ Enable Email provider
   - ❌ Disable "Confirm email" (makes testing faster)
   - Click Save

4. **For Production (Later):**
   - ✅ Enable Email provider
   - ✅ Enable "Confirm email"
   - ✅ Customize email templates (optional)

---

### ✅ STEP 6: Files Already Created ✅

The following files have been automatically created for you:

```
✅ lib/supabase/client.ts       - Browser-side auth
✅ lib/supabase/server.ts       - Server-side auth
✅ lib/supabase/middleware.ts   - Route protection utilities
✅ middleware.ts                - Next.js middleware
```

**What they do:**
- **client.ts**: Handles login, signup in the browser
- **server.ts**: Handles auth in server components
- **middleware.ts**: Protects routes, manages sessions
- **Route protection**: Auto-redirects if not logged in

---

### ✅ STEP 7: Update Login Page (30 minutes)

Now we need to update `app/page.tsx` to use Supabase instead of localStorage.

**Key changes needed:**
1. Replace localStorage auth with Supabase
2. Add proper signup flow
3. Add email validation for @thapar.edu
4. Handle auth errors properly
5. Add loading states

I'll create an updated version of this file next.

---

### ✅ STEP 8: Test Authentication (10 minutes)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test Signup:**
   - Go to http://localhost:3000
   - Click "Get Started" or "Sign In"
   - Enter email: `yourname@thapar.edu`
   - Enter password (min 6 characters)
   - Click "Sign up"

3. **Check Supabase Dashboard:**
   - Go to **Authentication** → **Users**
   - You should see your new user!
   - Go to **Database** → **profiles**
   - Profile should be auto-created

4. **Test Login:**
   - Logout
   - Login with same credentials
   - Should redirect to dashboard

5. **Test Route Protection:**
   - Logout
   - Try to visit `/dashboard` directly
   - Should redirect to login

---

## 🎨 What's Next?

After completing Phase 1:
- ✅ Proper authentication system
- ✅ Secure user sessions
- ✅ Protected routes
- ✅ User profiles in database

**Next Phases:**
- Phase 2: Migrate attendance data to Supabase
- Phase 3: Update API to use Supabase
- Phase 4: Deploy to production

---

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Double-check `.env.local` has correct keys
- Restart dev server after changing .env

### Error: "Failed to fetch"
- Check Supabase project is running (green status)
- Verify NEXT_PUBLIC_SUPABASE_URL is correct

### User created but no profile
- Check the trigger was created successfully
- Run the SQL again in SQL Editor

### Can't login after signup
- If email confirmation is enabled, check email
- Or disable email confirmation for testing

---

## 📚 Useful Commands

```bash
# Install packages
npm install @supabase/supabase-js @supabase/ssr

# Start dev server
npm run dev

# Check for errors
npm run build
```

---

## 🔗 Resources

- **Supabase Docs**: https://supabase.com/docs
- **Auth Guide**: https://supabase.com/docs/guides/auth
- **Next.js Guide**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ Phase 1 Completion Checklist

- [ ] Supabase account created
- [ ] Project provisioned
- [ ] API keys saved in .env.local
- [ ] Dependencies installed
- [ ] Database schema created
- [ ] Email auth configured
- [ ] Utility files reviewed
- [ ] Login page updated
- [ ] Signup tested successfully
- [ ] Login tested successfully
- [ ] Route protection tested
- [ ] User profile created automatically

**Once all checked, Phase 1 is complete! 🎉**
