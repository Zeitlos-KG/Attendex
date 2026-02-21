SUBGROUP = "1A95"
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
    ("UES101", 0, "10:30", "11:20", "Class"),
    ("UHU003", 0, "13:50", "15:30", "Lab"),

    # ---------------- TUESDAY ----------------
    ("UMA023", 1, "10:30", "11:20", "Class"),
    ("UPH013", 1, "11:20", "12:10", "Class"),
    ("UES102", 1, "12:10", "13:00", "Class"),
    ("UES101", 1, "15:30", "17:10", "Lab", 1.0),

    # ---------------- WEDNESDAY ----------------
    ("UES101", 2, "08:00", "09:40", "Tutorial", 1.0),
    ("UES101", 2, "13:00", "13:50", "Class"),
    ("UHU003", 2, "13:50", "14:40", "Class"),

    # ---------------- THURSDAY ----------------
    ("UES102", 3, "10:30", "12:10", "Lab"),
    ("UHU003", 3, "13:00", "13:50", "Class"),
    ("UPH013", 3, "13:50", "14:40", "Class"),
    ("UMA023", 3, "14:40", "15:30", "Class"),
    ("UPH013", 3, "15:30", "17:10", "Lab"),

    # ---------------- FRIDAY ----------------
    ("UES102", 4, "08:00", "08:50", "Class"),
    ("UMA023", 4, "08:50", "09:40", "Class"),
    ("UPH013", 4, "09:40", "11:20", "Tutorial"),
    ("UMA023", 4, "11:20", "12:10", "Tutorial"),
]