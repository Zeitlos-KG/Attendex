"""
seed_all.py — Auto-seeds all TT_*.py subgroup timetables into the database.

Called automatically by app.py on every server startup.
Also runs during Render build via render.yaml buildCommand.

To add a new subgroup: create subgroups/TT_XXXX.py and redeploy.
"""

import os, sys, glob, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)


def _already_seeded():
    """Returns True if the DB already has subjects data."""
    try:
        from db import get_db_connection, execute_query
        conn = get_db_connection()
        rows = execute_query(conn, "SELECT COUNT(*) as count FROM subjects")
        conn.close()
        count = rows[0]['count'] if rows else 0
        return count > 0
    except Exception:
        return False  # If we can't check, seed anyway


def run(force=False):
    from db import init_db, get_db_connection

    print("🌱 Seeding subgroup timetables...")
    init_db()

    # ⚡ Skip seeding if data already exists (only seed on fresh DB / after wipe)
    if not force and _already_seeded():
        print("   ✅ DB already seeded — skipping. Run seed_all.py directly or use force=True to re-seed.")
        return

    FOLDER   = os.path.dirname(os.path.abspath(__file__))
    # Recursively find all TT_*.py files (in subfolders like 1A/, 1B/, etc. too)
    tt_files = sorted(glob.glob(os.path.join(FOLDER, "**", "TT_*.py"), recursive=True))

    if not tt_files:
        print("   No TT_*.py files found — nothing to seed.")
        return

    seeded = []

    for filepath in tt_files:
        try:
            filename = os.path.basename(filepath)
            module_name = f"tt_{filename.replace('.', '_')}" # e.g. tt_TT_1A11_py
            
            spec = importlib.util.spec_from_file_location(module_name, filepath)
            mod  = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)

            subgroup  = mod.SUBGROUP
            year      = mod.YEAR
            subjects  = mod.subjects
            timetable = mod.timetable

            from db import execute_query
            conn = get_db_connection()

            # Clear existing data for this subgroup
            execute_query(conn, "DELETE FROM attendance WHERE timetable_id IN (SELECT id FROM timetable WHERE subgroup=?)", (subgroup,))
            execute_query(conn, "DELETE FROM timetable  WHERE subgroup=?", (subgroup,))
            execute_query(conn, "DELETE FROM subjects   WHERE subgroup=?", (subgroup,))
            conn.commit()

            ids = {}
            for name, code in subjects:
                # Use insert and get ID
                execute_query(conn, "INSERT INTO subjects (name, code, subgroup, year) VALUES (?, ?, ?, ?)", (name, code, subgroup, year))
                conn.commit()
                
                # Retrieve ID (robust way for both DBs)
                row = execute_query(conn, "SELECT id FROM subjects WHERE code=? AND subgroup=?", (code, subgroup))
                ids[code] = row[0]['id'] if isinstance(row[0], dict) else row[0][0]

            for entry in timetable:
                code, day, start, end, typ = entry[:5]
                weight_override = entry[5] if len(entry) > 5 else None
                execute_query(conn, "INSERT INTO timetable (subject_id, subgroup, day_of_week, start_time, end_time, type, weight_override, room, instructor) VALUES (?,?,?,?,?,?,?,?,?)",
                    (ids[code], subgroup, day, start, end, typ, weight_override, "", ""))

            conn.commit()
            conn.close()

            print(f"   ✅ {subgroup:8s} | {len(subjects)} subjects | {len(timetable)} slots")
            seeded.append(subgroup)

        except Exception as e:
            print(f"   ❌ Error seeding {filepath}: {e}")
            continue

    print(f"\n🌱 SEEDING COMPLETE: {len(seeded)} subgroups are now available.")
    print(f"Active list: {', '.join(seeded[:10])} ... (total {len(seeded)})")


if __name__ == "__main__":
    run()
