"use client"

import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { getNormalizedSubgroup } from "@/lib/subgroup-utils"
import {
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Target,
} from "lucide-react"
import { useGuestMode } from "@/lib/guest-context"
import { GUEST_ANALYTICS } from "@/lib/guest-data"

interface DailyAttendanceData {
  date: string
  attendance: number
  totalClasses: number
  attended: number
}

function getStatusColor(status: string) {
  switch (status) {
    case "safe": return "text-success"
    case "warning": return "text-warning"
    case "danger": return "text-destructive"
    default: return "text-muted-foreground"
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case "safe": return "bg-success"
    case "warning": return "bg-warning"
    case "danger": return "bg-destructive"
    default: return "bg-muted"
  }
}

function getBarHex(attendance: number) {
  if (attendance >= 75) return "#ffffff"
  if (attendance >= 65) return "#a1a1aa"
  return "#71717a"
}

// ─── Custom SVG Line Chart ────────────────────────────────────────────────────
function LineChartCustom({ data }: { data: DailyAttendanceData[] }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const W = 600
  const H = 200
  const PAD = { top: 12, right: 16, bottom: 28, left: 36 }
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  if (!data.length) return (
    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
      No attendance data yet
    </div>
  )

  const xStep = innerW / (data.length - 1 || 1)
  const yScale = (v: number) => PAD.top + innerH - (v / 100) * innerH

  const pts = data.map((d, i) => ({ x: PAD.left + i * xStep, y: yScale(d.attendance), d }))
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ")

  // Threshold y position (75%)
  const thresholdY = yScale(75)
  const yTicks = [0, 25, 50, 75, 100]

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Y grid lines + labels */}
        {yTicks.map(t => {
          const y = yScale(t)
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="rgba(148,163,184,0.15)" strokeWidth={1} />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end"
                fontSize={10} fill="#94a3b8">{t}</text>
            </g>
          )
        })}

        {/* 75% threshold dashed line */}
        <line x1={PAD.left} y1={thresholdY} x2={W - PAD.right} y2={thresholdY}
          stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 4" />

        {/* Area fill under line */}
        <polygon
          points={`${PAD.left},${PAD.top + innerH} ${polyline} ${W - PAD.right},${PAD.top + innerH}`}
          fill="rgba(99,102,241,0.08)"
        />

        {/* Line */}
        <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth={2.5}
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots + hover zones */}
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            {/* invisible wide hit area */}
            <rect x={p.x - xStep / 2} y={PAD.top} width={xStep} height={innerH} fill="transparent" />
            <circle cx={p.x} cy={p.y} r={hovered === i ? 6 : 3.5}
              fill={hovered === i ? "#ffffff" : "#6366f1"}
              stroke="#6366f1" strokeWidth={2}
              style={{ transition: "r 0.15s" }}
            />
          </g>
        ))}

        {/* X axis labels — every 2nd to avoid crowding */}
        {pts.map((p, i) => i % 2 === 0 && (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle"
            fontSize={10} fill="#94a3b8">{p.d.date}</text>
        ))}
      </svg>

      {/* Tooltip */}
      {hovered !== null && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-xs text-white shadow-xl"
          style={{
            left: `${(pts[hovered].x / W) * 100}%`,
            top: `${(pts[hovered].y / H) * 100}%`,
            transform: "translate(-50%, -130%)",
          }}
        >
          <p className="font-semibold">{data[hovered].date}</p>
          <p className="text-indigo-300">{data[hovered].attendance}% attendance</p>
          <p className="text-slate-400">{data[hovered].attended}/{data[hovered].totalClasses} classes</p>
        </div>
      )}
    </div>
  )
}

// ─── Custom CSS Bar Chart ─────────────────────────────────────────────────────
function BarChartCustom({ data }: { data: any[] }) {
  const [hovered, setHovered] = useState<number | null>(null)

  if (!data.length) return (
    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
      No subject data
    </div>
  )

  return (
    <div className="flex flex-col gap-3 py-1 overflow-y-auto" style={{ maxHeight: 256 }}>
      {data.map((subject, i) => (
        <div key={subject.id} className="relative"
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
          <div className="flex items-center gap-3">
            {/* Subject code label */}
            <span className="text-xs text-muted-foreground font-mono w-16 shrink-0 text-right truncate">
              {subject.code}
            </span>
            {/* Bar container */}
            <div className="relative flex-1 h-7 bg-white/5 rounded-full overflow-visible">
              {/* 75% threshold marker */}
              <div className="absolute top-0 bottom-0 w-px bg-red-500/50 z-10" style={{ left: "75%" }} />
              {/* Filled bar */}
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(subject.attendance, 100)}%`,
                  backgroundColor: getBarHex(subject.attendance),
                  opacity: hovered === i ? 1 : 0.85,
                  boxShadow: hovered === i ? `0 0 12px ${getBarHex(subject.attendance)}60` : "none",
                }}
              />
              {/* Tooltip on hover */}
              {hovered === i && (
                <div className="absolute right-0 top-0 transform -translate-y-full mb-1 -mt-2 z-20
                  rounded-lg border border-white/20 bg-black/95 px-3 py-1.5 text-xs text-white shadow-xl whitespace-nowrap"
                  style={{ bottom: "calc(100% + 6px)", top: "auto", right: 0 }}>
                  <span className="font-semibold">{subject.name}</span>
                  <span className="ml-2 text-white/70">{subject.attendance}%</span>
                </div>
              )}
            </div>
            {/* Percentage label */}
            <span className="text-xs font-semibold w-10 shrink-0"
              style={{ color: getBarHex(subject.attendance) }}>
              {subject.attendance}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [subjectData, setSubjectData] = useState<any[]>([])
  const [dailyData, setDailyData] = useState<DailyAttendanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const { isGuest } = useGuestMode()

  function calculateDailyAttendance(attendance: any[], days: number): DailyAttendanceData[] {
    const today = new Date()
    const dailyMap = new Map<string, { total: number, present: number }>()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyMap.set(dateStr, { total: 0, present: 0 })
    }

    attendance.forEach(record => {
      if (dailyMap.has(record.date)) {
        const day = dailyMap.get(record.date)!
        day.total++
        if (record.status === 'Present') day.present++
      }
    })

    return Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      attendance: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
      totalClasses: stats.total,
      attended: stats.present,
    }))
  }

  useEffect(() => {
    async function fetchData() {
      // Guest mode: use real 1A11 demo analytics
      if (isGuest) {
        const guestSubjectData = GUEST_ANALYTICS.subjects.map(subj => {
          let status = 'safe'
          if (subj.percentage < 75) status = 'danger'
          else if (subj.percentage < 80) status = 'warning'
          return {
            id: subj.id,
            name: subj.name,
            code: subj.code,
            attendance: subj.percentage,
            totalClasses: subj.total_weight,
            attended: subj.attended_weight,
            missed: subj.total_weight - subj.attended_weight,
            trend: 0,
            status,
          }
        })
        setSubjectData(guestSubjectData)
        setDailyData(calculateDailyAttendance(GUEST_ANALYTICS.attendance_history, 14))
        setLoading(false)
        return
      }

      try {
        const subgroup = await getNormalizedSubgroup()
        if (!subgroup) {
          setError('Please set subgroup in profile')
          setLoading(false)
          return
        }

        // Single batch call — replaces getSubjects + N×getSubjectAttendance + getAttendanceHistory
        const analytics = await api.getAnalytics(subgroup)

        const data = analytics.subjects.map((subj) => {
          let status = 'safe'
          if (subj.percentage < 75) status = 'danger'
          else if (subj.percentage < 80) status = 'warning'
          return {
            id: subj.id,
            name: subj.name,
            code: subj.code,
            attendance: subj.percentage,
            totalClasses: subj.total_weight,
            attended: subj.attended_weight,
            missed: subj.total_weight - subj.attended_weight,
            trend: 0,
            status,
          }
        })

        setSubjectData(data)
        setDailyData(calculateDailyAttendance(analytics.attendance_history, 14))
      } catch (err) {
        console.error(err)
        setError('Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isGuest])

  const overallAttendance = subjectData.length > 0
    ? Math.round(subjectData.reduce((acc, s) => acc + s.attendance, 0) / subjectData.length)
    : 0
  const safeCount = subjectData.filter(s => s.status === "safe").length
  const warningCount = subjectData.filter(s => s.status === "warning").length
  const dangerCount = subjectData.filter(s => s.status === "danger").length

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground" />
        </div>
      </main>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center min-h-[400px] flex items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </main>
    </div>
  )

  const selectedSubjectData = selectedSubject
    ? subjectData.find(s => s.id === selectedSubject)
    : null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Detailed insights into your attendance patterns</p>
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
            {/* Daily Trend — custom SVG */}
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Daily Attendance Trend (Last 14 Days)
              </h2>
              <div className="h-56 relative">
                <LineChartCustom data={dailyData} />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                <span className="inline-block w-5 border-t-2 border-dashed border-red-500 mr-2 align-middle" />
                Red dashed line = 75% threshold
              </p>
            </div>

            {/* Subject Breakdown — custom CSS bars */}
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Subject-wise Comparison
              </h2>
              {/* X-axis legend */}
              <div className="flex justify-between text-xs text-muted-foreground mb-3 pl-20 pr-12">
                <span>0%</span><span>25%</span><span>50%</span>
                <span className="text-red-400">75%</span><span>100%</span>
              </div>
              <BarChartCustom data={subjectData} />
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
                      <div className={cn("w-3 h-3 rounded-full", getStatusBg(subject.status))} />
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className={cn("text-3xl font-bold", getStatusColor(subject.status))}>
                          {subject.attendance}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round(subject.attended)}/{Math.round(subject.totalClasses)} classes
                        </p>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", getStatusBg(subject.status))}
                        style={{ width: `${Math.min(subject.attendance, 100)}%` }}
                      />
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
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round(selectedSubjectData.totalClasses)}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Attended</span>
                    </div>
                    <p className="text-2xl font-bold text-success">
                      {Math.round(selectedSubjectData.attended)}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="flex items-center gap-2 text-destructive mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Missed</span>
                    </div>
                    <p className="text-2xl font-bold text-destructive">
                      {Math.round(selectedSubjectData.missed)}
                    </p>
                  </div>
                </div>

                {/* Progress to 75% */}
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Progress to 75% threshold</span>
                    <span className={cn("text-sm font-semibold", getStatusColor(selectedSubjectData.status))}>
                      {selectedSubjectData.attendance >= 75
                        ? `${(selectedSubjectData.attendance - 75).toFixed(1)}% above`
                        : `${(75 - selectedSubjectData.attendance).toFixed(1)}% needed`}
                    </span>
                  </div>
                  <div className="relative h-3 rounded-full bg-secondary overflow-visible">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", getStatusBg(selectedSubjectData.status))}
                      style={{ width: `${Math.min(selectedSubjectData.attendance, 100)}%` }}
                    />
                    {/* 75% marker */}
                    <div className="absolute top-0 h-3 w-0.5 bg-foreground/40" style={{ left: "75%" }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span className="text-red-400" style={{ marginLeft: "calc(75% - 1rem)" }}>75%</span>
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
