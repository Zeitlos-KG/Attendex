"""
Migrate database to support subgroups
"""
import sqlite3

conn = sqlite3.connect('student_planner.db')
c = conn.cursor()

print("Adding subgroup support to database...")

# Add columns to existing tables
try:
    c.execute('ALTER TABLE subjects ADD COLUMN subgroup TEXT')
    print("✓ Added subgroup column to subjects")
except:
    print("- subgroup column already exists in subjects")

try:
    c.execute('ALTER TABLE subjects ADD COLUMN year INTEGER')
    print("✓ Added year column to subjects")
except:
    print("- year column already exists in subjects")

try:
    c.execute('ALTER TABLE timetable ADD COLUMN subgroup TEXT')
    print("✓ Added subgroup column to timetable")
except:
    print("- subgroup column already exists in timetable")

try:
    c.execute('ALTER TABLE timetable ADD COLUMN room TEXT')
    print("✓ Added room column to timetable")
except:
    print("- room column already exists in timetable")

try:
    c.execute('ALTER TABLE timetable ADD COLUMN instructor TEXT')
    print("✓ Added instructor column to timetable")
except:
    print("- instructor column already exists in timetable")

conn.commit()
conn.close()

print("\n✅ Database migration complete!")
