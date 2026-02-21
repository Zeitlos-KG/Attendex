# Attendex Deployment Plan

## Overview
This document outlines the complete deployment strategy for Attendex, including authentication, database migration, and production deployment.

---

## Phase 1: Supabase Authentication Setup ✅ IN PROGRESS

### Prerequisites
- [ ] Supabase account (free tier is sufficient to start)
- [ ] GitHub account (for OAuth integration)
- [ ] Node.js and npm installed

### Step 1.1: Create Supabase Project

1. **Sign up/Login to Supabase**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "Start your project" or "Sign in"
   - Use GitHub OAuth for easy login

2. **Create a New Project**
   - Click "New Project" button
   - Fill in the details:
     - **Organization**: Create new or select existing
     - **Project Name**: `attendex` (or your preferred name)
     - **Database Password**: Generate a strong password (SAVE THIS!)
     - **Region**: Choose closest to your users (e.g., `ap-south-1` for India)
     - **Pricing Plan**: Free tier is fine for development
   - Click "Create new project"
   - Wait 2-3 minutes for project provisioning

3. **Note Down Your Project Details**
   - After creation, go to Project Settings → API
   - Save these values (we'll use them later):
     - `Project URL` (e.g., https://xxxxxxxxxxxxx.supabase.co)
     - `anon public` key
     - `service_role` key (keep this secret!)

### Step 1.2: Configure Authentication Providers

1. **Email Authentication (Primary)**
   - Go to Authentication → Providers in Supabase dashboard
   - **Email provider** should be enabled by default
   - Configure settings:
     - ✅ Enable email confirmations (recommended for production)
     - ✅ Enable "Confirm email" for security
     - For development: You can disable confirmations temporarily

2. **Add Thapar Email Domain Restriction (Optional but Recommended)**
   - Go to Authentication → URL Configuration
   - Under "Redirect URLs", we'll configure this after frontend setup

### Step 1.3: Install Supabase Client Libraries

```bash
# Navigate to your Next.js app directory
cd "attendance-tracking-app"

# Install Supabase packages
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Install additional auth UI components (optional)
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

### Step 1.4: Configure Environment Variables

1. **Update `.env.local` file**
   - Add Supabase credentials:
   ```env
   # Existing API
   NEXT_PUBLIC_API_URL=http://localhost:5000/api

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

2. **Create `.env.example` for team reference**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```

### Step 1.5: Create Supabase Client Utilities

We'll create utility files to interact with Supabase:

1. **Client-side Supabase client** (`lib/supabase/client.ts`)
   - For browser-side auth operations

2. **Server-side Supabase client** (`lib/supabase/server.ts`)
   - For server components and API routes

3. **Middleware** (`middleware.ts`)
   - For protecting routes and managing sessions

### Step 1.6: Implement Authentication Flow

1. **Replace current localStorage auth with Supabase**
   - Update login page (`app/page.tsx`)
   - Create proper login/signup forms
   - Add email verification flow
   - Implement password reset

2. **Add Thapar Email Validation**
   - Client-side validation for @thapar.edu domain
   - Server-side validation using Supabase functions or triggers

3. **Protect Routes**
   - Add middleware to check authentication
   - Redirect unauthenticated users to login
   - Preserve user session across page refreshes

### Step 1.7: Update User Profile Management

1. **Create users table in Supabase**
   ```sql
   create table public.profiles (
     id uuid references auth.users on delete cascade primary key,
     email text unique not null,
     full_name text,
     subgroup text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Enable RLS (Row Level Security)
   alter table public.profiles enable row level security;

   -- Create policies
   create policy "Users can view their own profile"
     on public.profiles for select
     using (auth.uid() = id);

   create policy "Users can update their own profile"
     on public.profiles for update
     using (auth.uid() = id);
   ```

2. **Create trigger to auto-create profile**
   ```sql
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

   create trigger on_auth_user_created
     after insert on auth.users
     for each row execute procedure public.handle_new_user();
   ```

### Step 1.8: Testing Authentication

1. **Test signup flow**
   - Create new account with @thapar.edu email
   - Verify email confirmation (if enabled)
   - Check profile creation in Supabase dashboard

2. **Test login flow**
   - Login with created credentials
   - Verify session persistence
   - Test protected routes

3. **Test logout flow**
   - Logout and verify redirect
   - Ensure session is cleared

### Step 1.9: Migration Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Supabase client libraries installed
- [ ] Client utilities created
- [ ] Auth flow implemented
- [ ] Email domain validation added
- [ ] Database schema created
- [ ] RLS policies configured
- [ ] User profiles working
- [ ] All auth flows tested

---

## Phase 2: Database Migration to Supabase

### Step 2.1: Export Current Database Schema
- Export PostgreSQL schema from current backend
- Review and adapt for Supabase

### Step 2.2: Create Tables in Supabase
- Run migration scripts
- Set up proper indexes
- Configure RLS policies

### Step 2.3: Migrate Existing Data
- Export data from current database
- Import into Supabase
- Verify data integrity

---

## Phase 3: Backend API Migration

### Step 3.1: Update API to Use Supabase
- Modify Python backend to use Supabase client
- Update authentication checks
- Migrate database queries

### Step 3.2: API Route Updates
- Update all endpoints to work with Supabase
- Add proper error handling
- Test all API routes

---

## Phase 4: Frontend Updates

### Step 4.1: Update API Calls
- Modify API client to use Supabase
- Update auth context
- Test all features

### Step 4.2: Error Handling
- Add proper error messages
- Implement loading states
- Add retry logic

---

## Phase 5: Production Deployment

### Step 5.1: Frontend Deployment (Vercel)
- Connect GitHub repository
- Configure environment variables
- Deploy to production

### Step 5.2: Backend Deployment
- Choose hosting (Railway, Render, or Fly.io)
- Configure environment
- Deploy API

### Step 5.3: Final Configuration
- Update CORS settings
- Configure custom domain (optional)
- Set up monitoring

---

## Security Checklist

- [ ] RLS policies on all tables
- [ ] Email verification enabled
- [ ] Secure environment variables
- [ ] HTTPS enforced
- [ ] Rate limiting configured
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF protection enabled

---

## Rollback Plan

If any issues occur:
1. Keep current backend running
2. Use feature flags to toggle between old/new auth
3. Database backups before migration
4. Document all changes for easy rollback

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Auth Helpers**: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- **Next.js Integration**: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
