SUBGROUP = "1A53"
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
    ("UHU003", 0, "13:00", "13:50", "Class"),
    ("UES102", 0, "13:50", "14:40", "Class"),
    ("UPH013", 0, "14:40", "15:30", "Class"),

    # ---------------- TUESDAY ----------------
    ("UMA023", 1, "08:00", "08:50", "Class"),
    ("UES102", 1, "08:50", "09:40", "Class"),
    ("UES101", 1, "09:40", "11:20", "Lab", 1.0),
    ("UPH013", 1, "15:30", "16:20", "Tutorial"),
    ("UMA023", 1, "16:20", "17:10", "Tutorial"),

    # ---------------- WEDNESDAY ----------------
    ("UES102", 2, "08:00", "09:40", "Lab"),
    ("UPH013", 2, "09:40", "11:20", "Lab"),
    ("UMA023", 2, "12:10", "13:00", "Class"),
    ("UES101", 2, "15:30", "16:20", "Class"),
    ("UPH013", 2, "16:20", "17:10", "Class"),

    # ---------------- THURSDAY ----------------
    ("UES101", 3, "08:00", "09:40", "Tutorial", 1.0),
    ("UHU003", 3, "13:00", "13:50", "Class"),
    ("UMA023", 3, "13:50", "14:40", "Class"),
    ("UHU003", 3, "15:30", "17:10", "Lab"),

    # ---------------- FRIDAY ----------------
    ("UES102", 4, "08:00", "08:50", "Class"),
    ("UES101", 4, "08:50", "09:40", "Class"),
]