# Attendex

> Attendance tracking for students at Thapar Institute of Engineering and Technology (TIET).

[![Live Demo](https://img.shields.io/badge/Live%20Demo-attendex--tiet.vercel.app-black?style=flat-square&logo=vercel)](https://attendex-tiet.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square&logo=render)](https://attendex-api.onrender.com/api/health)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-white?style=flat-square&logo=flask&logoColor=black)](https://flask.palletsprojects.com)

---

## What is Attendex?

Attendex lets TIET students track their class attendance in real time. It knows your subgroup's timetable, lets you mark attendance after each class, and calculates how close you are to the 75% cutoff — by subject and overall.

**Features**
- 📅 Personalized timetable per subgroup (e.g. `1A82`, `1B31`)
- ✅ One-tap attendance marking per class slot
- 📊 Per-subject attendance % with weighted scoring (Labs 2×, Tutorials 0.5×)
- 📈 Analytics dashboard with daily trend chart and subject-wise comparison
- 🔐 Google Sign-In via Supabase Auth (`@thapar.edu` only)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, Tailwind CSS v4, Radix UI / shadcn-ui |
| **Backend API** | Flask 3, Gunicorn |
| **Auth & Database** | Supabase (Postgres + Auth) |
| **Deployment** | Vercel (frontend) · Render (backend) |

---

## Project Structure

```
Attendex/
├── attendance-tracking-app/    # Next.js frontend
│   ├── app/                    # Pages (dashboard, timetable, analytics, mark-attendance, profile)
│   ├── components/             # Shared UI components (Navbar, AuthModals, charts)
│   └── lib/                    # Supabase client, API helpers, subgroup utils
│
├── subgroups/                  # Timetable data + seeding engine
│   ├── 1A/                     # Pool A subgroups (1A11 – 1A95)
│   ├── 1B/                     # Pool B subgroups
│   ├── seed_all.py             # Auto-seeds all subgroups on backend startup
│   └── skeleton.py             # Template for adding a new subgroup
│
├── supabase/                   # SQL migration scripts
├── docs/                       # Deployment guides
│
├── app.py                      # Flask API (auth-protected endpoints)
├── auth_middleware.py          # Supabase JWT verification
├── db.py                       # Database helpers & attendance stats
├── render.yaml                 # Render deployment config
└── requirements.txt            # Python dependencies
```

---

## Local Development

### Prerequisites
- Node.js 18+, npm
- Python 3.11+
- A [Supabase](https://supabase.com) project

### Backend (Flask)
```bash
pip install -r requirements.txt
cp .env.template .env          # fill in your Supabase keys
python app.py                  # → http://localhost:5000
```

### Frontend (Next.js)
```bash
cd attendance-tracking-app
npm install
cp .env.example .env.local     # fill in Supabase keys + API URL
npm run dev                    # → http://localhost:3000
```

### Adding a new subgroup
```bash
cp subgroups/skeleton.py subgroups/1B/TT_1B99.py
# Fill in the timetable data, then push and redeploy Render
```

---

## Deployment

**Frontend → Vercel**
Connect the `attendance-tracking-app/` subfolder. Set these env vars in Vercel:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | Render backend URL |

**Backend → Render**
Uses `render.yaml`. Set `SUPABASE_JWT_SECRET` in Render env vars (from Supabase → Settings → API → JWT Secret).

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full guide.

---

## License

MIT
