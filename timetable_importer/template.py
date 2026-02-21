"""
Timetable Importer Template
============================
Copy this file, rename it to import_<SUBGROUP>.py (e.g. import_1B31.py),
fill in the subjects and timetable_entries, then run:

    python timetable_importer/import_<SUBGROUP>.py

This will insert data into the local student_planner.db SQLite database,
and also push entries to Render via the API if RENDER_API_URL is set.

SUBGROUP FORMAT:  <Year><Section><Group#><Pool>
  Examples: 1A82, 1B31, 2CSE11, 3ECE21

CLASS TYPES:
  - "Class"    → 50-min lecture
  - "Tutorial" → 50-min (or 100-min) tutorial
  - "Lab"      → 100-min practical

DAYS:  0=Monday  1=Tuesday  2=Wednesday  3=Thursday  4=Friday
"""

import sqlite3
import os

# ─────────────────────────────────────────────
# CONFIG — change these for each subgroup
# ─────────────────────────────────────────────

SUBGROUP = "XYZAB"   # e.g. "1B31"
YEAR = 1             # 1, 2, 3, or 4

subjects = [
    # (Subject Name,              Subject Code,  Subgroup,  Year)
    ("Physics",                   "UPH013",      SUBGROUP,  YEAR),
    ("Engineering Drawing",       "UES101",      SUBGROUP,  YEAR),
    ("Maths II",                  "UMA023",      SUBGROUP,  YEAR),
    ("Professional Communication","UHU003",      SUBGROUP,  YEAR),
    ("Manufacturing Processes",   "UES102",      SUBGROUP,  YEAR),
    # Add more subjects here...
]

timetable_entries = [
    # (Subject Code,  Day,  Start,   End,     Type)

    # MONDAY
    # ("UMA023",      0,    "09:40", "10:30", "Tutorial"),

    # TUESDAY
    # ("UES101",      1,    "08:00", "08:50", "Class"),

    # WEDNESDAY
    # ("UES101",      2,    "13:00", "14:40", "Tutorial"),

    # THURSDAY
    # ("UPH013",      3,    "09:40", "10:30", "Class"),

    # FRIDAY
    # ("UMA023",      4,    "09:40", "10:30", "Class"),
]

# ─────────────────────────────────────────────
# IMPORTER — do not edit below this line
# ─────────────────────────────────────────────

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "student_planner.db")

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

print("=" * 70)
print(f"IMPORTING TIMETABLE FOR {SUBGROUP}")
print("=" * 70)

# Clear old data for this subgroup
c.execute("DELETE FROM attendance WHERE timetable_id IN (SELECT id FROM timetable WHERE subgroup = ?)", (SUBGROUP,))
c.execute("DELETE FROM timetable WHERE subgroup = ?", (SUBGROUP,))
c.execute("DELETE FROM subjects WHERE subgroup = ?", (SUBGROUP,))
conn.commit()
print(f"✓ Cleared old {SUBGROUP} data\n")

# Insert subjects
print("INSERTING SUBJECTS")
print("-" * 40)
for name, code, subgroup, year in subjects:
    c.execute(
        "INSERT INTO subjects (name, code, subgroup, year) VALUES (?, ?, ?, ?)",
        (name, code, subgroup, year)
    )
    print(f"  ✓ {code} — {name}")
conn.commit()

# Get subject IDs
subject_ids = {}
for name, code, _, _ in subjects:
    c.execute("SELECT id FROM subjects WHERE code = ? AND subgroup = ?", (code, SUBGROUP))
    row = c.fetchone()
    if row:
        subject_ids[code] = row[0]

# Insert timetable
print("\nINSERTING TIMETABLE ENTRIES")
print("-" * 40)
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

for subject_code, day_idx, start_time, end_time, class_type in timetable_entries:
    if subject_code not in subject_ids:
        print(f"  ✗ SKIP: {subject_code} not in subjects list")
        continue
    subject_id = subject_ids[subject_code]
    c.execute(
        "INSERT INTO timetable (subject_id, subgroup, day_of_week, start_time, end_time, type, room, instructor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (subject_id, SUBGROUP, day_idx, start_time, end_time, class_type, "", "")
    )
    subject_name = next(name for name, code, _, _ in subjects if code == subject_code)
    print(f"  ✓ {DAYS[day_idx]:9s} {start_time}–{end_time}  {subject_code}  {class_type}  ({subject_name})")

conn.commit()

# Summary
print("\n" + "=" * 70)
c.execute("SELECT COUNT(*) FROM subjects WHERE subgroup = ?", (SUBGROUP,))
print(f"✓ Subjects:          {c.fetchone()[0]}")
c.execute("SELECT COUNT(*) FROM timetable WHERE subgroup = ?", (SUBGROUP,))
print(f"✓ Timetable entries: {c.fetchone()[0]}")
conn.close()

print(f"\n✅ Import complete for {SUBGROUP}!")
print("   Run this on Render or update the DB to push to production.")
