"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { GraduationCap, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Normalize API URL: strip trailing slash, ensure it ends with /api
function buildApiUrl(raw: string): string {
    const trimmed = raw.replace(/\/+$/, '')
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}
const API_URL = buildApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')

async function getSubgroups(): Promise<string[]> {
    try {
        const res = await fetch(`${API_URL}/subgroups`)
        if (res.ok) {
            return await res.json()
        }
    } catch (error) {
        console.error('Failed to fetch subgroups:', error)
    }
    return []
}

export default function OnboardingPage() {
    const router = useRouter()
    const [year, setYear] = useState('')
    const [subgroup, setSubgroup] = useState('')
    const [allSubgroups, setAllSubgroups] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/')
                return
            }

            // If already onboarded, skip to dashboard
            const { data: profile } = await supabase
                .from('profiles')
                .select('subgroup')
                .eq('id', user.id)
                .single()

            if (profile?.subgroup) {
                router.push('/dashboard')
            } else {
                setCheckingAuth(false)
            }
        }

        getSubgroups().then(setAllSubgroups)
        checkUser()
    }, [router])

    // Reset subgroup whenever year changes
    useEffect(() => {
        setSubgroup('')
    }, [year])

    // Subgroups filtered by the chosen year, sorted naturally
    const subgroupsForYear = allSubgroups
        .filter(sg => sg.startsWith(year))
        .sort()

    const handleSubmit = async () => {
        if (!year || !subgroup) {
            alert('Please select your year and subgroup')
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                alert('You must be logged in to continue')
                router.push('/')
                return
            }

            const { error } = await supabase
                .from('profiles')
                .update({ subgroup, year: parseInt(year) })
                .eq('id', user.id)

            if (error) {
                console.error('Error updating profile:', error)
                alert('Failed to save your information. Please try again.')
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
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
                    <p className="text-muted-foreground">
                        Let&apos;s set up your timetable
                    </p>
                </div>

                {/* Form */}
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 space-y-6 shadow-lg">

                    {/* Year Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Select Your Year
                        </label>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="h-12 bg-muted/50 border-border">
                                <SelectValue placeholder="Choose your year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1st Year</SelectItem>
                                <SelectItem value="2">2nd Year</SelectItem>
                                <SelectItem value="3">3rd Year</SelectItem>
                                <SelectItem value="4">4th Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Subgroup Selection — shown once year is chosen */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Select Your Subgroup
                        </label>
                        {year ? (
                            <Select value={subgroup} onValueChange={setSubgroup}>
                                <SelectTrigger className="h-12 bg-muted/50 border-border">
                                    <SelectValue placeholder="Choose your subgroup" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {subgroupsForYear.map((sg) => (
                                        <SelectItem key={sg} value={sg}>
                                            {sg}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="h-12 rounded-lg bg-secondary/30 border border-border/50 flex items-center px-3 text-sm text-muted-foreground">
                                Please select a year first
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!year || !subgroup || loading}
                        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
                    >
                        {loading ? 'Setting up...' : 'Continue to Dashboard'}
                    </Button>
                </div>

                {/* Info */}
                <div className="text-center text-sm text-muted-foreground">
                    <p>This helps us show your personalized timetable and track attendance</p>
                </div>
            </div>
        </div>
    )
}
