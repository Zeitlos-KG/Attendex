# Attendex

> Automated attendance tracking for students at Thapar Institute of Engineering and Technology (TIET).

[![Live Demo](https://img.shields.io/badge/Live%20Demo-attendex--tiet.vercel.app-black?style=flat-square&logo=vercel)](https://attendex-tiet.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square&logo=render)](https://attendex-api.onrender.com/api/health)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-white?style=flat-square&logo=flask&logoColor=black)](https://flask.palletsprojects.com)

---

## What is Attendex?

Attendex lets TIET students track their class attendance in real time. It knows your subgroup's timetable, lets you mark attendance after each class, and calculates how close you are to the 75% cutoff — by subject and overall.

**Key features:**
- 📅 Personalized timetable based on your subgroup (e.g. 1A82, 1B31)
- ✅ One-tap attendance marking per class slot
- 📊 Per-subject attendance % with weighted scoring (Labs count 2×, Tutorials 0.5×)
- 🔔 "Classes needed to reach 75%" calculator
- 🔐 Google Sign-In via Supabase Auth (@thapar.edu only)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, Tailwind CSS, Radix UI, shadcn/ui |
| **Backend API** | Flask 3, Gunicorn, SQLite |
| **Auth & DB** | Supabase (Postgres + Auth) |
| **Deployment** | Vercel (frontend) · Render (backend API) |

---

## Project Structure

```
Attendex/
├── attendance-tracking-app/    # Next.js frontend
│   ├── app/                    # Pages (dashboard, timetable, analytics, etc.)
│   ├── components/             # Shared UI components
│   └── lib/                    # Supabase client, API helpers, utils
│
├── subgroups/                  # Subgroup timetable data & auto-seeding engine
│   ├── 1A/                     # All 54 Pool A subgroups (1A11-1A95)
│   ├── 1B/                     # Pool B subgroups (e.g. 1B28)
│   ├── seed_all.py             # Auto-seeds EVERYTHING recursively on startup/deploy
│   └── skeleton.py             # Copy this to add a new subgroup
│
├── docs/                       # Setup, deployment & resource guides
│   ├── DEPLOYMENT.md           # Main deployment guide
│   └── resources/              # PDFs/Excels for reference
│
├── supabase/                   # SQL migration & setup scripts
├── app.py                      # Flask API entry point (hardened with @require_auth)
├── db.py                       # SQLite / stats helpers
├── auth_middleware.py          # JWT verification & user isolation
├── schema_new.sql              # Database schema
├── render.yaml                 # Render deployment (auto-seeds subgroups)
└── requirements.txt            # Python dependencies
```

---

## Local Development

### Prerequisites
- Node.js 18+, npm
- Python 3.11+
- A [Supabase](https://supabase.com) project

### 1 — Backend (Flask)
```bash
# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.template .env
# Edit .env and add your Supabase keys

# Start Flask dev server
python app.py
# API runs at http://localhost:5000 (seeds subgroups on startup)
```

### 2 — Frontend (Next.js)
```bash
cd attendance-tracking-app

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local and add your Supabase keys + API URL

# Start dev server
npm run dev
# App runs at http://localhost:3000
```

### 3 — How to add a new Subgroup
```bash
# 1. Copy the skeleton
cp subgroups/skeleton.py subgroups/1B/TT_1B31.py

# 2. Fill in the timetable data in the file
# 3. Push and redeploy Render — it auto-appears everywhere!
```

---

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full setup.

**Quick summary:**
- **Frontend → Vercel**: Connect the `attendance-tracking-app/` subfolder. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_API_URL` in Vercel env vars.
- **Backend → Render**: Uses `render.yaml`. Set `SUPABASE_JWT_SECRET` in Render env vars.

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Vercel | Render backend URL (e.g. `https://attendex-api.onrender.com`) |
| `SUPABASE_JWT_SECRET` | Render | From Supabase → Settings → API → JWT Secret |

---

## Contributing / Adding Subgroups

To add support for a new subgroup, see [`timetable_importer/README.md`](timetable_importer/README.md).

---

## License

MIT
