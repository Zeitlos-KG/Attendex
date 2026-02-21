SUBGROUP = "1A85"
YEAR     = 1

subjects = [
    ("Physics", "UPH013"),
    ("Engineering Drawing", "UES101"),
    ("Differential Equations and Linear Algebra", "UMA023"),
    ("Professional Communication", "UHU003"),
    ("Manufacturing Processes", "UES102"),
]

timetable = [
    # (CODE, Day, Start, End, Type)
    # Mon=0 Tue=1 Wed=2 Thu=3 Fri=4

    # ---------------- MONDAY ----------------
    ("UPH013", 0, "09:40", "10:30", "Class"),
    ("UMA023", 0, "10:30", "11:20", "Class"),
    ("UHU003", 0, "13:50", "15:30", "Lab"),

    # ---------------- TUESDAY ----------------
    ("UPH013", 1, "13:00", "13:50", "Class"),
    ("UHU003", 1, "13:50", "14:40", "Class"),
    ("UES101", 1, "15:30", "17:10", "Tutorial", 1.0),

    # ---------------- WEDNESDAY ----------------
    ("UES102", 2, "08:00", "08:50", "Class"),
    ("UMA023", 2, "08:50", "09:40", "Class"),
    ("UES101", 2, "09:40", "10:30", "Class"),
    ("UES102", 2, "11:20", "13:00", "Lab"),
    ("UPH013", 2, "15:30", "16:20", "Tutorial"),
    ("UMA023", 2, "16:20", "17:10", "Tutorial"),

    # ---------------- THURSDAY ----------------
    ("UPH013", 3, "09:40", "11:20", "Lab"),
    ("UES101", 3, "11:20", "13:00", "Lab", 1.0),
    ("UES101", 3, "14:40", "15:30", "Class"),
    ("UMA023", 3, "15:30", "16:20", "Class"),
    ("UPH013", 3, "16:20", "17:10", "Class"),

    # ---------------- FRIDAY ----------------
    ("UES102", 4, "11:20", "12:10", "Class"),
    ("UHU003", 4, "12:10", "13:00", "Class"),
]