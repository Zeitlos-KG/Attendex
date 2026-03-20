/**
 * guest-data.ts
 * Real 1A11 timetable data used as demo data for guest mode.
 * Subjects and schedule are identical to the real 1A11 subgroup.
 * Attendance stats are realistic sample values (~81% overall, one subject at 68%).
 */

import type { DashboardStats, TimetableEntry, Subject, AttendanceRecord } from './api'

// ─── Subjects ────────────────────────────────────────────────────────────────

export const GUEST_SUBJECTS: Subject[] = [
    { id: 1, name: 'Physics', code: 'UPH013', created_at: '2025-07-01T00:00:00Z' },
    { id: 2, name: 'Engineering Drawing', code: 'UES101', created_at: '2025-07-01T00:00:00Z' },
    { id: 3, name: 'Differential Equations and Linear Algebra', code: 'UMA023', created_at: '2025-07-01T00:00:00Z' },
    { id: 4, name: 'Professional Communication', code: 'UHU003', created_at: '2025-07-01T00:00:00Z' },
    { id: 5, name: 'Manufacturing Processes', code: 'UES102', created_at: '2025-07-01T00:00:00Z' },
]

// ─── Timetable ────────────────────────────────────────────────────────────────
// day_of_week: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri

export const GUEST_TIMETABLE: TimetableEntry[] = [
    // MONDAY
    { id: 1, subject_id: 1, subject_name: 'Physics', subject_code: 'UPH013', day_of_week: 0, start_time: '09:40', end_time: '11:20', type: 'Lab' },
    { id: 2, subject_id: 4, subject_name: 'Professional Communication', subject_code: 'UHU003', day_of_week: 0, start_time: '11:20', end_time: '13:00', type: 'Lab' },
    { id: 3, subject_id: 4, subject_name: 'Professional Communication', subject_code: 'UHU003', day_of_week: 0, start_time: '13:50', end_time: '14:40', type: 'Class' },
    { id: 4, subject_id: 5, subject_name: 'Manufacturing Processes', subject_code: 'UES102', day_of_week: 0, start_time: '14:40', end_time: '15:30', type: 'Class' },
    { id: 5, subject_id: 1, subject_name: 'Physics', subject_code: 'UPH013', day_of_week: 0, start_time: '15:30', end_time: '16:20', type: 'Class' },

    // TUESDAY
    { id: 6, subject_id: 5, subject_name: 'Manufacturing Processes', subject_code: 'UES102', day_of_week: 1, start_time: '09:40', end_time: '11:20', type: 'Lab' },
    { id: 7, subject_id: 2, subject_name: 'Engineering Drawing', subject_code: 'UES101', day_of_week: 1, start_time: '15:30', end_time: '17:10', type: 'Tutorial' },

    // WEDNESDAY
    { id: 8, subject_id: 3, subject_name: 'Differential Equations and Linear Algebra', subject_code: 'UMA023', day_of_week: 2, start_time: '09:40', end_time: '10:30', type: 'Class' },
    { id: 9, subject_id: 1, subject_name: 'Physics', subject_code: 'UPH013', day_of_week: 2, start_time: '10:30', end_time: '11:20', type: 'Class' },
    { id: 10, subject_id: 2, subject_name: 'Engineering Drawing', subject_code: 'UES101', day_of_week: 2, start_time: '11:20', end_time: '12:10', type: 'Class' },
    { id: 11, subject_id: 4, subject_name: 'Professional Communication', subject_code: 'UHU003', day_of_week: 2, start_time: '12:10', end_time: '13:00', type: 'Class' },

    // THURSDAY
    { id: 12, subject_id: 5, subject_name: 'Manufacturing Processes', subject_code: 'UES102', day_of_week: 3, start_time: '10:30', end_time: '11:20', type: 'Class' },
    { id: 13, subject_id: 2, subject_name: 'Engineering Drawing', subject_code: 'UES101', day_of_week: 3, start_time: '11:20', end_time: '12:10', type: 'Class' },
    { id: 14, subject_id: 3, subject_name: 'Differential Equations and Linear Algebra', subject_code: 'UMA023', day_of_week: 3, start_time: '12:10', end_time: '13:00', type: 'Class' },

    // FRIDAY
    { id: 15, subject_id: 1, subject_name: 'Physics', subject_code: 'UPH013', day_of_week: 4, start_time: '08:00', end_time: '08:50', type: 'Tutorial' },
    { id: 16, subject_id: 3, subject_name: 'Differential Equations and Linear Algebra', subject_code: 'UMA023', day_of_week: 4, start_time: '08:50', end_time: '09:40', type: 'Tutorial' },
    { id: 17, subject_id: 1, subject_name: 'Physics', subject_code: 'UPH013', day_of_week: 4, start_time: '09:40', end_time: '10:30', type: 'Class' },
    { id: 18, subject_id: 3, subject_name: 'Differential Equations and Linear Algebra', subject_code: 'UMA023', day_of_week: 4, start_time: '10:30', end_time: '11:20', type: 'Class' },
    { id: 19, subject_id: 2, subject_name: 'Engineering Drawing', subject_code: 'UES101', day_of_week: 4, start_time: '11:20', end_time: '13:00', type: 'Lab' },
]

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export const GUEST_DASHBOARD_STATS: DashboardStats = {
    total_subjects: 5,
    total_classes: 96,   // realistic for ~8 weeks in
    attended_classes: 79,
    overall_percentage: 82,
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export const GUEST_ANALYTICS = {
    subjects: [
        { id: 1, name: 'Physics', code: 'UPH013', total_weight: 24, attended_weight: 22, percentage: 92 },
        { id: 2, name: 'Engineering Drawing', code: 'UES101', total_weight: 16, attended_weight: 11, percentage: 68 },
        { id: 3, name: 'Differential Equations and Linear Algebra', code: 'UMA023', total_weight: 20, attended_weight: 17, percentage: 85 },
        { id: 4, name: 'Professional Communication', code: 'UHU003', total_weight: 18, attended_weight: 15, percentage: 83 },
        { id: 5, name: 'Manufacturing Processes', code: 'UES102', total_weight: 18, attended_weight: 14, percentage: 78 },
    ],
    // Last 14 days of realistic attendance history
    attendance_history: generateGuestHistory(),
}

function generateGuestHistory(): Array<{ date: string; status: string; timetable_id: number }> {
    const records: Array<{ date: string; status: string; timetable_id: number }> = []

    // ~14 days ago from a fixed anchor (stateless — always the same regardless of today's date)
    // We use a seed-like pattern keyed by day index so the data looks realistic
    const presencePattern = [
        // day 0–6 (week 1)
        [true, true, false, true, true, true, true, true, true, true, false, true, true, true],
        [true, true, true, true, true, true, true, false, true, false, true, true, true, true],
        [true, true, true, true, false, true, true, true, true, true, true, true, false, true],
        [true, false, true, true, true, true, true, true, true, true, true, false, true, true],
        [true, true, true, false, true, true, false, true, true, true, true, true, true, true],
    ]

    const today = new Date()
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
        const d = new Date(today)
        d.setDate(d.getDate() - dayOffset)
        const dow = d.getDay() // 0=Sun … 6=Sat
        if (dow === 0 || dow === 6) continue // skip weekends

        const ttDow = dow - 1 // convert to Mon=0
        const dayEntries = GUEST_TIMETABLE.filter(t => t.day_of_week === ttDow)
        const dateStr = d.toISOString().split('T')[0]

        dayEntries.forEach((entry, entryIdx) => {
            const patternRow = presencePattern[entryIdx % presencePattern.length]
            const isPresent = patternRow[13 - dayOffset] ?? true
            records.push({ date: dateStr, timetable_id: entry.id, status: isPresent ? 'Present' : 'Absent' })
        })
    }

    return records
}

// ─── Sample Attendance (for mark-attendance page) ─────────────────────────────
// Returns the records for "today" so the mark-attendance page looks pre-populated

export function getGuestTodayAttendance(): Map<number, 'Present' | 'Absent'> {
    const map = new Map<number, 'Present' | 'Absent'>()
    // Show a couple classes already marked
    map.set(1, 'Present')   // Physics Lab (Mon)
    map.set(2, 'Present')   // Prof Comm Lab (Mon)
    return map
}
