"""
seed_all.py — Auto-seeds all TT_*.py subgroup timetables into the database.

Called automatically by app.py on every server startup (skips if already seeded).
Also runs during Render build via render.yaml buildCommand (forces full seed).

Supabase (Postgres): uses UPSERT — attendance records are NEVER deleted.
SQLite (local dev):  uses DELETE + INSERT as before.

To add a new subgroup: create subgroups/TT_XXXX.py and redeploy.
To force a re-seed:   python subgroups/seed_all.py --force
"""

import os, sys, glob, importlib.util, argparse

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


def _is_postgres_conn(conn):
    """Detect if this is a Postgres connection."""
    try:
        import psycopg2
        return isinstance(conn, psycopg2.extensions.connection)
    except ImportError:
        return False


def run(force=False):
    from db import init_db, get_db_connection, execute_query

    print("🌱 Seeding subgroup timetables...")
    init_db()

    # ⚡ Skip seeding if data already exists (only seed on fresh DB / after wipe)
    if not force and _already_seeded():
        print("   ✅ DB already seeded — skipping (use --force or force=True to re-seed).")
        return

    FOLDER   = os.path.dirname(os.path.abspath(__file__))
    tt_files = sorted(glob.glob(os.path.join(FOLDER, "**", "TT_*.py"), recursive=True))

    if not tt_files:
        print("   No TT_*.py files found — nothing to seed.")
        return

    seeded = []

    for filepath in tt_files:
        try:
            filename    = os.path.basename(filepath)
            module_name = f"tt_{filename.replace('.', '_')}"

            spec = importlib.util.spec_from_file_location(module_name, filepath)
            mod  = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)

            subgroup  = mod.SUBGROUP
            year      = mod.YEAR
            subjects  = mod.subjects
            timetable = mod.timetable

            conn      = get_db_connection()
            is_pg     = _is_postgres_conn(conn)

            if is_pg:
                # ──────────────────────────────────────────────────────────────
                # POSTGRES / SUPABASE: safe upsert — NEVER touch attendance rows
                # ──────────────────────────────────────────────────────────────
                ids = {}
                for name, code in subjects:
                    execute_query(conn,
                        """INSERT INTO subjects (name, code, subgroup, year)
                           VALUES (?, ?, ?, ?)
                           ON CONFLICT (code, subgroup) DO UPDATE
                             SET name = EXCLUDED.name, year = EXCLUDED.year""",
                        (name, code, subgroup, year)
                    )
                    conn.commit()
                    row = execute_query(conn,
                        "SELECT id FROM subjects WHERE code=? AND subgroup=?",
                        (code, subgroup)
                    )
                    ids[code] = row[0]['id'] if isinstance(row[0], dict) else row[0][0]

                for entry in timetable:
                    code, day, start, end, typ = entry[:5]
                    weight_override = entry[5] if len(entry) > 5 else None
                    subject_id = ids[code]
                    # Insert timetable slot only if an identical one doesn't exist
                    execute_query(conn,
                        """INSERT INTO timetable
                             (subject_id, subgroup, day_of_week, start_time, end_time,
                              type, weight_override, room, instructor)
                           VALUES (?,?,?,?,?,?,?,?,?)
                           ON CONFLICT DO NOTHING""",
                        (subject_id, subgroup, day, start, end, typ, weight_override, "", "")
                    )

            else:
                # ──────────────────────────────────────────────────────────────
                # SQLITE (local dev): full DELETE + INSERT (no user data at risk)
                # ──────────────────────────────────────────────────────────────
                execute_query(conn,
                    "DELETE FROM attendance WHERE timetable_id IN "
                    "(SELECT id FROM timetable WHERE subgroup=?)", (subgroup,))
                execute_query(conn, "DELETE FROM timetable WHERE subgroup=?", (subgroup,))
                execute_query(conn, "DELETE FROM subjects   WHERE subgroup=?", (subgroup,))
                conn.commit()

                ids = {}
                for name, code in subjects:
                    execute_query(conn,
                        "INSERT INTO subjects (name, code, subgroup, year) VALUES (?,?,?,?)",
                        (name, code, subgroup, year)
                    )
                    conn.commit()
                    row = execute_query(conn,
                        "SELECT id FROM subjects WHERE code=? AND subgroup=?",
                        (code, subgroup)
                    )
                    ids[code] = row[0]['id'] if isinstance(row[0], dict) else row[0][0]

                for entry in timetable:
                    code, day, start, end, typ = entry[:5]
                    weight_override = entry[5] if len(entry) > 5 else None
                    execute_query(conn,
                        "INSERT INTO timetable "
                        "(subject_id, subgroup, day_of_week, start_time, end_time, "
                        " type, weight_override, room, instructor) VALUES (?,?,?,?,?,?,?,?,?)",
                        (ids[code], subgroup, day, start, end, typ, weight_override, "", "")
                    )

            conn.commit()
            conn.close()

            print(f"   ✅ {subgroup:8s} | {len(subjects)} subjects | {len(timetable)} slots")
            seeded.append(subgroup)

        except Exception as e:
            print(f"   ❌ Error seeding {filepath}: {e}")
            import traceback; traceback.print_exc()
            continue

    print(f"\n🌱 SEEDING COMPLETE: {len(seeded)} subgroups seeded.")
    print(f"   {', '.join(seeded[:10])} ... (total {len(seeded)})")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true",
                        help="Force re-seed even if data already exists")
    args = parser.parse_args()
    run(force=args.force)
