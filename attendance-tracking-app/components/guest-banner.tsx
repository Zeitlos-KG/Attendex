"use client"

import { useGuestMode } from "@/lib/guest-context"
import { ArrowRight, X } from "lucide-react"
import { useRouter } from "next/navigation"

export function GuestBanner() {
    const { isGuest, exitGuestMode } = useGuestMode()
    const router = useRouter()

    if (!isGuest) return null

    return (
        <div className="fixed left-0 right-0 z-40" style={{ top: '64px' }}>
            <div className="relative flex items-center justify-between gap-3 px-4 py-2.5 bg-background/95 backdrop-blur-sm border-b border-amber-500/30 shadow-sm">
                {/* Left glow accent */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

                <div className="flex items-center gap-2 text-sm text-muted-foreground relative">
                    <span className="text-lg" aria-hidden>👋</span>
                    <span>
                        You're exploring in <span className="font-medium text-foreground">guest mode</span> — this is sample data from subgroup <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">1A11</span>. Nothing is saved.
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 relative">
                    <button
                        onClick={() => router.push('/?openAuth=true')}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/80 underline underline-offset-2 transition-colors"
                    >
                        Sign in with @thapar.edu
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={exitGuestMode}
                        aria-label="Exit guest mode"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
