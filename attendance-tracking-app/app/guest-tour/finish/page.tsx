"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, LayoutDashboard, Calendar, CheckSquare, TrendingUp } from "lucide-react"

export default function GuestTourFinishPage() {
    const router = useRouter()

    const handleSignIn = () => {
        // Exit guest mode (clear cookie) then open auth modal on landing page
        fetch('/api/guest', { method: 'DELETE' }).finally(() => {
            router.push('/?openAuth=true')
        })
    }

    const explored = [
        { icon: LayoutDashboard, label: "Dashboard", desc: "Overall attendance & quick stats" },
        { icon: Calendar, label: "Timetable", desc: "Full weekly schedule by subgroup" },
        { icon: CheckSquare, label: "Mark Attendance", desc: "One-tap daily tracking" },
        { icon: TrendingUp, label: "Analytics", desc: "Trends & subject breakdown" },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.015] rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.015] rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
                    <span className="text-xl font-bold bg-gradient-to-r from-white via-gray-400 to-white bg-[length:200%_auto] animate-[gradient_6s_linear_infinite] bg-clip-text text-transparent">
                        Attendex
                    </span>
                    <button
                        onClick={handleSignIn}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                    >
                        Sign in →
                    </button>
                </div>
            </header>

            <main className="flex-1 pt-16 flex items-center">
                <div className="mx-auto max-w-3xl px-6 py-20 w-full">

                    {/* Top badge */}
                    <div className="flex items-center gap-2 mb-6">
                        <div className="h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Tour complete</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
                        Ready to track your{" "}
                        <span className="bg-gradient-to-r from-white via-gray-400 to-white bg-[length:200%_auto] animate-[gradient_6s_linear_infinite] bg-clip-text text-transparent">
                            real attendance?
                        </span>
                    </h1>

                    <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
                        You've seen everything Attendex has to offer. Sign in with your official Thapar ID to start tracking — your actual subgroup, your actual classes, your actual data.
                    </p>

                    {/* What they explored */}
                    <div className="grid sm:grid-cols-2 gap-3 mb-10">
                        {explored.map(item => (
                            <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
                                <div className="h-8 w-8 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <item.icon className="h-4 w-4 text-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm text-foreground">{item.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                </div>
                                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 ml-auto mt-0.5" />
                            </div>
                        ))}
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-8">
                        <Button
                            size="lg"
                            onClick={handleSignIn}
                            className="h-14 px-8 bg-foreground text-background hover:bg-foreground/90 font-semibold text-base group flex-1 sm:flex-none"
                        >
                            <svg className="h-5 w-5 mr-2 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleSignIn}
                            className="h-14 px-8 border-border hover:bg-muted/50 font-medium text-base"
                        >
                            Create Account
                        </Button>
                    </div>

                    {/* Email note */}
                    <div className="rounded-xl border border-border/50 bg-card/30 p-4 flex items-start gap-3">
                        <span className="text-lg shrink-0" aria-hidden>🎓</span>
                        <div>
                            <p className="text-sm font-medium text-foreground">Only @thapar.edu emails are supported</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Attendex is built specifically for TIET students. Use your official college email or Google account to get started.
                            </p>
                        </div>
                    </div>

                    {/* Exit link */}
                    <p className="text-sm text-muted-foreground mt-8 text-center">
                        Not from Thapar?{" "}
                        <button
                            onClick={() => fetch('/api/guest', { method: 'DELETE' }).finally(() => router.push('/'))}
                            className="underline underline-offset-2 hover:text-foreground transition-colors"
                        >
                            Exit guest mode
                        </button>
                    </p>
                </div>
            </main>
        </div>
    )
}
