"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GraduationCap, Users, Search, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Normalize API URL
function buildApiUrl(raw: string): string {
    const trimmed = raw.replace(/\/+$/, '')
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}
const API_URL = buildApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')

async function getSubgroups(): Promise<string[]> {
    try {
        const res = await fetch(`${API_URL}/subgroups`)
        if (res.ok) return await res.json()
    } catch (error) {
        console.error('Failed to fetch subgroups:', error)
    }
    return []
}

const YEAR_LABELS: Record<string, string> = {
    '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year',
}

export default function OnboardingPage() {
    const router = useRouter()
    const [year, setYear] = useState('')
    const [subgroup, setSubgroup] = useState('')
    const [search, setSearch] = useState('')
    const [allSubgroups, setAllSubgroups] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const searchRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/'); return }
            const { data: profile } = await supabase
                .from('profiles').select('subgroup').eq('id', user.id).single()
            if (profile?.subgroup) {
                router.push('/dashboard')
            } else {
                setCheckingAuth(false)
            }
        }
        getSubgroups().then(setAllSubgroups)
        checkUser()
    }, [router])

    // Reset subgroup + search when year changes
    useEffect(() => {
        setSubgroup('')
        setSearch('')
    }, [year])

    // After year is chosen, auto-focus search box
    useEffect(() => {
        if (year) searchRef.current?.focus()
    }, [year])

    const subgroupsForYear = allSubgroups
        .filter(sg => sg.startsWith(year))
        .sort()

    const filtered = search.trim()
        ? subgroupsForYear.filter(sg =>
            sg.toLowerCase().includes(search.trim().toLowerCase())
        )
        : subgroupsForYear

    const handleSubmit = async () => {
        if (!year || !subgroup) return
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/'); return }
            const { error } = await supabase
                .from('profiles')
                .update({ subgroup, year: parseInt(year) })
                .eq('id', user.id)
            if (error) {
                console.error('Error updating profile:', error)
                alert('Failed to save. Please try again.')
                setLoading(false)
                return
            }
            router.push('/dashboard')
        } catch (error) {
            console.error('Error during onboarding:', error)
            alert('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xl font-bold text-primary-foreground">A</span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Attendex</h1>
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground">Welcome!</h2>
                    <p className="text-muted-foreground">Let&apos;s set up your timetable</p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-6 shadow-lg">

                    {/* Step 1 — Year */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Select Your Year
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {['1', '2', '3', '4'].map(y => (
                                <button
                                    key={y}
                                    onClick={() => setYear(y)}
                                    className={`
                                        h-14 rounded-xl text-sm font-semibold transition-all duration-150
                                        border-2 active:scale-95
                                        ${year === y
                                            ? 'bg-foreground text-background border-foreground'
                                            : 'bg-muted/40 text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
                                        }
                                    `}
                                >
                                    {y === '1' ? '1st' : y === '2' ? '2nd' : y === '3' ? '3rd' : '4th'}
                                    <span className="block text-xs font-normal opacity-70">Year</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2 — Subgroup search + chips */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Select Your Subgroup
                            {subgroup && (
                                <span className="ml-auto flex items-center gap-1 text-xs text-green-400 font-semibold">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {subgroup}
                                </span>
                            )}
                        </label>

                        {year ? (
                            <>
                                {/* Search box */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={`Search ${YEAR_LABELS[year]} subgroups…`}
                                        className="w-full h-11 pl-9 pr-4 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 focus:ring-2 focus:ring-foreground/10"
                                    />
                                </div>

                                {/* Chip grid — large tap targets */}
                                {filtered.length > 0 ? (
                                    <div
                                        className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1"
                                        style={{ scrollbarWidth: 'thin' }}
                                    >
                                        {filtered.map(sg => (
                                            <button
                                                key={sg}
                                                onClick={() => setSubgroup(sg)}
                                                className={`
                                                    h-12 rounded-xl text-sm font-semibold transition-all duration-150
                                                    border-2 active:scale-95
                                                    ${subgroup === sg
                                                        ? 'bg-foreground text-background border-foreground'
                                                        : 'bg-muted/40 text-foreground border-border hover:border-foreground/40'
                                                    }
                                                `}
                                            >
                                                {sg}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-4">
                                        No subgroups match &ldquo;{search}&rdquo;
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-11 rounded-lg bg-secondary/30 border border-border/50 flex items-center px-4 text-sm text-muted-foreground">
                                Select a year first
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!year || !subgroup || loading}
                        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base disabled:opacity-40"
                    >
                        {loading ? 'Setting up…' : 'Continue to Dashboard →'}
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    <p>This helps us show your personalized timetable and track attendance</p>
                </div>
            </div>
        </div>
    )
}
