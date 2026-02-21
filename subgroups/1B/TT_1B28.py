SUBGROUP = "1B28"
YEAR     = 1

subjects = [
    ("Chemistry",                            "UCB009"),
    ("Programming for Problem Solving",      "UES103"),
    ("Electrical and Electronics Engineering","UES013"),
    ("Energy and Environment",               "UEN008"),
    ("Calculus for Engineers",               "UMA022"),
]

timetable = [
    # (CODE,    Day, Start,   End,     Type)
    # Mon=0  Tue=1  Wed=2  Thu=3  Fri=4

    # MONDAY
    ("UES013",  0, "13:00", "13:50", "Class"),
    ("UMA022",  0, "13:50", "14:40", "Class"),
    ("UCB009",  0, "14:40", "15:30", "Class"),

    # TUESDAY
    ("UEN008",  1, "11:20", "12:10", "Class"),
    ("UCB009",  1, "12:10", "13:00", "Class"),

    # WEDNESDAY
    ("UES103",  2, "08:00", "08:50", "Class"),
    ("UES013",  2, "08:50", "09:40", "Class"),
    ("UMA022",  2, "09:40", "10:30", "Class"),
    ("UEN008",  2, "10:30", "11:20", "Class"),
    ("UES013",  2, "11:20", "12:10", "Tutorial"),
    ("UMA022",  2, "12:10", "13:00", "Tutorial"),
    ("UCB009",  2, "13:50", "15:30", "Lab"),
    ("UES013",  2, "15:30", "17:10", "Lab"),

    # THURSDAY
    ("UES103",  3, "16:20", "17:10", "Class"),
    ("UES013",  3, "14:40", "15:30", "Class"),
    ("UMA022",  3, "15:30", "16:20", "Class"),

    # FRIDAY
    ("UES103",  4, "09:40", "11:20", "Lab"),
    ("UES103",  4, "11:20", "12:10", "Class"),
    ("UCB009",  4, "12:10", "13:00", "Class"),
]
