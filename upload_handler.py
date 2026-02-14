"""
Excel upload endpoint for timetable import
Handles .xlsx and .xls files
"""
import pandas as pd
from flask import request, jsonify
from werkzeug.utils import secure_filename
import os
from datetime import datetime

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

# Create uploads folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_day_to_number(day_str):
    """Convert day name to number (0=Monday, 6=Sunday)"""
    days_map = {
        'monday': 0,
        'tuesday': 1,
        'wednesday': 2,
        'thursday': 3,
        'friday': 4,
        'saturday': 5,
        'sunday': 6
    }
    return days_map.get(day_str.lower().strip(), None)

def process_timetable_excel(filepath, conn):
    """
    Process Excel file and import to database
    Returns: (success, message, records_count)
    """
    try:
        # Read Excel file
        df = pd.read_excel(filepath)
        
        # Validate required columns
        required_cols = ['Year', 'Subgroup', 'Subject Code', 'Subject Name', 
                        'Day', 'Start Time', 'End Time', 'Type']
        
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            return False, f"Missing required columns: {', '.join(missing_cols)}", 0
        
        # Optional columns
        df['Room'] = df['Room'] if 'Room' in df.columns else ''
        df['Instructor'] = df['Instructor'] if 'Instructor' in df.columns else ''
        
        records_imported = 0
        subjects_created = 0
        
        # Process each row
        for idx, row in df.iterrows():
            try:
                # Validate data
                year = int(row['Year'])
                subgroup = str(row['Subgroup']).strip()
                subject_code = str(row['Subject Code']).strip()
                subject_name = str(row['Subject Name']).strip()
                day = str(row['Day']).strip()
                start_time = str(row['Start Time']).strip()
                end_time = str(row['End Time']).strip()
                class_type = str(row['Type']).strip()
                room = str(row['Room']).strip() if pd.notna(row['Room']) else ''
                instructor = str(row['Instructor']).strip() if pd.notna(row['Instructor']) else ''
                
                # Convert day to number
                day_num = parse_day_to_number(day)
                if day_num is None:
                    print(f"Row {idx+2}: Invalid day '{day}', skipping")
                    continue
                
                # Validate class type
                if class_type not in ['Class', 'Tutorial', 'Lab']:
                    print(f"Row {idx+2}: Invalid type '{class_type}', skipping")
                    continue
                
                # Get or create subject
                subject = conn.execute(
                    'SELECT id FROM subjects WHERE code = ?',
                    (subject_code,)
                ).fetchone()
                
                if not subject:
                    conn.execute(
                        'INSERT INTO subjects (name, code, subgroup, year) VALUES (?, ?, ?, ?)',
                        (subject_name, subject_code, subgroup, year)
                    )
                    subject_id = conn.execute('SELECT last_insert_rowid()').fetchone()[0]
                    subjects_created += 1
                else:
                    subject_id = subject['id']
                
                # Insert timetable entry
                conn.execute('''
                    INSERT INTO timetable 
                    (subject_id, subgroup, day_of_week, start_time, end_time, type, room, instructor)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (subject_id, subgroup, day_num, start_time, end_time, class_type, room, instructor))
                
                records_imported += 1
                
            except Exception as e:
                print(f"Error processing row {idx+2}: {str(e)}")
                continue
        
        conn.commit()
        
        message = f"Successfully imported {records_imported} classes"
        if subjects_created > 0:
            message += f" and created {subjects_created} new subjects"
            
        return True, message, records_imported
        
    except Exception as e:
        return False, f"Error processing file: {str(e)}", 0

def register_upload_routes(app, get_db_connection):
    """Register upload-related routes"""
    
    @app.route('/api/upload-timetable', methods=['POST'])
    def upload_timetable():
        """Upload and process timetable Excel file"""
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload .xlsx or .xls file'}), 400
        
        # Get year and subgroup from form
        year = request.form.get('year')
        subgroup = request.form.get('subgroup')
        
        if not year or not subgroup:
            return jsonify({'error': 'Year and subgroup are required'}), 400
        
        try:
            # Save file
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Process file
            conn = get_db_connection()
            success, message, records_count = process_timetable_excel(filepath, conn)
            conn.close()
            
            # Track upload in database
            if success:
                conn = get_db_connection()
                conn.execute('''
                    INSERT INTO excel_uploads (filename, subgroup, year, records_count)
                    VALUES (?, ?, ?, ?)
                ''', (filename, subgroup, year, records_count))
                conn.commit()
                conn.close()
            
            # Clean up file (optional - you might want to keep it)
            # os.remove(filepath)
            
            if success:
                return jsonify({
                    'message': message,
                    'records_count': records_count,
                    'filename': filename
                }), 200
            else:
                return jsonify({'error': message}), 400
                
        except Exception as e:
            return jsonify({'error': f'Upload failed: {str(e)}'}), 500
    
    @app.route('/api/upload-history', methods=['GET'])
    def upload_history():
        """Get history of uploaded files"""
        conn = get_db_connection()
        uploads = conn.execute('''
            SELECT id, filename, subgroup, year, records_count, uploaded_at
            FROM excel_uploads
            ORDER BY uploaded_at DESC
            LIMIT 20
        ''').fetchall()
        conn.close()
        
        return jsonify([dict(u) for u in uploads])
