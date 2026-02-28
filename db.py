import sqlite3
import os

LOCAL_DB_PATH = 'student_planner.db'      # Fallback SQLite

# ─── Lazy Postgres import ────────────────────────────────────────────────────
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False


def get_db_connection():
    """Create and return a database connection (Postgres or SQLite).
    
    DATABASE_URL is read fresh each call so env-var changes take effect
    without a code redeploy.
    
    For Supabase: use the Session Pooler URL (port 5432, IPv4-compatible).
    Direct connection URL (db.xxx.supabase.co) uses IPv6 and breaks on Render free tier.
    """
    database_url = os.getenv('DATABASE_URL')  # Read fresh — not cached at import time
    if database_url and PSYCOPG2_AVAILABLE:
        # Supabase session pooler requires SSL. Append sslmode if not already present.
        if 'sslmode' not in database_url:
            sep = '&' if '?' in database_url else '?'
            database_url = f"{database_url}{sep}sslmode=require"
        conn = psycopg2.connect(database_url, connect_timeout=10)
        return conn
    else:
        conn = sqlite3.connect(LOCAL_DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn


def _is_postgres(conn):
    """Detect whether the connection is Postgres."""
    return PSYCOPG2_AVAILABLE and isinstance(conn, psycopg2.extensions.connection)


def execute_query(conn, query, params=None):
    """
    Unified execution helper.
    Returns:
      - List of dicts for SELECT queries.
      - Cursor object for INSERT/UPDATE/DELETE.
    """
    if params is None:
        params = []

    if _is_postgres(conn):
        pg_query = query.replace('?', '%s')
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(pg_query, params)
            if cur.description:
                return cur.fetchall()
            return cur
        except Exception:
            conn.rollback()
            raise
    else:
        cur = conn.execute(query, params)
        if query.strip().upper().startswith('SELECT'):
            return cur.fetchall()
        return cur


def init_db():
    """Initialize database with schema. Non-fatal on error."""
    if os.getenv('DATABASE_URL') and PSYCOPG2_AVAILABLE:
        print("🌱 Production Database (Supabase) detected.")
        try:
            conn = get_db_connection()
            schema_path = os.path.join(os.path.dirname(__file__), 'supabase', 'production_schema.sql')
            with open(schema_path, 'r') as f:
                sql = f.read()
            cur = conn.cursor()
            cur.execute(sql)
            conn.commit()
            conn.close()
            print("✅ Supabase schema applied.")
        except Exception as e:
            print(f"⚠️  Could not init Supabase schema (non-fatal): {e}")
    else:
        print("🏠 Local Database (SQLite) detected.")
        try:
            conn = get_db_connection()
            schema_path = os.path.join(os.path.dirname(__file__), 'schema_new.sql')
            with open(schema_path, 'r') as f:
                conn.executescript(f.read())
            conn.commit()
            conn.close()
            print("✅ SQLite schema applied.")
        except Exception as e:
            print(f"⚠️  Could not init SQLite schema (non-fatal): {e}")


def get_weight_for_type(class_type, weight_override=None):
    """Return attendance weight."""
    if weight_override is not None:
        return float(weight_override)
    weights = {'Class': 1.0, 'Tutorial': 0.5, 'Lab': 2.0}
    return weights.get(class_type, 1.0)


def calculate_attendance_stats(subgroup=None, user_id=None):
    """Calculate overall attendance statistics for a specific user."""
    try:
        conn = get_db_connection()
        query = '''
            SELECT a.status, t.type, t.weight_override
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            WHERE 1=1
        '''
        params = []
        if subgroup:
            query += ' AND t.subgroup = ?'
            params.append(subgroup)
        if user_id:
            query += ' AND a.user_id = ?'
            params.append(user_id)

        records = execute_query(conn, query, params)
        conn.close()
    except Exception as e:
        print(f"⚠️  calculate_attendance_stats error: {e}")
        return {'total_classes': 0, 'total_weight': 0, 'attended_weight': 0, 'overall_percentage': 0.0}

    total_weight = 0.0
    attended_weight = 0.0

    for record in records:
        weight = get_weight_for_type(record['type'], record['weight_override'])
        total_weight += weight
        if record['status'] == 'Present':
            attended_weight += weight

    overall_percentage = (attended_weight / total_weight * 100) if total_weight > 0 else 0.0

    return {
        'total_classes': len(records),
        'total_weight': total_weight,
        'attended_weight': attended_weight,
        'overall_percentage': round(overall_percentage, 2)
    }


def calculate_subject_attendance(subject_id, user_id=None):
    """Calculate attendance statistics for a specific subject."""
    try:
        conn = get_db_connection()
        query = '''
            SELECT a.status, t.type, t.weight_override
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            WHERE t.subject_id = ?
        '''
        params = [subject_id]
        if user_id:
            query += ' AND a.user_id = ?'
            params.append(user_id)

        records = execute_query(conn, query, params)
        conn.close()
    except Exception as e:
        print(f"⚠️  calculate_subject_attendance error: {e}")
        return {'total_weight': 0, 'attended_weight': 0, 'percentage': 0.0, 'classes_for_75': 0}

    total_weight = 0.0
    attended_weight = 0.0

    for record in records:
        weight = get_weight_for_type(record['type'], record['weight_override'])
        total_weight += weight
        if record['status'] == 'Present':
            attended_weight += weight

    percentage = (attended_weight / total_weight * 100) if total_weight > 0 else 0.0

    classes_needed = 0
    if percentage < 75.0 and total_weight > 0:
        required_weight = (0.75 * total_weight - attended_weight) / 0.25
        classes_needed = max(0, int(required_weight) + 1)

    return {
        'total_weight': total_weight,
        'attended_weight': attended_weight,
        'percentage': round(percentage, 2),
        'classes_for_75': classes_needed
    }


if __name__ == '__main__':
    init_db()
