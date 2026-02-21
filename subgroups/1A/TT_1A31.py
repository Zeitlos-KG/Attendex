SUBGROUP = "1A31"
YEAR     = 1

subjects = [
    ("Physics",                              "UPH013"),
    ("Engineering Drawing",                  "UES101"),
    ("Differential Equations and Linear Algebra", "UMA023"),
    ("Professional Communication",           "UHU003"),
    ("Manufacturing Processes",              "UES102"),
]

timetable = [
    # (CODE,    Day, Start,   End,     Type)
    # Mon=0  Tue=1  Wed=2  Thu=3  Fri=4


    # MONDAY
    ("UPH013",  0, "08:00", "09:40", "Lab"),
    ("UHU003",  0, "09:40", "11:20", "Lab"),
    ("UES102",  0, "11:20", "12:10", "Class"),
    ("UES101",  0, "12:10", "13:00", "Class"),
    ("UES101",  0, "13:50", "15:30", "Lab", 1.0),  # 100-min ED Lab


    # TUESDAY
    ("UMA023",  1, "08:00", "08:50", "Class"),
    ("UES101",  1, "08:50", "09:40", "Class"),
    ("UHU003",  1, "09:40", "10:30", "Class"),
    ("UES102",  1, "10:30", "11:20", "Class"),
    ("UMA023",  1, "13:50", "14:40", "Class"),
    ("UES102",  1, "14:40", "15:30", "Class"),
    ("UPH013",  1, "15:30", "16:20", "Class"),
    ("UES101",  1, "16:20", "17:10", "Class"),


    # WEDNESDAY
    ("UHU003",  2, "08:00", "08:50", "Class"),
    ("UMA023",  2, "08:50", "09:40", "Class"),
    ("UES102",  2, "09:40", "11:20", "Lab"),
    ("UPH013",  2, "11:20", "12:10", "Tutorial"),
    ("UMA023",  2, "12:10", "13:00", "Tutorial"),


    # THURSDAY
    ("UPH013",  3, "13:00", "13:50", "Class"),
    ("UMA023",  3, "13:50", "14:40", "Class"),


    # FRIDAY
    ("UPH013",  4, "08:00", "08:50", "Class"),
    ("UHU003",  4, "08:50", "09:40", "Class"),
    ("UES101",  4, "09:40", "10:30", "Tutorial"),
    ("UES101",  4, "10:30", "11:20", "Tutorial"),
]