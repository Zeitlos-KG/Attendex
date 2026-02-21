SUBGROUP = "1A65"
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
    ("UES101", 1, "09:40", "10:30", "Class"),
    ("UPH013", 1, "15:30", "16:20", "Tutorial"),
    ("UMA023", 1, "16:20", "17:10", "Tutorial"),

    # ---------------- WEDNESDAY ----------------
    ("UES102", 2, "08:00", "09:40", "Lab"),
    ("UPH013", 2, "13:50", "15:30", "Lab"),
    ("UES101", 2, "15:30", "17:10", "Lab", 1.0),

    # ---------------- THURSDAY ----------------
    ("UHU003", 3, "11:20", "12:10", "Class"),
    ("UMA023", 3, "12:10", "13:00", "Class"),
    ("UHU003", 3, "13:50", "15:30", "Lab"),
    ("UES101", 3, "15:30", "17:10", "Tutorial", 1.0),

    # ---------------- FRIDAY ----------------
    ("UMA023", 4, "08:50", "09:40", "Tutorial"),
    ("UMA023", 4, "09:40", "10:30", "Class"),
    ("UPH013", 4, "10:30", "11:20", "Class"),
]