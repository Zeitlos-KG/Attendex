# Subgroups

This folder contains one data file per subgroup. `seed_all.py` auto-discovers and seeds all of them into the database on every Render deploy.

## Adding a New Subgroup — 3 Steps

```
1. Copy skeleton.py → TT_XXXX.py
2. Fill in SUBGROUP, subjects[], timetable[]
3. git add . && git commit && git push
```

Render redeploys → `seed_all.py` runs → subgroup appears in the app. Done.

---

## File Format

Each `TT_*.py` file contains only three variables:

```python
SUBGROUP = "1C15"
YEAR     = 1

subjects = [
    ("Subject Name", "CODE"),
    ...
]

timetable = [
    # ("CODE", day, "HH:MM", "HH:MM", "Type")
    ("CODE", 0, "09:40", "10:30", "Tutorial"),  # Monday
    ("CODE", 1, "08:00", "08:50", "Class"),      # Tuesday
    ...
]
```

## Day Reference
`0=Mon  1=Tue  2=Wed  3=Thu  4=Fri`

## Type Reference
`"Class"` (lecture, 50 min) · `"Tutorial"` (50–100 min) · `"Lab"` (100 min)

## Current Subgroups
| File | Subgroup |
|---|---|
| TT_1A82.py | 1A82 |
| TT_1B28.py | 1B28 |
