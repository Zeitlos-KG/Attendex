"""
Validation test for the Excel importer.
Runs the parser on 1ST YEAR A and outputs detailed data for a few subgroups.
Helps compare against known-good data like TT_1A38.py
"""
import sys
import openpyxl
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent))

from import_from_excel import parse_sheet, SUBJECT_NAMES

EXCEL_PATH = Path(__file__).parent.parent / "docs" / "resources" / "UG, PG TIME TABLE JAN TO MAY 2026.xlsx"

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def show_subgroup(sg, data):
    print(f"\n{'='*60}")
    print(f"SUBGROUP: {sg}")
    print(f"Subjects ({len(data['subjects'])}):")
    for code in sorted(data['subjects']):
        name = SUBJECT_NAMES.get(code, '???')
        print(f"  {code} -> {name}")
    print(f"\nTimetable ({len(data['timetable'])} entries):")
    entries = sorted(data['timetable'], key=lambda x: (x[1], x[2]))
    current_day = None
    for entry in entries:
        code, day, start, end, cls_type = entry[:5]
        if day != current_day:
            print(f"  --- {DAYS[day]} ---")
            current_day = day
        duration = (int(end[:2])*60 + int(end[3:])) - (int(start[:2])*60 + int(start[3:]))
        print(f"  {start}-{end} ({duration:3d}min) [{cls_type:10s}] {code}")
    print(f"{'='*60}")

print(f"Loading Excel (this takes a minute)...")
wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
ws = wb['1ST YEAR A']
print("Parsing...")
all_data = parse_sheet(ws)

# Show a few specific subgroups
SHOW = ['1A1A', '1A1B', '1A1H']   # practical subgroups

for sg in SHOW:
    if sg in all_data:
        show_subgroup(sg, all_data[sg])
    else:
        print(f"\n[!] Subgroup {sg} not found. Available: {list(all_data.keys())[:10]}")

print(f"\n\nTotal subgroups found in 1ST YEAR A: {len(all_data)}")
print(f"All subgroup codes: {sorted(all_data.keys())}")
