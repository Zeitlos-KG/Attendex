"""
Correct 1A82 Timetable Data Importer
Based on actual Sem 2 timetable image

Subject Information:
1. Physics (UPH013) - 3 lectures, 1 lab, 1 tutorial
2. Engineering Drawing (UES101) - 2 lectures, 1 tutorial, 1 lab
3. Maths II (UMA023) - 3 lectures, 1 tutorial
4. Professional Communication (UHU003) - 2 lectures, 1 lab
5. Manufacturing Processes (UES102) - 2 lectures, 1 lab

Class Durations:
- Lectures: 50 minutes
- Tutorials: 50 minutes (except Engineering Drawing Tutorial: 1hr 40mins)
- Labs: 1hr 40 minutes (100 minutes)
"""

import sqlite3

# Connect to database
conn = sqlite3.connect('student_planner.db')
c = conn.cursor()

print("=" * 70)
print("CLEARING OLD 1A82 DATA")
print("=" * 70)

# Clear old data for 1A82
c.execute('DELETE FROM attendance WHERE timetable_id IN (SELECT id FROM timetable WHERE subgroup = ?)', ('1A82',))
c.execute('DELETE FROM timetable WHERE subgroup = ?', ('1A82',))
c.execute('DELETE FROM subjects WHERE subgroup = ?', ('1A82',))
conn.commit()

print("✓ Cleared old data\n")

# Subject definitions (base codes without L/T/P suffix)
subjects = [
    ('Physics', 'UPH013', '1A82', 1),
    ('Engineering Drawing', 'UES101', '1A82', 1),
    ('Maths II', 'UMA023', '1A82', 1),
    ('Professional Communication', 'UHU003', '1A82', 1),
    ('Manufacturing Processes', 'UES102', '1A82', 1),
]

print("=" * 70)
print("INSERTING SUBJECTS")
print("=" * 70)

for name, code, subgroup, year in subjects:
    c.execute('INSERT INTO subjects (name, code, subgroup, year) VALUES (?, ?, ?, ?)',
              (name, code, subgroup, year))
    print(f"✓ Added: {code} - {name}")

conn.commit()
print()

# Get subject IDs
subject_ids = {}
for name, code, _, _ in subjects:
    c.execute('SELECT id FROM subjects WHERE code = ? AND subgroup = ?', (code, '1A82'))
    subject_ids[code] = c.fetchone()[0]

# Timetable entries based on the image
# Format: (subject_code, day_of_week, start_time, end_time, type)
# Days: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday

timetable_entries = [
    # MONDAY
    ('UMA023', 0, '09:40', '10:30', 'Tutorial'),  # Differential Equations Tutorial
    ('UPH013', 0, '10:30', '11:20', 'Tutorial'),  # Physics Tutorial
    ('UES102', 0, '11:20', '12:10', 'Class'),     # Manufacturing Processes Lecture
    ('UPH013', 0, '12:10', '13:00', 'Class'),     # Physics Lecture
    
    # TUESDAY
    ('UES101', 1, '08:00', '08:50', 'Class'),     # Engineering Drawing Lecture
    ('UMA023', 1, '08:50', '09:40', 'Class'),     # Differential Equations Lecture
    ('UHU003', 1, '09:40', '10:30', 'Class'),     # Professional Communication Lecture
    ('UPH013', 1, '13:50', '15:30', 'Lab'),       # Physics Lab - 100 minutes
    ('UES102', 1, '15:30', '17:10', 'Lab'),       # Manufacturing Processes Lab - 100 minutes
    
    # WEDNESDAY
    ('UES101', 2, '13:00', '14:40', 'Tutorial'),  # Engineering Drawing Tutorial - 100 minutes
    ('UES102', 2, '14:40', '15:30', 'Class'),     # Manufacturing Processes Lecture
    ('UMA023', 2, '15:30', '16:20', 'Class'),     # Differential Equations Lecture
    ('UPH013', 2, '16:20', '17:10', 'Class'),     # Physics Lecture
    
    # THURSDAY
    ('UPH013', 3, '09:40', '10:30', 'Class'),     # Physics Lecture
    ('UES101', 3, '10:30', '11:20', 'Class'),     # Engineering Drawing Lecture
    ('UES101', 3, '11:20', '13:00', 'Lab'),       # Engineering Drawing Lab - 100 minutes
    ('UHU003', 3, '13:50', '15:30', 'Lab'),       # Professional Communication Lab - 100 minutes
    
    # FRIDAY
    ('UMA023', 4, '09:40', '10:30', 'Class'),     # Differential Equations Lecture
    ('UHU003', 4, '10:30', '11:20', 'Class'),     # Professional Communication Lecture
]

print("=" * 70)
print("INSERTING TIMETABLE ENTRIES")
print("=" * 70)

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

for subject_code, day_idx, start_time, end_time, class_type in timetable_entries:
    subject_id = subject_ids[subject_code]
    
    c.execute('''INSERT INTO timetable 
                 (subject_id, subgroup, day_of_week, start_time, end_time, type, room, instructor)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
              (subject_id, '1A82', day_idx, start_time, end_time, class_type, '', ''))
    
    # Get subject name
    subject_name = next(name for name, code, _, _ in subjects if code == subject_code)
    print(f"✓ {days[day_idx]:9s} {start_time}-{end_time} | {subject_code:7s} | {class_type:8s} | {subject_name}")

conn.commit()

# Summary
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)

c.execute('SELECT COUNT(*) FROM subjects WHERE subgroup = ?', ('1A82',))
subject_count = c.fetchone()[0]

c.execute('SELECT COUNT(*) FROM timetable WHERE subgroup = ?', ('1A82',))
timetable_count = c.fetchone()[0]

print(f"✓ Total subjects: {subject_count}")
print(f"✓ Total timetable entries: {timetable_count}")

# Show class count per subject
print("\n📊 Classes per subject:")
for name, code, _, _ in subjects:
    c.execute('''SELECT COUNT(*) FROM timetable WHERE subject_id = ? AND subgroup = ?''',
              (subject_ids[code], '1A82'))
    count = c.fetchone()[0]
    print(f"  • {name:30s} ({code}): {count} classes/week")

conn.close()

print("\n" + "=" * 70)
print("✅ TIMETABLE IMPORT COMPLETE")
print("=" * 70)
print("\n🎯 Refresh your browser and check the timetable!")
