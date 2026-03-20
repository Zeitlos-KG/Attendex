"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    ArrowRight, LayoutDashboard, Calendar, CheckSquare, TrendingUp,
    BookOpen, GraduationCap, Clock, CheckCircle2, AlertTriangle, Target
} from "lucide-react"
import {
    GUEST_DASHBOARD_STATS,
    GUEST_TIMETABLE,
    GUEST_ANALYTICS,
} from "@/lib/guest-data"

// ─── Step configuration ───────────────────────────────────────────────────────

const STEPS = [
    {
        id: 1,
        icon: LayoutDashboard,
        title: "Dashboard",
        tag: "Overview",
        description: "Your attendance at a glance. See your overall percentage, total classes, and a quick health check across all subjects — all in one place.",
    },
    {
        id: 2,
        icon: Calendar,
        title: "Timetable",
        tag: "Schedule",
        description: "Your weekly class schedule, automatically loaded for your subgroup. Navigate days and see what's coming up — Labs, Tutorials, and Classes colour-coded.",
    },
    {
        id: 3,
        icon: CheckSquare,
        title: "Mark Attendance",
        tag: "Daily action",
        description: "Tap Present or Absent for each class of the day. Your records are saved instantly and reflected across your dashboard and analytics.",
    },
    {
        id: 4,
        icon: TrendingUp,
        title: "Analytics",
        tag: "Insights",
        description: "Subject-wise breakdown, attendance trend over 14 days, and a clear view of which subjects need attention before you dip below 75%.",
    },
]

// ─── Step previews ────────────────────────────────────────────────────────────

function DashboardPreview() {
    const stats = GUEST_DASHBOARD_STATS
    const cards = [
        { label: "Total Subjects", value: stats.total_subjects, icon: BookOpen, color: "text-foreground" },
        { label: "Overall", value: `${stats.overall_percentage}%`, icon: GraduationCap, color: "text-green-400" },
        { label: "Total Classes", value: stats.total_classes, icon: Clock, color: "text-foreground" },
        { label: "Attended", value: stats.attended_classes, icon: CheckCircle2, color: "text-green-400" },
    ]
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                {cards.map(c => (
                    <div key={c.label} className="rounded-xl border border-border/50 bg-card/50 p-4 flex items-center gap-3">
                        <c.icon className={cn("h-5 w-5 shrink-0", c.color)} />
                        <div>
                            <p className="text-xs text-muted-foreground">{c.label}</p>
                            <p className="text-xl font-bold text-foreground">{c.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
                {["Timetable", "Mark Attendance", "Analytics"].map(action => (
                    <div key={action} className="p-4 rounded-xl border border-border/50 bg-card/50">
                        <p className="text-xs font-medium text-muted-foreground">{action}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

function TimetablePreview() {
    // Show Monday (day_of_week = 0)
    const monday = GUEST_TIMETABLE.filter(t => t.day_of_week === 0)
    const typeColors: Record<string, string> = {
        Class: "bg-primary/10 text-primary border-primary/30",
        Tutorial: "bg-green-500/10 text-green-400 border-green-500/30",
        Lab: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    }
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-foreground">Monday</span>
                <span className="text-xs text-muted-foreground">— 5 classes</span>
            </div>
            {monday.map(entry => (
                <div key={entry.id} className={cn("rounded-xl border p-3 flex items-center justify-between gap-3", typeColors[entry.type])}>
                    <div>
                        <p className="font-medium text-sm text-foreground">{entry.subject_name}</p>
                        <p className="text-xs text-muted-foreground">{entry.subject_code}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-xs font-medium">{entry.start_time} – {entry.end_time}</p>
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", typeColors[entry.type])}>{entry.type}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

function MarkAttendancePreview() {
    const [marked, setMarked] = useState<Map<number, 'Present' | 'Absent'>>(new Map())
    // Show Wednesday classes for a nice spread
    const wednesday = GUEST_TIMETABLE.filter(t => t.day_of_week === 2)
    const typeColors: Record<string, { bg: string; text: string }> = {
        Class: { bg: "bg-primary/10", text: "text-primary" },
        Tutorial: { bg: "bg-green-500/10", text: "text-green-400" },
        Lab: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
    }

    const toggle = (id: number, present: boolean) => {
        setMarked(prev => {
            const m = new Map(prev)
            const status = present ? 'Present' : 'Absent'
            if (m.get(id) === status) { m.delete(id) } else { m.set(id, status) }
            return m
        })
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-foreground">Wednesday</span>
                <span className="text-xs text-muted-foreground">— tap to toggle</span>
            </div>
            {wednesday.map(cls => {
                const colors = typeColors[cls.type]
                const status = marked.get(cls.id)
                return (
                    <div
                        key={cls.id}
                        className={cn(
                            "rounded-xl border border-border/50 bg-card/50 p-3 transition-all duration-200",
                            status === 'Present' && "border-green-500/40 bg-green-500/5",
                            status === 'Absent' && "border-red-500/40 bg-red-500/5",
                        )}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm text-foreground">{cls.subject_name}</p>
                                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", colors.bg, colors.text)}>{cls.type}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{cls.start_time} – {cls.end_time}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                {!status ? (
                                    <>
                                        <button onClick={() => toggle(cls.id, false)} className="text-xs px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors">Absent</button>
                                        <button onClick={() => toggle(cls.id, true)} className="text-xs px-2.5 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-500/90 transition-colors">Present</button>
                                    </>
                                ) : (
                                    <button onClick={() => toggle(cls.id, status === 'Present')} className={cn(
                                        "text-xs px-2.5 py-1 rounded-full font-medium",
                                        status === 'Present' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                    )}>
                                        {status === 'Present' ? "✓ Present" : "✗ Absent"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function AnalyticsPreview() {
    const { subjects } = GUEST_ANALYTICS
    const overall = Math.round(subjects.reduce((a, s) => a + s.percentage, 0) / subjects.length)

    function getColor(pct: number) {
        if (pct >= 75) return "#ffffff"
        if (pct >= 65) return "#a1a1aa"
        return "#71717a"
    }
    function getStatusColor(pct: number) {
        if (pct >= 80) return "text-green-400"
        if (pct >= 75) return "text-yellow-400"
        return "text-red-400"
    }

    return (
        <div className="space-y-4">
            {/* Overview row */}
            <div className="grid grid-cols-4 gap-2">
                {[
                    { label: "Overall", value: `${overall}%`, icon: Target, className: "text-primary" },
                    { label: "Safe", value: `${subjects.filter(s => s.percentage >= 80).length} subj`, icon: CheckCircle2, className: "text-green-400" },
                    { label: "Warn", value: `${subjects.filter(s => s.percentage >= 75 && s.percentage < 80).length} subj`, icon: AlertTriangle, className: "text-yellow-400" },
                    { label: "At Risk", value: `${subjects.filter(s => s.percentage < 75).length} subj`, icon: AlertTriangle, className: "text-red-400" },
                ].map(card => (
                    <div key={card.label} className="rounded-xl border border-border/50 bg-card/50 p-3">
                        <p className="text-[10px] text-muted-foreground">{card.label}</p>
                        <p className={cn("text-lg font-bold", card.className)}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Bar chart */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-2">
                <p className="text-xs font-semibold text-foreground mb-3">Subject-wise Attendance</p>
                {subjects.map(s => (
                    <div key={s.id} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-muted-foreground w-14 text-right shrink-0">{s.code}</span>
                        <div className="relative flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                            <div className="absolute top-0 bottom-0 w-px bg-red-500/50 z-10" style={{ left: '75%' }} />
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${s.percentage}%`, backgroundColor: getColor(s.percentage) }}
                            />
                        </div>
                        <span className="text-[10px] font-semibold w-8 shrink-0" style={{ color: getColor(s.percentage) }}>
                            {s.percentage}%
                        </span>
                    </div>
                ))}
                <p className="text-[10px] text-muted-foreground mt-1">Red line = 75% threshold</p>
            </div>

            {/* Subject cards */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {subjects.slice(0, 4).map(s => (
                    <div key={s.id} className="p-3 rounded-lg border border-border/50 bg-secondary/20">
                        <p className="text-xs font-semibold text-foreground truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.code}</p>
                        <p className={cn("text-2xl font-bold mt-2", getStatusColor(s.percentage))}>{s.percentage}%</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Main Tour Page ───────────────────────────────────────────────────────────

const STEP_PREVIEWS = [
    DashboardPreview,
    TimetablePreview,
    MarkAttendancePreview,
    AnalyticsPreview,
]

export default function GuestTourPage() {
    const [step, setStep] = useState(0)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => { setMounted(true) }, [])

    const current = STEPS[step]
    const PreviewComponent = STEP_PREVIEWS[step]
    const isLast = step === STEPS.length - 1

    const advance = () => {
        if (isLast) {
            router.push('/guest-tour/finish')
        } else {
            setStep(s => s + 1)
        }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
            </div>

            {/* Slim header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
                    <span className="text-xl font-bold bg-gradient-to-r from-white via-gray-400 to-white bg-[length:200%_auto] animate-[gradient_6s_linear_infinite] bg-clip-text text-transparent">
                        Attendex
                    </span>
                    <div className="flex items-center gap-3">
                        {/* Step dots */}
                        <div className="flex items-center gap-1.5">
                            {STEPS.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setStep(i)}
                                    className={cn(
                                        "rounded-full transition-all duration-300",
                                        i === step ? "w-6 h-2 bg-foreground" : "w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                            {step + 1} / {STEPS.length}
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-16">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 lg:py-14">

                    {/* Step header */}
                    <div className="mb-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">{current.tag}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
                        </div>
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                    <current.icon className="h-8 w-8 text-muted-foreground" />
                                    {current.title}
                                </h1>
                                <p className="text-muted-foreground mt-3 max-w-lg text-base leading-relaxed">
                                    {current.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content: preview + sidebar */}
                    <div className="grid lg:grid-cols-[1fr_320px] gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">

                        {/* Live preview panel */}
                        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 sm:p-6 overflow-hidden">
                            {/* Fake browser bar */}
                            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border/40">
                                <div className="flex gap-1.5">
                                    <span className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                                    <span className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                                    <span className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                                </div>
                                <div className="flex-1 h-6 rounded bg-muted/30 flex items-center px-3">
                                    <span className="text-[11px] text-muted-foreground/60 font-mono">attendex.vercel.app/{current.title.toLowerCase().replace(' ', '-')}</span>
                                </div>
                            </div>
                            <PreviewComponent />
                        </div>

                        {/* Right sidebar: highlights + nav */}
                        <div className="flex flex-col gap-4">
                            {/* Feature callouts */}
                            <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">What you get</p>
                                {getFeatureBullets(step).map((bullet, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <span className="mt-0.5 h-4 w-4 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-foreground">{i + 1}</span>
                                        </span>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{bullet}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={advance}
                                    size="lg"
                                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-medium group"
                                >
                                    {isLast ? "See How to Start →" : `Next: ${STEPS[step + 1].title}`}
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                                {step > 0 && (
                                    <button
                                        onClick={() => setStep(s => s - 1)}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-1"
                                    >
                                        ← Back
                                    </button>
                                )}
                            </div>

                            {/* Step list */}
                            <div className="rounded-2xl border border-border/60 bg-card/40 p-4 space-y-1">
                                {STEPS.map((s, i) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setStep(i)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                                            i === step ? "bg-foreground/10 text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                                            i < step && "text-muted-foreground/60"
                                        )}
                                    >
                                        {i < step
                                            ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                                            : <s.icon className="h-4 w-4 shrink-0" />
                                        }
                                        {s.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

function getFeatureBullets(step: number): string[] {
    const bullets = [
        [
            "Overall attendance % with live threshold indicator",
            "Subject count and total/attended class breakdown",
            "Quick-action cards to jump to Timetable, Mark Attendance, or Analytics",
        ],
        [
            "Full weekly schedule auto-loaded for your subgroup",
            "Navigate to any date with the date picker or arrow buttons",
            "Classes colour-coded by type: Lab, Tutorial, Class",
        ],
        [
            "Mark each class Present or Absent with a single tap",
            "Review and correct any past date's records",
            "Changes reflect instantly in Dashboard and Analytics",
        ],
        [
            "14-day attendance trend line chart with 75% threshold line",
            "Subject-wise bar chart for quick comparison",
            "Per-subject detail: total, attended, missed, progress to 75%",
        ],
    ]
    return bullets[step] ?? []
}
