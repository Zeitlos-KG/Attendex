"""
seed_all.py — Auto-seeds all TT_*.py subgroup timetables into the database.

Called automatically by app.py on every server startup.
Also runs during Render build via render.yaml buildCommand.

To add a new subgroup: create subgroups/TT_XXXX.py and redeploy.
"""

import os, sys, glob, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)


def run():
    from db import init_db, get_db_connection

    print("🌱 Seeding subgroup timetables...")
    init_db()

    FOLDER   = os.path.dirname(os.path.abspath(__file__))
    # Recursively find all TT_*.py files (in subfolders like 1A/, 1B/, etc. too)
    tt_files = sorted(glob.glob(os.path.join(FOLDER, "**", "TT_*.py"), recursive=True))

    if not tt_files:
        print("   No TT_*.py files found — nothing to seed.")
        return

    seeded = []

    for filepath in tt_files:
        filename = os.path.basename(filepath)
        module_name = f"tt_{filename.replace('.', '_')}" # e.g. tt_TT_1A11_py
        
        spec = importlib.util.spec_from_file_location(module_name, filepath)
        mod  = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)

        subgroup  = mod.SUBGROUP
        year      = mod.YEAR
        subjects  = mod.subjects
        timetable = mod.timetable

        conn = get_db_connection()
        c    = conn.cursor()

        # Clear existing data for this subgroup
        c.execute("DELETE FROM attendance WHERE timetable_id IN (SELECT id FROM timetable WHERE subgroup=?)", (subgroup,))
        c.execute("DELETE FROM timetable  WHERE subgroup=?", (subgroup,))
        c.execute("DELETE FROM subjects   WHERE subgroup=?", (subgroup,))
        conn.commit()

        ids = {}
        for name, code in subjects:
            c.execute(
                "INSERT INTO subjects (name, code, subgroup, year) VALUES (?, ?, ?, ?)",
                (name, code, subgroup, year)
            )
            conn.commit()
            ids[code] = c.execute(
                "SELECT id FROM subjects WHERE code=? AND subgroup=?", (code, subgroup)
            ).fetchone()[0]

        for entry in timetable:
            code, day, start, end, typ = entry[:5]
            weight_override = entry[5] if len(entry) > 5 else None
            c.execute(
                "INSERT INTO timetable (subject_id, subgroup, day_of_week, start_time, end_time, type, weight_override, room, instructor) VALUES (?,?,?,?,?,?,?,?,?)",
                (ids[code], subgroup, day, start, end, typ, weight_override, "", "")
            )

        conn.commit()
        conn.close()

        print(f"   ✅ {subgroup:8s} | {len(subjects)} subjects | {len(timetable)} slots")
        seeded.append(subgroup)

    print(f"\n🌱 SEEDING COMPLETE: {len(seeded)} subgroups are now available.")
    print(f"Active list: {', '.join(seeded[:10])} ... (total {len(seeded)})")


if __name__ == "__main__":
    run()
