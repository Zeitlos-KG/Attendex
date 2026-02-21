# Timetable Importer

Scripts for importing timetable data into the Attendex database for each subgroup.

## Adding a New Subgroup

1. **Copy the template:**
   ```bash
   cp timetable_importer/template.py timetable_importer/import_1B31.py
   ```

2. **Edit the file** — fill in three things:
   ```python
   SUBGROUP = "1B31"   # your subgroup
   YEAR = 1

   subjects = [
       ("Physics", "UPH013", SUBGROUP, YEAR),
       # ... add all subjects
   ]

   timetable_entries = [
       # (Code,    Day, Start,   End,     Type)
       ("UPH013",  0,  "09:40", "10:30", "Tutorial"),
       # ... one entry per class slot from the timetable image
   ]
   ```

3. **Run it locally:**
   ```bash
   python timetable_importer/import_1B31.py
   ```

4. **Push to Render** — after running locally and verifying the data looks correct, commit the `.db` file changes to Render (or re-run the script on the Render shell).

---

## Day Numbers
| Day | Number |
|---|---|
| Monday | 0 |
| Tuesday | 1 |
| Wednesday | 2 |
| Thursday | 3 |
| Friday | 4 |

## Class Types
| Type | Duration | Weight |
|---|---|---|
| `Class` | 50 min (lecture) | 1.0× |
| `Tutorial` | 50–100 min | 0.5× |
| `Lab` | 100 min (practical) | 2.0× |

## Existing Imports
| File | Subgroup | Status |
|---|---|---|
| `import_1a82.py` | 1A82 | ✅ Live on Render |

---

## Time Slots (Sem 2 — TIET)
Common time slots found in the master timetable:

| Slot | Time |
|---|---|
| 1 | 08:00 – 08:50 |
| 2 | 08:50 – 09:40 |
| 3 | 09:40 – 10:30 |
| 4 | 10:30 – 11:20 |
| 5 | 11:20 – 12:10 |
| 6 | 12:10 – 13:00 |
| 7 | 13:00 – 13:50 |
| 8 | 13:50 – 14:40 |
| 9 | 14:40 – 15:30 |
| 10 | 15:30 – 16:20 |
| 11 | 16:20 – 17:10 |
| Labs | Two consecutive slots (100 min) |
