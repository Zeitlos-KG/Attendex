"""
seed_all.py — Auto-seeds all TT_*.py subgroup timetables into the database.

Run this to populate the DB:
    python subgroups/seed_all.py

This runs automatically on every Render deploy (see render.yaml buildCommand).
To add a new subgroup: create subgroups/TT_XXXX.py, push to GitHub, redeploy.
"""

import os, sys, glob, importlib.util, sqlite3

# Allow imports from project root (db.py, schema_new.sql)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from db import init_db, get_db_connection

# ── 1. Ensure DB schema exists ──────────────────────────────────────────────
print("Initialising database schema...")
init_db()
print("✓ Schema ready\n")

# ── 2. Discover all TT_*.py files in this folder ────────────────────────────
FOLDER   = os.path.dirname(os.path.abspath(__file__))
tt_files = sorted(glob.glob(os.path.join(FOLDER, "TT_*.py")))

if not tt_files:
    print("No TT_*.py files found in subgroups/ — nothing to seed.")
    sys.exit(0)

print(f"Found {len(tt_files)} subgroup file(s): {[os.path.basename(f) for f in tt_files]}\n")

# ── 3. Seed each one ─────────────────────────────────────────────────────────
seeded = []

for filepath in tt_files:
    spec = importlib.util.spec_from_file_location("tt_module", filepath)
    mod  = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    subgroup = mod.SUBGROUP
    year     = mod.YEAR
    subjects  = mod.subjects
    timetable = mod.timetable

    conn = get_db_connection()
    c    = conn.cursor()

    # Clear existing data for this subgroup
    c.execute("DELETE FROM attendance WHERE timetable_id IN (SELECT id FROM timetable WHERE subgroup=?)", (subgroup,))
    c.execute("DELETE FROM timetable  WHERE subgroup=?", (subgroup,))
    c.execute("DELETE FROM subjects   WHERE subgroup=?", (subgroup,))
    conn.commit()

    # Insert subjects
    ids = {}
    for name, code in subjects:
        c.execute(
            "INSERT INTO subjects (name, code, subgroup, year) VALUES (?, ?, ?, ?)",
            (name, code, subgroup, year)
        )
        conn.commit()
        ids[code] = c.execute(
            "SELECT id FROM subjects WHERE code=? AND subgroup=?", (code, subgroup)
        ).fetchone()[0]

    # Insert timetable
    DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    for code, day, start, end, typ in timetable:
        c.execute(
            "INSERT INTO timetable (subject_id, subgroup, day_of_week, start_time, end_time, type, room, instructor) VALUES (?,?,?,?,?,?,?,?)",
            (ids[code], subgroup, day, start, end, typ, "", "")
        )

    conn.commit()
    conn.close()

    print(f"  ✅ {subgroup:8s} — {len(subjects)} subjects, {len(timetable)} timetable slots")
    seeded.append(subgroup)

print(f"\n✅ Done! Seeded {len(seeded)} subgroup(s): {', '.join(seeded)}")
print("   /api/subgroups will now return all of the above.")
