from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import sys
from dotenv import load_dotenv
from db import (
    get_db_connection, init_db, get_weight_for_type,
    calculate_attendance_stats, calculate_subject_attendance,
    execute_query
)
from upload_handler import register_upload_routes
from auth_middleware import require_auth, optional_auth

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# CORS: Allow both localhost (dev) and production domain
allowed_origins = [
    "http://localhost:3000",
    "https://attendex-tiet.vercel.app",
    "https://attendex-api.onrender.com",  # Render backend URL
    os.getenv("FRONTEND_URL", "http://localhost:3000")
]
CORS(app, origins=allowed_origins)

# Initialize database schema on startup
init_db()

# Seed all subgroup timetables on every startup
# This ensures the DB is ALWAYS populated even after Render wipes the filesystem
try:
    sys.path.insert(0, os.path.dirname(__file__))
    from subgroups.seed_all import run as seed_subgroups
    seed_subgroups()
except Exception as e:
    print(f"⚠️  Seeding failed (non-fatal): {e}")

# Register upload routes
register_upload_routes(app, get_db_connection)

# ==================== API ROUTES ====================

# ==================== DASHBOARD API ====================

@app.route('/api/dashboard', methods=['GET'])
@require_auth
def api_dashboard():
    """Get dashboard statistics for the logged-in user."""
    user_id = getattr(request, 'user_id', None)
    subgroup = request.args.get('subgroup')
    conn = get_db_connection()
    
    # Get total subjects for this subgroup
    if subgroup:
        subjects_row = execute_query(conn, 
            'SELECT COUNT(*) as count FROM subjects WHERE subgroup = ?', 
            (subgroup,)
        )
        total_subjects = subjects_row[0]['count']
        
        # Get count of PRESENT classes for THIS USER in this subgroup
        attended_row = execute_query(conn,
            "SELECT COUNT(*) as count FROM attendance a JOIN timetable t ON a.timetable_id = t.id WHERE a.status = 'Present' AND t.subgroup = ? AND a.user_id = ?",
            (subgroup, user_id)
        )
        attended_count = attended_row[0]['count']
    else:
        subjects_row = execute_query(conn, 'SELECT COUNT(*) as count FROM subjects')
        total_subjects = subjects_row[0]['count']
        
        attended_row = execute_query(conn,
            "SELECT COUNT(*) as count FROM attendance WHERE status = 'Present' AND user_id = ?",
            (user_id,)
        )
        attended_count = attended_row[0]['count']
    
    # Get attendance stats (weighted) for THIS USER
    stats = calculate_attendance_stats(subgroup, user_id=user_id)
    
    conn.close()
    
    return jsonify({
        'total_subjects': total_subjects,
        'total_classes': stats['total_classes'],
        'attended_classes': attended_count,
        'overall_percentage': stats['overall_percentage']
    })

# ==================== SUBJECTS API ====================

@app.route('/api/subjects', methods=['GET'])
def api_get_subjects():
    """Get all subjects."""
    subgroup = request.args.get('subgroup')
    conn = get_db_connection()
    
    if subgroup:
        subjects = execute_query(conn, 
            'SELECT * FROM subjects WHERE subgroup = ? ORDER BY name',
            (subgroup,)
        )
    else:
        subjects = execute_query(conn, 'SELECT * FROM subjects ORDER BY name')
        
    conn.close()
    
    return jsonify([dict(row) for row in subjects])

@app.route('/api/subjects', methods=['POST'])
def api_create_subject():
    """Create a new subject."""
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'error': 'Subject name is required'}), 400
    
    name = data['name'].strip()
    code = data.get('code', '').strip()
    
    if not name:
        return jsonify({'error': 'Subject name cannot be empty'}), 400
    
    try:
        conn = get_db_connection()
        execute_query(conn, 'INSERT INTO subjects (name, code) VALUES (?, ?)', (name, code))
        conn.commit()
        
        # Robust ID retrieval
        res = execute_query(conn, 'SELECT id FROM subjects WHERE name = ? AND code = ? ORDER BY id DESC LIMIT 1', (name, code))
        subject_id = res[0]['id']
        
        conn.close()
        return jsonify({'id': subject_id, 'name': name, 'code': code}), 201
    except (sqlite3.IntegrityError, psycopg2.IntegrityError):
        return jsonify({'error': 'Subject with this name already exists'}), 409

@app.route('/api/subjects/<int:subject_id>', methods=['PUT'])
def api_update_subject(subject_id):
    """Update an existing subject."""
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'error': 'Subject name is required'}), 400
    
    name = data['name'].strip()
    code = data.get('code', '').strip()
    
    if not name:
        return jsonify({'error': 'Subject name cannot be empty'}), 400
    
    try:
        conn = get_db_connection()
        cur = execute_query(conn, 'UPDATE subjects SET name = ?, code = ? WHERE id = ?', (name, code, subject_id))
        conn.commit()
        
        rowcount = cur.rowcount if hasattr(cur, 'rowcount') else 0
        if rowcount == 0:
            conn.close()
            return jsonify({'error': 'Subject not found'}), 404
        
        conn.close()
        return jsonify({'id': subject_id, 'name': name, 'code': code})
    except (sqlite3.IntegrityError, psycopg2.IntegrityError):
        return jsonify({'error': 'Subject with this name already exists'}), 409

@app.route('/api/subjects/<int:subject_id>', methods=['DELETE'])
def api_delete_subject(subject_id):
    """Delete a subject and all related timetable/attendance records."""
    conn = get_db_connection()
    cur = execute_query(conn, 'DELETE FROM subjects WHERE id = ?', (subject_id,))
    conn.commit()
    
    rowcount = cur.rowcount if hasattr(cur, 'rowcount') else 0
    if rowcount == 0:
        conn.close()
        return jsonify({'error': 'Subject not found'}), 404
    
    conn.close()
    return jsonify({'message': 'Subject deleted successfully'})

# ==================== SUBGROUPS API ====================

@app.route('/api/subgroups', methods=['GET'])
def api_get_subgroups():
    """Get all unique subgroups (only UG: years 1-4)."""
    conn = get_db_connection()
    subgroups = execute_query(conn, '''
        SELECT DISTINCT subgroup 
        FROM subjects 
        WHERE subgroup IS NOT NULL AND year <= 4
        ORDER BY subgroup
    ''')
    conn.close()
    
    return jsonify([row['subgroup'] for row in subgroups])

# ==================== TIMETABLE API ====================

@app.route('/api/timetable', methods=['GET'])
def api_get_timetable():
    """Get timetable entries, optionally filtered by subgroup."""
    subgroup = request.args.get('subgroup')
    
    conn = get_db_connection()
    
    if subgroup:
        query = '''
            SELECT t.*, s.name as subject_name, s.code as subject_code
            FROM timetable t
            JOIN subjects s ON t.subject_id = s.id
            WHERE t.subgroup = ?
            ORDER BY t.day_of_week, t.start_time
        '''
        entries = execute_query(conn, query, (subgroup,))
    else:
        query = '''
            SELECT t.*, s.name as subject_name, s.code as subject_code
            FROM timetable t
            JOIN subjects s ON t.subject_id = s.id
            ORDER BY t.day_of_week, t.start_time
        '''
        entries = execute_query(conn, query)
    
    conn.close()
    
    return jsonify([dict(row) for row in entries])

@app.route('/api/timetable', methods=['POST'])
@require_auth
def api_create_timetable_entry():
    """Create a new timetable entry."""
    data = request.get_json()
    
    required_fields = ['subject_id', 'day_of_week', 'start_time', 'end_time', 'type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    subject_id = data['subject_id']
    day_of_week = data['day_of_week']
    start_time = data['start_time']
    end_time = data['end_time']
    class_type = data['type']
    
    # Validate day_of_week
    if not (0 <= day_of_week <= 6):
        return jsonify({'error': 'day_of_week must be between 0 (Monday) and 6 (Sunday)'}), 400
    
    # Validate type
    if class_type not in ['Class', 'Tutorial', 'Lab']:
        return jsonify({'error': 'type must be Class, Tutorial, or Lab'}), 400
    
    try:
        conn = get_db_connection()
        execute_query(conn,
            'INSERT INTO timetable (subject_id, day_of_week, start_time, end_time, type) VALUES (?, ?, ?, ?, ?)',
            (subject_id, day_of_week, start_time, end_time, class_type)
        )
        conn.commit()
        
        # Robust ID retrieval
        res = execute_query(conn, 
            'SELECT id FROM timetable WHERE subject_id = ? AND day_of_week = ? AND start_time = ? AND type = ? ORDER BY id DESC LIMIT 1',
            (subject_id, day_of_week, start_time, class_type)
        )
        entry_id = res[0]['id']
        
        conn.close()
        
        return jsonify({
            'id': entry_id,
            'subject_id': subject_id,
            'day_of_week': day_of_week,
            'start_time': start_time,
            'end_time': end_time,
            'type': class_type
        }), 201
    except (sqlite3.IntegrityError, psycopg2.IntegrityError) as e:
        return jsonify({'error': 'Invalid subject_id or constraint violation'}), 400

@app.route('/api/timetable/<int:entry_id>', methods=['PUT'])
@require_auth
def api_update_timetable_entry(entry_id):
    """Update an existing timetable entry."""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Build update query dynamically
    allowed_fields = ['subject_id', 'day_of_week', 'start_time', 'end_time', 'type']
    updates = []
    values = []
    
    for field in allowed_fields:
        if field in data:
            updates.append(f'{field} = ?')
            values.append(data[field])
    
    if not updates:
        return jsonify({'error': 'No valid fields to update'}), 400
    
    values.append(entry_id)
    
    try:
        conn = get_db_connection()
        cur = execute_query(conn, f'UPDATE timetable SET {", ".join(updates)} WHERE id = ?', values)
        conn.commit()
        
        rowcount = cur.rowcount if hasattr(cur, 'rowcount') else 0
        if rowcount == 0:
            conn.close()
            return jsonify({'error': 'Timetable entry not found'}), 404
        
        conn.close()
        return jsonify({'message': 'Timetable entry updated successfully'})
    except (sqlite3.IntegrityError, psycopg2.IntegrityError):
        return jsonify({'error': 'Invalid data or constraint violation'}), 400

@app.route('/api/timetable/<int:entry_id>', methods=['DELETE'])
@require_auth
def api_delete_timetable_entry(entry_id):
    """Delete a timetable entry and all related attendance records."""
    conn = get_db_connection()
    cur = execute_query(conn, 'DELETE FROM timetable WHERE id = ?', (entry_id,))
    conn.commit()
    
    rowcount = cur.rowcount if hasattr(cur, 'rowcount') else 0
    if rowcount == 0:
        conn.close()
        return jsonify({'error': 'Timetable entry not found'}), 404
    
    conn.close()
    return jsonify({'message': 'Timetable entry deleted successfully'})

# ==================== ATTENDANCE API ====================

@app.route('/api/attendance', methods=['POST'])
@require_auth
def api_mark_attendance():
    """Mark attendance for a specific timetable entry on a specific date."""
    user_id = getattr(request, 'user_id', None)
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
        
    data = request.get_json()
    
    required_fields = ['timetable_id', 'date', 'status']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    timetable_id = data['timetable_id']
    date = data['date']
    status = data['status']
    
    if status not in ['Present', 'Absent']:
        return jsonify({'error': 'status must be Present or Absent'}), 400
    
    try:
        conn = get_db_connection()
        
        # Check if attendance already exists for THIS user
        res = execute_query(conn, 
            'SELECT id FROM attendance WHERE timetable_id = ? AND date = ? AND user_id = ?',
            (timetable_id, date, user_id)
        )
        existing = res[0] if res else None
        
        if existing:
            # Update existing record
            execute_query(conn,
                'UPDATE attendance SET status = ?, marked_at = CURRENT_TIMESTAMP WHERE id = ?',
                (status, existing['id'])
            )
            attendance_id = existing['id']
        else:
            # Insert new record with user_id
            execute_query(conn,
                'INSERT INTO attendance (timetable_id, date, status, user_id) VALUES (?, ?, ?, ?)',
                (timetable_id, date, status, user_id)
            )
            conn.commit()
            
            # Robust ID retrieval
            res = execute_query(conn, 
                'SELECT id FROM attendance WHERE timetable_id = ? AND date = ? AND user_id = ?',
                (timetable_id, date, user_id)
            )
            attendance_id = res[0]['id']
        
        conn.close()
        
        return jsonify({
            'id': attendance_id,
            'timetable_id': timetable_id,
            'date': date,
            'status': status
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Invalid timetable_id'}), 400


@app.route('/api/attendance/history', methods=['GET'])
@require_auth
def api_get_attendance_history():
    """Get all attendance records for the logged-in user."""
    user_id = getattr(request, 'user_id', None)
    conn = get_db_connection()
    query = '''
        SELECT a.*, t.type, t.day_of_week, t.start_time, t.end_time,
               s.name as subject_name, s.code as subject_code
        FROM attendance a
        JOIN timetable t ON a.timetable_id = t.id
        JOIN subjects s ON t.subject_id = s.id
        WHERE a.user_id = ?
        ORDER BY a.date DESC, t.start_time
    '''
    records = execute_query(conn, query, (user_id,))
    conn.close()
    
    return jsonify([dict(row) for row in records])

@app.route('/api/attendance/delete', methods=['POST'])
@require_auth
def api_unmark_attendance():
    """Delete an attendance record for a specific timetable entry and date."""
    user_id = getattr(request, 'user_id', None)
    data = request.get_json()
    
    required_fields = ['timetable_id', 'date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    timetable_id = data['timetable_id']
    date = data['date']
    
    conn = get_db_connection()
    cur = execute_query(conn,
        'DELETE FROM attendance WHERE timetable_id = ? AND date = ? AND user_id = ?',
        (timetable_id, date, user_id)
    )
    conn.commit()
    
    # Check rowcount (robust for both)
    rowcount = cur.rowcount if hasattr(cur, 'rowcount') else 0
    
    if rowcount == 0:
        conn.close()
        return jsonify({'error': 'Attendance record not found'}), 404
    
    conn.close()
    return jsonify({'message': 'Attendance deleted successfully'})

@app.route('/api/attendance/subject/<int:subject_id>', methods=['GET'])
@require_auth
def api_get_subject_attendance_stats(subject_id):
    """Get attendance statistics for a specific subject."""
    user_id = getattr(request, 'user_id', None)
    stats = calculate_subject_attendance(subject_id, user_id=user_id)
    return jsonify(stats)

@app.route('/api/attendance/<int:attendance_id>', methods=['DELETE'])
@require_auth
def api_delete_attendance(attendance_id):
    """Delete an attendance record (must belong to user)."""
    user_id = getattr(request, 'user_id', None)
    conn = get_db_connection()
    cur = execute_query(conn, 'DELETE FROM attendance WHERE id = ? AND user_id = ?', (attendance_id, user_id))
    conn.commit()
    
    rowcount = cur.rowcount if hasattr(cur, 'rowcount') else 0
    if rowcount == 0:
        conn.close()
        return jsonify({'error': 'Attendance record not found'}), 404
    
    conn.close()
    return jsonify({'message': 'Attendance record deleted successfully'})

# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'message': 'Attendex API is running'})

# ==================== RUN ====================

if __name__ == '__main__':
    app.run(debug=True, port=5000)