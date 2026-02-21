SUBGROUP = "1A15"
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
    ("UES101",  0, "11:20", "13:00", "Lab", 1.0),  # 100-min ED Lab
    ("UHU003",  0, "13:50", "14:40", "Class"),
    ("UES102",  0, "14:40", "15:30", "Class"),
    ("UPH013",  0, "15:30", "16:20", "Class"),


    # TUESDAY
    ("UES102",  1, "09:40", "11:20", "Lab"),
    ("UES101",  1, "11:20", "12:10", "Tutorial"),
    ("UES101",  1, "12:10", "13:00", "Tutorial"),
    ("UPH013",  1, "13:50", "14:40", "Tutorial"),
    ("UMA023",  1, "14:40", "15:30", "Tutorial"),


    # WEDNESDAY
    ("UMA023",  2, "09:40", "10:30", "Class"),
    ("UPH013",  2, "10:30", "11:20", "Class"),
    ("UES101",  2, "11:20", "12:10", "Class"),
    ("UHU003",  2, "12:10", "13:00", "Class"),


    # THURSDAY
    ("UES102",  3, "10:30", "11:20", "Class"),
    ("UES101",  3, "11:20", "12:10", "Class"),
    ("UMA023",  3, "12:10", "13:00", "Class"),


    # FRIDAY
    ("UPH013",  4, "08:00", "09:40", "Lab"),
    ("UPH013",  4, "09:40", "10:30", "Tutorial"),
    ("UMA023",  4, "10:30", "11:20", "Class"),
    ("UHU003",  4, "11:20", "13:00", "Lab"),
]