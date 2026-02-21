SUBGROUP = "1A38"
YEAR     = 1

timetable = [
    # (CODE,    Day, Start,   End,     Type)

    # MONDAY
    ("UES102",  0, "08:00", "09:40", "Lab"),
    ("UPH013",  0, "09:40", "11:20", "Lab"),
    ("UES102",  0, "11:20", "12:10", "Class"),
    ("UES101",  0, "12:10", "13:00", "Class"),

    # TUESDAY
    ("UHU003",  1, "08:00", "08:50", "Class"),
    ("UMA023",  1, "08:50", "09:40", "Class"),
    ("UHU003",  1, "09:40", "11:20", "Lab"),
    ("UES101",  1, "11:20", "13:00", "Lab", 1.0),   # 100-min ED Lab
    ("UMA023",  1, "13:50", "14:40", "Class"),
    ("UES102",  1, "14:40", "15:30", "Class"),
    ("UPH013",  1, "15:30", "16:20", "Class"),
    ("UES101",  1, "16:20", "17:10", "Class"),

    # WEDNESDAY
    ("UES101",  2, "09:40", "10:30", "Tutorial"),
    ("UES101",  2, "10:30", "11:20", "Tutorial", 1.0),  # merged 100-min ED Tutorial
    ("UPH013",  2, "13:00", "13:50", "Class"),

    # THURSDAY
    ("UMA023",  3, "13:50", "14:40", "Class"),
    ("UPH013",  3, "14:40", "15:30", "Tutorial"),
    ("UMA023",  3, "15:30", "16:20", "Tutorial"),

    # FRIDAY
    ("UPH013",  4, "08:00", "08:50", "Class"),
    ("UHU003",  4, "08:50", "09:40", "Class"),
]