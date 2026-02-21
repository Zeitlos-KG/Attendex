SUBGROUP = "1A36"
YEAR     = 1

subjects = [
    ("Physics",                              "UPH013"),
    ("Engineering Drawing",                  "UES101"),
    ("Differential Equations and Linear Algebra", "UMA023"),
    ("Professional Communication",           "UHU003"),
    ("Manufacturing Processes",              "UES102"),
]

timetable = [
    # (CODE, Day, Start, End, Type)
    # Mon=0  Tue=1  Wed=2  Thu=3  Fri=4


    # MONDAY
    ("UES102",  0, "08:00", "09:40", "Lab"),
    ("UPH013",  0, "09:40", "11:20", "Lab"),
    ("UES102",  0, "11:20", "12:10", "Class"),
    ("UES101",  0, "12:10", "13:00", "Class"),


    # TUESDAY
    ("UHU003",  1, "08:00", "08:50", "Class"),
    ("UMA023",  1, "08:50", "09:40", "Class"),
    ("UHU003",  1, "09:40", "11:20", "Lab"),
    ("UMA023",  1, "11:20", "12:10", "Tutorial"),
    ("UPH013",  1, "12:10", "13:00", "Tutorial"),
    ("UMA023",  1, "13:50", "14:40", "Class"),
    ("UES102",  1, "14:40", "15:30", "Class"),
    ("UPH013",  1, "15:30", "16:20", "Class"),
    ("UES101",  1, "16:20", "17:10", "Class"),


    # WEDNESDAY
    # (No scheduled classes visible)


    # THURSDAY
    ("UPH013",  3, "13:00", "13:50", "Class"),
    ("UMA023",  3, "13:50", "14:40", "Class"),
    ("UES101",  3, "14:40", "16:20", "Tutorial", 1.0),


    # FRIDAY
    ("UPH013",  4, "08:00", "08:50", "Class"),
    ("UHU003",  4, "08:50", "09:40", "Class"),
    ("UES101",  4, "09:40", "11:20", "Lab", 1.0),
    ("UPH013",  4, "11:20", "12:10", "Tutorial"),
    ("UMA023",  4, "12:10", "13:00", "Tutorial"),
]