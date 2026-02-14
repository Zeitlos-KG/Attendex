/**
 * Academic Calendar Utility for Even Semester 2025-26
 * Handles semester dates, holidays, exams, and special working days
 */

export type DayType =
    | 'teaching'
    | 'holiday'
    | 'weekend'
    | 'exam-mst'
    | 'exam-est'
    | 'non-teaching'
    | 'special-working'

export interface DayStatus {
    type: DayType
    message: string
    isWorkingDay: boolean
    timetableDayOfWeek?: number // For special working days (e.g., Saturday following Monday schedule)
}

// Academic Calendar Data
const SEMESTER_START = new Date('2026-01-05T13:00:00')
const SEMESTER_END = new Date('2026-05-08')

// Holidays (format: YYYY-MM-DD)
export const holidays: { date: string; name: string }[] = [
    { date: '2026-01-26', name: 'Holiday' },
    { date: '2026-03-04', name: 'Holiday' },
    { date: '2026-03-21', name: 'Holiday' },
    { date: '2026-03-26', name: 'Holiday' },
    { date: '2026-04-13', name: 'Holiday' },
    { date: '2026-04-14', name: 'Holiday' },
]

// Non-teaching week
const NON_TEACHING_START = new Date('2026-03-02')
const NON_TEACHING_END = new Date('2026-03-07')

// Mid-semester tests
const MST_START = new Date('2026-03-09')
const MST_END = new Date('2026-03-21')

// End-semester tests
const EST_START = new Date('2026-05-11')
const EST_END = new Date('2026-05-23')

// Special working days
const SPECIAL_WORKING_DAYS: { date: string; followsDay: number; reason: string }[] = [
    {
        date: '2026-04-18', // Saturday
        followsDay: 0, // Monday (0-indexed)
        reason: 'Compensatory working day for April 13'
    }
]

/**
 * Get the status of a specific date
 */
export function getDayStatus(date: Date): DayStatus {
    const dateStr = formatDate(date)
    const dayOfWeek = date.getDay()

    // Check if before semester start
    if (date < SEMESTER_START) {
        return {
            type: 'non-teaching',
            message: 'Semester has not started yet',
            isWorkingDay: false
        }
    }

    // Check if after semester end
    if (date > SEMESTER_END) {
        return {
            type: 'non-teaching',
            message: 'Semester has ended',
            isWorkingDay: false
        }
    }

    // Check special working days first
    const specialDay = SPECIAL_WORKING_DAYS.find(d => d.date === dateStr)
    if (specialDay) {
        return {
            type: 'special-working',
            message: `Special Working Day - Following ${getDayName(specialDay.followsDay)} schedule`,
            isWorkingDay: true,
            timetableDayOfWeek: specialDay.followsDay
        }
    }

    // Check holidays
    const holiday = holidays.find(h => h.date === dateStr)
    if (holiday) {
        return {
            type: 'holiday',
            message: holiday.name,
            isWorkingDay: false
        }
    }

    // Check exam periods
    if (date >= EST_START && date <= EST_END) {
        return {
            type: 'exam-est',
            message: 'End Semester Examinations',
            isWorkingDay: false
        }
    }

    if (date >= MST_START && date <= MST_END) {
        return {
            type: 'exam-mst',
            message: 'Mid Semester Tests',
            isWorkingDay: false
        }
    }

    // Check non-teaching week
    if (date >= NON_TEACHING_START && date <= NON_TEACHING_END) {
        return {
            type: 'holiday',
            message: 'Holiday',
            isWorkingDay: false
        }
    }

    // Check weekend (Sunday = 0, Saturday = 6)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return {
            type: 'weekend',
            message: 'Weekend',
            isWorkingDay: false
        }
    }

    // Regular teaching day (Monday to Friday)
    return {
        type: 'teaching',
        message: 'Regular Teaching Day',
        isWorkingDay: true
    }
}

/**
 * Get timetable day index for a given date
 * Returns 0-6 for Monday-Sunday
 */
export function getTimetableDayOfWeek(date: Date): number {
    const status = getDayStatus(date)

    // If special working day, return the day it follows
    if (status.timetableDayOfWeek !== undefined) {
        return status.timetableDayOfWeek
    }

    // Convert JS day (0=Sunday) to our format (0=Monday)
    const jsDay = date.getDay()
    return jsDay === 0 ? 6 : jsDay - 1
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
}

/**
 * Get day name from index (0=Monday, 6=Sunday)
 */
function getDayName(dayIndex: number): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days[dayIndex] || 'Unknown'
}

/**
 * Check if a date is a working day
 */
export function isWorkingDay(date: Date): boolean {
    return getDayStatus(date).isWorkingDay
}

/**
 * Get CSS color classes for day type
 */
export function getDayTypeColors(type: DayType): { bg: string; text: string; border: string } {
    switch (type) {
        case 'teaching':
            return { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' }
        case 'special-working':
            return { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' }
        case 'holiday':
            return { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' }
        case 'weekend':
            return { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-muted' }
        case 'exam-mst':
        case 'exam-est':
            return { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' }
        case 'non-teaching':
            return { bg: 'bg-secondary/50', text: 'text-muted-foreground', border: 'border-secondary' }
        default:
            return { bg: 'bg-muted', text: 'text-foreground', border: 'border-border' }
    }
}
