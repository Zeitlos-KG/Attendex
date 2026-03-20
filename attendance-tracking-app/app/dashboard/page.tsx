"use client"

import { useEffect, useState } from 'react'
import { Navbar } from "@/components/navbar"
import { StatsCard } from "@/components/stats-card"
import { BookOpen, GraduationCap, Clock, CheckCircle2, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api, type DashboardStats } from "@/lib/api"
import { getNormalizedSubgroup } from "@/lib/subgroup-utils"
import { useGuestMode } from "@/lib/guest-context"
import { GUEST_DASHBOARD_STATS } from "@/lib/guest-data"

export default function DashboardPage() {
  const router = useRouter()
  const { isGuest } = useGuestMode()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isGuest) {
      setStats(GUEST_DASHBOARD_STATS)
      setLoading(false)
      return
    }
    async function fetchDashboard() {
      try {
        const subgroup = await getNormalizedSubgroup()
        if (!subgroup) {
          router.push('/onboarding')
          return
        }

        const data = await api.getDashboard(subgroup)
        setStats(data)
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [router, isGuest])




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

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center min-h-[400px] flex items-center justify-center">
              <div>
                <p className="text-destructive mb-4">{error || 'Failed to load data'}</p>
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

  const statsCards = [
    {
      title: "Total Subjects",
      value: stats.total_subjects,
      subtitle: "Current semester",
      icon: BookOpen,
      variant: "default" as "default" | "success" | "warning" | "danger",
    },
    {
      title: "Overall Attendance",
      value: `${stats.overall_percentage}%`,
      subtitle: stats.overall_percentage >= 75 ? "Above threshold" : "Below threshold",
      icon: GraduationCap,
      variant: (stats.overall_percentage >= 75 ? "success" : "danger") as "default" | "success" | "warning" | "danger",
    },
    {
      title: "Total Classes",
      value: stats.total_classes,
      subtitle: "This semester",
      icon: Clock,
      variant: "default" as "default" | "success" | "warning" | "danger",
    },
    {
      title: "Classes Attended",
      value: stats.attended_classes,
      subtitle: `${stats.total_classes - stats.attended_classes} missed`,
      icon: CheckCircle2,
      variant: "success" as "default" | "success" | "warning" | "danger",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here is your attendance overview.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((stat, index) => (
              <div
                key={index}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
              >
                <StatsCard {...stat} />
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/timetable"
              className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors"
            >
              <Calendar className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">View Timetable</h3>
              <p className="text-sm text-muted-foreground mt-1">Check your weekly schedule</p>
            </Link>

            <Link
              href="/mark-attendance"
              className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors"
            >
              <CheckCircle2 className="h-8 w-8 text-success mb-3" />
              <h3 className="font-semibold text-foreground">Mark Attendance</h3>
              <p className="text-sm text-muted-foreground mt-1">Record today's classes</p>
            </Link>

            <Link
              href="/analytics"
              className="p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-warning mb-3" />
              <h3 className="font-semibold text-foreground">View Analytics</h3>
              <p className="text-sm text-muted-foreground mt-1">Subject-wise breakdown</p>
            </Link>
          </div>

          {/* Attendance Alert */}
          {stats.overall_percentage < 75 && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Your attendance is below 75%. You need to attend more classes to meet the requirement
                .
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
