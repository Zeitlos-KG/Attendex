"""
1A82 Timetable Importer
Sem 2 — Jan to May 2026 — TIET

Subjects:
  1. Physics (UPH013)
  2. Engineering Drawing (UES101)
  3. Maths II (UMA023)
  4. Professional Communication (UHU003)
  5. Manufacturing Processes (UES102)
"""

import sqlite3
import os

SUBGROUP = "1A82"
YEAR = 1

subjects = [
    ("Physics",                    "UPH013", SUBGROUP, YEAR),
    ("Engineering Drawing",        "UES101", SUBGROUP, YEAR),
    ("Maths II",                   "UMA023", SUBGROUP, YEAR),
    ("Professional Communication", "UHU003", SUBGROUP, YEAR),
    ("Manufacturing Processes",    "UES102", SUBGROUP, YEAR),
]

timetable_entries = [
    # (Subject Code,  Day,  Start,   End,     Type)

    # MONDAY
    ("UMA023",        0,    "09:40", "10:30", "Tutorial"),
    ("UPH013",        0,    "10:30", "11:20", "Tutorial"),
    ("UES102",        0,    "11:20", "12:10", "Class"),
    ("UPH013",        0,    "12:10", "13:00", "Class"),

    # TUESDAY
    ("UES101",        1,    "08:00", "08:50", "Class"),
    ("UMA023",        1,    "08:50", "09:40", "Class"),
    ("UHU003",        1,    "09:40", "10:30", "Class"),
    ("UPH013",        1,    "13:50", "15:30", "Lab"),
    ("UES102",        1,    "15:30", "17:10", "Lab"),

    # WEDNESDAY
    ("UES101",        2,    "13:00", "14:40", "Tutorial"),
    ("UES102",        2,    "14:40", "15:30", "Class"),
    ("UMA023",        2,    "15:30", "16:20", "Class"),
    ("UPH013",        2,    "16:20", "17:10", "Class"),

    # THURSDAY
    ("UPH013",        3,    "09:40", "10:30", "Class"),
    ("UES101",        3,    "10:30", "11:20", "Class"),
    ("UES101",        3,    "11:20", "13:00", "Lab"),
    ("UHU003",        3,    "13:50", "15:30", "Lab"),

    # FRIDAY
    ("UMA023",        4,    "09:40", "10:30", "Class"),
    ("UHU003",        4,    "10:30", "11:20", "Class"),
]

# ─── Importer (do not edit below) ─────────────────────────────────────────────

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "student_planner.db")

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

print("=" * 70)
print(f"IMPORTING TIMETABLE FOR {SUBGROUP}")
print("=" * 70)

c.execute("DELETE FROM attendance WHERE timetable_id IN (SELECT id FROM timetable WHERE subgroup = ?)", (SUBGROUP,))
c.execute("DELETE FROM timetable WHERE subgroup = ?", (SUBGROUP,))
c.execute("DELETE FROM subjects WHERE subgroup = ?", (SUBGROUP,))
conn.commit()
print(f"✓ Cleared old {SUBGROUP} data\n")

print("INSERTING SUBJECTS")
print("-" * 40)
for name, code, subgroup, year in subjects:
    c.execute("INSERT INTO subjects (name, code, subgroup, year) VALUES (?, ?, ?, ?)", (name, code, subgroup, year))
    print(f"  ✓ {code} — {name}")
conn.commit()

subject_ids = {}
for name, code, _, _ in subjects:
    c.execute("SELECT id FROM subjects WHERE code = ? AND subgroup = ?", (code, SUBGROUP))
    row = c.fetchone()
    if row:
        subject_ids[code] = row[0]

print("\nINSERTING TIMETABLE ENTRIES")
print("-" * 40)
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

for subject_code, day_idx, start_time, end_time, class_type in timetable_entries:
    subject_id = subject_ids[subject_code]
    c.execute(
        "INSERT INTO timetable (subject_id, subgroup, day_of_week, start_time, end_time, type, room, instructor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (subject_id, SUBGROUP, day_idx, start_time, end_time, class_type, "", "")
    )
    subject_name = next(name for name, code, _, _ in subjects if code == subject_code)
    print(f"  ✓ {DAYS[day_idx]:9s} {start_time}–{end_time}  {subject_code}  {class_type}")

conn.commit()

print("\n" + "=" * 70)
c.execute("SELECT COUNT(*) FROM subjects WHERE subgroup = ?", (SUBGROUP,))
print(f"✓ Subjects:          {c.fetchone()[0]}")
c.execute("SELECT COUNT(*) FROM timetable WHERE subgroup = ?", (SUBGROUP,))
print(f"✓ Timetable entries: {c.fetchone()[0]}")
conn.close()

print(f"\n✅ Import complete for {SUBGROUP}!")
