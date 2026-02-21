import sqlite3
import os

DATABASE_PATH = 'student_planner.db'

def get_db_connection():
    """Create and return a database connection."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Enable dict-like access
    return conn

def init_db():
    """Initialize database with schema."""
    if not os.path.exists(DATABASE_PATH):
        print("Creating new database...")
    
    conn = get_db_connection()
    
    # Read and execute schema
    with open('schema_new.sql', 'r') as f:
        conn.executescript(f.read())
    
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

def get_weight_for_type(class_type, weight_override=None):
    """Return attendance weight. Uses weight_override if set, otherwise type-based default."""
    if weight_override is not None:
        return weight_override
    weights = {
        'Class': 1.0,
        'Tutorial': 0.5,
        'Lab': 2.0
    }
    return weights.get(class_type, 1.0)

def calculate_attendance_stats(subgroup=None, user_id=None):
    """
    Calculate overall attendance statistics for a specific user.
    Returns dict with total_classes, attended_classes, overall_percentage.
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
        
    records = conn.execute(query, params).fetchall()
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
    Returns dict with total, attended, percentage, classes_for_75.
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
    
    records = conn.execute(query, params).fetchall()
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
        # Formula: (attended + x) / (total + x) = 0.75
        # Solving: attended + x = 0.75 * (total + x)
        # x = (0.75 * total - attended) / 0.25
        required_weight = (0.75 * total_weight - attended_weight) / 0.25
        classes_needed = max(0, int(required_weight) + 1)  # Round up
    
    return {
        'total_weight': total_weight,
        'attended_weight': attended_weight,
        'percentage': round(percentage, 2),
        'classes_for_75': classes_needed
    }

if __name__ == '__main__':
    init_db()