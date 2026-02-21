import sqlite3
import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.getenv('DATABASE_URL') # Postgres (Supabase)
LOCAL_DB_PATH = 'student_planner.db'     # Fallback SQLite

def get_db_connection():
    """Create and return a database connection (Postgres or SQLite)."""
    if DATABASE_URL:
        # Postgres connection for production
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    else:
        # SQLite connection for local development
        conn = sqlite3.connect(LOCAL_DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

def execute_query(conn, query, params=None):
    """
    Unified execution helper.
    Returns:
      - List of dicts for SELECT queries.
      - Cursor object for INSERT/UPDATE/DELETE.
    """
    if params is None:
        params = []
        
    is_postgres = hasattr(conn, 'cursor_factory') or not hasattr(conn, 'row_factory')
    
    if is_postgres:
        # Postgres uses %s
        query = query.replace('?', '%s')
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(query, params)
        
        # If it's a SELECT, return results
        if cur.description:
            try:
                return cur.fetchall()
            except psycopg2.ProgrammingError:
                return cur
        return cur
    else:
        # SQLite uses ?
        cur = conn.execute(query, params)
        if query.strip().upper().startswith('SELECT'):
            return cur.fetchall()
        return cur

def init_db():
    """Initialize database with schema."""
    if DATABASE_URL:
        print("🌱 Production Database (Supabase) detected.")
        conn = get_db_connection()
        with open('supabase/production_schema.sql', 'r') as f:
            cursor = conn.cursor()
            cursor.execute(f.read())
        conn.commit()
        conn.close()
    else:
        print("🏠 Local Database (SQLite) detected.")
        conn = get_db_connection()
        with open('schema_new.sql', 'r') as f:
            conn.executescript(f.read())
        conn.commit()
        conn.close()
    print("✅ Database initialized successfully.")

def get_weight_for_type(class_type, weight_override=None):
    """Return attendance weight. Uses weight_override if set, otherwise type-based default."""
    if weight_override is not None:
        return float(weight_override)
    weights = {
        'Class': 1.0,
        'Tutorial': 0.5,
        'Lab': 2.0
    }
    return weights.get(class_type, 1.0)

def calculate_attendance_stats(subgroup=None, user_id=None):
    """
    Calculate overall attendance statistics for a specific user.
    """
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
    """
    Calculate attendance statistics for a specific subject for a specific user.
    """
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
    
    total_weight = 0.0
    attended_weight = 0.0
    
    for record in records:
        weight = get_weight_for_type(record['type'], record['weight_override'])
        total_weight += weight
        
        if record['status'] == 'Present':
            attended_weight += weight
    
    percentage = (attended_weight / total_weight * 100) if total_weight > 0 else 0.0
    
    # Calculate classes needed for 75%
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
