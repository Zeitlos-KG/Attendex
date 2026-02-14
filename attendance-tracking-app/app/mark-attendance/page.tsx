"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Check, X, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { api, type Subject, type TimetableEntry, type AttendanceRecord } from "@/lib/api"
import { getNormalizedSubgroup } from "@/lib/subgroup-utils"

type ClassType = "Class" | "Tutorial" | "Lab"

const typeColors: Record<ClassType, { bg: string; text: string }> = {
  Class: { bg: "bg-primary/10", text: "text-primary" },
  Tutorial: { bg: "bg-success/10", text: "text-success" },
  Lab: { bg: "bg-warning/10", text: "text-warning" },
}

interface MarkedClass {
  timetable_id: number
  status: 'Present' | 'Absent'
}

export default function MarkAttendancePage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [markedClasses, setMarkedClasses] = useState<Map<number, 'Present' | 'Absent'>>(new Map())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const subgroup = await getNormalizedSubgroup()

        const [subjectsData, timetableData] = await Promise.all([
          subgroup ? api.getSubjects(subgroup) : Promise.resolve([]),
          subgroup ? api.getTimetable(subgroup) : Promise.resolve([])
        ])
        setSubjects(subjectsData)
        setTimetable(timetableData)

        if (!subgroup) {
          setError('Please set your subgroup in profile to see your classes.')
        }

      } catch (err) {
        setError('Failed to load data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Load attendance for selected date
  useEffect(() => {
    async function loadAttendanceForDate() {
      try {
        const allAttendance = await api.getAttendanceHistory()
        const dateStr = selectedDate.toISOString().split('T')[0]

        // Filter attendance for selected date and build map
        const newMarkedClasses = new Map<number, 'Present' | 'Absent'>()
        allAttendance
          .filter(record => record.date === dateStr)
          .forEach(record => {
            newMarkedClasses.set(record.timetable_id, record.status)
          })

        setMarkedClasses(newMarkedClasses)
      } catch (err) {
        console.error('Failed to load attendance for date:', err)
      }
    }

    if (timetable.length > 0) {
      loadAttendanceForDate()
    }
  }, [selectedDate, timetable.length])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const markAttendance = async (timetableId: number, present: boolean) => {
    setSaving(true)
    try {
      const status = present ? 'Present' : 'Absent'
      const dateStr = selectedDate.toISOString().split('T')[0]

      await api.markAttendance(timetableId, dateStr, status)

      setMarkedClasses(prev => new Map(prev).set(timetableId, status))
    } catch (err) {
      console.error('Failed to mark attendance:', err)
      alert('Failed to mark attendance. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const unmarkAttendance = async (timetableId: number) => {
    setSaving(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]

      await api.deleteAttendance(timetableId, dateStr)

      setMarkedClasses(prev => {
        const newMap = new Map(prev)
        newMap.delete(timetableId)
        return newMap
      })
    } catch (err) {
      console.error('Failed to unmark attendance:', err)
      alert('Failed to unmark attendance. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString()
  const dayOfWeek = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1
  const todayClasses = timetable.filter(t => t.day_of_week === dayOfWeek)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
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
          <div className="mx-auto max-w-4xl">
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
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Mark Attendance</h1>
            <p className="text-muted-foreground">
              Record your attendance for classes
            </p>
          </div>

          {/* Date Selector */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => changeDate(-1)}
                className="p-2 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-center flex-1">
                <div className="flex items-center justify-center">
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
                    className="bg-transparent border-none text-center font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{formatDate(selectedDate)}</p>
              </div>

              <button
                type="button"
                onClick={() => changeDate(1)}
                className="p-2 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Today's Classes */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              {isToday ? "Today's" : formatDate(selectedDate) + "'s"} Classes
            </h2>

            {todayClasses.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed border-border/50 text-muted-foreground">
                No classes scheduled for this day
              </div>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((cls) => {
                  const colors = typeColors[cls.type as ClassType]
                  const marked = markedClasses.get(cls.id)

                  return (
                    <div
                      key={cls.id}
                      className={cn(
                        "rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 transition-all duration-300",
                        marked === 'Present' && "border-success/50 bg-success/5",
                        marked === 'Absent' && "border-destructive/50 bg-destructive/5"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">{cls.subject_name}</h3>
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", colors.bg, colors.text)}>
                              {cls.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {cls.start_time} - {cls.end_time}
                            </span>
                            <span>{cls.subject_code}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!marked ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAttendance(cls.id, false)}
                                disabled={saving}
                                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Absent
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => markAttendance(cls.id, true)}
                                disabled={saving}
                                className="bg-success hover:bg-success/90 text-success-foreground"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Present
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-sm font-medium px-3 py-1.5 rounded-full",
                                  marked === 'Present'
                                    ? "bg-success/10 text-success"
                                    : "bg-destructive/10 text-destructive"
                                )}
                              >
                                {marked === 'Present' ? "Marked Present" : "Marked Absent"}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => unmarkAttendance(cls.id)}
                                disabled={saving}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Unmark attendance"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
