SUBGROUP = "1A82"
YEAR     = 1

subjects = [
    ("Physics",                    "UPH013"),
    ("Engineering Drawing",        "UES101"),
    ("Maths II",                   "UMA023"),
    ("Professional Communication", "UHU003"),
    ("Manufacturing Processes",    "UES102"),
]

timetable = [
    # (CODE,    Day, Start,   End,     Type)
    # Mon=0  Tue=1  Wed=2  Thu=3  Fri=4

    # MONDAY
    ("UMA023",  0, "09:40", "10:30", "Tutorial"),
    ("UPH013",  0, "10:30", "11:20", "Tutorial"),
    ("UES102",  0, "11:20", "12:10", "Class"),
    ("UPH013",  0, "12:10", "13:00", "Class"),

    # TUESDAY
    ("UES101",  1, "08:00", "08:50", "Class"),
    ("UMA023",  1, "08:50", "09:40", "Class"),
    ("UHU003",  1, "09:40", "10:30", "Class"),
    ("UPH013",  1, "13:50", "15:30", "Lab"),
    ("UES102",  1, "15:30", "17:10", "Lab"),

    # WEDNESDAY
    ("UES101",  2, "13:00", "14:40", "Tutorial"),
    ("UES102",  2, "14:40", "15:30", "Class"),
    ("UMA023",  2, "15:30", "16:20", "Class"),
    ("UPH013",  2, "16:20", "17:10", "Class"),

    # THURSDAY
    ("UPH013",  3, "09:40", "10:30", "Class"),
    ("UES101",  3, "10:30", "11:20", "Class"),
    ("UES101",  3, "11:20", "13:00", "Lab"),
    ("UHU003",  3, "13:50", "15:30", "Lab"),

    # FRIDAY
    ("UMA023",  4, "09:40", "10:30", "Class"),
    ("UHU003",  4, "10:30", "11:20", "Class"),
]
