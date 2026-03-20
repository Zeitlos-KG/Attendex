"use client"

import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Home } from "lucide-react"
import { api, type TimetableEntry } from "@/lib/api"
import { getNormalizedSubgroup } from "@/lib/subgroup-utils"
import { getDayStatus, getTimetableDayOfWeek, getDayTypeColors, type DayStatus } from "@/lib/academic-calendar"
import { useGuestMode } from "@/lib/guest-context"
import { GUEST_TIMETABLE } from "@/lib/guest-data"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const shortDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

type ClassType = "Class" | "Tutorial" | "Lab"

const typeColors: Record<ClassType, { bg: string; text: string; border: string }> = {
  Class: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
  Tutorial: { bg: "bg-success/10", text: "text-success", border: "border-success/30" },
  Lab: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
}

export default function TimetablePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dayStatus, setDayStatus] = useState<DayStatus | null>(null)
  const { isGuest } = useGuestMode()

  useEffect(() => {
    async function fetchTimetable() {
      if (isGuest) {
        setTimetable(GUEST_TIMETABLE)
        setLoading(false)
        return
      }
      try {
        const subgroup = await getNormalizedSubgroup()

        if (!subgroup) {
          setError('Please set your subgroup in profile/onboarding to view your timetable.')
          setLoading(false)
          return
        }

        const data = await api.getTimetable(subgroup)
        setTimetable(data)
      } catch (err) {
        setError('Failed to load timetable')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTimetable()
  }, [isGuest])

  // Update day status when date changes
  useEffect(() => {
    setDayStatus(getDayStatus(selectedDate))
  }, [selectedDate])

  // Group timetable by day
  const timetableByDay: Record<string, TimetableEntry[]> = {}
  days.forEach(day => {
    timetableByDay[day] = []
  })

  timetable.forEach(entry => {
    const dayName = days[entry.day_of_week]
    if (dayName) {
      timetableByDay[dayName].push(entry)
    }
  })

  // Sort classes by start time within each day
  Object.keys(timetableByDay).forEach(day => {
    timetableByDay[day].sort((a, b) => a.start_time.localeCompare(b.start_time))
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center min-h-[400px] flex items-center justify-center">
              <div>
                <p className="text-destructive mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-primary hover:text-primary/80"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header with Date Navigation */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Timetable</h1>
              <p className="text-muted-foreground">
                View your class schedule
              </p>
            </div>

            {/* Date Picker and Navigation */}
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Previous Day Button */}
                <button
                  type="button"
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setDate(newDate.getDate() - 1)
                    setSelectedDate(newDate)
                  }}
                  className="p-2 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Date Display and Picker */}
                <div className="flex-1 flex flex-col items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
                    className="bg-transparent border-none text-center text-lg font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
                  />
                  <div className="text-sm text-muted-foreground">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {/* Next Day Button */}
                <button
                  type="button"
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setDate(newDate.getDate() + 1)
                    setSelectedDate(newDate)
                  }}
                  className="p-2 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
                  aria-label="Next day"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Today Button */}
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date())}
                  disabled={selectedDate.toDateString() === new Date().toDateString()}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    selectedDate.toDateString() === new Date().toDateString()
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-foreground hover:bg-secondary"
                  )}
                >
                  <Home className="h-4 w-4" />
                  Today
                </button>
              </div>
            </div>

            {/* Day Status Badge */}
            {dayStatus && (
              <div className={cn(
                "rounded-xl border p-4 backdrop-blur-sm",
                getDayTypeColors(dayStatus.type).bg,
                getDayTypeColors(dayStatus.type).border
              )}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={cn("font-semibold", getDayTypeColors(dayStatus.type).text)}>
                      {dayStatus.message}
                    </h3>
                    {dayStatus.timetableDayOfWeek !== undefined && (
                      <p className="text-sm text-muted-foreground mt-1">
                        This is a special working day following Monday's schedule
                      </p>
                    )}
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium",
                    getDayTypeColors(dayStatus.type).bg,
                    getDayTypeColors(dayStatus.type).text
                  )}>
                    {dayStatus.type.toUpperCase().replace('-', ' ')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Class Display — always show, regardless of day type */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Classes for {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </h2>
            </div>

            {(() => {
              const dayIdx = getTimetableDayOfWeek(selectedDate)
              const dayName = days[dayIdx]
              const classes = timetableByDay[dayName] ?? []

              return classes.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-border/50 text-muted-foreground">
                  No classes scheduled for this day
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {classes.map((entry) => (
                    <ClassCard key={entry.id} entry={entry} />
                  ))}
                </div>
              )
            })()}
          </div>

        </div>
      </main>
    </div>
  )
}

function ClassCard({ entry }: { entry: TimetableEntry }) {
  const colors = typeColors[entry.type as ClassType]

  return (
    <div
      className={cn(
        "rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 p-4",
        colors.border,
        colors.bg
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground text-base">
            {entry.subject_name}
          </h3>
          {entry.subject_code && (
            <p className="text-xs text-muted-foreground mt-0.5">{entry.subject_code}</p>
          )}
        </div>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            colors.bg,
            colors.text
          )}
        >
          {entry.type}
        </span>
      </div>

      <div className="space-y-1 mt-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">
            {entry.start_time} - {entry.end_time}
          </span>
        </div>
      </div>
    </div>
  )
}
