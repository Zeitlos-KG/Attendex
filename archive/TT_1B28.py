import sqlite3, os

# ──────────────────────────────────────────
#  FILL THESE IN
# ──────────────────────────────────────────

SUBGROUP = "1B28"   # e.g. "1B31"
YEAR     =  1   # 1 / 2 / 3 / 4

subjects = [
    ("Chemistry", "UCB009"),
    ("Programming for Problem Solving", "UES103"),
    ("Electrical and Electronics Engineering", "UES013"),
    ("Energy and Environment", "UEN008"),
    ("Calculus for Engineers", "UMA022"),
]

timetable = [
    # Mon=0  Tue=1  Wed=2  Thu=3  Fri=4
    ("UES013", 0, "13:00", "13:50", "Class"),
    ("UES013", 2, "08:50", "09:40", "Class"),
    ("UES013", 2, "11:20", "12:10", "Tutorial"),
    ("UES013", 2, "15:30", "17:10", "Lab"),
    ("UES013", 3, "14:40", "15:30", "Class"),

    ("UMA022", 0, "13:50", "14:40", "Class"),
    ("UMA022", 2, "09:40", "10:30", "Class"),
    ("UMA022", 2, "12:10", "13:00", "Tutorial"),
    ("UMA022", 3, "15:30", "16:20", "Class"),

    ("UCB009", 0, "14:40", "15:30", "Class"),
    ("UCB009", 1, "12:10", "13:00", "Class"),
    ("UCB009", 2, "13:50", "15:30", "Lab"),
    ("UCB009", 4, "12:10", "13:00", "Class"),

    ("UEN008", 1, "11:20", "12:10", "Class"),
    ("UEN008", 2, "10:30", "11:20", "Class"),

    ("UES103", 2, "08:00", "08:50", "Class"),
    ("UES103", 3, "16:20", "17:10", "Class"),
    ("UES103", 4, "09:40", "11:20", "Lab"),
    ("UES103", 4, "11:20", "12:10", "Class"),
]


DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "student_planner.db")
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
