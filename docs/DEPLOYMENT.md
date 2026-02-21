# Deployment Guide

Full deployment guide for Attendex — Flask backend on Render, Next.js frontend on Vercel.

---

## 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase_migration.sql` (in the project root)
3. Go to **Authentication → URL Configuration**:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: `https://your-project.vercel.app/auth/callback`
4. Enable **Google OAuth** under Authentication → Providers (optional but recommended)
5. Copy your **Project URL**, **Anon Key**, and **JWT Secret** from Settings → API

---

## 2. Render (Backend API)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service → connect your repo
3. Render auto-detects `render.yaml` — no manual config needed
4. In **Environment Variables**, add:
   - `SUPABASE_JWT_SECRET` → from Supabase → Settings → API → JWT Secret
5. Deploy. Note your Render URL (e.g. `https://attendex-api.onrender.com`)
6. Seed data: In Render → Shell, run `python timetable_importer/import_1a82.py`

**Keep-alive:** Set up [UptimeRobot](https://uptimerobot.com) to ping `https://your-render-url.onrender.com/api/health` every 15 minutes to prevent Render free-tier sleep.

---

## 3. Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set **Root Directory** to `attendance-tracking-app`
3. Add these **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key  
   - `NEXT_PUBLIC_API_URL` → your Render URL (e.g. `https://attendex-api.onrender.com`)
4. Deploy

---

## Verification

After deploying both:
- [ ] Visit `https://your-render-url/api/health` → should return `{"status":"healthy"}`
- [ ] Visit `https://your-render-url/api/subgroups` → should return a list like `["1A82"]`
- [ ] Visit your Vercel URL → landing page loads
- [ ] Sign in → should redirect to `/onboarding`
- [ ] Select subgroup → should redirect to `/dashboard` with timetable data
