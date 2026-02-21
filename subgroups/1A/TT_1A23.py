SUBGROUP = "1A23"
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
    ("UPH013",  0, "08:50", "09:40", "Tutorial"),
    ("UMA023",  0, "09:40", "10:30", "Class"),
    ("UPH013",  0, "10:30", "11:20", "Class"),
    ("UMA023",  0, "11:20", "12:10", "Tutorial"),
    ("UES102",  0, "13:50", "15:30", "Lab"),
    ("UES101",  0, "15:30", "17:10", "Lab", 1.0),   # 100-min ED Lab


    # TUESDAY
    ("UMA023",  1, "08:00", "08:50", "Class"),
    ("UES101",  1, "08:50", "09:40", "Class"),
    ("UHU003",  1, "09:40", "10:30", "Class"),
    ("UES102",  1, "10:30", "11:20", "Class"),
    ("UHU003",  1, "11:20", "13:00", "Lab"),


    # WEDNESDAY
    ("UES101",  2, "09:40", "10:30", "Tutorial"),
    ("UES101",  2, "10:30", "11:20", "Tutorial"),
    ("UHU003",  2, "13:00", "13:50", "Class"),
    ("UES101",  2, "13:50", "14:40", "Class"),
    ("UPH013",  2, "14:40", "15:30", "Class"),
    ("UPH013",  2, "15:30", "17:10", "Lab"),


    # THURSDAY
    ("UES102",  3, "14:40", "15:30", "Class"),
    ("UMA023",  3, "15:30", "16:20", "Class"),
    ("UPH013",  3, "16:20", "17:10", "Class"),


    # FRIDAY
    # (No scheduled classes in image)
]