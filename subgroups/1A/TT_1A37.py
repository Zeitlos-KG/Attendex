SUBGROUP = "1A37"
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
    ("UES102",  0, "11:20", "12:10", "Class"),
    ("UES101",  0, "12:10", "13:00", "Class"),
    ("UES101",  0, "13:50", "15:30", "Lab", 1.0),


    # TUESDAY
    ("UHU003",  1, "08:00", "08:50", "Class"),
    ("UMA023",  1, "08:50", "09:40", "Class"),
    ("UHU003",  1, "09:40", "11:20", "Lab"),
    ("UPH013",  1, "11:20", "13:00", "Lab"),
    ("UMA023",  1, "13:50", "14:40", "Class"),
    ("UES102",  1, "14:40", "15:30", "Class"),
    ("UPH013",  1, "15:30", "16:20", "Class"),
    ("UES101",  1, "16:20", "17:10", "Class"),


    # WEDNESDAY
    ("UES101",  2, "15:30", "16:20", "Tutorial"),
    # (single tutorial block shown — not merged)


    # THURSDAY
    ("UPH013",  3, "13:00", "13:50", "Class"),
    ("UMA023",  3, "13:50", "14:40", "Class"),


    # FRIDAY
    ("UPH013",  4, "08:00", "08:50", "Class"),
    ("UHU003",  4, "08:50", "09:40", "Class"),
    ("UMA023",  4, "09:40", "10:30", "Tutorial"),
    ("UPH013",  4, "10:30", "11:20", "Tutorial"),
]