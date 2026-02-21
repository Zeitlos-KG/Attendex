SUBGROUP = ""   # e.g. "1C15"
YEAR     =  1   # 1 / 2 / 3 / 4

subjects = [
    # ("Subject Name",   "CODE"),
]

timetable = [
    # Mon=0  Tue=1  Wed=2  Thu=3  Fri=4    ← integers, NOT strings
    # "Class"=1.0  "Tutorial"=0.5  "Lab"=2.0  (defaults)
    # Add a 6th element to override weight for a specific slot:
    #
    # ("CODE", day, "HH:MM", "HH:MM", "Type"),           # uses default weight
    # ("CODE", day, "HH:MM", "HH:MM", "Tutorial", 1.0),  # override: counts as 1 not 0.5
    # ("CODE", day, "HH:MM", "HH:MM", "Lab",      1.0),  # override: counts as 1 not 2.0
]
