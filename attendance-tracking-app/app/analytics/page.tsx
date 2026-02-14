"use client"

import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { getNormalizedSubgroup } from "@/lib/subgroup-utils"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Target,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  Cell,
} from "recharts"

// Mock data removed - fetching from API now

interface DailyAttendanceData {
  date: string
  attendance: number
  totalClasses: number
  attended: number
}

function getStatusColor(status: string) {
  switch (status) {
    case "safe":
      return "text-success"
    case "warning":
      return "text-warning"
    case "danger":
      return "text-destructive"
    default:
      return "text-muted-foreground"
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case "safe":
      return "bg-success"
    case "warning":
      return "bg-warning"
    case "danger":
      return "bg-destructive"
    default:
      return "bg-muted"
  }
}

function getBarColor(attendance: number) {
  if (attendance >= 75) return "#ffffff" // White for safe
  if (attendance >= 65) return "#a1a1aa" // Grey for warning  
  return "#71717a" // Dark grey for danger
}

export default function AnalyticsPage() {
  const [subjectData, setSubjectData] = useState<any[]>([])
  const [dailyData, setDailyData] = useState<DailyAttendanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)

  // Calculate daily attendance percentage
  function calculateDailyAttendance(attendance: any[], days: number): DailyAttendanceData[] {
    const today = new Date()
    const dailyMap = new Map<string, { total: number, present: number }>()

    // Initialize last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyMap.set(dateStr, { total: 0, present: 0 })
    }

    // Count attendance for each day
    attendance.forEach(record => {
      if (dailyMap.has(record.date)) {
        const day = dailyMap.get(record.date)!
        day.total++
        if (record.status === 'Present') {
          day.present++
        }
      }
    })

    // Convert to array with percentages
    return Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        attendance: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
        totalClasses: stats.total,
        attended: stats.present
      }))
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const subgroup = await getNormalizedSubgroup()
        if (!subgroup) {
          setError('Please set subgroup in profile')
          setLoading(false)
          return
        }

        const [subjects, allAttendance] = await Promise.all([
          api.getSubjects(subgroup),
          api.getAttendanceHistory()
        ])

        // Fetch attendance for each subject
        const data = await Promise.all(subjects.map(async (subj) => {
          const stats = await api.getSubjectAttendance(subj.id)

          let status = 'safe'
          if (stats.percentage < 75) status = 'danger'
          else if (stats.percentage < 80) status = 'warning'

          return {
            id: subj.id,
            name: subj.name,
            code: subj.code,
            attendance: stats.percentage,
            totalClasses: stats.total_weight, // Using weight as class count proxy
            attended: stats.attended_weight,
            missed: stats.total_weight - stats.attended_weight,
            trend: 0, // No trend data yet
            status: status
          }
        }))

        setSubjectData(data)

        // Calculate daily attendance for last 14 days
        const dailyAttendance = calculateDailyAttendance(allAttendance, 14)
        setDailyData(dailyAttendance)
      } catch (err) {
        console.error(err)
        setError('Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const overallAttendance = subjectData.length > 0
    ? Math.round(subjectData.reduce((acc, s) => acc + s.attendance, 0) / subjectData.length)
    : 0

  const safeCount = subjectData.filter((s) => s.status === "safe").length
  const warningCount = subjectData.filter((s) => s.status === "warning").length
  const dangerCount = subjectData.filter((s) => s.status === "danger").length

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  const selectedSubjectData = selectedSubject
    ? subjectData.find((s) => s.id === selectedSubject)
    : null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Detailed insights into your attendance patterns
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall</p>
                  <p className="text-2xl font-bold text-foreground">{overallAttendance}%</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Safe</p>
                  <p className="text-2xl font-bold text-foreground">{safeCount} subjects</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Warning</p>
                  <p className="text-2xl font-bold text-foreground">{warningCount} subjects</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">At Risk</p>
                  <p className="text-2xl font-bold text-foreground">{dangerCount} subjects</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Trend */}
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Daily Attendance Trend (Last 14 Days)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <XAxis
                      dataKey="date"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: "8px",
                        color: "#f8fafc",
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'attendance') return [`${value}%`, 'Attendance']
                        return [value, name]
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: "#6366f1", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#6366f1" }}
                    />
                    {/* 75% threshold line */}
                    <Line
                      type="monotone"
                      dataKey={() => 75}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                <span className="inline-block w-3 h-0.5 bg-destructive mr-2" style={{ verticalAlign: "middle" }} />
                Red dashed line indicates 75% threshold
              </p>
            </div>

            {/* Subject Breakdown */}
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Subject-wise Comparison</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="vertical">
                    <XAxis
                      type="number"
                      stroke="#ffffff"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <YAxis
                      type="category"
                      dataKey="code"
                      stroke="#ffffff"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                    />
                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "12px",
                        padding: "12px 16px",
                      }}
                      labelStyle={{ color: "#ffffff", fontWeight: "600" }}
                      itemStyle={{ color: "#ffffff" }}
                      formatter={(value: number) => [`${value}%`, "Attendance"]}
                    />
                    <Bar dataKey="attendance" radius={[0, 12, 12, 0]} background={false}>
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.attendance)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Subject Details */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Subject Details</h2>

            {/* Subject Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setSelectedSubject(null)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  selectedSubject === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                )}
              >
                All Subjects
              </button>
              {subjectData.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubject(subject.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    selectedSubject === subject.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {subject.name}
                </button>
              ))}
            </div>

            {/* Subject Cards or Detail View */}
            {selectedSubject === null ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjectData.map((subject) => (
                  <div
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedSubject(subject.id)}
                    role="button"
                    tabIndex={0}
                    className="p-4 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground">{subject.code}</p>
                      </div>
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full",
                          getStatusBg(subject.status)
                        )}
                      />
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className={cn("text-3xl font-bold", getStatusColor(subject.status))}>
                          {subject.attendance}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {subject.attended}/{subject.totalClasses} classes
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedSubjectData ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{selectedSubjectData.name}</h3>
                    <p className="text-muted-foreground">{selectedSubjectData.code}</p>
                  </div>
                  <div className={cn("text-4xl font-bold", getStatusColor(selectedSubjectData.status))}>
                    {selectedSubjectData.attendance}%
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm">Total Classes</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedSubjectData.totalClasses}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Attended</span>
                    </div>
                    <p className="text-2xl font-bold text-success">{selectedSubjectData.attended}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="flex items-center gap-2 text-destructive mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Missed</span>
                    </div>
                    <p className="text-2xl font-bold text-destructive">{selectedSubjectData.missed}</p>
                  </div>
                </div>

                {/* Progress to 75% */}
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Progress to 75% threshold</span>
                    <span className={cn("text-sm font-semibold", getStatusColor(selectedSubjectData.status))}>
                      {selectedSubjectData.attendance >= 75
                        ? `${selectedSubjectData.attendance - 75}% above`
                        : `${75 - selectedSubjectData.attendance}% needed`}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        getStatusBg(selectedSubjectData.status)
                      )}
                      style={{ width: `${Math.min(selectedSubjectData.attendance, 100)}%` }}
                    />
                  </div>
                  <div
                    className="relative h-0"
                    style={{ marginTop: "-12px" }}
                  >
                    <div
                      className="absolute w-0.5 h-4 bg-foreground/50"
                      style={{ left: "75%" }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
