import sqlite3, os

# ──────────────────────────────────────────
#  FILL THESE IN
# ──────────────────────────────────────────

SUBGROUP = ""   # e.g. "1B31"
YEAR     =  1   # 1 / 2 / 3 / 4

subjects = [
    # ("Subject Name",   "CODE"),
]

timetable = [
    # Day key: Mon=0  Tue=1  Wed=2  Thu=3  Fri=4  ← must be integers, not strings
    # Type:    "Class" | "Tutorial" | "Lab"
    #
    # ("CODE", day, "HH:MM", "HH:MM", "Type"),
]

# ──────────────────────────────────────────
#  DO NOT TOUCH BELOW
# ──────────────────────────────────────────

DB = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "student_planner.db")
conn = sqlite3.connect(DB); c = conn.cursor()

c.execute("DELETE FROM attendance WHERE timetable_id IN (SELECT id FROM timetable WHERE subgroup=?)", (SUBGROUP,))
c.execute("DELETE FROM timetable WHERE subgroup=?", (SUBGROUP,))
c.execute("DELETE FROM subjects WHERE subgroup=?",  (SUBGROUP,))
conn.commit()

ids = {}
for name, code in subjects:
    c.execute("INSERT INTO subjects (name,code,subgroup,year) VALUES (?,?,?,?)", (name, code, SUBGROUP, YEAR))
    conn.commit()
    ids[code] = c.execute("SELECT id FROM subjects WHERE code=? AND subgroup=?", (code, SUBGROUP)).fetchone()[0]

DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
for code, day, start, end, typ in timetable:
    c.execute("INSERT INTO timetable (subject_id,subgroup,day_of_week,start_time,end_time,type,room,instructor) VALUES (?,?,?,?,?,?,?,?)",
              (ids[code], SUBGROUP, day, start, end, typ, "", ""))
    print(f"  {DAYS[day]}  {start}–{end}  {typ:8s}  {code}")

conn.commit(); conn.close()
print(f"\n✅ Done — {len(timetable)} entries for {SUBGROUP}")
